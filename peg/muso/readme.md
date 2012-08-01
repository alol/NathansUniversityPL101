Muso
======
PEG for a MUS language

Syntax
-----
###Play a note
```
g3 for 500ms
```

###Sequences
```
g3 for 500ms
a3 for 250ms
```

###Harmonies
```
c3 and e3 for 1000ms
```

###Repeats
```
5 repeats start
  g4 and c4 and e4 for 250ms
end
```

###Rests
```
rest for 250ms
```

###Specifing time
```
c3 for 500ms
g3 for 0.5s
```
These are equivalent. You can specify a time in either milliseconds or seconds.
