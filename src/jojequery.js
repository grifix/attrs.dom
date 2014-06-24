var $ = (function() {
	"use strict";
	
	function Selector(selector, criteria, single, context) {
		this.length = 0;
		if( context ) this.context(context);
		this.refresh.apply(this, arguments);
	}
	
	var __root__ = {};
	function DOM(selector, criteria, single, context) {
		if( selector !== __root__ ) return new Selector(selector, criteria, single, context);
	}
	
	DOM.prototype = new Array();
	var prototype = Selector.prototype = new DOM(__root__);
	
	DOM.ready = function ready(fn) {
		window.addEventListener('DOMContentLoaded', fn);
		return this;
	};
	
	DOM.load = function ready(fn) {
		window.addEventListener('load', fn);
		return this;
	};
	
	DOM.fn = prototype;
	
	var $ = DOM;
	
	function merge(o) {
		if( typeof(o.length) === 'number' ) {
			for(var i=0; i < o.length; i++) {
				this.push(o[i]);
			}
		} else {
			this.push(o);
		}
		return this;
	}
	
	function data(key, value) {
		if( !arguments.length ) return this.__alien__;
		if( arguments.length === 1 ) return this.__alien__ && this.__alien__[key];
		if( !this.__alien__ ) this.__alien__ = {};
		
		if( value !== false || value !== undefined ) {
			this.__alien__[key] = value;
		} else {
			this.__alien__[key] = undefined;
			try {
				delete this.__alien__[key];
			} catch(e) {}
		}
	}
	
	// common functions
	function isElement(el) {
		if( typeof(el) !== 'object' ) return false;
		else if( !(window.attachEvent && !window.opera) ) return (el instanceof window.Element);
		else return (el.nodeType == 1 && el.tagName);
	};
	
	function create(selector, html) {
		if( !selector || typeof(selector) !== 'string' ) return console.error('invalid parameter', selector);
		
		var arr = selector.split('.');
		var tag = arr[0];
		var id;
		var classes = arr.splice(1).join(' ').trim();
		
		if( ~tag.indexOf('#') ) {
			var t = tag.split('#');
			tag = t[0];
			id = t[1];			
		}
		
		var el = document.createElement(tag);
		if( id ) el.id = id;
		if( classes ) el.className = classes;
		
		if( typeof(html) === 'string' ) el.innerHTML = html;
		else if( typeof(html) === 'function' ) html.call(this, el);
		
		return el;
	};
	
	function accessor(el) {
		var tag = el.tagName.toLowerCase();
		var id = el.id;
		var cls = el.className.split(' ').join('.');
		id = id ? ('#' + id) : '';
		cls = cls ? ('.' + cls) : '';
		
		return tag + id + cls;
	}
	
	function array_return(arr) {
		if( !arr || !arr.length ) return null;
		if( arr.length === 1 ) return arr[0];
		return arr;
	}
	
	function resolve(value) {
		if( typeof(value) !== 'function' ) return value;
		return value.call(this, data.call(this, 'arg'));
	}
	
	$.util = {
		data: data,
		isElement: isElement,
		create: create,
		accessor: accessor,
		array_return: array_return,
		resolve: resolve
	};
	
	// define essential functions
	prototype.add = merge;
	
	prototype.remove = function(item, once) {
		for(var index;(index = this.indexOf(item)) >= 0;) {
			this.splice(index, 1);
			if( once ) break;
		}
	};
	
	prototype.refresh = function(selector, criteria, single) {
		if( arguments.length && !selector ) return console.error('invalid selector', selector);
		
		this.clear();
		this.selector = selector;
		if( criteria ) this.criteria = criteria;
		if( single === true ) this.single = single = true;
		if( typeof(selector) === 'string' ) {
			var items = [];
			if( criteria instanceof $ ) {
				var self = this;
				criteria.each(function() {
					if( single && self.length > 0 ) return;
					
					if( single ) self.push(this.querySelector(selector));
					else merge.call(self, this.querySelectorAll(selector));
				});
			} else {
				if( single ) merge.call(this, (criteria || document).querySelector(selector));
				else merge.call(this, (criteria || document).querySelectorAll(selector));
			}
		} else {
			merge.call(this, selector);
		}
		return this;
	};
	
	prototype.each = function(fn) {
		this.forEach(function(el) {
			fn.call(el);
		});
		return this;
	};
	
	prototype.clear = function() {
		var len = this.length;
		if( len > 0 ) {
			for(var i=0; i < len; i++) {
				this[i] = undefined;
				try {
					delete this[i];
				} catch(e) {}
			}
			
			this.length = 0;
		}
		
		return this;
	};
	
	prototype.get = function(index) {
		return this[index];
	};
		
	prototype.data = function(key, value) {
		if( typeof(key) === 'object' ) {
			for(var k in key) {
				if( key.hasOwnProperty(k) ) this.data(k, key[k]);
			}
			return this;
		}
			
		if( arguments.length <= 1 ) {
			var arg = arguments;
			var arr = [];
			this.each(function() {
				arr.push(data.apply(this, arg));
			});			
			return array_return(arr);
		}
		
		if( typeof(key) !== 'string' ) return console.error('invalid key', key);
		
		var self = this;
		return this.each(function() {
			value = resolve.call(this, value);
			data.call(this, key, value);
		});
	};
	
	prototype.arg = function(value) {
		if( !arguments.length ) return this.data('arg');
		this.data('arg', value);
		return this;
	};
	
	prototype.context = function(context) {
		if( !arguments.length ) return this.__context__;
		
		if( !(context instanceof $) ) return console.error('context must be an DOM($) instance but', context);
		this.__context__ = context;
		return this;
	};
	
	prototype.out = function(step) {
		step = step || 1;
		if( typeof(step) !== 'number' ) return console.error('invalid parameter', step);
				
		var c = this;
		var last = c;
		var cnt = 0;
		for(;(c = (c.context && c.context()));) {
			cnt++;
			if( c ) last = c;
			if( step === cnt ) return last;
			if( cnt > 100 ) return console.error('so many out', this);
		}
		
		return last;
	};
	
	return $;
})();


// setup core functions
(function($) {
	"use strict";
	
	var fn = $.fn;
	
	var accessor = $.util.accessor;
	var array_return = $.util.array_return;
	var resolve = $.util.resolve;
	var data = $.util.data;
	var create = $.util.create;
	var isElement = $.util.isElement;
	
	
	function processing(fnname, value) {
		if( arguments.length <= 1 ) {
			var arr = [];
			this.each(function() {
				arr.push(this[fnname]);
			});
			return array_return(arr);
		}
		
		value = value || '';		
		return this.each(function() {			
			var v = resolve.call(this, value);
			this[fnname] = v;
		});
	}
	
	// core functions	
	fn.id = function(id) {
		if( !arguments.length ) {
			var arr = [];
			this.each(function() {
				arr.push(this.id);
			});			
			return array_return(arr);
		}
		
		return this.each(function() {
			id = resolve.call(this, id);
			this.id = id;
		});
	};
	
	fn.accessor = function() {
		var arr = [];
		this.each(function() {
			arr.push(accessor(this));
		});			
		return array_return(arr);
	};
	
	fn.text = function(value) {
		var arr = ['innerText'];
		if( arguments.length ) arr.push(value);
		return processing.apply(this, arr);
	};
	
	fn.html = function(value) {
		var arr = ['innerHTML'];
		if( arguments.length ) arr.push(value);
		return processing.apply(this, arr);
	};
	
	fn.outer = function(value) {
		var arr = ['outerHTML'];
		if( arguments.length ) arr.push(value);
		return processing.apply(this, arr);
	};
	
	fn.attr = function(key, value) {
		if( !arguments.length ) {
			var arr = [];
			this.each(function() {
				var attrs = this.attributes;
				var o = {}; 
				for(var i= attrs.length-1; i>=0; i--) {
					o[attrs[i].name] = attrs[i].value;
				}

				arr.push(o);
			});			
			return array_return(arr);
		}
		
		if( typeof(key) === 'object' ) {
			for(var k in key) {
				if( key.hasOwnProperty(k) ) this.attr(k, key[k]);
			}
			return this;
		}
		
		if( typeof(key) !== 'string' ) return console.error('invalid key', key);
			
		if( arguments.length === 1 ) {
			var arr = [];
			this.each(function() {
				arr.push(this.getAttribute(key));
			});
			return array_return(arr);
		}
				
		var self = this;
		return this.each(function() {
			value = resolve.call(this, value);
			if( value === false ) this.removeAttribute(key);
			else this.setAttribute(key, value || '');
		});
	};
	
	fn.style = fn.css = function(key, value) {
		if( typeof(key) === 'object' ) {
			for(var k in key) {
				if( key.hasOwnProperty(k) ) this.style(k, key[k]);
			}
			return this;
		}
		
		if( typeof(key) !== 'string' ) return console.error('invalid key', key);
			
		if( arguments.length === 1 ) {
			var arr = [];
			this.each(function() {
				arr.push(this.style[key]);
			});
			return array_return(arr);
		}
		
		var self = this;
		return this.each(function() {
			value = resolve.call(this, value);
			this.style[key] = value || '';
		});
	};
	
	fn.on = function(type, fn, bubble) {
		if( typeof(type) !== 'string' ) return console.error('invalid type', type);
		if( typeof(fn) !== 'function' ) return console.error('invalid fn', fn);
		return this.each(function() {
			this.addEventListener(type, fn, bubble);
		});
	};
	
	fn.off = function(type, fn, bubble) {
		if( typeof(type) !== 'string' ) return console.error('invalid type', type);
		if( typeof(fn) !== 'function' ) return console.error('invalid fn', fn);
		return this.each(function() {
			this.removeEventListener(type, fn, bubble);
		});
	};
	
	fn.hide = function() {
		return this.each(function() {
			this.style.display = 'none';
		});
	};
	
	fn.show = function() {
		return this.each(function() {
			this.style.display = '';
		});
	};
	
	fn.parent = function(cnt) {
		var arr = [];
		this.each(function() {
			var p = this.parentNode;
			if( p ) arr.push(p);
		});
		return $(arr).context(this);
	};
	
	fn.all = fn.find = function(selector) {
		if( !arguments.length ) selector = ':scope > *';
		return $(selector, this).context(this);
	};
	
	fn.children = function() {
		return this.all();
	};
	
	fn.one = function(selector) {
		if( !arguments.length ) selector = ':scope > *';
		return $(selector, this, true).context(this);
	};
	
	fn.classes = function(classes, flag) {
		if( !arguments.length ) {
			var arr = [];
			this.each(function() {
				arr.push(this.className.trim().split(' '));
			});			
			return arr;			
		}
		
		return this.each(function() {
			classes = resolve.call(this, classes);
			
			var el = this;
			var o = (el.className || '').trim();

			if( typeof(flag) === 'boolean' ) {
				if( !classes ) return this;
				if( Array.isArray(classes) ) classes = classes.join(' ');
				classes = classes.split(' ');
			
				var args = el.className.trim().split(' ');
				for(var i=0; i < classes.length; i++) {
					var cls = classes[i];
					if( cls ) {
						if( !flag && ~args.indexOf(cls) ) args.splice(args.indexOf(cls), 1);
						else if( flag && !~args.indexOf(cls) ) args.push(cls);
					}
				}

				el.className = args.join(' ');
			} else {
				el.className = '';
				el.removeAttribute('class');
				if( Array.isArray(classes) ) classes = classes.join(' ').trim();
				if( classes ) el.className = classes;
			}
		});
	};
	
	fn.ac = fn.addClass = function(s) {
		return this.classes(s, true);
	};
	
	fn.is = fn.hasClass = function(s) {
		return (s && ~this[0].className.split(' ').indexOf(s)) ? true : false;
	},
	
	fn.rc = fn.removeClass = function(s) {
		return this.classes(s, false);
	};
	
	fn.cc = fn.clearClass = function() {
		return this.each(function() {
			var el = this;
			el.className = '';
			el.removeAttribute('class');
		});
	};
	
	fn.fade = function(start, end) {
		return this.each(function() {
			var el = this;
			
			var opacity = 0;
			el.style.opacity = 0;
			el.style.filter = '';

			var last = +new Date();
			var tick = function() {
				opacity += (new Date() - last) / 400;
				el.style.opacity = opacity;
				el.style.filter = 'alpha(opacity=' + (100 * opacity)|0 + ')';

				last = +new Date();

				if (opacity < 1) {
					(window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
				}
			};

			tick();
		});
	};
	
	fn.fadeIn = function() {
		return this.fade(0, 1);
	};
	
	fn.fadeOut = function() {
		return this.fade(1, 0);
	};
	
	fn.clone = function() {
		var arr = [];
		this.each(function() {
			arr.push(this.cloneNode(true));
		});
		return $(arr).context(this);
	};
	
	fn.filter = function(fn, reverse) {
		var items = [];
		
		var compare = (reverse === true) ? false : true;
		
		if( typeof(fn) === 'string' ) {
			var selector = ':scope > ' + fn.trim();
			fn = function() {
				var p = this.parentNode;				
				var q = p && p.querySelectorAll(selector);
				var exist = (Array.prototype.indexOf.call(q, this) >= 0);

				return exist;
			}
		}
		
		this.each(function() {
			var result = fn.apply(this, arguments);
			if( result !== compare ) items.push(this);
		});
		return $(items).context(this);
	};
	
	fn.contains = function(child) {
		var contains = false;
		this.each(function() {
			var self = this;
			// TODO: 교집합을 구하는 것으로 수정해야 한다. child 가 모두 포함되어 있어야 contains 로 인정
			if( child instanceof $ ) return child.each(function() {
				if( self !== this && self.contains(this) ) contains = true;
			});

			if( typeof(child) === 'string' ) child = this.querySelector(child);
			if( this !== child && this.contains(child) ) contains = true;
		});		
		return contains;
	};
	
	// TODO : 구현미비
	fn.in = function(el) {
		var contains = false;				
		this.each(function() {
			if( typeof(el) === 'string' ) el = this.querySelector(el);
			
			if( this === el ) contains = true;
		});		
		return contains;
	};
	
	// TODO : 구현미비
	fn.equals = function(target) {
		if( target === this ) return true;
		if( (target instanceof $) && target.length === 1 ) target = target[0];
		return (this.length === 1 && target === this[0]) ? true : false;
	};
	
	fn.create = function(accessor, args, fn) {
		if( typeof(accessor) !== 'string' ) return console.error('invalid accessor', accessor);
		var arr = [];
		
		this.each(function() {
			if( !args ) args = [null];
			if( args && typeof(args.length) !== 'number' ) args = [args];
			
			var self = this;
			for(var i=0, len=args.length; i < len; i++) {
				var el = create.call(this, accessor);
				self.appendChild(el);
				
				data.call(el, 'arg', args[i]);
				arr.push(el);
			}
		});
		return $(arr).context(this);
	};
	
	fn.append = function(items) {
		if( !items ) return console.error('invalid items', items);
		if( !(items instanceof $) ) items = $(items).context(this);
		
		var target = this[0];
		if( target ) {
			items.each(function() {
				target.appendChild(this);
			});
		}
		
		return this;
	};
	
	fn.appendTo = function(target) {
		if( !target ) return console.error('invalid target', target);
		if( typeof(target) === 'string' ) target = document.querySelector(target);
		if( target instanceof $ ) target = target[0];
		
		if( typeof(target.appendChild) !== 'function' ) return console.error('invalid target', target);
		
		return this.each(function() {
			target.appendChild(this);
		});
	};
	
	fn.detach = function() {
		return this.each(function() {
			var p = this.parentNode;
			if( p ) p.removeChild(this);
		});
	};
})($);
