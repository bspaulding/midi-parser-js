export default function readVariableLengthQuantity(bytes: Uint8Array): {
  quantity: number;
  rest: Uint8Array;
} {
  let n = 0;
  let i = 0;
  while (bytes[i] & 0b10000000) {
    n = (n << 7) + (bytes[i] & 0b01111111);
    i += 1;
  }
  n = (n << 7) + (bytes[i] & 0b01111111);
  return { quantity: n, rest: bytes.slice(i + 1) };
}
