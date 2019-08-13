import { Observable, of, from, fromEvent, fromEventPattern,
     empty, never, interval, timer, concat, merge, combineLatest, zip, } from 'rxjs';
import { map, mapTo, filter, take, first, takeUntil, concatAll, withLatestFrom,
     skip, takeLast, last, startWith } from 'rxjs/operators';

function Prouducer() {

    // 防止 把Prouducer当函数来用
    if (!(this instanceof Prouducer)) {
        throw Error('请用 new Prouducer()!');
    }

    this.listeners = [];
}

// 加入监听方法
Prouducer.prototype.addListener = function(listener) {
    if (typeof listener === 'function') {
        this.listeners.push(listener);
    } else {
        throw Error('listener 必须是 function');
    }
};

// 移除监听
Prouducer.prototype.removeListener = function(listener) {
    this.listeners.splice(this.listeners.indexOf(listener), 1);
};

// 发送通知的方法
Prouducer.prototype.notify = function(message) {
    this.listeners.forEach(listener => {
        listener(message);
    });
};

const egghead = new Prouducer();

function listener1(message) {
    console.log(message + 'from listener1');
}
function listener2(message) {
    console.log(message + 'from listener2');
}

egghead.addListener(listener1); // 注册监听
egghead.addListener(listener2);

egghead.notify('A new course');


class Prouducers {
    constructor() {

    }
    listeners: Function[] = [];

    addListener(listener: Function) {
        this.listeners.push(listener);
    }

    removeListener(listener: Function) {
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }

    notify(message) {
        this.listeners.forEach(listener => {
            listener(message);
        });
    }

}

// iterator 是一个物件，它的就像一个指针（pointer),
// 指向一个资料结构并产生一个序列（sequence),这个序列会有资料结构中的所有元素

// 原生iterator
const arr = [1, 2, 3];
const iterator = arr[Symbol.iterator]();
iterator.next(); // {value: 1, done: false};

// 简单iterator
function IteratorFromArray(arr) {
    if (! (this instanceof IteratorFromArray)) {
        throw new Error('请用 new IteratorFromArray');
    }
    this._array = arr;
    this._cursor = 0;
}

IteratorFromArray.prototype.next = function() {
    return this._cursor < this._array.length ?
            {value: this._array[this._cursor], done: false} :
            {done: true};
};



class IteratorFromArrays {
    _array;
    _cursor = 0;
    constructor(arr) {
        this._array = arr;
    }
    next() {
        return this._cursor < this._array.length ?
        {value: this._array[this._cursor], done: false} :
        {done: true};
    }

    map(callback) {
        const iterator = new IteratorFromArray(this._array);
        return {
            next: () => {
                const {done, value} = iterator.next();
                return {
                    done: done,
                    value: done ? undefined : callback(value),
                }
            }
        };
    }

}

const iterators = new IteratorFromArray([1, 2, 3]);
const newIterator = iterators.map(value => value + 3);

// iterator 有两个优势，第一它渐进式取得资料的特性可以拿来做延迟运算（Lazy evaluation）让我们能用它处理大资料结构
// 第二因为itrerator 本身是序列，所以可以实作所有序列的运算方法像map,filter...等

// 延迟运算，或说call-by-need,是一种运算策略(evaluation strategy), 简单来说我们延迟一个表达式的运算时机到真正
// 需要它的值在做运算
// 用一个generator 实作iteator
function* getNuber(words) {
    for (const word of words) {
        if (/^[0-9]+$/.test(word)) {
            yield parseInt(word, 10);
        }
    }
}

const iterator_g = getNuber('30 天 RXJS 04');

// create 创建observable
const observable = Observable.create(function(observer) {
    observer.next('Jerry');
    observer.next('Anna');
});
//

const source = Observable.create(function(observer) {
    observer.next('Jerry');
    observer.next('Anna');
    observer.complete();
});

const subscription = source.subscribe({
    next: function(value) { console.log(value); },
    complete: function() { console.log('complete!'); },
    error: function(error) { console.log(error); },
});

const source_of = of('Jerry', 'Anna');

const arr_from = ['Jerry', 'Anna', 2016, 2017, '30 day'];
const source_from = from(arr_from);
// from也可以传入字符串
const source_from_str = from('qqdsdfsf');
// 也可以传入Promise
const source_from_promise = from(new Promise(function(resolve, reject) {
    setTimeout(() => {
        resolve('Hello RXJS!');
    });
}));
// 传入Promise实例时，当正常回传时，就会被送到next, 并产即送出完成通知，如果有错误则会送到error

const source_fromEvent = fromEvent(document.body, 'click');
// 第一个参数传入Dom,第二个参数传入要监听的事件名称

// fromEventPattern 是给类事件使用的 就是指其行为跟事件相像，同时有注册监听及移除监听两种行为
const source_fromEventPattern = fromEventPattern(
    (handler) => egghead.addListener(handler),
    (handler) => egghead.removeListener(handler)
    );
egghead.notify('Hello! Can you hear me ? ');

// 空
const source_empty = empty();
// complete  empty会给我们一个空的observable, 如果我们订阅这个observable 它会立即送出complete的讯息
// 无穷
const source_never = never();
// 如果我们订阅这人observable 什么都不会发生，它就是一直存在但却什么都不做的observable
// const source_throw = throw();

// 间隔
const source_interval = interval(1000);
// 订阅后会每隔一秒送出一个从零开始递增的整数
const source_time = timer(1000, 5000);
// 第一个时间代表要发出第一个值的等侍时间(ms)也可以是日期，就会到指定时间在发送第一个值，
// 第二个参数代表第一次之后发送值的间隔时间  也可以只接收一个参数 在等侍时间后发送后结束通知

// 取消订阅
subscription.unsubscribe();

// opterator
const pepole = of('Jerry', 'Anna');
function map3(source: Observable<any>, callback) {
    return Observable.create(observer => {
        return source.subscribe(value => {
            try {
               observer.next(callback(value));
            } catch (e) {
                observer.error(e);
            }
        },
        err => {
            observer.error(err);
        },
        () => observer.complete());
    });
}
const helloPeople = map3(pepole, item => item + 'Hello~');
helloPeople.subscribe(console.log);

function map1(callback) {
    return Observable.create(
        observer => {
            return this.subscribe(value => {
                try {
                    observer.next(callback(value));
                } catch (e) {
                    observer.error(e);
                }
            },
            err => {
                observer.error(err);
            },
            () =>  observer.complete());
        }
    );
}
// 将map挂在Observable的原型上 就可以进行链式操作了 现在的操作符都是放在管道中的(pipe)
// Observable.prototype.map = map1;

// 操作符
// mapTo 可以把传进来的值改成一个固定的值
source_of.pipe(map(item => item + 2),
    mapTo(2),
    filter(item => item === 2),
);

// take 顾名思意就是取前几个元素后就结束
const example_take = source_interval.pipe(take(4));
// 订阅后发送 0123 complete 结束

// first 会取observable发出的第一个元素后就结束
const example_first = source_interval.pipe(first()); // 0 completa

// takeUntil 很常用到，他可以在某件事情发生时，让一个observable直送出完成(complete)讯息
const example_takeUntil = source_interval.pipe(takeUntil(source_fromEvent));
// 这个observable 会一直发送直到点击页面

// concatAll 有时我们送出的元素又是一个observable,就像一个二维数组，数组里面的元素是数组，这时
// 我们可以用concatAll把它摊平成一维阵列，可以把concatAll想成所有元素concat起来
const example_concatAll = source_fromEvent.pipe(map(item => of(1, 2, 2)), concatAll());
const obs1 = interval(1000).pipe(take(5));
const obs2 = interval(500).pipe(take(2));
const obs3 = interval(2000).pipe(take(1));
const tempSource = of (obs1, obs2, obs3);
const example_concatAll2 = tempSource.pipe(concatAll()); // 01234010

// skip 可以略过前几个送出的元素
const example_skip = source_interval.pipe(skip(3)); // 3,4,5,...

// takeList 取倒数几个元素
const example_takeList = source_interval.pipe(take(6), takeLast(2)); // 4,5, complete

// last 取最后一个元素
const example_last = source_interval.pipe(take(6), last()); // 5,complete

// concat 可以把多个observable合成一个
// const example_concat = of(4, 5, 6).pipe(concat(interval(1000).pipe(take(6)), of(3)));
// concat 已被弃用 然后重构了
const example_concat = concat(of(4, 5, 6), interval(1000).pipe(take(6)), of(3));

// startWith 可以在observable的一开始塞要发送的元素，有点像concat但参数不是observable而是要发送的元素
const example_startWidth = source.pipe(startWith(0)); // 0,0,1,2,3,4 在最前面添加了一个0

// merge跟concat一样都是用来合并observable的 在rxjs中被重构了
// const example_merge = interval(500).pipe(take(3), merge(interval(300).pipe(take(6))));
const example_merge = merge(interval(500).pipe(take(3)), interval(300).pipe(take(6)));

// combineLatest 它会取各个observable 最后送出的值，再输出成一个值 在rxjs6中背重构了
const example_combineLatest = combineLatest(interval(500).pipe(take(3)),
 interval(300).pipe(take(6)),
  (x, y) => x + y);
// source : ----0----1----2|
// newest : --0--1--2--3--4--5|

// combineLatest(newest, (x, y) => x + y);

// example: ----01--23-4--(56)--7|

// zip 会取每一个observable相同顺序的元素并传入callback, 也就是说每个observable的第n个元素会一起传入callback
const example_zip = zip(interval(500).pipe(take(3)), interval(300).pipe(take(6)),
 (x, y) => x + y);
//  source : ----0----1----2|
// newest : --0--1--2--3--4--5|
//     zip(newest, (x, y) => x + y)
// example: ----0----2----4|

// withLatesFrom运作方式有点像combineLatest，只是他有主从关系，只有在主要的observable送新的值时，才会执行
// callback,附随的observable 只是在背景下运作
const example_withLatesFrom = zip(from('helo'), interval(500), (x, y) => x
).pipe(withLatestFrom(
   zip( from([0, 1, 0 , 0, 0, 1]), interval(300), (x, y) => x)
));



