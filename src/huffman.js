const MinHeap = require("./minHeap");
const BitReader = require("./bitReader");
const BitWriter = require("./bitWriter");

function buildFrequencyTable(buffer){
    const frequency = Array(256).fill(0);
    
    for(const byte of buffer){
        frequency[byte]++;
    }
    
    return frequency;
}

class Node{
    constructor(frequency,minByte){
        this.byte = minByte;
        this.frequency = frequency;
        this.left=null;
        this.right=null;
        this.minByte=minByte;
    }
}

function buildHuffmanTree(Table){
    const heap=new MinHeap((a,b)=>a.frequency-b.frequency || a.minByte - b.minByte)
    Table.forEach((freq,byte) => {
        if(freq!=0){
            heap.insert(new Node(freq,byte));
        }
    });
    while(heap.size()>1){
        const left=heap.ExtractMin();
        const right = heap.ExtractMin();
        const node=new Node(left.frequency+right.frequency,null);
        node.minByte=Math.min(left.minByte,right.minByte);
        node.left=left;
        node.right=right;
        heap.insert(node);
    }
    return heap.ExtractMin();
}

function generateHuffmanCodes(root){
    const codes=Array(256).fill(null);

    function traverse(node,code){
        if(node==null) return;

        const isLeaf=node.left===null && node.right===null;

        if(isLeaf){
            codes[node.byte] = code || "0";
            return;
        }

        traverse(node.left,code+"0");
        traverse(node.right,code+"1");
    }

    traverse(root,"");

    return codes;
}

function encodeBuffer(buffer,codes, frequencyTable){
    
    let totalBits = 0;
    frequencyTable.forEach((freq,index) => {
        if(codes[index]!==null) totalBits += freq*(codes[index].length);
    })
    
    const bitWriter = new BitWriter(Math.ceil(totalBits/8));
    
    for(const byte of buffer){
        const code = codes[byte];
        for(const bitCharacter of code){
            bitWriter.writeBit(Number(bitCharacter));
        }
    }
    return bitWriter.finish();
}

function decodeBuffer(encodedBuffer, root ,originalSize){
    
    if(!Number.isInteger(originalSize) || originalSize<0){
        throw new Error("Invalid original file size");
    }

    if (root === null) {
        if (originalSize === 0) {
        return Buffer.alloc(0);
        }
        throw new Error("Invalid compressed file: missing Huffman tree");
    }
    
    const isRootLeaf = root.left === null && root.right === null;
    
    const bitReader = new BitReader(encodedBuffer);

    if(isRootLeaf){
        return Buffer.alloc(originalSize, root.byte);
    }

    const decodedBuffer = Buffer.alloc(originalSize);

    let bytesWritten = 0;
    let current=root;

    while(bytesWritten < originalSize){
        const bit = bitReader.readBit();

        if(bit===null) throw new Error("Compressed data ended unexpectedly")
        
        current = bit === 0 ? current.left : current.right;
        
        if(current === null){
            throw new Error("Invalid compressed file: payload does not match Huffman tree");
        }

        if(current.left==null && current.right==null){
            decodedBuffer[bytesWritten] = current.byte;
            bytesWritten++;
            current=root;
        }
    }

    return decodedBuffer;
}

module.exports = {
    buildFrequencyTable,
    buildHuffmanTree,
    generateHuffmanCodes,
    encodeBuffer,
    decodeBuffer
}