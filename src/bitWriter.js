class BitWriter{
    constructor(){
        this.Bytes=[];
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
            this.Bytes.push(this.Byte);
            this.Byte=0;
            this.bitCount=0;
        }
    }
    finish(){
        if(this.bitCount>0){
            this.Byte=this.Byte<<(8-this.bitCount);
            this.Bytes.push(this.Byte);
        }
        return Buffer.from(this.Bytes);
    }
}

module.exports = BitWriter;