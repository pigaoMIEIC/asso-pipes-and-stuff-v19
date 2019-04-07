import { throws } from "assert";
import { WriteStream } from "tty";

//Generic Publisher, Subscriber and Message using Observers
abstract class Publisher {
    private subscribers: Array<IPushObserver>

    constructor() {
        this.subscribers = new Array<IPushObserver>()
    }

    notifySubscribers(m: Message) : void {
        for (let subscriber of this.subscribers)
            subscriber.notify(m)
    }

    addSubscriber(subscriber: IPushObserver) {
        this.subscribers.push(subscriber)
    }

    async abstract push(): Promise<any>
}

abstract class Subscriber implements IPushObserver {
    queue: AsyncQueue<Message>

    constructor() {
        this.queue = new UnlimitedAsyncQueue<Message>()
    }

    notify(msg: Message): void {
        this.queue.enqueue(msg)
    }

    async abstract pull(): Promise<Message>
}

class Message {
    constructor(public value: any) { }
}

interface IPushObserver {
    notify(msg: Message): void
}

//Some concrete Publishers and Subscribers
class NumberGenerator extends Publisher {
    num: number
    constructor(num: number) {
        super()
        this.num = num
    }

    async push() {
        let n: number = this.nextInt();
        let msg: Message = new Message(n);
        this.notifySubscribers(msg)
    }

    nextInt() {
        return (this.num++)
    }
}

class Writer extends Subscriber {
    constructor() {
        super()
    }

    async pull(): Promise<Message> {
        const msg = await this.queue.dequeue()
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

class Registry<T, V> {
    registry: Map<T, V>

    constructor() {
        this.registry = new Map<T, V>()
    }

    bind(name: T, object: V): void {
        this.registry.set(name, object)
    }

    lookup(name: T): V {
        return this.registry.get(name)
    }

    unbind(name: T): boolean {
        if (this.registry.has(name)) {
            this.registry.delete(name)
            return true
        }
        else return false
    }
}

//Main
setInterval(() => { }, 1000);
(async () => {
    console.log("Start")
    const reg = new Registry<String, Publisher>()

    const p1 = new NumberGenerator(1)
    const p2 = new NumberGenerator(100)
    const p3 = new NumberGenerator(1000)
    reg.bind("p1", p1)
    reg.bind("p2", p2)
    reg.bind("p3", p3)

    const s1 = new Writer()
    const s2 = new Writer()
    const s3 = new Writer()
    const s4 = new Writer()
    const s5 = new Writer()
    reg.lookup("p1").addSubscriber(s1)
    reg.lookup("p1").addSubscriber(s2)
    reg.lookup("p1").addSubscriber(s3)
    reg.lookup("p2").addSubscriber(s2)
    reg.lookup("p2").addSubscriber(s3)
    reg.lookup("p2").addSubscriber(s4)
    reg.lookup("p3").addSubscriber(s1)
    reg.lookup("p3").addSubscriber(s3)
    reg.lookup("p3").addSubscriber(s5)

    
    p1.push()
    s1.pull().then(res => console.log("s1 " + res.value))
    s3.pull().then(res => console.log("s3 " + res.value))
    p1.push()
    p2.push()
    s2.pull().then(res => console.log("s2 " + res.value))
    s3.pull().then(res => console.log("s3 " + res.value))
    s4.pull().then(res => console.log("s4 " + res.value))
    s2.pull().then(res => console.log("s2 " + res.value))
    s3.pull().then(res => console.log("s3 " + res.value))
    s1.pull().then(res => console.log("s1 " + res.value))
    s2.pull().then(res => console.log("s2 " + res.value))
    s2.pull().then(res => console.log("s2 " + res.value))
    p3.push()
    s1.pull().then(res => console.log("s1 " + res.value))
    s3.pull().then(res => console.log("s3 " + res.value))
    s5.pull().then(res => console.log("s5 " + res.value))
    s1.pull().then(res => console.log("s1 " + res.value))
    s3.pull().then(res => console.log("s3 " + res.value))
    s3.pull().then(res => console.log("s3 " + res.value))
    s4.pull().then(res => console.log("s4 " + res.value))
    p2.push()
    s5.pull().then(res => console.log("s5 " + res.value))
    p3.push()

    //process.exit()
})()

