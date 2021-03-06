(function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    var LIFECYCLE_HOOKS = [
        'beforeCreate',
        'created',
        'beforeMount',
        'mounted',
        'beforeUpdate',
        'updated',
        'beforeDestroy',
        'destroyed',
        'activated',
        'deactivated',
        'errorCaptured',
        'serverPrefetch'
    ];
    var ASSET_TYPES = [
        'component',
    ];

    function isPrimitive(s) {
        return typeof s === 'string' || typeof s === 'number';
    }
    function isDef(c) {
        return c !== undefined && c !== null;
    }
    function isObject(value) {
        return value !== null && typeof value === 'object';
    }
    function isPromise(val) {
        return (isDef(val) &&
            typeof val.then === 'function' &&
            typeof val.catch === 'function');
    }
    function isPlainObject(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    }

    function remove(arr, item) {
        if (arr.length) {
            var index = arr.indexOf(item);
            if (index > -1) {
                arr.splice(index, 1);
            }
        }
    }
    function noop() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
    }
    var camelizeRE = /-(\w)/g;
    var camelize = function (str) {
        return str.replace(camelizeRE, function (_, c) { return (c ? c.toUpperCase() : ''); });
    };
    var hyphenateRE = /\B([A-Z])/g;
    var hyphenate = function (str) {
        return str.replace(hyphenateRE, '-$1').toLowerCase();
    };
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var hasOwn = function (val, key) { return hasOwnProperty.call(val, key); };
    var extend = function (a, b) {
        for (var key in b) {
            a[key] = b[key];
        }
        return a;
    };
    function toObject(arr) {
        var res = {};
        for (var i = 0; i < arr.length; i++) {
            if (arr[i]) {
                extend(res, arr[i]);
            }
        }
        return res;
    }
    function cached(fn) {
        var cache = Object.create(null);
        return function cachedFn(str) {
            var hit = cache[str];
            return hit || (cache[str] = fn(str));
        };
    }
    var inBrowser = typeof window !== 'undefined';
    function deepset(target, key, value) {
        var segments = key.split('.');
        if (segments.length === 1) {
            target[key] = value;
            return;
        }
        for (var i = 0; i < segments.length - 1; i++) {
            if (!target)
                return;
            target = target[segments[i]];
        }
        target && (target[segments[segments.length - 1]] = value);
    }

    /**
     * 检查是否以_或$开头
     */
    function isReserved(str) {
        var c = (str + '').charCodeAt(0);
        return c === 0x24 || c === 0x5F;
    }
    function def(obj, key, val, enumerable) {
        Object.defineProperty(obj, key, {
            value: val,
            enumerable: !!enumerable,
            writable: true,
            configurable: true
        });
    }
    var __DEV__ = "development" !== 'production';
    var HTMLTag = [
        'html', 'body', 'base',
        'head', 'link', 'meta',
        'style', 'title', 'address',
        'article', 'aside', 'footer',
        'header', 'h1', 'h2',
        'h3', 'h4', 'h5',
        'h6', 'hgroup', 'nav',
        'section', 'div', 'dd',
        'dl', 'dt', 'figcaption',
        'figure', 'picture', 'hr',
        'img', 'li', 'main',
        'ol', 'p', 'pre',
        'ul', 'blockquote', 'iframe', 'tfoot',
        'a', 'b', 'abbr', 'bdi', 'bdo',
        'br', 'cite', 'code', 'data', 'dfn',
        'em', 'i', 'kbd', 'mark', 'q',
        'rp', 'rt', 'rtc', 'ruby', 's',
        'samp', 'small', 'span', 'strong', 'sub',
        'sup', 'time', 'u', 'var', 'wbr',
        'area', 'audio', 'map', 'track', 'video',
        'embed', 'object', 'param', 'source', 'canvas',
        'script', 'noscript', 'del', 'ins', 'caption',
        'col', 'colgroup', 'table', 'thead', 'tbody',
        'td', 'th', 'tr', 'button', 'datalist',
        'fieldset', 'form', 'input', 'label', 'legend',
        'meter', 'optgroup', 'option', 'output', 'progress',
        'select', 'textarea', 'details', 'dialog', 'menu',
        'menuitem', 'summary', 'content', 'element', 'shadow',
        'template'
    ];
    var isHTMLTag = function (tag) {
        return HTMLTag.indexOf(tag) > -1;
    };
    function query(el) {
        if (typeof el === 'string') {
            var selected = document.querySelector(el);
            if (!selected) {
                 console.warn('Cannot find element: ' + el);
                return document.createElement('div');
            }
            return selected;
        }
        else {
            return el;
        }
    }

    var uid = 0;
    var Dep = /** @class */ (function () {
        function Dep() {
            this.id = ++uid;
            this.subs = [];
        }
        Dep.prototype.addSub = function (sub) {
            this.subs.push(sub);
        };
        Dep.prototype.removeSub = function (sub) {
            remove(this.subs, sub);
        };
        /**
         * 将自身(Dep)添加到Watcher的deps
         *
         * */
        // TODO
        Dep.prototype.depend = function () {
            if (Dep.target) {
                Dep.target.addDep(this);
            }
        };
        /**
         * 依赖的对象发生了变化，通知依赖进行更新
         * 遍历Watcher实例数组，调用update方法
         * */
        Dep.prototype.notify = function () {
            var subs = this.subs.slice();
            for (var i = 0, l = subs.length; i < l; i++) {
                subs[i].update();
            }
        };
        return Dep;
    }());
    Dep.target = null;
    function pushTarget(target) {
        Dep.target = target;
    }
    function popTarget() {
        Dep.target = null;
    }

    var arrayProto = Array.prototype;
    var arrayMethods = Object.create(arrayProto);
    var methodsToPatch = [
        'push',
        'pop',
        'shift',
        'unshift',
        'splice',
        'sort',
        'reverse'
    ];
    methodsToPatch.forEach(function (method) {
        def(arrayMethods, method, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var result = arrayMethods[method].apply(this, args);
            // 获取到Observer实例
            var ob = this.__ob__;
            var inserted;
            // 对于新增的内容也要进行响应式转换，否则会出现修改数据时无法触发消息的问题
            switch (method) {
                case 'push':
                case 'unshift':
                    inserted = args;
                    break;
                case 'splice':
                    inserted = args.slice(2);
                    break;
            }
            if (inserted)
                ob.observeArray(inserted);
            ob.dep.notify(); // 数组改变之后，向依赖发送消息
            return result;
        });
    });

    var Observer = /** @class */ (function () {
        function Observer(value) {
            this.value = value;
            this.dep = new Dep();
            def(value, '__ob__', this);
            if (Array.isArray(value)) {
                value.__proto__ = arrayMethods;
                this.observeArray(value);
            }
            else {
                this.walk(value);
            }
        }
        Observer.prototype.walk = function (obj) {
            Object.keys(obj).forEach(function (key) {
                defineReactive(obj, key);
            });
        };
        Observer.prototype.observeArray = function (items) {
            items.forEach(function (item) {
                observe(item);
            });
        };
        return Observer;
    }());
    function dependArray(values) {
        values.forEach(function (value) {
            if (isObservable(value)) {
                value.__ob__.dep.depend();
            }
            if (Array.isArray(value))
                dependArray(value);
        });
    }
    function observe(value) {
        /* 值类型不用进行响应式转换 */
        if (!isObject(value))
            return;
        if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
            return value.__ob__;
        }
        if ((Array.isArray(value) || isPlainObject(value)) &&
            Object.isExtensible(value)) {
            return new Observer(value);
        }
    }
    function defineReactive(obj, key, val, customSetter, shallow // 如果设置为true，则不会对val进行响应式处理，即只对obj的key属性的值响应式处理
    ) {
        var dep = new Dep();
        var property = Object.getOwnPropertyDescriptor(obj, key);
        if (property && property.configurable === false) {
            return;
        }
        var getter = property && property.get;
        var setter = property && property.set;
        val = val ? val : obj[key];
        var childOb = !shallow && observe(val);
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: function reactiveGetter() {
                var value = getter ? getter.call(obj) : val;
                /**
                 * 首先需要知道的是，Dep.target值若不为空，则表示Watcher正在读取它的依赖(读取getter)
                 * 而事情发生在reactiveGetter中，Watcher正在读取obj对象
                 * 那么就通知Watcher将该对象进行收集(在Watcher中会进一步判断是否该对象已经被收集)
                 * 收集的是该状态的Dep，因为dep中存放着Watcher(订阅者)列表
                 *
                 * 与订阅观察者模式的不同是，前者是把所有的事件以及回调存放在一个全局统一变量中，通过事件名触发事件，依次调用回调函数列表中属于该事件名的回调函数
                 * 而在vue中，每个状态都有一份独立的Dep，其中存放的是Watcher，在状态发生变化时，会遍历状态的Dep，触发Watcher的update()方法
                 */
                if (Dep.target) {
                    dep.depend();
                    if (childOb) {
                        childOb.dep.depend();
                        if (Array.isArray(value)) {
                            dependArray(value);
                        }
                    }
                }
                return value;
            },
            set: function reactiveSetter(newVal) {
                var value = getter ? getter.call(obj) : val;
                if (newVal === value || (newVal !== newVal && value !== value)) {
                    return;
                }
                if ( customSetter) {
                    customSetter(newVal);
                }
                if (getter && !setter)
                    return;
                if (setter) {
                    setter.call(obj, newVal);
                }
                else {
                    val = newVal;
                }
                childOb = !shallow && observe(newVal);
                // 依赖变化后，触发更新，通知Dep类调用notify来触发所有Watcher对象的update方法更新对应视图
                /**
                 * 获取到观察该状态的所有Watcher
                 * 触发更新
                 * (观察者模式中是调用订阅列表中的函数)
                 */
                dep.notify();
            }
        });
    }
    /*  helper */
    function isObservable(value) {
        if (value && value.__ob__) {
            return true;
        }
        return false;
    }

    var uid$1 = 0;
    var Watcher = /** @class */ (function () {
        function Watcher(vm, expOrFn, cb, options, isRenderWatcher) {
            var _a;
            this.vm = vm;
            this.cb = cb;
            if (isRenderWatcher) {
                vm._watcher = this;
            }
            (_a = vm._watchers) === null || _a === void 0 ? void 0 : _a.push(this);
            this.active = true;
            if (options) {
                this.deep = !!options.deep;
                this.user = !!options.user;
                this.lazy = !!options.lazy;
                this.sync = !!options.sync;
                this.before = options.before;
            }
            else {
                this.deep = this.user = this.lazy = this.sync = false;
            }
            this.dirty = this.lazy;
            this.deps = [];
            this.newDeps = [];
            this.depIds = new Set();
            this.newDepIds = new Set();
            this.id = ++uid$1;
            if (typeof expOrFn === 'string') {
                this.getter = parsePath(expOrFn);
                if (!this.getter) {
                    this.getter = noop;
                     console.warn("Failed watching path: \"" + expOrFn + "\" " +
                        'Watcher only accepts simple dot-delimited paths. ' +
                        'For full control, use a function instead.');
                }
            }
            else {
                this.getter = expOrFn;
            }
            this.expression =  expOrFn.toString()
                ;
            this.value = this.lazy ? undefined : this.get();
        }
        Watcher.prototype.get = function () {
            /**
             * Dep.target是一个Watcher，表示该Watcher正在访问依赖
             */
            pushTarget(this);
            var value = this.getter.call(this.vm, this.vm);
            popTarget();
            this.cleanupDeps();
            return value;
        };
        Watcher.prototype.cleanupDeps = function () {
            var _a, _b;
            var i = this.deps.length || 0;
            while (i--) {
                var dep = this.deps[i];
                // 遍历deps，找出不在newDeps里的dep
                if (!((_a = (this.newDepIds)) === null || _a === void 0 ? void 0 : _a.has(dep.id))) {
                    dep.removeSub(this);
                }
            }
            // depIds
            var tmp = this.depIds;
            this.depIds = this.newDepIds;
            this.newDepIds = this.depIds;
            (_b = this.newDepIds) === null || _b === void 0 ? void 0 : _b.clear();
            tmp = this.deps;
            this.deps = this.newDeps;
            this.newDeps = tmp;
            this.newDeps.length = 0;
        };
        /**
         * 该方法在依赖(observer)被访问的时候触发，然后把该依赖的dep存入正在观察的watcher的deps中
         * 添加依赖的dep原因是为了在
         * 读取到了一个依赖(observer)判断是否将其纳入了deps中
         * 如果没有则新增，反之则表示该依赖已被收录
         * 为什么添加dep?
         *
         */
        Watcher.prototype.addDep = function (dep) {
            var id = dep.id;
            /**
             * 在最新值获取完毕之后，newDepIds将会清空
             */
            if (!this.newDepIds.has(id)) { // 该依赖尚不存在，则添加
                this.newDepIds.add(id);
                this.newDeps.push(dep);
                /**
                 * 如果depIds中不存在这个的dep的id
                 * 表示Watcher还没有订阅该状态
                 */
                if (!this.depIds.has(id)) {
                    dep.addSub(this);
                }
            }
        };
        /**
         * 在依赖被重新赋值之后，需要更新这个依赖所属的watcher的value
         * 并触发回调函数
         */
        Watcher.prototype.update = function () {
            // TODO 异步更新
            if (this.lazy) {
                this.dirty = true;
            }
            else {
                this.run();
            }
        };
        /**
         * 重新获取Watcher的值
         * 值变化后触发回调函数
         */
        Watcher.prototype.run = function () {
            if (this.active) {
                /**
                 * this.get()获取当前最新的值
                 * 如果当前最新值与更新前的值(this.value)不一致，则需要更新this.value，并触发回调
                 */
                var value = this.get();
                if (value !== this.value ||
                    isObject(value)) {
                    var oldValue = this.value;
                    this.value = value;
                    this.cb.call(this.vm, value, oldValue);
                }
            }
        };
        Watcher.prototype.evaluate = function () {
            this.value = this.get();
            this.dirty = false;
        };
        // TODO
        /**
         * 在computed中使用，如果Dep.target存在，则触发watcher.depend()
         * computed中的值变化之后，重新收集依赖？
         */
        Watcher.prototype.depend = function () {
            var i = this.deps.length;
            while (i--) {
                this.deps[i].depend();
            }
        };
        Watcher.prototype.teardown = function () { };
        return Watcher;
    }());
    /******** helper *******/
    var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
    var bailRE = new RegExp("[^" + unicodeRegExp.source + ".$_\\d]");
    function parsePath(path) {
        if (bailRE.test(path))
            return;
        var segments = path.split('.');
        return function (obj) {
            for (var i = 0; i < segments.length; i++) {
                if (!obj)
                    return;
                obj = obj[segments[i]];
            }
            return obj;
        };
    }

    var VNode = /** @class */ (function () {
        function VNode(_a) {
            var context = _a.context, _b = _a.tag, tag = _b === void 0 ? '' : _b, _c = _a.data, data = _c === void 0 ? {} : _c, _d = _a.children, children = _d === void 0 ? [] : _d, _e = _a.text, text = _e === void 0 ? '' : _e, elm = _a.elm, _f = _a.componentOptions, componentOptions = _f === void 0 ? {} : _f;
            this.componentOptions = {};
            this.tag = tag;
            this.data = data;
            this.children = children;
            this.text = text;
            this.elm = elm;
            this.context = context;
            this.isComment = false;
            this.componentInstance = null;
            this.componentOptions = componentOptions;
        }
        return VNode;
    }());
    function createTextVNode(text) {
        if (text === void 0) { text = ''; }
        return new VNode({ text: text });
    }
    function createEmptyVNode(text) {
        if (text === void 0) { text = ''; }
        var vnode = new VNode({ text: text });
        vnode.isComment = true;
        return vnode;
    }

    function createElement(tagName) {
        return document.createElement(tagName);
    }
    function createTextNode(text) {
        return document.createTextNode(text);
    }
    function createComment(text) {
        return document.createComment(text);
    }
    function insertBefore(parentNode, newNode, referenceNode) {
        parentNode.insertBefore(newNode, referenceNode);
    }
    function removeChild(node, child) {
        node.removeChild(child);
    }
    function appendChild(node, child) {
        node.appendChild(child);
    }
    function parentNode(node) {
        return node.parentNode;
    }
    function nextSibling(node) {
        return node.nextSibling;
    }
    function tagName(elm) {
        return elm.tagName;
    }
    function setTextContent(node, text) {
        node.textContent = text;
    }
    function getTextContent(node) {
        return node.textContent;
    }
    function isElement(node) {
        return node.nodeType === 1;
    }
    function isText(node) {
        return node.nodeType === 3;
    }
    function isComment(node) {
        return node.nodeType === 8;
    }
    var domApi = {
        createElement: createElement,
        createTextNode: createTextNode,
        createComment: createComment,
        insertBefore: insertBefore,
        removeChild: removeChild,
        appendChild: appendChild,
        parentNode: parentNode,
        nextSibling: nextSibling,
        tagName: tagName,
        setTextContent: setTextContent,
        getTextContent: getTextContent,
        isElement: isElement,
        isText: isText,
        isComment: isComment,
    };

    var hooks = [
        'pre',
        'init',
        'create',
        'insert',
        'prepatch',
        'update',
        'postpatch',
        'destroy',
        'remove',
        'post'
    ];
    var emptyVNode = new VNode({});
    /**
     * 触发hook
     * @param obj 需要从中触发hook的对象
     * @param hook hook名
     * @param args hook的参数
     */
    var callPatchHook = function (obj, hook) {
        if (obj === void 0) { obj = {}; }
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (Array.isArray(obj)) {
            obj.forEach(function (ctx) {
                callPatchHook.apply(void 0, __spread([ctx, hook], args));
            });
        }
        else {
            var fn = obj[hook];
            if (fn instanceof Set) {
                fn.forEach(function (f) {
                    (typeof f === 'function') && f.apply(void 0, __spread(args));
                });
            }
        }
    };
    function initPatch(modules) {
        var cbs = hooks.reduce(function (acc, cur) {
            var _a;
            return __assign(__assign({}, acc), (_a = {}, _a[cur] = new Set(), _a));
        }, {});
        hooks.forEach(function (key) {
            (modules || []).forEach(function (m) {
                var _hook = m[key];
                if (_hook) {
                    cbs[key].add(_hook);
                }
            });
        });
        function removeVNodes(vnodes, startIdx, endIdx) {
            for (; startIdx <= endIdx; ++startIdx) {
                var ch = vnodes[startIdx];
                if (ch) {
                    if (ch.tag) {
                        removeNode(ch.elm);
                        callPatchHook([cbs, (ch.data.hook || {})], 'destroy', emptyVNode, ch);
                    }
                    else {
                        removeNode(ch.elm);
                        callPatchHook([cbs, (ch.data.hook || {})], 'destroy', emptyVNode, ch);
                    }
                }
            }
        }
        function addVNodes(parentEl, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
            for (; startIdx <= endIdx; ++startIdx) {
                var ch = vnodes[startIdx];
                if (ch != null) {
                    domApi.insertBefore(parentEl, createElm(ch), before);
                }
            }
        }
        function createChildren(vnode, children) {
            if (Array.isArray(children)) {
                children.forEach(function (child) {
                    child && createElm(child, vnode.elm);
                });
            }
            else if (isPrimitive(vnode.text)) {
                // vnode作为父节点，将文本插入vnode.elm
                domApi.appendChild(vnode.elm, domApi.createTextNode(String(vnode.text)));
            }
        }
        /**
         * 初始化组件，调用init hook
         * @param{VNode} vnode 组件的VNode
         */
        function initComponent(vnode) {
            /* vnode.componentInstance表示组件渲染后的DOM */
            vnode.elm = vnode.componentInstance.$el; // 父级元素
            if (isPatchable(vnode)) {
                callPatchHook([cbs, (vnode.data.hook || {})], 'create', emptyVNode, vnode);
            }
        }
        function needRenderComponent(vnode, parentEl, refEl) {
            if (vnode.componentInstance) { // 是一个组件
                initComponent(vnode);
                insertVnode(parentEl, vnode.elm, refEl);
                return true;
            }
        }
        function createElm(vnode, parentEl, refEl) {
            var _a = vnode.data, data = _a === void 0 ? {} : _a, tag = vnode.tag;
            var children = vnode.children;
            callPatchHook([cbs, (data.hook || {})], 'pre', vnode, parentEl, refEl);
            callPatchHook((data.hook || {}), 'init', vnode, false);
            if (needRenderComponent(vnode, parentEl, refEl)) {
                return null;
            }
            if (tag) {
                // 创建真实DOM
                vnode.elm = domApi.createElement(tag);
                // 创建子节点
                createChildren(vnode, children);
                /**
                 * 调用create hook
                 * 传递的参数为：空VNode和当前VNode
                 * cbs是内部的回调，主要是完善DOM相关的属性，例如class、style、event等
                 */
                callPatchHook([cbs, (data.hook || {})], 'create', emptyVNode, vnode);
            }
            else if (vnode.isComment) {
                vnode.elm = domApi.createComment(vnode.text);
            }
            else {
                vnode.elm = domApi.createTextNode(vnode.text);
            }
            // 将真实DOMvnode.elm插入到父节点
            insertVnode(parentEl, vnode.elm, refEl);
            return vnode.elm;
        }
        /**
       * diff children
       */
        function updateChildren(parentEl, oldCh, newCh, insertedVnodeQueue) {
            var oldStartIdx = 0;
            var newStartIdx = 0;
            var oldEndIdx = oldCh.length - 1;
            var newEndIdx = newCh.length - 1;
            var oldStartVnode = oldCh[0];
            var newStartVnode = newCh[0];
            var oldEndVnode = oldCh[oldEndIdx];
            var newEndVnode = newCh[newEndIdx];
            var oldKeyToIdx;
            var idxInOld;
            var elmToMove;
            var before;
            // if (__DEV__) checkDuplicateKeys(newCh)
            // 直到oldCh或newCh其中有一个遍历结束为止
            // 最多处理一个节点，算法复杂度为O(n)
            while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
                // 如果进行比较的 4 个节点中存在空节点，为空的节点下标向中间推进，继续下个循环
                if (!oldStartVnode) { // oldvnode 首节点为null
                    oldStartVnode = oldCh[++oldStartIdx];
                }
                else if (!oldEndVnode) { // oldvnode 尾节点为null
                    oldEndVnode = oldCh[--oldEndIdx];
                }
                else if (!newStartVnode) { // newvnode 首节点为null
                    newStartVnode = newCh[++newStartIdx];
                }
                else if (!newEndVnode) { // oldvnode 尾节点为null
                    newEndVnode = newCh[--newEndIdx];
                }
                else if (sameVnode(oldStartVnode, newStartVnode)) { // 当前比较的新旧节点的相同，直接调用 patchVnode，比较其子元素，然后下标向中间推进
                    patchVnode(oldStartVnode, newStartVnode);
                    oldStartVnode = oldCh[++oldStartIdx];
                    newStartVnode = newCh[++newStartIdx];
                }
                else if (sameVnode(oldEndVnode, newEndVnode)) { // 同上
                    patchVnode(oldEndVnode, newEndVnode);
                    oldEndVnode = oldCh[--oldEndIdx];
                    newEndVnode = newCh[--newEndIdx];
                }
                else if (sameVnode(oldStartVnode, newEndVnode)) { // vnode moved right
                    patchVnode(oldStartVnode, newEndVnode);
                    domApi.insertBefore(parentEl, oldStartVnode.elm, domApi.nextSibling(oldEndVnode.elm));
                    oldStartVnode = oldCh[++oldStartIdx];
                    newEndVnode = newCh[--newEndIdx];
                }
                else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
                    patchVnode(oldEndVnode, newStartVnode);
                    domApi.insertBefore(parentEl, oldEndVnode.elm, oldStartVnode.elm);
                    oldEndVnode = oldCh[--oldEndIdx];
                    newStartVnode = newCh[++newStartIdx];
                }
                else {
                    // 创建 key 到 index 的映射
                    if (!oldKeyToIdx) {
                        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                    }
                    // 如果下标不存在，说明这个节点是新创建的
                    idxInOld = oldKeyToIdx[newStartVnode.key];
                    if (!idxInOld) { // 新增节点，插入到newStartVnode的前面
                        domApi.insertBefore(parentEl, createElm(newStartVnode), oldStartVnode.elm);
                    }
                    else {
                        // 如果是已经存在的节点 找到需要移动位置的节点
                        elmToMove = oldCh[idxInOld];
                        // 虽然 key 相同了，但是 seletor 不相同，需要调用 createElm 来创建新的 dom 节点
                        if (sameVnode(elmToMove, newStartVnode)) {
                            domApi.insertBefore(parentEl, createElm(newStartVnode), oldStartVnode.elm);
                        }
                        else {
                            // 否则调用 patchVnode 对旧 vnode 做更新
                            patchVnode(elmToMove, newStartVnode);
                            oldCh[idxInOld] = undefined;
                            domApi.insertBefore(parentEl, elmToMove.elm, oldStartVnode.elm);
                        }
                    }
                }
            }
            // 循环结束后，可能会存在两种情况
            // 1. oldCh 已经全部处理完成，而 newCh 还有新的节点，需要对剩下的每个项都创建新的 dom
            if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
                if (oldStartIdx > oldEndIdx) {
                    before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
                    addVNodes(parentEl, before, newCh, newStartIdx, newEndIdx);
                }
                else { // 2. newCh 已经全部处理完成，而 oldCh 还有旧的节点，需要将多余的节点移除
                    removeVNodes(oldCh, oldStartIdx, oldEndIdx);
                }
            }
        }
        function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
            if (oldVnode === vnode)
                return;
            var elm = vnode.elm = oldVnode.elm;
            var oldCh = oldVnode.children;
            var ch = vnode.children;
            var data = vnode.data || {};
            var dataHook = data.hook || {};
            /**
             * 只有组件VNode才会有prepatch hook
             */
            callPatchHook(dataHook, 'prepatch', oldVnode, vnode);
            if (isPatchable(vnode)) {
                callPatchHook([cbs, dataHook], 'update', oldVnode, vnode);
            }
            if (vnode.tag) {
                if (oldCh && ch) {
                    if (oldCh !== ch) {
                        updateChildren(elm, oldCh, ch);
                    }
                    else if (ch) {
                        if (oldVnode.text)
                            domApi.setTextContent(elm, '');
                        addVNodes(elm, null, ch, 0, ch.length - 1);
                    }
                    else if (oldCh) {
                        removeVNodes(oldCh, 0, oldCh.length - 1);
                    }
                    else if (oldVnode.text) {
                        domApi.setTextContent(elm, '');
                    }
                }
            }
            else if (oldVnode.text !== vnode.text) {
                domApi.setTextContent(elm, vnode.text);
            }
            callPatchHook(dataHook, 'postpatch', oldVnode, vnode);
        }
        return function patch(oldVnode, vnode, hyphenate) {
            if (!oldVnode) {
                createElm(vnode);
            }
            else {
                /**
                 * 如果oldvnode存在，则会存在两种情况
                 * 1. oldvnode是DOM
                 * 2. oldvnode是更新前的vnode
                 */
                var isRealElement = !!oldVnode.nodeType;
                if (!isRealElement && sameVnode(oldVnode, vnode)) {
                    patchVnode(oldVnode, vnode);
                }
                else {
                    if (isRealElement) {
                        /**
                         * 在Vue中，如果是oldVnode真实DOM，则表示是初次挂载
                         * 根据真实DOM创建出VNode
                         * */
                        oldVnode = emptyNodeAt(oldVnode);
                    }
                    /* 该vnode的DOM */
                    var oldEl = oldVnode.elm;
                    /* 该vnode的parent DOM */
                    var parentEl = domApi.parentNode(oldEl);
                    /* 更新vnode */
                    createElm(vnode, parentEl, domApi.nextSibling(oldEl));
                    /* 删除oldvnode生成的DOM */
                    if (parentEl) {
                        removeVNodes([oldVnode], 0, 0);
                    }
                    else if (oldVnode.tag) ;
                }
            }
            return vnode.elm;
        };
    }
    function removeNode(el) {
        var parent = domApi.parentNode(el);
        if (parent)
            domApi.removeChild(parent, el);
    }
    function insertVnode(parent, el, ref) {
        if (parent) {
            if (ref) {
                if (domApi.parentNode(ref) === parent) {
                    domApi.insertBefore(parent, el, ref);
                }
            }
            else {
                domApi.appendChild(parent, el);
            }
        }
    }
    function emptyNodeAt(elm) {
        return new VNode({
            tag: domApi.tagName(elm),
            elm: elm
        });
    }
    function sameVnode(a, b) {
        return (a.tag === b.tag &&
            a.isComment === b.isComment &&
            a.data === b.data &&
            sameInputType(a, b));
    }
    function sameInputType(a, b) {
        if (a.tag !== 'input')
            return true;
        var i;
        var typeA = (i = a.data) && (i = i.attrs) && i.type;
        var typeB = (i = b.data) && (i = i.attrs) && i.type;
        return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB);
    }
    var isTextInputType = function (type) { return ['text', 'number', 'password', 'search', 'email', 'tel', 'url '].indexOf(type) > -1; };
    function isPatchable(vnode) {
        return vnode.tag;
    }
    function createKeyToOldIdx(children, beginIdx, endIdx) {
        var map = {};
        for (var i = beginIdx; i <= endIdx; ++i) {
            var key = children[i].key;
            if (key !== undefined) {
                map[key] = i;
            }
        }
        return map;
    }

    function updateAttrs(oldVnode, vnode) {
        var _a, _b, _c, _d;
        if (!isDef((_a = oldVnode.data) === null || _a === void 0 ? void 0 : _a.attrs) && !isDef((_b = vnode.data) === null || _b === void 0 ? void 0 : _b.attrs))
            return;
        var oldAttrs = ((_c = oldVnode.data) === null || _c === void 0 ? void 0 : _c.attrs) || {};
        var attrs = ((_d = vnode.data) === null || _d === void 0 ? void 0 : _d.attrs) || {};
        var el = vnode.elm;
        if (oldAttrs === attrs)
            return;
        var key, cur, old;
        // 遍历新节点的attrs
        for (key in attrs) {
            cur = attrs[key];
            old = oldAttrs[key];
            // 如果前后两个属性值不一致，则更新为新的属性值
            if (old !== cur) {
                setAttr(el, key, cur);
            }
        }
        // 遍历旧节点的oldAttrs
        for (key in oldAttrs) {
            // 如果旧节点中的属性未在新节点中定义，则移除
            if (!isDef(attrs[key])) {
                if (!isEnumeratedAttr(key)) {
                    el.removeAttribute(key);
                }
            }
        }
    }
    var hookModule = {
        create: updateAttrs,
        update: updateAttrs
    };
    /********** attribute helper  **********/
    function setAttr(el, key, value) {
        if (el.tagName.indexOf('-') > -1) {
            baseSetAttr(el, key, value);
        }
        else if (isBooleanAttr(key)) {
            if (isFalsyAttrValue(value)) {
                el.removeAttribute(key);
            }
            else {
                value = key === 'allowfullscreen' && el.tagName === 'EMBED'
                    ? 'true'
                    : key;
                el.setAttribute(key, value);
            }
        }
        else if (isEnumeratedAttr(key)) {
            el.setAttribute(key, convertEnumeratedValue(key, value));
        }
        else {
            baseSetAttr(el, key, value);
        }
    }
    function baseSetAttr(el, key, value) {
        if (isFalsyAttrValue(value)) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, value);
        }
    }
    /********* ********/
    var isBooleanAttr = function (key) { return [
        'allowfullscreen', 'async', 'autofocus',
        'autoplay', 'checked', 'compact',
        'controls', 'declare', 'default',
        'defaultchecked', 'defaultmuted', 'defaultselected',
        'defer', 'disabled', 'enabled',
        'formnovalidate', 'hidden', 'indeterminate',
        'inert', 'ismap', 'itemscope',
        'loop', 'multiple', 'muted',
        'nohref', 'noresize', 'noshade',
        'novalidate', 'nowrap', 'open',
        'pauseonexit', 'readonly', 'required',
        'reversed', 'scoped', 'seamless',
        'selected', 'sortable', 'translate',
        'truespeed', 'typemustmatch', 'visible'
    ].indexOf(key) > -1; };
    var isFalsyAttrValue = function (val) { return val === false || !isDef(val); };
    var isEnumeratedAttr = function (a) { return ['contenteditable', 'draggable', 'spellcheck'].indexOf(a) > -1; };
    var isValidContentEditableValue = function (a) { return ['events', 'caret', 'typing', 'plaintext-only'].indexOf(a) > -1; };
    var convertEnumeratedValue = function (key, value) {
        return isFalsyAttrValue(value) || value === 'false'
            ? 'false'
            : key === 'contenteditable' && isValidContentEditableValue(value)
                ? value
                : 'true';
    };

    function updateClass(oldVnode, vnode) {
        var el = vnode.elm;
        var data = vnode.data;
        var oldData = oldVnode.data;
        if (!isDef(data.class) && (!isDef(oldData) || (!isDef(oldData.class)))) {
            return;
        }
        var cls = stringifyClass(data.class);
        el.setAttribute('class', cls);
    }
    var hookModule$1 = {
        create: updateClass,
        update: updateClass
    };
    /********  class helper ********/
    function stringifyClass(value) {
        if (Array.isArray(value)) {
            return stringifyArray(value);
        }
        if (isObject(value)) {
            return stringifyObject(value);
        }
        if (typeof value === 'string') {
            return value;
        }
        return '';
    }
    function stringifyArray(value) {
        var res = '';
        var stringified;
        for (var i = 0, l = value.length; i < l; i++) {
            if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
                if (res)
                    res += ' ';
                res += stringified;
            }
        }
        return res;
    }
    function stringifyObject(value) {
        var res = '';
        for (var key in value) {
            if (value[key]) {
                if (res)
                    res += ' ';
                res += key;
            }
        }
        return res;
    }

    function updateEventListeners(oldVnode, vnode) {
        var _a, _b, _c;
        if (!oldVnode && !vnode)
            return;
        if (!isDef(oldVnode.data.on) && !isDef((_a = vnode.data) === null || _a === void 0 ? void 0 : _a.on))
            return;
        var oldOn = ((_b = oldVnode.data) === null || _b === void 0 ? void 0 : _b.on) || {};
        var on = ((_c = vnode.data) === null || _c === void 0 ? void 0 : _c.on) || {};
        var oldElm = oldVnode.elm;
        var elm = vnode.elm;
        var name, listener;
        if (!on) {
            for (name in oldOn) {
                listener = oldOn[name];
                oldElm.removeEventListener(name, listener, false);
            }
        }
        else { // 存在新的事件监听器对象
            for (name in on) { // 添加监听器，存在于on但是不存在与oldOn
                if (!oldOn[name]) {
                    listener = on[name];
                    elm.addEventListener(name, listener, false);
                }
            }
            for (name in oldOn) { // 移除oldOn上不存在于on上的监听器
                listener = oldOn[name];
                if (!on[name]) {
                    oldElm.removeEventListener(name, listener, false);
                }
            }
        }
    }
    var hookModule$2 = {
        create: updateEventListeners,
        update: updateEventListeners,
        destroy: updateEventListeners
    };

    function updateStyle(oldVnode, vnode) {
        var data = vnode.data;
        var oldData = oldVnode.data;
        var oldStyle = oldData.normalizedStyle || {};
        if (!isDef(data.style) && !isDef(oldData.style))
            return;
        var el = vnode.elm;
        var newStyle = (normalizeStyleBinding(vnode.data.style) || {});
        /* 记录之前的style */
        vnode.data.normalizedStyle = newStyle;
        var name, cur;
        for (name in oldStyle) {
            if (!isDef(newStyle[name])) {
                setProp(el, name, '');
            }
        }
        for (name in newStyle) {
            cur = newStyle[name];
            if (cur !== oldStyle[name]) {
                setProp(el, name, cur == null ? '' : cur);
            }
        }
    }
    var hookModule$3 = {
        create: updateStyle,
        update: updateStyle
    };
    /*******  style helper *******/
    var cssVarRE = /^--/;
    var importantRE = /\s*!important$/;
    var setProp = function (el, name, val) {
        /* istanbul ignore if */
        if (cssVarRE.test(name)) {
            el.style.setProperty(name, val);
        }
        else if (importantRE.test(val)) {
            el.style.setProperty(hyphenate(name), val.replace(importantRE, ''), 'important');
        }
        else {
            var normalizedName = normalize(name);
            if (Array.isArray(val)) {
                for (var i = 0, len = val.length; i < len; i++) {
                    el.style[normalizedName] = val[i];
                }
            }
            else {
                el.style[normalizedName] = val;
            }
        }
    };
    var vendorNames = ['Webkit', 'Moz', 'ms'];
    var emptyStyle;
    var normalize = cached(function (prop) {
        emptyStyle = emptyStyle || document.createElement('div').style;
        prop = camelize(prop);
        if (prop !== 'filter' && (prop in emptyStyle)) {
            return prop;
        }
        var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
        for (var i = 0; i < vendorNames.length; i++) {
            var name = vendorNames[i] + capName;
            if (name in emptyStyle) {
                return name;
            }
        }
    });
    function normalizeStyleBinding(bindingStyle) {
        if (Array.isArray(bindingStyle)) {
            return toObject(bindingStyle);
        }
        if (typeof bindingStyle === 'string') {
            return parseStyleText(bindingStyle);
        }
        return bindingStyle;
    }
    var parseStyleText = function (cssText) {
        var res = {};
        var listDelimiter = /;(?![^(]*\))/g;
        var propertyDelimiter = /:(.+)/;
        cssText.split(listDelimiter).forEach(function (item) {
            if (item) {
                var tmp = item.split(propertyDelimiter);
                tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
            }
        });
        return res;
    };

    var patch = initPatch([hookModule, hookModule$1, hookModule$2, hookModule$3]);

    var globalConfig = {
        optionMergeStrategies: Object.create(null),
    };

    function createElement$1(context, tag, data, children) {
        /* 没有传入data */
        if (Array.isArray(data) || isPrimitive(data)) {
            children = data;
            data = undefined;
        }
        if (!tag)
            return createTextVNode();
        children = normalizeChildren(children);
        var vnode;
        if (typeof tag === 'string' && isHTMLTag(tag)) {
            vnode = new VNode({
                context: context,
                tag: tag,
                data: data,
                children: children
            });
        }
        else {
            if (globalConfig.createElement) {
                vnode = globalConfig.createElement(context, tag, data, children);
            }
        }
        if (isDef(vnode)) {
            return vnode;
        }
        else {
            return createEmptyVNode();
        }
    }
    /**
     * 校验子组件是否符合规范
     */
    function normalizeChildren(children) {
        return isPrimitive(children)
            ? [createTextVNode(children)]
            : Array.isArray(children)
                ? normalizeArrayChildren(children)
                : undefined;
    }
    /**
     * 省略了合并相邻文本节点的过程
     */
    function normalizeArrayChildren(children, nestedIndex) {
        return children.map(function (child, i) {
            if (!isDef(child) || typeof child === 'boolean')
                return null;
            if (isPrimitive(child)) {
                return createTextVNode(child);
            }
            else if (Array.isArray(child)) {
                return normalizeArrayChildren(child);
            }
            else {
                // TODO 如果是v-for的情况
                return child;
            }
        });
    }

    function initUse(Vue) {
        Vue.use = function (plugin) {
            var _a;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
            if (installedPlugins.indexOf(plugin) > -1) {
                return this;
            }
            if (typeof plugin === 'function') {
                plugin.call.apply(plugin, __spread([null, this], args));
            }
            else if (typeof plugin.install === 'function') {
                (_a = plugin.install).call.apply(_a, __spread([plugin, this], args));
            }
            installedPlugins.push(plugin);
            return this;
        };
    }

    function updateComponentListeners(vm, listeners, oldListeners) {
        if (listeners === void 0) { listeners = {}; }
        if (oldListeners === void 0) { oldListeners = {}; }
        updateListeners(listeners, oldListeners, function (event, fn) {
            vm.$on(event, fn);
        }, function (event, fn) {
            vm.$off(event, fn);
        });
    }
    function updateListeners(on, oldOn, add, remove) {
        var name, cur, old;
        for (name in on) {
            cur = on[name];
            old = oldOn[name];
            if (!old) {
                add(name, cur);
            }
            else if (cur !== old) {
                on[name] = old;
            }
        }
        for (name in oldOn) {
            if (!on[name]) {
                remove(name, oldOn[name]);
            }
        }
    }

    function initEvent(vm) {
        vm._events = Object.create(null);
        // 在组件初始化时，$options._parentListeners将会被赋值，根据与该组件的data.on
        var listeners = vm.$options._parentListeners;
        // init parent attached events
        if (listeners) {
            // prepatch时同样会执行updateComponentListeners
            updateComponentListeners(vm, listeners);
        }
    }
    function initLifecycle(vm) {
        vm._isMounted = false;
        var parent = vm.$options.parent;
        vm.$parent = parent;
    }
    function initRender(vm) {
        vm._vnode = null;
        vm.$createElement = function (a, b, c) { return createElement$1(vm, a, b, c); };
    }
    function initState(vm) {
        var options = vm.$options;
        vm._watcher = undefined;
        vm._watchers = [];
        if (options.data) {
            initData(vm);
        }
        else {
            observe(vm._data = {});
        }
        options.methods && initMethods(vm);
    }
    function initData(vm) {
        var data = vm.$options.data;
        if (!data)
            return;
        data = vm._data = typeof data === 'function' ? data.call(vm, vm) : data || {};
        if (!isPlainObject(data)) {
            data = {};
             console.warn('data functions should return an object:\n' +
                'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function');
        }
        var keys = Object.keys(data);
        var props = vm.$options.props;
        var methods = vm.$options.methods;
        var i = keys.length;
        while (i--) {
            var key = keys[i];
            {
                /* 保证data中的key不与props中的key重复，props优先 */
                if (methods && hasOwn(methods, key)) {
                    console.warn("Method \"" + key + "\" has already been defined as a data property.");
                }
            }
            // 如果props有与data同名的方法，给出警告
            if (props && hasOwn(props, key)) {
                 console.warn("The data property \"" + key + "\" is already declared as a prop. " +
                    "Use prop default value instead.");
            }
            else if (!isReserved(key)) { // 不是保留字段
                /* 将data的属性代理到vm实例上 */
                proxy(vm, "_data", key);
            }
        }
        observe(data);
    }
    function initMethods(vm) {
        var methods = vm.$options.methods;
        for (var key in methods) {
            if (typeof methods[key] !== 'function') {
                console.warn("Method \"" + key + "\" has type \"" + typeof methods[key] + "\" in the component definition. " +
                    "Did you reference the function correctly?");
            }
            /**
             * 因为方法在Vue示例中通过this调用
             * 所以方法的作用域绑定到vm实例
             * */
            // TODO vm上不能定义任意类型的属性
            vm[key] = typeof methods[key] !== 'function' ? noop : Function.prototype.bind.call(methods[key], vm);
        }
    }
    var sharedPropertyDefinition = {
        enumerable: true,
        configurable: true,
        get: noop,
        set: noop
    };
    /**
     * 在target上设置一个代理，实现通过访问target.key来访问target.sourceKey.key的目的
     */
    function proxy(target, sourceKey, key) {
        sharedPropertyDefinition.get = function proxyGetter() {
            return target[sourceKey][key];
        };
        sharedPropertyDefinition.set = function proxySetter(val) {
            target[sourceKey][key] = val;
        };
        Object.defineProperty(target, key, sharedPropertyDefinition);
    }
    function callHook(vm, hook) {
        var handlers = vm.$options[hook];
        if (!handlers)
            return;
        handlers = Array.isArray(handlers) ? handlers : [handlers];
        handlers.forEach(function (handler) {
            handler.call(vm);
        });
    }

    var globalConfig$1 = {
        optionMergeStrategies: Object.create(null),
    };

    var strategies = globalConfig$1.optionMergeStrategies;
    LIFECYCLE_HOOKS.forEach(function (hook) {
        strategies[hook] = mergeHook;
    });
    var defaultStrat = function (parentVal, childVal) {
        return childVal === undefined
            ? parentVal
            : childVal;
    };
    function mergeOptions(parent, child, vm) {
        if (parent === void 0) { parent = {}; }
        if (child === void 0) { child = {}; }
        var options = {};
        var key;
        for (key in parent) {
            mergeField(key);
        }
        for (key in child) {
            if (!hasOwn(parent, key)) {
                mergeField(key);
            }
        }
        function mergeField(key) {
            var strat = strategies[key] || defaultStrat;
            options[key] = strat(parent[key], child[key], vm, key);
        }
        return options;
    }
    function resolveConstructorOptions(Ctor) {
        var options = Ctor.options;
        /* 如果有super属性，则表示是扩展类 */
        if (Ctor.super) {
            var superOptions = resolveConstructorOptions(Ctor.super);
            var cachedSuperOptions = Ctor.superOptions;
            if (superOptions !== cachedSuperOptions) {
                Ctor.superOptions = superOptions;
                var modifiedOptions = resolveModifiedOptions(Ctor);
                // update base extend options
                if (modifiedOptions) {
                    extend(Ctor.extendOptions || {}, modifiedOptions);
                }
                options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
            }
        }
        return options;
    }
    function resolveModifiedOptions(Ctor) {
        var modified;
        var latest = Ctor.options;
        var sealed = Ctor.sealedOptions;
        for (var key in latest) {
            if (latest[key] !== sealed[key]) {
                if (!modified)
                    modified = {};
                modified[key] = latest[key];
            }
        }
        return modified;
    }
    function mergeHook(parent, child) {
        parent = parent ? Array.isArray(parent) ? parent : [parent] : parent;
        child = child ? Array.isArray(child) ? parent : [child] : child;
        var res = child
            ? parent
                ? parent.concat(child)
                : child
            : parent;
        return res ? __spread(new Set(res)) : res;
    }

    function initMixin(Vue) {
        Vue.mixin = function (mixin) {
            this.options = mergeOptions(this.options, mixin);
            return this;
        };
    }

    function initExtend(Vue) {
        Vue.cid = 0;
        var cid = 1;
        Vue.extend = function (extendOptions) {
            if (extendOptions === void 0) { extendOptions = {}; }
            var Super = this;
            var name = extendOptions.name || Super.options.name;
            var Sub = extendClass(Super, Super.prototype, function (key) {
                return __spread(['extend', 'mixin', 'use'], ASSET_TYPES).indexOf(key) > -1;
            });
            Sub.super = Super;
            Sub.cid = ++cid;
            Sub.options = mergeOptions(Super.options || {}, extendOptions);
            Sub.extendOptions = extendOptions;
            Sub.sealedOptions = extend({}, Sub.options);
            return Sub;
        };
    }
    /* helper */
    var defaultValidatePropKeyFn = function (val) { return true; };
    function extendClass(Super, proto, some, before) {
        if (some === void 0) { some = defaultValidatePropKeyFn; }
        function VueComponent() {
            typeof before === 'function' && before.bind(this)();
            if (proto && proto.constructor) {
                return proto.constructor.apply(this, arguments);
            }
            else {
                return Super.apply(this, arguments);
            }
        }
        VueComponent.prototype = Object.create(Super.prototype);
        VueComponent.prototype.constructor = VueComponent;
        if (proto) {
            for (var key in proto) {
                if (hasOwn(proto, key)) {
                    if (some(key)) {
                        VueComponent.prototype[key] = proto[key];
                    }
                }
            }
        }
        return VueComponent;
    }

    function initAssetRegisters(Vue) {
        ASSET_TYPES.forEach(function (type) {
            Vue[type] = function (id, definition) {
                if (!definition)
                    return this.options[type + 's'][id];
                if (type === 'component' && isPlainObject(definition)) {
                    definition.name = definition.name || id;
                    definition = this.options._base.extend(definition);
                }
                this.options[type + 's'][id] = definition;
                return definition;
            };
        });
    }

    var Observer$1 = /** @class */ (function () {
        function Observer(value) {
            this.value = value;
            this.dep = new Dep();
            def(value, '__ob__', this);
            if (Array.isArray(value)) {
                value.__proto__ = arrayMethods;
                this.observeArray(value);
            }
            else {
                this.walk(value);
            }
        }
        Observer.prototype.walk = function (obj) {
            Object.keys(obj).forEach(function (key) {
                defineReactive$1(obj, key);
            });
        };
        Observer.prototype.observeArray = function (items) {
            items.forEach(function (item) {
                observe$1(item);
            });
        };
        return Observer;
    }());
    function dependArray$1(values) {
        values.forEach(function (value) {
            if (isObservable$1(value)) {
                value.__ob__.dep.depend();
            }
            if (Array.isArray(value))
                dependArray$1(value);
        });
    }
    function observe$1(value) {
        /* 值类型不用进行响应式转换 */
        if (!isObject(value))
            return;
        if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer$1) {
            return value.__ob__;
        }
        if ((Array.isArray(value) || isPlainObject(value)) &&
            Object.isExtensible(value)) {
            return new Observer$1(value);
        }
    }
    function defineReactive$1(obj, key, val, customSetter, shallow // 如果设置为true，则不会对val进行响应式处理，即只对obj的key属性的值响应式处理
    ) {
        var dep = new Dep();
        var property = Object.getOwnPropertyDescriptor(obj, key);
        if (property && property.configurable === false) {
            return;
        }
        var getter = property && property.get;
        var setter = property && property.set;
        val = val ? val : obj[key];
        var childOb = !shallow && observe$1(val);
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: function reactiveGetter() {
                var value = getter ? getter.call(obj) : val;
                /**
                 * 首先需要知道的是，Dep.target值若不为空，则表示Watcher正在读取它的依赖(读取getter)
                 * 而事情发生在reactiveGetter中，Watcher正在读取obj对象
                 * 那么就通知Watcher将该对象进行收集(在Watcher中会进一步判断是否该对象已经被收集)
                 * 收集的是该状态的Dep，因为dep中存放着Watcher(订阅者)列表
                 *
                 * 与订阅观察者模式的不同是，前者是把所有的事件以及回调存放在一个全局统一变量中，通过事件名触发事件，依次调用回调函数列表中属于该事件名的回调函数
                 * 而在vue中，每个状态都有一份独立的Dep，其中存放的是Watcher，在状态发生变化时，会遍历状态的Dep，触发Watcher的update()方法
                 */
                if (Dep.target) {
                    dep.depend();
                    if (childOb) {
                        childOb.dep.depend();
                        if (Array.isArray(value)) {
                            dependArray$1(value);
                        }
                    }
                }
                return value;
            },
            set: function reactiveSetter(newVal) {
                var value = getter ? getter.call(obj) : val;
                if (newVal === value || (newVal !== newVal && value !== value)) {
                    return;
                }
                if ( customSetter) {
                    customSetter(newVal);
                }
                if (getter && !setter)
                    return;
                if (setter) {
                    setter.call(obj, newVal);
                }
                else {
                    val = newVal;
                }
                childOb = !shallow && observe$1(newVal);
                // 依赖变化后，触发更新，通知Dep类调用notify来触发所有Watcher对象的update方法更新对应视图
                /**
                 * 获取到观察该状态的所有Watcher
                 * 触发更新
                 * (观察者模式中是调用订阅列表中的函数)
                 */
                dep.notify();
            }
        });
    }
    /*  helper */
    function isObservable$1(value) {
        if (value && value.__ob__) {
            return true;
        }
        return false;
    }
    function set(target, key, value) {
        if ( (!target || isPrimitive(target))) {
            console.warn("Cannot set reactive property on undefined, null, or primitive value: " + target);
        }
        if (Array.isArray(target) && typeof key === 'number' && key < target.length) {
            target.length = Math.max(target.length, key);
            target.splice(key, 1, value);
            return value;
        }
        if (key in target && !(key in Object.prototype)) {
            target[key] = value;
            return value;
        }
        var ob = target.__ob__;
        if (!ob) {
            target[key] = value;
            return value;
        }
        defineReactive$1(ob.value, key, value);
        ob.dep.notify();
        return value;
    }
    function del(target, key) {
        if ( (!target || isPrimitive(target))) {
            console.warn("Cannot delete reactive property on undefined, null, or primitive value: " + target);
        }
        if (Array.isArray(target) && typeof key === 'number' && key < target.length) {
            target.splice(key, 1);
            return;
        }
        var ob = target.__ob__;
        if (!hasOwn(target, key)) {
            return;
        }
        delete target[key];
        if (!ob) {
            return;
        }
        ob.dep.notify();
    }

    function setConfig(key, value) {
        if (key === 'set') {
            console.warn('Do not replace the set method');
            return;
        }
        deepset(globalConfig, key, value);
    }
    function initGlobalAPI(Vue) {
        Vue.options = Object.create(null);
        Vue.options._base = Vue;
        ASSET_TYPES.forEach(function (type) {
            Vue.options[type + 's'] = Object.create(null);
        });
        var configDef = {};
        configDef.get = function () { return __assign(__assign({}, globalConfig), { set: setConfig }); };
        {
            configDef.set = function () {
                console.warn('Do not replace the Vue.config object, set individual fields instead.');
            };
        }
        Object.defineProperty(Vue, 'config', configDef);
        initAssetRegisters(Vue);
        initUse(Vue);
        initMixin(Vue);
        initExtend(Vue);
        Vue.set = set;
        Vue.delete = del;
        Vue.observable = function (obj) {
            observe$1(obj);
            return obj;
        };
        Vue.util = {
            defineReactive: defineReactive$1
        };
    }

    var uid$2 = 0;
    var Vue = /** @class */ (function () {
        function Vue(options) {
            if (options === void 0) { options = {}; }
            this._vnode = null;
            this._isMounted = false;
            this.$parent = null;
            this.$options = {};
            this.$vnode = null;
            this.__patch__ = patch;
            this._uid = ++uid$2;
            this._self = this;
            this.$children = [];
            /**
             * 与全局options进行合并
             * 例如Vue.mixin()
             * */
            if (globalConfig.setOptions && options._isComponent) {
                globalConfig.setOptions(this, options);
            }
            else {
                this.$options = mergeOptions(resolveConstructorOptions(this.constructor), options, this);
            }
            this.$el = null;
            initLifecycle(this);
            initEvent(this);
            initRender(this);
            callHook(this, 'beforeCreate');
            initState(this);
            callHook(this, 'created');
        }
        Vue.prototype._render = function () {
            var render = this.$options.render;
            var vnode = render && render.call(this, this.$createElement);
            if (Array.isArray(vnode) && vnode.length === 1) {
                vnode = vnode[0];
            }
            return vnode;
        };
        Vue.prototype._update = function (vnode, hydrating) {
            /**
             * _vnode记录当前DOM映射的VNode
             * 此时的_vnode还没有更新，所以指代的是更新前的vnode
             *  */
            var prevVnode = this._vnode;
            /**
             * 更新_vnode
             * */
            this._vnode = vnode;
            if (!prevVnode) {
                // initial render
                this.$el = this.__patch__(this.$el, vnode);
            }
            else {
                // updates
                this.$el = this.__patch__(prevVnode, vnode);
            }
        };
        Vue.prototype.$mount = function (el, hydrating) {
            var _this = this;
            el = el && inBrowser ? query(el) : undefined;
            if (el === document.body || el === document.documentElement) {
                 console.warn("Do not mount Vue to <html> or <body> - mount to normal elements instead.");
                return this;
            }
            this.$el = el || null;
            /**
             * render watcher
             * 观察渲染函数中状态(state，observer)的变化，如果变化则触发更新(_update)
             * 之所以能够观察到渲染函数中的状态是因为Watcher需要监听的表达式是一个函数，如果是一个函数，则其中所有被访问的对象都会被监听
             */
            new Watcher(this, function () {
                _this._update(_this._render(), hydrating);
            }, noop, undefined, true);
            this._isMounted = true;
            callHook(this, 'mounted');
        };
        /* event */
        Vue.prototype.$on = function (event, fn) {
            var vm = this;
            if (Array.isArray(event)) {
                event.forEach(function (e) {
                    vm.$on(e, fn);
                });
            }
            else {
                if (!vm._events[event]) {
                    vm._events[event] = [];
                }
                vm._events[event].push(fn);
            }
            return vm;
        };
        Vue.prototype.$off = function (event, fn) {
            var vm = this;
            if (!event) {
                vm._events = Object.create(null);
                return vm;
            }
            if (Array.isArray(event)) {
                event.forEach(function (e) {
                    vm.$off(e, fn);
                });
            }
            else {
                var cbs = vm._events[event];
                if (!cbs) {
                    return vm;
                }
                /* 没有指定回调函数，则清空回调列表 */
                if (!fn) {
                    vm._events[event] = null;
                    return vm;
                }
                /* 删除指定的回调函数 */
                var cb = void 0;
                var i = cbs.length;
                while (i--) {
                    cb = cbs[i];
                    if (cb === fn || cb.fn === fn) {
                        cbs.splice(i, 1);
                        break;
                    }
                }
            }
            return vm;
        };
        Vue.prototype.$once = function (event, fn) {
            var vm = this;
            function on() {
                vm.$off(event, on);
                fn.apply(vm, arguments);
            }
            on.fn = fn;
            vm.$on(event, on);
            return vm;
        };
        Vue.prototype.$emit = function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var vm = this;
            var cbs = vm._events[event];
            if (cbs) {
                cbs = Array.isArray(cbs) ? cbs.length > 1 ? __spread(cbs) : cbs : [cbs];
                cbs.forEach(function (cb) {
                    try {
                        args ? cb.apply(vm, args) : cb.call(vm);
                    }
                    catch (error) {
                        console.error("event handler for \"" + event + "\" (Promise/async)", error);
                    }
                });
            }
            return vm;
        };
        Vue._installedPlugins = [];
        return Vue;
    }());
    initGlobalAPI(Vue);

    var uid$3 = 0;
    var Vue$1 = /** @class */ (function () {
        function Vue(options) {
            if (options === void 0) { options = {}; }
            this._vnode = null;
            this._isMounted = false;
            this.$parent = null;
            this.$options = {};
            this.$vnode = null;
            this.__patch__ = patch;
            this._uid = ++uid$3;
            this._self = this;
            this.$children = [];
            /**
             * 与全局options进行合并
             * 例如Vue.mixin()
             * */
            if (globalConfig.setOptions && options._isComponent) {
                globalConfig.setOptions(this, options);
            }
            else {
                this.$options = mergeOptions(resolveConstructorOptions(this.constructor), options, this);
            }
            this.$el = null;
            initLifecycle(this);
            initEvent(this);
            initRender(this);
            callHook(this, 'beforeCreate');
            initState(this);
            callHook(this, 'created');
        }
        Vue.prototype._render = function () {
            var render = this.$options.render;
            var vnode = render && render.call(this, this.$createElement);
            if (Array.isArray(vnode) && vnode.length === 1) {
                vnode = vnode[0];
            }
            return vnode;
        };
        Vue.prototype._update = function (vnode, hydrating) {
            /**
             * _vnode记录当前DOM映射的VNode
             * 此时的_vnode还没有更新，所以指代的是更新前的vnode
             *  */
            var prevVnode = this._vnode;
            /**
             * 更新_vnode
             * */
            this._vnode = vnode;
            if (!prevVnode) {
                // initial render
                this.$el = this.__patch__(this.$el, vnode);
            }
            else {
                // updates
                this.$el = this.__patch__(prevVnode, vnode);
            }
        };
        Vue.prototype.$mount = function (el, hydrating) {
            var _this = this;
            el = el && inBrowser ? query(el) : undefined;
            if (el === document.body || el === document.documentElement) {
                 console.warn("Do not mount Vue to <html> or <body> - mount to normal elements instead.");
                return this;
            }
            this.$el = el || null;
            /**
             * render watcher
             * 观察渲染函数中状态(state，observer)的变化，如果变化则触发更新(_update)
             * 之所以能够观察到渲染函数中的状态是因为Watcher需要监听的表达式是一个函数，如果是一个函数，则其中所有被访问的对象都会被监听
             */
            new Watcher(this, function () {
                _this._update(_this._render(), hydrating);
            }, noop, undefined, true);
            this._isMounted = true;
            callHook(this, 'mounted');
        };
        /* event */
        Vue.prototype.$on = function (event, fn) {
            var vm = this;
            if (Array.isArray(event)) {
                event.forEach(function (e) {
                    vm.$on(e, fn);
                });
            }
            else {
                if (!vm._events[event]) {
                    vm._events[event] = [];
                }
                vm._events[event].push(fn);
            }
            return vm;
        };
        Vue.prototype.$off = function (event, fn) {
            var vm = this;
            if (!event) {
                vm._events = Object.create(null);
                return vm;
            }
            if (Array.isArray(event)) {
                event.forEach(function (e) {
                    vm.$off(e, fn);
                });
            }
            else {
                var cbs = vm._events[event];
                if (!cbs) {
                    return vm;
                }
                /* 没有指定回调函数，则清空回调列表 */
                if (!fn) {
                    vm._events[event] = null;
                    return vm;
                }
                /* 删除指定的回调函数 */
                var cb = void 0;
                var i = cbs.length;
                while (i--) {
                    cb = cbs[i];
                    if (cb === fn || cb.fn === fn) {
                        cbs.splice(i, 1);
                        break;
                    }
                }
            }
            return vm;
        };
        Vue.prototype.$once = function (event, fn) {
            var vm = this;
            function on() {
                vm.$off(event, on);
                fn.apply(vm, arguments);
            }
            on.fn = fn;
            vm.$on(event, on);
            return vm;
        };
        Vue.prototype.$emit = function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var vm = this;
            var cbs = vm._events[event];
            if (cbs) {
                cbs = Array.isArray(cbs) ? cbs.length > 1 ? __spread(cbs) : cbs : [cbs];
                cbs.forEach(function (cb) {
                    try {
                        args ? cb.apply(vm, args) : cb.call(vm);
                    }
                    catch (error) {
                        console.error("event handler for \"" + event + "\" (Promise/async)", error);
                    }
                });
            }
            return vm;
        };
        Vue._installedPlugins = [];
        return Vue;
    }());
    initGlobalAPI(Vue$1);

    function computedMergeStrategy(parent, child) {
        if (!parent)
            return child;
        var res = Object.create(null);
        extend(res, parent);
        if (child)
            extend(res, child);
        return res;
    }
    var sharedPropertyDefinition$1 = {
        enumerable: true,
        configurable: true,
        get: noop,
        set: noop
    };
    function initComputed(vm, computed) {
        var watchers = vm._computedWatchers = Object.create(null);
        for (var key in computed) {
            var userDef = computed[key];
            /** computed可能是一个function也可能是getter + setter */
            var getter = typeof userDef === 'function' ? userDef : userDef.get;
            if ( !getter) {
                console.warn("Getter is missing for computed property \"" + key + "\".");
            }
            watchers[key] = new Watcher(vm, getter || noop, noop, {
                lazy: true
            });
            if (!(key in vm)) {
                defineComputed(vm, key, userDef);
            }
        }
    }
    function defineComputed(target, key, userDef) {
        // 默认computed应该缓存
        if (typeof userDef === 'function') {
            sharedPropertyDefinition$1.get = createComputedGetter(key);
            sharedPropertyDefinition$1.set = noop;
        }
        else {
            sharedPropertyDefinition$1.get = userDef.get ?
                userDef.cache !== false
                    ? createComputedGetter(key)
                    : createGetterInvoker(userDef.get) // 绑定getter的作用域?
                : noop;
            sharedPropertyDefinition$1.set = userDef.set || noop;
        }
        Object.defineProperty(target, key, sharedPropertyDefinition$1);
    }
    function createComputedGetter(key) {
        return function computedGetter() {
            var watcher = this._computedWatchers && this._computedWatchers[key];
            if (watcher) {
                /**
                 * 脏检测，在计算属性中的依赖发生变化时，dirty会变为true，
                 * 在get的时候重新计算计算属性的输出值
                 */
                // TODO 第一次更状态新时，不能及时的响应
                if (watcher.dirty) {
                    watcher.evaluate();
                }
                /** 收集依赖 */
                if (Dep.target) {
                    watcher.depend();
                }
                return watcher.value;
            }
        };
    }
    function createGetterInvoker(fn) {
        return function computedGetter() {
            return fn.call(this, this);
        };
    }
    function install(Vue) {
        if (install.installed)
            return;
        install.installed = true;
        Vue.config.set('optionMergeStrategies.computed', computedMergeStrategy);
        Vue.mixin({
            created: function () {
                var vm = this;
                var computed = this.$options.computed;
                initComputed(vm, computed);
            }
        });
    }
    var computedPlugin = {
        install: install
    };

    function install$1(Vue) {
        Vue.use(computedPlugin);
        Vue.mixin({
            beforeCreate: function () {
                var options = this.$options;
                if (options.store) {
                    this.$store = typeof options.store === 'function'
                        ? options.store()
                        : options.store;
                }
                else if (options.parent && options.parent.$store) {
                    this.$store = options.parent.$store;
                }
            }
        });
    }

    function assert(condition, msg) {
        if (!condition)
            throw new Error("[vuex] " + msg);
    }
    function forEachValue(obj, fn) {
        Object.keys(obj).forEach(function (key) {
            fn(obj[key], key);
        });
    }
    function partial(fn) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return function () {
            return fn.apply(void 0, __spread(args));
        };
    }

    var Module = /** @class */ (function () {
        function Module(rawModule, runtime) {
            this.runtime = runtime;
            this._children = Object.create(null);
            this._rawModule = rawModule;
            var rawState = rawModule.state;
            this.state = (typeof rawState === 'function' ? rawState() : rawState) || {};
        }
        Object.defineProperty(Module.prototype, "namespaced", {
            get: function () {
                return this._rawModule.namespaced;
            },
            enumerable: false,
            configurable: true
        });
        Module.prototype.addChild = function (module, key) {
            this._children[key] = module;
        };
        Module.prototype.removeChild = function (key) {
            delete this._children[key];
        };
        Module.prototype.getChild = function (key) {
            return this._children[key];
        };
        Module.prototype.hasChild = function (key) {
            return key in this._children;
        };
        /**
         * 更新本模块中的各个状态
         */
        Module.prototype.update = function (rawModule) {
            this._rawModule.namespaced = rawModule.namespaced;
            if (rawModule.actions) {
                this._rawModule.actions = rawModule.actions;
            }
            if (rawModule.mutations) {
                this._rawModule.mutations = rawModule.mutations;
            }
            if (rawModule.getters) {
                this._rawModule.getters = rawModule.getters;
            }
        };
        Module.prototype.forEachChild = function (fn) {
            forEachValue(this._children, fn);
        };
        Module.prototype.forEachGetter = function (fn) {
            if (this._rawModule.getters) {
                forEachValue(this._rawModule.getters, fn);
            }
        };
        Module.prototype.forEachAction = function (fn) {
            if (this._rawModule.actions) {
                forEachValue(this._rawModule.actions, fn);
            }
        };
        Module.prototype.forEachMutation = function (fn) {
            if (this._rawModule.mutations) {
                forEachValue(this._rawModule.mutations, fn);
            }
        };
        return Module;
    }());

    // TODO 暂时仅设只有根模块
    var ModuleCollection = /** @class */ (function () {
        function ModuleCollection(rawRootModule) {
            this.register([], rawRootModule, false);
        }
        ModuleCollection.prototype.getModule = function (path) {
            return path.reduce(function (module, key) {
                return module.getChild(key);
            }, this.root);
        };
        ModuleCollection.prototype.getNamespace = function (path) {
            var module = this.root;
            return path.reduce(function (namespace, key) {
                module = module.getChild(key);
                return namespace + (module.namespaced ? key + '/' : '');
            }, '');
        };
        ModuleCollection.prototype.register = function (path, rawModule, runtime) {
            var _this = this;
            if (runtime === void 0) { runtime = true; }
            var newModule = new Module(rawModule, runtime);
            if (path.length === 0) {
                this.root = newModule;
            }
            else {
                var parent = this.getModule(path.splice(0, -1));
                parent.addChild(newModule, path[path.length - 1]);
            }
            if (rawModule.modules) {
                forEachValue(rawModule.modules, function (rawChildModule, key) {
                    _this.register(path.concat(key), rawChildModule, runtime);
                });
            }
        };
        ModuleCollection.prototype.unregister = function (path) {
            var parent = this.getModule(path.slice(0, -1));
            var key = path[path.length - 1];
            var child = parent.getChild(key);
            if (!child) {
                {
                    console.warn("[vuex] trying to unregister module '" + key + "', which is " +
                        "not registered");
                }
                return;
            }
            if (!child.runtime) {
                return;
            }
            parent.removeChild(key);
        };
        ModuleCollection.prototype.update = function (newModule) {
            update([], this.root, newModule);
        };
        ModuleCollection.prototype.isRegistered = function (path) {
            var parent = this.getModule(path.slice(0, -1));
            var key = path[path.length - 1];
            return !!parent.hasChild(key);
        };
        return ModuleCollection;
    }());
    function update(path, targetModule, newModule) {
        targetModule.update(newModule);
        // 更新子模块
        if (newModule.modules) {
            // 遍历modules选项
            for (var key in newModule.modules) {
                // 如果targetModule不存在key模块，则不做操作
                if (!targetModule.getChild(key)) {
                    {
                        console.warn("[vuex] trying to add a new module '" + key + "' on hot reloading, " +
                            'manual reload is needed');
                    }
                    return;
                }
                update(path.concat(key), targetModule.getChild(key), newModule.modules[key]);
            }
        }
    }

    var Store = /** @class */ (function () {
        function Store(options) {
            if (options === void 0) { options = { plugins: [], strict: false }; }
            /* 是否在进行提交状态的标识 */
            this._committing = false;
            /* acitons操作对象 */
            this._actions = Object.create(null);
            /* mutations操作对象 */
            this._mutations = Object.create(null);
            /* 封装后的getters集合对象 */
            this._wrappedGetters = Object.create(null);
            /* 存储分析后的modules */
            this._moduleCollection = new ModuleCollection(options);
            this._modulesNamespaceMap = Object.create(null);
            this._makeLocalGettersCache = Object.create(null);
            /* 订阅函数集合，Vuex提供了subscribe功能 */
            this._watcherVM = new Vue();
            var store = this;
            var state = this._moduleCollection.root.state;
            var _a = this, dispatch = _a.dispatch, commit = _a.commit;
            /* 绑定作用域 */
            this.dispatch = function boundDispatch(type, payload) {
                return dispatch.call(store, type, payload);
            };
            this.commit = function boundCommit(type, payload, options) {
                return commit.call(store, type, payload, options);
            };
            installModule(this, state, [], this._moduleCollection.root);
            resetStoreVM(this, state);
        }
        Object.defineProperty(Store.prototype, "state", {
            get: function () {
                return this._vm._data.$$state;
            },
            enumerable: false,
            configurable: true
        });
        Store.prototype.commit = function (_type, _payload, _options) {
            var _a = unifyObjectStyle(_type, _payload, _options), type = _a.type, payload = _a.payload;
            var entry = this._mutations[type];
            if (!entry) {
                {
                    console.error("[vuex] unknown mutation type: " + type);
                }
                return;
            }
            this._withCommit(function () {
                entry.forEach(function commitIterator(handler) {
                    handler(payload);
                });
            });
        };
        Store.prototype.dispatch = function (_type, _payload) {
            var _a = unifyObjectStyle(_type, _payload), type = _a.type, payload = _a.payload;
            var entry = this._actions[type];
            if (!entry) {
                {
                    console.error("[vuex] unknown action type: " + type);
                }
                return;
            }
            var result = entry.length > 1
                ? Promise.all(entry.map(function (handler) { return handler(payload); }))
                : entry[0](payload);
        };
        Store.prototype._withCommit = function (fn) {
            var committing = this._committing;
            this._committing = true;
            fn();
            this._committing = committing;
        };
        return Store;
    }());
    function unifyObjectStyle(type, payload, options) {
        if (typeof type !== 'string' && type.type) {
            options = payload;
            payload = type;
            type = type.type;
        }
        {
            assert(typeof type === 'string', "expects string as the type, but found " + typeof type + ".");
        }
        return { type: type, payload: payload, options: options };
    }
    function installModule(store, rootState, path, module, hot) {
        var isRoot = !path.length;
        var namespace = store._moduleCollection.getNamespace(path);
        if (module.namespaced) {
            if (store._modulesNamespaceMap[namespace] && __DEV__) {
                console.error("[vuex] duplicate namespace " + namespace + " for the namespaced module " + path.join('/'));
            }
            store._modulesNamespaceMap[namespace] = module;
        }
        /* 设置子模块中的state */
        if (!isRoot && !hot) {
            var parentState_1 = getNestedState(rootState, path.slice(0, -1));
            var moduleName_1 = path[path.length - 1];
            store._withCommit(function () {
                {
                    if (moduleName_1 in parentState_1) {
                        console.warn("[vuex] state field \"" + moduleName_1 + "\" was overridden by a module with the same name at \"" + path.join('.') + "\"");
                    }
                }
                /* key为模块名，值为模块的state */
                Vue.set(parentState_1, moduleName_1, module.state);
            });
        }
        var local = module.context = makeLocalContext(store, namespace, path);
        /* 将mutation集中到state._mutations中集中管理 */
        module.forEachMutation(function (mutation, key) {
            var namespacedType = namespace + key;
            var entry = store._mutations[namespacedType] || (store._mutations[namespacedType] = []);
            entry.push(function wrappedMutationHandler(payload) {
                mutation.call(store, local.state, payload);
            });
        });
        module.forEachAction(function (mutation, key) {
            var namespacedType = namespace + key;
            var entry = store._actions[namespacedType] || (store._actions[namespacedType] = []);
            entry.push(function wrappedActionHandler(payload) {
                var res = mutation.call(store, {
                    dispatch: local.dispatch,
                    commit: local.commit,
                    getters: local.getters,
                    state: local.state,
                    rootGetters: store.getters,
                    rootState: store.state
                }, payload);
                if (!isPromise(res)) {
                    // 转换为异步
                    res = Promise.resolve(res);
                }
                return res;
            });
        });
        module.forEachGetter(function (getter, key) {
            var namespacedType = namespace + key;
            var entry = store._wrappedGetters[namespacedType];
            if (entry) {
                {
                    console.error("[vuex] duplicate getter key: " + key);
                }
                return;
            }
            store._wrappedGetters[namespacedType] = function wrapperGetter() {
                return getter(local.state, local.getters, store.state, store.getters);
            };
        });
        /* 处理子模块 */
        module.forEachChild(function (child, key) {
            installModule(store, rootState, path.concat(key), child, hot);
        });
    }
    function resetStoreVM(store, state, hot) {
        store.getters = {};
        var wrappedGetters = store._wrappedGetters;
        var computed = {};
        forEachValue(wrappedGetters, function (fn, key) {
            computed[key] = partial(fn, store);
            Object.defineProperty(store.getters, key, {
                get: function () { return store._vm[key]; },
                enumerable: true
            });
        });
        store._vm = new Vue({
            data: {
                $$state: state
            },
            computed: computed
        });
    }
    function makeLocalContext(store, namespace, path) {
        var noNamespace = namespace === '';
        var local = {
            commit: noNamespace ? store.commit : function (_type, _payload, _options) {
                var args = unifyObjectStyle(_type, _payload, _options);
                var payload = args.payload, options = args.options;
                var type = args.type;
                if (!options || !options.root) {
                    type = namespace + type;
                    if ( !store._mutations[type]) {
                        console.error("[vuex] unknown local mutation type: " + args.type + ", global type: " + type);
                        return;
                    }
                }
                store.commit(type, payload, options);
            },
            dispatch: noNamespace ? store.dispatch : function (_type, _payload, _options) {
                var args = unifyObjectStyle(_type, _payload, _options);
                var payload = args.payload, options = args.options;
                var type = args.type;
                if (!options || !options.root) {
                    type = namespace + type;
                    if ( !store._actions[type]) {
                        console.error("[vuex] unknown local action type: " + args.type + ", global type: " + type);
                        return;
                    }
                }
                return store.dispatch(type, payload);
            }
        };
        // getters and state object must be gotten lazily
        // because they will be changed by vm update
        Object.defineProperties(local, {
            getters: {
                get: noNamespace ? function () { return store.getters; } : function () { return makeLocalGetters(store, name); }
            },
            state: {
                get: function () { return getNestedState(store.state, path); }
            }
        });
        return local;
    }
    function makeLocalGetters(store, namespace) {
        if (store._makeLocalGettersCache[namespace]) {
            var gettersProxy_1 = {};
            var splitPos_1 = namespace.length; // 带命名空间的模块的模块名
            Object.keys(store.getters).forEach(function (type) {
                // 不是以该模块名起始的getter,即不是该模块中的getter
                if (type.slice(0, splitPos_1) !== namespace)
                    return;
                var localType = type.slice(splitPos_1);
                Object.defineProperty(gettersProxy_1, localType, {
                    get: function () { return store.getters[type]; },
                    enumerable: true
                });
            });
            store._makeLocalGettersCache[namespace] = gettersProxy_1;
        }
        return store._makeLocalGettersCache[namespace];
    }
    function getNestedState(state, path) {
        if (!path)
            return;
        return path.reduce(function (state, key) {
            return state[key];
        }, state);
    }

    var Vuex = {
        install: install$1,
        Store: Store
    };

    Vue.use(Vuex);
    var state = {
        count: 0
    };
    var getters = {
        evenOrOdd: function (state) { return state.count % 2 === 0 ? 'even' : 'odd'; }
    };
    var mutations = {
        increment: function (state) {
            state.count++;
        },
        decrement: function (state) {
            state.count--;
        }
    };
    var actions = {
        incrementIfOdd: function (_a) {
            var commit = _a.commit, state = _a.state;
            if ((state.count + 1) % 2 === 0) {
                commit('increment');
            }
        },
        incrementAsync: function (_a) {
            var commit = _a.commit;
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    commit('increment');
                    resolve();
                }, 1000);
            });
        }
    };
    var module = {
        namespaced: true,
        state: {
            firstName: 'tom',
            lastName: ' james'
        },
        getters: {
            fullName: function (_a) {
                var firstName = _a.firstName, lastName = _a.lastName;
                return firstName + ' ' + lastName;
            }
        },
        mutations: {
            changeFirstName: function (state) {
                state.firstName = state.firstName + ' D ';
            }
        }
    };
    var store = new Vuex.Store({
        state: state,
        getters: getters,
        mutations: mutations,
        actions: actions,
        modules: { user: module }
    });
    var vm = new Vue({
        store: store,
        data: function () {
            return {
                text: 'text'
            };
        },
        methods: {
            increment: function () {
                this.$store.commit('increment');
            },
            decrement: function () {
                this.$store.commit('decrement');
            },
            incrementIfOdd: function () {
                this.$store.dispatch('incrementIfOdd');
            },
            incrementAsync: function () {
                this.$store.dispatch('incrementAsync');
            },
        },
        render: function (h) {
            var _a = this, increment = _a.increment, decrement = _a.decrement, incrementIfOdd = _a.incrementIfOdd, incrementAsync = _a.incrementAsync;
            var _b = this.$store, state = _b.state, getters = _b.getters;
            // TODO 第二次点击后，getters.evenOrOdd没有发生变化
            return h('div', { attrs: { id: 'app' } }, [
                h('p', "Clicked " + state.count + " times, count is " + getters.evenOrOdd),
                h('button', { on: { click: increment } }, 'increment'),
                h('button', { on: { click: decrement } }, 'decrement'),
                h('button', { on: { click: incrementIfOdd } }, 'incrementIfOdd'),
                h('button', { on: { click: incrementAsync } }, 'incrementAsync'),
            ]);
        }
    }).$mount('#app');

}());
