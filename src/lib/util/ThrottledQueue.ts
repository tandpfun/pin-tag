import timers from 'node:timers';

export const defer = <T = unknown>(): [
  Promise<T>,
  (arg0?: T) => void,
  (arg0?: unknown) => void
] => {
  let resolve!: (arg0?: T) => void;
  let reject!: (arg0?: unknown) => void;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve as typeof resolve;
    reject = _reject as typeof reject;
  });

  return [promise, resolve, reject];
};

export type ThrottledQueueHandleFn<Data> = (
  data: Data
) => unknown | Promise<unknown>;

export interface ThrottledQueueOptions<Data> {
  timeout?: number;
  handler?: ThrottledQueueHandleFn<Data>;
}

export class ThrottledQueue<Data> {
  #buf: { val: Data; promise: Promise<unknown>; resolve: () => void }[] = [];
  #timer?: NodeJS.Timeout;

  readonly cb?: (arg0: Data) => void;

  private options: ThrottledQueueOptions<Data>;

  constructor(options: ThrottledQueueOptions<Data> = {}) {
    const defaultOptions: ThrottledQueueOptions<Data> = {
      timeout: 500,
      handler: undefined,
    };

    const opts: ThrottledQueueOptions<Data> = {
      ...defaultOptions,
      ...options,
    };

    this.options = opts;
  }

  setHandler(f: ThrottledQueueHandleFn<Data>) {
    this.options.handler = f;
    return this;
  }

  setTimeout(t: number) {
    this.options.timeout = t;
  }

  push(val: Data) {
    const [promise, resolve] = defer();
    this.#buf.push({ val, promise, resolve });
    if (!this.#timer) {
      this.#flush();
    }

    return promise;
  }

  #flush() {
    if (!this.#buf.length) {
      this.#timer = undefined;
      return;
    }

    const val = this.#buf.shift()!;
    this.options.handler?.(val.val);
    val.resolve();

    this.#timer = timers.setTimeout(() => this.#flush(), this.options.timeout!);
  }

  empty() {
    return !this.#buf.length;
  }

  peek() {
    return this.#buf[0];
  }

  size() {
    return this.#buf.length;
  }
}
