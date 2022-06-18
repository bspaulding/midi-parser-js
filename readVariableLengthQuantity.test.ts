import { assertEquals } from "https://deno.land/std@0.143.0/testing/asserts.ts";
import readVariableLengthQuantity from "./readVariableLengthQuantity.ts";

type Example = {
  representation: number[];
  number: number;
};
const cases: Example[] = [
  { number: 0x00000000, representation: [0x00] },
  { number: 0x00000040, representation: [0x40] },
  { number: 0x0000007f, representation: [0x7f] },
  { number: 0x00000080, representation: [0x81, 0x00] },
  { number: 0x00002000, representation: [0xc0, 0x00] },
  { number: 0x00003fff, representation: [0xff, 0x7f] },
  { number: 0x00004000, representation: [0x81, 0x80, 0x00] },
  { number: 0x00100000, representation: [0xc0, 0x80, 0x00] },
  { number: 0x001fffff, representation: [0xff, 0xff, 0x7f] },
  { number: 0x00200000, representation: [0x81, 0x80, 0x80, 0x00] },
  { number: 0x08000000, representation: [0xc0, 0x80, 0x80, 0x00] },
  { number: 0x0fffffff, representation: [0xff, 0xff, 0xff, 0x7f] },
];
cases.forEach(({ number, representation }) => {
  Deno.test(`readVariableLengthQuantity ${representation} => ${number}`, () => {
    const { quantity, rest } = readVariableLengthQuantity(
      new Uint8Array(representation)
    );
    assertEquals(quantity, number);
    assertEquals(rest.length, 0);
  });
});
