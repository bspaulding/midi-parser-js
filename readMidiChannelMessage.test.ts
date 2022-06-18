import { assertEquals } from "https://deno.land/std@0.143.0/testing/asserts.ts";
import readMidiChannelMessage, {
  MIDIMessage,
} from "./readMidiChannelMessage.ts";

const cases = [
  {
    bytes: [0b10000000, 0b11111111, 0b00000001],
    expected: {
      message: {
        channel: 1,
        message: MIDIMessage.NoteOff,
        description: "NoteOff",
        noteNumber: 127,
        keyVelocity: 1,
      },
      rest: new Uint8Array(),
    },
  },
  {
    bytes: [0b10010000, 0b11111111, 0b00000001],
    expected: {
      message: {
        channel: 1,
        message: MIDIMessage.NoteOn,
        description: "NoteOn",
        noteNumber: 127,
        keyVelocity: 1,
      },
      rest: new Uint8Array(),
    },
  },
  {
    bytes: [0b10100000, 0b11111111, 0b00000001],
    expected: {
      message: {
        channel: 1,
        message: MIDIMessage.PolyphonicKeyPressure,
        description: "PolyphonicKeyPressure",
        noteNumber: 127,
        keyVelocity: 1,
      },
      rest: new Uint8Array(),
    },
  },
  {
    bytes: [0b10110001, 0b01110111, 0b00000011],
    expected: {
      message: {
        channel: 2,
        message: MIDIMessage.ControlChange,
        description: "ControlChange",
        controlNumber: 119,
        controlValue: 3,
      },
      rest: new Uint8Array(),
    },
  },
  {
    bytes: [0b11000010, 0b01110111, 0b00000011],
    expected: {
      message: {
        channel: 3,
        message: MIDIMessage.ProgramChange,
        description: "ProgramChange",
        programNumber: 119,
      },
      rest: new Uint8Array([0b00000011]),
    },
  },
  {
    bytes: [0b11010011, 0b01110111, 0b00000011],
    expected: {
      message: {
        channel: 4,
        message: MIDIMessage.ChannelPressure,
        description: "ChannelPressure",
        pressureValue: 119,
      },
      rest: new Uint8Array([0b00000011]),
    },
  },
  {
    bytes: [0b11100110, 0b01110111, 0b00000011],
    expected: {
      message: {
        channel: 7,
        message: MIDIMessage.PitchBendChange,
        description: "PitchBendChange",
        keyVelocity: 0b00000111110111,
      },
      rest: new Uint8Array(),
    },
  },
];
cases.forEach(({ bytes, expected }) => {
  Deno.test(bytes.map((b) => `0b${b.toString(2)}`).join(", "), () => {
    assertEquals(readMidiChannelMessage(new Uint8Array(bytes)), expected);
  });
});
