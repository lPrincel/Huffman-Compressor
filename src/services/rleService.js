const { encodeRle, decodeRle } = require("../rle");
const { createHeader, parseHeader } = require("../rleFormat");

const MAX_DECOMPRESSED_SIZE = 150 * 1024 * 1024;

function compressRleBuffer(inputBuffer, fileName) {
  if (inputBuffer.length > 0xffffffff) {
    throw new Error("RLE1 supports files up to 4 GB");
  }

  const payload = encodeRle(inputBuffer);
  const header = createHeader(inputBuffer.length, fileName);
  const compressedBuffer = Buffer.concat([header, payload]);

  return {
    compressedBuffer,
    originalSize: inputBuffer.length,
    compressedSize: compressedBuffer.length
  };
}

function decompressRleBuffer(compressedBuffer) {
  const parsed = parseHeader(compressedBuffer);

  if (parsed.originalSize > MAX_DECOMPRESSED_SIZE) {
    throw new Error("Decompressed file is too large. Maximum allowed size is 150 MB.");
  }

  const decodedBuffer = decodeRle(parsed.payload, parsed.originalSize);

  return {
    decodedBuffer,
    fileName: parsed.fileName
  };
}

module.exports = {
  compressRleBuffer,
  decompressRleBuffer
};