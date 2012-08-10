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
        return lookup(env, expr);
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
            add_binding(env, expr[1], evalScheem(expr[2], env));
            return 0;
        case 'set!':
            update(env, expr[1], evalScheem(expr[2], env));
            return 0;   
        case 'begin':
            var retVal;
            for(var i = 1; i < expr.length; i++) {
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
         case 'let-one':
            var newEnv = newEnvLayer(env, expr[1], evalScheem(expr[2], env));
            return evalScheem(expr[3], newEnv);
         case 'lambda-one':
            return function(arg) {
                var newEnv = newEnvLayer(env, expr[1], arg);
                return evalScheem(expr[2], newEnv);
            };
         case 'lambda':
            return function() {
                var newEnv = env;
                for(var i = 0; i < (expr[1].length); i++) {
                    newEnv = newEnvLayer(newEnv, expr[1][i], arguments[i]);
                }
                return evalScheem(expr[2], newEnv);
            };
         default:
            var fn     = evalScheem(expr[0], env);
            var params = [];
            for(var i  = 1; i < expr.length; i++) {
                params.push(evalScheem(expr[i], env));
            }

            if (typeof fn !== "function") {
                return fn;
            }
            return fn.apply(null, params);
    }
};

// create a new env layer above the current env, with a single binding
var newEnvLayer = function (env, v, val) {
    var newEnv = { bindings: { }, outer: { } };
    newEnv.bindings[v] = val;
    newEnv.outer = env;
    return newEnv;
}

// lookup a variable top down through the scope tree
var lookup = function (env, v) {
    if(typeof env.bindings !== "undefined" && env.bindings[v])
        return env.bindings[v];
    if(env.outer)
        return lookup(env.outer, v);
    if(env[v])
        return env[v];
    throw Error(v + "not defined");
};

// update the first definition of a variable top down within the scope tree
var update = function (env, v, val) {
    if (typeof env.bindings !== "undefined" && env.bindings[v]) {
        env.bindings[v] = val;
        return;
    } else if (env.outer) {
        update(env.outer, v, val);
        return;
    } else if (env[v]) {
        env[v] = val;
        return;
    } else {
        return;
    }
    env.bindings[v] = val;
};

// add a top-most binding to env in-place
var add_binding = function (env, v, val) {
    if(!env.bindings) {
        env.bindings = {};
    }
    env.bindings[v] = val;
};

// check that a given parameter at index is a number
// or throw an error
var checkNumber = function(p, index) {
    if (typeof p !== "number")
        throw new Error("Parameter " + index + " is not a number");
};

// parse and evaluate a scheem string
var evalScheemString = function(scheemString, env) {
    var env = env || {};
    return evalScheem(parse(scheemString), env);
}

if (typeof module !== 'undefined') {
    module.exports.evalScheem = evalScheem;
    module.exports.evalScheemString = evalScheemString;
}
