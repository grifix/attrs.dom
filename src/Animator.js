var Animator = (function() {
	"use strict"

	// privates
	function pixel(el, key, value) {
	}
	
	function toString(value, unit) {
		if( typeof(value) !== 'number' ) return value;
		return value + (unit || '');
	}

	var reserved = ['delay', 'use3d', 'backface', 'origin', 'perspective', 'easing', 'duration', 'perspective'];
	function transition(el, o) {
		var parent = el.parent();

		var session = el.style();
		if( o.use3d !== false ) session.set('transform-style', 'preserve-3d');
		if( o.backface === 'hidden' ) session.set('backface-visibility', 'hidden');
		if( o.origin ) session.set('transform-origin', o.origin);
		if( typeof(o.perspective) === 'number' ) parent.style('perspective', o.perspective);
		session.set('transition-timing-function', o.easing || Animator.DEFAULT_EASING || 'ease-in-out');		
		session.set('transition-duration', (o.duration || Animator.DEFAULT_DURATION) + 'ms');
		
		var properties = [];
		for(var key in o) {
			if( !key || !o.hasOwnProperty(key) || ~reserved.indexOf(key)) continue;

			var value = o[key];
			if( key === 'transform' && typeof(value) === 'object' ) {			
				var transform = o['transform'];
				
				var text = '';
				for(var key in transform) {
					if( !transform.hasOwnProperty(key) ) continue;
					
					var value = transform[key];
					
					if( key === 'x' ) text += 'translateX(' + toString(value, 'px') + ') ';
					else if( key === 'y' ) text += 'translateY(' + toString(value, 'px') + ') ';
					else if( key === 'z' ) text += 'translateZ(' + toString(value, 'px') + ') ';
					else if( key === 'rx' ) text += 'rotateX(' + toString(value, 'deg') + ') ';
					else if( key === 'ry' ) text += 'rotateY(' + toString(value, 'deg') + ') ';
					else if( key === 'rz' ) text += 'rotateZ(' + toString(value, 'deg') + ') ';
					else if( key === 'sx' ) text += 'scaleX(' + toString(value) + ') ';
					else if( key === 'sy' ) text += 'scaleY(' + toString(value) + ') ';
					else if( key === 'sz' ) text += 'scaleZ(' + toString(value) + ') ';
					else text += (key + '(' + value + ')');
				}
				
				//console.log('transform', text);
				
				session.set('transform', text);
				properties.push('transform');
			} else if( key ) {
				session.set(key, value);
				properties.push(key);
			}
		}			

		session.set('transition-property', properties.join(','));		
		session.commit();
		//console.log('transition:', session.raw());
	}
	
	// class Animator
	function Animator(el, options, scope) {
		if( EL.isElement(el) ) el = $(el);
		if( !(el instanceof EL) ) throw new Error('Animator:invalid element');
		this.el = el;
		if( scope ) this.scope(scope);
		this._chain = [];
		this.index = -1;
		if( options ) this.chain(options);
	}

	Animator.DEFAULT_DURATION = 250;
	Animator.DEFAULT_EASING = 'ease-in-out';
	Animator.FAULT_WAITING = 100;

	Animator.prototype = {
		chain: function(options) {
			if( !arguments.length ) return this._chain;
			if( typeof(options) === 'number' ) return this._chain[options];
			
			if( options === false ) {
				this._chain = [];
				return this;
			}

			var args = options;
			if( !Array.isArray(args) ) args = [args];
			for(var i=0; i < args.length; i++) {
				var o = args[i];
				if( typeof(o) !== 'object' ) console.error('[WARN] illegal animation options', o);
				this._chain.push(o);
			}
			
			return this;
		},
		scope: function(scope) {
			if( !arguments.length ) return this._scope || this.el;
			if( scope ) this._scope = scope;
			return this;
		},
		length: function() {
			return this._chain.length;
		},
		reset: function(options) {
			this.stop();
			this.first();
			this.chain(options);
		},
		before: function(before) {
			if( !arguments.length ) return this._before;
			if( before === false ) {
				this._before = null;
				return this;
			}

			if( typeof(before) !== 'function' ) return console.error('Animator:before function must be a function', before);
			this._before = before;
			return this;
		},
		run: function(callback) {
			this.first();

			var before = this.before();
			if( before ) before.call(this.scope(), this);

			var fn = function() {
				if( !this.next(fn) && callback ) callback.call(this.scope(), this);
			};

			fn.call(this);

			return this;
		},
		reverse: function(callback) {
			this.last();

			var before = this.before();
			if( before ) before.call(this.scope(), this);

			var fn = function() {
				if( !this.prev(fn) && callback ) callback.call(this.scope(), this);
			};

			fn.call(this);

			return this;
		},
		executeCurrent: function(callback) {
			var self = this;
			var finished = false;
			var fn = function(e) {
				if( !finished ) {
					finished = true;
					self.el.un('transitionend', fn);
					if( callback ) callback.call(self.scope(), self);
				}
			};
			var options = this.chain(this.index);
			if( !options ) return false;
			this.el.on('transitionend', fn);
			
			if( typeof(options.delay) === 'number' ) {
				setTimeout(function() {
					transition(self.el, options);
				}, options.delay);
			} else {
				transition(this.el, options);
			}
			
			var wait = Animator.FAULT_WAITING;
			if( typeof(wait) !== 'number' || isNaN(options.delay) ) wait = 100;
			if( typeof(options.delay) === 'number' && !isNaN(options.delay) ) wait = wait + options.delay;
			if( typeof(options.duration) === 'number' && !isNaN(options.duration) ) wait = wait + options.duration;
			else wait += Animator.DEFAULT_DURATION;
			setTimeout(function() {
				if( !finished ) {
					finished = true;
					console.log('animation not affected', options);
					self.el.un('transitionend', fn);
					if( callback ) callback.call(self.scope(), self);
				}
			}, wait);

			return this;
		},
		first: function() {
			this.index = -1;
			return this;
		},		
		last: function() {
			this.index = -1;
			return this;
		},
		next: function(callback) {
			var o = this.chain(++this.index);
			if( !o ) return false;
			var self = this;
			var b = this.executeCurrent(function(anim) {
				if( callback ) callback.call(self, anim);
			});
			if( !b ) return false;
			return this;
		},
		prev: function(callback) {
			var o = this.chain(--this.index);
			if( !o ) return false;
			var self = this;
			var b = this.executeCurrent(function(anim) {
				if( callback ) callback.call(self, anim);
			});
			if( !b ) return false;
			return this;
		}
	};

	return Animator;
})();
