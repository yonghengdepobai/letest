import { Component, OnInit, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { Subject, Observable, fromEvent, of, concat } from 'rxjs';
import { scan, throttle, throttleTime, map, takeUntil, concatAll, zip, filter, withLatestFrom } from 'rxjs/operators';


@Component({
  selector: 'app-rxone',
  templateUrl: './rxone.component.html',
  styleUrls: ['./rxone.component.scss']
})
export class RxoneComponent implements OnInit, AfterViewInit {

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
    mouseDown.pipe(filter(e => video.classList.contains('video-fixed')),
    map(e => mouseMove.pipe(takeUntil(mouseUp))), concatAll(),
    withLatestFrom(mouseDown, (move: any, down: any) => {
      return {
        x: move.clientX - down.offsetX,
        y: move.clientY - down.offsetY
    }
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
