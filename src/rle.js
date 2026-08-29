function countRlePairs(buffer){
    let pairCount = 0;
    let index = 0;

    while(index < buffer.length){
        const byte = buffer[index];
        let count = 0;

        while(index<buffer.length && buffer[index] === byte && count < 255){
            count++;
            index++;
        }

        pairCount++;
    }

    return pairCount;
}

function encodeRle(buffer){
    const pairCount = countRlePairs(buffer);
    const encodedBuffer = Buffer.alloc(2*pairCount);

    let writeIndex = 0;
    let index = 0;

    while(index < buffer.length){
        const byte = buffer[index];
        let count = 0;

        while(index<buffer.length && buffer[index] === byte && count < 255){
            count++;
            index++;
        }
        
        encodedBuffer[writeIndex] = count;
        writeIndex++;

        encodedBuffer[writeIndex] = byte;
        writeIndex++;
    }
    
    return encodedBuffer
}

function decodeRle(encodedBuffer,originalSize){
    let readIndex = 0;

    const decodedBuffer = Buffer.alloc(originalSize);

    if(encodedBuffer.length%2 !== 0){
        throw new Error("Invalid RLE payload")
    }

    for(let i=0;i<encodedBuffer.length;i+=2){
        let count = encodedBuffer[i];
        const byte = encodedBuffer[i+1];
        
        if(count === 0 || readIndex + count > originalSize){
            throw new Error("Invalid RLE payload");
        }

        decodedBuffer.fill(byte,readIndex,count+readIndex);
        readIndex += count;
    }

    if(readIndex !== originalSize){
        throw new Error("Invalid buffer");
    }

    return decodedBuffer;
}

module.exports = {
    countRlePairs,
    encodeRle,
    decodeRle
}