"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
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
        this.semaphore = new Semaphore;
        this.values = new Array();
    }
    push(m) {
        return __awaiter(this, void 0, void 0, function* () {
            this.values.push(m);
            this.semaphore.add();
        });
    }
    pop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.semaphore.get();
            return this.values.shift();
        });
    }
}
class Semaphore {
    constructor() {
        this.numElems = 0;
        this.promises = Array();
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.numElems == 0 || this.promises.length > 0)
                yield new Promise(r => { console.log(r); this.promises.unshift(r); });
            this.numElems -= 1;
        });
    }
    add() {
        this.numElems += 1;
        if (this.promises.length > 0)
            this.promises.pop()();
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
//# sourceMappingURL=main.js.map