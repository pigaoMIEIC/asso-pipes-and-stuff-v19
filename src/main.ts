import { log } from "util";

//Generic Publisher, Subscriber and Message
abstract class Publisher {
    public queue: AsyncQueue

    constructor() {
        this.queue = new AsyncQueue()
    }

    abstract push(): void
}

abstract class Subscriber {
    queue: AsyncQueue

    constructor(public pub: Publisher) {
        this.queue = pub.queue
    }

    abstract async pull(): Promise<Message>
}

class Message {
    constructor(public value: any) { }
}

//Some concrete Publishers and Subscribers
class NumberGenerator extends Publisher {
    num: number
    constructor() {
        super()
        this.num = 1
    }

    push(): void {
        let n: number = this.nextInt();
        let msg: Message = new Message(n);
        this.queue.push(msg);
    }

    nextInt() {
        return (this.num++)
    }
}

class Writer extends Subscriber {
    constructor(public pub: Publisher) {
        super(pub)
    }

    async pull(): Promise<Message> {
        let msg: Message = await this.queue.pop();
        console.log(msg.value);
        return msg
    }
}


//Infrastructure classes
class AsyncQueue {
    values: Array<Message>;
    semaphore = new Semaphore()

    constructor() {
        this.values = new Array<Message>()
    }

    async push(m: Message): Promise<void> {
        this.values.push(m)
        this.semaphore.signal()
    }

    async pop(): Promise<Message> {
        await this.semaphore.wait();
        return this.values.shift();
    }
}

class Semaphore {
    numElems: number = 0;
    private promises = Array<() => void>()

    async wait(): Promise<any> {
        if (this.numElems == 0 || this.promises.length > 0)
            await new Promise(r => this.promises.unshift(r))
        this.numElems -= 1
    }

    signal(): void {
        this.numElems += 1
        if (this.promises.length > 0) this.promises.pop()()
    }
}

const p1 = new NumberGenerator()
const s1 = new Writer(p1)
const s2 = new Writer(p1)
s1.pull()
s1.pull()
s2.pull()
p1.push()
s2.pull()
p1.push()
p1.push()
p1.push()
