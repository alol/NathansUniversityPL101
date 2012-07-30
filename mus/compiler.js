var endTime = function (time, expr) {
    if (expr.tag == 'note') {
        return time + expr.dur;
    } else if (expr.tag == 'par') {
        eLeft = endTime(time, expr.left);
        eRight = endTime(time, expr.right);
        return eLeft >= eRight ? eLeft : eRight;
    } else {
        return endTime(time, expr.left) + 
            endTime(time, expr.right);
    }
};

var noteForMusStatement = function(expr, time, note) {
    if (expr.tag == 'note') {
        note.push({ tag: 'note',
                pitch: expr.pitch,
                start: time,
                dur: expr.dur
        });
    } else if (expr.tag == 'par'){
        note = noteForMusStatement(expr.left, 
                            time, 
                            note);
        note = noteForMusStatement(expr.right, 
                            time, 
                            note);
    } else {
        note = noteForMusStatement(expr.left, 
                            time, 
                            note);
        note = noteForMusStatement(expr.right, 
                            endTime(time, expr.left), 
                            note);
    }
    return note;
};

var compile = function (musexpr) {
    return noteForMusStatement(musexpr, 0, []);
};

var melody_mus = 
    { tag: 'seq',
      left: 
       { tag: 'seq',
         left: { tag: 'note', pitch: 'a4', dur: 250 },
         right: { tag: 'note', pitch: 'b4', dur: 250 } },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'c4', dur: 500 },
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };

console.log(melody_mus);
console.log(compile(melody_mus));
