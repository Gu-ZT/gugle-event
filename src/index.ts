class EventListener {
  private readonly namespace: string;
  private readonly callback: (...args: any) => void;
  private readonly priority: number;
  private readonly cancelable: boolean;

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

  public getNamespace(): string {
    return this.namespace;
  }

  public getPriority(): number {
    return this.priority;
  }

  public isCancelable(): boolean {
    return this.cancelable;
  }

  public call(...args: any[]): void {
    this.callback(...args);
  }

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

export class EventManager {
  private readonly parent: EventManager | null;
  private readonly eventListeners: Map<string, EventListener[]> = new Map<string, EventListener[]>();

  public constructor(parent: EventManager | null = null) {
    this.parent = parent;
  }

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

  public subscribe(
    event: string,
    namespace: string = 'gugle-event',
    priority: number = 100,
    cancelable: boolean = false
  ) {
    const self = this;
    return function (callback: (...args: any) => void) {
      self.listen(event, callback, namespace, priority, cancelable);
    };
  }

  public async post(event: string, ...args: any): Promise<any> {
    const listeners: EventListener[] | undefined = this.eventListeners.get(event);
    if (listeners)
      for (let listener of listeners) {
        listener.call(...args);
      }
    return args;
  }

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
