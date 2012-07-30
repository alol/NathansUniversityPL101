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
                    pitch: convertPitch(expr.pitch),
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

var convertPitch = function(pitch) {
    var note = pitch.charAt(0).toLowerCase();
    var octave = parseInt(pitch.substr(1));

    var notePitch = 0;
    switch (note) {
        case 'c':
            notePitch = 0;
            break;
        case 'd':
            notePitch = 2;
            break;
        case 'e':
            notePitch = 4;
            break;
        case 'f':
            notePitch = 5;
            break;
        case 'g':
            notePitch = 7;
            break;
        case 'a':
            notePitch = 9;
            break;
        case 'b':
            notePitch = 11;
            break;
    }

    //console.log(pitch + ": " + note + "; " + octave + " - " + notePitch);

    return 12 + (12 * octave) + notePitch;
}

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
