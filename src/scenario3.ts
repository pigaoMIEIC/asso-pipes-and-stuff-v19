//Generic Publisher, Subscriber and Message using Observers
abstract class Publisher {
    public queue: AsyncQueue<Message>
    private subscribers: Array<IPushObserver>

    constructor() {
        this.queue = new UnlimitedAsyncQueue<Message>()
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
    constructor() {
        super()
        this.num = 1
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
    const s1 = new Writer()
    const s2 = new Writer()
    const s3 = new Writer()

    p1.addSubscriber(s1)
    p1.addSubscriber(s2)
    p1.addSubscriber(s3)
    
    p1.push()
    s1.pull().then(res => console.log(res.value))
    s2.pull().then(res => console.log(res.value))
    s3.pull().then(res => console.log(res.value))
    s1.pull().then(res => console.log(res.value))
    s2.pull().then(res => console.log(res.value))
    s3.pull().then(res => console.log(res.value))
    p1.push()

    //process.exit()
})()

