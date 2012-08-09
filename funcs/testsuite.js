if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var assert = require('chai').assert;
    var PEG = require('pegjs');
    var fs = require('fs');
    var evalScheem = require('./scheem').evalScheem;
    var evalScheemString = require('./scheem').evalScheemString;
    var parse = PEG.buildParser(fs.readFileSync(
        'scheem.peg', 'utf-8')).parse;
    var mocha = require('mocha');
} else {
    // In browser assume loaded by <script>
    var parse = SCHEEM.parse;
    var assert = chai.assert;

    mocha.setup('tdd');
}

// Some unit tests

suite('quote', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(['quote', 3], {}),
            3
        );
    });
    test('an atom', function() {
        assert.deepEqual(
            evalScheem(['quote', 'dog'], {}),
            'dog'
        );
    });
    test('a list', function() {
        assert.deepEqual(
            evalScheem(['quote', [1, 2, 3]], {}),
            [1, 2, 3]
        );
    });
});
suite('add', function() {
    test('two numbers', function() {
        assert.deepEqual(
            evalScheem(['+', 3, 5], {}),
            8
        );
    });
    test('a number and an expression', function() {
        assert.deepEqual(
            evalScheem(['+', 3, ['+', 2, 2]], {}),
            7
        );
    });
    test('2 + 2 = 4', function() {
        assert.deepEqual(
            evalScheem(['+', 2, 2], {}),
            4
        );
    });
    test('a dog and a cat', function() {
        assert.throws(function() {
            evalScheem(['+', 'dog', 'cat'], {});
        });
    });
});
suite('subtract', function() {
    test('two numbers', function() {
        assert.deepEqual(
            evalScheem(['-', 8, 5], {}),
            3
        );
    });
    test('a number and an expression', function() {
        assert.deepEqual(
            evalScheem(['-', 3, ['+', 2, 2]], {}),
            -1
        );
    });
    test('2 - 2 = 0', function() {
        assert.deepEqual(
            evalScheem(['-', 2, 2], {}),
            0
        );
    });
    test('a dog minus a cat', function() {
        assert.throws(function() {
            evalScheem(['-', 'dog', 'cat'], {});
        });
    });
});
suite('multiply', function() {
    test('two numbers', function() {
        assert.deepEqual(
            evalScheem(['*', 8, 5], {}),
            40
        );
    });
    test('a number and an expression', function() {
        assert.deepEqual(
            evalScheem(['*', 3, ['+', 2, 2]], {}),
            12
        );
    });
    test('2 * 2 = 0', function() {
        assert.deepEqual(
            evalScheem(['*', 2, 2], {}),
            4
        );
    });
    test('a dog times a cat', function() {
        assert.throws(function() {
            evalScheem(['*', 'dog', 'cat'], {});
        });
    });
});
suite('divide', function() {
    test('two numbers', function() {
        assert.deepEqual(
            evalScheem(['/', 8, 2], {}),
            4
        );
    });
    test('a number and an expression', function() {
        assert.deepEqual(
            evalScheem(['/', 40, ['+', 2, 2]], {}),
            10
        );
    });
    test('2 / 2 = 0', function() {
        assert.deepEqual(
            evalScheem(['/', 2, 2], {}),
            1
        );
    });
    test('1 / 2 = 0.5', function() {
        assert.deepEqual(
            evalScheem(['/', 1, 2], {}),
            0.5
        );
    });
    test('a dog divided by a cat', function() {
        assert.throws(function() {
            evalScheem(['/', 'dog', 'cat'], {});
        });
    });
});
suite('variables', function() {
    test('where x is 1, x + x = 2', function() {
        assert.deepEqual(
            evalScheem(['+', 'x', 'x'], {x: 1}),
            2
        );
    });
    test('define x to a number', function() {
        var env = {};
        evalScheem(['define', 'x', 1], env);
        assert.deepEqual(
            env,
            {bindings: {x:1}}
        );
    });
    test('define x to the result of an expression', function() {
        var env = {};
        evalScheem(['define', 'x', ['*', 20, 5]], env);
        assert.deepEqual(
            env,
            {bindings: {x:100}}
        );
    });
    test('overwrite x to another number', function() {
        var env = {x:1};
        evalScheem(['set!', 'x', 100], env);
        assert.deepEqual(
            env,
            {x:100}
        );
    });
});
suite('begin', function() {
    test('return the last expression', function() {
        assert.deepEqual(
            evalScheem(['begin', 1, 2, 3], {}),
            3
        );
    });
    test('define and then retrieve a variable', function() {
        assert.deepEqual(
            evalScheem(['begin', ['define', 'x', 5], 'x'], {}),
            5
        );
    });
});
suite('less than', function() {
    test('1 < 2 should return "#t"', function() {
        assert.deepEqual(
            evalScheem(['<', 1, 2], {}),
            "#t"
        );
    });
    test('2 < 2 should return "#f"', function() {
        assert.deepEqual(
            evalScheem(['<', 2, 2], {}),
            "#f"
        );
    });
    test('3 < 2 should return "#f"', function() {
        assert.deepEqual(
            evalScheem(['<', 3, 2], {}),
            "#f"
        );
    });
});
suite('cons', function() {
    test('add an atom to a list', function() {
        assert.deepEqual(
            evalScheem(['cons', 1, ['quote', [2, 3]]]),
            [1, 2, 3]
        );
    });
    test('add a list to a list', function() {
        assert.deepEqual(
            evalScheem(['cons', ['quote', [1, 2]], ['quote', [2, 3]]]),
            [[1, 2], 2, 3]
        );
    });
});
suite('car', function() {
    test('head of a list (atom)', function() {
        assert.deepEqual(
            evalScheem(['car', ['quote',[1, 2, 3]]]),
            1
        );
    });
    test('head of a list (list)', function() {
        assert.deepEqual(
            evalScheem(['car', ['quote',[[1, 'a'], 2, 3]]]),
            [1, 'a']
        );
    });
});
suite('cdr', function() {
    test('head removed of a list (atom)', function() {
        assert.deepEqual(
            evalScheem(['cdr', ['quote',[1, 2, 3]]]),
            [2, 3]
        );
    });
    test('head removed of a list (list)', function() {
        assert.deepEqual(
            evalScheem(['cdr', ['quote',[[1, 'a'], ['b', 2, 3]]]]),
            [['b', 2, 3]]
        );
    });
});
suite('equals', function() {
    test('1 = 2 should return "#f"', function() {
        assert.deepEqual(
            evalScheem(['=', 1, 2], {}),
            "#f"
        );
    });
    test('2 = 2 should return "#t"', function() {
        assert.deepEqual(
            evalScheem(['=', 2, 2], {}),
            "#t"
        );
    });
});
suite('if', function() {
    test('if 1 = 2, 0, else 1', function() {
        assert.deepEqual(
            evalScheem(['if', ['=', 1, 2], 0, 1]),
            1
        );
    });
    test('if 2 = 2, 0, else 1', function() {
        assert.deepEqual(
            evalScheem(['if', ['=', 2, 2], 0, 1]),
            0
        );
    });
    test('(x = 2) if x = 2, 0, else 1', function() {
        assert.deepEqual(
            evalScheem(['if', ['=', 'x', 2], 0, 1], {x:2}),
            0
        );
    });
    test('only true branch is evaluated', function() {
        assert.deepEqual(
            evalScheem(['if', ['=', 2, 2], 1, 'error']),
            1
        );
    });
});
suite('parse', function() {
    test('a number', function() {
        assert.deepEqual(
            parse('42'),
            42
        );
    });
    test('a variable', function() {
        assert.deepEqual(
            parse('x'),
            'x'
        );
    });
    test('an expression', function() {
        assert.deepEqual(
            parse('(+ 1 1)'),
            ['+', 1, 1]
        );
    });
    test('a nested expression', function() {
        assert.deepEqual(
            parse('(* 50 (+ 1 1))'),
            ['*', 50, ['+', 1, 1]]
        );
    });
    test('a quote', function() {
        assert.deepEqual(
            parse('(quote (1 2 3))'),
            ['quote', [1, 2, 3]]
        );
    });
    test('a shorthand quote', function() {
        assert.deepEqual(
            parse("'(1 2 3)"),
            ['quote', [1, 2, 3]]
        );
    });
});
suite('parseScheemString', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheemString('42'),
            42
        );
    });
    test('an expression', function() {
        assert.deepEqual(
            evalScheemString('(+ 1 1)'),
            2
        );
    });
    test('a nested expression', function() {
        assert.deepEqual(
            evalScheemString('(* 50 (+ 1 1))'),
            100
        );
    });
    test('a quote', function() {
        assert.deepEqual(
            evalScheemString('(quote (1 2 3))'),
            [1, 2, 3]
        );
    });
    test('a shorthand quote', function() {
        assert.deepEqual(
            evalScheemString("'(1 2 3)"),
            [1, 2, 3]
        );
    });
});
suite('let-one', function() {
    test('scoped only to its parameters', function() {
        assert.throws(
            function() {
                evalScheemString("(begin (let-one x 1 (+ x 1)) x)")
            }
        );
    });
    test('scope available within third parameter', function(){
        assert.deepEqual(
            evalScheemString("(begin (let-one x 1 (+ x 1)))"),
            2
        )
    });
    test('scope deeply available within third parameter', function(){
        assert.deepEqual(
            evalScheemString("(begin (let-one x 1 (let-one y 2 (+ x y))))"),
            3
        )
    });
});
suite('functions', function() {
    var identity = function(x) { return x; }
    var always3  = function() { return 3; }
    var addtwo  = function(x, y) { return x+y; }
    var env      = {
                    "identity": identity,
                    "always3": always3,
                    "addtwo": addtwo
                   };
    test('identity function', function(){
        assert.deepEqual(
            evalScheemString("(identity 10)", env),
            10
        );
    });
    test('always3 function, (takes no parameters)', function(){
        assert.deepEqual(
            evalScheemString("(always3)", env),
            3
        );
    });
    test('nested functions', function(){
        assert.deepEqual(
            evalScheemString("(identity (always3))", env),
            3
        )
    });
    test('addtwo (two parameters)', function(){
        assert.deepEqual(
            evalScheemString("(addtwo 1 2)", env),
            3
        )
    });
});
suite('lambda-one', function() {
    test('identity function', function(){
        assert.deepEqual(
            evalScheemString("((lambda-one x x) 5)"),
            5
        );
    });
    test('plus one function', function(){
        assert.deepEqual(
            evalScheemString("((lambda-one x (+ x 1)) 5)"),
            6
        );
    });
    test('nested lambdas with their own variable names', function(){
        assert.deepEqual(
            evalScheemString("(((lambda-one x (lambda-one y (+ x y))) 5) 3)"),
            8
        );
    });
});
