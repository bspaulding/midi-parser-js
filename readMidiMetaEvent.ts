export type MIDIMetaEvent = {
  type: number;
  length: number;
  description: string;
};

export enum MIDIMetaEventType {
  SequenceNumber = 0x00,
  Text = 0x01,
  CopyrightNotice = 0x02,
  TrackName = 0x03,
  InstrumentName = 0x04,
  Lyric = 0x05,
  Marker = 0x06,
  CuePoint = 0x07,
  MIDIChannelPrefix = 0x20,
  EndOfTrack = 0x2f,
  SetTempo = 0x51,
  SMPTEOffset = 0x54,
  TimeSignature = 0x58,
  KeySignature = 0x59,
  SequencerSpecific = 0x7f,
}

type MIDIMetaEventData =
  | { sequenceNumber: number }
  | { text: string }
  | { channel: number }
  | { tempo: number }
  | { hr: number; mn: number; se: number; fr: number; ff: number }
  | { n: number; d: number; c: number; b: number }
  | { sf: number; mi: number }
  | { data: Uint8Array }
  | Record<never, never>;

function parseData(
  type: MIDIMetaEventType,
  bytes: Uint8Array
): MIDIMetaEventData {
  switch (type) {
    case MIDIMetaEventType.SequenceNumber:
      return { sequenceNumber: (bytes[0] << 8) + bytes[1] };
    case MIDIMetaEventType.Text:
    case MIDIMetaEventType.CopyrightNotice:
    case MIDIMetaEventType.TrackName:
    case MIDIMetaEventType.InstrumentName:
    case MIDIMetaEventType.Lyric:
    case MIDIMetaEventType.Marker:
    case MIDIMetaEventType.CuePoint:
      return { text: String.fromCharCode.apply(null, Array.from(bytes)) };
    case MIDIMetaEventType.MIDIChannelPrefix:
      return { channel: bytes[0] };
    case MIDIMetaEventType.SetTempo:
      return { tempo: (bytes[0] << 16) + (bytes[1] << 8) + bytes[0] };
    case MIDIMetaEventType.SMPTEOffset:
      return {
        hr: bytes[0],
        mn: bytes[1],
        se: bytes[2],
        fr: bytes[3],
        ff: bytes[4],
      };
    case MIDIMetaEventType.TimeSignature:
      return {
        n: bytes[0],
        d: bytes[1],
        c: bytes[2],
        b: bytes[3],
      };
    case MIDIMetaEventType.KeySignature:
      return {
        sf: bytes[0] & 0b10000000 ? -1 * (bytes[0] & 0b01111111) : bytes[0],
        mi: bytes[1],
      };
    case MIDIMetaEventType.SequencerSpecific:
      return { data: bytes };
    default:
      return {};
  }
}

export default function readMidiMetaEvent(bytes: Uint8Array): {
  event: MIDIMetaEvent;
  rest: Uint8Array;
} {
  const type = bytes[0];
  const length = bytes[1];
  const data = bytes.slice(2, 2 + length);
  return {
    event: {
      type,
      description: MIDIMetaEventType[type],
      length,
      ...parseData(type, data),
    },
    rest: bytes.slice(2 + length),
  };
}
