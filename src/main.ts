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

  pull(): Message {
    let msg: Message = this.queue.pop();
    console.log(msg.value);
    return msg
  }
}

class Message {
  constructor(public value: any){}
}

class AsyncQueue {
  values: Array<Message>;

  constructor(){
    this.values = new Array<Message>()
  }
  push(m: Message): void {
    this.values.push(m)
  }
  async pop(): Promise<Message> {
    //tem de bloquear á espera de um push
    //semaforos - problema consumidor-produtor
    return this.values.shift();
  }
}


const p1 = new NumberGenerator();
const s1 = new Writer(p1);
p1.push();
p1.push();
s1.pull();
p1.push();
s1.pull();
s1.pull();

