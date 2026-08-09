class MinHeap{
    constructor(compare){
        this.heap = [];
        this.compare = compare;
    }
    size(){
        return this.heap.length;
    }
    swap(firstIndex,secondIndex){
        [this.heap[firstIndex],this.heap[secondIndex]] = [this.heap[secondIndex],this.heap[firstIndex]];
    }
    insert(value){
        this.heap.push(value);
        this.bubbleUp(this.heap.length-1)
    }
    ExtractMin(){
        if(this.heap.length==0) return null;
        if(this.heap.length==1) return this.heap.pop();
        let minimum=this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return minimum;
    }
    bubbleUp(i){
        if(i==0) return;
        let parent = Math.floor((i-1)/2);
        if(this.compare(this.heap[parent],this.heap[i])>0){
            this.swap(parent,i);
            this.bubbleUp(parent);
        }
    }
    bubbleDown(i){
        let leftchild=2*i+1;
        let rightchild=2*i+2;
        let minimum=i;
        if(leftchild<this.size() && this.compare(this.heap[minimum],this.heap[leftchild])>0){
            minimum=leftchild;
        }
        if(rightchild<this.size() && this.compare(this.heap[minimum],this.heap[rightchild])>0){
            minimum=rightchild;
        }
        if(minimum!=i){
            this.swap(minimum,i);
            this.bubbleDown(minimum);
        }
    }
}

module.exports = MinHeap;