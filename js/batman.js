(function() {
  var $block, $event, $eventOneShot, $findName, $functionName, $get, $mixin, $redirect, $typeOf, $unmixin, Batman, BatmanObject, Binding, RenderContext, Validators, buntUndefined, camelize_rx, capitalize_rx, container, div, filters, helpers, isEmptyDataObject, k, mixins, underscore_rx1, underscore_rx2, _Batman, _fn, _i, _j, _len, _len2, _objectToString, _ref, _ref2, _stateMachine_setState;
  var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Batman = function() {
    var mixins;
    mixins = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return typeof result === "object" ? result : child;
    })(Batman.Object, mixins, function() {});
  };
  Batman.typeOf = $typeOf = function(object) {
    return _objectToString.call(object).slice(8, -1);
  };
  _objectToString = Object.prototype.toString;
  Batman.mixin = $mixin = function() {
    var hasSet, key, mixin, mixins, to, value, _i, _len;
    to = arguments[0], mixins = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    hasSet = typeof to.set === 'function';
    for (_i = 0, _len = mixins.length; _i < _len; _i++) {
      mixin = mixins[_i];
      if ($typeOf(mixin) !== 'Object') {
        continue;
      }
      for (key in mixin) {
        if (!__hasProp.call(mixin, key)) continue;
        value = mixin[key];
        if (key === 'initialize' || key === 'uninitialize' || key === 'prototype') {
          continue;
        }
        if (hasSet) {
          to.set(key, value);
        } else if (to.nodeName != null) {
          Batman.data(to, key, value);
        } else {
          to[key] = value;
        }
      }
      if (typeof mixin.initialize === 'function') {
        mixin.initialize.call(to);
      }
    }
    return to;
  };
  Batman.unmixin = $unmixin = function() {
    var from, key, mixin, mixins, _i, _len;
    from = arguments[0], mixins = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    for (_i = 0, _len = mixins.length; _i < _len; _i++) {
      mixin = mixins[_i];
      for (key in mixin) {
        if (key === 'initialize' || key === 'uninitialize') {
          continue;
        }
        delete from[key];
      }
      if (typeof mixin.uninitialize === 'function') {
        mixin.uninitialize.call(from);
      }
    }
    return from;
  };
  Batman._block = $block = function(lengthOrFunction, fn) {
    var argsLength, callbackEater;
    if (fn != null) {
      argsLength = lengthOrFunction;
    } else {
      fn = lengthOrFunction;
    }
    return callbackEater = function() {
      var args, ctx, f;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      ctx = this;
      f = function(callback) {
        args.push(callback);
        return fn.apply(ctx, args);
      };
      if ((typeof args[args.length - 1] === 'function') || (argsLength && (args.length >= argsLength))) {
        return f(args.pop());
      } else {
        return f;
      }
    };
  };
  Batman._findName = $findName = function(f, context) {
    var key, value;
    if (!f.displayName) {
      for (key in context) {
        value = context[key];
        if (value === f) {
          f.displayName = key;
          break;
        }
      }
    }
    return f.displayName;
  };
  Batman._functionName = $functionName = function(f) {
    var _ref;
    if (f.name) {
      return f.name;
    }
    return (_ref = f.toString().match(/\W*function\s+([\w\$]+)\(/)) != null ? _ref[1] : void 0;
  };
  camelize_rx = /(?:^|_|\-)(.)/g;
  capitalize_rx = /(^|\s)([a-z])/g;
  underscore_rx1 = /([A-Z]+)([A-Z][a-z])/g;
  underscore_rx2 = /([a-z\d])([A-Z])/g;
  helpers = Batman.helpers = {
    camelize: function(string, firstLetterLower) {
      string = string.replace(camelize_rx, function(str, p1) {
        return p1.toUpperCase();
      });
      if (firstLetterLower) {
        return string.substr(0, 1).toLowerCase() + string.substr(1);
      } else {
        return string;
      }
    },
    underscore: function(string) {
      return string.replace(underscore_rx1, '$1_$2').replace(underscore_rx2, '$1_$2').replace('-', '_').toLowerCase();
    },
    singularize: function(string) {
      if (string.substr(-3) === 'ies') {
        return string.substr(0, string.length - 3) + 'y';
      } else if (string.substr(-1) === 's') {
        return string.substr(0, string.length - 1);
      } else {
        return string;
      }
    },
    pluralize: function(count, string) {
      var lastLetter;
      if (string) {
        if (count === 1) {
          return string;
        }
      } else {
        string = count;
      }
      lastLetter = string.substr(-1);
      if (lastLetter === 'y') {
        return "" + (string.substr(0, string.length - 1)) + "ies";
      } else if (lastLetter === 's') {
        return string;
      } else {
        return "" + string + "s";
      }
    },
    capitalize: function(string) {
      return string.replace(capitalize_rx, function(m, p1, p2) {
        return p1 + p2.toUpperCase();
      });
    }
  };
  Batman.Property = (function() {
    Property.defaultAccessor = {
      get: function(key) {
        return this[key];
      },
      set: function(key, val) {
        return this[key] = val;
      },
      unset: function(key) {
        var x;
        x = this[key];
        delete this[key];
        return x;
      }
    };
    Property.triggerTracker = null;
    Property.forBaseAndKey = function(base, key) {
      var properties, propertyClass, _base;
      propertyClass = base.propertyClass || Batman.Keypath;
      if (base._batman) {
        Batman.initializeObject(base);
        properties = (_base = base._batman).properties || (_base.properties = new Batman.SimpleHash);
        return properties.get(key) || properties.set(key, new propertyClass(base, key));
      } else {
        return new propertyClass(base, key);
      }
    };
    function Property(base, key) {
      this.base = base;
      this.key = key;
      this.observers = new Batman.SimpleSet;
      if (this.hasObserversToFire()) {
        this.refreshTriggers();
      }
      this._preventCount = 0;
    }
    Property.prototype.isProperty = true;
    Property.prototype.isEqual = function(other) {
      return this.constructor === other.constructor && this.base === other.base && this.key === other.key;
    };
    Property.prototype.accessor = function() {
      var accessors, val, _ref, _ref2;
      accessors = (_ref = this.base._batman) != null ? _ref.get('keyAccessors') : void 0;
      if (accessors && (val = accessors.get(this.key))) {
        return val;
      } else {
        return ((_ref2 = this.base._batman) != null ? _ref2.getFirst('defaultAccessor') : void 0) || Batman.Property.defaultAccessor;
      }
    };
    Property.prototype.registerAsTrigger = function() {
      var tracker;
      if (tracker = Batman.Property.triggerTracker) {
        return tracker.add(this);
      }
    };
    Property.prototype.getValue = function() {
      var _ref;
      this.registerAsTrigger();
      return (_ref = this.accessor()) != null ? _ref.get.call(this.base, this.key) : void 0;
    };
    Property.prototype.setValue = function(val) {
      var result, _ref;
      this.cacheDependentValues();
      result = (_ref = this.accessor()) != null ? _ref.set.call(this.base, this.key, val) : void 0;
      this.fireDependents();
      return result;
    };
    Property.prototype.unsetValue = function() {
      var result, _ref;
      this.cacheDependentValues();
      result = (_ref = this.accessor()) != null ? _ref.unset.call(this.base, this.key) : void 0;
      this.fireDependents();
      return result;
    };
    Property.prototype.cacheDependentValues = function() {
      if (this.dependents) {
        return this.dependents.forEach(function(prop) {
          return prop.cachedValue = prop.getValue();
        });
      }
    };
    Property.prototype.fireDependents = function() {
      if (this.dependents) {
        return this.dependents.forEach(function(prop) {
          if (typeof prop.hasObserversToFire === "function" ? prop.hasObserversToFire() : void 0) {
            return prop.fire(prop.getValue(), prop.cachedValue);
          }
        });
      }
    };
    Property.prototype.observe = function() {
      var callback, currentValue, fireImmediately, _i;
      fireImmediately = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), callback = arguments[_i++];
      fireImmediately = fireImmediately[0] === true;
      currentValue = this.getValue();
      this.observers.add(callback);
      this.refreshTriggers();
      if (fireImmediately) {
        callback.call(this.base, currentValue, currentValue);
      }
      return this;
    };
    Property.prototype.hasObserversToFire = function() {
      if (this.observers.length > 0) {
        return true;
      }
      if (this.base._batman) {
        return this.base._batman.ancestors().some(__bind(function(ancestor) {
          var _ref, _ref2;
          return (typeof ancestor.property === "function" ? (_ref = ancestor.property(this.key)) != null ? (_ref2 = _ref.observers) != null ? _ref2.length : void 0 : void 0 : void 0) > 0;
        }, this));
      } else {
        return false;
      }
    };
    Property.prototype.prevent = function() {
      return this._preventCount++;
    };
    Property.prototype.allow = function() {
      if (this._preventCount > 0) {
        return this._preventCount--;
      }
    };
    Property.prototype.isAllowedToFire = function() {
      return this._preventCount <= 0;
    };
    Property.prototype.fire = function() {
      var args, base, key, observerSets;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!(this.isAllowedToFire() && this.hasObserversToFire())) {
        return;
      }
      key = this.key;
      base = this.base;
      observerSets = [this.observers];
      this.observers.forEach(function(callback) {
        return callback != null ? callback.apply(base, args) : void 0;
      });
      if (this.base._batman) {
        this.base._batman.ancestors(function(ancestor) {
          return typeof ancestor.property === "function" ? ancestor.property(key).observers.forEach(function(callback) {
            return callback != null ? callback.apply(base, args) : void 0;
          }) : void 0;
        });
      }
      return this.refreshTriggers();
    };
    Property.prototype.forget = function(observer) {
      if (observer) {
        this.observers.remove(observer);
      } else {
        this.observers = new Batman.SimpleSet;
      }
      if (!this.hasObserversToFire()) {
        return this.clearTriggers();
      }
    };
    Property.prototype.refreshTriggers = function() {
      Batman.Property.triggerTracker = new Batman.SimpleSet;
      this.getValue();
      if (this.triggers) {
        this.triggers.forEach(__bind(function(property) {
          var _ref;
          if (!Batman.Property.triggerTracker.has(property)) {
            return (_ref = property.dependents) != null ? _ref.remove(this) : void 0;
          }
        }, this));
      }
      this.triggers = Batman.Property.triggerTracker;
      this.triggers.forEach(__bind(function(property) {
        property.dependents || (property.dependents = new Batman.SimpleSet);
        return property.dependents.add(this);
      }, this));
      return delete Batman.Property.triggerTracker;
    };
    Property.prototype.clearTriggers = function() {
      if (this.triggers) {
        this.triggers.forEach(__bind(function(property) {
          return property.dependents.remove(this);
        }, this));
        return this.triggers = new Batman.SimpleSet;
      }
    };
    return Property;
  })();
  Batman.Keypath = (function() {
    __extends(Keypath, Batman.Property);
    function Keypath(base, key) {
      if ($typeOf(key) === 'String') {
        this.segments = key.split('.');
        this.depth = this.segments.length;
      } else {
        this.segments = [key];
        this.depth = 1;
      }
      Keypath.__super__.constructor.apply(this, arguments);
    }
    Keypath.prototype.slice = function(begin, end) {
      var base, segment, _i, _len, _ref;
      if (end == null) {
        end = this.depth;
      }
      base = this.base;
      _ref = this.segments.slice(0, begin);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        segment = _ref[_i];
        if (!((base != null) && (base = Batman.Property.forBaseAndKey(base, segment).getValue()))) {
          return;
        }
      }
      return Batman.Property.forBaseAndKey(base, this.segments.slice(begin, end).join('.'));
    };
    Keypath.prototype.terminalProperty = function() {
      return this.slice(-1);
    };
    Keypath.prototype.getValue = function() {
      var _ref;
      this.registerAsTrigger();
      if (this.depth === 1) {
        return Keypath.__super__.getValue.apply(this, arguments);
      } else {
        return (_ref = this.terminalProperty()) != null ? _ref.getValue() : void 0;
      }
    };
    Keypath.prototype.setValue = function(val) {
      var _ref;
      if (this.depth === 1) {
        return Keypath.__super__.setValue.apply(this, arguments);
      } else {
        return (_ref = this.terminalProperty()) != null ? _ref.setValue(val) : void 0;
      }
    };
    Keypath.prototype.unsetValue = function() {
      var _ref;
      if (this.depth === 1) {
        return Keypath.__super__.unsetValue.apply(this, arguments);
      } else {
        return (_ref = this.terminalProperty()) != null ? _ref.unsetValue() : void 0;
      }
    };
    return Keypath;
  })();
  Batman.Observable = {
    isObservable: true,
    property: function(key) {
      Batman.initializeObject(this);
      return Batman.Property.forBaseAndKey(this, key);
    },
    get: function(key) {
      return this.property(key).getValue();
    },
    set: function(key, val) {
      return this.property(key).setValue(val);
    },
    unset: function(key) {
      return this.property(key).unsetValue();
    },
    getOrSet: function(key, valueFunction) {
      var currentValue;
      currentValue = this.get(key);
      if (!currentValue) {
        currentValue = valueFunction();
        this.set(key, currentValue);
      }
      return currentValue;
    },
    forget: function(key, observer) {
      if (key) {
        this.property(key).forget(observer);
      } else {
        this._batman.properties.forEach(function(key, property) {
          return property.forget();
        });
      }
      return this;
    },
    allowed: function(key) {
      return this.property(key).isAllowedToFire();
    }
  };
  _ref = ['observe', 'prevent', 'allow', 'fire'];
  _fn = function(k) {
    return Batman.Observable[k] = function() {
      var args, key, _ref2;
      key = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      (_ref2 = this.property(key))[k].apply(_ref2, args);
      return this;
    };
  };
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    k = _ref[_i];
    _fn(k);
  }
  $get = Batman.get = function(object, key) {
    if (object.get) {
      return object.get(key);
    } else {
      return Batman.Observable.get.call(object, key);
    }
  };
  Batman.EventEmitter = {
    event: $block(function(key, context, callback) {
      var f;
      if (!callback && typeof context !== 'undefined') {
        callback = context;
        context = null;
      }
      if (!callback && $typeOf(key) !== 'String') {
        callback = key;
        key = null;
      }
      f = function(observer) {
        var args, fired, firings, value, _base, _ref2, _ref3;
        if (!this.observe) {
          throw "EventEmitter requires Observable";
        }
        Batman.initializeObject(this);
        key || (key = $findName(f, this));
        fired = (_ref2 = this._batman.oneShotFired) != null ? _ref2[key] : void 0;
        if (typeof observer === 'function') {
          this.observe(key, observer);
          if (f.isOneShot && fired) {
            return observer.apply(this, f._firedArgs);
          }
        } else if (this.allowed(key)) {
          if (f.isOneShot && fired) {
            return false;
          }
          value = callback != null ? callback.apply(this, arguments) : void 0;
          if (value !== false) {
            f._firedArgs = typeof value !== 'undefined' ? (_ref3 = [value]).concat.apply(_ref3, arguments) : arguments.length === 0 ? [] : Array.prototype.slice.call(arguments);
            args = Array.prototype.slice.call(f._firedArgs);
            args.unshift(key);
            this.fire.apply(this, args);
            if (f.isOneShot) {
              firings = (_base = this._batman).oneShotFired || (_base.oneShotFired = {});
              firings[key] = true;
            }
          }
          return value;
        } else {
          return false;
        }
      };
      if (context) {
        f = f.bind(context);
      }
      if (key != null) {
        this[key] = f;
      }
      return $mixin(f, {
        isEvent: true,
        action: callback
      });
    }),
    eventOneShot: function(callback) {
      return $mixin(Batman.EventEmitter.event.apply(this, arguments), {
        isOneShot: true,
        oneShotFired: this.oneShotFired.bind(this)
      });
    },
    oneShotFired: function(key) {
      var firings, _base;
      Batman.initializeObject(this);
      firings = (_base = this._batman).oneShotFired || (_base.oneShotFired = {});
      return !!firings[key];
    }
  };
  Batman.event = $event = function(callback) {
    var context;
    context = new Batman.Object;
    return context.event('_event', context, callback);
  };
  Batman.eventOneShot = $eventOneShot = function(callback) {
    var context, oneShot;
    context = new Batman.Object;
    oneShot = context.eventOneShot('_event', context, callback);
    oneShot.oneShotFired = function() {
      return context.oneShotFired('_event');
    };
    return oneShot;
  };
  Batman.initializeObject = function(object) {
    if (object._batman != null) {
      return object._batman.check(object);
    } else {
      return object._batman = new _Batman(object);
    }
  };
  Batman._Batman = _Batman = (function() {
    function _Batman() {
      var mixins, object;
      object = arguments[0], mixins = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this.object = object;
      if (mixins.length > 0) {
        $mixin.apply(null, [this].concat(__slice.call(mixins)));
      }
    }
    _Batman.prototype.check = function(object) {
      if (object !== this.object) {
        object._batman = new _Batman(object);
        return false;
      }
      return true;
    };
    _Batman.prototype.get = function(key) {
      var results;
      results = this.getAll(key);
      switch (results.length) {
        case 0:
          return;
        case 1:
          return results[0];
        default:
          if (results[0].concat != null) {
            results = results.reduceRight(function(a, b) {
              return a.concat(b);
            });
          } else if (results[0].merge != null) {
            results = results.reduceRight(function(a, b) {
              return a.merge(b);
            });
          }
          return results;
      }
    };
    _Batman.prototype.getFirst = function(key) {
      var results;
      results = this.getAll(key);
      return results[0];
    };
    _Batman.prototype.getAll = function(keyOrGetter) {
      var getter, results, val;
      if (typeof keyOrGetter === 'function') {
        getter = keyOrGetter;
      } else {
        getter = function(ancestor) {
          var _ref2;
          return (_ref2 = ancestor._batman) != null ? _ref2[keyOrGetter] : void 0;
        };
      }
      results = this.ancestors(getter);
      if (val = getter(this.object)) {
        results.unshift(val);
      }
      return results;
    };
    _Batman.prototype.ancestors = function(getter) {
      var isClass, parent, proto, results, val, _ref2;
      if (getter == null) {
        getter = function(x) {
          return x;
        };
      }
      results = [];
      isClass = !!this.object.prototype;
      parent = isClass ? (_ref2 = this.object.__super__) != null ? _ref2.constructor : void 0 : (proto = Object.getPrototypeOf(this.object)) === this.object ? this.object.constructor.__super__ : proto;
      if (parent != null) {
        val = getter(parent);
        if (val != null) {
          results.push(val);
        }
        if (parent._batman != null) {
          results = results.concat(parent._batman.ancestors(getter));
        }
      }
      return results;
    };
    _Batman.prototype.set = function(key, value) {
      return this[key] = value;
    };
    return _Batman;
  })();
  BatmanObject = (function() {
    var getAccessorObject;
    BatmanObject.global = function(isGlobal) {
      if (isGlobal === false) {
        return;
      }
      return container[this.name] = this;
    };
    BatmanObject.classMixin = function() {
      return $mixin.apply(null, [this].concat(__slice.call(arguments)));
    };
    BatmanObject.mixin = function() {
      return this.classMixin.apply(this.prototype, arguments);
    };
    BatmanObject.prototype.mixin = BatmanObject.classMixin;
    getAccessorObject = function(accessor) {
      if (!accessor.get && !accessor.set && !accessor.unset) {
        accessor = {
          get: accessor
        };
      }
      return accessor;
    };
    BatmanObject.classAccessor = function() {
      var accessor, key, keys, _base, _j, _k, _len2, _results;
      keys = 2 <= arguments.length ? __slice.call(arguments, 0, _j = arguments.length - 1) : (_j = 0, []), accessor = arguments[_j++];
      Batman.initializeObject(this);
      if (keys.length === 0) {
        return this._batman.defaultAccessor = getAccessorObject(accessor);
      } else {
        (_base = this._batman).keyAccessors || (_base.keyAccessors = new Batman.SimpleHash);
        _results = [];
        for (_k = 0, _len2 = keys.length; _k < _len2; _k++) {
          key = keys[_k];
          _results.push(this._batman.keyAccessors.set(key, getAccessorObject(accessor)));
        }
        return _results;
      }
    };
    BatmanObject.accessor = function() {
      return this.classAccessor.apply(this.prototype, arguments);
    };
    BatmanObject.prototype.accessor = BatmanObject.classAccessor;
    function BatmanObject() {
      var mixins;
      mixins = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this._batman = new _Batman(this);
      this.mixin.apply(this, mixins);
    }
    BatmanObject.classMixin(Batman.Observable, Batman.EventEmitter);
    BatmanObject.mixin(Batman.Observable, Batman.EventEmitter);
    BatmanObject.observeAll = function() {
      return this.prototype.observe.apply(this.prototype, arguments);
    };
    BatmanObject.singleton = function(singletonMethodName) {
      if (singletonMethodName == null) {
        singletonMethodName = "sharedInstance";
      }
      return this.classAccessor(singletonMethodName, {
        get: function() {
          var _name;
          return this[_name = "_" + singletonMethodName] || (this[_name] = new this);
        }
      });
    };
    return BatmanObject;
  })();
  Batman.Object = BatmanObject;
  Batman.Accessible = (function() {
    __extends(Accessible, Batman.Object);
    function Accessible() {
      this.accessor.apply(this, arguments);
    }
    return Accessible;
  })();
  Batman.SimpleHash = (function() {
    function SimpleHash() {
      this._storage = {};
      this.length = 0;
    }
    SimpleHash.prototype.propertyClass = Batman.Property;
    SimpleHash.prototype.hasKey = function(key) {
      var match, matches, pair, _base, _j, _len2;
      matches = (_base = this._storage)[key] || (_base[key] = []);
      for (_j = 0, _len2 = matches.length; _j < _len2; _j++) {
        match = matches[_j];
        if (this.equality(match[0], key)) {
          pair = match;
          return true;
        }
      }
      return false;
    };
    SimpleHash.prototype.get = function(key) {
      var matches, obj, v, _j, _len2, _ref2;
      if (matches = this._storage[key]) {
        for (_j = 0, _len2 = matches.length; _j < _len2; _j++) {
          _ref2 = matches[_j], obj = _ref2[0], v = _ref2[1];
          if (this.equality(obj, key)) {
            return v;
          }
        }
      }
    };
    SimpleHash.prototype.set = function(key, val) {
      var match, matches, pair, _base, _j, _len2;
      matches = (_base = this._storage)[key] || (_base[key] = []);
      for (_j = 0, _len2 = matches.length; _j < _len2; _j++) {
        match = matches[_j];
        if (this.equality(match[0], key)) {
          pair = match;
          break;
        }
      }
      if (!pair) {
        pair = [key];
        matches.push(pair);
        this.length++;
      }
      return pair[1] = val;
    };
    SimpleHash.prototype.unset = function(key) {
      var index, matches, obj, v, _len2, _ref2;
      if (matches = this._storage[key]) {
        for (index = 0, _len2 = matches.length; index < _len2; index++) {
          _ref2 = matches[index], obj = _ref2[0], v = _ref2[1];
          if (this.equality(obj, key)) {
            matches.splice(index, 1);
            this.length--;
            return;
          }
        }
      }
    };
    SimpleHash.prototype.getOrSet = Batman.Observable.getOrSet;
    SimpleHash.prototype.equality = function(lhs, rhs) {
      if (lhs === rhs) {
        return true;
      }
      if (lhs !== lhs && rhs !== rhs) {
        return true;
      }
      if ((lhs != null ? typeof lhs.isEqual === "function" ? lhs.isEqual(rhs) : void 0 : void 0) && (rhs != null ? typeof rhs.isEqual === "function" ? rhs.isEqual(lhs) : void 0 : void 0)) {
        return true;
      }
      return false;
    };
    SimpleHash.prototype.forEach = function(iterator) {
      var key, obj, value, values, _ref2, _results;
      _ref2 = this._storage;
      _results = [];
      for (key in _ref2) {
        values = _ref2[key];
        _results.push((function() {
          var _j, _len2, _ref3, _results2;
          _results2 = [];
          for (_j = 0, _len2 = values.length; _j < _len2; _j++) {
            _ref3 = values[_j], obj = _ref3[0], value = _ref3[1];
            _results2.push(iterator(obj, value));
          }
          return _results2;
        })());
      }
      return _results;
    };
    SimpleHash.prototype.keys = function() {
      var result;
      result = [];
      this.forEach(function(obj) {
        return result.push(obj);
      });
      return result;
    };
    SimpleHash.prototype.clear = function() {
      this._storage = {};
      return this.length = 0;
    };
    SimpleHash.prototype.isEmpty = function() {
      return this.length === 0;
    };
    SimpleHash.prototype.merge = function() {
      var hash, merged, others, _j, _len2;
      others = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      merged = new this.constructor;
      others.unshift(this);
      for (_j = 0, _len2 = others.length; _j < _len2; _j++) {
        hash = others[_j];
        hash.forEach(function(obj, value) {
          return merged.set(obj, value);
        });
      }
      return merged;
    };
    return SimpleHash;
  })();
  Batman.Hash = (function() {
    var k, _j, _len2, _ref2;
    __extends(Hash, Batman.Object);
    function Hash() {
      var self;
      Batman.SimpleHash.apply(this, arguments);
      this.meta = new Batman.Object({
        length: 0
      });
      self = this;
      this.meta.accessor('isEmpty', function() {
        return self.isEmpty();
      });
      this.meta.accessor('keys', function() {
        return self.keys();
      });
      Hash.__super__.constructor.apply(this, arguments);
    }
    Hash.prototype.propertyClass = Batman.Property;
    Hash.accessor({
      get: Batman.SimpleHash.prototype.get,
      set: function() {
        var results;
        results = Batman.SimpleHash.prototype.set.apply(this, arguments);
        this.meta.set('length', this.length);
        return results;
      },
      unset: function() {
        var results;
        results = Batman.SimpleHash.prototype.unset.apply(this, arguments);
        this.meta.set('length', this.length);
        return results;
      }
    });
    _ref2 = ['hasKey', 'equality', 'forEach', 'keys', 'isEmpty', 'merge'];
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      k = _ref2[_j];
      Hash.prototype[k] = Batman.SimpleHash.prototype[k];
    }
    Hash.prototype.clear = function() {
      var results;
      results = Batman.SimpleHash.prototype.clear.apply(this, arguments);
      this.meta.set('length', this.length);
      return results;
    };
    return Hash;
  })();
  Batman.SimpleSet = (function() {
    function SimpleSet() {
      this._storage = new Batman.SimpleHash;
      this._indexes = new Batman.SimpleHash;
      this._sorts = new Batman.SimpleHash;
      this.length = 0;
      if (arguments.length > 0) {
        this.add.apply(this, arguments);
      }
    }
    SimpleSet.prototype.has = function(item) {
      return this._storage.hasKey(item);
    };
    SimpleSet.prototype.add = function() {
      var addedItems, item, items, _j, _len2;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      addedItems = [];
      for (_j = 0, _len2 = items.length; _j < _len2; _j++) {
        item = items[_j];
        if (!this._storage.hasKey(item)) {
          this._storage.set(item, true);
          addedItems.push(item);
          this.length++;
        }
      }
      if (addedItems.length !== 0) {
        this.itemsWereAdded.apply(this, addedItems);
      }
      return addedItems;
    };
    SimpleSet.prototype.remove = function() {
      var item, items, removedItems, _j, _len2;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      removedItems = [];
      for (_j = 0, _len2 = items.length; _j < _len2; _j++) {
        item = items[_j];
        if (this._storage.hasKey(item)) {
          this._storage.unset(item);
          removedItems.push(item);
          this.length--;
        }
      }
      if (removedItems.length !== 0) {
        this.itemsWereRemoved.apply(this, removedItems);
      }
      return removedItems;
    };
    SimpleSet.prototype.forEach = function(iterator) {
      return this._storage.forEach(function(key, value) {
        return iterator(key);
      });
    };
    SimpleSet.prototype.isEmpty = function() {
      return this.length === 0;
    };
    SimpleSet.prototype.clear = function() {
      var items;
      items = this.toArray();
      this._storage = new Batman.SimpleHash;
      this.length = 0;
      this.itemsWereRemoved.apply(this, items);
      return items;
    };
    SimpleSet.prototype.toArray = function() {
      return this._storage.keys();
    };
    SimpleSet.prototype.merge = function() {
      var merged, others, set, _j, _len2;
      others = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      merged = new this.constructor;
      others.unshift(this);
      for (_j = 0, _len2 = others.length; _j < _len2; _j++) {
        set = others[_j];
        set.forEach(function(v) {
          return merged.add(v);
        });
      }
      return merged;
    };
    SimpleSet.prototype.indexedBy = function(key) {
      return this._indexes.get(key) || this._indexes.set(key, new Batman.SetIndex(this, key));
    };
    SimpleSet.prototype.sortedBy = function(key) {
      return this._sorts.get(key) || this._sorts.set(key, new Batman.SetSort(this, key));
    };
    SimpleSet.prototype.itemsWereAdded = function() {};
    SimpleSet.prototype.itemsWereRemoved = function() {};
    return SimpleSet;
  })();
  Batman.Set = (function() {
    var k, _fn2, _j, _k, _len2, _len3, _ref2, _ref3;
    __extends(Set, Batman.Object);
    function Set() {
      Batman.SimpleSet.apply(this, arguments);
      this.set('length', 0);
    }
    Set.prototype.itemsWereAdded = Set.event(function() {});
    Set.prototype.itemsWereRemoved = Set.event(function() {});
    _ref2 = ['has', 'forEach', 'isEmpty', 'toArray', 'indexedBy', 'sortedBy'];
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      k = _ref2[_j];
      Set.prototype[k] = Batman.SimpleSet.prototype[k];
    }
    _ref3 = ['add', 'remove', 'clear', 'merge'];
    _fn2 = __bind(function(k) {
      return this.prototype[k] = function() {
        var newLength, oldLength, results, _ref4;
        oldLength = this.length;
        this.prevent('length');
        results = Batman.SimpleSet.prototype[k].apply(this, arguments);
        _ref4 = [this.length, oldLength], newLength = _ref4[0], this.length = _ref4[1];
        this.allow('length');
        if (newLength !== oldLength) {
          this.set('length', newLength);
        }
        return results;
      };
    }, Set);
    for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
      k = _ref3[_k];
      _fn2(k);
    }
    Set.accessor('indexedBy', function() {
      return new Batman.Accessible(__bind(function(key) {
        return this.indexedBy(key);
      }, this));
    });
    Set.accessor('sortedBy', function() {
      return new Batman.Accessible(__bind(function(key) {
        return this.sortedBy(key);
      }, this));
    });
    Set.accessor('isEmpty', function() {
      return this.isEmpty();
    });
    return Set;
  }).call(this);
  Batman.SetObserver = (function() {
    __extends(SetObserver, Batman.Object);
    function SetObserver(base) {
      this.base = base;
      this._itemObservers = new Batman.Hash;
      this._setObservers = new Batman.Hash;
      this._setObservers.set("itemsWereAdded", this.itemsWereAdded.bind(this));
      this._setObservers.set("itemsWereRemoved", this.itemsWereRemoved.bind(this));
      this.observe('itemsWereAdded', this.startObservingItems.bind(this));
      this.observe('itemsWereRemoved', this.stopObservingItems.bind(this));
    }
    SetObserver.prototype.itemsWereAdded = SetObserver.event(function() {});
    SetObserver.prototype.itemsWereRemoved = SetObserver.event(function() {});
    SetObserver.prototype.observedItemKeys = [];
    SetObserver.prototype.observerForItemAndKey = function(item, key) {};
    SetObserver.prototype._getOrSetObserverForItemAndKey = function(item, key) {
      return this._itemObservers.getOrSet(item, __bind(function() {
        var observersByKey;
        observersByKey = new Batman.Hash;
        return observersByKey.getOrSet(key, __bind(function() {
          return this.observerForItemAndKey(item, key);
        }, this));
      }, this));
    };
    SetObserver.prototype.startObserving = function() {
      this._manageItemObservers("observe");
      return this._manageSetObservers("observe");
    };
    SetObserver.prototype.stopObserving = function() {
      this._manageItemObservers("forget");
      return this._manageSetObservers("forget");
    };
    SetObserver.prototype.startObservingItems = function() {
      var item, items, _j, _len2, _results;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_j = 0, _len2 = items.length; _j < _len2; _j++) {
        item = items[_j];
        _results.push(this._manageObserversForItem(item, "observe"));
      }
      return _results;
    };
    SetObserver.prototype.stopObservingItems = function() {
      var item, items, _j, _len2, _results;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_j = 0, _len2 = items.length; _j < _len2; _j++) {
        item = items[_j];
        _results.push(this._manageObserversForItem(item, "forget"));
      }
      return _results;
    };
    SetObserver.prototype._manageObserversForItem = function(item, method) {
      var key, _j, _len2, _ref2;
      if (!item.isObservable) {
        return;
      }
      _ref2 = this.observedItemKeys;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        key = _ref2[_j];
        item[method](key, this._getOrSetObserverForItemAndKey(item, key));
      }
      if (method === "forget") {
        return this._itemObservers.unset(item);
      }
    };
    SetObserver.prototype._manageItemObservers = function(method) {
      return this.base.forEach(__bind(function(item) {
        return this._manageObserversForItem(item, method);
      }, this));
    };
    SetObserver.prototype._manageSetObservers = function(method) {
      if (!this.base.isObservable) {
        return;
      }
      return this._setObservers.forEach(__bind(function(key, observer) {
        return this.base[method](key, observer);
      }, this));
    };
    return SetObserver;
  })();
  Batman.SetSort = (function() {
    __extends(SetSort, Batman.Object);
    function SetSort(base, key) {
      var boundReIndex;
      this.base = base;
      this.key = key;
      if (this.base.isObservable) {
        this._setObserver = new Batman.SetObserver(this.base);
        this._setObserver.observedItemKeys = [this.key];
        boundReIndex = this._reIndex.bind(this);
        this._setObserver.observerForItemAndKey = function() {
          return boundReIndex;
        };
        this._setObserver.observe('itemsWereAdded', boundReIndex);
        this._setObserver.observe('itemsWereRemoved', boundReIndex);
        this.startObserving();
      }
      this._reIndex();
    }
    SetSort.prototype.startObserving = function() {
      var _ref2;
      return (_ref2 = this._setObserver) != null ? _ref2.startObserving() : void 0;
    };
    SetSort.prototype.stopObserving = function() {
      var _ref2;
      return (_ref2 = this._setObserver) != null ? _ref2.stopObserving() : void 0;
    };
    SetSort.prototype.toArray = function() {
      return this.get('_storage');
    };
    SetSort.accessor('toArray', SetSort.prototype.toArray);
    SetSort.prototype.forEach = function(iterator) {
      var e, i, _len2, _ref2, _results;
      _ref2 = this.get('_storage');
      _results = [];
      for (i = 0, _len2 = _ref2.length; i < _len2; i++) {
        e = _ref2[i];
        _results.push(iterator(e, i));
      }
      return _results;
    };
    SetSort.prototype.compare = function(a, b) {
      var typeComparison;
      if (a === b) {
        return 0;
      }
      if (a === void 0) {
        return 1;
      }
      if (b === void 0) {
        return -1;
      }
      if (a === null) {
        return 1;
      }
      if (b === null) {
        return -1;
      }
      if ((typeof a.isEqual === "function" ? a.isEqual(b) : void 0) && (typeof b.isEqual === "function" ? b.isEqual(a) : void 0)) {
        return 0;
      }
      typeComparison = Batman.SetSort.prototype.compare($typeOf(a), $typeOf(b));
      if (typeComparison !== 0) {
        return typeComparison;
      }
      if (a !== a) {
        return 1;
      }
      if (b !== b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      if (a < b) {
        return -1;
      }
      return 0;
    };
    SetSort.prototype._reIndex = function() {
      var newOrder, _ref2;
      newOrder = this.base.toArray().sort(__bind(function(a, b) {
        var valueA, valueB;
        valueA = Batman.Observable.property.call(a, this.key).getValue();
        if (valueA != null) {
          valueA = valueA.valueOf();
        }
        valueB = Batman.Observable.property.call(b, this.key).getValue();
        if (valueB != null) {
          valueB = valueB.valueOf();
        }
        return this.compare.call(this, valueA, valueB);
      }, this));
      if ((_ref2 = this._setObserver) != null) {
        _ref2.startObservingItems.apply(_ref2, newOrder);
      }
      return this.set('_storage', newOrder);
    };
    return SetSort;
  })();
  Batman.SetIndex = (function() {
    __extends(SetIndex, Batman.Object);
    function SetIndex(base, key) {
      this.base = base;
      this.key = key;
      this._storage = new Batman.Hash;
      if (this.base.isObservable) {
        this._setObserver = new Batman.SetObserver(this.base);
        this._setObserver.observedItemKeys = [this.key];
        this._setObserver.observerForItemAndKey = this.observerForItemAndKey.bind(this);
        this._setObserver.observe('itemsWereAdded', __bind(function() {
          var item, items, _j, _len2, _results;
          items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          _results = [];
          for (_j = 0, _len2 = items.length; _j < _len2; _j++) {
            item = items[_j];
            _results.push(this._addItem(item));
          }
          return _results;
        }, this));
        this._setObserver.observe('itemsWereRemoved', __bind(function() {
          var item, items, _j, _len2, _results;
          items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          _results = [];
          for (_j = 0, _len2 = items.length; _j < _len2; _j++) {
            item = items[_j];
            _results.push(this._removeItem(item));
          }
          return _results;
        }, this));
      }
      this.base.forEach(this._addItem.bind(this));
      this.startObserving();
    }
    SetIndex.accessor(function(key) {
      return this._resultSetForKey(key);
    });
    SetIndex.prototype.startObserving = function() {
      var _ref2;
      return (_ref2 = this._setObserver) != null ? _ref2.startObserving() : void 0;
    };
    SetIndex.prototype.stopObserving = function() {
      var _ref2;
      return (_ref2 = this._setObserver) != null ? _ref2.stopObserving() : void 0;
    };
    SetIndex.prototype.observerForItemAndKey = function(item, key) {
      return __bind(function(newValue, oldValue) {
        this._removeItemFromKey(item, oldValue);
        return this._addItemToKey(item, newValue);
      }, this);
    };
    SetIndex.prototype._addItem = function(item) {
      return this._addItemToKey(item, this._keyForItem(item));
    };
    SetIndex.prototype._addItemToKey = function(item, key) {
      return this._resultSetForKey(key).add(item);
    };
    SetIndex.prototype._removeItem = function(item) {
      return this._removeItemFromKey(item, this._keyForItem(item));
    };
    SetIndex.prototype._removeItemFromKey = function(item, key) {
      return this._resultSetForKey(key).remove(item);
    };
    SetIndex.prototype._resultSetForKey = function(key) {
      return this._storage.getOrSet(key, function() {
        return new Batman.Set;
      });
    };
    SetIndex.prototype._keyForItem = function(item) {
      return Batman.Keypath.forBaseAndKey(item, this.key).getValue();
    };
    return SetIndex;
  })();
  Batman.UniqueSetIndex = (function() {
    __extends(UniqueSetIndex, Batman.SetIndex);
    function UniqueSetIndex() {
      this._uniqueIndex = new Batman.Hash;
      UniqueSetIndex.__super__.constructor.apply(this, arguments);
    }
    UniqueSetIndex.accessor(function(key) {
      return this._uniqueIndex.get(key);
    });
    UniqueSetIndex.prototype._addItemToKey = function(item, key) {
      this._resultSetForKey(key).add(item);
      if (!this._uniqueIndex.hasKey(key)) {
        return this._uniqueIndex.set(key, item);
      }
    };
    UniqueSetIndex.prototype._removeItemFromKey = function(item, key) {
      var resultSet;
      resultSet = this._resultSetForKey(key);
      resultSet.remove(item);
      if (resultSet.length === 0) {
        return this._uniqueIndex.unset(key);
      } else {
        return this._uniqueIndex.set(key, resultSet.toArray()[0]);
      }
    };
    return UniqueSetIndex;
  })();
  Batman.SortableSet = (function() {
    __extends(SortableSet, Batman.Set);
    function SortableSet() {
      SortableSet.__super__.constructor.apply(this, arguments);
      this._sortIndexes = {};
      this.observe('activeIndex', __bind(function() {
        return this.setWasSorted(this);
      }, this));
    }
    SortableSet.prototype.setWasSorted = SortableSet.event(function() {
      if (this.length === 0) {
        return false;
      }
    });
    SortableSet.prototype.add = function() {
      var results;
      results = SortableSet.__super__.add.apply(this, arguments);
      this._reIndex();
      return results;
    };
    SortableSet.prototype.remove = function() {
      var results;
      results = SortableSet.__super__.remove.apply(this, arguments);
      this._reIndex();
      return results;
    };
    SortableSet.prototype.addIndex = function(index) {
      return this._reIndex(index);
    };
    SortableSet.prototype.removeIndex = function(index) {
      this._sortIndexes[index] = null;
      delete this._sortIndexes[index];
      if (this.activeIndex === index) {
        this.unset('activeIndex');
      }
      return index;
    };
    SortableSet.prototype.forEach = function(iterator) {
      var el, _j, _len2, _ref2, _results;
      _ref2 = this.toArray();
      _results = [];
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        el = _ref2[_j];
        _results.push(iterator(el));
      }
      return _results;
    };
    SortableSet.prototype.sortBy = function(index) {
      if (!this._sortIndexes[index]) {
        this.addIndex(index);
      }
      if (this.activeIndex !== index) {
        this.set('activeIndex', index);
      }
      return this;
    };
    SortableSet.prototype.isSorted = function() {
      return this._sortIndexes[this.get('activeIndex')] != null;
    };
    SortableSet.prototype.toArray = function() {
      return this._sortIndexes[this.get('activeIndex')] || SortableSet.__super__.toArray.apply(this, arguments);
    };
    SortableSet.prototype._reIndex = function(index) {
      var ary, keypath, ordering, _ref2;
      if (index) {
        _ref2 = index.split(' '), keypath = _ref2[0], ordering = _ref2[1];
        ary = Batman.Set.prototype.toArray.call(this);
        this._sortIndexes[index] = ary.sort(function(a, b) {
          var valueA, valueB, _ref3, _ref4, _ref5;
          valueA = (_ref3 = (Batman.Observable.property.call(a, keypath)).getValue()) != null ? _ref3.valueOf() : void 0;
          valueB = (_ref4 = (Batman.Observable.property.call(b, keypath)).getValue()) != null ? _ref4.valueOf() : void 0;
          if ((ordering != null ? ordering.toLowerCase() : void 0) === 'desc') {
            _ref5 = [valueB, valueA], valueA = _ref5[0], valueB = _ref5[1];
          }
          if (valueA < valueB) {
            return -1;
          } else if (valueA > valueB) {
            return 1;
          } else {
            return 0;
          }
        });
        if (this.activeIndex === index) {
          this.setWasSorted(this);
        }
      } else {
        for (index in this._sortIndexes) {
          this._reIndex(index);
        }
        this.setWasSorted(this);
      }
      return this;
    };
    return SortableSet;
  })();
  Batman.StateMachine = {
    initialize: function() {
      Batman.initializeObject(this);
      if (!this._batman.states) {
        return this._batman.states = new Batman.SimpleHash;
      }
    },
    state: function(name, callback) {
      var event;
      Batman.StateMachine.initialize.call(this);
      if (!name) {
        return this._batman.getFirst('state');
      }
      if (!this.event) {
        throw "StateMachine requires EventEmitter";
      }
      event = this[name] || this.event(name, function() {
        _stateMachine_setState.call(this, name);
        return false;
      });
      if (typeof callback === 'function') {
        event.call(this, callback);
      }
      return event;
    },
    transition: function(from, to, callback) {
      var event, name, transitions;
      Batman.StateMachine.initialize.call(this);
      this.state(from);
      this.state(to);
      name = "" + from + "->" + to;
      transitions = this._batman.states;
      event = transitions.get(name) || transitions.set(name, $event(function() {}));
      if (callback) {
        event(callback);
      }
      return event;
    }
  };
  Batman.Object.actsAsStateMachine = function(includeInstanceMethods) {
    if (includeInstanceMethods == null) {
      includeInstanceMethods = true;
    }
    Batman.StateMachine.initialize.call(this);
    Batman.StateMachine.initialize.call(this.prototype);
    this.classState = function() {
      return Batman.StateMachine.state.apply(this, arguments);
    };
    this.state = function() {
      return this.classState.apply(this.prototype, arguments);
    };
    if (includeInstanceMethods) {
      this.prototype.state = this.classState;
    }
    this.classTransition = function() {
      return Batman.StateMachine.transition.apply(this, arguments);
    };
    this.transition = function() {
      return this.classTransition.apply(this.prototype, arguments);
    };
    if (includeInstanceMethods) {
      return this.prototype.transition = this.classTransition;
    }
  };
  _stateMachine_setState = function(newState) {
    var event, name, oldState, _base, _j, _len2, _ref2, _ref3;
    Batman.StateMachine.initialize.call(this);
    if (this._batman.isTransitioning) {
      ((_base = this._batman).nextState || (_base.nextState = [])).push(newState);
      return false;
    }
    this._batman.isTransitioning = true;
    oldState = this.state();
    this._batman.state = newState;
    if (newState && oldState) {
      name = "" + oldState + "->" + newState;
      _ref2 = this._batman.getAll(function(ancestor) {
        var _ref2, _ref3;
        return (_ref2 = ancestor._batman) != null ? (_ref3 = _ref2.get('states')) != null ? _ref3.get(name) : void 0 : void 0;
      });
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        event = _ref2[_j];
        if (event) {
          event(newState, oldState);
        }
      }
    }
    if (newState) {
      this.fire(newState, newState, oldState);
    }
    this._batman.isTransitioning = false;
    if ((_ref3 = this._batman.nextState) != null ? _ref3.length : void 0) {
      this[this._batman.nextState.shift()]();
    }
    return newState;
  };
  Batman.Request = (function() {
    __extends(Request, Batman.Object);
    function Request() {
      Request.__super__.constructor.apply(this, arguments);
    }
    Request.prototype.url = '';
    Request.prototype.data = '';
    Request.prototype.method = 'get';
    Request.prototype.response = null;
    Request.prototype.status = null;
    Request.prototype.contentType = 'application/x-www-form-urlencoded';
    Request.observeAll('url', function() {
      return this._autosendTimeout = setTimeout((__bind(function() {
        return this.send();
      }, this)), 0);
    });
    Request.prototype.loading = Request.event(function() {});
    Request.prototype.loaded = Request.event(function() {});
    Request.prototype.success = Request.event(function() {});
    Request.prototype.error = Request.event(function() {});
    Request.prototype.send = function() {
      throw "Please source a dependency file for a request implementation";
    };
    Request.prototype.cancel = function() {
      if (this._autosendTimeout) {
        return clearTimeout(this._autosendTimeout);
      }
    };
    return Request;
  })();
  Batman.App = (function() {
    __extends(App, Batman.Object);
    function App() {
      App.__super__.constructor.apply(this, arguments);
    }
    App.requirePath = '';
    App.require = function() {
      var base, name, names, path, _j, _len2;
      path = arguments[0], names = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      base = this.requirePath + path;
      for (_j = 0, _len2 = names.length; _j < _len2; _j++) {
        name = names[_j];
        this.prevent('run');
        path = base + '/' + name + '.coffee';
        new Batman.Request({
          url: path,
          type: 'html',
          success: __bind(function(response) {
            CoffeeScript.eval(response);
            this.allow('run');
            return this.run();
          }, this)
        });
      }
      return this;
    };
    App.controller = function() {
      var names;
      names = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      names = names.map(function(n) {
        return n + '_controller';
      });
      return this.require.apply(this, ['controllers'].concat(__slice.call(names)));
    };
    App.model = function() {
      return this.require.apply(this, ['models'].concat(__slice.call(arguments)));
    };
    App.view = function() {
      return this.require.apply(this, ['views'].concat(__slice.call(arguments)));
    };
    App.layout = void 0;
    App.run = App.eventOneShot(function() {
      if (Batman.currentApp) {
        if (Batman.currentApp === this) {
          return;
        }
        Batman.currentApp.stop();
      }
      if (this.hasRun) {
        return false;
      }
      Batman.currentApp = this;
      if (typeof this.dispatcher === 'undefined') {
        this.dispatcher || (this.dispatcher = new Batman.Dispatcher(this));
      }
      if (typeof this.layout === 'undefined') {
        this.set('layout', new Batman.View({
          contexts: [this],
          node: document
        }));
      }
      if (typeof this.historyManager === 'undefined' && this.dispatcher.routeMap) {
        this.historyManager = Batman.historyManager = new Batman.HashHistory(this);
        this.historyManager.start();
      }
      this.hasRun = true;
      return this;
    });
    App.stop = App.eventOneShot(function() {
      var _ref2;
      if ((_ref2 = this.historyManager) != null) {
        _ref2.stop();
      }
      Batman.historyManager = null;
      this.hasRun = false;
      return this;
    });
    return App;
  })();
  Batman.Route = (function() {
    var escapeRegExp, namedOrSplat, namedParam, queryParam, splatParam;
    __extends(Route, Batman.Object);
    namedParam = /:([\w\d]+)/g;
    splatParam = /\*([\w\d]+)/g;
    queryParam = '(?:\\?.+)?';
    namedOrSplat = /[:|\*]([\w\d]+)/g;
    escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;
    function Route() {
      var array;
      Route.__super__.constructor.apply(this, arguments);
      this.pattern = this.url.replace(escapeRegExp, '\\$&');
      this.regexp = new RegExp('^' + this.pattern.replace(namedParam, '([^\/]*)').replace(splatParam, '(.*?)') + queryParam + '$');
      this.namedArguments = [];
      while ((array = namedOrSplat.exec(this.pattern)) != null) {
        if (array[1]) {
          this.namedArguments.push(array[1]);
        }
      }
    }
    Route.accessor('action', {
      get: function() {
        var components, result, signature;
        if (this.action) {
          return this.action;
        }
        if (this.options) {
          result = $mixin({}, this.options);
          if (signature = result.signature) {
            components = signature.split('#');
            result.controller = components[0];
            result.action = components[1] || 'index';
          }
          result.target = this.dispatcher.get(result.controller);
          return this.set('action', result);
        }
      },
      set: function(key, action) {
        return this.action = action;
      }
    });
    Route.prototype.parameterize = function(url) {
      var action, array, index, key, param, params, query, s, value, _j, _len2, _len3, _ref2, _ref3, _ref4, _ref5;
      _ref2 = url.split('?'), url = _ref2[0], query = _ref2[1];
      array = (_ref3 = this.regexp.exec(url)) != null ? _ref3.slice(1) : void 0;
      params = {
        url: url
      };
      action = this.get('action');
      if (typeof action === 'function') {
        params.action = action;
      } else {
        $mixin(params, action);
      }
      if (array) {
        for (index = 0, _len2 = array.length; index < _len2; index++) {
          param = array[index];
          params[this.namedArguments[index]] = param;
        }
      }
      if (query) {
        _ref4 = query.split('&');
        for (_j = 0, _len3 = _ref4.length; _j < _len3; _j++) {
          s = _ref4[_j];
          _ref5 = s.split('='), key = _ref5[0], value = _ref5[1];
          params[key] = value;
        }
      }
      return params;
    };
    Route.prototype.dispatch = function(url) {
      var action, params, _ref2, _ref3;
      if ($typeOf(url) === 'String') {
        params = this.parameterize(url);
      }
      if (!(action = params.action) && url !== '/404') {
        $redirect('/404');
      }
      if (typeof action === 'function') {
        return action(params);
      }
      if ((_ref2 = params.target) != null ? _ref2.dispatch : void 0) {
        return params.target.dispatch(action, params);
      }
      return (_ref3 = params.target) != null ? _ref3[action](params) : void 0;
    };
    return Route;
  })();
  Batman.Dispatcher = (function() {
    __extends(Dispatcher, Batman.Object);
    function Dispatcher(app) {
      var controller, key, _ref2;
      this.app = app;
      this.app.route(this);
      this.app.controllers = new Batman.Object;
      _ref2 = this.app;
      for (key in _ref2) {
        controller = _ref2[key];
        if (!((controller != null ? controller.prototype : void 0) instanceof Batman.Controller)) {
          continue;
        }
        this.prepareController(controller);
      }
    }
    Dispatcher.prototype.prepareController = function(controller) {
      var getter, name;
      name = helpers.underscore($functionName(controller).replace('Controller', ''));
      if (!name) {
        return;
      }
      getter = function() {
        return this[name] = controller.get('sharedController');
      };
      this.accessor(name, getter);
      return this.app.controllers.accessor(name, getter);
    };
    Dispatcher.prototype.register = function(url, options) {
      var route;
      if (url.indexOf('/') !== 0) {
        url = "/" + url;
      }
      route = $typeOf(options) === 'Function' ? new Batman.Route({
        url: url,
        action: options,
        dispatcher: this
      }) : new Batman.Route({
        url: url,
        options: options,
        dispatcher: this
      });
      this.routeMap || (this.routeMap = {});
      return this.routeMap[url] = route;
    };
    Dispatcher.prototype.findRoute = function(url) {
      var route, routeUrl, _ref2;
      if (url.indexOf('/') !== 0) {
        url = "/" + url;
      }
      if ((route = this.routeMap[url])) {
        return route;
      }
      _ref2 = this.routeMap;
      for (routeUrl in _ref2) {
        route = _ref2[routeUrl];
        if (route.regexp.test(url)) {
          return route;
        }
      }
    };
    Dispatcher.prototype.findUrl = function(params) {
      var action, controller, key, matches, options, route, url, value, _ref2, _ref3;
      _ref2 = this.routeMap;
      for (url in _ref2) {
        route = _ref2[url];
        matches = false;
        options = route.options;
        if (params.resource) {
          matches = options.resource === params.resource && options.action === params.action;
        } else {
          action = route.get('action');
          if (typeof action === 'function') {
            continue;
          }
          _ref3 = action, controller = _ref3.controller, action = _ref3.action;
          if (controller === params.controller && action === (params.action || 'index')) {
            matches = true;
          }
        }
        if (!matches) {
          continue;
        }
        for (key in params) {
          value = params[key];
          url = url.replace(new RegExp('[:|\*]' + key), value);
        }
        return url;
      }
    };
    Dispatcher.prototype.dispatch = function(url) {
      var route;
      route = this.findRoute(url);
      if (route) {
        route.dispatch(url);
      } else if (url !== '/404') {
        $redirect('/404');
      }
      return this.app.set('currentURL', url);
    };
    return Dispatcher;
  })();
  Batman.HistoryManager = (function() {
    function HistoryManager(app) {
      this.app = app;
    }
    HistoryManager.prototype.dispatch = function(url) {
      if (url.indexOf('/') !== 0) {
        url = "/" + url;
      }
      this.app.dispatcher.dispatch(url);
      return url;
    };
    HistoryManager.prototype.redirect = function(url) {
      if ($typeOf(url) !== 'String') {
        url = this.app.dispatcher.findUrl(url);
      }
      return this.dispatch(url);
    };
    return HistoryManager;
  })();
  Batman.HashHistory = (function() {
    __extends(HashHistory, Batman.HistoryManager);
    function HashHistory() {
      this.parseHash = __bind(this.parseHash, this);
      this.stop = __bind(this.stop, this);
      this.start = __bind(this.start, this);
      HashHistory.__super__.constructor.apply(this, arguments);
    }
    HashHistory.prototype.HASH_PREFIX = '#!';
    HashHistory.prototype.start = function() {
      if (typeof window === 'undefined') {
        return;
      }
      if (this.started) {
        return;
      }
      this.started = true;
      if ('onhashchange' in window) {
        window.addEventListener('hashchange', this.parseHash, false);
      } else {
        this.interval = setInterval(this.parseHash, 100);
      }
      return setTimeout(this.parseHash, 0);
    };
    HashHistory.prototype.stop = function() {
      if (this.interval) {
        this.interval = clearInterval(this.interval);
      } else {
        window.removeEventListener('hashchange', this.parseHash, false);
      }
      return this.started = false;
    };
    HashHistory.prototype.urlFor = function(url) {
      return this.HASH_PREFIX + url;
    };
    HashHistory.prototype.parseHash = function() {
      var hash;
      hash = window.location.hash.replace(this.HASH_PREFIX, '');
      if (hash === this.cachedHash) {
        return;
      }
      return this.dispatch((this.cachedHash = hash));
    };
    HashHistory.prototype.redirect = function(params) {
      var url;
      url = HashHistory.__super__.redirect.apply(this, arguments);
      this.cachedHash = url;
      return window.location.hash = this.HASH_PREFIX + url;
    };
    return HashHistory;
  })();
  Batman.redirect = $redirect = function(url) {
    var _ref2;
    return (_ref2 = Batman.historyManager) != null ? _ref2.redirect(url) : void 0;
  };
  Batman.App.classMixin({
    route: function(url, signature, options) {
      var dispatcher, key, value, _ref2;
      if (options == null) {
        options = {};
      }
      if (!url) {
        return;
      }
      if (url instanceof Batman.Dispatcher) {
        dispatcher = url;
        _ref2 = this._dispatcherCache;
        for (key in _ref2) {
          value = _ref2[key];
          dispatcher.register(key, value);
        }
        this._dispatcherCache = null;
        return dispatcher;
      }
      if ($typeOf(signature) === 'String') {
        options.signature = signature;
      } else if ($typeOf(signature) === 'Function') {
        options = signature;
      } else if (signature) {
        $mixin(options, signature);
      }
      this._dispatcherCache || (this._dispatcherCache = {});
      return this._dispatcherCache[url] = options;
    },
    root: function(signature, options) {
      return this.route('/', signature, options);
    },
    resources: function(resource, options, callback) {
      var app, controller, ops;
      if (typeof options === 'function') {
        callback = options;
        options = null;
      }
      resource = helpers.pluralize(resource);
      controller = (options != null ? options.controller : void 0) || resource;
      this.route(resource, "" + controller + "#index", {
        resource: controller,
        action: 'index'
      });
      this.route("" + resource + "/:id", "" + controller + "#show", {
        resource: controller,
        action: 'show'
      });
      this.route("" + resource + "/:id/edit", "" + controller + "#edit", {
        resource: controller,
        action: 'edit'
      });
      this.route("" + resource + "/:id/destroy", "" + controller + "#destroy", {
        resource: controller,
        action: 'destroy'
      });
      if (callback) {
        app = this;
        ops = {
          collection: function(collectionCallback) {
            return collectionCallback != null ? collectionCallback.call({
              route: function(url, methodName) {
                return app.route("" + resource + "/" + url, "" + controller + "#" + (methodName || url));
              }
            }) : void 0;
          },
          member: function(memberCallback) {
            return memberCallback != null ? memberCallback.call({
              route: function(url, methodName) {
                return app.route("" + resource + "/:id/" + url, "" + controller + "#" + (methodName || url));
              }
            }) : void 0;
          }
        };
        return callback.call(ops);
      }
    },
    redirect: $redirect
  });
  Batman.Controller = (function() {
    __extends(Controller, Batman.Object);
    function Controller() {
      this.redirect = __bind(this.redirect, this);
      Controller.__super__.constructor.apply(this, arguments);
    }
    Controller.singleton('sharedController');
    Controller.beforeFilter = function(nameOrFunction) {
      var filters, _base;
      Batman.initializeObject(this);
      filters = (_base = this._batman).beforeFilters || (_base.beforeFilters = []);
      if (filters.indexOf(nameOrFunction) === -1) {
        return filters.push(nameOrFunction);
      }
    };
    Controller.accessor('controllerName', {
      get: function() {
        return this._controllerName || (this._controllerName = helpers.underscore($functionName(this.constructor).replace('Controller', '')));
      }
    });
    Controller.accessor('action', {
      get: function() {
        return this._currentAction;
      },
      set: function(key, value) {
        return this._currentAction = value;
      }
    });
    Controller.prototype.dispatch = function(action, params) {
      var filter, filters, oldRedirect, redirectTo, _j, _k, _len2, _len3, _ref2, _ref3, _ref4, _ref5, _ref6;
      if (params == null) {
        params = {};
      }
      params.controller || (params.controller = this.get('controllerName'));
      params.action || (params.action = action);
      params.target || (params.target = this);
      oldRedirect = (_ref2 = Batman.historyManager) != null ? _ref2.redirect : void 0;
      if ((_ref3 = Batman.historyManager) != null) {
        _ref3.redirect = this.redirect;
      }
      this._actedDuringAction = false;
      this.set('action', action);
      if (filters = (_ref4 = this.constructor._batman) != null ? _ref4.get('beforeFilters') : void 0) {
        for (_j = 0, _len2 = filters.length; _j < _len2; _j++) {
          filter = filters[_j];
          if (typeof filter === 'function') {
            filter.call(this, params);
          } else {
            this[filter](params);
          }
        }
      }
      this[action](params);
      if (!this._actedDuringAction) {
        this.render();
      }
      if (filters = (_ref5 = this.constructor._batman) != null ? _ref5.get('afterFilters') : void 0) {
        for (_k = 0, _len3 = filters.length; _k < _len3; _k++) {
          filter = filters[_k];
          if (typeof filter === 'function') {
            filter.call(this, params);
          } else {
            this[filter](params);
          }
        }
      }
      delete this._actedDuringAction;
      this.set('action', null);
      if ((_ref6 = Batman.historyManager) != null) {
        _ref6.redirect = oldRedirect;
      }
      redirectTo = this._afterFilterRedirect;
      delete this._afterFilterRedirect;
      if (redirectTo) {
        return $redirect(redirectTo);
      }
    };
    Controller.prototype.redirect = function(url) {
      if (this._actedDuringAction) {
        throw 'DoubleRedirectError';
      }
      if (this.get('action')) {
        this._actedDuringAction = true;
        return this._afterFilterRedirect = url;
      } else {
        if ($typeOf(url) === 'Object') {
          if (!url.controller) {
            url.controller = this;
          }
        }
        return $redirect(url);
      }
    };
    Controller.prototype.render = function(options) {
      var view;
      if (options == null) {
        options = {};
      }
      if (this._actedDuringAction) {
        throw 'DoubleRenderError';
      }
      this._actedDuringAction = true;
      if (options === false) {
        return;
      }
      if (!options.view) {
        options.source || (options.source = helpers.underscore($functionName(this.constructor).replace('Controller', '')) + '/' + this._currentAction + '.html');
        options.view = new Batman.View(options);
      }
      if (view = options.view) {
        view.contexts.push(this);
        view.ready(function() {
          return Batman.DOM.contentFor('main', view.get('node'));
        });
      }
      return view;
    };
    return Controller;
  })();
  Batman.Model = (function() {
    var k, _j, _k, _len2, _len3, _ref2, _ref3;
    __extends(Model, Batman.Object);
    Model.primaryKey = 'id';
    Model.storageKey = null;
    Model.persist = function() {
      var mechanism, mechanisms, results, storage, _base;
      mechanisms = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      Batman.initializeObject(this.prototype);
      storage = (_base = this.prototype._batman).storage || (_base.storage = []);
      results = (function() {
        var _j, _len2, _results;
        _results = [];
        for (_j = 0, _len2 = mechanisms.length; _j < _len2; _j++) {
          mechanism = mechanisms[_j];
          mechanism = mechanism.isStorageAdapter ? mechanism : new mechanism(this);
          storage.push(mechanism);
          _results.push(mechanism);
        }
        return _results;
      }).call(this);
      if (results.length > 1) {
        return results;
      } else {
        return results[0];
      }
    };
    Model.encode = function() {
      var decoder, encoder, encoderOrLastKey, key, keys, _base, _base2, _j, _k, _len2, _results;
      keys = 2 <= arguments.length ? __slice.call(arguments, 0, _j = arguments.length - 1) : (_j = 0, []), encoderOrLastKey = arguments[_j++];
      Batman.initializeObject(this.prototype);
      (_base = this.prototype._batman).encoders || (_base.encoders = new Batman.SimpleHash);
      (_base2 = this.prototype._batman).decoders || (_base2.decoders = new Batman.SimpleHash);
      switch ($typeOf(encoderOrLastKey)) {
        case 'String':
          keys.push(encoderOrLastKey);
          break;
        case 'Function':
          encoder = encoderOrLastKey;
          break;
        default:
          encoder = encoderOrLastKey.encode;
          decoder = encoderOrLastKey.decode;
      }
      _results = [];
      for (_k = 0, _len2 = keys.length; _k < _len2; _k++) {
        key = keys[_k];
        this.prototype._batman.encoders.set(key, encoder || this.defaultEncoder.encode);
        _results.push(this.prototype._batman.decoders.set(key, decoder || this.defaultEncoder.decode));
      }
      return _results;
    };
    Model.defaultEncoder = {
      encode: function(x) {
        return x;
      },
      decode: function(x) {
        return x;
      }
    };
    Model.observe('primaryKey', true, function(newPrimaryKey) {
      return this.encode(newPrimaryKey, this.defaultEncoder);
    });
    Model.validate = function() {
      var keys, match, matches, options, optionsOrFunction, validator, validators, _base, _j, _k, _len2, _results;
      keys = 2 <= arguments.length ? __slice.call(arguments, 0, _j = arguments.length - 1) : (_j = 0, []), optionsOrFunction = arguments[_j++];
      Batman.initializeObject(this.prototype);
      validators = (_base = this.prototype._batman).validators || (_base.validators = []);
      if (typeof optionsOrFunction === 'function') {
        return validators.push({
          keys: keys,
          callback: optionsOrFunction
        });
      } else {
        options = optionsOrFunction;
        _results = [];
        for (_k = 0, _len2 = Validators.length; _k < _len2; _k++) {
          validator = Validators[_k];
          _results.push((function() {
            var _l, _len3;
            if ((matches = validator.matches(options))) {
              for (_l = 0, _len3 = matches.length; _l < _len3; _l++) {
                match = matches[_l];
                delete options[match];
              }
              return validators.push({
                keys: keys,
                validator: new validator(matches)
              });
            }
          })());
        }
        return _results;
      }
    };
    Model.classAccessor('all', {
      get: function() {
        var _ref2;
        if (this.prototype.hasStorage() && ((_ref2 = this.classState()) !== 'loaded' && _ref2 !== 'loading')) {
          this.load();
        }
        return this.get('loaded');
      },
      set: function(k, v) {
        return this.set('loaded', v);
      }
    });
    Model.classAccessor('loaded', {
      get: function() {
        if (!this.all) {
          this.all = new Batman.SortableSet;
          this.all.sortBy("id asc");
        }
        return this.all;
      },
      set: function(k, v) {
        return this.all = v;
      }
    });
    Model.classAccessor('first', function() {
      return this.get('all').toArray()[0];
    });
    Model.classAccessor('last', function() {
      var x;
      x = this.get('all').toArray();
      return x[x.length - 1];
    });
    Model.find = function(id, callback) {
      var newRecord, record;
      if (!callback) {
        throw "missing callback";
      }
      record = new this(id);
      newRecord = this._mapIdentities([record])[0];
      newRecord.load(callback);
    };
    Model.load = function(options, callback) {
      if ($typeOf(options) === 'Function') {
        callback = options;
        options = {};
      }
      if (!this.prototype._batman.getAll('storage').length) {
        throw new Error("Can't load model " + this.name + " without any storage adapters!");
      }
      this.loading();
      return this.prototype._doStorageOperation('readAll', options, __bind(function(err, records) {
        if (err != null) {
          return typeof callback === "function" ? callback(err, []) : void 0;
        } else {
          records = this._mapIdentities(records);
          this.loaded();
          return typeof callback === "function" ? callback(err, records) : void 0;
        }
      }, this));
    };
    Model.create = function(attrs, callback) {
      var obj, _ref2;
      if (!callback) {
        _ref2 = [{}, attrs], attrs = _ref2[0], callback = _ref2[1];
      }
      obj = new this(attrs);
      obj.save(callback);
      return obj;
    };
    Model._mapIdentities = function(records) {
      var all, existingRecord, id, newRecords, potential, record, returnRecords, _j, _k, _len2, _len3, _ref2;
      all = this.get('loaded').toArray();
      newRecords = [];
      returnRecords = [];
      for (_j = 0, _len2 = records.length; _j < _len2; _j++) {
        record = records[_j];
        if (typeof record === 'undefined') {
          continue;
        }
        if (typeof (id = record.get('id')) === 'undefined' || id === '') {
          returnRecords.push(record);
        } else {
          existingRecord = false;
          for (_k = 0, _len3 = all.length; _k < _len3; _k++) {
            potential = all[_k];
            if (record.get('id') === potential.get('id')) {
              existingRecord = potential;
              break;
            }
          }
          if (existingRecord) {
            returnRecords.push(existingRecord);
          } else {
            newRecords.push(record);
            returnRecords.push(record);
          }
        }
      }
      if (newRecords.length > 0) {
        (_ref2 = this.get('loaded')).add.apply(_ref2, newRecords);
      }
      return returnRecords;
    };
    Model.accessor('id', {
      get: function() {
        var pk;
        pk = this.constructor.get('primaryKey');
        if (pk === 'id') {
          return this.id;
        } else {
          return this.get(pk);
        }
      },
      set: function(k, v) {
        var pk;
        pk = this.constructor.get('primaryKey');
        if (pk === 'id') {
          return this.id = v;
        } else {
          return this.set(pk, v);
        }
      }
    });
    Model.accessor('dirtyKeys', 'errors', Batman.Property.defaultAccessor);
    Model.accessor('batmanState', {
      get: function() {
        return this.state();
      },
      set: function(k, v) {
        return this.state(v);
      }
    });
    Model.accessor({
      get: function(k) {
        var _base;
        return ((_base = this._batman).attributes || (_base.attributes = {}))[k];
      },
      set: function(k, v) {
        var _base;
        return ((_base = this._batman).attributes || (_base.attributes = {}))[k] = v;
      },
      unset: function(k) {
        var x, _base;
        x = ((_base = this._batman).attributes || (_base.attributes = {}))[k];
        delete this._batman.attributes[k];
        return x;
      }
    });
    function Model(idOrAttributes) {
      if (idOrAttributes == null) {
        idOrAttributes = {};
      }
      this.destroy = __bind(this.destroy, this);
      this.save = __bind(this.save, this);
      this.load = __bind(this.load, this);
      if (!(this instanceof Batman.Object)) {
        throw "constructors must be called with new";
      }
      this.dirtyKeys = new Batman.Hash;
      this.errors = new Batman.ErrorsHash;
      if ($typeOf(idOrAttributes) === 'Object') {
        Model.__super__.constructor.call(this, idOrAttributes);
      } else {
        Model.__super__.constructor.call(this);
        this.set('id', idOrAttributes);
      }
      if (!this.state()) {
        this.empty();
      }
    }
    Model.prototype.set = function(key, value) {
      var oldValue, result, _ref2;
      oldValue = this.get(key);
      if (oldValue === value) {
        return;
      }
      result = Model.__super__.set.apply(this, arguments);
      this.dirtyKeys.set(key, oldValue);
      if ((_ref2 = this.state()) !== 'dirty' && _ref2 !== 'loading' && _ref2 !== 'creating') {
        this.dirty();
      }
      return result;
    };
    Model.prototype.toString = function() {
      return "" + ($functionName(this.constructor)) + ": " + (this.get('id'));
    };
    Model.prototype.toJSON = function() {
      var encoders, obj;
      obj = {};
      encoders = this._batman.get('encoders');
      if (!(!encoders || encoders.isEmpty())) {
        encoders.forEach(__bind(function(key, encoder) {
          var encodedVal, val;
          val = this.get(key);
          if (typeof val !== 'undefined') {
            encodedVal = encoder(this.get(key));
            if (typeof encodedVal !== 'undefined') {
              return obj[key] = encodedVal;
            }
          }
        }, this));
      }
      return obj;
    };
    Model.prototype.fromJSON = function(data) {
      var decoders, key, obj, value;
      obj = {};
      decoders = this._batman.get('decoders');
      if (!decoders || decoders.isEmpty()) {
        for (key in data) {
          value = data[key];
          obj[key] = value;
        }
      } else {
        decoders.forEach(function(key, decoder) {
          return obj[key] = decoder(data[key]);
        });
      }
      return this.mixin(obj);
    };
    Model.actsAsStateMachine(true);
    _ref2 = ['empty', 'dirty', 'loading', 'loaded', 'saving', 'saved', 'creating', 'created', 'validating', 'validated', 'destroying', 'destroyed'];
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      k = _ref2[_j];
      Model.state(k);
    }
    _ref3 = ['loading', 'loaded'];
    for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
      k = _ref3[_k];
      Model.classState(k);
    }
    Model.prototype._doStorageOperation = function(operation, options, callback) {
      var mechanism, mechanisms, _l, _len4;
      if (!this.hasStorage()) {
        throw new Error("Can't " + operation + " model " + ($functionName(this.constructor)) + " without any storage adapters!");
      }
      mechanisms = this._batman.get('storage');
      for (_l = 0, _len4 = mechanisms.length; _l < _len4; _l++) {
        mechanism = mechanisms[_l];
        mechanism[operation](this, options, callback);
      }
      return true;
    };
    Model.prototype.hasStorage = function() {
      return (this._batman.get('storage') || []).length > 0;
    };
    Model.prototype.load = function(callback) {
      var _ref4;
      if ((_ref4 = this.state()) === 'destroying' || _ref4 === 'destroyed') {
        if (typeof callback === "function") {
          callback(new Error("Can't load a destroyed record!"));
        }
        return;
      }
      this.loading();
      return this._doStorageOperation('read', {}, __bind(function(err, record) {
        if (!err) {
          this.loaded();
        }
        record = this.constructor._mapIdentities([record])[0];
        return typeof callback === "function" ? callback(err, record) : void 0;
      }, this));
    };
    Model.prototype.save = function(callback) {
      var _ref4;
      if ((_ref4 = this.state()) === 'destroying' || _ref4 === 'destroyed') {
        if (typeof callback === "function") {
          callback(new Error("Can't save a destroyed record!"));
        }
        return;
      }
      return this.validate(__bind(function(isValid, errors) {
        var creating;
        if (!isValid) {
          if (typeof callback === "function") {
            callback(errors);
          }
          return;
        }
        creating = this.isNew();
        this.saving();
        if (creating) {
          this.creating();
        }
        return this._doStorageOperation((creating ? 'create' : 'update'), {}, __bind(function(err, record) {
          if (!err) {
            if (creating) {
              this.created();
            }
            this.saved();
            this.dirtyKeys.clear();
          }
          record = this.constructor._mapIdentities([record])[0];
          return typeof callback === "function" ? callback(err, record) : void 0;
        }, this));
      }, this));
    };
    Model.prototype.destroy = function(callback) {
      this.destroying();
      return this._doStorageOperation('destroy', {}, __bind(function(err, record) {
        if (!err) {
          this.constructor.get('all').remove(this);
          this.destroyed();
        }
        return typeof callback === "function" ? callback(err) : void 0;
      }, this));
    };
    Model.prototype.validate = function(callback) {
      var count, finish, key, oldState, v, validationCallback, validator, validators, _l, _len4, _len5, _m, _ref4;
      oldState = this.state();
      this.errors.clear();
      this.validating();
      finish = __bind(function() {
        this.validated();
        this[oldState]();
        return typeof callback === "function" ? callback(this.errors.length === 0, this.errors) : void 0;
      }, this);
      validators = this._batman.get('validators') || [];
      if (!(validators.length > 0)) {
        finish();
      } else {
        count = validators.length;
        validationCallback = __bind(function() {
          if (--count === 0) {
            return finish();
          }
        }, this);
        for (_l = 0, _len4 = validators.length; _l < _len4; _l++) {
          validator = validators[_l];
          v = validator.validator;
          _ref4 = validator.keys;
          for (_m = 0, _len5 = _ref4.length; _m < _len5; _m++) {
            key = _ref4[_m];
            if (v) {
              v.validateEach(this.errors, this, key, validationCallback);
            } else {
              validator.callback(this.errors, this, key, validationCallback);
            }
          }
        }
      }
    };
    Model.prototype.isNew = function() {
      return typeof this.get('id') === 'undefined';
    };
    return Model;
  })();
  Batman.ErrorsHash = (function() {
    __extends(ErrorsHash, Batman.Hash);
    function ErrorsHash() {
      ErrorsHash.__super__.constructor.apply(this, arguments);
    }
    ErrorsHash.accessor({
      get: function(key) {
        if (!this._storage[key]) {
          this._storage[key] = new Batman.Set;
          this.length++;
        }
        return this._storage[key];
      },
      set: function() {
        throw new Error("Can't set on an errors hash, use add instead!");
      },
      set: function() {
        throw new Error("Can't unset on an errors hash, use clear instead!");
      }
    });
    ErrorsHash.prototype.add = function(key, error) {
      return this.get(key).add(error);
    };
    return ErrorsHash;
  })();
  Batman.Validator = (function() {
    __extends(Validator, Batman.Object);
    function Validator() {
      var mixins, options;
      options = arguments[0], mixins = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this.options = options;
      Validator.__super__.constructor.apply(this, mixins);
    }
    Validator.prototype.validate = function(record) {
      throw "You must override validate in Batman.Validator subclasses.";
    };
    Validator.options = function() {
      var options;
      options = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      Batman.initializeObject(this);
      if (this._batman.options) {
        return this._batman.options.concat(options);
      } else {
        return this._batman.options = options;
      }
    };
    Validator.matches = function(options) {
      var key, results, shouldReturn, value, _ref2, _ref3;
      results = {};
      shouldReturn = false;
      for (key in options) {
        value = options[key];
        if (~((_ref2 = this._batman) != null ? (_ref3 = _ref2.options) != null ? _ref3.indexOf(key) : void 0 : void 0)) {
          results[key] = value;
          shouldReturn = true;
        }
      }
      if (shouldReturn) {
        return results;
      }
    };
    return Validator;
  })();
  Validators = Batman.Validators = [
    Batman.LengthValidator = (function() {
      __extends(LengthValidator, Batman.Validator);
      LengthValidator.options('minLength', 'maxLength', 'length', 'lengthWithin', 'lengthIn');
      function LengthValidator(options) {
        var range;
        if (range = options.lengthIn || options.lengthWithin) {
          options.minLength = range[0];
          options.maxLength = range[1] || -1;
          delete options.lengthWithin;
          delete options.lengthIn;
        }
        LengthValidator.__super__.constructor.apply(this, arguments);
      }
      LengthValidator.prototype.validateEach = function(errors, record, key, callback) {
        var options, value;
        options = this.options;
        value = record.get(key);
        if (options.minLength && value.length < options.minLength) {
          errors.add(key, "" + key + " must be at least " + options.minLength + " characters");
        }
        if (options.maxLength && value.length > options.maxLength) {
          errors.add(key, "" + key + " must be less than " + options.maxLength + " characters");
        }
        if (options.length && value.length !== options.length) {
          errors.add(key, "" + key + " must be " + options.length + " characters");
        }
        return callback();
      };
      return LengthValidator;
    })(), Batman.PresenceValidator = (function() {
      __extends(PresenceValidator, Batman.Validator);
      function PresenceValidator() {
        PresenceValidator.__super__.constructor.apply(this, arguments);
      }
      PresenceValidator.options('presence');
      PresenceValidator.prototype.validateEach = function(errors, record, key, callback) {
        var value;
        value = record.get(key);
        if (this.options.presence && !(value != null)) {
          errors.add(key, "" + key + " must be present");
        }
        return callback();
      };
      return PresenceValidator;
    })()
  ];
  Batman.StorageAdapter = (function() {
    var k, time, _fn2, _j, _k, _len2, _len3, _ref2, _ref3;
    __extends(StorageAdapter, Batman.Object);
    function StorageAdapter(model) {
      StorageAdapter.__super__.constructor.call(this, {
        model: model,
        modelKey: model.get('storageKey') || helpers.pluralize(helpers.underscore($functionName(model)))
      });
    }
    StorageAdapter.prototype.isStorageAdapter = true;
    StorageAdapter.prototype._batman.check(StorageAdapter.prototype);
    _ref2 = ['all', 'create', 'read', 'readAll', 'update', 'destroy'];
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      k = _ref2[_j];
      _ref3 = ['before', 'after'];
      _fn2 = __bind(function(k, time) {
        var key;
        key = "" + time + (helpers.capitalize(k));
        return this.prototype[key] = function(filter) {
          var _base, _name;
          this._batman.check(this);
          return ((_base = this._batman)[_name = "" + key + "Filters"] || (_base[_name] = [])).push(filter);
        };
      }, StorageAdapter);
      for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
        time = _ref3[_k];
        _fn2(k, time);
      }
    }
    StorageAdapter.prototype.before = function() {
      var callback, k, keys, _l, _len4, _m, _results;
      keys = 2 <= arguments.length ? __slice.call(arguments, 0, _l = arguments.length - 1) : (_l = 0, []), callback = arguments[_l++];
      _results = [];
      for (_m = 0, _len4 = keys.length; _m < _len4; _m++) {
        k = keys[_m];
        _results.push(this["before" + (helpers.capitalize(k))](callback));
      }
      return _results;
    };
    StorageAdapter.prototype.after = function() {
      var callback, k, keys, _l, _len4, _m, _results;
      keys = 2 <= arguments.length ? __slice.call(arguments, 0, _l = arguments.length - 1) : (_l = 0, []), callback = arguments[_l++];
      _results = [];
      for (_m = 0, _len4 = keys.length; _m < _len4; _m++) {
        k = keys[_m];
        _results.push(this["after" + (helpers.capitalize(k))](callback));
      }
      return _results;
    };
    StorageAdapter.prototype._filterData = function(prefix, action, data) {
      return (this._batman.get("" + prefix + (helpers.capitalize(action)) + "Filters") || []).concat(this._batman.get("" + prefix + "AllFilters") || []).reduce(__bind(function(filteredData, filter) {
        return filter.call(this, filteredData);
      }, this), data);
    };
    StorageAdapter.prototype.getRecordFromData = function(data) {
      var record;
      record = new this.model();
      record.fromJSON(data);
      return record;
    };
    return StorageAdapter;
  }).call(this);
  Batman.LocalStorage = (function() {
    __extends(LocalStorage, Batman.StorageAdapter);
    function LocalStorage() {
      if (typeof window.localStorage === 'undefined') {
        return null;
      }
      LocalStorage.__super__.constructor.apply(this, arguments);
      this.storage = localStorage;
      this.key_re = new RegExp("^" + this.modelKey + "(\\d+)$");
      this.nextId = 1;
      this._forAllRecords(function(k, v) {
        var matches;
        if (matches = this.key_re.exec(k)) {
          return this.nextId = Math.max(this.nextId, parseInt(matches[1], 10) + 1);
        }
      });
      return;
    }
    LocalStorage.prototype.before('create', 'update', function(_arg) {
      var options, record;
      record = _arg[0], options = _arg[1];
      return [JSON.stringify(record), options];
    });
    LocalStorage.prototype.after('read', function(_arg) {
      var attributes, options, record;
      record = _arg[0], attributes = _arg[1], options = _arg[2];
      return [record.fromJSON(JSON.parse(attributes)), attributes, options];
    });
    LocalStorage.prototype._forAllRecords = function(f) {
      var i, _ref2, _results;
      _results = [];
      for (i = 0, _ref2 = this.storage.length; 0 <= _ref2 ? i < _ref2 : i > _ref2; 0 <= _ref2 ? i++ : i--) {
        k = this.storage.key(i);
        _results.push(f.call(this, k, this.storage.getItem(k)));
      }
      return _results;
    };
    LocalStorage.prototype.getRecordFromData = function(data) {
      var record;
      record = LocalStorage.__super__.getRecordFromData.apply(this, arguments);
      this.nextId = Math.max(this.nextId, parseInt(record.get('id'), 10) + 1);
      return record;
    };
    LocalStorage.prototype.update = function(record, options, callback) {
      var id;
      id = record.get('id');
      if (id != null) {
        this.storage.setItem(this.modelKey + id, this._filterData('before', 'update', [record, options])[0]);
        return callback(void 0, this._filterData('after', 'update', [record, options])[0]);
      } else {
        return callback(new Error("Couldn't get record primary key."));
      }
    };
    LocalStorage.prototype.create = function(record, options, callback) {
      var id, key;
      id = record.get('id') || record.set('id', this.nextId++);
      if (id != null) {
        key = this.modelKey + id;
        if (this.storage.getItem(key)) {
          return callback(new Error("Can't create because the record already exists!"));
        } else {
          this.storage.setItem(key, this._filterData('before', 'create', [record, options])[0]);
          return callback(void 0, this._filterData('after', 'create', [record, options])[0]);
        }
      } else {
        return callback(new Error("Couldn't set record primary key on create!"));
      }
    };
    LocalStorage.prototype.read = function(record, options, callback) {
      var attrs, id;
      record = this._filterData('before', 'read', record, options);
      id = record.get('id');
      if (id != null) {
        attrs = this.storage.getItem(this.modelKey + id);
        if (attrs) {
          return callback(void 0, this._filterData('after', 'read', [record, attrs, options])[0]);
        } else {
          return callback(new Error("Couldn't find record!"));
        }
      } else {
        return callback(new Error("Couldn't get record primary key."));
      }
    };
    LocalStorage.prototype.readAll = function(_, options, callback) {
      var records;
      records = [];
      options = this._filterData('before', 'readAll', [options])[0];
      this._forAllRecords(function(storageKey, data) {
        var keyMatches;
        if (keyMatches = this.key_re.exec(storageKey)) {
          return records.push({
            data: data,
            id: keyMatches[1]
          });
        }
      });
      return callback(void 0, this._filterData('after', 'readAll', [records, options])[0]);
    };
    LocalStorage.prototype.after('readAll', function(_arg) {
      var allAttributes, attributes, data, options;
      allAttributes = _arg[0], options = _arg[1];
      allAttributes = (function() {
        var _j, _len2, _name, _results;
        _results = [];
        for (_j = 0, _len2 = allAttributes.length; _j < _len2; _j++) {
          attributes = allAttributes[_j];
          data = JSON.parse(attributes.data);
          data[_name = this.model.primaryKey] || (data[_name] = parseInt(attributes.id, 10));
          _results.push(data);
        }
        return _results;
      }).call(this);
      return [allAttributes, options];
    });
    LocalStorage.prototype.after('readAll', function(_arg) {
      var allAttributes, data, k, match, matches, options, v, _j, _len2;
      allAttributes = _arg[0], options = _arg[1];
      matches = [];
      for (_j = 0, _len2 = allAttributes.length; _j < _len2; _j++) {
        data = allAttributes[_j];
        match = true;
        for (k in options) {
          v = options[k];
          if (data[k] !== v) {
            match = false;
            break;
          }
        }
        if (match) {
          matches.push(data);
        }
      }
      return [matches, options];
    });
    LocalStorage.prototype.after('readAll', function(_arg) {
      var data, filteredAttributes, options;
      filteredAttributes = _arg[0], options = _arg[1];
      return [
        (function() {
          var _j, _len2, _results;
          _results = [];
          for (_j = 0, _len2 = filteredAttributes.length; _j < _len2; _j++) {
            data = filteredAttributes[_j];
            _results.push(this.getRecordFromData(data));
          }
          return _results;
        }).call(this), filteredAttributes, options
      ];
    });
    LocalStorage.prototype.destroy = function(record, options, callback) {
      var id, key;
      record = this._filterData('before', 'destroy', record, options);
      id = record.get('id');
      if (id != null) {
        key = this.modelKey + id;
        if (this.storage.getItem(key)) {
          this.storage.removeItem(key);
          return callback(void 0, this._filterData('after', 'destroy', [record, options])[0]);
        } else {
          return callback(new Error("Can't delete nonexistant record!"), record);
        }
      } else {
        return callback(new Error("Can't delete record without an primary key!"), record);
      }
    };
    return LocalStorage;
  })();
  Batman.RestStorage = (function() {
    var getErrorCallback;
    __extends(RestStorage, Batman.StorageAdapter);
    RestStorage.prototype.defaultOptions = {
      type: 'json'
    };
    RestStorage.prototype.recordJsonNamespace = false;
    RestStorage.prototype.collectionJsonNamespace = false;
    function RestStorage() {
      RestStorage.__super__.constructor.apply(this, arguments);
      this.recordJsonNamespace = helpers.singularize(this.modelKey);
      this.collectionJsonNamespace = helpers.pluralize(this.modelKey);
      this.model.encode('id');
    }
    RestStorage.prototype.before('create', 'update', function(_arg) {
      var json, options, record, x;
      record = _arg[0], options = _arg[1];
      json = record.toJSON();
      record = this.recordJsonNamespace ? (x = {}, x[this.recordJsonNamespace] = json, x) : json;
      return [record, options];
    });
    RestStorage.prototype.after('create', 'read', 'update', function(_arg) {
      var data, options, record;
      record = _arg[0], data = _arg[1], options = _arg[2];
      if (data[this.recordJsonNamespace]) {
        data = data[this.recordJsonNamespace];
      }
      return [record, data];
    });
    RestStorage.prototype.after('create', 'read', 'update', function(_arg) {
      var data, options, record;
      record = _arg[0], data = _arg[1], options = _arg[2];
      record.fromJSON(data);
      return [record, data];
    });
    RestStorage.prototype.optionsForRecord = function(record, idRequired, callback) {
      var id, url;
      if (record.url) {
        url = typeof record.url === 'function' ? record.url() : record.url;
      } else {
        url = "/" + this.modelKey;
        if (idRequired || !record.isNew()) {
          id = record.get('id');
          if (!(id != null)) {
            callback(new Error("Couldn't get record primary key!"));
            return;
          }
          url = url + "/" + id;
        }
      }
      if (!url) {
        return callback.call(this, new Error("Couldn't get model url!"));
      } else {
        return callback.call(this, void 0, $mixin({}, this.defaultOptions, {
          url: url
        }));
      }
    };
    RestStorage.prototype.optionsForCollection = function(recordsOptions, callback) {
      var url, _base;
      url = (typeof (_base = this.model).url === "function" ? _base.url() : void 0) || this.model.url || ("/" + this.modelKey);
      if (!url) {
        return callback.call(this, new Error("Couldn't get collection url!"));
      } else {
        return callback.call(this, void 0, $mixin({}, this.defaultOptions, {
          url: url,
          data: $mixin({}, this.defaultOptions.data, recordsOptions)
        }));
      }
    };
    getErrorCallback = function(callback) {
      return function(error) {
        error.request = this;
        return callback(error);
      };
    };
    RestStorage.prototype.create = function(record, recordOptions, callback) {
      return this.optionsForRecord(record, false, function(err, options) {
        if (err) {
          callback(err);
          return;
        }
        return new Batman.Request($mixin(options, {
          data: this._filterData('before', 'create', [record, recordOptions])[0],
          method: 'POST',
          success: __bind(function(data) {
            return callback(void 0, this._filterData('after', 'update', [record, data, recordOptions])[0]);
          }, this),
          error: getErrorCallback(callback)
        }));
      });
    };
    RestStorage.prototype.update = function(record, recordOptions, callback) {
      return this.optionsForRecord(record, true, function(err, options) {
        if (err) {
          callback(err);
          return;
        }
        return new Batman.Request($mixin(options, {
          data: this._filterData('before', 'update', [record, recordOptions])[0],
          method: 'PUT',
          success: __bind(function(data) {
            return callback(void 0, this._filterData('after', 'update', [record, data, recordOptions])[0]);
          }, this),
          error: getErrorCallback(callback)
        }));
      });
    };
    RestStorage.prototype.read = function(record, recordOptions, callback) {
      return this.optionsForRecord(record, true, function(err, options) {
        var _ref2;
        if (err) {
          callback(err);
          return;
        }
        _ref2 = this._filterData('before', 'read', [record, recordOptions]), record = _ref2[0], recordOptions = _ref2[1];
        return new Batman.Request($mixin(options, {
          data: recordOptions,
          method: 'GET',
          success: __bind(function(data) {
            return callback(void 0, this._filterData('after', 'read', [record, data, recordOptions])[0]);
          }, this),
          error: getErrorCallback(callback)
        }));
      });
    };
    RestStorage.prototype.readAll = function(_, recordsOptions, callback) {
      return this.optionsForCollection(recordsOptions, function(err, options) {
        if (err) {
          callback(err);
          return;
        }
        recordsOptions = this._filterData('before', 'readAll', [recordsOptions])[0];
        return new Batman.Request($mixin(options, {
          data: recordsOptions,
          method: 'GET',
          success: __bind(function(data) {
            return callback(void 0, this._filterData('after', 'readAll', [data, recordsOptions])[0]);
          }, this),
          error: getErrorCallback(callback)
        }));
      });
    };
    RestStorage.prototype.after('readAll', function(_arg) {
      var attributes, data, options, recordData;
      data = _arg[0], options = _arg[1];
      recordData = data[this.collectionJsonNamespace] ? data[this.collectionJsonNamespace] : data;
      return [
        (function() {
          var _j, _len2, _results;
          _results = [];
          for (_j = 0, _len2 = recordData.length; _j < _len2; _j++) {
            attributes = recordData[_j];
            _results.push(this.getRecordFromData(attributes));
          }
          return _results;
        }).call(this), data, options
      ];
    });
    RestStorage.prototype.destroy = function(record, recordOptions, callback) {
      return this.optionsForRecord(record, true, function(err, options) {
        var _ref2;
        if (err) {
          callback(err);
          return;
        }
        _ref2 = this._filterData('before', 'destroy', [record, recordOptions]), record = _ref2[0], recordOptions = _ref2[1];
        return new Batman.Request($mixin(options, {
          method: 'DELETE',
          success: __bind(function(data) {
            return callback(void 0, this._filterData('after', 'destroy', [record, data, recordOptions])[0]);
          }, this),
          error: getErrorCallback(callback)
        }));
      });
    };
    return RestStorage;
  })();
  Batman.View = (function() {
    var viewSources;
    __extends(View, Batman.Object);
    function View(options) {
      var context;
      this.contexts = [];
      View.__super__.constructor.call(this, options);
      if (context = this.get('context')) {
        this.contexts.push(context);
        this.unset('context');
      }
    }
    viewSources = {};
    View.prototype.source = '';
    View.prototype.html = '';
    View.prototype.node = null;
    View.prototype.contentFor = null;
    View.prototype.ready = View.eventOneShot(function() {});
    View.prototype.prefix = 'views';
    View.observeAll('source', function() {
      return setTimeout((__bind(function() {
        return this.reloadSource();
      }, this)), 0);
    });
    View.prototype.reloadSource = function() {
      var source;
      source = this.get('source');
      if (!source) {
        return;
      }
      if (viewSources[source]) {
        return this.set('html', viewSources[source]);
      } else {
        return new Batman.Request({
          url: "" + this.prefix + "/" + this.source,
          type: 'html',
          success: __bind(function(response) {
            viewSources[source] = response;
            return this.set('html', response);
          }, this),
          error: function(response) {
            throw "Could not load view from " + url;
          }
        });
      }
    };
    View.observeAll('html', function(html) {
      var node;
      node = this.node || document.createElement('div');
      node.innerHTML = html;
      if (this.node !== node) {
        return this.set('node', node);
      }
    });
    View.observeAll('node', function(node) {
      if (!node) {
        return;
      }
      this.ready.fired = false;
      if (this._renderer) {
        this._renderer.forgetAll();
      }
      if (node) {
        this._renderer = new Batman.Renderer(node, __bind(function() {
          var content, _ref2;
          content = this.contentFor;
          if (typeof content === 'string') {
            this.contentFor = (_ref2 = Batman.DOM._yields) != null ? _ref2[content] : void 0;
          }
          if (this.contentFor && node) {
            this.contentFor.innerHTML = '';
            return this.contentFor.appendChild(node);
          }
        }, this), this.contexts);
        return this._renderer.rendered(__bind(function() {
          return this.ready(node);
        }, this));
      }
    });
    return View;
  })();
  Batman.Renderer = (function() {
    var bindingRegexp, sortBindings;
    __extends(Renderer, Batman.Object);
    function Renderer(node, callback, contexts) {
      this.node = node;
      this.callback = callback;
      if (contexts == null) {
        contexts = [];
      }
      this.resume = __bind(this.resume, this);
      this.start = __bind(this.start, this);
      Renderer.__super__.constructor.apply(this, arguments);
      this.context = contexts instanceof RenderContext ? contexts : (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return typeof result === "object" ? result : child;
      })(RenderContext, contexts, function() {});
      setTimeout(this.start, 0);
    }
    Renderer.prototype.start = function() {
      this.startTime = new Date;
      return this.parseNode(this.node);
    };
    Renderer.prototype.resume = function() {
      this.startTime = new Date;
      return this.parseNode(this.resumeNode);
    };
    Renderer.prototype.finish = function() {
      this.startTime = null;
      this.fire('parsed');
      if (typeof this.callback === "function") {
        this.callback();
      }
      return this.fire('rendered');
    };
    Renderer.prototype.forgetAll = function() {};
    Renderer.prototype.parsed = Renderer.eventOneShot(function() {});
    Renderer.prototype.rendered = Renderer.eventOneShot(function() {});
    bindingRegexp = /data\-(.*)/;
    sortBindings = function(a, b) {
      if (a[0] === 'foreach') {
        return -1;
      } else if (b[0] === 'foreach') {
        return 1;
      } else if (a[0] === 'formfor') {
        return -1;
      } else if (b[0] === 'formfor') {
        return 1;
      } else if (a[0] === 'bind') {
        return -1;
      } else if (b[0] === 'bind') {
        return 1;
      } else {
        return 0;
      }
    };
    Renderer.prototype.parseNode = function(node) {
      var attr, bindings, key, name, nextNode, readerArgs, result, skipChildren, varIndex, _base, _base2, _j, _len2, _name, _name2, _ref2;
      if (new Date - this.startTime > 50) {
        this.resumeNode = node;
        setTimeout(this.resume, 0);
        return;
      }
      if (node.getAttribute) {
        bindings = (function() {
          var _j, _len2, _ref2, _ref3, _results;
          _ref2 = node.attributes;
          _results = [];
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            attr = _ref2[_j];
            name = (_ref3 = attr.nodeName.match(bindingRegexp)) != null ? _ref3[1] : void 0;
            if (!name) {
              continue;
            }
            _results.push(~(varIndex = name.indexOf('-')) ? [name.substr(0, varIndex), name.substr(varIndex + 1), attr.value] : [name, attr.value]);
          }
          return _results;
        })();
        _ref2 = bindings.sort(sortBindings);
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          readerArgs = _ref2[_j];
          key = readerArgs[1];
          if (key === 'property') {
            throw "property is a reserved keyword";
          }
          result = readerArgs.length === 2 ? typeof (_base = Batman.DOM.readers)[_name = readerArgs[0]] === "function" ? _base[_name](node, key, this.context, this) : void 0 : typeof (_base2 = Batman.DOM.attrReaders)[_name2 = readerArgs[0]] === "function" ? _base2[_name2](node, key, readerArgs[2], this.context, this) : void 0;
          if (result === false) {
            skipChildren = true;
            break;
          }
        }
      }
      if ((nextNode = this.nextNode(node, skipChildren))) {
        return this.parseNode(nextNode);
      } else {
        return this.finish();
      }
    };
    Renderer.prototype.nextNode = function(node, skipChildren) {
      var children, nextParent, parentSibling, sibling, _base;
      if (!skipChildren) {
        children = node.childNodes;
        if (children != null ? children.length : void 0) {
          return children[0];
        }
      }
      if (typeof (_base = Batman.data(node, 'onParseExit')) === "function") {
        _base();
      }
      if (this.node.isSameNode(node)) {
        return;
      }
      sibling = node.nextSibling;
      if (sibling) {
        return sibling;
      }
      nextParent = node;
      while (nextParent = nextParent.parentNode) {
        if (typeof nextParent.onParseExit === "function") {
          nextParent.onParseExit();
        }
        if (this.node.isSameNode(nextParent)) {
          return;
        }
        parentSibling = nextParent.nextSibling;
        if (parentSibling) {
          return parentSibling;
        }
      }
    };
    return Renderer;
  })();
  Binding = (function() {
    var get_dot_rx, get_rx, keypath_rx;
    __extends(Binding, Batman.Object);
    keypath_rx = /(^|,)\s*(?!(?:true|false)\s*(?:$|,))([a-zA-Z][\w\.]*)\s*($|,)/g;
    get_dot_rx = /(?:\]\.)(.+?)(?=[\[\.]|\s*\||$)/;
    get_rx = /(?!^\s*)\[(.*?)\]/g;
    Binding.accessor('filteredValue', function() {
      var ctx, value;
      value = this.get('unfilteredValue');
      if (this.get('key')) {
        ctx = this.get('keyContext');
      }
      if (this.filterFunctions.length > 0) {
        return this.filterFunctions.reduce(__bind(function(value, fn, i) {
          var args;
          args = this.filterArguments[i].map(function(argument) {
            if (argument._keypath) {
              return argument.context.get(argument._keypath);
            } else {
              return argument;
            }
          });
          return fn.call.apply(fn, [ctx, value].concat(__slice.call(args)));
        }, this), value);
      } else {
        return value;
      }
    });
    Binding.accessor('unfilteredValue', function() {
      if (k = this.get('key')) {
        return this.get("keyContext." + k);
      } else {
        return this.get('value');
      }
    });
    Binding.accessor('keyContext', function() {
      var unfilteredValue, _ref2;
      if (!this._keyContext) {
        _ref2 = this.renderContext.findKey(this.key), unfilteredValue = _ref2[0], this._keyContext = _ref2[1];
      }
      return this._keyContext;
    });
    function Binding() {
      var shouldSet;
      Binding.__super__.constructor.apply(this, arguments);
      this.parseFilter();
      this.nodeChange || (this.nodeChange = __bind(function(node, context) {
        if (this.key) {
          return this.get('keyContext').set(this.key, this.node.value);
        }
      }, this));
      this.dataChange || (this.dataChange = function(value, node) {
        return Batman.DOM.valueForNode(this.node, value);
      });
      shouldSet = true;
      if (this.only !== 'write' && Batman.DOM.nodeIsEditable(this.node)) {
        Batman.DOM.events.change(this.node, __bind(function() {
          shouldSet = false;
          this.nodeChange(this.node, this._keyContext || this.value, this);
          return shouldSet = true;
        }, this));
      }
      this.observe('filteredValue', true, __bind(function(value) {
        if (shouldSet && this.only !== 'read') {
          return this.dataChange(value, this.node, this);
        }
      }, this));
      this;
    }
    Binding.prototype.parseFilter = function() {
      var args, filter, filterName, filterString, filters, key, keyPath, orig, split;
      this.filterFunctions = [];
      this.filterArguments = [];
      keyPath = this.keyPath;
      while (get_dot_rx.test(keyPath)) {
        keyPath = keyPath.replace(get_dot_rx, "]['$1']");
      }
      filters = keyPath.replace(get_rx, " | get $1 ").replace(/'/g, '"').split(/(?!")\s+\|\s+(?!")/);
      try {
        key = this.parseSegment(orig = filters.shift())[0];
      } catch (e) {
        throw "Bad binding keypath \"" + orig + "\"!";
      }
      if (key && key._keypath) {
        this.key = key._keypath;
      } else {
        this.value = key;
      }
      if (filters.length) {
        while (filterString = filters.shift()) {
          split = filterString.indexOf(' ');
          if (~split) {
            filterName = filterString.substr(0, split);
            args = filterString.substr(split);
          } else {
            filterName = filterString;
          }
          if (filter = Batman.Filters[filterName]) {
            this.filterFunctions.push(filter);
            if (args) {
              try {
                this.filterArguments.push(this.parseSegment(args));
              } catch (e) {
                throw new Error("Bad filter arguments \"" + args + "\"!");
              }
            } else {
              this.filterArguments.push([]);
            }
          } else {
            throw new Error("Unrecognized filter '" + filterName + "' in key \"" + this.keyPath + "\"!");
          }
        }
        return this.filterArguments = this.filterArguments.map(__bind(function(argumentList) {
          return argumentList.map(__bind(function(argument) {
            var _, _ref2;
            if (argument._keypath) {
              _ref2 = this.renderContext.findKey(argument._keypath), _ = _ref2[0], argument.context = _ref2[1];
            }
            return argument;
          }, this));
        }, this));
      }
    };
    Binding.prototype.parseSegment = function(segment) {
      return JSON.parse("[" + segment.replace(keypath_rx, "$1{\"_keypath\": \"$2\"}$3") + "]");
    };
    return Binding;
  })();
  RenderContext = (function() {
    var BindingProxy;
    function RenderContext() {
      var contexts;
      contexts = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.contexts = contexts;
      this.storage = new Batman.Object;
      this.defaultContexts = [this.storage];
      if (Batman.currentApp) {
        this.defaultContexts.push(Batman.currentApp);
      }
    }
    RenderContext.prototype.findKey = function(key) {
      var base, context, contexts, i, val, _j, _len2, _ref2;
      base = key.split('.')[0].split('|')[0].trim();
      _ref2 = [this.contexts, this.defaultContexts];
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        contexts = _ref2[_j];
        i = contexts.length;
        while (i--) {
          context = contexts[i];
          if (context.get != null) {
            val = context.get(base);
          } else {
            val = context[base];
          }
          if (typeof val !== 'undefined') {
            return [$get(context, key), context];
          }
        }
      }
      return [container.get(key), container];
    };
    RenderContext.prototype.set = function() {
      var args, _ref2;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref2 = this.storage).set.apply(_ref2, args);
    };
    RenderContext.prototype.push = function(x) {
      return this.contexts.push(x);
    };
    RenderContext.prototype.pop = function() {
      return this.contexts.pop();
    };
    RenderContext.prototype.clone = function() {
      var context, newStorage;
      context = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return typeof result === "object" ? result : child;
      })(this.constructor, this.contexts, function() {});
      newStorage = $mixin({}, this.storage);
      context.setStorage(newStorage);
      return context;
    };
    RenderContext.prototype.setStorage = function(storage) {
      return this.defaultContexts[0] = storage;
    };
    BindingProxy = (function() {
      __extends(BindingProxy, Batman.Object);
      BindingProxy.prototype.isBindingProxy = true;
      function BindingProxy(binding, localKey) {
        this.binding = binding;
        this.localKey = localKey;
        if (this.localKey) {
          this.accessor(this.localKey, function() {
            return this.binding.get('filteredValue');
          });
        } else {
          this.accessor(function(key) {
            return this.binding.get("filteredValue." + key);
          });
        }
      }
      return BindingProxy;
    })();
    RenderContext.prototype.addKeyToScopeForNode = function(node, key, localName) {
      this.bind(node, key, __bind(function(value, node, binding) {
        return this.push(new BindingProxy(binding, localName));
      }, this), function() {
        return true;
      });
      return Batman.data(node, 'onParseExit', __bind(function() {
        return this.pop();
      }, this));
    };
    RenderContext.prototype.bind = function(only, node, key, dataChange, nodeChange) {
      var _ref2;
      if (!nodeChange && only && typeof only !== 'string') {
        _ref2 = [only, node, key, dataChange], node = _ref2[0], key = _ref2[1], dataChange = _ref2[2], nodeChange = _ref2[3];
      }
      return new Binding({
        renderContext: this,
        keyPath: key,
        node: node,
        dataChange: dataChange,
        nodeChange: nodeChange,
        only: only
      });
    };
    return RenderContext;
  })();
  Batman.DOM = {
    readers: {
      read: function(node, key, context, renderer) {
        return Batman.DOM.readers.bind(node, key, context, renderer, 'read');
      },
      write: function(node, key, context, renderer) {
        return Batman.DOM.readers.bind(node, key, context, renderer, 'write');
      },
      bind: function(node, key, context, renderer, only) {
        if (node.nodeName.toLowerCase() === 'input' && node.getAttribute('type') === 'checkbox') {
          return Batman.DOM.attrReaders.bind(node, 'checked', key, context, only);
        } else if (node.nodeName.toLowerCase() === 'input' && node.getAttribute('type') === 'radio') {
          return Batman.DOM.binders.radio(node, key, context, renderer, only);
        } else if (node.nodeName.toLowerCase() === 'select') {
          return Batman.DOM.binders.select(node, key, context, renderer, only);
        } else {
          return context.bind(only, node, key);
        }
      },
      context: function(node, key, context) {
        return context.addKeyToScopeForNode(node, key);
      },
      mixin: function(node, key, context) {
        context.push(Batman.mixins);
        context.bind(node, key, function(mixin) {
          return $mixin(node, mixin);
        }, function() {});
        return context.pop();
      },
      showif: function(node, key, context, renderer, invert) {
        var originalDisplay;
        originalDisplay = node.style.display || '';
        return context.bind(node, key, function(value) {
          var hide, _base;
          if (!!value === !invert) {
            if (typeof (_base = Batman.data(node, 'show')) === "function") {
              _base();
            }
            return node.style.display = originalDisplay;
          } else {
            hide = Batman.data(node, 'hide');
            if (typeof hide === 'function') {
              return hide.call(node);
            } else {
              return node.style.display = 'none';
            }
          }
        }, function() {});
      },
      hideif: function() {
        var args, _ref2;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return (_ref2 = Batman.DOM.readers).showif.apply(_ref2, __slice.call(args).concat([true]));
      },
      route: function(node, key, context) {
        var action, app, container, dispatcher, model, name, url, _ref2, _ref3, _ref4;
        if (key.substr(0, 1) === '/') {
          url = key;
        } else {
          _ref2 = key.split('/'), key = _ref2[0], action = _ref2[1];
          _ref3 = context.findKey('dispatcher'), dispatcher = _ref3[0], app = _ref3[1];
          _ref4 = context.findKey(key), model = _ref4[0], container = _ref4[1];
          dispatcher || (dispatcher = Batman.currentApp.dispatcher);
          if (dispatcher && model instanceof Batman.Model) {
            action || (action = 'show');
            name = helpers.underscore(helpers.pluralize($functionName(model.constructor)));
            url = dispatcher.findUrl({
              resource: name,
              id: model.get('id'),
              action: action
            });
          } else if (model != null ? model.prototype : void 0) {
            name = helpers.underscore(helpers.pluralize($functionName(model)));
            url = dispatcher.findUrl({
              resource: name,
              action: 'index'
            });
          }
        }
        if (!url) {
          return;
        }
        if (node.nodeName.toUpperCase() === 'A') {
          node.href = Batman.HashHistory.prototype.urlFor(url);
        }
        return Batman.DOM.events.click(node, (function() {
          return $redirect(url);
        }));
      },
      partial: function(node, path, context) {
        var view;
        return view = new Batman.View({
          source: path + '.html',
          contentFor: node,
          contexts: Array.prototype.slice.call(context.contexts)
        });
      },
      yield: function(node, key) {
        return setTimeout((function() {
          return Batman.DOM.yield(key, node);
        }), 0);
      },
      contentfor: function(node, key) {
        return setTimeout((function() {
          return Batman.DOM.contentFor(key, node);
        }), 0);
      }
    },
    attrReaders: {
      _parseAttribute: function(value) {
        if (value === 'false') {
          value = false;
        }
        if (value === 'true') {
          value = true;
        }
        return value;
      },
      write: function(node, attr, key, context) {
        return Batman.DOM.attrReaders.bind(node, attr, key, context, 'write');
      },
      bind: function(node, attr, key, context, only) {
        var contextChange, nodeChange;
        switch (attr) {
          case 'checked':
          case 'disabled':
          case 'selected':
            contextChange = function(value) {
              var _base;
              node[attr] = !!value;
              return typeof (_base = Batman.data(node.parentNode, 'updateBinding')) === "function" ? _base() : void 0;
            };
            nodeChange = function(node, subContext) {
              return subContext.set(key, Batman.DOM.attrReaders._parseAttribute(node[attr]));
            };
            Batman.data(node, attr, {
              context: context,
              key: key
            });
            break;
          case 'value':
            contextChange = function(value) {
              return node.value = value;
            };
            nodeChange = function(node, subContext) {
              return subContext.set(key, Batman.DOM.attrReaders._parseAttribute(node.value));
            };
            break;
          default:
            contextChange = function(value) {
              return node.setAttribute(attr, value);
            };
            nodeChange = function(node, subContext) {
              return subContext.set(key, Batman.DOM.attrReaders._parseAttribute(node.getAttribute(attr)));
            };
        }
        return context.bind(only, node, key, contextChange, nodeChange);
      },
      context: function(node, contextName, key, context) {
        return context.addKeyToScopeForNode(node, key, contextName);
      },
      event: function(node, eventName, key, context) {
        var callback, subContext, _ref2;
        if (key.substr(0, 1) === '@') {
          callback = new Function(key.substr(1));
        } else {
          _ref2 = context.findKey(key), callback = _ref2[0], subContext = _ref2[1];
        }
        return Batman.DOM.events[eventName](node, function() {
          var confirmText, x;
          confirmText = node.getAttribute('data-confirm');
          if (confirmText && !confirm(confirmText)) {
            return;
          }
          x = eventName;
          x = key;
          return callback != null ? callback.apply(subContext, arguments) : void 0;
        });
      },
      addclass: function(node, className, key, context, parentRenderer, invert) {
        className = className.replace(/\|/g, ' ');
        return context.bind(node, key, function(value) {
          var currentName, includesClassName;
          currentName = node.className;
          includesClassName = currentName.indexOf(className) !== -1;
          if (!!value === !invert) {
            if (!includesClassName) {
              return node.className = "" + currentName + " " + className;
            }
          } else {
            if (includesClassName) {
              return node.className = currentName.replace(className, '');
            }
          }
        }, function() {});
      },
      removeclass: function() {
        var args, _ref2;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return (_ref2 = Batman.DOM.attrReaders).addclass.apply(_ref2, __slice.call(args).concat([true]));
      },
      foreach: function(node, iteratorName, key, context, parentRenderer) {
        var fragment, nodeMap, numPendingChildren, observers, oldCollection, parent, prototype, sibling;
        prototype = node.cloneNode(true);
        prototype.removeAttribute("data-foreach-" + iteratorName);
        parent = node.parentNode;
        sibling = node.nextSibling;
        parentRenderer.parsed(function() {
          return parent.removeChild(node);
        });
        nodeMap = new Batman.SimpleHash;
        fragment = document.createDocumentFragment();
        numPendingChildren = 0;
        observers = {};
        oldCollection = false;
        context.bind(node, key, function(collection) {
          var array, k, v, _results;
          if (oldCollection) {
            if (collection === oldCollection) {
              return;
            }
            nodeMap.forEach(function(item, node) {
              return parent.removeChild(node);
            });
            nodeMap.clear();
            if (oldCollection.forget) {
              oldCollection.forget('itemsWereAdded', observers.add);
              oldCollection.forget('itemsWereRemoved', observers.remove);
              oldCollection.forget('setWasSorted', observers.reorder);
            }
          }
          oldCollection = collection;
          observers.add = function() {
            var item, items, iteratorContext, localClone, newNode, _j, _len2, _results;
            items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            numPendingChildren += items.length;
            _results = [];
            for (_j = 0, _len2 = items.length; _j < _len2; _j++) {
              item = items[_j];
              parentRenderer.prevent('rendered');
              newNode = prototype.cloneNode(true);
              nodeMap.set(item, newNode);
              localClone = context.clone();
              iteratorContext = new Batman.Object;
              iteratorContext[iteratorName] = item;
              localClone.push(iteratorContext);
              _results.push(new Batman.Renderer(newNode, (function(newNode) {
                return function() {
                  var show;
                  show = Batman.data(newNode, 'show');
                  if (typeof show === 'function') {
                    show.call(newNode, {
                      before: sibling
                    });
                  } else {
                    fragment.appendChild(newNode);
                  }
                  if (--numPendingChildren === 0) {
                    parent.insertBefore(fragment, sibling);
                    if (typeof collection.isSorted === "function" ? collection.isSorted() : void 0) {
                      observers.reorder();
                    }
                    fragment = document.createDocumentFragment();
                  }
                  parentRenderer.allow('rendered');
                  return parentRenderer.fire('rendered');
                };
              })(newNode), localClone));
            }
            return _results;
          };
          observers.remove = function() {
            var item, items, oldNode, _j, _len2, _ref2;
            items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            for (_j = 0, _len2 = items.length; _j < _len2; _j++) {
              item = items[_j];
              oldNode = nodeMap.get(item);
              nodeMap.unset(item);
              if ((oldNode != null) && typeof oldNode.hide === 'function') {
                oldNode.hide(true);
              } else {
                if (oldNode != null) {
                  if ((_ref2 = oldNode.parentNode) != null) {
                    _ref2.removeChild(oldNode);
                  }
                }
              }
            }
            return true;
          };
          observers.reorder = function() {
            var item, items, show, thisNode, _j, _len2, _results;
            items = collection.toArray();
            _results = [];
            for (_j = 0, _len2 = items.length; _j < _len2; _j++) {
              item = items[_j];
              thisNode = nodeMap.get(item);
              show = Batman.data(thisNode, 'show');
              _results.push(typeof show === 'function' ? show.call(thisNode, {
                before: sibling
              }) : parent.insertBefore(thisNode, sibling));
            }
            return _results;
          };
          observers.arrayChange = function(array) {
            observers.remove.apply(observers, array);
            return observers.add.apply(observers, array);
          };
          if (collection) {
            if (collection.observe) {
              collection.observe('itemsWereAdded', observers.add);
              collection.observe('itemsWereRemoved', observers.remove);
              if (collection.setWasSorted) {
                collection.observe('setWasSorted', observers.reorder);
              } else {
                collection.observe('toArray', observers.arrayChange);
              }
            }
            if (collection.forEach) {
              return collection.forEach(function(item) {
                return observers.add(item);
              });
            } else if (collection.get && (array = collection.get('toArray'))) {
              return observers.add.apply(observers, array);
            } else {
              _results = [];
              for (k in collection) {
                v = collection[k];
                _results.push(observers.add(k));
              }
              return _results;
            }
          }
        }, function() {});
        return false;
      },
      formfor: function(node, localName, key, context) {
        var binding;
        binding = context.addKeyToScopeForNode(node, key, localName);
        return Batman.DOM.events.submit(node, function(node, e) {
          return e.preventDefault();
        });
      }
    },
    binders: {
      select: function(node, key, context, renderer, only) {
        var boundValue, container, updateOptionBindings, updateSelectBinding, _ref2;
        _ref2 = context.findKey(key), boundValue = _ref2[0], container = _ref2[1];
        updateSelectBinding = __bind(function() {
          var c, selections;
          selections = node.multiple ? (function() {
            var _j, _len2, _ref3, _results;
            _ref3 = node.children;
            _results = [];
            for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
              c = _ref3[_j];
              if (c.selected) {
                _results.push(c.value);
              }
            }
            return _results;
          })() : node.value;
          if (selections.length === 1) {
            selections = selections[0];
          }
          return container.set(key, selections);
        }, this);
        updateOptionBindings = __bind(function() {
          var child, data, subBoundValue, subContainer, subContext, subKey, _j, _len2, _ref3, _ref4, _results;
          _ref3 = node.children;
          _results = [];
          for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
            child = _ref3[_j];
            _results.push((data = Batman.data(child, 'selected')) ? (subContext = data.context) && (subKey = data.key) ? ((_ref4 = subContext.findKey(subKey), subBoundValue = _ref4[0], subContainer = _ref4[1], _ref4), child.selected !== subBoundValue ? subContainer.set(subKey, child.selected) : void 0) : void 0 : void 0);
          }
          return _results;
        }, this);
        return renderer.rendered(function() {
          var contextChange, nodeChange;
          contextChange = function(newValue) {
            var child, match, matches, value, valueToChild, _j, _k, _l, _len2, _len3, _len4, _ref3, _ref4;
            if (newValue instanceof Array) {
              valueToChild = {};
              _ref3 = node.children;
              for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
                child = _ref3[_j];
                child.selected = false;
                matches = valueToChild[child.value];
                if (matches) {
                  matches.push(child);
                } else {
                  matches = [child];
                }
                valueToChild[child.value] = matches;
              }
              for (_k = 0, _len3 = newValue.length; _k < _len3; _k++) {
                value = newValue[_k];
                _ref4 = valueToChild[value];
                for (_l = 0, _len4 = _ref4.length; _l < _len4; _l++) {
                  match = _ref4[_l];
                  match.selected = true;
                }
              }
            } else {
              node.value = newValue;
            }
            return updateOptionBindings();
          };
          nodeChange = function() {
            updateSelectBinding();
            return updateOptionBindings();
          };
          Batman.data(node, 'updateBinding', updateSelectBinding);
          return context.bind(only, node, key, contextChange, nodeChange);
        });
      },
      radio: function(node, key, context, renderer, only) {
        var contextChange, nodeChange;
        contextChange = function(value) {
          var boundValue, container, _ref2;
          _ref2 = context.findKey(key), boundValue = _ref2[0], container = _ref2[1];
          if (boundValue) {
            return node.checked = boundValue === node.value;
          } else if (node.checked) {
            return container.set(key, node.value);
          }
        };
        nodeChange = function(newNode, subContext) {
          return subContext.set(key, Batman.DOM.attrReaders._parseAttribute(node.value));
        };
        return context.bind(only, node, key, contextChange, nodeChange);
      }
    },
    events: {
      click: function(node, callback) {
        Batman.DOM.addEventListener(node, 'click', function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          callback.apply(null, [node].concat(__slice.call(args)));
          return args[0].preventDefault();
        });
        if (node.nodeName.toUpperCase() === 'A' && !node.href) {
          node.href = '#';
        }
        return node;
      },
      change: function(node, callback) {
        var eventName, eventNames, oldCallback, _j, _len2, _results;
        eventNames = (function() {
          switch (node.nodeName.toUpperCase()) {
            case 'TEXTAREA':
              return ['keyup', 'change'];
            case 'INPUT':
              if (node.type.toUpperCase() === 'TEXT') {
                oldCallback = callback;
                callback = function(e) {
                  var _ref2;
                  if (e.type === 'keyup' && (13 <= (_ref2 = e.keyCode) && _ref2 <= 14)) {
                    return;
                  }
                  return oldCallback.apply(null, arguments);
                };
                return ['keyup', 'change'];
              } else {
                return ['change'];
              }
              break;
            default:
              return ['change'];
          }
        })();
        _results = [];
        for (_j = 0, _len2 = eventNames.length; _j < _len2; _j++) {
          eventName = eventNames[_j];
          _results.push(Batman.DOM.addEventListener(node, eventName, function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return callback.apply(null, [node].concat(__slice.call(args)));
          }));
        }
        return _results;
      },
      submit: function(node, callback) {
        if (Batman.DOM.nodeIsEditable(node)) {
          Batman.DOM.addEventListener(node, 'keyup', function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            if (args[0].keyCode === 13 || args[0].which === 13 || args[0].keyIdentifier === 'Enter') {
              callback.apply(null, [node].concat(__slice.call(args)));
              return args[0].preventDefault();
            }
          });
        } else {
          Batman.DOM.addEventListener(node, 'submit', function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            callback.apply(null, [node].concat(__slice.call(args)));
            return args[0].preventDefault();
          });
        }
        return node;
      }
    },
    yield: function(name, node) {
      var content, yields, _base, _ref2;
      yields = (_base = Batman.DOM)._yields || (_base._yields = {});
      yields[name] = node;
      if ((content = (_ref2 = Batman.DOM._yieldContents) != null ? _ref2[name] : void 0)) {
        node.innerHTML = '';
        if (content) {
          return node.appendChild(content);
        }
      }
    },
    contentFor: function(name, node) {
      var contents, yield, _base, _ref2;
      contents = (_base = Batman.DOM)._yieldContents || (_base._yieldContents = {});
      contents[name] = node;
      if ((yield = (_ref2 = Batman.DOM._yields) != null ? _ref2[name] : void 0)) {
        yield.innerHTML = '';
        if (node) {
          return yield.appendChild(node);
        }
      }
    },
    valueForNode: function(node, value) {
      var isSetting;
      if (value == null) {
        value = '';
      }
      isSetting = arguments.length > 1;
      switch (node.nodeName.toUpperCase()) {
        case 'INPUT':
          if (isSetting) {
            return node.value = value;
          } else {
            return node.value;
          }
          break;
        case 'TEXTAREA':
          if (isSetting) {
            return node.innerHTML = node.value = value;
          } else {
            return node.innerHTML;
          }
          break;
        case 'SELECT':
          return node.value = value;
        default:
          if (isSetting) {
            return node.innerHTML = value;
          } else {
            return node.innerHTML;
          }
      }
    },
    nodeIsEditable: function(node) {
      var _ref2;
      return (_ref2 = node.nodeName.toUpperCase()) === 'INPUT' || _ref2 === 'TEXTAREA' || _ref2 === 'SELECT';
    },
    addEventListener: function(node, eventName, callback) {
      if (node.addEventListener) {
        return node.addEventListener(eventName, callback, false);
      } else {
        return node.attachEvent("on" + eventName, callback);
      }
    }
  };
  buntUndefined = function(f) {
    return function(value) {
      if (typeof value === 'undefined') {
        return;
      } else {
        return f.apply(this, arguments);
      }
    };
  };
  filters = Batman.Filters = {
    get: buntUndefined(function(value, key) {
      if (value.get != null) {
        return value.get(key);
      } else {
        return value[key];
      }
    }),
    equals: buntUndefined(function(lhs, rhs) {
      return lhs === rhs;
    }),
    not: function(value) {
      return !!!value;
    },
    truncate: buntUndefined(function(value, length, end) {
      if (end == null) {
        end = "...";
      }
      if (value.length > length) {
        value = value.substr(0, length - end.length) + end;
      }
      return value;
    }),
    "default": function(value, string) {
      return value || string;
    },
    prepend: function(value, string) {
      return string + value;
    },
    append: function(value, string) {
      return value + string;
    },
    downcase: buntUndefined(function(value) {
      return value.toLowerCase();
    }),
    upcase: buntUndefined(function(value) {
      return value.toUpperCase();
    }),
    pluralize: buntUndefined(function(string, count) {
      return helpers.pluralize(count, string);
    }),
    join: buntUndefined(function(value, byWhat) {
      if (byWhat == null) {
        byWhat = '';
      }
      return value.join(byWhat);
    }),
    sort: buntUndefined(function(value) {
      return value.sort();
    }),
    map: buntUndefined(function(value, key) {
      return value.map(function(x) {
        return x[key];
      });
    }),
    first: buntUndefined(function(value) {
      return value[0];
    }),
    meta: buntUndefined(function(value, keypath) {
      return value.meta.get(keypath);
    })
  };
  _ref2 = ['capitalize', 'singularize', 'underscore', 'camelize'];
  for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
    k = _ref2[_j];
    filters[k] = buntUndefined(helpers[k]);
  }
  $mixin(Batman, {
    cache: {},
    uuid: 0,
    expando: ("batman" + Math.random()).replace(/\D/g, ''),
    canDeleteExpando: true,
    noData: {
      "embed": true,
      "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
      "applet": true
    },
    hasData: function(elem) {
      elem = (elem.nodeType ? Batman.cache[elem[Batman.expando]] : elem[Batman.expando]);
      return !!elem && !isEmptyDataObject(elem);
    },
    data: function(elem, name, data, pvt) {
      var cache, getByName, id, internalKey, isNode, ret, thisCache;
      if (!Batman.acceptData(elem)) {
        return;
      }
      internalKey = Batman.expando;
      getByName = typeof name === "string";
      isNode = elem.nodeType;
      cache = isNode ? Batman.cache : elem;
      id = isNode ? elem[Batman.expando] : elem[Batman.expando] && Batman.expando;
      if ((!id || (pvt && id && (cache[id] && !cache[id][internalKey]))) && getByName && data === void 0) {
        return;
      }
      if (!id) {
        if (isNode) {
          elem[Batman.expando] = id = ++Batman.uuid;
        } else {
          id = Batman.expando;
        }
      }
      if (!cache[id]) {
        cache[id] = {};
      }
      if (typeof name === "object" || typeof name === "function") {
        if (pvt) {
          cache[id][internalKey] = $mixin(cache[id][internalKey], name);
        } else {
          cache[id] = $mixin(cache[id], name);
        }
      }
      thisCache = cache[id];
      if (pvt) {
        if (!thisCache[internalKey]) {
          thisCache[internalKey] = {};
        }
        thisCache = thisCache[internalKey];
      }
      if (data !== void 0) {
        thisCache[helpers.camelize(name, true)] = data;
      }
      if (getByName) {
        ret = thisCache[name];
        if (ret == null) {
          ret = thisCache[helpers.camelize(name, true)];
        }
      } else {
        ret = thisCache;
      }
      return ret;
    },
    removeData: function(elem, name, pvt) {
      var cache, id, internalCache, internalKey, isNode, thisCache;
      if (!Batman.acceptData(elem)) {
        return;
      }
      internalKey = Batman.expando;
      isNode = elem.nodeType;
      cache = isNode ? Batman.cache : elem;
      id = isNode ? elem[Batman.expando] : Batman.expando;
      if (!cache[id]) {
        return;
      }
      if (name) {
        thisCache = pvt ? cache[id][internalKey] : cache[id];
        if (thisCache) {
          if (!thisCache[name]) {
            name = helpers.camelize(name, true);
          }
          delete thisCache[name];
          if (!isEmptyDataObject(thisCache)) {
            return;
          }
        }
      }
      if (pvt) {
        delete cache[id][internalKey];
        if (!isEmptyDataObject(cache[id])) {
          return;
        }
      }
      internalCache = cache[id][internalKey];
      if (Batman.canDeleteExpando || !cache.setInterval) {
        delete cache[id];
      } else {
        cache[id] = null;
      }
      if (internalCache) {
        cache[id] = {};
        return cache[id][internalKey] = internalCache;
      } else if (isNode) {
        if (Batman.canDeleteExpando) {
          return delete elem[Batman.expando];
        } else if (elem.removeAttribute) {
          return elem.removeAttribute(Batman.expando);
        } else {
          return elem[Batman.expando] = null;
        }
      }
    },
    _data: function(elem, name, data) {
      return Batman.data(elem, name, data, true);
    },
    acceptData: function(elem) {
      var match;
      if (elem.nodeName) {
        match = Batman.noData[elem.nodeName.toLowerCase()];
        if (match) {
          return !(match === true || elem.getAttribute("classid") !== match);
        }
      }
      return true;
    }
  });
  isEmptyDataObject = function(obj) {
    var name;
    for (name in obj) {
      return false;
    }
    return true;
  };
  try {
    div = document.createElement('div');
    delete div.test;
  } catch (e) {
    Batman.canDeleteExpando = false;
  }
  mixins = Batman.mixins = new Batman.Object();
  Batman.Encoders = {
    railsDate: {
      encode: function(value) {
        return value;
      },
      decode: function(value) {
        var a;
        a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
        if (a) {
          return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]));
        } else {
          throw "Unrecognized rails date " + value + "!";
        }
      }
    }
  };
  container = typeof exports !== "undefined" && exports !== null ? (module.exports = Batman, global) : (window.Batman = Batman, window);
  $mixin(container, Batman.Observable);
  Batman.exportHelpers = function(onto) {
    var k, _k, _len3, _ref3;
    _ref3 = ['mixin', 'unmixin', 'route', 'redirect', 'event', 'eventOneShot', 'typeOf', 'redirect'];
    for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
      k = _ref3[_k];
      onto["$" + k] = Batman[k];
    }
    return onto;
  };
  Batman.exportGlobals = function() {
    return Batman.exportHelpers(container);
  };
}).call(this);
