const fs = require("fs/promises")
const path = require("path")
const {buildFrequencyTable,buildHuffmanTree,generateHuffmanCodes,encodeBuffer,decodeBuffer} = require("./huffman.js")
const {createHeader,parseHeader} = require("./fileFormat");

async function compressFile(inputPath, outputPath){
    const buffer = await fs.readFile(inputPath)

    if(buffer.length>0xffffffff){
        throw new Error("v1 supports files up to 4GB");
    }

    const FrequencyTable=buildFrequencyTable(buffer);
    const root = buildHuffmanTree(FrequencyTable);
    const codes = generateHuffmanCodes(root);
    const encodedBuffer = encodeBuffer(buffer,codes,FrequencyTable);
    const header = createHeader(FrequencyTable,buffer.length,path.basename(inputPath));
    const jointBuffer = Buffer.concat([header,encodedBuffer]);
    await fs.writeFile(outputPath,jointBuffer);

    console.log("Compression complete");
    console.log("Original size: ", buffer.length, "bytes");
    console.log("Compressed size: ", jointBuffer.length, "bytes");
}

async function decompressFile(inputPath, outputPath){
    const compressedBuffer = await fs.readFile(inputPath);

    const parsed = parseHeader(compressedBuffer);

    const frequencyTotal = parsed.frequencyTable.reduce((total,frequency) => total + frequency, 0);
    if(frequencyTotal!=parsed.originalSize){
        throw new Error("Invalid compressed file: header data is inconsistent");
    }

    const root = buildHuffmanTree(parsed.frequencyTable);
    const decodedBuffer = decodeBuffer(parsed.payload,root, parsed.originalSize);

    await fs.writeFile(outputPath,decodedBuffer);

    console.log("Decompression complete");
    console.log("Restored size: ", decodedBuffer.length, "bytes");
}

async function main(){
    const [command, inputPath,outputPath] = process.argv.slice(2);

    if(!command || !inputPath || !outputPath){
        throw new Error(
            "Usage: node src/cli.js <compress|decompress> <inputPath> <outputPath>"
        )
    }

    if(command==="compress"){
        await compressFile(inputPath,outputPath);
    }
    else if(command==="decompress"){
        await decompressFile(inputPath,outputPath)
    }
    else throw new Error("command must be either compress or decompress");
}

main().catch((error)=>{
    console.error("Error:",error.message);
    process.exitCode = 1;
})