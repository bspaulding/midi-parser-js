import { assertEquals } from "https://deno.land/std@0.143.0/testing/asserts.ts";
import readMidiMetaEvent, { MIDIMetaEventType } from "./readMidiMetaEvent.ts";

const cases = [
  {
    bytes: [0x00, 0x02, 0x01, 0xff],
    expected: {
      event: {
        type: MIDIMetaEventType.SequenceNumber,
        description: "SequenceNumber",
        length: 2,
        sequenceNumber: 511,
      },
      rest: new Uint8Array(),
    },
  },
  makeTextCase(0x01, "Text", "hello world"),
  makeTextCase(0x02, "CopyrightNotice", "hello copyright"),
  makeTextCase(0x03, "TrackName", "hello track name"),
  makeTextCase(0x04, "InstrumentName", "hello instrument name"),
  makeTextCase(0x05, "Lyric", "hello lyrics"),
  makeTextCase(0x06, "Marker", "hello marker"),
  makeTextCase(0x07, "CuePoint", "hello cue point"),
  {
    bytes: [0x20, 0x01, 0x0f],
    expected: {
      event: {
        type: MIDIMetaEventType.MIDIChannelPrefix,
        length: 1,
        description: "MIDIChannelPrefix",
        channel: 15,
      },
      rest: new Uint8Array(),
    },
  },
  {
    bytes: [0x2f, 0x00, 0x0f],
    expected: {
      event: {
        type: MIDIMetaEventType.EndOfTrack,
        length: 0,
        description: "EndOfTrack",
      },
      rest: new Uint8Array([0x0f]),
    },
  },
  {
    bytes: [0x51, 0x03, 0x01, 0x01, 0x01],
    expected: {
      event: {
        type: MIDIMetaEventType.SetTempo,
        length: 3,
        description: "SetTempo",
        tempo: 65793,
      },
      rest: new Uint8Array([]),
    },
  },
  {
    bytes: [0x54, 0x05, 1, 2, 3, 4, 5],
    expected: {
      event: {
        type: MIDIMetaEventType.SMPTEOffset,
        length: 5,
        description: "SMPTEOffset",
        hr: 1,
        mn: 2,
        se: 3,
        fr: 4,
        ff: 5,
      },
      rest: new Uint8Array([]),
    },
  },
  {
    bytes: [0x58, 0x04, 0x06, 0x03, 0x24, 0x08],
    expected: {
      event: {
        type: MIDIMetaEventType.TimeSignature,
        length: 4,
        description: "TimeSignature",
        n: 6,
        d: 3,
        c: 36,
        b: 8,
      },
      rest: new Uint8Array([]),
    },
  },
  {
    bytes: [0x59, 0x02, 0b10000111, 0x01],
    expected: {
      event: {
        type: MIDIMetaEventType.KeySignature,
        length: 2,
        description: "KeySignature",
        sf: -121,
        mi: 1,
      },
      rest: new Uint8Array([]),
    },
  },
  {
    bytes: [0x59, 0x02, 0b00000111, 0x00],
    expected: {
      event: {
        type: MIDIMetaEventType.KeySignature,
        length: 2,
        description: "KeySignature",
        sf: 7,
        mi: 0,
      },
      rest: new Uint8Array([]),
    },
  },
  {
    bytes: [0x59, 0x02, 252, 1],
    expected: {
      event: {
        type: MIDIMetaEventType.KeySignature,
        length: 2,
        description: "KeySignature",
        sf: -4,
        mi: 1,
      },
      rest: new Uint8Array([]),
    },
  },
  {
    bytes: [0x7f, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    expected: {
      event: {
        type: MIDIMetaEventType.SequencerSpecific,
        length: 10,
        description: "SequencerSpecific",
        data: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
      },
      rest: new Uint8Array([]),
    },
  },
];

cases.forEach(({ bytes, expected }) => {
  Deno.test(bytes.join(", "), () => {
    assertEquals(readMidiMetaEvent(new Uint8Array(bytes)), expected);
  });
});

function makeTextCase(type: number, description: string, text: string) {
  return {
    bytes: [type, text.length].concat(
      Array.from(text).map((c) => c.charCodeAt(0))
    ),
    expected: {
      event: {
        type,
        description,
        length: text.length,
        text,
      },
      rest: new Uint8Array(),
    },
  };
}
