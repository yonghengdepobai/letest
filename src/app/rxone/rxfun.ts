import { Observable, of, from, fromEvent, fromEventPattern,
     empty, never, interval, timer, concat, merge, combineLatest, zip, Subject, BehaviorSubject, ReplaySubject, AsyncSubject, } from 'rxjs';
import { map, mapTo, filter, take, first, takeUntil, concatAll, withLatestFrom,
     skip, takeLast, last, startWith, scan, buffer, bufferTime, count,
      bufferCount, delay, catchError, switchAll, mergeAll,
      delayWhen, debounceTime, throttleTime, distinct, distinctUntilChanged, retry, window,
       retryWhen, repeat, concatMap, switchMap, mergeMap, groupBy, reduce } from 'rxjs/operators';

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

const iterators = new IteratorFromArrays([1, 2, 3]);
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
// main   : ----h----e----l----l----o|
// some   : --0--1--0--0--0--1|

// withLatestFrom(some, (x, y) =>  y === 1 ? x.toUpperCase() : x);

// example: ----h----e----l----L----O|

// scan 其实就是Observable 版本的reduce 只是命名不同。 原生js Array就有reduce方法
const reduce_arr = [1, 2, 3, 4];
const reduce_result = arr.reduce( (origin, next) => {
    return origin + next;
}, 0);
console.log(reduce_result); // 0 1 3 6 10
const example_scan = zip(from('hello'), interval(600), (x, y) => x).pipe(
    scan((origin, next) => origin + next, '')
);
// source : ----h----e----l----l----o|
//     scan((origin, next) => origin + next, '')
// example: ----h----(he)----(hel)----(hell)----(hello)|

// buffer 是一整个家族
// buffer bufferCount bufferTime bufferToggle bufferWhen
const example_buffer = interval(300).pipe(buffer(interval(1000))); // 这个例子就是一秒送一次结果
// source : --0--1--2--3--4--5--6--7..
// source2: ---------0---------1--------...
//             buffer(source2)
// example: ---------([0,1,2])---------([3,4,5])
// buffer 要传入一个observable(2), 它会把原来的observable(1) 送出的元素缓存在阵列中，等到传入的observable(2)
// 送出元素时，就会触发把缓存元素送出来

// 这里也可以bufferTime来实现同样的效果
const example_bufferTime = interval(300).pipe(bufferTime(1000));

// 我们也可以用数量来做缓存
const example_bufferCount = interval(300).pipe(bufferCount(3));

// 例子用buffer做过滤
const example_click_buffer = fromEvent(document.getElementById('demo'), 'click').pipe(
    bufferTime(500),
    filter(arrs => arrs.length > 1)
); // 在一秒种内点两次才能触发

// delay 可以延迟obsevrable 一开始发送元素的时间点
const example_delay = interval(300).pipe(take(6), delay(500));
// source : --0--1--2--3--4|
//         delay(500)
// example: -------0--1--2--3--4|
// delay 也可以传入 Date 类型
const example_delay2 = interval(300).pipe(take(6), delay(new Date().getTime() + 1000));

// delayWhen 的作用跟delay很像，最大差别是delayWhen可以影响每一个元素，而且需要传一个callback 并回传一个observable
const example_delayWhen = interval(300).pipe(take(5), delayWhen( x => empty().pipe(delay(100 * x * x))));
// source : --0--1--2--3--4|
//     .delayWhen(x => Rx.Observable.empty().delay(100 * x * x));
// example: --0---1----2-----3-----4|

// debounce跟debounceTime 一个是传入observable一个是传入毫秒
const example_debounceTime = interval(300).pipe(take(5), debounceTime(1000));
// source : --0--1--2--3--4|
//         debounceTime(1000)
// example: --------------4|
// debounce 运作方式是每次收到元素，他会先把元素cache住并等待一段时间，如果这段时间内已经没有收到任何元素，则把元素送出；
// 如果这段时间内又收到新的元素，然后重新等待1000毫秒，如些重复直到送出元素observable结束

// throttle 跟throttleTime 一个传入observable 一个传入毫秒
const example_thorttleTime = interval(300).pipe(take(5), throttleTime(1000)); // 0 4 complete
// thorttle 会先开放送出的元素，等到有元素被送出就会沉默一段时间，等时间过了又会开放发送元素 
// thorttle 比较像是控制行为的最高频频率

// distinct 把相同功能的值过滤只留一笔
const example_distinct = zip(from(['a', 'b', 'c', 'a', 'b']), interval(300), (x, y) => x).pipe(distinct());
// a b c complete
// source : --a--b--c--a--b|
//             distinct()
// example: --a--b--c------|

// 也可以传入一个callback给distinct
const example_distinct2 = from([{value: 'a'}, {value: 'b'}, {value: 'c'}, {value: 'a'}, {value: 'b'}]).pipe(
    distinct(x => x.value)
);
// {value: "a"} {value: "b"} {value: "c"} complete
// 实际上distinct() 会在背地里建立一个set, 当接收到元素时会先去判断Set内是否有相同的值，如果有就不送出

// distinct flushes(清除 齐平 排挤) 可以传入第二个参数 flushes observable 用来清除暂存资料
const example_distinct_flushes = zip(from(['a', 'b', 'c', 'a', 'c']), interval(300), (x, y) => x).pipe(
    distinct(null, interval(1300))
);
// a b c c complete
// source : --a--b--c--a--c|
// flushes: ------------0---...
//         distinct(null, flushes);
// example: --a--b--c-----c|

// distinctUntilChanged 跟distinct 一样会把相同的元素过滤掉， 但distinctUntilChanged 只会跟最后一次的元素比较，不会每个都比
const example_distinctUntilChanged = zip(from(['a', 'b', 'c', 'c', 'b']), interval(300), (x, y) => x).pipe(
    distinctUntilChanged()
);
// a b c b complete
// source : --a--b--c--c--b|
//             distinctUntilChanged()
// example: --a--b--c-----b|

// cacth 是很常见的非同步错误处理方法， rxjs也用cacthError来处理错误 cacth 可以回传一个obsevrable 来送出新的值
const example_cacthError = zip(from(['a', 'b', 'c', 'd', 2]), interval(500), (x, y) => x).pipe(
    map((x: any) => x.toUpperCase()),
    catchError(error => of ('h')) // 这个是处理错误
    // ,catchError(e => empty()) // 直接结束observable
);
// source : ----a----b----c----d----2|
//         map(x => x.toUpperCase())
//          ----a----b----c----d----X|
//         catch(error => Rx.Observable.of('h'))
// example: ----a----b----c----d----h|

// catchError 的callback 能接收第二个参数， 这个参数会接收当前的observable, 我们可以回传当前的observable 来做到重新执行
const example_cacthError2 = zip(from(['a', 'b', 'c', 'd', 2]), interval(500), (x, y) => x).pipe(
    map((x: any) => x.toUpperCase()),
    catchError((error, obs) => obs)
);
// source : ----a----b----c----d----2|
//         map(x => x.toUpperCase())
//          ----a----b----c----d----X|
//         catch((error, obs) => obs)
// example: ----a----b----c----d--------a----b----c----d--..
// 这里只是一个简单和示范，它会一直无限循环，实务上通常用在断线重连的情境 这人处理有一个简化写方法retry

// retry 重试
const example_retry = zip(from(['a', 'b', 'c', 'd', 2]), interval(500), (x, y) => x).pipe(
    map((x: any) => x.toUpperCase()),
    // retry() // 一直尝试
    retry(1) // 尝试一次
);
// 通常这种无限retry会放在限时同步的重新连接上，让我们在连线断掉后，不断的尝试，这个也可以给定尝试的次数

// retryWhen 他可以把例外发生的元素放到一个observable中，让我们可以直接操作这个observable,并等到这个observable
// 操作完后再重新订阅一次原本的observable
const example_retryWhen = zip(from(['a', 'b', 'c', 'd', 2]), interval(500), (x, y) => x).pipe(
    map((x: any) => x.toUpperCase()),
    retryWhen( errorObs => errorObs.pipe(delay(1000))),
    // 这里我们传入一个callback, 这个callback有一个参数会传入一个observable, 这个observable 不是原本的observable
    // 而是错误事件送出的错误所组成的一个observable, 我们可以对这个错误所组成的observable 做操作，等到这次的处理完成后就会
    // 重新订阅我们原本的observable
    retryWhen( errorObs => errorObs.pipe(map(err => fetch('...'))))
    //  这个可以把每个错误变成api发送
);

// repeat 这个在没有错误的情况下 也能重复订阅
const example_repeat = zip(from(['a', 'b', 'c', 'd']), interval(500), (x, y) => x).pipe(
    repeat(1) // 给定重复次数 没有就一直
);

// 所谓的 Higher Order Observable 就是指一个Observable 送出的元素还是一个Observable, 就像是二维数组一样
// 想要做到这件事有三个方法 switchAll、mergeAll和concatAll
// Observable<Observable<T>>

// concatAll 最重要的重点就是他会处理完前一个observable才会处理下一个observable
const example_concatAll3 = fromEvent(document.body, 'click').pipe(
    map( e => interval(1000)),
    concatAll(),
);
//  当我每点一个一下click事件就会转成一个observable 而这个observable会每一秒送出一个递增的数值，当我们用concatAll之会
// 会把二维的observable 摊平成一个一维的observable, 但concatAll会一个一个处理，一定是等前一个observable完成(complete)
// 才会处理下一个observable, 但现在的第一个永远不会完成，就导致他永远不会处理第二个送出的observable
// 点击 0 1 2 3 4 5 6 7 ...
// click  : ---------c-c------------------c--..
//         map(e => Rx.Observable.interval(1000))
// source : ---------o-o------------------o--..
//                    \ \
//                     \ ----0----1----2----3----4--...
//                      ----0----1----2----3----4--...
//                      concatAll()
// example: ----------------0----1----2----3----4--..

// switch 开关
const example_switch = fromEvent(document.body, 'click').pipe(
    map(e => interval(1000)),
    switchAll()
);
// switchAll 最重要的就是他会在新的observable送出后直接处理新的observable不管前一个observable是否完成，
// 每当有新的observable送出就会直接把旧的observable退订(unsubscribe), 永远只处理最新的observable
// click  : ---------c-c------------------c--..
//         map(e => Rx.Observable.interval(1000))
// source : ---------o-o------------------o--..
//                    \ \                  \----0----1--...
//                     \ ----0----1----2----3----4--...
//                      ----0----1----2----3----4--...
//                      switch()
// example: -----------------0----1----2--------0----1--...

// mergeAll merge可以让多个observable 同时送出，mergeAll也是同样的，它会把二维的转observable 转成一维的
// 并且能同时处理所有的observable
const example_merageAll = fromEvent(document.body, 'click').pipe(
    map(e => interval(1000)),
    mergeAll(),
);
// click  : ---------c-c------------------c--..
//         map(e => Rx.Observable.interval(1000))
// source : ---------o-o------------------o--..
//                    \ \                  \----0----1--...
//                     \ ----0----1----2----3----4--...
//                      ----0----1----2----3----4--...
//                      switch()
// example: ----------------00---11---22---33---(04)4--...

const example_merageAll2 = fromEvent(document.body, 'click').pipe(
    map(e => interval(1000)),
    mergeAll(2),
    // mergeAll 可以传入一个数值 代表它可以同时处理observable的数量 以这个例子传入2 前面两个observable可以被并行处理
    // 但第三个要等到第一个observable 结束后，才会开始
    // 如果我们传入的参数为1其行为就会跟concatAll是一模一样的
);
// click  : ---------c-c----------o----------..
//         map(e => Rx.Observable.interval(1000))
// source : ---------o-o----------c----------..
//                    \ \          \----0----1----2|
//                     \ ----0----1----2|
//                      ----0----1----2|
//                      mergeAll(2)
// example: ----------------00---11---22---0----1----2--..

// concatMap 其实就map 加上concatAll 的简化写法
const example_concatMap = fromEvent(document.body, 'click').pipe(
    concatMap(e => interval(1000).pipe(take(3))),
    );
// concatMap 也会先处理前一个送出的observable 在处理下一个observable
function getPostData() {
    return fetch('https://jsonplaceholder.typicode.com/posts/1')
    .then(res => res.json);
}
// 发送request请求
const example_concatMap2 = fromEvent(document.body, 'click)').pipe(
    concatMap( e => from(getPostData()),
    (e, res, eIndex, resIndex) => res
    )
);
// concatMap 第二个参数 是一个可选的回调 这个callback会传入四人参数 1 外部observable送出的元素
// 2 内部observable送出的元素 3 外部observable 送出的index 4 内部observable 送出元素的index

// switchMap 其实就是map加上switchAll简写
const example_switchMap = fromEvent(document.body, 'click').pipe(
    switchMap(e => interval(1000).pipe(take(6))),
);
// switchMap 会在下一个observable被送出后直接退订前一个未处理完的observable
// switchMap 跟concatMap 一样有第二个参数selector callback 可用来回传我们要的值  跟concatMap一样

// mergeMap 其实就是mergeAll 加上 map
const example_mergeMap = fromEvent(document.body, 'click').pipe(
    mergeMap( e => from(getPostData())),
);
// mergeMap 也能传入第二个参数selector callback 跟concatMap 也是一样的
// mergeMap 重点是第三个参数，来限制并行处理的数量

// window 是一整个家族 windowCount  windowTime windowToggle windowWhen
// window 很类似buffer 可以把一段时间内送出的元素拆出来，只是buffer 是把元素拆分到数组中去
// 而window 则是把元素拆分出来放到的observable变成observable<obsrvable<T>>
export const example_window =  interval(1000).pipe(window(fromEvent(document.body, 'click')),
//  switchAll()
 );
// click  : -----------c----------c------------c--
// source : ----0----1----2----3----4----5----6---..
//                     window(click)
// example: o----------o----------o------------o--
//          \          \          \
//           ---0----1-|--2----3--|-4----5----6|
//                     switch()
//        : ----0----1----2----3----4----5----6---...

//
export const example_window_cont = fromEvent(document, 'click').pipe(window(interval(1000)),
    // map(innerObservable => innerObservable)
    // count(),
    switchAll(),
);


// group By, 它可以把相同条件的元素拆分成一个observable, 跟平时在 SQL 是一个样个概念
const example_group = interval(1000).pipe(take(5), groupBy(x => x % 2));
// source : ---0---1---2---3---4|
//              groupBy(x => x % 2)
// example: ---o---o------------|
//             \   \
//             \   1-------3----|
//             0-------2-------4|

const peoples = [
    {name: 'Anna', score: 100, subject: 'English'},
    {name: 'Anna', score: 90, subject: 'Math'},
    {name: 'Anna', score: 96, subject: 'Chinese' },
    {name: 'Jerry', score: 80, subject: 'English'},
    {name: 'Jerry', score: 100, subject: 'Math'},
    {name: 'Jerry', score: 90, subject: 'Chinese' },
];
const example_groupBy = from(peoples).pipe(groupBy(person => person.name),
 map(group => group.pipe(reduce((acc, curr) => ({name: curr.name,
     score: curr.score + acc.score})
     ))),
 mergeAll(),
 );
//  source : --o--o--o--o--o--o|

//   groupBy(person => person.name)

//        : --i--------i------|
//            \        \
//            \         o--o--o|
//             o--o--o--|

// 	   map(group => group.reduce(...))

//        : --i---------i------|
//            \         \
//            o|        o|

//              mergeAll()
// example: --o---------o------|

// subject
const example_source_subject_ob = interval(1000).pipe(take(3));
const observerA = {
    next: value => console.log(`A next ${value}`),
    error: error => console.log(`A error ${error}`),
    complete: () => console.log('A complete'),
};
const observerB = {
    next: value => console.log(`B next ${value}`),
    error: error => console.log(`B error ${error}`),
    complete: () => console.log('B complete'),
};

// 自已实现subject
const subject = {
    observers: [],
    addObserver: function(observer) {
        this.observers.push(observer);
    },
    subscribe: function(observer) { // 这里把addObserver 更名为subscribe 好rx的subject一样名字
        this.observers.push(observer);
    },
    next: function(value) {
        this.observers.forEach(o => o.next(value));
    },
    error: function(error) {
        this.observers.forEach(o => o.error(error));
    },
    complete: function() {
        this.observers.forEach(o => o.complete());
    },
};
subject.addObserver(observerA);
example_window_cont.subscribe(subject);
setTimeout(() => {
    subject.addObserver(observerB);
}, 1000);
// "A next: 0"
// "A next: 1"
// "B next: 1"
// "A next: 2"
// "B next: 2"
// "A complete!"
// "B complete!"

const subject_rx = new Subject(); // 调用rx自已的subject
subject_rx.subscribe(observerA);
example_window_cont.subscribe(subject_rx);
setTimeout(() => {
    subject_rx.subscribe(observerB);
}, 1000);
// 这个运行结果和上面是一样的

// Subject 可以拿去订阅Observable(source) 代表他是一个observer, 同时Subject又可以被 Observer(A, B)订阅
// 代表它是一个Observable  Subject 同时是Observable 又是Observer Subject 会对内部observers 清单进行组播(multicast);

// 这里我们也可以不用订阅Observable 自已给订阅者传值
subject_rx.subscribe(observerA);
subject_rx.subscribe(observerB);
subject_rx.next(1);
// "A next: 1"
// "B next: 1"
subject_rx.next(2);
// A next: 2
// B next: 2

// 这里 extend React.Component 没有安装就不引入了
class MyButton {
    state;
    subject;
    constructor(prop) {
        this.state = {count: 0};
        this.subject = new Subject();

        this.subject.pipe(mapTo(1), scan((origin: number, next) => origin + next))
        .subscribe(x => { this.state.count = x; });
    }

    render() {
        // return `<button onClick=`;
    }
}

// subject 不能得到过去的
subject_rx.subscribe(observerA); // A 订阅 subject
subject_rx.next(3); // subject 发送一个
// A next:3
setTimeout(() => {
    subject_rx.subscribe(observerB); // 三秒后B 订阅subject 并不会得到值
}, 3000);

// 如果我们希望在订阅后就收到最的状态，而不是订阅后要等到变动才能接收新的状态 就可以用BehaviorSubject
// BehaviorSubject 跟Subject 最大的不同在于 BehaviorSubject 是用来呈现当前的值，而不是单纯发送事件。
// BehaviorSubject 会记住最新一次发送的元素，并把该元素当作当前值
// 在使用BehaviorSubject 建构式需要传入一个参数来代表起始的状态
const behaviorSubject = new BehaviorSubject(0);
behaviorSubject.subscribe(observerA);
// A next:0  在A 订阅behaviorSubject之后马上会得一个初始值0
behaviorSubject.next(1);
// A next:1
setTimeout(() => {
    behaviorSubject.subscribe(observerB);
    // B next: 1 B在订阅后会立马得到最新值1
}, 3000);


// 在某得时候我们希望Subject 代表事件，但又能在新订阅时重新发送最后的几个元素，这时我们就可以用ReplaySubject
const replaySubjct = new ReplaySubject(2); // 发送最后两个元素就是最近的两个状态
replaySubjct.subscribe(observerA);
replaySubjct.next(1);
// A next: 1
replaySubjct.next(2);
// A next: 2
replaySubjct.next(3);
//  A next: 3
setTimeout(() => {
    replaySubjct.subscribe(observerB);
    // B next: 2
    // B next: 3
}, 1000);
// 这里注意 replaySubject 是没有初使值的

// AsyncSubjct 是取怪的一个变形，它有点像operator last, 会在subject 结束时送出最后一个值
const asyncSubjct = new AsyncSubject();
asyncSubjct.subscribe(observerA);
asyncSubjct.next(1);
asyncSubjct.next(2);
asyncSubjct.next(3);
asyncSubjct.complete();
// A next: 3
// A complete
setTimeout(() => {
    asyncSubjct.subscribe(observerB);
    // B next: 3
    // B complete
}, 1000);
