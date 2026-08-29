const MAGIC = Buffer.from("HFC2");
const FIXED_HEADER_SIZE = 4+4+1;
const FREQUENCY_TABLE_SIZE = 256*4;

function createHeader(frequencyTable, originalSize, fileName){
    const fileNameBuffer = Buffer.from(fileName);
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
    if(compressedFileBuffer.length < FIXED_HEADER_SIZE){
        throw new Error("Invalid compressed file: header is too short")
    }

    let offset = 0;
    const fileMagic = compressedFileBuffer.subarray(offset,offset+4);
    offset+=4;
    
    if(!fileMagic.equals(MAGIC)){
        throw new Error("Invalid compressed file: HFC2 header not found");
    }
    const originalSize=compressedFileBuffer.readUInt32BE(offset);
    offset+=4;

    const fileNameLength = compressedFileBuffer.readUInt8(offset);
    offset+=1;

    const fullHeaderSize = FIXED_HEADER_SIZE + fileNameLength + FREQUENCY_TABLE_SIZE;

    if(compressedFileBuffer.length < fullHeaderSize){
        throw new Error("Invalid compressed file: Header is incomplete");
    }

    const fileName = compressedFileBuffer.subarray(offset,offset+fileNameLength).toString();
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