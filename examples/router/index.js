(function () {
  'use strict';

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
  function noop() { }
  var camelizeRE = /-(\w)/g;
  var camelize = function (str) {
      return str.replace(camelizeRE, function (_, c) { return (c ? c.toUpperCase() : ''); });
  };
  var hyphenateRE = /\B([A-Z])/g;
  var hyphenate = function (str) {
      return str.replace(hyphenateRE, '-$1').toLowerCase();
  };
  var capitalize = function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
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
  /**
   * on   - getter => dep.depend() => watcher.deps.add(dep)
   * emit - update => run
   */

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
  /* global Reflect, Promise */

  var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
      return extendStatics(d, b);
  };

  function __extends(d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

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

  function initEvent(vm) {
      vm._events = Object.create(null);
  }
  function initLifecycle(vm) {
      vm._isMounted = false;
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
  }

  var uid$2 = 0;
  var Vue = /** @class */ (function () {
      function Vue(options) {
          if (options === void 0) { options = {}; }
          this._vnode = null;
          this._isMounted = false;
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
          // console.log(options, globalConfig);
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
      Vue._installedPlugins = [];
      return Vue;
  }());
  initGlobalAPI(Vue);

  /**
   * Tokenize input string.
   */
  function lexer(str) {
      var tokens = [];
      var i = 0;
      while (i < str.length) {
          var char = str[i];
          if (char === "*" || char === "+" || char === "?") {
              tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
              continue;
          }
          if (char === "\\") {
              tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
              continue;
          }
          if (char === "{") {
              tokens.push({ type: "OPEN", index: i, value: str[i++] });
              continue;
          }
          if (char === "}") {
              tokens.push({ type: "CLOSE", index: i, value: str[i++] });
              continue;
          }
          if (char === ":") {
              var name = "";
              var j = i + 1;
              while (j < str.length) {
                  var code = str.charCodeAt(j);
                  if (
                  // `0-9`
                  (code >= 48 && code <= 57) ||
                      // `A-Z`
                      (code >= 65 && code <= 90) ||
                      // `a-z`
                      (code >= 97 && code <= 122) ||
                      // `_`
                      code === 95) {
                      name += str[j++];
                      continue;
                  }
                  break;
              }
              if (!name)
                  throw new TypeError("Missing parameter name at " + i);
              tokens.push({ type: "NAME", index: i, value: name });
              i = j;
              continue;
          }
          if (char === "(") {
              var count = 1;
              var pattern = "";
              var j = i + 1;
              if (str[j] === "?") {
                  throw new TypeError("Pattern cannot start with \"?\" at " + j);
              }
              while (j < str.length) {
                  if (str[j] === "\\") {
                      pattern += str[j++] + str[j++];
                      continue;
                  }
                  if (str[j] === ")") {
                      count--;
                      if (count === 0) {
                          j++;
                          break;
                      }
                  }
                  else if (str[j] === "(") {
                      count++;
                      if (str[j + 1] !== "?") {
                          throw new TypeError("Capturing groups are not allowed at " + j);
                      }
                  }
                  pattern += str[j++];
              }
              if (count)
                  throw new TypeError("Unbalanced pattern at " + i);
              if (!pattern)
                  throw new TypeError("Missing pattern at " + i);
              tokens.push({ type: "PATTERN", index: i, value: pattern });
              i = j;
              continue;
          }
          tokens.push({ type: "CHAR", index: i, value: str[i++] });
      }
      tokens.push({ type: "END", index: i, value: "" });
      return tokens;
  }
  /**
   * Parse a string for the raw tokens.
   */
  function parse(str, options) {
      if (options === void 0) { options = {}; }
      var tokens = lexer(str);
      var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a;
      var defaultPattern = "[^" + escapeString(options.delimiter || "/#?") + "]+?";
      var result = [];
      var key = 0;
      var i = 0;
      var path = "";
      var tryConsume = function (type) {
          if (i < tokens.length && tokens[i].type === type)
              return tokens[i++].value;
      };
      var mustConsume = function (type) {
          var value = tryConsume(type);
          if (value !== undefined)
              return value;
          var _a = tokens[i], nextType = _a.type, index = _a.index;
          throw new TypeError("Unexpected " + nextType + " at " + index + ", expected " + type);
      };
      var consumeText = function () {
          var result = "";
          var value;
          // tslint:disable-next-line
          while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
              result += value;
          }
          return result;
      };
      while (i < tokens.length) {
          var char = tryConsume("CHAR");
          var name = tryConsume("NAME");
          var pattern = tryConsume("PATTERN");
          if (name || pattern) {
              var prefix = char || "";
              if (prefixes.indexOf(prefix) === -1) {
                  path += prefix;
                  prefix = "";
              }
              if (path) {
                  result.push(path);
                  path = "";
              }
              result.push({
                  name: name || key++,
                  prefix: prefix,
                  suffix: "",
                  pattern: pattern || defaultPattern,
                  modifier: tryConsume("MODIFIER") || ""
              });
              continue;
          }
          var value = char || tryConsume("ESCAPED_CHAR");
          if (value) {
              path += value;
              continue;
          }
          if (path) {
              result.push(path);
              path = "";
          }
          var open = tryConsume("OPEN");
          if (open) {
              var prefix = consumeText();
              var name_1 = tryConsume("NAME") || "";
              var pattern_1 = tryConsume("PATTERN") || "";
              var suffix = consumeText();
              mustConsume("CLOSE");
              result.push({
                  name: name_1 || (pattern_1 ? key++ : ""),
                  pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
                  prefix: prefix,
                  suffix: suffix,
                  modifier: tryConsume("MODIFIER") || ""
              });
              continue;
          }
          mustConsume("END");
      }
      return result;
  }
  /**
   * Compile a string to a template function for the path.
   */
  function compile(str, options) {
      return tokensToFunction(parse(str, options), options);
  }
  /**
   * Expose a method for transforming tokens into the path function.
   */
  function tokensToFunction(tokens, options) {
      if (options === void 0) { options = {}; }
      var reFlags = flags(options);
      var _a = options.encode, encode = _a === void 0 ? function (x) { return x; } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
      // Compile all the tokens into regexps.
      var matches = tokens.map(function (token) {
          if (typeof token === "object") {
              return new RegExp("^(?:" + token.pattern + ")$", reFlags);
          }
      });
      return function (data) {
          var path = "";
          for (var i = 0; i < tokens.length; i++) {
              var token = tokens[i];
              if (typeof token === "string") {
                  path += token;
                  continue;
              }
              var value = data ? data[token.name] : undefined;
              var optional = token.modifier === "?" || token.modifier === "*";
              var repeat = token.modifier === "*" || token.modifier === "+";
              if (Array.isArray(value)) {
                  if (!repeat) {
                      throw new TypeError("Expected \"" + token.name + "\" to not repeat, but got an array");
                  }
                  if (value.length === 0) {
                      if (optional)
                          continue;
                      throw new TypeError("Expected \"" + token.name + "\" to not be empty");
                  }
                  for (var j = 0; j < value.length; j++) {
                      var segment = encode(value[j], token);
                      if (validate && !matches[i].test(segment)) {
                          throw new TypeError("Expected all \"" + token.name + "\" to match \"" + token.pattern + "\", but got \"" + segment + "\"");
                      }
                      path += token.prefix + segment + token.suffix;
                  }
                  continue;
              }
              if (typeof value === "string" || typeof value === "number") {
                  var segment = encode(String(value), token);
                  if (validate && !matches[i].test(segment)) {
                      throw new TypeError("Expected \"" + token.name + "\" to match \"" + token.pattern + "\", but got \"" + segment + "\"");
                  }
                  path += token.prefix + segment + token.suffix;
                  continue;
              }
              if (optional)
                  continue;
              var typeOfMessage = repeat ? "an array" : "a string";
              throw new TypeError("Expected \"" + token.name + "\" to be " + typeOfMessage);
          }
          return path;
      };
  }
  /**
   * Escape a regular expression string.
   */
  function escapeString(str) {
      return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
  }
  /**
   * Get the flags for a regexp from the options.
   */
  function flags(options) {
      return options && options.sensitive ? "" : "i";
  }
  /**
   * Pull out keys from a regexp.
   */
  function regexpToRegexp(path, keys) {
      if (!keys)
          return path;
      var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
      var index = 0;
      var execResult = groupsRegex.exec(path.source);
      while (execResult) {
          keys.push({
              // Use parenthesized substring match if available, index otherwise
              name: execResult[1] || index++,
              prefix: "",
              suffix: "",
              modifier: "",
              pattern: ""
          });
          execResult = groupsRegex.exec(path.source);
      }
      return path;
  }
  /**
   * Transform an array into a regexp.
   */
  function arrayToRegexp(paths, keys, options) {
      var parts = paths.map(function (path) { return pathToRegexp(path, keys, options).source; });
      return new RegExp("(?:" + parts.join("|") + ")", flags(options));
  }
  /**
   * Create a path regexp from string input.
   */
  function stringToRegexp(path, keys, options) {
      return tokensToRegexp(parse(path, options), keys, options);
  }
  /**
   * Expose a function for taking tokens and returning a RegExp.
   */
  function tokensToRegexp(tokens, keys, options) {
      if (options === void 0) { options = {}; }
      var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function (x) { return x; } : _d;
      var endsWith = "[" + escapeString(options.endsWith || "") + "]|$";
      var delimiter = "[" + escapeString(options.delimiter || "/#?") + "]";
      var route = start ? "^" : "";
      // Iterate over the tokens and create our regexp string.
      for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
          var token = tokens_1[_i];
          if (typeof token === "string") {
              route += escapeString(encode(token));
          }
          else {
              var prefix = escapeString(encode(token.prefix));
              var suffix = escapeString(encode(token.suffix));
              if (token.pattern) {
                  if (keys)
                      keys.push(token);
                  if (prefix || suffix) {
                      if (token.modifier === "+" || token.modifier === "*") {
                          var mod = token.modifier === "*" ? "?" : "";
                          route += "(?:" + prefix + "((?:" + token.pattern + ")(?:" + suffix + prefix + "(?:" + token.pattern + "))*)" + suffix + ")" + mod;
                      }
                      else {
                          route += "(?:" + prefix + "(" + token.pattern + ")" + suffix + ")" + token.modifier;
                      }
                  }
                  else {
                      route += "(" + token.pattern + ")" + token.modifier;
                  }
              }
              else {
                  route += "(?:" + prefix + suffix + ")" + token.modifier;
              }
          }
      }
      if (end) {
          if (!strict)
              route += delimiter + "?";
          route += !options.endsWith ? "$" : "(?=" + endsWith + ")";
      }
      else {
          var endToken = tokens[tokens.length - 1];
          var isEndDelimited = typeof endToken === "string"
              ? delimiter.indexOf(endToken[endToken.length - 1]) > -1
              : // tslint:disable-next-line
                  endToken === undefined;
          if (!strict) {
              route += "(?:" + delimiter + "(?=" + endsWith + "))?";
          }
          if (!isEndDelimited) {
              route += "(?=" + delimiter + "|" + endsWith + ")";
          }
      }
      return new RegExp(route, flags(options));
  }
  /**
   * Normalize the given path string, returning a regular expression.
   *
   * An empty array can be passed in for the keys, which will hold the
   * placeholder key descriptions. For example, using `/user/:id`, `keys` will
   * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
   */
  function pathToRegexp(path, keys, options) {
      if (path instanceof RegExp)
          return regexpToRegexp(path, keys);
      if (Array.isArray(path))
          return arrayToRegexp(path, keys, options);
      return stringToRegexp(path, keys, options);
  }

  /**
   * '//'转换为'/'
   */
  function cleanPath(path) {
      return path.replace(/\/\//g, '/');
  }
  /**
   * 解析相对路径与绝对路径
   */
  function resolvePath(relative, base, append) {
      var firstChar = relative.charAt(0);
      if (firstChar === '/') {
          return relative;
      }
      if (firstChar === '?' || firstChar === '#') {
          return base + relative;
      }
      var stack = base.split('/');
      if (!append || !stack[stack.length - 1]) {
          stack.pop();
      }
      var segments = relative.replace(/^\//, '').split('/');
      for (var i = 0; i < segments.length; i++) {
          var segment = segments[i];
          if (segment === '..') {
              stack.pop();
          }
          else if (segment !== '.') {
              stack.push(segment);
          }
      }
      if (stack[0] !== '') {
          stack.unshift('');
      }
      return stack.join('/');
  }
  /**
   * 返回路径的绝对路径、查询参数和hash值
   */
  function parsePath$1(path) {
      var hash = '';
      var query = '';
      var hashIndex = path.indexOf('#');
      if (hashIndex >= 0) {
          hash = path.slice(hashIndex);
          path = path.slice(0, hashIndex);
      }
      var queryIndex = path.indexOf('?');
      if (queryIndex >= 0) {
          query = path.slice(queryIndex + 1);
          path = path.slice(0, queryIndex);
      }
      return {
          path: path,
          query: query,
          hash: hash
      };
  }

  function createRouteMap(routes, oldPathList, oldPathMap, oldNameMap) {
      if (oldPathList === void 0) { oldPathList = []; }
      if (oldPathMap === void 0) { oldPathMap = Object.create(null); }
      if (oldNameMap === void 0) { oldNameMap = Object.create(null); }
      var pathList = oldPathList;
      var pathMap = oldPathMap;
      var nameMap = oldNameMap;
      routes.forEach(function (route) {
          addRouteRecord({
              pathList: pathList,
              pathMap: pathMap,
              nameMap: nameMap,
              route: route
          });
      });
      // 确保通配符路由总是在最后
      var index = pathList.indexOf('*');
      if (index > -1) {
          pathList.push(pathList.splice(index, 1)[0]);
      }
      return {
          pathList: pathList,
          pathMap: pathMap,
          nameMap: nameMap
      };
  }
  // TODO 未处理props
  function addRouteRecord(_a) {
      var route = _a.route, pathList = _a.pathList, pathMap = _a.pathMap, nameMap = _a.nameMap, parent = _a.parent, matchAs = _a.matchAs;
      var path = route.path, name = route.name, component = route.component, components = route.components, redirect = route.redirect, _b = route.meta, meta = _b === void 0 ? {} : _b, _c = route.props;
      var normalizedPath = normalizePath(path, parent, false);
      var routeRecord = {
          path: normalizedPath,
          regex: compileRouteRegex(normalizedPath),
          components: components || { default: component },
          instances: {},
          name: name,
          parent: parent,
          matchAs: matchAs,
          redirect: redirect,
          meta: meta,
          props: {}
      };
      if (route.children) ;
      if (!pathMap[path]) {
          pathList.push(path);
          pathMap[path] = routeRecord;
      }
      if (name) {
          if (!nameMap[name]) {
              nameMap[name] = routeRecord;
          }
      }
  }
  /**
   * 如果路由配置是嵌套的，则子级路由配置的path需要加上父级的path
   */
  function normalizePath(path, parent, strict) {
      if (!strict)
          path = path.replace(/\/$/, '');
      // 绝对路径，直接返回
      if (path[0] === '/')
          return path;
      // 一级路由，返回path
      if (!parent)
          return path;
      // 子级路由，拼接父级的path
      return cleanPath(parent.path + "/" + path);
  }
  function compileRouteRegex(path) {
      if (path === '*') {
          return /^((?:.*))(?:\/(?=$))?$/i;
      }
      var regex = pathToRegexp(path, [], {});
      return regex;
  }

  function clone(value) {
      if (Array.isArray(value)) {
          return value.map(clone);
      }
      else if (value && typeof value === 'object') {
          var res = {};
          for (var key in value) {
              res[key] = clone(value[key]);
          }
          return res;
      }
      else {
          return value;
      }
  }
  function warn(message) {
      {
          typeof console !== 'undefined' && console.warn("[vue-router] " + message);
      }
  }
  function extend$1(a, b) {
      for (var key in b) {
          a[key] = b[key];
      }
      return a;
  }
  var inBrowser$1 = typeof window !== 'undefined';

  var encodeReserveRE = /[!'()*]/g;
  var encodeReserveReplacer = function (c) { return '%' + c.charCodeAt(0).toString(16); };
  var commaRE = /%2C/g;
  // fixed encodeURIComponent which is more conformant to RFC3986:
  // - escapes [!'()*]
  // - preserve commas
  var encode = function (str) {
      return encodeURIComponent(str)
          .replace(encodeReserveRE, encodeReserveReplacer)
          .replace(commaRE, ',');
  };
  var decode = decodeURIComponent;
  function stringifyQuery(obj) {
      var res = obj
          ? Object.keys(obj)
              .map(function (key) {
              var val = obj[key];
              if (val === undefined) {
                  return '';
              }
              if (val === null) {
                  return encode(key);
              }
              if (Array.isArray(val)) {
                  var result_1 = [];
                  val.forEach(function (val2) {
                      if (val2 === undefined) {
                          return;
                      }
                      if (val2 === null) {
                          result_1.push(encode(key));
                      }
                      else {
                          result_1.push(encode(key) + '=' + encode(val2));
                      }
                  });
                  return result_1.join('&');
              }
              return encode(key) + '=' + encode(val);
          })
              .filter(function (x) { return x.length > 0; })
              .join('&')
          : null;
      return res ? "?" + res : '';
  }
  function parseQuery(query) {
      var res = {};
      query = query.trim().replace(/^(\?|#|&)/, '');
      if (!query) {
          return res;
      }
      query.split('&').forEach(function (param) {
          var parts = param.replace(/\+/g, ' ').split('=');
          var key = decode(parts.shift());
          var val = parts.length > 0 ? decode(parts.join('=')) : null;
          if (res[key] === undefined) {
              res[key] = val;
          }
          else if (Array.isArray(res[key])) {
              res[key].push(val);
          }
          else {
              res[key] = [res[key], val];
          }
      });
      return res;
  }
  var castQueryParamValue = function (value) { return (value == null || typeof value === 'object' ? value : String(value)); };
  function resolveQuery(query, extraQuery, _parseQuery) {
      if (extraQuery === void 0) { extraQuery = {}; }
      var parse = _parseQuery || parseQuery;
      var parsedQuery;
      try {
          parsedQuery = parse(query || '');
      }
      catch (e) {
           warn(e.message);
          parsedQuery = {};
      }
      for (var key in extraQuery) {
          var value = extraQuery[key];
          parsedQuery[key] = Array.isArray(value)
              ? value.map(castQueryParamValue)
              : castQueryParamValue(value);
      }
      return parsedQuery;
  }

  function createRoute(record, location, redirectedFrom) {
      var query = clone((location === null || location === void 0 ? void 0 : location.query) || {});
      var route = {
          name: (location === null || location === void 0 ? void 0 : location.name) || (record && record.name),
          meta: (record && record.meta) || {},
          path: (location === null || location === void 0 ? void 0 : location.path) || '/',
          hash: (location === null || location === void 0 ? void 0 : location.hash) || '',
          query: query,
          params: (location === null || location === void 0 ? void 0 : location.params) || {},
          fullPath: getFullPath(location),
          matched: record ? formatMatch(record) : []
      };
      if (redirectedFrom) {
          route.redirectedFrom = getFullPath(redirectedFrom);
      }
      return Object.freeze(route);
  }
  var START = createRoute(null, {
      path: '/'
  });
  function getFullPath(_a) {
      var _b = _a === void 0 ? {} : _a, _c = _b.path, path = _c === void 0 ? '/' : _c, _d = _b.query, query = _d === void 0 ? {} : _d, _e = _b.hash, hash = _e === void 0 ? '' : _e;
      return path + stringifyQuery(query) + hash;
  }
  function formatMatch(record) {
      var res = [];
      while (record) {
          res.unshift(record);
          record = record.parent;
      }
      return res;
  }

  function normalizeLocation(raw, current, append) {
      var location = typeof raw === 'string' ? { path: raw } : raw;
      if (location._normalized) {
          return location;
      }
      if (location.name) {
          location = extend$1({}, location);
          var params = location.params;
          if (params && typeof params === 'object') {
              location.params = extend$1({}, params);
          }
          return location;
      }
      var parsedPath = parsePath$1(location.path || '');
      var basePath = (current && current.path) || '/';
      var path = parsedPath.path ? resolvePath(parsedPath.path, basePath, append) : basePath;
      var query = resolveQuery(parsedPath.query, location.query);
      var hash = location.hash || parsedPath.hash;
      if (hash && hash.charAt(0) !== '#') {
          hash = "#" + hash;
      }
      return {
          _normalized: true,
          path: path,
          query: query,
          hash: hash
      };
  }

  var regexpCompileCache = Object.create(null);
  function fillParams(path, params) {
      if (params === void 0) { params = {}; }
      try {
          var filler = regexpCompileCache[path] ||
              (regexpCompileCache[path] = compile(path));
          return filler(params, { encode: encodeURIComponent });
      }
      catch (e) {
          return '';
      }
      finally {
          delete params[0];
      }
  }

  var Matcher = /** @class */ (function () {
      function Matcher(routes, router) {
          var _a = createRouteMap(routes), pathList = _a.pathList, pathMap = _a.pathMap, nameMap = _a.nameMap;
          this.pathList = pathList;
          this.pathMap = pathMap;
          this.nameMap = nameMap;
          this.router = router;
      }
      Matcher.prototype.match = function (raw, current, redirectedFrom) {
          var location = normalizeLocation(raw, current, false);
          var name = location.name;
          if (name) {
              var record = this.nameMap[name];
              if (!record) {
                  return this.createRoute(null, location);
              }
              var paramNames = record.regex.keys
                  .filter(function (key) { return !key.optional; })
                  .map(function (key) { return key.name; });
              if (typeof location.params !== 'object') {
                  location.params = {};
              }
              if (current && typeof current.params === 'object') {
                  for (var key in current.params) {
                      if (!(key in location.params) && paramNames.indexOf(key) > -1) {
                          location.params[key] = current.params[key];
                      }
                  }
              }
              location.path = fillParams(record.path, location.params);
              return this.createRoute(record, location, redirectedFrom);
          }
          if (location.path) {
              for (var i = 0; i < this.pathList.length; i++) {
                  var path = this.pathList[i];
                  var record = this.pathMap[path];
                  if (matchRoute(record.regex, location.path, location.params)) {
                      return this.createRoute(record, location, redirectedFrom);
                  }
              }
          }
          return this.createRoute(null, location);
      };
      Matcher.prototype.createRoute = function (record, location, redirectedFrom) {
          if (record && record.redirect) ;
          if (record && record.matchAs) ;
          return createRoute(record, location, redirectedFrom);
      };
      return Matcher;
  }());
  function matchRoute(regex, path, params) {
      var m = decodeURI(path).match(regex);
      if (!m) {
          return false;
      }
      else if (!params) {
          return true;
      }
      for (var i = 1, len = m.length; i < len; ++i) {
          var key = regex.keys[i - 1];
          if (key && key.name) {
              params[key.name] = m[i];
          }
      }
      return true;
  }

  var BaseHistory = /** @class */ (function () {
      function BaseHistory(router, base) {
          this.pending = null; // 正在处理中的路由对象，如果没有激活的路由，则为null
          this.cb = null;
          this.ready = false;
          this.readyCbs = [];
          this.readyErrorCbs = [];
          this.errorCbs = [];
          this.listeners = [];
          this.cleanupListeners = [];
          this.router = router;
          this.base = normalizeBase(base);
          this.current = START;
      }
      /* 需要继承实现 */
      BaseHistory.prototype.setupListeners = function () { };
      BaseHistory.prototype.getCurrentLocation = function () { };
      BaseHistory.prototype.go = function (n) { };
      BaseHistory.prototype.push = function (loc, onComplete, onAbort) { };
      BaseHistory.prototype.replace = function (loc, onComplete, onAbort) { };
      BaseHistory.prototype.ensureURL = function (push) { };
      /* 通用方法实现 */
      BaseHistory.prototype.listen = function (cb) {
          this.cb = cb;
      };
      BaseHistory.prototype.onReady = function (cb, errorCb) {
          if (this.ready) {
              cb();
          }
          else {
              this.readyCbs.push(cb);
              if (errorCb) {
                  this.readyErrorCbs.push(errorCb);
              }
          }
      };
      BaseHistory.prototype.onError = function (errorCb) {
          this.errorCbs.push(errorCb);
      };
      BaseHistory.prototype.updateRoute = function (route) {
          this.current = route;
          this.cb && this.cb(route);
      };
      BaseHistory.prototype.transitionTo = function (location, onComplete, onAbort) {
          var _this = this;
          var route = this.router.match(location, this.current);
          var prev = this.current;
          this.confirmTransition(route, function () {
              _this.updateRoute(route);
              onComplete && onComplete(route);
              _this.ensureURL();
              // fire ready cbs once
              if (!_this.ready) {
                  _this.ready = true;
                  _this.readyCbs.forEach(function (cb) {
                      cb(route);
                  });
              }
          }, function (err) {
              if (onAbort) {
                  onAbort(err);
              }
          });
      };
      // TODO 未实现路由守卫
      /**
       * 进行路由跳转
       */
      BaseHistory.prototype.confirmTransition = function (route, onComplete, onAbort) {
          // 当前路径所表示的路由对象
          var current = this.current;
          this.pending = route;
          var _a = this.resovleQueue(route), updated = _a.updated, deactivated = _a.deactivated, activated = _a.activated;
          // 解析activated数组中所有routeRecord里的异步路由组件
          if (this.pending !== route) ;
          this.pending = null;
          onComplete(route);
      };
      BaseHistory.prototype.teardown = function () {
          this.listeners.forEach(function (cleanupListener) {
              cleanupListener();
          });
          this.listeners = [];
          this.current = START;
          this.pending = null;
      };
      /**
       * 路由从`this.current`转变为`route`
       * 对 this.current.matched, route.matched中的routRecord遍历一一对比
       * 提取出updated(相同routeRecord), deactivated(current中将要失活的routeRecord),activated(route中即将激活的routeRecord)
       */
      BaseHistory.prototype.resovleQueue = function (route) {
          var current = this.current.matched;
          var next = route.matched;
          var i;
          var max = Math.max(current.length, next.length);
          for (i = 0; i < max; i++) {
              if (current[i] !== next[i]) {
                  break;
              }
          }
          return {
              updated: next.slice(0, i),
              activated: next.slice(i),
              deactivated: current.slice(i)
          };
      };
      return BaseHistory;
  }());
  function normalizeBase(base) {
      if (!base) {
          if (inBrowser$1) {
              var baseEl = document.querySelector('base');
              base = (baseEl && baseEl.getAttribute('href')) || '/';
              base = base.replace(/^https?:\/\/[^\/]+/, '');
          }
          else {
              base = '/';
          }
      }
      if (base.charAt(0) !== '/') {
          base = '/' + base;
      }
      return base.replace(/\/$/, '');
  }

  var Time = inBrowser$1 && window.performance && window.performance.now
      ? window.performance
      : Date;
  function genStateKey() {
      return Time.now().toFixed(3);
  }
  var _key = genStateKey();
  function getStateKey() {
      return _key;
  }
  function setStateKey(key) {
      return (_key = key);
  }

  function pushState(url, replace) {
      var history = window.history;
      try {
          if (replace) {
              // 不对history.state本身进行修改
              var stateCopy = extend$1({}, history.state);
              stateCopy.key = getStateKey();
              history.replaceState(stateCopy, '', url);
          }
          else {
              history.pushState({ key: setStateKey(genStateKey()) }, '', url);
          }
      }
      catch (e) {
          window.location[replace ? 'replace' : 'assign'](url);
      }
  }
  function replaceState(url) {
      pushState(url, true);
  }

  var HashHistory = /** @class */ (function (_super) {
      __extends(HashHistory, _super);
      function HashHistory(router, base, fallback) {
          if (base === void 0) { base = '/'; }
          var _this = _super.call(this, router, base) || this;
          ensureSlash();
          return _this;
      }
      HashHistory.prototype.getCurrentLocation = function () {
          return getHash();
      };
      HashHistory.prototype.ensureURL = function (push) {
          var fullpath = this.current.fullPath;
          if (getHash() !== fullpath) {
              push ? pushState(getUrlWithHash(fullpath)) : replaceState(getUrlWithHash(fullpath));
          }
      };
      HashHistory.prototype.go = function (n) {
          window.history.go(n);
      };
      HashHistory.prototype.push = function (location, onComplete, onAbort) {
          this.transitionTo(location, function (route) {
              pushState(getUrlWithHash(route.fullPath));
              onComplete && onComplete(route);
          }, onAbort);
      };
      return HashHistory;
  }(BaseHistory));
  function ensureSlash() {
      var path = getHash();
      if (path.charAt(0) === '/') {
          return true;
      }
      replaceState(getUrlWithHash('/' + path));
      return false;
  }
  function getHash() {
      var href = window.location.href;
      var index = href.indexOf('#');
      if (index < 0)
          return '';
      href = href.slice(index + 1);
      return href;
  }
  function getUrlWithHash(path) {
      var href = window.location.href;
      var i = href.indexOf('#');
      var base = i >= 0 ? href.slice(0, i) : href;
      return base + "#" + path;
  }

  var HTML5History = /** @class */ (function (_super) {
      __extends(HTML5History, _super);
      function HTML5History(router, base, fallback) {
          if (base === void 0) { base = '/'; }
          return _super.call(this, router, base) || this;
      }
      HTML5History.prototype.getCurrentLocation = function () {
          return getLocation(this.base);
      };
      return HTML5History;
  }(BaseHistory));
  function getLocation(base) {
      var path = window.location.pathname;
      if (base && path.toLowerCase().indexOf(base.toLowerCase()) === 0) {
          path = path.slice(base.length);
      }
      return (path || '/') + window.location.search + window.location.hash;
  }

  var VueRouter = /** @class */ (function () {
      function VueRouter(options) {
          if (options === void 0) { options = {}; }
          this.app = null;
          this.apps = [];
          this.options = options;
          this.matcher = new Matcher(options.routes || [], this);
          var mode = options.mode || 'hash';
          this.mode = mode;
          this.history = null;
          switch (mode) {
              case 'hash':
                  this.history = new HashHistory(this, options.base);
                  break;
              case 'history':
                  this.history = new HTML5History(this, options.base);
                  break;
              default:
                  warn("invalid mode: " + mode);
                  break;
          }
      }
      VueRouter.prototype.match = function (raw, current, redirectedFrom) {
          return this.matcher.match(raw, current, redirectedFrom);
      };
      VueRouter.prototype.init = function () {
          var history = this.history;
          var setupListeners = function () {
              history.setupListeners();
          };
          history.transitionTo(history.getCurrentLocation(), setupListeners, setupListeners);
      };
      return VueRouter;
  }());

  var RouterView = {
      name: 'router-view',
      data: function () {
          return {
              routerView: true,
              routerViewDepth: 0
          };
      },
      // props: {
      //   name: {
      //     type: String,
      //   }
      // },
      render: function (h) {
          var vm = this;
          var routerViewDepth = vm.routerViewDepth, _a = vm.name, name = _a === void 0 ? 'default' : _a;
          var children = vm.$children;
          var parent = vm.$options.parent;
          var data = vm.$options._parentVnode.data;
          var route = parent.$route || parent._router;
          var cache = parent._routerViewCache || (parent._routerViewCache = {});
          var depth = 0;
          // 确定当前的视图深度
          while (parent && parent._routerRoot !== parent) {
              var vnodeData = parent.$vnode ? parent.$vnode.data : {};
              if (vnodeData.routerView) {
                  depth++;
              }
              parent = parent.$parent;
          }
          routerViewDepth = depth;
          var matched = route.matched[depth];
          var component = matched && matched.components[name]; // name默认的default
          if (!matched || !component) {
              cache[name] = null;
              return h();
          }
          cache[name] = { component: component };
          data.registerRouteInstance = function (vm, val) {
              // val could be undefined for unregistration
              var current = matched.instances[name];
              if ((val && current !== vm) ||
                  (!val && current === vm)) {
                  matched.instances[name] = val;
              }
          };
          // ;(data.hook || (data.hook = {})).prepatch = (_: any, vnode: any) => {
          //   matched.instances[name] = vnode.componentInstance
          // }
          var configProps = matched.props && matched.props[name];
          // save route and configProps in cache
          if (configProps) {
              extend$1(cache[name], {
                  route: route,
                  configProps: configProps
              });
              fillPropsinData(component, data, route, configProps);
          }
          return h(component, data, children);
      }
  };
  function fillPropsinData(component, data, route, configProps) {
      // resolve props
      var propsToPass = data.props = resolveProps(route, configProps);
      if (propsToPass) {
          // clone to prevent mutation
          propsToPass = data.props = extend$1({}, propsToPass);
          // pass non-declared props as attrs
          var attrs = data.attrs = data.attrs || {};
          for (var key in propsToPass) {
              if (!component.props || !(key in component.props)) {
                  attrs[key] = propsToPass[key];
                  delete propsToPass[key];
              }
          }
      }
  }
  function resolveProps(route, config) {
      switch (typeof config) {
          case 'undefined':
              return;
          case 'object':
              return config;
          case 'function':
              return config(route);
          case 'boolean':
              return config ? route.params : undefined;
          default:
              {
                  warn("props in \"" + route.path + "\" is a " + typeof config + ", " +
                      "expecting an object, function or boolean.");
              }
      }
  }

  var _Vue;
  var install = function (Vue) {
      if (install.installed && _Vue === Vue)
          return;
      install.installed = true;
      _Vue = Vue;
      var registerInstance = function (vm, callVal) {
          var _a, _b;
          var hook = (_b = (_a = vm.$options._parentVnode) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.registerRouteInstance;
          typeof hook === 'function' && hook(vm, callVal); // callVal作为component instance插入route.matched.instances
      };
      Vue.mixin({
          beforeCreate: function () {
              if (this.$options.router) {
                  this._routerRoot = this;
                  this._router = this.$options.router;
                  this._router.init(this);
                  this._route = this._router.history.current;
              }
              else {
                  this._routerRoot = (this.$parent && this.$parent._routerRoot) || this;
              }
              registerInstance(this, this);
          }
      });
      Object.defineProperty(Vue.prototype, '$router', {
          get: function () { return this._routerRoot._router; }
      });
      Object.defineProperty(Vue.prototype, '$route', {
          get: function () { return this._routerRoot._route; }
      });
      Vue.component('router-view', RouterView);
  };

  var VueRouterPlugin = {
      install: install
  };

  var VNode$1 = /** @class */ (function () {
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

  function extractPropsFromVNodeData(data, Ctor, tag) {
      var propOptions = Ctor.options.props;
      if (!propOptions)
          return;
      var res = {};
      var _a = data.attrs, attrs = _a === void 0 ? {} : _a, _b = data.props, props = _b === void 0 ? {} : _b;
      if (isDef(attrs) || isDef(props)) {
          for (var key in propOptions) {
              var altKey = hyphenate(key);
              checkProp(res, props, key, altKey, true) ||
                  checkProp(res, attrs, key, altKey, false);
          }
      }
      return res;
  }
  function checkProp(res, hash, key, altKey, preserve) {
      if (isDef(hash)) {
          if (hasOwn(hash, key)) {
              res[key] = hash[key];
              if (!preserve) {
                  delete hash[key];
              }
              return true;
          }
          else if (hasOwn(hash, altKey)) {
              res[key] = hash[altKey];
              if (!preserve) {
                  delete hash[altKey];
              }
              return true;
          }
      }
      return false;
  }

  function createComponent(Ctor, vnodeData, context, children, tag) {
      if (vnodeData === void 0) { vnodeData = {}; }
      if (!Ctor)
          return;
      /* 根类，因为它拥有比较全面的api */
      var baseCtor = context.$options._base;
      /**
       * 若Ctor是一个对象，则利用Vue.extend将其扩展为Vue子类
       * 适用于注册局部组件的情况，直接将组件的选项(options)传入
       */
      if (isObject(Ctor)) {
          Ctor = baseCtor.extend(Ctor);
      }
      /* 如果在此阶段Ctor依旧不是一个函数，则表示组件定义有误 */
      if (typeof Ctor !== 'function') {
          console.warn("Invalid Component definition: " + String(Ctor));
          return;
      }
      /* vnodeData.props作为用户传递的数据，Ctor.options.props作为组件接收的数据 */
      var propsData = extractPropsFromVNodeData(vnodeData, Ctor);
      // TODO data.on，组件事件
      /* 调用生成组件的必要的hook，在渲染vnode的过程中调用 */
      installComponentHooks(vnodeData);
      /* 记录组件名，用于生成组件tag */
      var name = Ctor.options.name || tag;
      var vnode = new VNode$1({
          context: context,
          data: vnodeData,
          tag: "vue-component-" + Ctor.cid + (name ? "-" + name : ''),
          componentOptions: {
              parent: context,
              Ctor: Ctor,
              tag: tag,
              children: children,
              propsData: propsData
          }
      });
      return vnode;
  }
  var componentVNodeHooks = {
      init: function (vnode, hydrating) {
          /* 生成组件实例 */
          var child = vnode.componentInstance = createComponentInstance(vnode, vnode.componentOptions.parent, vnode.componentOptions.Ctor);
          /* 渲染为真实DOM */
          child.$mount(hydrating ? vnode.elm : undefined, hydrating);
      },
      prepatch: function (oldVnode, vnode) {
          /* 这里的children指代的是插槽 */
          var _a = vnode.componentOptions, listeners = _a.listeners, propsData = _a.propsData, children = _a.children;
          var child = vnode.componentInstance = oldVnode.componentInstance;
          child.$options._parentVnode = vnode;
          // update vm's placeholder node without re-render
          child.$vnode = vnode;
          /* _props存储的props的键值对, _props将会被代理到vm上 */
          if (propsData && child.$options.props) {
              var props_1 = child._props;
              var propKeys = child.$options._propKeys || [];
              Object.keys(propKeys).forEach(function (key) {
                  props_1[key] = propsData[key];
              });
          }
          if (child._vnode) { // update child tree's parent
              child._vnode.parent = vnode;
          }
      },
      destroy: function (vnode) {
          var componentInstance = vnode.componentInstance;
          if (!componentInstance._isDestroyed) {
              componentInstance.$destory();
          }
      }
  };
  function createComponentInstance(vnode, parent, Ctor) {
      var options = {
          _isComponent: true,
          _parentVnode: vnode,
          parent: parent
      };
      return new Ctor(options);
  }
  function installComponentHooks(data) {
      var hooks = data.hook || (data.hook = {});
      var key;
      for (key in componentVNodeHooks) {
          var hook = componentVNodeHooks[key];
          if (!hook)
              continue;
          if (!hooks[key]) {
              hooks[key] = new Set();
          }
          hooks[key].add(hook);
      }
  }

  function resolveGlobalComponents(components, tag) {
      if (hasOwn(components, tag)) {
          return components[tag];
      }
      var camelizedId = camelize(tag);
      if (hasOwn(components, camelizedId))
          return components[camelizedId];
      var PascalCaseId = capitalize(camelizedId);
      if (hasOwn(components, PascalCaseId))
          return components[PascalCaseId];
      {
          console.warn('Failed to resolve component' + ': ' + tag);
      }
  }
  function createElement$2(context, tag, data, children) {
      var vnode;
      if (typeof tag === 'string' && !isHTMLTag(tag)) {
          var components = context.$options.components;
          var CompOptions = resolveGlobalComponents(components, tag);
          if (CompOptions) {
              vnode = createComponent(CompOptions, data, context, children, tag);
          }
      }
      else if (typeof tag === 'object') {
          vnode = createComponent(tag, data, context, children);
      }
      return vnode;
  }
  function setOptions(vm, options) {
      if (options && options._isComponent) {
          /* 继承父级组件的options */
          var opts = vm.$options = Object.create(vm.constructor.options);
          opts.parent = options.parent;
          var parentVnode = opts._parentVnode = options._parentVnode;
          var componentOptions = parentVnode.componentOptions;
          /* 初始化option.propsData */
          opts.propsData = componentOptions.propsData;
          // opts._parentListeners = vnodeComponentOptions.listeners
          // 记录组件名，在formatComponentName中使用
          opts._componentTag = componentOptions.tag;
          if (options.render) {
              opts.render = options.render;
          }
          vm.$options = opts;
      }
  }
  var componentsPlugin = {
      install: function (Vue) {
          Vue.config.set('createElement', createElement$2);
          Vue.config.set('setOptions', setOptions);
      }
  };

  Vue.use(componentsPlugin);
  var Home = {
      name: 'Home',
      data: function () {
          return {};
      },
      render: function (h) {
          return h('h1', 'Home');
      }
  };
  var Login = {
      name: 'login',
      data: function () {
          return {};
      },
      render: function (h) {
          return h('h1', 'Login');
      }
  };
  var router = new VueRouter({
      base: '/',
      routes: [
          {
              path: '/',
              name: 'home',
              component: Home,
              alias: '/home'
          },
          {
              path: '/login',
              name: 'login',
              component: Login,
              alias: '/login'
          },
      ]
  });
  Vue.use(VueRouterPlugin);
  var vm = new Vue({
      router: router,
      data: function () {
          return {
              text: 'text'
          };
      },
      props: {
          some: String
      },
      methods: {
          onClick: function () {
              this.$router.history.push({ path: '/login' });
          }
      },
      render: function (h) {
          var _a = this, text = _a.text, onClick = _a.onClick;
          return h('div', {}, [
              h('router-view'),
              h('button', { on: { click: onClick } }, '跳转到login'),
              text
          ]);
      }
  });
  vm.$mount('#app');

}());
