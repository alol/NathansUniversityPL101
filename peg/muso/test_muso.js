var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files

// Read file contents
var data = fs.readFileSync('muso.peg', 'utf-8');
// Show the PEG grammar file
console.log(data);
// Create my parser
var parse = PEG.buildParser(data).parse;
// basic test
assert.deepEqual( parse("g3 for 500ms"), {tag:"note", pitch:"g3", dur:500} );
// basic seq
assert.deepEqual( parse("g3 for 500ms\nc3 for 250ms"), 
        {tag:"seq", 
            left:{tag:"note", pitch:"g3", dur:500},
            right:{tag:"note", pitch:"c3", dur:250}
        } );

//basic par
assert.deepEqual( parse("g3 for 500ms and\nc3 for 250ms"), 
        {tag:"par", 
            left:{tag:"note", pitch:"g3", dur:500},
            right:{tag:"note", pitch:"c3", dur:250}
        } );
