const MAGIC = Buffer.from("HFC2");

function createHeader(frequencyTable, originalSize, fileName){
    fileNameBuffer = Buffer.from(fileName);
    const fileNameLength = fileNameBuffer.length;

    if(fileNameLength>255){
        throw new Error(`Filename exceeds maximum length of 255 bytes (current: ${fileNameByteLength} bytes)`)
    }

    HEADER_SIZE = 4 + 4 + 4 + fileNameByteLength + 1024;

    const header = Buffer.alloc(HEADER_SIZE);

    let offset = 0;

    MAGIC.copy(header,offset);
    offset+=4;
    
    header.writeUInt32BE(originalSize,offset);
    offset+=4;
    
    header.writeUInt8(fileNameLength);
    offset+=1;

    header.writeUInt32BE(fileName,offset);
    offset+=fileNameByteLength;

    for(let byte=0;byte<=255;byte++){
        const offset = offset+byte*4;
        header.writeUInt32BE(frequencyTable[byte],offset);
    }

    return header;
}

function parseHeader(compressedFileBuffer){
    let offset = 0;
    const fileMagic = compressedFileBuffer.subarray(0,4);
    offset+=4;
    
    if(!fileMagic.equals(MAGIC)){
        throw new Error("Invalid compressed file: HFC1 header not found");
    }
    let originalSize=compressedFileBuffer.readUInt32BE(offset);
    offset+=4;

    let fileNameLength = compressedFileBuffer.readUInt8(offset);
    offset+=1;

    let fileName = compressedFileBuffer.subarray(offset,fileNameLength).toString();
    offset+=fileNameLength;

    const frequencyTable = Array(256).fill(0);
    
    for(let byte=0;byte<=255;byte++){
        let offset=offset+4*byte;
        frequencyTable[byte] = compressedFileBuffer.readUInt32BE(offset);
    }
    return {
        originalSize,
        frequencyTable,
        fileName,
        payload: compressedFileBuffer.subarray(HEADER_SIZE)
    };
}

module.exports = {
    createHeader,
    parseHeader
};