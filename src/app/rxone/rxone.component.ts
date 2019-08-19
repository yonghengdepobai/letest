import { Component, OnInit, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { Subject, Observable, fromEvent, of, concat, Subscription } from 'rxjs';
import { scan, throttle, throttleTime, map, takeUntil, concatAll, zip, filter,
   withLatestFrom, delay, debounceTime, switchMap } from 'rxjs/operators';

import { example_window, example_window_cont } from './rxfun';


@Component({
  selector: 'app-rxone',
  templateUrl: './rxone.component.html',
  styleUrls: ['./rxone.component.scss']
})
export class RxoneComponent implements OnInit, AfterViewInit {
  subscription: Subscription;
  imgMoveSubscription: Array<Subscription> = [];

  // viewchild viewchildren 装饰器 获取模板视图的元素
  /**
    视图查询在ngAfterviewInit钩子函数调用前完成 
   */

  constructor(private el: ElementRef,
    private render2: Renderer2,
    ) {
      // el.nativeElement;
  }

  count = 0;
  rate = 1000;
  lastClick = Date.now() - 1000;

  ngOnInit() {
    this.testRXFun();
  }

  ngAfterViewInit(): void {
    this.addEmitter();
    this.async_read(this.print_msg); // 一个回调
    this.dragInit();
    this.videoInit();
    // this.imgInit();
  }

  addEmitter() {
    const but: Element = this.el.nativeElement.querySelector('.butTest');
    const a = but && but.addEventListener('click', (e) => {
      this.count++;
      this.testRXFun();
        if (Date.now() - this.lastClick > this.rate) {
          console.log('testBut', e, this.count);
          this.lastClick = Date.now();
        }
    });

    const b = but && fromEvent(but, 'click').pipe(throttleTime(1000)).subscribe((e) => {
      console.log('rx===', e);
    });

  }

  /** 拖拉初始化 */
  dragInit() {
    const dragDom: HTMLElement = this.el.nativeElement.querySelector('#drag');
    // const body: HTMLElement = this.render2.parentNode('body');
    // const body: HTMLElement = this.el.nativeElement.querySelector('body');
    const body: HTMLElement = document.body;
    const mouseDown = fromEvent(dragDom, 'mousedown');
    const mouseUp = fromEvent(body, 'mouseup');
    const mouseMove = fromEvent(body, 'mousemove');

    const source = mouseDown.pipe(map((event) => mouseMove.pipe(takeUntil(mouseUp))),
     concatAll(),

     map((m: any) => {
       return {x: m.clientX, y: m.clientY};
     })
     ).subscribe((pos) => {
       this.render2.setStyle(dragDom, 'left', pos.x + 'px');
       this.render2.setStyle(dragDom, 'top', pos.y + 'px');
     });

  }

  /** 视频悬浮 */
  videoInit() {
    const video: HTMLElement = this.el.nativeElement.querySelector('#video');
    const anchor: HTMLElement = this.el.nativeElement.querySelector('#anchor');

    const scroll = fromEvent(document, 'scroll');
    scroll.pipe(map(e => {
      return anchor.getBoundingClientRect().bottom < 0;
    })).subscribe(bool => {
        if (bool) {
          this.render2.addClass(video, 'video-fixed');
          // video.classList.add('video-fixed');
        } else {
          this.render2.removeClass(video, 'video-fixed');
          // video.classList.remove('video-fixed');
        }
    });

    const mouseDown = fromEvent(video, 'mousedown');
    const mouseUp = fromEvent(document, 'mouseup');
    const mouseMove = fromEvent(document, 'mousemove');
    /** 工具函数 保证值在范围内 */
    const validValue  = (value, max, min) => {
      return Math.min(Math.max(value, min), max);
    };
    mouseDown.pipe(filter(e => video.classList.contains('video-fixed')),
    map(e => mouseMove.pipe(takeUntil(mouseUp))), concatAll(),
    withLatestFrom(mouseDown, (move: any, down: any) => {
      return {
        // offsetX, offsetY 发生事件的地点在事件源元素的坐标系统中的x坐标和y坐标
        // clientX 返回当事件被触发时，鼠标指针的水平坐标
        x: validValue(move.clientX - down.offsetX, window.innerWidth - 320, 0),
        y: validValue(move.clientY - down.offsetY, window.innerHeight - 180, 0)
          };
    })
    // map((m: any) => {
    //   return {x: m.clientX, y: m.clientY};
    // })
    )
    .subscribe(
      pos => {
        this.render2.setStyle(video, 'top', pos.y + 'px');
        this.render2.setStyle(video, 'left', pos.x + 'px');
      }
    );

  }


  /** 图片初始化 */
  imgInitMove(e: Event) {
    e.stopPropagation();
    const imgList = this.el.nativeElement.querySelectorAll('img');
    const movePos = fromEvent(document, 'mousemove').pipe(
      map((e: any) =>  {
        return {x: e.clientX, y: e.clientY};
      })
    );
    const followMouse = (DOMArr) => {
      const delayTime = 600;
      DOMArr.forEach((item, index) => {
        // Math.pow(x, y) x的y次幂 Math.cos 余弦值
        this.imgMoveSubscription[index] = movePos.pipe(delay(delayTime * (Math.pow(0.65, index) + Math.cos(index / 4)) / 2)).subscribe(
          pos => {
            this.render2.setStyle(item, 'transform', `translate3d(${pos.x}px, ${pos.y}px, 0)`);
          }
        );
      });
    };
    followMouse(Array.from(imgList));
  }
  imgStopMove(e) {
    this.imgMoveSubscription.forEach(item => item.unsubscribe());
  }

  /** 输入框获取文件 */
  inputInt() {
    const input: HTMLElement = this.el.nativeElement.querySelector('#searchInput');
    const spanValue: HTMLElement = this.el.nativeElement.querySelector('#theRequestValue');

    fromEvent(input, 'input').pipe(
      debounceTime(300),
      map( (e: any) =>  e.target.value)
    ).subscribe(value => {
      spanValue.textContent = value;
    });

  }

  /** 首先我们会有一个搜寻框(input#search)，当我们在上面打字并停顿超过100 毫秒就发送HTTP Request
   *  来取得建议选项并显示在收寻框下方(ul#suggest-list)，如果使用者在前一次发送的请求还没有回来就打了下一个字，
   * 此时前一个发送的请求就要舍弃掉，当建议选项显示之后可以用滑鼠点击取建议选项代搜寻框的文字。 */
  selectInputInit() {
    const searchInp: HTMLElement = this.el.nativeElement.querySelector('#search');
    const suggestList: HTMLElement = this.el.nativeElement.querySelector('#suggest-list');
    const keyword = fromEvent(searchInp, 'input');
    const selectItem = fromEvent(suggestList, 'click');
    const getSuggestList = (value) => {
      return fetch('');
    };
    const render = (suggestArr = []) => {
      suggestList.innerHTML = suggestArr
                              .map( item => `<li>${item}</li>`)
                              .join('');
    };

    keyword.pipe(switchMap(e => getSuggestList(e.target['value']),
     (e, res) => res[1] ))
    .subscribe(list => render(list));


  }

  testRxfun(e: Event) {
    e.stopPropagation();
    let observable: Observable<any> = example_window;
    observable = example_window_cont;
    this.subscription = observable.subscribe(
      console.log
    );
  }
  stopObservable(e) {
    this.subscription.unsubscribe();
  }


  print_msg(msg) {
    console.log(msg);
  }

  async_read(callback) {
    callback('asdfdf');
  }

  testRXFun() {
    const ob1: Observable<string> = Observable.create(observer => {
      setTimeout(() => {
        console.log('xxxxxxxx');
        observer.next('ob1');
      }, 8000);
    });

    const ob2:Observable<string> = Observable.create(observer => {
      setTimeout(() => {
        console.log('zzzzzzzzzz');
        observer.next('ob2');
      }, 800);
    });

    const test_of = of(ob1, ob2); //
    // test_of.subscribe({
    //   next: value => {
    //     value.subscribe(values => {
    //       // console.log(value);
    //     });
    //   }
    // });

    const concats = concat(ob1, ob2, (x, y) => {
      console.log(x, y);
      return {x, y};
    });
    // const example_concatAll =
    // concats.subscribe(value => {
    //   console.log(value);
    // });

    // const test_zip = zip(ob1, ob2, (x, y) => {
    //   return {x, y};
    // });
    const test_zip2 = ob1.pipe(zip(ob2, (x, y) => {
      return {x, y};
    }));
    test_zip2.subscribe(value => {
      console.log(value);
    });

  }



}
