(function () {
    'use strict';

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
    function parsePath(path) {
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
    function extend(a, b) {
        for (var key in b) {
            a[key] = b[key];
        }
        return a;
    }
    var inBrowser = typeof window !== 'undefined';

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
            location = extend({}, location);
            var params = location.params;
            if (params && typeof params === 'object') {
                location.params = extend({}, params);
            }
            return location;
        }
        var parsedPath = parsePath(location.path || '');
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
            if (inBrowser) {
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

    var Time = inBrowser && window.performance && window.performance.now
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
                var stateCopy = extend({}, history.state);
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

    var router = new VueRouter({
        base: '/',
        routes: [
            {
                path: '/',
                name: 'home',
                component: {},
                alias: '/home'
            },
            {
                path: '/login',
                name: 'login',
                component: {},
                alias: '/login'
            },
        ]
    });
    router.init();
    router.history.push({ path: '/login' });

}());
