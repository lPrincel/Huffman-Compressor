class BitReader{
    constructor(buffer){
        this.buffer=buffer;
        this.ByteIndex=0;
        this.bitIndex=0;
    }
    readBit(){
        if(this.ByteIndex==this.buffer.length) return null;
        const bit = this.buffer[this.ByteIndex]>>(7-this.bitIndex)&1;
        this.bitIndex++;
        if(this.bitIndex===8){
            this.ByteIndex++;
            this.bitIndex=0;
        }
        return bit;
    }
}

module.exports = BitReader;