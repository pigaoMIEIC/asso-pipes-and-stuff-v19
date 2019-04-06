import { log } from "util";

class Publisher {
  queue : AsyncQueue
  setQueue(queue: AsyncQueue){
    this.queue = queue
  }
}

class Subscriber {
  queue: AsyncQueue
  constructor(public pub: Publisher) {
    this.queue = new AsyncQueue()
    pub.setQueue(this.queue);
  }

  pull(){


  }
}

class NumberGenerator extends Publisher{
  num: number
  constructor(){
    super()
    this.num = 1
  }

  push(): void{
    let n: number = this.nextInt();
    let msg: Message = new Message(n);
    this.queue.push(msg);
  }

  nextInt() {
    return (this.num++)
  }

}

class Writer extends Subscriber {
  constructor(public pub: Publisher){
    super(pub)
  }

  async pull(): Promise <Message> {
    let msg: Message = await this.queue.pop();
    console.log(msg.value);
    return msg
  }
}

class Message {
  constructor(public value: any){}
}

class AsyncQueue {
  values: Array<Message>;
  semaphore = new Semaphore
  constructor(){
    this.values = new Array<Message>()
  }
  async push(m: Message): Promise<void> {
    this.values.push(m)
    this.semaphore.add()
  }
  async pop(): Promise<Message> {
    await this.semaphore.get();
    return this.values.shift();
  }
}


class Semaphore {
  numElems:number = 0;
  private promises = Array<() => void>()

  async get():Promise<any>{
    if (this.numElems == 0 || this.promises.length > 0)
          await new Promise(this.promiseFunc)
      this.numElems -= 1
  }

  promiseFunc(r: ()=>void): void {
    this.promises.unshift(r)
  }

  add():void{
    this.numElems += 1
    if (this.promises.length > 0) this.promises.pop()()
  }
}


const p1 = new NumberGenerator();
const s1 = new Writer(p1);
s1.pull();
s1.pull();
s1.pull();
p1.push();
p1.push();
p1.push();


