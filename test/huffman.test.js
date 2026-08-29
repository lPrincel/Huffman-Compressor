const test = require("node:test");
const assert = require("node:assert/strict");

const {compressBuffer, decompressBuffer} = require("../src/services/compressionService.js");
const {encodeRle, decodeRle} = require("../src/rle.js");
const {compressRleBuffer, decompressRleBuffer} = require("../src/services/rleService.js")
const {compareAlgorithms} = require("../src/services/comparisonService.js")

test("compresses and restores normal text exactly",() => {
    const input = Buffer.from("banana bandana");
    const fileName = "notes.txt";

    const {compressedBuffer} = compressBuffer(input, fileName);

    const {decodedBuffer, fileName: restoredFileName} = decompressBuffer(compressedBuffer)

    assert.deepEqual(decodedBuffer, input);
    assert.equal(restoredFileName, fileName);
})

test("handles an empty file", () => {
  const input = Buffer.alloc(0);
  const { compressedBuffer } = compressBuffer(input, "empty.txt");
  const { decodedBuffer } = decompressBuffer(compressedBuffer);

  assert.deepEqual(decodedBuffer, input);
});

test("handles a file with one repeated byte", () => {
  const input = Buffer.from("aaaaaa");
  const { compressedBuffer } = compressBuffer(input, "repeated.txt");
  const { decodedBuffer } = decompressBuffer(compressedBuffer);

  assert.deepEqual(decodedBuffer, input);
});

test("handles arbitrary binary data", () => {
  const input = Buffer.from([0, 255, 17, 128, 0, 34]);
  const { compressedBuffer } = compressBuffer(input, "binary.bin");
  const { decodedBuffer } = decompressBuffer(compressedBuffer);

  assert.deepEqual(decodedBuffer, input);
});

test("rejects a file with invalid magic bytes", () => {
  assert.throws(()=> decompressBuffer(Buffer.from("This is not an HFC archive")), /HFC2 header not found/);
});

test("rejects a file with an incomplete HFC header", () => {
  assert.throws(()=> decompressBuffer(Buffer.from("HFC2")), /header is too short/)
})

test("compresses and restores normal text exactly using RLE",() => {
    const input = Buffer.from("AAAABBCC");

    const compressedBuffer = encodeRle(input);

    const decodedBuffer = decodeRle(compressedBuffer, input.length);

    assert.deepEqual(decodedBuffer, input);
})

test("encodes runs in count-byte pairs", () => {
  const encoded = encodeRle(Buffer.from("AAAABBCC"));

  assert.deepEqual(
    [...encoded],
    [4, 65, 2, 66, 2, 67]
  );
});

test("handles an empty RLE input", () => {
  const input = Buffer.alloc(0);
  const encoded = encodeRle(input);
  const decoded = decodeRle(encoded, input.length);

  assert.deepEqual(decoded, input);
});

test("splits a run longer than 255 bytes", () => {
  const input = Buffer.alloc(300, 65);
  const encoded = encodeRle(input);

  assert.deepEqual([...encoded], [255, 65, 45, 65]);

  const decoded = decodeRle(encoded, input.length);
  assert.deepEqual(decoded, input);
});

test("creates and restores a complete RLE1 archive", () => {
  const input = Buffer.from("AAAABBCC");
  const fileName = "runs.txt";

  const { compressedBuffer } = compressRleBuffer(input, fileName);

  const { decodedBuffer, fileName: restoredFileName } =
    decompressRleBuffer(compressedBuffer);

  assert.deepEqual(decodedBuffer, input);
  assert.equal(restoredFileName, fileName);
});

test("compares Huffman and RLE compression results", () => {
  const input = Buffer.from("AAAABBCC");
  const result = compareAlgorithms(input, "runs.txt");

  assert.equal(result.originalSize, input.length);

  assert.equal(typeof result.huffman.compressedSize, "number");
  assert.equal(typeof result.rle.compressedSize, "number");

  assert.equal(
    result.huffman.sizeDifference,
    input.length - result.huffman.compressedSize
  );

  assert.equal(
    result.rle.sizeDifference,
    input.length - result.rle.compressedSize
  );

  assert.ok(
    ["huffman","rle","tie"].includes(result.recommendedAlgorithm)
  );
})

test("rejects an RLE payload with odd byte length", () => {
  assert.throws(
    () => decodeRle(Buffer.from([3, 65, 2]), 5),
    /Invalid RLE payload/
  );
});

test("rejects an RLE payload with a zero-count run", () => {
  assert.throws(
    () => decodeRle(Buffer.from([0, 65]), 0),
    /Invalid RLE payload/
  );
});

test("rejects an RLE payload whose decoded size does not match originalSize", () => {
  assert.throws(
    () => decodeRle(Buffer.from([2, 65]), 10),
    /Invalid buffer/
  );
});
