if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var PEG = require('pegjs');
    var fs = require('fs');
    var parse = PEG.buildParser(fs.readFileSync(
        'scheem.peg', 'utf-8')).parse;
} else {
    // In browser assume loaded by <script>
    var parse = SCHEEM.parse;

    mocha.setup('tdd');
}

var evalScheem = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    // Strings are variable references
    if (typeof expr === 'string') {
        return env[expr];
    }
    // Look at head of list for operation
    switch (expr[0]) {
        case '+':
            var expr1 = evalScheem(expr[1], env);
            var expr2 = evalScheem(expr[2], env);
            checkNumber(expr1, 1), checkNumber(expr2, 2);
            return expr1 + expr2;
        case '-':
            var expr1 = evalScheem(expr[1], env);
            var expr2 = evalScheem(expr[2], env);
            checkNumber(expr1, 1), checkNumber(expr2, 2);
            return expr1 - expr2;
        case '*':
            var expr1 = evalScheem(expr[1], env);
            var expr2 = evalScheem(expr[2], env);
            checkNumber(expr1, 1), checkNumber(expr2, 2);
            return expr1 * expr2;
        case '/':
            var expr1 = evalScheem(expr[1], env);
            var expr2 = evalScheem(expr[2], env);
            checkNumber(expr1, 1), checkNumber(expr2, 2);
            return expr1 / expr2;
        case 'quote':
            return expr[1];
        case 'define':
            if(!env[expr[1]])
                    env[expr[1]] = evalScheem(expr[2], env);
            return 0;
        case 'set!':
            env[expr[1]] = evalScheem(expr[2], env);
            return 0;   
        case 'begin':
            var retVal;
            for(var i = 0; i < expr.length; i++) {
                retVal = evalScheem(expr[i], env);
            }
            return retVal;
        case '<':
            var eq =
                (evalScheem(expr[1], env) <
                 evalScheem(expr[2], env));
            if (eq) return '#t';
            return '#f';
         case 'cons':
            var e2 = evalScheem(expr[2], env);
            e2.unshift(evalScheem(expr[1], env));
            return e2;
        case 'car':
            return evalScheem(expr[1]).shift();
        case 'cdr':
            return evalScheem(expr[1]).slice(1);
        case '=':
            var eq =
                (evalScheem(expr[1], env) ===
                 evalScheem(expr[2], env));
            if (eq) return '#t';
            return '#f';
        case 'if':
            if(evalScheem(expr[1], env) === '#t')
                return evalScheem(expr[2], env);
            return evalScheem(expr[3], env);
        default:
            throw new Error("undefined operation!");

    }
};

// check that a given parameter at index is a number
// or throw an error
var checkNumber = function(p, index) {
    if (typeof p !== "number")
        throw new Error("Parameter " + index + " is not a number");
};

// parse and evaluate a scheem string
var evalScheemString = function(scheemString) {
    return evalScheem(parse(scheemString), {});
}

if (typeof module !== 'undefined') {
    module.exports.evalScheem = evalScheem;
    module.exports.evalScheemString = evalScheemString;
}
