/**
 * 可取消事件类，用于处理可以被取消的事件或操作
 */
export class Cancelable {
  // 事件名称，用于标识具体的事件类型
  private readonly event: string;

  // 是否已取消标志，初始值为false表示未取消
  private canceled: boolean = false;

  /**
   * 构造函数，用于创建一个可取消事件实例
   * @param event 事件名称，用于标识该事件
   */
  constructor(event: string) {
    this.event = event;
  }

  /**
   * 取消事件
   */
  public cancel() {
    this.canceled = true;
  }

  /**
   * 判断事件是否被取消
   * @returns {boolean} 如果事件被取消，返回true；否则返回false
   */
  public isCanceled(): boolean {
    return this.canceled;
  }

  /**
   * 获取事件的名称
   * @returns {string} 事件的名称
   */
  public getEvent(): string {
    return this.event;
  }
}

/**
 * 事件监听器类
 * 用于封装事件的命名空间、回调函数、优先级和是否可取消，并提供比较和调用回调的方法
 */
class EventListener {
  // 事件命名空间，用于标识事件的唯一性
  private readonly namespace: string;
  // 回调函数，当事件触发时执行
  private readonly callback: (...args: any) => void;
  // 事件优先级，用于决定事件处理的顺序
  private readonly priority: number;
  // 标识事件是否可取消，如果为true，则事件可以被取消
  private readonly cancelable: boolean;

  /**
   * 构造函数，用于创建一个事件监听器实例
   * @param namespace {string} 事件的命名空间
   * @param callback {(...args: any) => void} 事件触发时的回调函数
   * @param priority {number} 事件的优先级，默认为100
   * @param cancelable {boolean} 事件是否可取消，默认为false
   */
  constructor(
    namespace: string,
    callback: (...args: any) => void,
    priority: number = 100,
    cancelable: boolean = false
  ) {
    this.namespace = namespace;
    this.callback = callback;
    this.priority = priority;
    this.cancelable = cancelable;
  }

  /**
   * 获取事件的命名空间
   * @returns {string} 事件的命名空间
   */
  public getNamespace(): string {
    return this.namespace;
  }

  /**
   * 获取事件的优先级
   * @returns {number} 事件的优先级
   */
  public getPriority(): number {
    return this.priority;
  }

  /**
   * 判断事件是否可取消
   * @returns {boolean} 如果事件可取消，返回true；否则返回false
   */
  public isCancelable(): boolean {
    return this.cancelable;
  }

  /**
   * 调用回调函数
   * @param args {...args: any} 回调函数的参数
   */
  public call(...args: any[]) {
    this.callback(...args);
  }

  /**
   * 静态方法，用于比较两个EventListener实例的优先级和可取消性
   * 优先级数字越小，优先级越高；如果优先级相同，可取消的事件优先级低于不可取消的事件
   * @param a {EventListener} 第一个EventListener实例
   * @param b {EventListener} 第二个EventListener实例
   * @returns {number} 如果a的优先级高于b，则返回负数；如果a的优先级低于b，则返回正数；如果优先级相同，则根据可取消性决定返回值
   */
  public static compare(a: EventListener, b: EventListener): number {
    const priorityA = a.getPriority();
    const priorityB = b.getPriority();
    if (priorityA == priorityB) {
      if (a.isCancelable()) return -1;
      if (b.isCancelable()) return 1;
    }
    return priorityA - priorityB;
  }
}

/**
 * 事件管理器类，用于处理事件的监听、发布和管理
 */
export class EventManager {
  // 父事件管理器，用于支持事件的级联
  private readonly parent: EventManager | null;
  // 存储事件监听器的映射，键为事件名，值为该事件的监听器数组
  private readonly eventListeners: Map<string, EventListener[]> = new Map<string, EventListener[]>();

  /**
   * 构造函数，创建一个事件管理器实例
   * @param parent {EventManager} 父事件管理器，默认为null，用于支持事件的级联
   */
  public constructor(parent: EventManager | null = null) {
    this.parent = parent;
  }

  /**
   * 注册一个事件监听器
   * @param event {string} 事件名称
   * @param callback {(...args: any) => void} 事件回调函数
   * @param namespace {string} 命名空间，用于组织事件监听器
   * @param priority {number} 优先级，决定事件回调的执行顺序
   * @param cancelable {boolean} 是否可取消，决定是否可以取消事件，为 true 时，处理器第一个参数会传入 {@link Cancelable}
   */
  public listen(
    event: string,
    callback: (...args: any) => void,
    namespace: string = 'gugle-event',
    priority: number = 100,
    cancelable: boolean = false
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    const listeners: any[] | undefined = this.eventListeners.get(event);
    if (listeners) {
      listeners.push(new EventListener(namespace, callback, priority, cancelable));
      listeners.sort(EventListener.compare);
    }
    if (this.parent) this.parent.listen(event, callback, namespace, priority, cancelable);
  }

  /**
   * 订阅一个事件，返回一个函数，该函数用于添加事件回调
   * @param event {string} 事件名称
   * @param namespace {string} 命名空间，用于组织事件监听器
   * @param priority {number} 优先级，决定事件回调的执行顺序
   * @param cancelable {boolean} 是否可取消，决定是否可以取消事件，为 true 时，处理器第一个参数会传入 {@link Cancelable}
   * @returns {(callback: (...args: any) => void) => void} 一个函数，接受事件回调并注册该回调到指定事件
   */
  public subscribe(
    event: string,
    namespace: string = 'gugle-event',
    priority: number = 100,
    cancelable: boolean = false
  ): (callback: (...args: any) => void) => void {
    const self = this;
    return function (callback: (...args: any) => void) {
      self.listen(event, callback, namespace, priority, cancelable);
    };
  }

  /**
   * 发布一个事件，触发该事件的所有监听器
   * @param event {string} 事件名称
   * @param args {...args: any} 传递给事件回调的参数
   * @returns {any} 事件回调的返回值（如果有）
   */
  public async post(event: string, ...args: any): Promise<any> {
    const cancelable = new Cancelable(event);
    const listeners: EventListener[] | undefined = this.eventListeners.get(event);
    if (listeners)
      for (let listener of listeners) {
        if (listener.isCancelable()) {
          listener.call(cancelable, ...args);
        } else {
          listener.call(...args);
        }
        if (cancelable.isCanceled()) {
          return Promise.reject('Event canceled!');
        }
      }
    return args;
  }

  /**
   * 移除指定命名空间下的所有事件监听器
   * @param namespace {string} 要移除的命名空间
   */
  public remove(namespace: string) {
    for (let key in this.eventListeners) {
      const listeners: EventListener[] = [];
      for (let listener of this.eventListeners.get(key)!) {
        if (listener.getNamespace() !== namespace) listeners.push(listener);
      }
      if (listeners.length > 0) this.eventListeners.set(key, listeners);
      else this.eventListeners.delete(key);
    }
  }
}
