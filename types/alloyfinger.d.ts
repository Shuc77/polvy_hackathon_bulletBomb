declare module 'alloyfinger' {
  export default class AlloyFinger {
    constructor($el: HTMLElement, options: AlloyFingerOption);
  }
}

interface AlloyFingerOption {
  pressMove: (evt: TouchEvent & WheelEvent) => void;
}

declare interface AlloyFingerTransformHTMLElement extends HTMLElement {
  translateY: number;
  translateX: number;
}
