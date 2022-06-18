# midi-parser-js

I wanted to write my own MIDI file parser to learn more about the spec. The result is this. `index.ts` will take a filepath to a `.mid` file, and will output to stdout the parsed data structure. Where higher level structures didn't make sense, like sysex messages, we are just outputting the data as a Uint8Array.

I make no guarantees this is feature complete or correct. I've done minimal testing. This was an exercise for myself to read through the MIDI file spec and MIDI spec and learn.

Resources I used are in the `resources` dir, including the MIDI file spec and the MIDI spec.

The `data` directory contains some example midi files I found for free, and used to manually test. 