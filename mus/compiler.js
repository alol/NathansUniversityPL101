var endTime = function (time, expr) {
    switch(expr.tag) { 
        case 'note':
        case 'rest':
            return time + expr.dur;
        case 'par':
            eLeft = endTime(time, expr.left);
            eRight = endTime(time, expr.right);
            return eLeft >= eRight ? eLeft : eRight;
            break;
        case 'seq':
            return endTime(time, expr.left) + 
                endTime(time, expr.right);
            break;
    }
};

var noteForMusStatement = function(expr, time, note) {
    switch(expr.tag) {
        case 'note':
            note.push({ tag: 'note',
                    pitch: expr.pitch,
                    start: time,
                    dur: expr.dur
            });
            break;
        case 'rest':
            note.push({ tag: 'rest', start: time, dur: expr.dur});
            break;
        case 'par':
            note = noteForMusStatement(expr.left, 
                                time, 
                                note);
            note = noteForMusStatement(expr.right, 
                                time, 
                                note);
            break;
        case 'seq':
            note = noteForMusStatement(expr.left,
                                time, 
                                note);
            note = noteForMusStatement(expr.right, 
                                endTime(time, expr.left), 
                                note);
            break;
    }
    return note;
};

var compile = function (musexpr) {
    return noteForMusStatement(musexpr, 0, []);
};

var melody_mus = 
    { tag: 'seq',
      left: 
       { tag: 'par',
         left: { tag: 'note', pitch: 'a4', dur: 250 },
         right: { tag: 'note', pitch: 'b4', dur: 250 } },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'c4', dur: 500 },
         right: { tag: 'rest', dur: 500 } } };

console.log(melody_mus);
console.log(compile(melody_mus));
