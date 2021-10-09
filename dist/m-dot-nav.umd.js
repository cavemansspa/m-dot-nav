(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['m-dot-nav'] = {}));
}(this, (function (exports) { 'use strict';

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

  var freeGlobal$1 = freeGlobal;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal$1 || freeSelf || Function('return this')();

  var root$1 = root;

  /** Built-in value references. */
  var Symbol = root$1.Symbol;

  var Symbol$1 = Symbol;

  /** Used for built-in method references. */
  var objectProto$b = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$8 = objectProto$b.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString$1 = objectProto$b.toString;

  /** Built-in value references. */
  var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag(value) {
    var isOwn = hasOwnProperty$8.call(value, symToStringTag$1),
        tag = value[symToStringTag$1];

    try {
      value[symToStringTag$1] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString$1.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag$1] = tag;
      } else {
        delete value[symToStringTag$1];
      }
    }
    return result;
  }

  /** Used for built-in method references. */
  var objectProto$a = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto$a.toString;

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString(value) {
    return nativeObjectToString.call(value);
  }

  /** `Object#toString` result references. */
  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';

  /** Built-in value references. */
  var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag && symToStringTag in Object(value))
      ? getRawTag(value)
      : objectToString(value);
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return value != null && typeof value == 'object';
  }

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray = Array.isArray;

  var isArray$1 = isArray;

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  /** `Object#toString` result references. */
  var asyncTag = '[object AsyncFunction]',
      funcTag$1 = '[object Function]',
      genTag = '[object GeneratorFunction]',
      proxyTag = '[object Proxy]';

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    if (!isObject(value)) {
      return false;
    }
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.
    var tag = baseGetTag(value);
    return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
  }

  /** Used to detect overreaching core-js shims. */
  var coreJsData = root$1['__core-js_shared__'];

  var coreJsData$1 = coreJsData;

  /** Used to detect methods masquerading as native. */
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData$1 && coreJsData$1.keys && coreJsData$1.keys.IE_PROTO || '');
    return uid ? ('Symbol(src)_1.' + uid) : '';
  }());

  /**
   * Checks if `func` has its source masked.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` is masked, else `false`.
   */
  function isMasked(func) {
    return !!maskSrcKey && (maskSrcKey in func);
  }

  /** Used for built-in method references. */
  var funcProto$1 = Function.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString$1 = funcProto$1.toString;

  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to convert.
   * @returns {string} Returns the source code.
   */
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString$1.call(func);
      } catch (e) {}
      try {
        return (func + '');
      } catch (e) {}
    }
    return '';
  }

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

  /** Used to detect host constructors (Safari). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used for built-in method references. */
  var funcProto = Function.prototype,
      objectProto$9 = Object.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString = funcProto.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

  /** Used to detect if a method is native. */
  var reIsNative = RegExp('^' +
    funcToString.call(hasOwnProperty$7).replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }

  /* Built-in method references that are verified to be native. */
  var WeakMap = getNative(root$1, 'WeakMap');

  var WeakMap$1 = WeakMap;

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER$1 = 9007199254740991;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER$1 : length;

    return !!length &&
      (type == 'number' ||
        (type != 'symbol' && reIsUint.test(value))) &&
          (value > -1 && value % 1 == 0 && value < length);
  }

  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
  function eq(value, other) {
    return value === other || (value !== value && other !== other);
  }

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER = 9007199254740991;

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength(value) {
    return typeof value == 'number' &&
      value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }

  /** Used for built-in method references. */
  var objectProto$8 = Object.prototype;

  /**
   * Checks if `value` is likely a prototype object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
   */
  function isPrototype(value) {
    var Ctor = value && value.constructor,
        proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$8;

    return value === proto;
  }

  /**
   * The base implementation of `_.times` without support for iteratee shorthands
   * or max array length checks.
   *
   * @private
   * @param {number} n The number of times to invoke `iteratee`.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the array of results.
   */
  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  /** `Object#toString` result references. */
  var argsTag$2 = '[object Arguments]';

  /**
   * The base implementation of `_.isArguments`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   */
  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag$2;
  }

  /** Used for built-in method references. */
  var objectProto$7 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$6 = objectProto$7.hasOwnProperty;

  /** Built-in value references. */
  var propertyIsEnumerable$1 = objectProto$7.propertyIsEnumerable;

  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   *  else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
    return isObjectLike(value) && hasOwnProperty$6.call(value, 'callee') &&
      !propertyIsEnumerable$1.call(value, 'callee');
  };

  var isArguments$1 = isArguments;

  /**
   * This method returns `false`.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {boolean} Returns `false`.
   * @example
   *
   * _.times(2, _.stubFalse);
   * // => [false, false]
   */
  function stubFalse() {
    return false;
  }

  /** Detect free variable `exports`. */
  var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;

  /** Built-in value references. */
  var Buffer = moduleExports$1 ? root$1.Buffer : undefined;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

  /**
   * Checks if `value` is a buffer.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
   * @example
   *
   * _.isBuffer(new Buffer(2));
   * // => true
   *
   * _.isBuffer(new Uint8Array(2));
   * // => false
   */
  var isBuffer = nativeIsBuffer || stubFalse;

  var isBuffer$1 = isBuffer;

  /** `Object#toString` result references. */
  var argsTag$1 = '[object Arguments]',
      arrayTag$1 = '[object Array]',
      boolTag$1 = '[object Boolean]',
      dateTag$1 = '[object Date]',
      errorTag$1 = '[object Error]',
      funcTag = '[object Function]',
      mapTag$2 = '[object Map]',
      numberTag$1 = '[object Number]',
      objectTag$2 = '[object Object]',
      regexpTag$1 = '[object RegExp]',
      setTag$2 = '[object Set]',
      stringTag$1 = '[object String]',
      weakMapTag$1 = '[object WeakMap]';

  var arrayBufferTag$1 = '[object ArrayBuffer]',
      dataViewTag$2 = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  /** Used to identify `toStringTag` values of typed arrays. */
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
  typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] =
  typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] =
  typedArrayTags[dataViewTag$2] = typedArrayTags[dateTag$1] =
  typedArrayTags[errorTag$1] = typedArrayTags[funcTag] =
  typedArrayTags[mapTag$2] = typedArrayTags[numberTag$1] =
  typedArrayTags[objectTag$2] = typedArrayTags[regexpTag$1] =
  typedArrayTags[setTag$2] = typedArrayTags[stringTag$1] =
  typedArrayTags[weakMapTag$1] = false;

  /**
   * The base implementation of `_.isTypedArray` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   */
  function baseIsTypedArray(value) {
    return isObjectLike(value) &&
      isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
  }

  /**
   * The base implementation of `_.unary` without support for storing metadata.
   *
   * @private
   * @param {Function} func The function to cap arguments for.
   * @returns {Function} Returns the new capped function.
   */
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }

  /** Detect free variable `exports`. */
  var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports;

  /** Detect free variable `process` from Node.js. */
  var freeProcess = moduleExports && freeGlobal$1.process;

  /** Used to access faster Node.js helpers. */
  var nodeUtil = (function() {
    try {
      // Use `util.types` for Node.js 10+.
      var types = freeModule && freeModule.require && freeModule.require('util').types;

      if (types) {
        return types;
      }

      // Legacy `process.binding('util')` for Node.js < 10.
      return freeProcess && freeProcess.binding && freeProcess.binding('util');
    } catch (e) {}
  }());

  var nodeUtil$1 = nodeUtil;

  /* Node.js helper references. */
  var nodeIsTypedArray = nodeUtil$1 && nodeUtil$1.isTypedArray;

  /**
   * Checks if `value` is classified as a typed array.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   * @example
   *
   * _.isTypedArray(new Uint8Array);
   * // => true
   *
   * _.isTypedArray([]);
   * // => false
   */
  var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

  var isTypedArray$1 = isTypedArray;

  /** Used for built-in method references. */
  var objectProto$6 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$5 = objectProto$6.hasOwnProperty;

  /**
   * Creates an array of the enumerable property names of the array-like `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @param {boolean} inherited Specify returning inherited property names.
   * @returns {Array} Returns the array of property names.
   */
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray$1(value),
        isArg = !isArr && isArguments$1(value),
        isBuff = !isArr && !isArg && isBuffer$1(value),
        isType = !isArr && !isArg && !isBuff && isTypedArray$1(value),
        skipIndexes = isArr || isArg || isBuff || isType,
        result = skipIndexes ? baseTimes(value.length, String) : [],
        length = result.length;

    for (var key in value) {
      if ((inherited || hasOwnProperty$5.call(value, key)) &&
          !(skipIndexes && (
             // Safari 9 has enumerable `arguments.length` in strict mode.
             key == 'length' ||
             // Node.js 0.10 has enumerable non-index properties on buffers.
             (isBuff && (key == 'offset' || key == 'parent')) ||
             // PhantomJS 2 has enumerable non-index properties on typed arrays.
             (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
             // Skip index properties.
             isIndex(key, length)
          ))) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Creates a unary function that invokes `func` with its argument transformed.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {Function} transform The argument transform.
   * @returns {Function} Returns the new function.
   */
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeKeys = overArg(Object.keys, Object);

  var nativeKeys$1 = nativeKeys;

  /** Used for built-in method references. */
  var objectProto$5 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$4 = objectProto$5.hasOwnProperty;

  /**
   * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeys(object) {
    if (!isPrototype(object)) {
      return nativeKeys$1(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty$4.call(object, key) && key != 'constructor') {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Creates an array of the own enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects. See the
   * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * for more details.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keys(new Foo);
   * // => ['a', 'b'] (iteration order is not guaranteed)
   *
   * _.keys('hi');
   * // => ['0', '1']
   */
  function keys(object) {
    return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
  }

  /* Built-in method references that are verified to be native. */
  var nativeCreate = getNative(Object, 'create');

  var nativeCreate$1 = nativeCreate;

  /**
   * Removes all key-value entries from the hash.
   *
   * @private
   * @name clear
   * @memberOf Hash
   */
  function hashClear() {
    this.__data__ = nativeCreate$1 ? nativeCreate$1(null) : {};
    this.size = 0;
  }

  /**
   * Removes `key` and its value from the hash.
   *
   * @private
   * @name delete
   * @memberOf Hash
   * @param {Object} hash The hash to modify.
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

  /** Used for built-in method references. */
  var objectProto$4 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

  /**
   * Gets the hash value for `key`.
   *
   * @private
   * @name get
   * @memberOf Hash
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate$1) {
      var result = data[key];
      return result === HASH_UNDEFINED$2 ? undefined : result;
    }
    return hasOwnProperty$3.call(data, key) ? data[key] : undefined;
  }

  /** Used for built-in method references. */
  var objectProto$3 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

  /**
   * Checks if a hash value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Hash
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate$1 ? (data[key] !== undefined) : hasOwnProperty$2.call(data, key);
  }

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

  /**
   * Sets the hash `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Hash
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the hash instance.
   */
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = (nativeCreate$1 && value === undefined) ? HASH_UNDEFINED$1 : value;
    return this;
  }

  /**
   * Creates a hash object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Hash(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `Hash`.
  Hash.prototype.clear = hashClear;
  Hash.prototype['delete'] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;

  /**
   * Removes all key-value entries from the list cache.
   *
   * @private
   * @name clear
   * @memberOf ListCache
   */
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }

  /**
   * Gets the index at which the `key` is found in `array` of key-value pairs.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} key The key to search for.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }

  /** Used for built-in method references. */
  var arrayProto = Array.prototype;

  /** Built-in value references. */
  var splice = arrayProto.splice;

  /**
   * Removes `key` and its value from the list cache.
   *
   * @private
   * @name delete
   * @memberOf ListCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function listCacheDelete(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }

  /**
   * Gets the list cache value for `key`.
   *
   * @private
   * @name get
   * @memberOf ListCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function listCacheGet(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    return index < 0 ? undefined : data[index][1];
  }

  /**
   * Checks if a list cache value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf ListCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }

  /**
   * Sets the list cache `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf ListCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the list cache instance.
   */
  function listCacheSet(key, value) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }

  /**
   * Creates an list cache object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function ListCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `ListCache`.
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype['delete'] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;

  /* Built-in method references that are verified to be native. */
  var Map = getNative(root$1, 'Map');

  var Map$1 = Map;

  /**
   * Removes all key-value entries from the map.
   *
   * @private
   * @name clear
   * @memberOf MapCache
   */
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      'hash': new Hash,
      'map': new (Map$1 || ListCache),
      'string': new Hash
    };
  }

  /**
   * Checks if `value` is suitable for use as unique object key.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
   */
  function isKeyable(value) {
    var type = typeof value;
    return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
      ? (value !== '__proto__')
      : (value === null);
  }

  /**
   * Gets the data for `map`.
   *
   * @private
   * @param {Object} map The map to query.
   * @param {string} key The reference key.
   * @returns {*} Returns the map data.
   */
  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key)
      ? data[typeof key == 'string' ? 'string' : 'hash']
      : data.map;
  }

  /**
   * Removes `key` and its value from the map.
   *
   * @private
   * @name delete
   * @memberOf MapCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function mapCacheDelete(key) {
    var result = getMapData(this, key)['delete'](key);
    this.size -= result ? 1 : 0;
    return result;
  }

  /**
   * Gets the map value for `key`.
   *
   * @private
   * @name get
   * @memberOf MapCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }

  /**
   * Checks if a map value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf MapCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }

  /**
   * Sets the map `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf MapCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the map cache instance.
   */
  function mapCacheSet(key, value) {
    var data = getMapData(this, key),
        size = data.size;

    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }

  /**
   * Creates a map cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function MapCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `MapCache`.
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype['delete'] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;

  /**
   * Appends the elements of `values` to `array`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {Array} values The values to append.
   * @returns {Array} Returns `array`.
   */
  function arrayPush(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;

    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }

  /**
   * Removes all key-value entries from the stack.
   *
   * @private
   * @name clear
   * @memberOf Stack
   */
  function stackClear() {
    this.__data__ = new ListCache;
    this.size = 0;
  }

  /**
   * Removes `key` and its value from the stack.
   *
   * @private
   * @name delete
   * @memberOf Stack
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function stackDelete(key) {
    var data = this.__data__,
        result = data['delete'](key);

    this.size = data.size;
    return result;
  }

  /**
   * Gets the stack value for `key`.
   *
   * @private
   * @name get
   * @memberOf Stack
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function stackGet(key) {
    return this.__data__.get(key);
  }

  /**
   * Checks if a stack value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Stack
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function stackHas(key) {
    return this.__data__.has(key);
  }

  /** Used as the size to enable large array optimizations. */
  var LARGE_ARRAY_SIZE = 200;

  /**
   * Sets the stack `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Stack
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the stack cache instance.
   */
  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache) {
      var pairs = data.__data__;
      if (!Map$1 || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new MapCache(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }

  /**
   * Creates a stack cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Stack(entries) {
    var data = this.__data__ = new ListCache(entries);
    this.size = data.size;
  }

  // Add methods to `Stack`.
  Stack.prototype.clear = stackClear;
  Stack.prototype['delete'] = stackDelete;
  Stack.prototype.get = stackGet;
  Stack.prototype.has = stackHas;
  Stack.prototype.set = stackSet;

  /**
   * A specialized version of `_.filter` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   */
  function arrayFilter(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length,
        resIndex = 0,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }

  /**
   * This method returns a new empty array.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {Array} Returns the new empty array.
   * @example
   *
   * var arrays = _.times(2, _.stubArray);
   *
   * console.log(arrays);
   * // => [[], []]
   *
   * console.log(arrays[0] === arrays[1]);
   * // => false
   */
  function stubArray() {
    return [];
  }

  /** Used for built-in method references. */
  var objectProto$2 = Object.prototype;

  /** Built-in value references. */
  var propertyIsEnumerable = objectProto$2.propertyIsEnumerable;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeGetSymbols = Object.getOwnPropertySymbols;

  /**
   * Creates an array of the own enumerable symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */
  var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
    if (object == null) {
      return [];
    }
    object = Object(object);
    return arrayFilter(nativeGetSymbols(object), function(symbol) {
      return propertyIsEnumerable.call(object, symbol);
    });
  };

  var getSymbols$1 = getSymbols;

  /**
   * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
   * `keysFunc` and `symbolsFunc` to get the enumerable property names and
   * symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @param {Function} symbolsFunc The function to get the symbols of `object`.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return isArray$1(object) ? result : arrayPush(result, symbolsFunc(object));
  }

  /**
   * Creates an array of own enumerable property names and symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function getAllKeys(object) {
    return baseGetAllKeys(object, keys, getSymbols$1);
  }

  /* Built-in method references that are verified to be native. */
  var DataView = getNative(root$1, 'DataView');

  var DataView$1 = DataView;

  /* Built-in method references that are verified to be native. */
  var Promise$1 = getNative(root$1, 'Promise');

  var Promise$2 = Promise$1;

  /* Built-in method references that are verified to be native. */
  var Set = getNative(root$1, 'Set');

  var Set$1 = Set;

  /** `Object#toString` result references. */
  var mapTag$1 = '[object Map]',
      objectTag$1 = '[object Object]',
      promiseTag = '[object Promise]',
      setTag$1 = '[object Set]',
      weakMapTag = '[object WeakMap]';

  var dataViewTag$1 = '[object DataView]';

  /** Used to detect maps, sets, and weakmaps. */
  var dataViewCtorString = toSource(DataView$1),
      mapCtorString = toSource(Map$1),
      promiseCtorString = toSource(Promise$2),
      setCtorString = toSource(Set$1),
      weakMapCtorString = toSource(WeakMap$1);

  /**
   * Gets the `toStringTag` of `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  var getTag = baseGetTag;

  // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
  if ((DataView$1 && getTag(new DataView$1(new ArrayBuffer(1))) != dataViewTag$1) ||
      (Map$1 && getTag(new Map$1) != mapTag$1) ||
      (Promise$2 && getTag(Promise$2.resolve()) != promiseTag) ||
      (Set$1 && getTag(new Set$1) != setTag$1) ||
      (WeakMap$1 && getTag(new WeakMap$1) != weakMapTag)) {
    getTag = function(value) {
      var result = baseGetTag(value),
          Ctor = result == objectTag$1 ? value.constructor : undefined,
          ctorString = Ctor ? toSource(Ctor) : '';

      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString: return dataViewTag$1;
          case mapCtorString: return mapTag$1;
          case promiseCtorString: return promiseTag;
          case setCtorString: return setTag$1;
          case weakMapCtorString: return weakMapTag;
        }
      }
      return result;
    };
  }

  var getTag$1 = getTag;

  /** Built-in value references. */
  var Uint8Array = root$1.Uint8Array;

  var Uint8Array$1 = Uint8Array;

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED = '__lodash_hash_undefined__';

  /**
   * Adds `value` to the array cache.
   *
   * @private
   * @name add
   * @memberOf SetCache
   * @alias push
   * @param {*} value The value to cache.
   * @returns {Object} Returns the cache instance.
   */
  function setCacheAdd(value) {
    this.__data__.set(value, HASH_UNDEFINED);
    return this;
  }

  /**
   * Checks if `value` is in the array cache.
   *
   * @private
   * @name has
   * @memberOf SetCache
   * @param {*} value The value to search for.
   * @returns {number} Returns `true` if `value` is found, else `false`.
   */
  function setCacheHas(value) {
    return this.__data__.has(value);
  }

  /**
   *
   * Creates an array cache object to store unique values.
   *
   * @private
   * @constructor
   * @param {Array} [values] The values to cache.
   */
  function SetCache(values) {
    var index = -1,
        length = values == null ? 0 : values.length;

    this.__data__ = new MapCache;
    while (++index < length) {
      this.add(values[index]);
    }
  }

  // Add methods to `SetCache`.
  SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
  SetCache.prototype.has = setCacheHas;

  /**
   * A specialized version of `_.some` for arrays without support for iteratee
   * shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {boolean} Returns `true` if any element passes the predicate check,
   *  else `false`.
   */
  function arraySome(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length;

    while (++index < length) {
      if (predicate(array[index], index, array)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if a `cache` value for `key` exists.
   *
   * @private
   * @param {Object} cache The cache to query.
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function cacheHas(cache, key) {
    return cache.has(key);
  }

  /** Used to compose bitmasks for value comparisons. */
  var COMPARE_PARTIAL_FLAG$3 = 1,
      COMPARE_UNORDERED_FLAG$1 = 2;

  /**
   * A specialized version of `baseIsEqualDeep` for arrays with support for
   * partial deep comparisons.
   *
   * @private
   * @param {Array} array The array to compare.
   * @param {Array} other The other array to compare.
   * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
   * @param {Function} customizer The function to customize comparisons.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Object} stack Tracks traversed `array` and `other` objects.
   * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
   */
  function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3,
        arrLength = array.length,
        othLength = other.length;

    if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
      return false;
    }
    // Check that cyclic values are equal.
    var arrStacked = stack.get(array);
    var othStacked = stack.get(other);
    if (arrStacked && othStacked) {
      return arrStacked == other && othStacked == array;
    }
    var index = -1,
        result = true,
        seen = (bitmask & COMPARE_UNORDERED_FLAG$1) ? new SetCache : undefined;

    stack.set(array, other);
    stack.set(other, array);

    // Ignore non-index properties.
    while (++index < arrLength) {
      var arrValue = array[index],
          othValue = other[index];

      if (customizer) {
        var compared = isPartial
          ? customizer(othValue, arrValue, index, other, array, stack)
          : customizer(arrValue, othValue, index, array, other, stack);
      }
      if (compared !== undefined) {
        if (compared) {
          continue;
        }
        result = false;
        break;
      }
      // Recursively compare arrays (susceptible to call stack limits).
      if (seen) {
        if (!arraySome(other, function(othValue, othIndex) {
              if (!cacheHas(seen, othIndex) &&
                  (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
                return seen.push(othIndex);
              }
            })) {
          result = false;
          break;
        }
      } else if (!(
            arrValue === othValue ||
              equalFunc(arrValue, othValue, bitmask, customizer, stack)
          )) {
        result = false;
        break;
      }
    }
    stack['delete'](array);
    stack['delete'](other);
    return result;
  }

  /**
   * Converts `map` to its key-value pairs.
   *
   * @private
   * @param {Object} map The map to convert.
   * @returns {Array} Returns the key-value pairs.
   */
  function mapToArray(map) {
    var index = -1,
        result = Array(map.size);

    map.forEach(function(value, key) {
      result[++index] = [key, value];
    });
    return result;
  }

  /**
   * Converts `set` to an array of its values.
   *
   * @private
   * @param {Object} set The set to convert.
   * @returns {Array} Returns the values.
   */
  function setToArray(set) {
    var index = -1,
        result = Array(set.size);

    set.forEach(function(value) {
      result[++index] = value;
    });
    return result;
  }

  /** Used to compose bitmasks for value comparisons. */
  var COMPARE_PARTIAL_FLAG$2 = 1,
      COMPARE_UNORDERED_FLAG = 2;

  /** `Object#toString` result references. */
  var boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      symbolTag = '[object Symbol]';

  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]';

  /** Used to convert symbols to primitives and strings. */
  var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
      symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

  /**
   * A specialized version of `baseIsEqualDeep` for comparing objects of
   * the same `toStringTag`.
   *
   * **Note:** This function only supports comparing values with tags of
   * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {string} tag The `toStringTag` of the objects to compare.
   * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
   * @param {Function} customizer The function to customize comparisons.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Object} stack Tracks traversed `object` and `other` objects.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */
  function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
    switch (tag) {
      case dataViewTag:
        if ((object.byteLength != other.byteLength) ||
            (object.byteOffset != other.byteOffset)) {
          return false;
        }
        object = object.buffer;
        other = other.buffer;

      case arrayBufferTag:
        if ((object.byteLength != other.byteLength) ||
            !equalFunc(new Uint8Array$1(object), new Uint8Array$1(other))) {
          return false;
        }
        return true;

      case boolTag:
      case dateTag:
      case numberTag:
        // Coerce booleans to `1` or `0` and dates to milliseconds.
        // Invalid dates are coerced to `NaN`.
        return eq(+object, +other);

      case errorTag:
        return object.name == other.name && object.message == other.message;

      case regexpTag:
      case stringTag:
        // Coerce regexes to strings and treat strings, primitives and objects,
        // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
        // for more details.
        return object == (other + '');

      case mapTag:
        var convert = mapToArray;

      case setTag:
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2;
        convert || (convert = setToArray);

        if (object.size != other.size && !isPartial) {
          return false;
        }
        // Assume cyclic values are equal.
        var stacked = stack.get(object);
        if (stacked) {
          return stacked == other;
        }
        bitmask |= COMPARE_UNORDERED_FLAG;

        // Recursively compare objects (susceptible to call stack limits).
        stack.set(object, other);
        var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
        stack['delete'](object);
        return result;

      case symbolTag:
        if (symbolValueOf) {
          return symbolValueOf.call(object) == symbolValueOf.call(other);
        }
    }
    return false;
  }

  /** Used to compose bitmasks for value comparisons. */
  var COMPARE_PARTIAL_FLAG$1 = 1;

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$1 = objectProto$1.hasOwnProperty;

  /**
   * A specialized version of `baseIsEqualDeep` for objects with support for
   * partial deep comparisons.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
   * @param {Function} customizer The function to customize comparisons.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Object} stack Tracks traversed `object` and `other` objects.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */
  function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1,
        objProps = getAllKeys(object),
        objLength = objProps.length,
        othProps = getAllKeys(other),
        othLength = othProps.length;

    if (objLength != othLength && !isPartial) {
      return false;
    }
    var index = objLength;
    while (index--) {
      var key = objProps[index];
      if (!(isPartial ? key in other : hasOwnProperty$1.call(other, key))) {
        return false;
      }
    }
    // Check that cyclic values are equal.
    var objStacked = stack.get(object);
    var othStacked = stack.get(other);
    if (objStacked && othStacked) {
      return objStacked == other && othStacked == object;
    }
    var result = true;
    stack.set(object, other);
    stack.set(other, object);

    var skipCtor = isPartial;
    while (++index < objLength) {
      key = objProps[index];
      var objValue = object[key],
          othValue = other[key];

      if (customizer) {
        var compared = isPartial
          ? customizer(othValue, objValue, key, other, object, stack)
          : customizer(objValue, othValue, key, object, other, stack);
      }
      // Recursively compare objects (susceptible to call stack limits).
      if (!(compared === undefined
            ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
            : compared
          )) {
        result = false;
        break;
      }
      skipCtor || (skipCtor = key == 'constructor');
    }
    if (result && !skipCtor) {
      var objCtor = object.constructor,
          othCtor = other.constructor;

      // Non `Object` object instances with different constructors are not equal.
      if (objCtor != othCtor &&
          ('constructor' in object && 'constructor' in other) &&
          !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
            typeof othCtor == 'function' && othCtor instanceof othCtor)) {
        result = false;
      }
    }
    stack['delete'](object);
    stack['delete'](other);
    return result;
  }

  /** Used to compose bitmasks for value comparisons. */
  var COMPARE_PARTIAL_FLAG = 1;

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]',
      arrayTag = '[object Array]',
      objectTag = '[object Object]';

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * A specialized version of `baseIsEqual` for arrays and objects which performs
   * deep comparisons and tracks traversed objects enabling objects with circular
   * references to be compared.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
   * @param {Function} customizer The function to customize comparisons.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Object} [stack] Tracks traversed `object` and `other` objects.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */
  function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
    var objIsArr = isArray$1(object),
        othIsArr = isArray$1(other),
        objTag = objIsArr ? arrayTag : getTag$1(object),
        othTag = othIsArr ? arrayTag : getTag$1(other);

    objTag = objTag == argsTag ? objectTag : objTag;
    othTag = othTag == argsTag ? objectTag : othTag;

    var objIsObj = objTag == objectTag,
        othIsObj = othTag == objectTag,
        isSameTag = objTag == othTag;

    if (isSameTag && isBuffer$1(object)) {
      if (!isBuffer$1(other)) {
        return false;
      }
      objIsArr = true;
      objIsObj = false;
    }
    if (isSameTag && !objIsObj) {
      stack || (stack = new Stack);
      return (objIsArr || isTypedArray$1(object))
        ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
        : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
    }
    if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
      var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
          othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object.value() : object,
            othUnwrapped = othIsWrapped ? other.value() : other;

        stack || (stack = new Stack);
        return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
      }
    }
    if (!isSameTag) {
      return false;
    }
    stack || (stack = new Stack);
    return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
  }

  /**
   * The base implementation of `_.isEqual` which supports partial comparisons
   * and tracks traversed objects.
   *
   * @private
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @param {boolean} bitmask The bitmask flags.
   *  1 - Unordered comparison
   *  2 - Partial comparison
   * @param {Function} [customizer] The function to customize comparisons.
   * @param {Object} [stack] Tracks traversed `value` and `other` objects.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   */
  function baseIsEqual(value, other, bitmask, customizer, stack) {
    if (value === other) {
      return true;
    }
    if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
  }

  /**
   * Performs a deep comparison between two values to determine if they are
   * equivalent.
   *
   * **Note:** This method supports comparing arrays, array buffers, booleans,
   * date objects, error objects, maps, numbers, `Object` objects, regexes,
   * sets, strings, symbols, and typed arrays. `Object` objects are compared
   * by their own, not inherited, enumerable properties. Functions and DOM
   * nodes are compared by strict equality, i.e. `===`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.isEqual(object, other);
   * // => true
   *
   * object === other;
   * // => false
   */
  function isEqual(value, other) {
    return baseIsEqual(value, other);
  }

  function Vnode(tag, key, attrs, children, text, dom) {
  	return {tag: tag, key: key, attrs: attrs, children: children, text: text, dom: dom, domSize: undefined, state: undefined, events: undefined, instance: undefined}
  }
  Vnode.normalize = function(node) {
  	if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
  	if (node == null || typeof node === "boolean") return null
  	if (typeof node === "object") return node
  	return Vnode("#", undefined, undefined, String(node), undefined, undefined)
  };
  Vnode.normalizeChildren = function(input) {
  	var children = [];
  	if (input.length) {
  		var isKeyed = input[0] != null && input[0].key != null;
  		// Note: this is a *very* perf-sensitive check.
  		// Fun fact: merging the loop like this is somehow faster than splitting
  		// it, noticeably so.
  		for (var i = 1; i < input.length; i++) {
  			if ((input[i] != null && input[i].key != null) !== isKeyed) {
  				throw new TypeError("Vnodes must either always have keys or never have keys!")
  			}
  		}
  		for (var i = 0; i < input.length; i++) {
  			children[i] = Vnode.normalize(input[i]);
  		}
  	}
  	return children
  };

  var vnode = Vnode;

  // Call via `hyperscriptVnode.apply(startOffset, arguments)`
  //
  // The reason I do it this way, forwarding the arguments and passing the start
  // offset in `this`, is so I don't have to create a temporary array in a
  // performance-critical path.
  //
  // In native ES6, I'd instead add a final `...args` parameter to the
  // `hyperscript` and `fragment` factories and define this as
  // `hyperscriptVnode(...args)`, since modern engines do optimize that away. But
  // ES5 (what Mithril requires thanks to IE support) doesn't give me that luxury,
  // and engines aren't nearly intelligent enough to do either of these:
  //
  // 1. Elide the allocation for `[].slice.call(arguments, 1)` when it's passed to
  //    another function only to be indexed.
  // 2. Elide an `arguments` allocation when it's passed to any function other
  //    than `Function.prototype.apply` or `Reflect.apply`.
  //
  // In ES6, it'd probably look closer to this (I'd need to profile it, though):
  // module.exports = function(attrs, ...children) {
  //     if (attrs == null || typeof attrs === "object" && attrs.tag == null && !Array.isArray(attrs)) {
  //         if (children.length === 1 && Array.isArray(children[0])) children = children[0]
  //     } else {
  //         children = children.length === 0 && Array.isArray(attrs) ? attrs : [attrs, ...children]
  //         attrs = undefined
  //     }
  //
  //     if (attrs == null) attrs = {}
  //     return Vnode("", attrs.key, attrs, children)
  // }
  var hyperscriptVnode = function() {
  	var attrs = arguments[this], start = this + 1, children;

  	if (attrs == null) {
  		attrs = {};
  	} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
  		attrs = {};
  		start = this;
  	}

  	if (arguments.length === start + 1) {
  		children = arguments[start];
  		if (!Array.isArray(children)) children = [children];
  	} else {
  		children = [];
  		while (start < arguments.length) children.push(arguments[start++]);
  	}

  	return vnode("", attrs.key, attrs, children)
  };

  var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g;
  var selectorCache = {};
  var hasOwn = {}.hasOwnProperty;

  function isEmpty(object) {
  	for (var key in object) if (hasOwn.call(object, key)) return false
  	return true
  }

  function compileSelector(selector) {
  	var match, tag = "div", classes = [], attrs = {};
  	while (match = selectorParser.exec(selector)) {
  		var type = match[1], value = match[2];
  		if (type === "" && value !== "") tag = value;
  		else if (type === "#") attrs.id = value;
  		else if (type === ".") classes.push(value);
  		else if (match[3][0] === "[") {
  			var attrValue = match[6];
  			if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\");
  			if (match[4] === "class") classes.push(attrValue);
  			else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true;
  		}
  	}
  	if (classes.length > 0) attrs.className = classes.join(" ");
  	return selectorCache[selector] = {tag: tag, attrs: attrs}
  }

  function execSelector(state, vnode$1) {
  	var attrs = vnode$1.attrs;
  	var children = vnode.normalizeChildren(vnode$1.children);
  	var hasClass = hasOwn.call(attrs, "class");
  	var className = hasClass ? attrs.class : attrs.className;

  	vnode$1.tag = state.tag;
  	vnode$1.attrs = null;
  	vnode$1.children = undefined;

  	if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
  		var newAttrs = {};

  		for (var key in attrs) {
  			if (hasOwn.call(attrs, key)) newAttrs[key] = attrs[key];
  		}

  		attrs = newAttrs;
  	}

  	for (var key in state.attrs) {
  		if (hasOwn.call(state.attrs, key) && key !== "className" && !hasOwn.call(attrs, key)){
  			attrs[key] = state.attrs[key];
  		}
  	}
  	if (className != null || state.attrs.className != null) attrs.className =
  		className != null
  			? state.attrs.className != null
  				? String(state.attrs.className) + " " + String(className)
  				: className
  			: state.attrs.className != null
  				? state.attrs.className
  				: null;

  	if (hasClass) attrs.class = null;

  	for (var key in attrs) {
  		if (hasOwn.call(attrs, key) && key !== "key") {
  			vnode$1.attrs = attrs;
  			break
  		}
  	}

  	if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
  		vnode$1.text = children[0].children;
  	} else {
  		vnode$1.children = children;
  	}

  	return vnode$1
  }

  function hyperscript(selector) {
  	if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
  		throw Error("The selector must be either a string or a component.");
  	}

  	var vnode$1 = hyperscriptVnode.apply(1, arguments);

  	if (typeof selector === "string") {
  		vnode$1.children = vnode.normalizeChildren(vnode$1.children);
  		if (selector !== "[") return execSelector(selectorCache[selector] || compileSelector(selector), vnode$1)
  	}

  	vnode$1.tag = selector;
  	return vnode$1
  }

  var hyperscript_1$1 = hyperscript;

  var trust = function(html) {
  	if (html == null) html = "";
  	return vnode("<", undefined, undefined, html, undefined, undefined)
  };

  var fragment = function() {
  	var vnode$1 = hyperscriptVnode.apply(0, arguments);

  	vnode$1.tag = "[";
  	vnode$1.children = vnode.normalizeChildren(vnode$1.children);
  	return vnode$1
  };

  hyperscript_1$1.trust = trust;
  hyperscript_1$1.fragment = fragment;

  var hyperscript_1 = hyperscript_1$1;

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn) {
    var module = { exports: {} };
  	return fn(module, module.exports), module.exports;
  }

  /** @constructor */
  var PromisePolyfill = function(executor) {
  	if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with `new`")
  	if (typeof executor !== "function") throw new TypeError("executor must be a function")

  	var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false);
  	var instance = self._instance = {resolvers: resolvers, rejectors: rejectors};
  	var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout;
  	function handler(list, shouldAbsorb) {
  		return function execute(value) {
  			var then;
  			try {
  				if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
  					if (value === self) throw new TypeError("Promise can't be resolved w/ itself")
  					executeOnce(then.bind(value));
  				}
  				else {
  					callAsync(function() {
  						if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value);
  						for (var i = 0; i < list.length; i++) list[i](value);
  						resolvers.length = 0, rejectors.length = 0;
  						instance.state = shouldAbsorb;
  						instance.retry = function() {execute(value);};
  					});
  				}
  			}
  			catch (e) {
  				rejectCurrent(e);
  			}
  		}
  	}
  	function executeOnce(then) {
  		var runs = 0;
  		function run(fn) {
  			return function(value) {
  				if (runs++ > 0) return
  				fn(value);
  			}
  		}
  		var onerror = run(rejectCurrent);
  		try {then(run(resolveCurrent), onerror);} catch (e) {onerror(e);}
  	}

  	executeOnce(executor);
  };
  PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
  	var self = this, instance = self._instance;
  	function handle(callback, list, next, state) {
  		list.push(function(value) {
  			if (typeof callback !== "function") next(value);
  			else try {resolveNext(callback(value));} catch (e) {if (rejectNext) rejectNext(e);}
  		});
  		if (typeof instance.retry === "function" && state === instance.state) instance.retry();
  	}
  	var resolveNext, rejectNext;
  	var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject;});
  	handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false);
  	return promise
  };
  PromisePolyfill.prototype.catch = function(onRejection) {
  	return this.then(null, onRejection)
  };
  PromisePolyfill.prototype.finally = function(callback) {
  	return this.then(
  		function(value) {
  			return PromisePolyfill.resolve(callback()).then(function() {
  				return value
  			})
  		},
  		function(reason) {
  			return PromisePolyfill.resolve(callback()).then(function() {
  				return PromisePolyfill.reject(reason);
  			})
  		}
  	)
  };
  PromisePolyfill.resolve = function(value) {
  	if (value instanceof PromisePolyfill) return value
  	return new PromisePolyfill(function(resolve) {resolve(value);})
  };
  PromisePolyfill.reject = function(value) {
  	return new PromisePolyfill(function(resolve, reject) {reject(value);})
  };
  PromisePolyfill.all = function(list) {
  	return new PromisePolyfill(function(resolve, reject) {
  		var total = list.length, count = 0, values = [];
  		if (list.length === 0) resolve([]);
  		else for (var i = 0; i < list.length; i++) {
  			(function(i) {
  				function consume(value) {
  					count++;
  					values[i] = value;
  					if (count === total) resolve(values);
  				}
  				if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
  					list[i].then(consume, reject);
  				}
  				else consume(list[i]);
  			})(i);
  		}
  	})
  };
  PromisePolyfill.race = function(list) {
  	return new PromisePolyfill(function(resolve, reject) {
  		for (var i = 0; i < list.length; i++) {
  			list[i].then(resolve, reject);
  		}
  	})
  };

  var polyfill = PromisePolyfill;

  var promise = createCommonjsModule(function (module) {



  if (typeof window !== "undefined") {
  	if (typeof window.Promise === "undefined") {
  		window.Promise = polyfill;
  	} else if (!window.Promise.prototype.finally) {
  		window.Promise.prototype.finally = polyfill.prototype.finally;
  	}
  	module.exports = window.Promise;
  } else if (typeof commonjsGlobal !== "undefined") {
  	if (typeof commonjsGlobal.Promise === "undefined") {
  		commonjsGlobal.Promise = polyfill;
  	} else if (!commonjsGlobal.Promise.prototype.finally) {
  		commonjsGlobal.Promise.prototype.finally = polyfill.prototype.finally;
  	}
  	module.exports = commonjsGlobal.Promise;
  } else {
  	module.exports = polyfill;
  }
  });

  var render$1 = function($window) {
  	var $doc = $window && $window.document;
  	var currentRedraw;

  	var nameSpace = {
  		svg: "http://www.w3.org/2000/svg",
  		math: "http://www.w3.org/1998/Math/MathML"
  	};

  	function getNameSpace(vnode) {
  		return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
  	}

  	//sanity check to discourage people from doing `vnode.state = ...`
  	function checkState(vnode, original) {
  		if (vnode.state !== original) throw new Error("`vnode.state` must not be modified")
  	}

  	//Note: the hook is passed as the `this` argument to allow proxying the
  	//arguments without requiring a full array allocation to do so. It also
  	//takes advantage of the fact the current `vnode` is the first argument in
  	//all lifecycle methods.
  	function callHook(vnode) {
  		var original = vnode.state;
  		try {
  			return this.apply(original, arguments)
  		} finally {
  			checkState(vnode, original);
  		}
  	}

  	// IE11 (at least) throws an UnspecifiedError when accessing document.activeElement when
  	// inside an iframe. Catch and swallow this error, and heavy-handidly return null.
  	function activeElement() {
  		try {
  			return $doc.activeElement
  		} catch (e) {
  			return null
  		}
  	}
  	//create
  	function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
  		for (var i = start; i < end; i++) {
  			var vnode = vnodes[i];
  			if (vnode != null) {
  				createNode(parent, vnode, hooks, ns, nextSibling);
  			}
  		}
  	}
  	function createNode(parent, vnode, hooks, ns, nextSibling) {
  		var tag = vnode.tag;
  		if (typeof tag === "string") {
  			vnode.state = {};
  			if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks);
  			switch (tag) {
  				case "#": createText(parent, vnode, nextSibling); break
  				case "<": createHTML(parent, vnode, ns, nextSibling); break
  				case "[": createFragment(parent, vnode, hooks, ns, nextSibling); break
  				default: createElement(parent, vnode, hooks, ns, nextSibling);
  			}
  		}
  		else createComponent(parent, vnode, hooks, ns, nextSibling);
  	}
  	function createText(parent, vnode, nextSibling) {
  		vnode.dom = $doc.createTextNode(vnode.children);
  		insertNode(parent, vnode.dom, nextSibling);
  	}
  	var possibleParents = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"};
  	function createHTML(parent, vnode, ns, nextSibling) {
  		var match = vnode.children.match(/^\s*?<(\w+)/im) || [];
  		// not using the proper parent makes the child element(s) vanish.
  		//     var div = document.createElement("div")
  		//     div.innerHTML = "<td>i</td><td>j</td>"
  		//     console.log(div.innerHTML)
  		// --> "ij", no <td> in sight.
  		var temp = $doc.createElement(possibleParents[match[1]] || "div");
  		if (ns === "http://www.w3.org/2000/svg") {
  			temp.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\">" + vnode.children + "</svg>";
  			temp = temp.firstChild;
  		} else {
  			temp.innerHTML = vnode.children;
  		}
  		vnode.dom = temp.firstChild;
  		vnode.domSize = temp.childNodes.length;
  		// Capture nodes to remove, so we don't confuse them.
  		vnode.instance = [];
  		var fragment = $doc.createDocumentFragment();
  		var child;
  		while (child = temp.firstChild) {
  			vnode.instance.push(child);
  			fragment.appendChild(child);
  		}
  		insertNode(parent, fragment, nextSibling);
  	}
  	function createFragment(parent, vnode, hooks, ns, nextSibling) {
  		var fragment = $doc.createDocumentFragment();
  		if (vnode.children != null) {
  			var children = vnode.children;
  			createNodes(fragment, children, 0, children.length, hooks, null, ns);
  		}
  		vnode.dom = fragment.firstChild;
  		vnode.domSize = fragment.childNodes.length;
  		insertNode(parent, fragment, nextSibling);
  	}
  	function createElement(parent, vnode$1, hooks, ns, nextSibling) {
  		var tag = vnode$1.tag;
  		var attrs = vnode$1.attrs;
  		var is = attrs && attrs.is;

  		ns = getNameSpace(vnode$1) || ns;

  		var element = ns ?
  			is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
  			is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag);
  		vnode$1.dom = element;

  		if (attrs != null) {
  			setAttrs(vnode$1, attrs, ns);
  		}

  		insertNode(parent, element, nextSibling);

  		if (!maybeSetContentEditable(vnode$1)) {
  			if (vnode$1.text != null) {
  				if (vnode$1.text !== "") element.textContent = vnode$1.text;
  				else vnode$1.children = [vnode("#", undefined, undefined, vnode$1.text, undefined, undefined)];
  			}
  			if (vnode$1.children != null) {
  				var children = vnode$1.children;
  				createNodes(element, children, 0, children.length, hooks, null, ns);
  				if (vnode$1.tag === "select" && attrs != null) setLateSelectAttrs(vnode$1, attrs);
  			}
  		}
  	}
  	function initComponent(vnode$1, hooks) {
  		var sentinel;
  		if (typeof vnode$1.tag.view === "function") {
  			vnode$1.state = Object.create(vnode$1.tag);
  			sentinel = vnode$1.state.view;
  			if (sentinel.$$reentrantLock$$ != null) return
  			sentinel.$$reentrantLock$$ = true;
  		} else {
  			vnode$1.state = void 0;
  			sentinel = vnode$1.tag;
  			if (sentinel.$$reentrantLock$$ != null) return
  			sentinel.$$reentrantLock$$ = true;
  			vnode$1.state = (vnode$1.tag.prototype != null && typeof vnode$1.tag.prototype.view === "function") ? new vnode$1.tag(vnode$1) : vnode$1.tag(vnode$1);
  		}
  		initLifecycle(vnode$1.state, vnode$1, hooks);
  		if (vnode$1.attrs != null) initLifecycle(vnode$1.attrs, vnode$1, hooks);
  		vnode$1.instance = vnode.normalize(callHook.call(vnode$1.state.view, vnode$1));
  		if (vnode$1.instance === vnode$1) throw Error("A view cannot return the vnode it received as argument")
  		sentinel.$$reentrantLock$$ = null;
  	}
  	function createComponent(parent, vnode, hooks, ns, nextSibling) {
  		initComponent(vnode, hooks);
  		if (vnode.instance != null) {
  			createNode(parent, vnode.instance, hooks, ns, nextSibling);
  			vnode.dom = vnode.instance.dom;
  			vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0;
  		}
  		else {
  			vnode.domSize = 0;
  		}
  	}

  	//update
  	/**
  	 * @param {Element|Fragment} parent - the parent element
  	 * @param {Vnode[] | null} old - the list of vnodes of the last `render()` call for
  	 *                               this part of the tree
  	 * @param {Vnode[] | null} vnodes - as above, but for the current `render()` call.
  	 * @param {Function[]} hooks - an accumulator of post-render hooks (oncreate/onupdate)
  	 * @param {Element | null} nextSibling - the next DOM node if we're dealing with a
  	 *                                       fragment that is not the last item in its
  	 *                                       parent
  	 * @param {'svg' | 'math' | String | null} ns) - the current XML namespace, if any
  	 * @returns void
  	 */
  	// This function diffs and patches lists of vnodes, both keyed and unkeyed.
  	//
  	// We will:
  	//
  	// 1. describe its general structure
  	// 2. focus on the diff algorithm optimizations
  	// 3. discuss DOM node operations.

  	// ## Overview:
  	//
  	// The updateNodes() function:
  	// - deals with trivial cases
  	// - determines whether the lists are keyed or unkeyed based on the first non-null node
  	//   of each list.
  	// - diffs them and patches the DOM if needed (that's the brunt of the code)
  	// - manages the leftovers: after diffing, are there:
  	//   - old nodes left to remove?
  	// 	 - new nodes to insert?
  	// 	 deal with them!
  	//
  	// The lists are only iterated over once, with an exception for the nodes in `old` that
  	// are visited in the fourth part of the diff and in the `removeNodes` loop.

  	// ## Diffing
  	//
  	// Reading https://github.com/localvoid/ivi/blob/ddc09d06abaef45248e6133f7040d00d3c6be853/packages/ivi/src/vdom/implementation.ts#L617-L837
  	// may be good for context on longest increasing subsequence-based logic for moving nodes.
  	//
  	// In order to diff keyed lists, one has to
  	//
  	// 1) match nodes in both lists, per key, and update them accordingly
  	// 2) create the nodes present in the new list, but absent in the old one
  	// 3) remove the nodes present in the old list, but absent in the new one
  	// 4) figure out what nodes in 1) to move in order to minimize the DOM operations.
  	//
  	// To achieve 1) one can create a dictionary of keys => index (for the old list), then iterate
  	// over the new list and for each new vnode, find the corresponding vnode in the old list using
  	// the map.
  	// 2) is achieved in the same step: if a new node has no corresponding entry in the map, it is new
  	// and must be created.
  	// For the removals, we actually remove the nodes that have been updated from the old list.
  	// The nodes that remain in that list after 1) and 2) have been performed can be safely removed.
  	// The fourth step is a bit more complex and relies on the longest increasing subsequence (LIS)
  	// algorithm.
  	//
  	// the longest increasing subsequence is the list of nodes that can remain in place. Imagine going
  	// from `1,2,3,4,5` to `4,5,1,2,3` where the numbers are not necessarily the keys, but the indices
  	// corresponding to the keyed nodes in the old list (keyed nodes `e,d,c,b,a` => `b,a,e,d,c` would
  	//  match the above lists, for example).
  	//
  	// In there are two increasing subsequences: `4,5` and `1,2,3`, the latter being the longest. We
  	// can update those nodes without moving them, and only call `insertNode` on `4` and `5`.
  	//
  	// @localvoid adapted the algo to also support node deletions and insertions (the `lis` is actually
  	// the longest increasing subsequence *of old nodes still present in the new list*).
  	//
  	// It is a general algorithm that is fireproof in all circumstances, but it requires the allocation
  	// and the construction of a `key => oldIndex` map, and three arrays (one with `newIndex => oldIndex`,
  	// the `LIS` and a temporary one to create the LIS).
  	//
  	// So we cheat where we can: if the tails of the lists are identical, they are guaranteed to be part of
  	// the LIS and can be updated without moving them.
  	//
  	// If two nodes are swapped, they are guaranteed not to be part of the LIS, and must be moved (with
  	// the exception of the last node if the list is fully reversed).
  	//
  	// ## Finding the next sibling.
  	//
  	// `updateNode()` and `createNode()` expect a nextSibling parameter to perform DOM operations.
  	// When the list is being traversed top-down, at any index, the DOM nodes up to the previous
  	// vnode reflect the content of the new list, whereas the rest of the DOM nodes reflect the old
  	// list. The next sibling must be looked for in the old list using `getNextSibling(... oldStart + 1 ...)`.
  	//
  	// In the other scenarios (swaps, upwards traversal, map-based diff),
  	// the new vnodes list is traversed upwards. The DOM nodes at the bottom of the list reflect the
  	// bottom part of the new vnodes list, and we can use the `v.dom`  value of the previous node
  	// as the next sibling (cached in the `nextSibling` variable).


  	// ## DOM node moves
  	//
  	// In most scenarios `updateNode()` and `createNode()` perform the DOM operations. However,
  	// this is not the case if the node moved (second and fourth part of the diff algo). We move
  	// the old DOM nodes before updateNode runs because it enables us to use the cached `nextSibling`
  	// variable rather than fetching it using `getNextSibling()`.
  	//
  	// The fourth part of the diff currently inserts nodes unconditionally, leading to issues
  	// like #1791 and #1999. We need to be smarter about those situations where adjascent old
  	// nodes remain together in the new list in a way that isn't covered by parts one and
  	// three of the diff algo.

  	function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
  		if (old === vnodes || old == null && vnodes == null) return
  		else if (old == null || old.length === 0) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns);
  		else if (vnodes == null || vnodes.length === 0) removeNodes(parent, old, 0, old.length);
  		else {
  			var isOldKeyed = old[0] != null && old[0].key != null;
  			var isKeyed = vnodes[0] != null && vnodes[0].key != null;
  			var start = 0, oldStart = 0;
  			if (!isOldKeyed) while (oldStart < old.length && old[oldStart] == null) oldStart++;
  			if (!isKeyed) while (start < vnodes.length && vnodes[start] == null) start++;
  			if (isKeyed === null && isOldKeyed == null) return // both lists are full of nulls
  			if (isOldKeyed !== isKeyed) {
  				removeNodes(parent, old, oldStart, old.length);
  				createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns);
  			} else if (!isKeyed) {
  				// Don't index past the end of either list (causes deopts).
  				var commonLength = old.length < vnodes.length ? old.length : vnodes.length;
  				// Rewind if necessary to the first non-null index on either side.
  				// We could alternatively either explicitly create or remove nodes when `start !== oldStart`
  				// but that would be optimizing for sparse lists which are more rare than dense ones.
  				start = start < oldStart ? start : oldStart;
  				for (; start < commonLength; start++) {
  					o = old[start];
  					v = vnodes[start];
  					if (o === v || o == null && v == null) continue
  					else if (o == null) createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, nextSibling));
  					else if (v == null) removeNode(parent, o);
  					else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, nextSibling), ns);
  				}
  				if (old.length > commonLength) removeNodes(parent, old, start, old.length);
  				if (vnodes.length > commonLength) createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns);
  			} else {
  				// keyed diff
  				var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling;

  				// bottom-up
  				while (oldEnd >= oldStart && end >= start) {
  					oe = old[oldEnd];
  					ve = vnodes[end];
  					if (oe.key !== ve.key) break
  					if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
  					if (ve.dom != null) nextSibling = ve.dom;
  					oldEnd--, end--;
  				}
  				// top-down
  				while (oldEnd >= oldStart && end >= start) {
  					o = old[oldStart];
  					v = vnodes[start];
  					if (o.key !== v.key) break
  					oldStart++, start++;
  					if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns);
  				}
  				// swaps and list reversals
  				while (oldEnd >= oldStart && end >= start) {
  					if (start === end) break
  					if (o.key !== ve.key || oe.key !== v.key) break
  					topSibling = getNextSibling(old, oldStart, nextSibling);
  					moveNodes(parent, oe, topSibling);
  					if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns);
  					if (++start <= --end) moveNodes(parent, o, nextSibling);
  					if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns);
  					if (ve.dom != null) nextSibling = ve.dom;
  					oldStart++; oldEnd--;
  					oe = old[oldEnd];
  					ve = vnodes[end];
  					o = old[oldStart];
  					v = vnodes[start];
  				}
  				// bottom up once again
  				while (oldEnd >= oldStart && end >= start) {
  					if (oe.key !== ve.key) break
  					if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
  					if (ve.dom != null) nextSibling = ve.dom;
  					oldEnd--, end--;
  					oe = old[oldEnd];
  					ve = vnodes[end];
  				}
  				if (start > end) removeNodes(parent, old, oldStart, oldEnd + 1);
  				else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
  				else {
  					// inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
  					var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li=0, i=0, pos = 2147483647, matched = 0, map, lisIndices;
  					for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1;
  					for (i = end; i >= start; i--) {
  						if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1);
  						ve = vnodes[i];
  						var oldIndex = map[ve.key];
  						if (oldIndex != null) {
  							pos = (oldIndex < pos) ? oldIndex : -1; // becomes -1 if nodes were re-ordered
  							oldIndices[i-start] = oldIndex;
  							oe = old[oldIndex];
  							old[oldIndex] = null;
  							if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
  							if (ve.dom != null) nextSibling = ve.dom;
  							matched++;
  						}
  					}
  					nextSibling = originalNextSibling;
  					if (matched !== oldEnd - oldStart + 1) removeNodes(parent, old, oldStart, oldEnd + 1);
  					if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
  					else {
  						if (pos === -1) {
  							// the indices of the indices of the items that are part of the
  							// longest increasing subsequence in the oldIndices list
  							lisIndices = makeLisIndices(oldIndices);
  							li = lisIndices.length - 1;
  							for (i = end; i >= start; i--) {
  								v = vnodes[i];
  								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling);
  								else {
  									if (lisIndices[li] === i - start) li--;
  									else moveNodes(parent, v, nextSibling);
  								}
  								if (v.dom != null) nextSibling = vnodes[i].dom;
  							}
  						} else {
  							for (i = end; i >= start; i--) {
  								v = vnodes[i];
  								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling);
  								if (v.dom != null) nextSibling = vnodes[i].dom;
  							}
  						}
  					}
  				}
  			}
  		}
  	}
  	function updateNode(parent, old, vnode, hooks, nextSibling, ns) {
  		var oldTag = old.tag, tag = vnode.tag;
  		if (oldTag === tag) {
  			vnode.state = old.state;
  			vnode.events = old.events;
  			if (shouldNotUpdate(vnode, old)) return
  			if (typeof oldTag === "string") {
  				if (vnode.attrs != null) {
  					updateLifecycle(vnode.attrs, vnode, hooks);
  				}
  				switch (oldTag) {
  					case "#": updateText(old, vnode); break
  					case "<": updateHTML(parent, old, vnode, ns, nextSibling); break
  					case "[": updateFragment(parent, old, vnode, hooks, nextSibling, ns); break
  					default: updateElement(old, vnode, hooks, ns);
  				}
  			}
  			else updateComponent(parent, old, vnode, hooks, nextSibling, ns);
  		}
  		else {
  			removeNode(parent, old);
  			createNode(parent, vnode, hooks, ns, nextSibling);
  		}
  	}
  	function updateText(old, vnode) {
  		if (old.children.toString() !== vnode.children.toString()) {
  			old.dom.nodeValue = vnode.children;
  		}
  		vnode.dom = old.dom;
  	}
  	function updateHTML(parent, old, vnode, ns, nextSibling) {
  		if (old.children !== vnode.children) {
  			removeHTML(parent, old);
  			createHTML(parent, vnode, ns, nextSibling);
  		}
  		else {
  			vnode.dom = old.dom;
  			vnode.domSize = old.domSize;
  			vnode.instance = old.instance;
  		}
  	}
  	function updateFragment(parent, old, vnode, hooks, nextSibling, ns) {
  		updateNodes(parent, old.children, vnode.children, hooks, nextSibling, ns);
  		var domSize = 0, children = vnode.children;
  		vnode.dom = null;
  		if (children != null) {
  			for (var i = 0; i < children.length; i++) {
  				var child = children[i];
  				if (child != null && child.dom != null) {
  					if (vnode.dom == null) vnode.dom = child.dom;
  					domSize += child.domSize || 1;
  				}
  			}
  			if (domSize !== 1) vnode.domSize = domSize;
  		}
  	}
  	function updateElement(old, vnode$1, hooks, ns) {
  		var element = vnode$1.dom = old.dom;
  		ns = getNameSpace(vnode$1) || ns;

  		if (vnode$1.tag === "textarea") {
  			if (vnode$1.attrs == null) vnode$1.attrs = {};
  			if (vnode$1.text != null) {
  				vnode$1.attrs.value = vnode$1.text; //FIXME handle multiple children
  				vnode$1.text = undefined;
  			}
  		}
  		updateAttrs(vnode$1, old.attrs, vnode$1.attrs, ns);
  		if (!maybeSetContentEditable(vnode$1)) {
  			if (old.text != null && vnode$1.text != null && vnode$1.text !== "") {
  				if (old.text.toString() !== vnode$1.text.toString()) old.dom.firstChild.nodeValue = vnode$1.text;
  			}
  			else {
  				if (old.text != null) old.children = [vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)];
  				if (vnode$1.text != null) vnode$1.children = [vnode("#", undefined, undefined, vnode$1.text, undefined, undefined)];
  				updateNodes(element, old.children, vnode$1.children, hooks, null, ns);
  			}
  		}
  	}
  	function updateComponent(parent, old, vnode$1, hooks, nextSibling, ns) {
  		vnode$1.instance = vnode.normalize(callHook.call(vnode$1.state.view, vnode$1));
  		if (vnode$1.instance === vnode$1) throw Error("A view cannot return the vnode it received as argument")
  		updateLifecycle(vnode$1.state, vnode$1, hooks);
  		if (vnode$1.attrs != null) updateLifecycle(vnode$1.attrs, vnode$1, hooks);
  		if (vnode$1.instance != null) {
  			if (old.instance == null) createNode(parent, vnode$1.instance, hooks, ns, nextSibling);
  			else updateNode(parent, old.instance, vnode$1.instance, hooks, nextSibling, ns);
  			vnode$1.dom = vnode$1.instance.dom;
  			vnode$1.domSize = vnode$1.instance.domSize;
  		}
  		else if (old.instance != null) {
  			removeNode(parent, old.instance);
  			vnode$1.dom = undefined;
  			vnode$1.domSize = 0;
  		}
  		else {
  			vnode$1.dom = old.dom;
  			vnode$1.domSize = old.domSize;
  		}
  	}
  	function getKeyMap(vnodes, start, end) {
  		var map = Object.create(null);
  		for (; start < end; start++) {
  			var vnode = vnodes[start];
  			if (vnode != null) {
  				var key = vnode.key;
  				if (key != null) map[key] = start;
  			}
  		}
  		return map
  	}
  	// Lifted from ivi https://github.com/ivijs/ivi/
  	// takes a list of unique numbers (-1 is special and can
  	// occur multiple times) and returns an array with the indices
  	// of the items that are part of the longest increasing
  	// subsequece
  	var lisTemp = [];
  	function makeLisIndices(a) {
  		var result = [0];
  		var u = 0, v = 0, i = 0;
  		var il = lisTemp.length = a.length;
  		for (var i = 0; i < il; i++) lisTemp[i] = a[i];
  		for (var i = 0; i < il; ++i) {
  			if (a[i] === -1) continue
  			var j = result[result.length - 1];
  			if (a[j] < a[i]) {
  				lisTemp[i] = j;
  				result.push(i);
  				continue
  			}
  			u = 0;
  			v = result.length - 1;
  			while (u < v) {
  				// Fast integer average without overflow.
  				// eslint-disable-next-line no-bitwise
  				var c = (u >>> 1) + (v >>> 1) + (u & v & 1);
  				if (a[result[c]] < a[i]) {
  					u = c + 1;
  				}
  				else {
  					v = c;
  				}
  			}
  			if (a[i] < a[result[u]]) {
  				if (u > 0) lisTemp[i] = result[u - 1];
  				result[u] = i;
  			}
  		}
  		u = result.length;
  		v = result[u - 1];
  		while (u-- > 0) {
  			result[u] = v;
  			v = lisTemp[v];
  		}
  		lisTemp.length = 0;
  		return result
  	}

  	function getNextSibling(vnodes, i, nextSibling) {
  		for (; i < vnodes.length; i++) {
  			if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
  		}
  		return nextSibling
  	}

  	// This covers a really specific edge case:
  	// - Parent node is keyed and contains child
  	// - Child is removed, returns unresolved promise in `onbeforeremove`
  	// - Parent node is moved in keyed diff
  	// - Remaining children still need moved appropriately
  	//
  	// Ideally, I'd track removed nodes as well, but that introduces a lot more
  	// complexity and I'm not exactly interested in doing that.
  	function moveNodes(parent, vnode, nextSibling) {
  		var frag = $doc.createDocumentFragment();
  		moveChildToFrag(parent, frag, vnode);
  		insertNode(parent, frag, nextSibling);
  	}
  	function moveChildToFrag(parent, frag, vnode) {
  		// Dodge the recursion overhead in a few of the most common cases.
  		while (vnode.dom != null && vnode.dom.parentNode === parent) {
  			if (typeof vnode.tag !== "string") {
  				vnode = vnode.instance;
  				if (vnode != null) continue
  			} else if (vnode.tag === "<") {
  				for (var i = 0; i < vnode.instance.length; i++) {
  					frag.appendChild(vnode.instance[i]);
  				}
  			} else if (vnode.tag !== "[") {
  				// Don't recurse for text nodes *or* elements, just fragments
  				frag.appendChild(vnode.dom);
  			} else if (vnode.children.length === 1) {
  				vnode = vnode.children[0];
  				if (vnode != null) continue
  			} else {
  				for (var i = 0; i < vnode.children.length; i++) {
  					var child = vnode.children[i];
  					if (child != null) moveChildToFrag(parent, frag, child);
  				}
  			}
  			break
  		}
  	}

  	function insertNode(parent, dom, nextSibling) {
  		if (nextSibling != null) parent.insertBefore(dom, nextSibling);
  		else parent.appendChild(dom);
  	}

  	function maybeSetContentEditable(vnode) {
  		if (vnode.attrs == null || (
  			vnode.attrs.contenteditable == null && // attribute
  			vnode.attrs.contentEditable == null // property
  		)) return false
  		var children = vnode.children;
  		if (children != null && children.length === 1 && children[0].tag === "<") {
  			var content = children[0].children;
  			if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content;
  		}
  		else if (vnode.text != null || children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted")
  		return true
  	}

  	//remove
  	function removeNodes(parent, vnodes, start, end) {
  		for (var i = start; i < end; i++) {
  			var vnode = vnodes[i];
  			if (vnode != null) removeNode(parent, vnode);
  		}
  	}
  	function removeNode(parent, vnode) {
  		var mask = 0;
  		var original = vnode.state;
  		var stateResult, attrsResult;
  		if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeremove === "function") {
  			var result = callHook.call(vnode.state.onbeforeremove, vnode);
  			if (result != null && typeof result.then === "function") {
  				mask = 1;
  				stateResult = result;
  			}
  		}
  		if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
  			var result = callHook.call(vnode.attrs.onbeforeremove, vnode);
  			if (result != null && typeof result.then === "function") {
  				// eslint-disable-next-line no-bitwise
  				mask |= 2;
  				attrsResult = result;
  			}
  		}
  		checkState(vnode, original);

  		// If we can, try to fast-path it and avoid all the overhead of awaiting
  		if (!mask) {
  			onremove(vnode);
  			removeChild(parent, vnode);
  		} else {
  			if (stateResult != null) {
  				var next = function () {
  					// eslint-disable-next-line no-bitwise
  					if (mask & 1) { mask &= 2; if (!mask) reallyRemove(); }
  				};
  				stateResult.then(next, next);
  			}
  			if (attrsResult != null) {
  				var next = function () {
  					// eslint-disable-next-line no-bitwise
  					if (mask & 2) { mask &= 1; if (!mask) reallyRemove(); }
  				};
  				attrsResult.then(next, next);
  			}
  		}

  		function reallyRemove() {
  			checkState(vnode, original);
  			onremove(vnode);
  			removeChild(parent, vnode);
  		}
  	}
  	function removeHTML(parent, vnode) {
  		for (var i = 0; i < vnode.instance.length; i++) {
  			parent.removeChild(vnode.instance[i]);
  		}
  	}
  	function removeChild(parent, vnode) {
  		// Dodge the recursion overhead in a few of the most common cases.
  		while (vnode.dom != null && vnode.dom.parentNode === parent) {
  			if (typeof vnode.tag !== "string") {
  				vnode = vnode.instance;
  				if (vnode != null) continue
  			} else if (vnode.tag === "<") {
  				removeHTML(parent, vnode);
  			} else {
  				if (vnode.tag !== "[") {
  					parent.removeChild(vnode.dom);
  					if (!Array.isArray(vnode.children)) break
  				}
  				if (vnode.children.length === 1) {
  					vnode = vnode.children[0];
  					if (vnode != null) continue
  				} else {
  					for (var i = 0; i < vnode.children.length; i++) {
  						var child = vnode.children[i];
  						if (child != null) removeChild(parent, child);
  					}
  				}
  			}
  			break
  		}
  	}
  	function onremove(vnode) {
  		if (typeof vnode.tag !== "string" && typeof vnode.state.onremove === "function") callHook.call(vnode.state.onremove, vnode);
  		if (vnode.attrs && typeof vnode.attrs.onremove === "function") callHook.call(vnode.attrs.onremove, vnode);
  		if (typeof vnode.tag !== "string") {
  			if (vnode.instance != null) onremove(vnode.instance);
  		} else {
  			var children = vnode.children;
  			if (Array.isArray(children)) {
  				for (var i = 0; i < children.length; i++) {
  					var child = children[i];
  					if (child != null) onremove(child);
  				}
  			}
  		}
  	}

  	//attrs
  	function setAttrs(vnode, attrs, ns) {
  		for (var key in attrs) {
  			setAttr(vnode, key, null, attrs[key], ns);
  		}
  	}
  	function setAttr(vnode, key, old, value, ns) {
  		if (key === "key" || key === "is" || value == null || isLifecycleMethod(key) || (old === value && !isFormAttribute(vnode, key)) && typeof value !== "object") return
  		if (key[0] === "o" && key[1] === "n") return updateEvent(vnode, key, value)
  		if (key.slice(0, 6) === "xlink:") vnode.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value);
  		else if (key === "style") updateStyle(vnode.dom, old, value);
  		else if (hasPropertyKey(vnode, key, ns)) {
  			if (key === "value") {
  				// Only do the coercion if we're actually going to check the value.
  				/* eslint-disable no-implicit-coercion */
  				//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
  				if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === "" + value && vnode.dom === activeElement()) return
  				//setting select[value] to same value while having select open blinks select dropdown in Chrome
  				if (vnode.tag === "select" && old !== null && vnode.dom.value === "" + value) return
  				//setting option[value] to same value while having select open blinks select dropdown in Chrome
  				if (vnode.tag === "option" && old !== null && vnode.dom.value === "" + value) return
  				/* eslint-enable no-implicit-coercion */
  			}
  			// If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
  			if (vnode.tag === "input" && key === "type") vnode.dom.setAttribute(key, value);
  			else vnode.dom[key] = value;
  		} else {
  			if (typeof value === "boolean") {
  				if (value) vnode.dom.setAttribute(key, "");
  				else vnode.dom.removeAttribute(key);
  			}
  			else vnode.dom.setAttribute(key === "className" ? "class" : key, value);
  		}
  	}
  	function removeAttr(vnode, key, old, ns) {
  		if (key === "key" || key === "is" || old == null || isLifecycleMethod(key)) return
  		if (key[0] === "o" && key[1] === "n" && !isLifecycleMethod(key)) updateEvent(vnode, key, undefined);
  		else if (key === "style") updateStyle(vnode.dom, old, null);
  		else if (
  			hasPropertyKey(vnode, key, ns)
  			&& key !== "className"
  			&& !(key === "value" && (
  				vnode.tag === "option"
  				|| vnode.tag === "select" && vnode.dom.selectedIndex === -1 && vnode.dom === activeElement()
  			))
  			&& !(vnode.tag === "input" && key === "type")
  		) {
  			vnode.dom[key] = null;
  		} else {
  			var nsLastIndex = key.indexOf(":");
  			if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1);
  			if (old !== false) vnode.dom.removeAttribute(key === "className" ? "class" : key);
  		}
  	}
  	function setLateSelectAttrs(vnode, attrs) {
  		if ("value" in attrs) {
  			if(attrs.value === null) {
  				if (vnode.dom.selectedIndex !== -1) vnode.dom.value = null;
  			} else {
  				var normalized = "" + attrs.value; // eslint-disable-line no-implicit-coercion
  				if (vnode.dom.value !== normalized || vnode.dom.selectedIndex === -1) {
  					vnode.dom.value = normalized;
  				}
  			}
  		}
  		if ("selectedIndex" in attrs) setAttr(vnode, "selectedIndex", null, attrs.selectedIndex, undefined);
  	}
  	function updateAttrs(vnode, old, attrs, ns) {
  		if (attrs != null) {
  			for (var key in attrs) {
  				setAttr(vnode, key, old && old[key], attrs[key], ns);
  			}
  		}
  		var val;
  		if (old != null) {
  			for (var key in old) {
  				if (((val = old[key]) != null) && (attrs == null || attrs[key] == null)) {
  					removeAttr(vnode, key, val, ns);
  				}
  			}
  		}
  	}
  	function isFormAttribute(vnode, attr) {
  		return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === activeElement() || vnode.tag === "option" && vnode.dom.parentNode === $doc.activeElement
  	}
  	function isLifecycleMethod(attr) {
  		return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
  	}
  	function hasPropertyKey(vnode, key, ns) {
  		// Filter out namespaced keys
  		return ns === undefined && (
  			// If it's a custom element, just keep it.
  			vnode.tag.indexOf("-") > -1 || vnode.attrs != null && vnode.attrs.is ||
  			// If it's a normal element, let's try to avoid a few browser bugs.
  			key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height"// && key !== "type"
  			// Defer the property check until *after* we check everything.
  		) && key in vnode.dom
  	}

  	//style
  	var uppercaseRegex = /[A-Z]/g;
  	function toLowerCase(capital) { return "-" + capital.toLowerCase() }
  	function normalizeKey(key) {
  		return key[0] === "-" && key[1] === "-" ? key :
  			key === "cssFloat" ? "float" :
  				key.replace(uppercaseRegex, toLowerCase)
  	}
  	function updateStyle(element, old, style) {
  		if (old === style) ; else if (style == null) {
  			// New style is missing, just clear it.
  			element.style.cssText = "";
  		} else if (typeof style !== "object") {
  			// New style is a string, let engine deal with patching.
  			element.style.cssText = style;
  		} else if (old == null || typeof old !== "object") {
  			// `old` is missing or a string, `style` is an object.
  			element.style.cssText = "";
  			// Add new style properties
  			for (var key in style) {
  				var value = style[key];
  				if (value != null) element.style.setProperty(normalizeKey(key), String(value));
  			}
  		} else {
  			// Both old & new are (different) objects.
  			// Update style properties that have changed
  			for (var key in style) {
  				var value = style[key];
  				if (value != null && (value = String(value)) !== String(old[key])) {
  					element.style.setProperty(normalizeKey(key), value);
  				}
  			}
  			// Remove style properties that no longer exist
  			for (var key in old) {
  				if (old[key] != null && style[key] == null) {
  					element.style.removeProperty(normalizeKey(key));
  				}
  			}
  		}
  	}

  	// Here's an explanation of how this works:
  	// 1. The event names are always (by design) prefixed by `on`.
  	// 2. The EventListener interface accepts either a function or an object
  	//    with a `handleEvent` method.
  	// 3. The object does not inherit from `Object.prototype`, to avoid
  	//    any potential interference with that (e.g. setters).
  	// 4. The event name is remapped to the handler before calling it.
  	// 5. In function-based event handlers, `ev.target === this`. We replicate
  	//    that below.
  	// 6. In function-based event handlers, `return false` prevents the default
  	//    action and stops event propagation. We replicate that below.
  	function EventDict() {
  		// Save this, so the current redraw is correctly tracked.
  		this._ = currentRedraw;
  	}
  	EventDict.prototype = Object.create(null);
  	EventDict.prototype.handleEvent = function (ev) {
  		var handler = this["on" + ev.type];
  		var result;
  		if (typeof handler === "function") result = handler.call(ev.currentTarget, ev);
  		else if (typeof handler.handleEvent === "function") handler.handleEvent(ev);
  		if (this._ && ev.redraw !== false) (0, this._)();
  		if (result === false) {
  			ev.preventDefault();
  			ev.stopPropagation();
  		}
  	};

  	//event
  	function updateEvent(vnode, key, value) {
  		if (vnode.events != null) {
  			if (vnode.events[key] === value) return
  			if (value != null && (typeof value === "function" || typeof value === "object")) {
  				if (vnode.events[key] == null) vnode.dom.addEventListener(key.slice(2), vnode.events, false);
  				vnode.events[key] = value;
  			} else {
  				if (vnode.events[key] != null) vnode.dom.removeEventListener(key.slice(2), vnode.events, false);
  				vnode.events[key] = undefined;
  			}
  		} else if (value != null && (typeof value === "function" || typeof value === "object")) {
  			vnode.events = new EventDict();
  			vnode.dom.addEventListener(key.slice(2), vnode.events, false);
  			vnode.events[key] = value;
  		}
  	}

  	//lifecycle
  	function initLifecycle(source, vnode, hooks) {
  		if (typeof source.oninit === "function") callHook.call(source.oninit, vnode);
  		if (typeof source.oncreate === "function") hooks.push(callHook.bind(source.oncreate, vnode));
  	}
  	function updateLifecycle(source, vnode, hooks) {
  		if (typeof source.onupdate === "function") hooks.push(callHook.bind(source.onupdate, vnode));
  	}
  	function shouldNotUpdate(vnode, old) {
  		do {
  			if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") {
  				var force = callHook.call(vnode.attrs.onbeforeupdate, vnode, old);
  				if (force !== undefined && !force) break
  			}
  			if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeupdate === "function") {
  				var force = callHook.call(vnode.state.onbeforeupdate, vnode, old);
  				if (force !== undefined && !force) break
  			}
  			return false
  		} while (false); // eslint-disable-line no-constant-condition
  		vnode.dom = old.dom;
  		vnode.domSize = old.domSize;
  		vnode.instance = old.instance;
  		// One would think having the actual latest attributes would be ideal,
  		// but it doesn't let us properly diff based on our current internal
  		// representation. We have to save not only the old DOM info, but also
  		// the attributes used to create it, as we diff *that*, not against the
  		// DOM directly (with a few exceptions in `setAttr`). And, of course, we
  		// need to save the children and text as they are conceptually not
  		// unlike special "attributes" internally.
  		vnode.attrs = old.attrs;
  		vnode.children = old.children;
  		vnode.text = old.text;
  		return true
  	}

  	return function(dom, vnodes, redraw) {
  		if (!dom) throw new TypeError("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.")
  		var hooks = [];
  		var active = activeElement();
  		var namespace = dom.namespaceURI;

  		// First time rendering into a node clears it out
  		if (dom.vnodes == null) dom.textContent = "";

  		vnodes = vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes]);
  		var prevRedraw = currentRedraw;
  		try {
  			currentRedraw = typeof redraw === "function" ? redraw : undefined;
  			updateNodes(dom, dom.vnodes, vnodes, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace);
  		} finally {
  			currentRedraw = prevRedraw;
  		}
  		dom.vnodes = vnodes;
  		// `document.activeElement` can return null: https://html.spec.whatwg.org/multipage/interaction.html#dom-document-activeelement
  		if (active != null && activeElement() !== active && typeof active.focus === "function") active.focus();
  		for (var i = 0; i < hooks.length; i++) hooks[i]();
  	}
  };

  var render = render$1(window);

  var mountRedraw$1 = function(render, schedule, console) {
  	var subscriptions = [];
  	var rendering = false;
  	var pending = false;

  	function sync() {
  		if (rendering) throw new Error("Nested m.redraw.sync() call")
  		rendering = true;
  		for (var i = 0; i < subscriptions.length; i += 2) {
  			try { render(subscriptions[i], vnode(subscriptions[i + 1]), redraw); }
  			catch (e) { console.error(e); }
  		}
  		rendering = false;
  	}

  	function redraw() {
  		if (!pending) {
  			pending = true;
  			schedule(function() {
  				pending = false;
  				sync();
  			});
  		}
  	}

  	redraw.sync = sync;

  	function mount(root, component) {
  		if (component != null && component.view == null && typeof component !== "function") {
  			throw new TypeError("m.mount(element, component) expects a component, not a vnode")
  		}

  		var index = subscriptions.indexOf(root);
  		if (index >= 0) {
  			subscriptions.splice(index, 2);
  			render(root, [], redraw);
  		}

  		if (component != null) {
  			subscriptions.push(root, component);
  			render(root, vnode(component), redraw);
  		}
  	}

  	return {mount: mount, redraw: redraw}
  };

  var mountRedraw = mountRedraw$1(render, requestAnimationFrame, console);

  var build$1 = function(object) {
  	if (Object.prototype.toString.call(object) !== "[object Object]") return ""

  	var args = [];
  	for (var key in object) {
  		destructure(key, object[key]);
  	}

  	return args.join("&")

  	function destructure(key, value) {
  		if (Array.isArray(value)) {
  			for (var i = 0; i < value.length; i++) {
  				destructure(key + "[" + i + "]", value[i]);
  			}
  		}
  		else if (Object.prototype.toString.call(value) === "[object Object]") {
  			for (var i in value) {
  				destructure(key + "[" + i + "]", value[i]);
  			}
  		}
  		else args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""));
  	}
  };

  var assign = Object.assign || function(target, source) {
  	if(source) Object.keys(source).forEach(function(key) { target[key] = source[key]; });
  };

  // Returns `path` from `template` + `params`
  var build = function(template, params) {
  	if ((/:([^\/\.-]+)(\.{3})?:/).test(template)) {
  		throw new SyntaxError("Template parameter names *must* be separated")
  	}
  	if (params == null) return template
  	var queryIndex = template.indexOf("?");
  	var hashIndex = template.indexOf("#");
  	var queryEnd = hashIndex < 0 ? template.length : hashIndex;
  	var pathEnd = queryIndex < 0 ? queryEnd : queryIndex;
  	var path = template.slice(0, pathEnd);
  	var query = {};

  	assign(query, params);

  	var resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, function(m, key, variadic) {
  		delete query[key];
  		// If no such parameter exists, don't interpolate it.
  		if (params[key] == null) return m
  		// Escape normal parameters, but not variadic ones.
  		return variadic ? params[key] : encodeURIComponent(String(params[key]))
  	});

  	// In case the template substitution adds new query/hash parameters.
  	var newQueryIndex = resolved.indexOf("?");
  	var newHashIndex = resolved.indexOf("#");
  	var newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex;
  	var newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex;
  	var result = resolved.slice(0, newPathEnd);

  	if (queryIndex >= 0) result += template.slice(queryIndex, queryEnd);
  	if (newQueryIndex >= 0) result += (queryIndex < 0 ? "?" : "&") + resolved.slice(newQueryIndex, newQueryEnd);
  	var querystring = build$1(query);
  	if (querystring) result += (queryIndex < 0 && newQueryIndex < 0 ? "?" : "&") + querystring;
  	if (hashIndex >= 0) result += template.slice(hashIndex);
  	if (newHashIndex >= 0) result += (hashIndex < 0 ? "" : "&") + resolved.slice(newHashIndex);
  	return result
  };

  var request$1 = function($window, Promise, oncompletion) {
  	var callbackCount = 0;

  	function PromiseProxy(executor) {
  		return new Promise(executor)
  	}

  	// In case the global Promise is some userland library's where they rely on
  	// `foo instanceof this.constructor`, `this.constructor.resolve(value)`, or
  	// similar. Let's *not* break them.
  	PromiseProxy.prototype = Promise.prototype;
  	PromiseProxy.__proto__ = Promise; // eslint-disable-line no-proto

  	function makeRequest(factory) {
  		return function(url, args) {
  			if (typeof url !== "string") { args = url; url = url.url; }
  			else if (args == null) args = {};
  			var promise = new Promise(function(resolve, reject) {
  				factory(build(url, args.params), args, function (data) {
  					if (typeof args.type === "function") {
  						if (Array.isArray(data)) {
  							for (var i = 0; i < data.length; i++) {
  								data[i] = new args.type(data[i]);
  							}
  						}
  						else data = new args.type(data);
  					}
  					resolve(data);
  				}, reject);
  			});
  			if (args.background === true) return promise
  			var count = 0;
  			function complete() {
  				if (--count === 0 && typeof oncompletion === "function") oncompletion();
  			}

  			return wrap(promise)

  			function wrap(promise) {
  				var then = promise.then;
  				// Set the constructor, so engines know to not await or resolve
  				// this as a native promise. At the time of writing, this is
  				// only necessary for V8, but their behavior is the correct
  				// behavior per spec. See this spec issue for more details:
  				// https://github.com/tc39/ecma262/issues/1577. Also, see the
  				// corresponding comment in `request/tests/test-request.js` for
  				// a bit more background on the issue at hand.
  				promise.constructor = PromiseProxy;
  				promise.then = function() {
  					count++;
  					var next = then.apply(promise, arguments);
  					next.then(complete, function(e) {
  						complete();
  						if (count === 0) throw e
  					});
  					return wrap(next)
  				};
  				return promise
  			}
  		}
  	}

  	function hasHeader(args, name) {
  		for (var key in args.headers) {
  			if ({}.hasOwnProperty.call(args.headers, key) && name.test(key)) return true
  		}
  		return false
  	}

  	return {
  		request: makeRequest(function(url, args, resolve, reject) {
  			var method = args.method != null ? args.method.toUpperCase() : "GET";
  			var body = args.body;
  			var assumeJSON = (args.serialize == null || args.serialize === JSON.serialize) && !(body instanceof $window.FormData);
  			var responseType = args.responseType || (typeof args.extract === "function" ? "" : "json");

  			var xhr = new $window.XMLHttpRequest(), aborted = false;
  			var original = xhr, replacedAbort;
  			var abort = xhr.abort;

  			xhr.abort = function() {
  				aborted = true;
  				abort.call(this);
  			};

  			xhr.open(method, url, args.async !== false, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined);

  			if (assumeJSON && body != null && !hasHeader(args, /^content-type$/i)) {
  				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
  			}
  			if (typeof args.deserialize !== "function" && !hasHeader(args, /^accept$/i)) {
  				xhr.setRequestHeader("Accept", "application/json, text/*");
  			}
  			if (args.withCredentials) xhr.withCredentials = args.withCredentials;
  			if (args.timeout) xhr.timeout = args.timeout;
  			xhr.responseType = responseType;

  			for (var key in args.headers) {
  				if ({}.hasOwnProperty.call(args.headers, key)) {
  					xhr.setRequestHeader(key, args.headers[key]);
  				}
  			}

  			xhr.onreadystatechange = function(ev) {
  				// Don't throw errors on xhr.abort().
  				if (aborted) return

  				if (ev.target.readyState === 4) {
  					try {
  						var success = (ev.target.status >= 200 && ev.target.status < 300) || ev.target.status === 304 || (/^file:\/\//i).test(url);
  						// When the response type isn't "" or "text",
  						// `xhr.responseText` is the wrong thing to use.
  						// Browsers do the right thing and throw here, and we
  						// should honor that and do the right thing by
  						// preferring `xhr.response` where possible/practical.
  						var response = ev.target.response, message;

  						if (responseType === "json") {
  							// For IE and Edge, which don't implement
  							// `responseType: "json"`.
  							if (!ev.target.responseType && typeof args.extract !== "function") response = JSON.parse(ev.target.responseText);
  						} else if (!responseType || responseType === "text") {
  							// Only use this default if it's text. If a parsed
  							// document is needed on old IE and friends (all
  							// unsupported), the user should use a custom
  							// `config` instead. They're already using this at
  							// their own risk.
  							if (response == null) response = ev.target.responseText;
  						}

  						if (typeof args.extract === "function") {
  							response = args.extract(ev.target, args);
  							success = true;
  						} else if (typeof args.deserialize === "function") {
  							response = args.deserialize(response);
  						}
  						if (success) resolve(response);
  						else {
  							try { message = ev.target.responseText; }
  							catch (e) { message = response; }
  							var error = new Error(message);
  							error.code = ev.target.status;
  							error.response = response;
  							reject(error);
  						}
  					}
  					catch (e) {
  						reject(e);
  					}
  				}
  			};

  			if (typeof args.config === "function") {
  				xhr = args.config(xhr, args, url) || xhr;

  				// Propagate the `abort` to any replacement XHR as well.
  				if (xhr !== original) {
  					replacedAbort = xhr.abort;
  					xhr.abort = function() {
  						aborted = true;
  						replacedAbort.call(this);
  					};
  				}
  			}

  			if (body == null) xhr.send();
  			else if (typeof args.serialize === "function") xhr.send(args.serialize(body));
  			else if (body instanceof $window.FormData) xhr.send(body);
  			else xhr.send(JSON.stringify(body));
  		}),
  		jsonp: makeRequest(function(url, args, resolve, reject) {
  			var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++;
  			var script = $window.document.createElement("script");
  			$window[callbackName] = function(data) {
  				delete $window[callbackName];
  				script.parentNode.removeChild(script);
  				resolve(data);
  			};
  			script.onerror = function() {
  				delete $window[callbackName];
  				script.parentNode.removeChild(script);
  				reject(new Error("JSONP request failed"));
  			};
  			script.src = url + (url.indexOf("?") < 0 ? "?" : "&") +
  				encodeURIComponent(args.callbackKey || "callback") + "=" +
  				encodeURIComponent(callbackName);
  			$window.document.documentElement.appendChild(script);
  		}),
  	}
  };

  var request = request$1(window, promise, mountRedraw.redraw);

  var parse$1 = function(string) {
  	if (string === "" || string == null) return {}
  	if (string.charAt(0) === "?") string = string.slice(1);

  	var entries = string.split("&"), counters = {}, data = {};
  	for (var i = 0; i < entries.length; i++) {
  		var entry = entries[i].split("=");
  		var key = decodeURIComponent(entry[0]);
  		var value = entry.length === 2 ? decodeURIComponent(entry[1]) : "";

  		if (value === "true") value = true;
  		else if (value === "false") value = false;

  		var levels = key.split(/\]\[?|\[/);
  		var cursor = data;
  		if (key.indexOf("[") > -1) levels.pop();
  		for (var j = 0; j < levels.length; j++) {
  			var level = levels[j], nextLevel = levels[j + 1];
  			var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10));
  			if (level === "") {
  				var key = levels.slice(0, j).join();
  				if (counters[key] == null) {
  					counters[key] = Array.isArray(cursor) ? cursor.length : 0;
  				}
  				level = counters[key]++;
  			}
  			// Disallow direct prototype pollution
  			else if (level === "__proto__") break
  			if (j === levels.length - 1) cursor[level] = value;
  			else {
  				// Read own properties exclusively to disallow indirect
  				// prototype pollution
  				var desc = Object.getOwnPropertyDescriptor(cursor, level);
  				if (desc != null) desc = desc.value;
  				if (desc == null) cursor[level] = desc = isNumber ? [] : {};
  				cursor = desc;
  			}
  		}
  	}
  	return data
  };

  // Returns `{path, params}` from `url`
  var parse = function(url) {
  	var queryIndex = url.indexOf("?");
  	var hashIndex = url.indexOf("#");
  	var queryEnd = hashIndex < 0 ? url.length : hashIndex;
  	var pathEnd = queryIndex < 0 ? queryEnd : queryIndex;
  	var path = url.slice(0, pathEnd).replace(/\/{2,}/g, "/");

  	if (!path) path = "/";
  	else {
  		if (path[0] !== "/") path = "/" + path;
  		if (path.length > 1 && path[path.length - 1] === "/") path = path.slice(0, -1);
  	}
  	return {
  		path: path,
  		params: queryIndex < 0
  			? {}
  			: parse$1(url.slice(queryIndex + 1, queryEnd)),
  	}
  };

  // Compiles a template into a function that takes a resolved path (without query
  // strings) and returns an object containing the template parameters with their
  // parsed values. This expects the input of the compiled template to be the
  // output of `parsePathname`. Note that it does *not* remove query parameters
  // specified in the template.
  var compileTemplate = function(template) {
  	var templateData = parse(template);
  	var templateKeys = Object.keys(templateData.params);
  	var keys = [];
  	var regexp = new RegExp("^" + templateData.path.replace(
  		// I escape literal text so people can use things like `:file.:ext` or
  		// `:lang-:locale` in routes. This is all merged into one pass so I
  		// don't also accidentally escape `-` and make it harder to detect it to
  		// ban it from template parameters.
  		/:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g,
  		function(m, key, extra) {
  			if (key == null) return "\\" + m
  			keys.push({k: key, r: extra === "..."});
  			if (extra === "...") return "(.*)"
  			if (extra === ".") return "([^/]+)\\."
  			return "([^/]+)" + (extra || "")
  		}
  	) + "$");
  	return function(data) {
  		// First, check the params. Usually, there isn't any, and it's just
  		// checking a static set.
  		for (var i = 0; i < templateKeys.length; i++) {
  			if (templateData.params[templateKeys[i]] !== data.params[templateKeys[i]]) return false
  		}
  		// If no interpolations exist, let's skip all the ceremony
  		if (!keys.length) return regexp.test(data.path)
  		var values = regexp.exec(data.path);
  		if (values == null) return false
  		for (var i = 0; i < keys.length; i++) {
  			data.params[keys[i].k] = keys[i].r ? values[i + 1] : decodeURIComponent(values[i + 1]);
  		}
  		return true
  	}
  };

  var sentinel = {};

  var router = function($window, mountRedraw) {
  	var fireAsync;

  	function setPath(path, data, options) {
  		path = build(path, data);
  		if (fireAsync != null) {
  			fireAsync();
  			var state = options ? options.state : null;
  			var title = options ? options.title : null;
  			if (options && options.replace) $window.history.replaceState(state, title, route.prefix + path);
  			else $window.history.pushState(state, title, route.prefix + path);
  		}
  		else {
  			$window.location.href = route.prefix + path;
  		}
  	}

  	var currentResolver = sentinel, component, attrs, currentPath, lastUpdate;

  	var SKIP = route.SKIP = {};

  	function route(root, defaultRoute, routes) {
  		if (root == null) throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined")
  		// 0 = start
  		// 1 = init
  		// 2 = ready
  		var state = 0;

  		var compiled = Object.keys(routes).map(function(route) {
  			if (route[0] !== "/") throw new SyntaxError("Routes must start with a `/`")
  			if ((/:([^\/\.-]+)(\.{3})?:/).test(route)) {
  				throw new SyntaxError("Route parameter names must be separated with either `/`, `.`, or `-`")
  			}
  			return {
  				route: route,
  				component: routes[route],
  				check: compileTemplate(route),
  			}
  		});
  		var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout;
  		var p = promise.resolve();
  		var scheduled = false;
  		var onremove;

  		fireAsync = null;

  		if (defaultRoute != null) {
  			var defaultData = parse(defaultRoute);

  			if (!compiled.some(function (i) { return i.check(defaultData) })) {
  				throw new ReferenceError("Default route doesn't match any known routes")
  			}
  		}

  		function resolveRoute() {
  			scheduled = false;
  			// Consider the pathname holistically. The prefix might even be invalid,
  			// but that's not our problem.
  			var prefix = $window.location.hash;
  			if (route.prefix[0] !== "#") {
  				prefix = $window.location.search + prefix;
  				if (route.prefix[0] !== "?") {
  					prefix = $window.location.pathname + prefix;
  					if (prefix[0] !== "/") prefix = "/" + prefix;
  				}
  			}
  			// This seemingly useless `.concat()` speeds up the tests quite a bit,
  			// since the representation is consistently a relatively poorly
  			// optimized cons string.
  			var path = prefix.concat()
  				.replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent)
  				.slice(route.prefix.length);
  			var data = parse(path);

  			assign(data.params, $window.history.state);

  			function fail() {
  				if (path === defaultRoute) throw new Error("Could not resolve default route " + defaultRoute)
  				setPath(defaultRoute, null, {replace: true});
  			}

  			loop(0);
  			function loop(i) {
  				// 0 = init
  				// 1 = scheduled
  				// 2 = done
  				for (; i < compiled.length; i++) {
  					if (compiled[i].check(data)) {
  						var payload = compiled[i].component;
  						var matchedRoute = compiled[i].route;
  						var localComp = payload;
  						var update = lastUpdate = function(comp) {
  							if (update !== lastUpdate) return
  							if (comp === SKIP) return loop(i + 1)
  							component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div";
  							attrs = data.params, currentPath = path, lastUpdate = null;
  							currentResolver = payload.render ? payload : null;
  							if (state === 2) mountRedraw.redraw();
  							else {
  								state = 2;
  								mountRedraw.redraw.sync();
  							}
  						};
  						// There's no understating how much I *wish* I could
  						// use `async`/`await` here...
  						if (payload.view || typeof payload === "function") {
  							payload = {};
  							update(localComp);
  						}
  						else if (payload.onmatch) {
  							p.then(function () {
  								return payload.onmatch(data.params, path, matchedRoute)
  							}).then(update, fail);
  						}
  						else update("div");
  						return
  					}
  				}
  				fail();
  			}
  		}

  		// Set it unconditionally so `m.route.set` and `m.route.Link` both work,
  		// even if neither `pushState` nor `hashchange` are supported. It's
  		// cleared if `hashchange` is used, since that makes it automatically
  		// async.
  		fireAsync = function() {
  			if (!scheduled) {
  				scheduled = true;
  				callAsync(resolveRoute);
  			}
  		};

  		if (typeof $window.history.pushState === "function") {
  			onremove = function() {
  				$window.removeEventListener("popstate", fireAsync, false);
  			};
  			$window.addEventListener("popstate", fireAsync, false);
  		} else if (route.prefix[0] === "#") {
  			fireAsync = null;
  			onremove = function() {
  				$window.removeEventListener("hashchange", resolveRoute, false);
  			};
  			$window.addEventListener("hashchange", resolveRoute, false);
  		}

  		return mountRedraw.mount(root, {
  			onbeforeupdate: function() {
  				state = state ? 2 : 1;
  				return !(!state || sentinel === currentResolver)
  			},
  			oncreate: resolveRoute,
  			onremove: onremove,
  			view: function() {
  				if (!state || sentinel === currentResolver) return
  				// Wrap in a fragment to preserve existing key semantics
  				var vnode$1 = [vnode(component, attrs.key, attrs)];
  				if (currentResolver) vnode$1 = currentResolver.render(vnode$1[0]);
  				return vnode$1
  			},
  		})
  	}
  	route.set = function(path, data, options) {
  		if (lastUpdate != null) {
  			options = options || {};
  			options.replace = true;
  		}
  		lastUpdate = null;
  		setPath(path, data, options);
  	};
  	route.get = function() {return currentPath};
  	route.prefix = "#!";
  	route.Link = {
  		view: function(vnode) {
  			var options = vnode.attrs.options;
  			// Remove these so they don't get overwritten
  			var attrs = {}, onclick, href;
  			assign(attrs, vnode.attrs);
  			// The first two are internal, but the rest are magic attributes
  			// that need censored to not screw up rendering.
  			attrs.selector = attrs.options = attrs.key = attrs.oninit =
  			attrs.oncreate = attrs.onbeforeupdate = attrs.onupdate =
  			attrs.onbeforeremove = attrs.onremove = null;

  			// Do this now so we can get the most current `href` and `disabled`.
  			// Those attributes may also be specified in the selector, and we
  			// should honor that.
  			var child = hyperscript_1$1(vnode.attrs.selector || "a", attrs, vnode.children);

  			// Let's provide a *right* way to disable a route link, rather than
  			// letting people screw up accessibility on accident.
  			//
  			// The attribute is coerced so users don't get surprised over
  			// `disabled: 0` resulting in a button that's somehow routable
  			// despite being visibly disabled.
  			if (child.attrs.disabled = Boolean(child.attrs.disabled)) {
  				child.attrs.href = null;
  				child.attrs["aria-disabled"] = "true";
  				// If you *really* do want to do this on a disabled link, use
  				// an `oncreate` hook to add it.
  				child.attrs.onclick = null;
  			} else {
  				onclick = child.attrs.onclick;
  				href = child.attrs.href;
  				child.attrs.href = route.prefix + href;
  				child.attrs.onclick = function(e) {
  					var result;
  					if (typeof onclick === "function") {
  						result = onclick.call(e.currentTarget, e);
  					} else if (onclick == null || typeof onclick !== "object") ; else if (typeof onclick.handleEvent === "function") {
  						onclick.handleEvent(e);
  					}

  					// Adapted from React Router's implementation:
  					// https://github.com/ReactTraining/react-router/blob/520a0acd48ae1b066eb0b07d6d4d1790a1d02482/packages/react-router-dom/modules/Link.js
  					//
  					// Try to be flexible and intuitive in how we handle links.
  					// Fun fact: links aren't as obvious to get right as you
  					// would expect. There's a lot more valid ways to click a
  					// link than this, and one might want to not simply click a
  					// link, but right click or command-click it to copy the
  					// link target, etc. Nope, this isn't just for blind people.
  					if (
  						// Skip if `onclick` prevented default
  						result !== false && !e.defaultPrevented &&
  						// Ignore everything but left clicks
  						(e.button === 0 || e.which === 0 || e.which === 1) &&
  						// Let the browser handle `target=_blank`, etc.
  						(!e.currentTarget.target || e.currentTarget.target === "_self") &&
  						// No modifier keys
  						!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
  					) {
  						e.preventDefault();
  						e.redraw = false;
  						route.set(href, null, options);
  					}
  				};
  			}
  			return child
  		},
  	};
  	route.param = function(key) {
  		return attrs && key != null ? attrs[key] : attrs
  	};

  	return route
  };

  var route = router(window, mountRedraw);

  var m = function m() { return hyperscript_1.apply(this, arguments) };
  m.m = hyperscript_1;
  m.trust = hyperscript_1.trust;
  m.fragment = hyperscript_1.fragment;
  m.mount = mountRedraw.mount;
  m.route = route;
  m.render = render;
  m.redraw = mountRedraw.redraw;
  m.request = request.request;
  m.jsonp = request.jsonp;
  m.parseQueryString = parse$1;
  m.buildQueryString = build$1;
  m.parsePathname = parse;
  m.buildPathname = build;
  m.vnode = vnode;
  m.PromisePolyfill = polyfill;

  var mithril = m;

  window.m = mithril;

  mithril.cls = (def, separator = " ") => {
      let classes;
      for (const cls in def) {
          if (def[cls]) {
              classes = classes == null ? cls : classes + separator + cls;
          }
      }
      return classes || "";
  };

  const DirectionTypes = {
      INITIAL: "INITIAL",
      FIRST_NAV: "FIRST NAV",
      SAME_ROUTE: "SAME ROUTE",
      REDRAW: "REDRAW",
      BACK: "BACK",
      FORWARD: "FORWARD"
  };

  //
  // We'll bypass route.set() through m.nav.route.set
  //
  let origRouteDotSet = mithril.route.set;
  mithril.route.set = (route, params, options) => {
      console.warn("BYPASS: ", route, params, options);
      mithril.nav.setRoute(route, params, options);
  };

  let _navstate = {
      flows: {},
      routes: {},
      isMounted: false,
      historyStack: [],
      flattenRoutes: undefined,
      layoutComponent: undefined,

      isSkipping: false,
      isRouteChange: false,
      onmatchCalledCount: 0,

      // TODO -- need to implement
      fullStack: [],
      flowStack: [],
      currentFlow: undefined,
      currentFlowName: undefined,

  };

  function _peek(back = 1) {

      let {historyStack} = _navstate;
      let {length} = historyStack;
      if (!length) return null;
      if (back > length) return null;

      return historyStack[length - Math.abs(back)];
  }

  function pushOrPop(args, requestedPath, route) {
      console.log("m.nav::pushOrPop() 1", args, requestedPath, route);

      let {historyStack} = _navstate;
      let {length} = historyStack;
      let lastRcState = _peek();
      let nextToLastRcState = _peek(-2) || {};

      let {path: thePath, params: theParams} = mithril.parsePathname(requestedPath);
      //console.log(thePath, theParams)
      console.log('args, params', args, theParams);

      let idObj = {args: theParams, path: thePath, requestedPath: requestedPath, route: route};
      //console.log('idObj', idObj)

      let newRcState = RouteChangeState({
          onmatchParams: idObj
      });

      //console.log('newRcState', newRcState)

      if (!length) {
          console.log("m.nav::pushOrPop()", "INITIAL ROUTE");
          historyStack.push(newRcState);
          return {directionType: DirectionTypes.INITIAL, rcState: newRcState}
      }

      let foundExisting = _navstate.historyStack.find(it => (
          it.isEqualByPathAndArgs({args: args || {}, path: thePath})
      ));

      if (foundExisting === lastRcState) {
          //debugger;
          console.log("m.nav::pushOrPop()", "SAME ROUTE 0", foundExisting);
          return {directionType: DirectionTypes.SAME_ROUTE, rcState: lastRcState}
      }

      if (foundExisting === nextToLastRcState) {
          console.log("m.nav::pushOrPop()", "GOING BACK ROUTE");
          historyStack.pop();
          _navstate.onMatchCalled = true;
          return {directionType: DirectionTypes.BACK, rcState: nextToLastRcState, prevRcState: lastRcState}
      }

      historyStack.push(newRcState);
      _navstate.onMatchCalled = true;
      console.log("m.nav::pushOrPop()", "GOING FORWARD ROUTE");
      return {directionType: DirectionTypes.FORWARD, rcState: newRcState, prevRcState: lastRcState}

  }


  const RouteChangeState = (config) => {

      if (!config?.onmatchParams) {
          throw new Error('RouteChangeState() -- onmatchParams required')
      }

      let _routeChange = {
          onmatchParams: JSON.parse(JSON.stringify(config.onmatchParams)),
          anim: undefined,
          key: genKey()
      };

      return {
          // _debug: _routeChange.onmatchParams,
          debug() {
              return _routeChange;
          },

          get onmatchParams() {
              return _routeChange.onmatchParams
          },

          key() {
              return _routeChange.key
          },

          isEqualByPathAndArgs(pathAndParams) {
              let {args, route} = _routeChange.onmatchParams;
  //             console.log(args, route)
  //             console.log(pathAndParams)
              return isEqual({args: args, path: route}, pathAndParams)
          }

      };
  };

  window.addEventListener("popstate", function (e) {
      console.log("m.nav()::popstate() -- ", e);
  });
  window.addEventListener("hashchange", function (e) {
      console.log("m.nav()::hashchange() -- ", e);
  });

  const omEventTarget = new EventTarget();

  mithril.nav = (function () {

      let _nav = function (root, defaultRoute, routes, config) {
          console.log("m.nav()", root, defaultRoute, routes, config);
          if (!routes) {
              throw new Error('m.nav() -- a routes object is required.')
          }
          if (!config?.layoutComponent) {
              throw new Error('m.nav() -- a layout component is required.')
          }

          _navstate.flows = Object.keys(config.flows || {}).reduce((acc, it) => {
              acc[it] = Object.assign({}, config.flows[it], {name: it});
              return acc;
          }, {});

          _navstate.routes = routes;
          _navstate.layoutComponent = config.layoutComponent;

          toEnhancedRouteResolvers();
          mithril.route(root || document.body, defaultRoute, _navstate.flattenedRouteResolvers);
          _navstate.isMounted = true;
      };

      Object.assign(_nav, {

          addEventListener: omEventTarget.addEventListener.bind(omEventTarget),
          removeEventListener: omEventTarget.removeEventListener.bind(omEventTarget),

          setRoute(route, params, options = {}, anim) {
              console.log('m.nav.setRoute()', route, params, options, anim);

              // REMINDER: the mithril "popstate" handler hits onmatch() directly bypassing this logic.
              // TODO -- need to implement handling hashchange event

              let lastRcState = _peek() || {};
              let nextToLastRcState = _peek(-2) || {};
              let {historyStack} = _navstate;

              // normalizedParams -- converts e.g. {a: 1} to {a: "1"} to support consistent find by path and args.
              let {params: normalizedParams} = mithril.parsePathname(mithril.buildPathname('/fake', params));
              let pathAndArgs = {args: normalizedParams || {}, path: route};

              let foundExisting = historyStack.find((item) => {
                  return item.isEqualByPathAndArgs(pathAndArgs)
              });

              if (foundExisting === lastRcState) {
                  console.log("m.nav.route.set() -- SAME ROUTE 1", foundExisting);
                  Object.assign(options, {replace: true});
                  origRouteDotSet(route, params, options);
                  return;
              }

              _navstate.anim = anim;

              if (foundExisting === nextToLastRcState) {
                  console.log("m.nav.route.set() -- BACK ROUTE", nextToLastRcState);
                  window.history.back();
                  return;
              }

              origRouteDotSet(route, params, options);
          }
      });

      return _nav

  })();

  function genKey() {
      return (Math.random() * Math.pow(10, 16)).toFixed(0);
  }

  // credit @porsager
  function flattenRoutes(routes, prefix = "") {
      return Object.keys(routes).reduce((acc, match) => {
          return typeof routes[match] === "function" ||
          routes[match].view ||
          routes[match].onmatch ||
          routes[match].render
              ? {...acc, [prefix + match]: routes[match]}
              : {...acc, ...flattenRoutes(routes[match], prefix + match)};
      }, {});
  }

  //
  // We convert all user defined routes to m.nav custom route resolvers
  // This enables us to catch all the navigation details.
  // We will pass the transitionState object to the Layout component via attr
  function toEnhancedRouteResolvers() {

      _navstate.flattenedRoutes = flattenRoutes(_navstate.routes);
      let {flattenedRoutes} = _navstate;

      _navstate.flattenedRouteResolvers = Object.keys(flattenedRoutes).reduce(
          (accum, routeKey) => {

              accum[routeKey] = (function () {

                  // these vars are accessible by onmatch() and render() scoped per routeKey
                  let theUserDefinedRoute = flattenedRoutes[routeKey];
                  let currentTransitionState;
                  let _omValue;

                  let enhancedRouteResolver = {

                      //
                      // ONMATCH
                      //
                      onmatch: (args, requestedPath, route) => {

                          console.log("m.nav::onmatch()", routeKey, args, requestedPath, route);

                          // if user's onmatch calls new route, remove the last route from stack
                          // as it has effectively been skipped.
                          if (_navstate.onmatchCalledCount > 0) {
                              console.log("m.nav::onmatch() -- redirect encountered", routeKey, args, requestedPath, route);
                              _navstate.historyStack.pop();
                          }

                          // accounts for m.route.sets() in users onmatch()
                          // mithrils router can potentially call onmatch() several times then render()
                          _navstate.onmatchCalledCount++;

                          let outboundRcState = _peek();
                          let outBoundRouteResolver =
                              outboundRcState && _navstate.flattenedRouteResolvers[outboundRcState.onmatchParams.route];

                          if (outBoundRouteResolver?.hasOwnProperty("onbeforeroutechange")) {

                              let {path: thePath, params: theParams} = mithril.parsePathname(requestedPath);
                              let idObj = {args: theParams, path: thePath, requestedPath: requestedPath, route: route};

                              outBoundRouteResolver.onbeforeroutechange({
                                  lastTransitionState: currentTransitionState,
                                  inbound: RouteChangeState({
                                      onmatchParams: idObj
                                  }),
                                  outbound: outboundRcState
                              });
                          }

                          if (theUserDefinedRoute.hasOwnProperty("onmatch")) {
                              // call user defined onmatch()
                              _omValue = theUserDefinedRoute.onmatch(args, requestedPath, route);
                          }

                          if (!_omValue) {
                              //if no onmatch || the user's onmatch returns null, return route's component
                              _omValue = theUserDefinedRoute;
                          }

                          // FYI -- these occur before render()
                          // requestAnimationFrame(() => console.log('onmatch::RAF!!!!', JSON.stringify(transitionState)))
                          // Promise.resolve().then(() => console.log('onmatch::Promise.resolve()!!!!'), JSON.stringify(transitionState))

                          currentTransitionState = pushOrPop(args, requestedPath, route);
                          currentTransitionState.isRouteChange = () => _navstate.onMatchCalled;
                          currentTransitionState.context = {};

                          //
                          // dispatch onbeforeroutechange event
                          //
                          const omEventBefore = new CustomEvent("onbeforeroutechange", {
                              cancelable: true,
                              detail: {transitionState: currentTransitionState, outbound: outboundRcState}
                          });
                          omEventTarget.dispatchEvent(omEventBefore);

                          // TODO -- first attempt at supporting cancellation of a route change.
                          /*

                          if (!_navstate.isSkipping) {
                              const omEventBefore = new CustomEvent("onbeforeroutechange", {
                                  cancelable: true,
                                  detail: {transitionState: currentTransitionState, outbound: outbound}
                              });

                              let dispatchResult = omEventTarget.dispatchEvent(omEventBefore);
                              console.log('m.nav::onmatch() dispatchResult', {dispatchResult: dispatchResult})

                              if (!dispatchResult) {
                                  _navstate.isSkipping = true
                                  let {onmatchParams} = outbound.debug()
                                  console.log('m.nav::onmatch() onmatchParams', {onmatchParams: onmatchParams})

                                  m.route.set(onmatchParams.path, onmatchParams.data, {replace: true})
                              } else {
                                  currentTransitionState = pushOrPop(args, requestedPath, route)
                                  currentTransitionState.isRouteChange = () => _navstate.onMatchCalled
                                  currentTransitionState.context = {}
                              }

                          } else {
                              console.log('m.nav::onmatch() SKIPPING')
                              currentTransitionState = {directionType: DirectionTypes.SAME_ROUTE, rcState: outbound}
                              currentTransitionState.isRouteChange = () => _navstate.onMatchCalled
                              currentTransitionState.context = {}

                          }

                          */

                          //

                          console.log('m.nav::onmatch() end', {
                              _omValue: _omValue,
                              currentTransitionState: currentTransitionState
                          });

                          return _omValue;

                      },

                      //
                      // RENDER
                      //
                      render: (vnode) => {
                          console.log("m.nav::render()", routeKey, theUserDefinedRoute, vnode);

                          // reset
                          _navstate.onmatchCalledCount = 0;

                          let {layoutComponent} = _navstate;

                          if (!_navstate.onMatchCalled) {
                              currentTransitionState.directionType = DirectionTypes.REDRAW;
                          } else {
                              // reset to defaults after layout updates
                              Promise.resolve().then(() => {
                                  //console.log("m.nav::render()", "reset onMatchCalled")
                                  _navstate.isSkipping = false;
                                  _navstate.onMatchCalled = false;
                                  _navstate.anim = undefined;
                              });
                          }
                          if (_navstate.anim) {
                              currentTransitionState.anim = _navstate.anim;
                          }
                          let _transitionState = currentTransitionState;

                          // If returning a component at route, add installed layout
                          if (!theUserDefinedRoute.hasOwnProperty("render")) {
                              console.log("m.nav::render()", "COMPONENT, ADDING INSTALLED LAYOUT");

                              vnode.attrs.transitionState = _transitionState;

                              return mithril(
                                  layoutComponent,
                                  {transitionState: _transitionState},
                                  mithril(_omValue, vnode.attrs)
                              );
                          }

                          vnode.attrs.transitionState = _transitionState;
                          let theVnode = theUserDefinedRoute.render(vnode);

                          // let's user return layout at render()
                          // TODO - maybe remove supporting this?
                          if (theVnode.tag === layoutComponent) {
                              console.warn("m.nav::render()", "Layout not required from route");
                              theVnode.attrs.transitionState = _transitionState;
                              return theVnode;
                          }

                          if (theVnode.hasOwnProperty("items")) {
                              console.log("m.nav::render()", "HAS ITEMS, USING INSTALLED LAYOUT");

                              return mithril(layoutComponent, {
                                  cls: theVnode.cls,
                                  layout: theVnode.layout,
                                  items: theVnode.items,
                                  transitionState: _transitionState
                              });
                          }

                          // implicit layout, user does not return as root of their render() output.
                          // called layout component will need to know to handle vnode via children param.
                          console.log("m.nav::render()", "USING INSTALLED LAYOUT");

                          return mithril(
                              layoutComponent,
                              {transitionState: _transitionState},
                              theVnode
                          );
                      }
                  };

                  // Install the user defined "onbeforeroutechange" handler
                  if (theUserDefinedRoute.hasOwnProperty("onbeforeroutechange")) {
                      enhancedRouteResolver.onbeforeroutechange = theUserDefinedRoute.onbeforeroutechange;
                  }

                  return enhancedRouteResolver;

              })();

              return accum;

          },
          {}
      );

      return _navstate.flattenedRouteResolvers;
  }

  exports.DirectionTypes = DirectionTypes;
  exports.RouteChangeState = RouteChangeState;
  exports['default'] = mithril;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
