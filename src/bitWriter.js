class BitWriter{
    constructor(size){
        this.EncodedBuffer = Buffer.alloc(size);
        this.writtenBytes=0;
        this.size = size;
        this.bitCount=0;
        this.Byte=0;
    }
    writeBit(bit){
        if(bit!==0 && bit!==1){
            throw new Error("Bit must be 0 or 1");
        }
        this.Byte=(this.Byte<<1)|bit;
        this.bitCount++;

        if(this.bitCount===8){
            this.EncodedBuffer[this.writtenBytes] = this.Byte;
            this.Byte=0;
            this.bitCount=0;
            this.writtenBytes++;
        }
    }
    finish(){
        if(this.bitCount>0){
            this.Byte = this.Byte<<(8-this.bitCount);
            this.EncodedBuffer[this.writtenBytes] = this.Byte;
            this.writtenBytes++;
        }
        return this.EncodedBuffer;
    }
}

module.exports = BitWriter;