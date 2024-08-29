"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventManager = void 0;
var EventListener = /** @class */ (function () {
    function EventListener(namespace, callback, priority, cancelable) {
        if (priority === void 0) { priority = 100; }
        if (cancelable === void 0) { cancelable = false; }
        this.namespace = namespace;
        this.callback = callback;
        this.priority = priority;
        this.cancelable = cancelable;
    }
    EventListener.prototype.getNamespace = function () {
        return this.namespace;
    };
    EventListener.prototype.getPriority = function () {
        return this.priority;
    };
    EventListener.prototype.isCancelable = function () {
        return this.cancelable;
    };
    EventListener.prototype.call = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.callback.apply(this, args);
    };
    EventListener.compare = function (a, b) {
        var priorityA = a.getPriority();
        var priorityB = b.getPriority();
        if (priorityA == priorityB) {
            if (a.isCancelable())
                return -1;
            if (b.isCancelable())
                return 1;
        }
        return priorityA - priorityB;
    };
    return EventListener;
}());
var EventManager = /** @class */ (function () {
    function EventManager(parent) {
        if (parent === void 0) { parent = null; }
        this.eventListeners = new Map();
        this.parent = parent;
    }
    EventManager.prototype.listen = function (event, callback, namespace, priority, cancelable) {
        if (namespace === void 0) { namespace = 'gugle-event'; }
        if (priority === void 0) { priority = 100; }
        if (cancelable === void 0) { cancelable = false; }
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        var listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.push(new EventListener(namespace, callback, priority, cancelable));
            listeners.sort(EventListener.compare);
        }
        if (this.parent)
            this.parent.listen(event, callback, namespace, priority, cancelable);
    };
    EventManager.prototype.subscribe = function (event, namespace, priority, cancelable) {
        if (namespace === void 0) { namespace = 'gugle-event'; }
        if (priority === void 0) { priority = 100; }
        if (cancelable === void 0) { cancelable = false; }
        var self = this;
        return function (callback) {
            self.listen(event, callback, namespace, priority, cancelable);
        };
    };
    EventManager.prototype.post = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var listeners, _a, listeners_1, listener;
            return __generator(this, function (_b) {
                listeners = this.eventListeners.get(event);
                if (listeners)
                    for (_a = 0, listeners_1 = listeners; _a < listeners_1.length; _a++) {
                        listener = listeners_1[_a];
                        listener.call.apply(listener, args);
                    }
                return [2 /*return*/, args];
            });
        });
    };
    EventManager.prototype.remove = function (namespace) {
        for (var key in this.eventListeners) {
            var listeners = [];
            for (var _i = 0, _a = this.eventListeners.get(key); _i < _a.length; _i++) {
                var listener = _a[_i];
                if (listener.getNamespace() !== namespace)
                    listeners.push(listener);
            }
            if (listeners.length > 0)
                this.eventListeners.set(key, listeners);
            else
                this.eventListeners.delete(key);
        }
    };
    return EventManager;
}());
exports.EventManager = EventManager;
