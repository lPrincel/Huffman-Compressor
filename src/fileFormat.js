const MAGIC = Buffer.from("HFC2");

function createHeader(frequencyTable, originalSize, fileName){
    fileNameBuffer = Buffer.from(fileName);
    const fileNameByteLength = fileNameBuffer.length;

    if(fileNameByteLength>255){
        throw new Error(`Filename exceeds maximum length of 255 bytes (current: ${fileNameByteLength} bytes)`)
    }

    const HEADER_SIZE = 4 + 4 + 1 + fileNameByteLength + 1024;

    const header = Buffer.alloc(HEADER_SIZE);

    let offset = 0;

    MAGIC.copy(header,offset);
    offset+=4;
    
    header.writeUInt32BE(originalSize,offset);
    offset+=4;
    
    header.writeUInt8(fileNameByteLength,offset);
    offset+=1;

    fileNameBuffer.copy(header,offset);
    offset+=fileNameByteLength;

    for(let byte=0;byte<=255;byte++){
        header.writeUInt32BE(frequencyTable[byte],offset);
        offset+=4;
    }

    return header;
}

function parseHeader(compressedFileBuffer){
    let offset = 0;
    const fileMagic = compressedFileBuffer.subarray(offset,offset+4);
    offset+=4;
    
    if(!fileMagic.equals(MAGIC)){
        throw new Error("Invalid compressed file: HFC2 header not found");
    }
    let originalSize=compressedFileBuffer.readUInt32BE(offset);
    offset+=4;

    let fileNameLength = compressedFileBuffer.readUInt8(offset);
    offset+=1;

    let fileName = compressedFileBuffer.subarray(offset,offset+fileNameLength).toString();
    offset+=fileNameLength;

    const frequencyTable = Array(256).fill(0);
    
    for(let byte=0;byte<=255;byte++){
        frequencyTable[byte] = compressedFileBuffer.readUInt32BE(offset);
        offset+=4;
    }
    return {
        originalSize,
        fileName,
        frequencyTable,
        payload: compressedFileBuffer.subarray(offset)
    };
}

module.exports = {
    createHeader,
    parseHeader
};