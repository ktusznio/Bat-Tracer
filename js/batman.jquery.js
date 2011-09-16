(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Batman.Request.prototype.send = function(data) {
    var options;
    options = {
      url: this.get('url'),
      type: this.get('method'),
      dataType: this.get('type'),
      data: data || this.get('data'),
      username: this.get('username'),
      password: this.get('password'),
      beforeSend: __bind(function() {
        return this.loading(true);
      }, this),
      success: __bind(function(response, textStatus, xhr) {
        this.set('status', xhr.status);
        this.set('response', response);
        return this.success(response);
      }, this),
      error: __bind(function(xhr, status, error) {
        this.set('status', xhr.status);
        this.set('response', xhr.responseText);
        return this.error(error);
      }, this),
      complete: __bind(function() {
        this.loading(false);
        return this.loaded(true);
      }, this)
    };
    if (this.get('method' === 'PUT' || 'method' === 'POST')) {
      options.contentType = this.get('contentType');
    }
    return jQuery.ajax(options);
  };
  Batman.mixins.animation = {
    show: function(addToParent) {
      var jq, show, _ref, _ref2;
      jq = $(this);
      show = function() {
        return jq.show(600);
      };
      if (addToParent) {
        if ((_ref = addToParent.append) != null) {
          _ref.appendChild(this);
        }
        if ((_ref2 = addToParent.before) != null) {
          _ref2.parentNode.insertBefore(this, addToParent.before);
        }
        jq.hide();
        setTimeout(show, 0);
      } else {
        show();
      }
      return this;
    },
    hide: function(removeFromParent) {
      $(this).hide(600, __bind(function() {
        var _ref;
        if (removeFromParent) {
          return (_ref = this.parentNode) != null ? _ref.removeChild(this) : void 0;
        }
      }, this));
      return this;
    }
  };
}).call(this);
