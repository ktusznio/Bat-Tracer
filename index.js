(function() {
  var Tracer;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Tracer = (function() {
    __extends(Tracer, Batman.App);
    function Tracer() {
      Tracer.__super__.constructor.apply(this, arguments);
    }
    Tracer.global(true);
    Tracer.root('app#index');
    Tracer.prototype.query = '';
    return Tracer;
  })();
  Tracer.Tweet = (function() {
    __extends(Tweet, Batman.Model);
    function Tweet() {
      Tweet.__super__.constructor.apply(this, arguments);
    }
    Tweet.persist(Batman.LocalStorage);
    Tweet.destroyAll = function() {
      var _ref;
      return (_ref = this.get('all')) != null ? _ref.forEach(function(t) {
        return t.destroy();
      }) : void 0;
    };
    return Tweet;
  })();
  Tracer.AppController = (function() {
    __extends(AppController, Batman.Controller);
    function AppController() {
      this.submitSearch = __bind(this.submitSearch, this);
      AppController.__super__.constructor.apply(this, arguments);
    }
    AppController.prototype.index = function() {
      Tracer.Tweet.destroyAll();
      return this.render(false);
    };
    AppController.prototype.submitSearch = function() {
      Tracer.set('hasSearched', true);
      Tracer.Tweet.destroyAll();
      return $.ajax('http://search.twitter.com/search.json?q=' + encodeURI(Tracer.query), {
        dataType: 'jsonp',
        success: function(data) {
          var obj, tweet, _i, _len, _ref, _results;
          _ref = data.results;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            obj = _ref[_i];
            tweet = new Tracer.Tweet(obj);
            _results.push(tweet.save(function(error, record) {
              if (error) {
                throw error;
              }
            }));
          }
          return _results;
        }
      });
    };
    return AppController;
  })();
  Tracer.run();
}).call(this);
