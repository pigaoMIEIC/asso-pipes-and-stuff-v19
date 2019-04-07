import { log } from "util";
import { timingSafeEqual, pbkdf2 } from "crypto";

//Generic Publisher, Subscriber and Message
abstract class Publisher {
    public queue: AsyncQueue<Message>

    constructor() {
        this.queue = new UnlimitedAsyncQueue<Message>()
    }

    async abstract push(): Promise<any>
}

abstract class Subscriber {
    queue: AsyncQueue<Message>

    constructor(public pub: Publisher) {
        this.queue = pub.queue
    }

    async abstract pull(): Promise<Message>
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

    async push() {
        let n: number = this.nextInt();
        let msg: Message = new Message(n);
        this.queue.enqueue(msg);
        console.log("enqueued " + msg.value)
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
        const msg = await this.queue.dequeue()
        console.log("unqueued " + msg)
        return msg
    }
}

//Infrastructure classes
export interface AsyncQueue<T> {
    enqueue(msg: T): void
    dequeue(): Promise<T>
} 

export class UnlimitedAsyncQueue<T> implements AsyncQueue<T>{
    values: Array<T>;
    semaphore = new Semaphore(0)

    constructor() {
        this.values = new Array<T>()
    }

    enqueue(m: T): void {
        this.values.push(m)
        this.semaphore.signal()
    }

    async dequeue(): Promise<T> {
        await this.semaphore.wait();
        return this.values.shift();
    }
}

class Semaphore {
    private waiting = Array<() => void>()

    constructor(private S: number){}

    async wait() {
        if (this.S == 0 || this.waiting.length > 0)
            await new Promise(r => this.waiting.unshift(r))
        this.S -= 1
    }

    signal(): void {
        this.S += 1
        if (this.waiting.length > 0)
            this.waiting.pop()()
    }
}

setInterval(() => { }, 1000);
(async () => {
    console.log("Start")
    const p1 = new NumberGenerator()
    const s1 = new Writer(p1)
    const s2 = new Writer(p1)
    
    s1.pull()
    s2.pull()
    p1.push()
    p1.push()

    process.exit()
})()

