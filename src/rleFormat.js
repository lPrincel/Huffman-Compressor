const MAGIC = Buffer.from("RLE1");
const SIZE = 4 + 4 + 1;

function createHeader(originalSize, fileName){
    const fileNameBuffer = Buffer.from(fileName, "utf-8");
    const fileNameByteLength = fileNameBuffer.length;

    if(fileNameByteLength > 255){
        throw new Error("File name length can't be greater than 255")
    }

    const header = Buffer.alloc(SIZE + fileNameByteLength);

    let offset = 0;

    MAGIC.copy(header, offset);
    offset+=4;

    header.writeUint32BE(originalSize,offset);
    offset+=4;

    header.writeUint8(fileNameByteLength, offset);
    offset+=1;

    fileNameBuffer.copy(header, offset);
    offset+=fileNameByteLength;
    
    return header;
}

function parseHeader(compressedFileBuffer){
    if(compressedFileBuffer.length < SIZE){
        throw new Error("Invalid compressed file: header is too short");
    }

    let offset = 0;
    const fileMagic = compressedFileBuffer.subarray(offset,offset+4);
    offset+=4;

    if(!fileMagic.equals(MAGIC)){
        throw new Error("Invalid compressed file: RLE1 header not found");
    }

    const originalSize = compressedFileBuffer.readUInt32BE(offset);
    offset+=4;

    const fileNameLength = compressedFileBuffer.readUint8(offset);
    offset+=1;

    const fullHeaderSize = SIZE + fileNameLength;

    if(compressedFileBuffer.length < fullHeaderSize){
        throw new Error("Invalid compressed file: Header is incomplete")
    }

    const fileName = compressedFileBuffer.subarray(offset,offset+fileNameLength).toString();
    offset+=fileNameLength;

    const payload = compressedFileBuffer.subarray(offset);

    return {originalSize,payload, fileName};
}

module.exports = {
    createHeader,
    parseHeader
}