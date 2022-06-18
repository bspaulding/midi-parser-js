import readVariableLengthQuantity from "./readVariableLengthQuantity.ts";
import readMidiChannelMessage, {
  MIDIChannelMessage,
} from "./readMidiChannelMessage.ts";
import readMidiMetaEvent, { MIDIMetaEvent } from "./readMidiMetaEvent.ts";

type MIDIFile = {
  chunks: MIDIFileChunk[];
};

type MIDIFileChunk = {
  type: string;
  length: number;
  data: MIDIChunkData;
};

const None = Symbol("None");
type None = typeof None;
type Maybe<T> = T | None;

type MIDIHeaderData = {
  format: number;
  numberOfTracks: number;
  division: MIDIDivision;
};

type MIDIDivision =
  | { ticksPerQuarterNote: number }
  | { smpteFormat: number; ticksPerFrame: number };

function parseHeaderData(data: Uint8Array): MIDIHeaderData {
  const format = (data[0] << 8) + data[1];
  const numberOfTracks = (data[2] << 8) + data[3];
  const divisionType = data[4] >> 7; // get bit 15 of this word
  let division;
  if (divisionType === 0) {
    division = { ticksPerQuarterNote: ((data[4] & 0b01111111) << 8) + data[5] };
  } else {
    division = {
      smpteFormat: data[4] & 0b01111111,
      ticksPerFrame: data[5],
    };
  }

  return { format, numberOfTracks, division };
}

type MIDITrackEvent = {
  deltaTime: number;
  event: MIDIChannelMessage | MIDISysexEvent | MIDIMetaEvent;
};
type MIDITrackData = MIDITrackEvent[];

type MIDISysexEvent = {
  data: Uint8Array;
};

function readMidiSysexEvent(bytes: Uint8Array): {
  event: MIDISysexEvent;
  rest: Uint8Array;
} {
  const length = bytes[0];
  return {
    event: {
      data: bytes.slice(1, 1 + length),
    },
    rest: bytes.slice(1 + length),
  };
}

function readTrackEvent(bytes: Uint8Array): {
  event: MIDIChannelMessage | MIDISysexEvent | MIDIMetaEvent;
  rest: Uint8Array;
} {
  switch (bytes[0]) {
    case 0xff:
      return readMidiMetaEvent(bytes.slice(1));
    case 0xf0:
      return readMidiSysexEvent(bytes.slice(1));
    case 0xf7:
      return readMidiSysexEvent(bytes.slice(1));
    default: {
      const { message: event, rest } = readMidiChannelMessage(bytes);
      return { event, rest };
    }
  }
}
function parseTrackData(bytes: Uint8Array): MIDITrackData {
  const events = [];
  let rest = bytes;
  while (rest.length) {
    const { quantity: deltaTime, rest: rest1 } =
      readVariableLengthQuantity(rest);
    const { event, rest: rest2 } = readTrackEvent(rest1);
    if (event) {
      events.push({ deltaTime, event });
    } else {
      console.warn(
        "parseTrackData ran out of bytes reading midi channel message"
      );
    }
    rest = rest2;
  }
  return events;
}

type MIDIChunkData = MIDIHeaderData | MIDITrackData | Uint8Array;

function parseChunkData(chunkType: string, data: Uint8Array): MIDIChunkData {
  switch (chunkType) {
    case "MThd":
      return parseHeaderData(data);
    case "MTrk":
      return parseTrackData(data);
    default:
      return data;
  }
}

function parseNextChunk(bytes: Uint8Array): {
  chunk: MIDIFileChunk;
  rest: Uint8Array;
} {
  const chunkType: string = String.fromCharCode(
    bytes[0],
    bytes[1],
    bytes[2],
    bytes[3]
  );
  const chunkLength =
    (bytes[4] << 24) + (bytes[5] << 16) + (bytes[6] << 8) + bytes[7];
  const chunkData = bytes.slice(8, 8 + chunkLength);
  const chunk = {
    type: chunkType,
    length: chunkLength,
    data: parseChunkData(chunkType, chunkData),
  };
  const rest = bytes.slice(8 + chunkLength);

  return { chunk, rest };
}

export function parseMIDIFile(bytes: Uint8Array): MIDIFile {
  const chunks = [];
  let { chunk, rest } = parseNextChunk(bytes);
  while (rest.length > 0) {
    chunks.push(chunk);
    const next = parseNextChunk(rest);
    chunk = next.chunk;
    rest = next.rest;
  }
  chunks.push(chunk);

  return { chunks };
}
