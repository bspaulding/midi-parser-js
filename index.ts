import { parseMIDIFile } from "./readMidiFile.ts";

async function main() {
  const file = await Deno.readFile(Deno.args[0]);
  const parsed = parseMIDIFile(file);
  console.log(JSON.stringify(parsed, null, 2));
}
main();
