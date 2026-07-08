interface EventTarget {
  value: string;
  checked: boolean;
}

interface Event<T = EventTarget> {
  target: T;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: any;
      button: any;
      input: any;
      form: any;
      img: any;
      main: any;
      header: any;
      nav: any;
      a: any;
      h1: any;
      h2: any;
      h3: any;
      h4: any;
      p: any;
      span: any;
      label: any;
      table: any;
      thead: any;
      tbody: any;
      tr: any;
      th: any;
      td: any;
      dl: any;
      dt: any;
      dd: any;
      ul: any;
      li: any;
      time: any;
    }
  }
}
