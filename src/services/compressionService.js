const {buildFrequencyTable,buildHuffmanTree,generateHuffmanCodes,encodeBuffer,decodeBuffer} = require("../huffman.js")
const {createHeader,parseHeader} = require("../fileFormat");

function compressBuffer(inputBuffer,fileName){

    if(inputBuffer.length>0xffffffff){
        throw new Error("v1 supports files up to 4GB");
    }

    const FrequencyTable=buildFrequencyTable(inputBuffer);
    const root = buildHuffmanTree(FrequencyTable);
    const codes = generateHuffmanCodes(root);
    const encodedBuffer = encodeBuffer(inputBuffer,codes, FrequencyTable);
    const header = createHeader(FrequencyTable,inputBuffer.length,fileName);
    const compressedBuffer = Buffer.concat([header,encodedBuffer]);

    return {
        compressedBuffer,
        originalSize: inputBuffer.length,
        compressedSize: compressedBuffer.length
    };
}

function decompressBuffer(compressedBuffer){

    const parsed = parseHeader(compressedBuffer);

    const MAX_DECOMPRESSED_SIZE = 150*1024*1024;

    if(parsed.originalSize > MAX_DECOMPRESSED_SIZE){
        throw new Error("Decompressed file is too large. Maximum allowed size is 150 MB.");
    }

    const frequencyTotal = parsed.frequencyTable.reduce((total,frequency) => total + frequency, 0);
    if(frequencyTotal!=parsed.originalSize){
        throw new Error("Invalid compressed file: header data is inconsistent");
    }
    
    const fileName = parsed.fileName;

    const root = buildHuffmanTree(parsed.frequencyTable);
    const decodedBuffer = decodeBuffer(parsed.payload,root, parsed.originalSize);

    return {decodedBuffer, fileName};
    
}

module.exports = {
    compressBuffer,
    decompressBuffer
}