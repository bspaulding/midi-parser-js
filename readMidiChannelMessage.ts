export type MIDIChannelMessage = {
  channel: number;
  message: MIDIMessage;
  description: string;
};

export enum MIDIMessage {
  NoteOff = 0x8,
  NoteOn = 0x9,
  PolyphonicKeyPressure = 0xa,
  ControlChange = 0xb,
  ProgramChange = 0xc,
  ChannelPressure = 0xd,
  PitchBendChange = 0xe,
  SystemExclusive = 0xf,
}

function statusDescription(status: MIDIMessage): string {
  return MIDIMessage[status];
}

function numberOfDataBytes(status: number): number {
  return status === MIDIMessage.ProgramChange ||
    status === MIDIMessage.ChannelPressure
    ? 1
    : 2;
}

type MIDIMessageData =
  | Record<never, never>
  | { noteNumber: number; keyVelocity: number };

function parseData(status: number, bytes: Uint8Array): MIDIMessageData {
  switch (status) {
    case MIDIMessage.NoteOff:
    case MIDIMessage.NoteOn:
    case MIDIMessage.PolyphonicKeyPressure:
      return {
        noteNumber: bytes[0] & 0b01111111,
        keyVelocity: bytes[1] & 0b01111111,
      };
    case MIDIMessage.ControlChange:
      return {
        controlNumber: bytes[0] & 0b01111111,
        controlValue: bytes[1] & 0b01111111,
      };
    case MIDIMessage.ProgramChange:
      return {
        programNumber: bytes[0] & 0b01111111,
      };
    case MIDIMessage.ChannelPressure:
      return {
        pressureValue: bytes[0] & 0b01111111,
      };
    case MIDIMessage.PitchBendChange:
      // TODO
      // Note from spec:
      // Continuous controllers are divided into Most Significant and Least Significant Bytes. If only seven bits of resolution are needed for any particular controllers, only the MSB is sent. It is not necessary to send the LSB. If more resolution is needed, then both are sent, first the MSB, then the LSB. If only the LSB has changed in value, the LSB may be sent without re-sending the MSB.
      return {
        keyVelocity: (bytes[0] & 0b01111111) + ((bytes[1] & 0b01111111) << 7),
      };
    default:
      return {};
  }
}

export default function readMidiChannelMessage(bytes: Uint8Array): {
  message: MIDIChannelMessage;
  rest: Uint8Array;
} {
  const status = bytes[0] >> 4;
  const channel = (bytes[0] & 0b00001111) + 1;
  const data = bytes.slice(1, 1 + numberOfDataBytes(status));
  return {
    message: {
      channel,
      message: status,
      description: statusDescription(status),
      ...parseData(status, data),
    },
    rest: bytes.slice(1 + data.length),
  };
}
