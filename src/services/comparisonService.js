const { compressBuffer } = require("./compressionService");
const {compressRleBuffer} = require("./rleService")

function createStats(originalSize, compressedSize){
    const sizeDifference = originalSize - compressedSize;

    return {
        compressedSize,
        sizeDifference,
        percentageChange : originalSize === 0 ? 0 : (sizeDifference/originalSize) * 100
    }
}

function compareAlgorithms(inputBuffer, fileName){

    const huffmanResult = compressBuffer(inputBuffer, fileName);
    const rleResult = compressRleBuffer(inputBuffer, fileName);

    const huffman = createStats( inputBuffer.length, huffmanResult.compressedSize)

    const rle = createStats( inputBuffer.length, rleResult.compressedSize)

    let recommendedAlgorithm = "tie";

    if(huffman.compressedSize < rle.compressedSize){
        recommendedAlgorithm = "huffman";
    }
    else if(rle.compressedSize < huffman.compressedSize){
        recommendedAlgorithm = "rle";
    }

    return {
        originalSize: inputBuffer.length,
        huffman, 
        rle,
        recommendedAlgorithm
    };
}

module.exports = {
    compareAlgorithms
}