var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files

// Read file contents
var data = fs.readFileSync('scheem.peg', 'utf-8');
// Show the PEG grammar file
console.log(data);
// Create my parser
var parse = PEG.buildParser(data).parse;
// basic test
assert.deepEqual( parse("(a b c)"), ["a", "b", "c"] );
// nested expression
assert.deepEqual( parse("(a b c (d e f))"), ["a", "b", "c", ["d", "e", "f"]] );
// atom with no parens
assert.deepEqual( parse("+"), "+" );

// arbitrary whitespace
assert.deepEqual( parse("(a        b c)"), ["a", "b", "c"] );
