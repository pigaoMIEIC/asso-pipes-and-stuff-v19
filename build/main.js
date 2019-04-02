var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Publisher {
    setQueue(queue) {
        this.queue = queue;
    }
}
class Subscriber {
    constructor(pub) {
        this.pub = pub;
        this.queue = new AsyncQueue();
        pub.setQueue(this.queue);
    }
    pull() {
    }
}
class NumberGenerator extends Publisher {
    constructor() {
        super();
        this.num = 1;
    }
    push() {
        let n = this.nextInt();
        let msg = new Message(n);
        this.queue.push(msg);
    }
    nextInt() {
        return (this.num++);
    }
}
class Writer extends Subscriber {
    constructor(pub) {
        super(pub);
        this.pub = pub;
    }
    pull() {
        return __awaiter(this, void 0, void 0, function* () {
            let msg = yield this.queue.pop();
            console.log(msg.value);
            return msg;
        });
    }
}
class Message {
    constructor(value) {
        this.value = value;
    }
}
class AsyncQueue {
    constructor() {
        this.values = new Array();
    }
    push(m) {
        return __awaiter(this, void 0, void 0, function* () {
            this.values.push(m);
        });
    }
    pop() {
        return __awaiter(this, void 0, void 0, function* () {
            //tem de bloquear á espera de um push
            //semaforos - problema consumidor-produtor
            return this.values.shift();
        });
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
//# sourceMappingURL=main.js.map