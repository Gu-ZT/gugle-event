export declare class EventManager {
    private readonly parent;
    private readonly eventListeners;
    constructor(parent?: EventManager | null);
    listen(event: string, callback: (...args: any) => void, namespace?: string, priority?: number, cancelable?: boolean): void;
    subscribe(event: string, namespace?: string, priority?: number, cancelable?: boolean): (callback: (...args: any) => void) => void;
    post(event: string, ...args: any): Promise<any>;
    remove(namespace: string): void;
}
