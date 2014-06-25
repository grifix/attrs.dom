/*!
 * jojequery (MIT License)
 *
 * This dom selector just for practice design patterns inspired from jquery & d3.js.
 * If you want use this, you have alternative choice "UI Alien (https://github.com/attrs/ui.alien)". 
 * It's really good framework to javascript based UI programming and also contains updated this dom selector. :)
 * 
 * @author: joje6 (joje.attrs@gmail.com)
 * @version: draft
 * @date: 2014-06-25
*/
if( !String.prototype.startsWith ) {
	String.prototype.startsWith = function(s) {
		return this.indexOf(s) === 0;
	};
}

if( !String.prototype.endsWith ) {
	String.prototype.endsWith = function(s) {
		var t = String(s);
		var index = this.lastIndexOf(t);
		return index >= 0 && index === this.length - t.length;
	};
}

var $ = (function() {
	"use strict";
	
	function Selector(selector, criteria, single, context) {
		this.length = 0;
		if( context ) this.context(context);
		this.refresh.apply(this, arguments);
	}
	
	var __root__ = {};
	function $(selector, criteria, single, context) {
		if( selector === document ) return $;
		if( selector !== __root__ ) return new Selector(selector, criteria, single, context);
	}
	
	$.prototype = new Array();
	var prototype = Selector.prototype = new $(__root__);
	
	$.on = function(type, fn, bubble) {
		if( window.addEventListener ) {
			window.addEventListener(type, fn, ((bubble===true) ? true : false));
		} else if( window.attachEvent ) {
			if( type == 'DOMContentLoaded' ) {
				document.attachEvent("onreadystatechange", function(){
					if ( document.readyState === "complete" ) {
						document.detachEvent( "onreadystatechange", arguments.callee );
						if( fn ) fn.apply(this, arguments);
					}
				});
			} else {
				document.attachEvent('on' + type, fn, ((bubble===true) ? true : false));
			}
		}
		return this;
	};

	$.un = function(type, fn, bubble) {
		if( window.removeEventListener ) {
			window.removeEventListener(type, fn, ((bubble===true) ? true : false));
		} else {
			document.detachEvent('on' + type, fn, ((bubble===true) ? true : false));
		}
		return this;
	};
	
	$.ready = function(fn) {
		return $.on('DOMContentLoaded', fn);
	};
	
	$.load = function(fn) {
		return $.on('load', fn);
	};
	
	$.create = function() {
		var tmp = $(document.createElement('div'));
		var items = tmp.create.apply(tmp, arguments).context(null);
		tmp = null;
		return items;
	};
	
	$.fn = prototype;	
	
	// common functions
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
	
	function accessor(el) {
		var tag = el.tagName.toLowerCase();
		var id = el.id;
		var cls = el.className.split(' ').join('.');
		id = id ? ('#' + id) : '';
		cls = cls ? ('.' + cls) : '';
		
		return tag + id + cls;
	}
	
	function resolve(value) {
		if( typeof(value) !== 'function' ) return value;
		return value.call(this, data.call(this, 'arg'));
	}
	
	function array_return(arr) {
		if( !arr || !arr.length ) return null;
		if( arr.length === 1 ) return arr[0];
		return arr;
	}
	
	function isElement(el) {
		if( typeof(el) !== 'object' ) return false;
		else if( !(window.attachEvent && !window.opera) ) return (el instanceof window.Element);
		else return (el.nodeType == 1 && el.tagName);
	}
	
	function isHtml(html) {
		return ((typeof(html) === 'string') && (html.match(/(<([^>]+)>)/ig) || ~html.indexOf('\n'))) ? true : false;
	}
	
	function evalHtml(html) {
		var els = [];		
		if( typeof(html) !== 'string' ) return els;
		
		var el;
		if( !html.toLowerCase().indexOf('<tr') ) el = document.createElement('tbody');
		else if( !html.toLowerCase().indexOf('<tbody') || !html.toLowerCase().indexOf('<thead') || !html.toLowerCase().indexOf('<tfoot') ) el = document.createElement('table');
		else if( !html.toLowerCase().indexOf('<td') ) el = document.createElement('tr');
		else el = document.createElement('div');

		el.innerHTML = html;
		var children = el.childNodes;
		if( children ) {
			for(var i=0; i < children.length; i++) {
				els.push(el.childNodes[i]);
			}

			els.forEach(function(item) {
				el.removeChild(item);
			});
		}

		return els;
	}
	
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
		else if( typeof(html) === 'function' ) html.call(el, el);
		
		return el;
	}
	
	$.util = {
		merge: merge,
		data: data,
		isElement: isElement,
		isHtml: isHtml,
		evalHtml: evalHtml,
		create: create,
		accessor: accessor,
		array_return: array_return,
		resolve: resolve
	};
	
	// define essential functions
	prototype.add = merge;
	
	prototype.remove = function(item, once) {
		if( typeof(item) === 'number' ) item = this[item];
		for(var index;(index = this.indexOf(item)) >= 0;) {
			this.splice(index, 1);
			if( once ) break;
		}
		return this;
	};
	
	prototype.refresh = function(selector, criteria, single) {
		//if( arguments.length && !selector ) return console.error('invalid selector', selector);
		if( isHtml(selector) ) selector = evalHtml(selector);
		this.clear();
		this.selector = selector = selector || [];
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
			var v = resolve.call(this, value);
			data.call(this, key, v);
		});
	};
	
	prototype.arg = function(value) {
		if( !arguments.length ) return this.data('arg');
		this.data('arg', value);
		return this;
	};
	
	prototype.context = function(context) {
		if( !arguments.length ) return this.__context__;
		
		if( context && !(context instanceof $) ) return console.error('context must be an DOM($) instance but', context);
		this.__context__ = context || null;
		return this;
	};
	
	prototype.call = function(fn) {
		if( typeof(fn) !== 'function' ) return console.error('require function', fn);
		return this.each(function() {
			resolve.call(this, fn);
		});
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
	
	
	// regist module system
	if( window.define ) {
		define('dom', function(module) {
			module.exports = $;
		});
	}
	
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
		
	function stringify(el) {
		if( el.outerHTML ) {
			return el.outerHTML;
		} else {
			var p = el.parent();
			if( p ) {
				return p.html();
			} else {
				var html = '<' + el.tagName;
			
				if( el.style ) html += ' style="' + el.style + '"';
				if( el.className ) html += ' class="' + el.className + '"';
			
				var attrs = el.attributes;
				for(var k in attrs) {
					if( !attrs.hasOwnProperty(k) ) continue;
					if( k && attrs[k] ) {
						html += ' ' + k + '="' + attrs[k] + '"';
					}
				}

				html += '>';
				html += el.innerHTML;
				html += '</' + el.tagName + '>';

				return html;
			}
		}
	}
	
	function computed(el, k) {
		var cs;
		if ( el.currentStyle ) {
			cs = el.currentStyle;
		} else if( document.defaultView && document.defaultView.getComputedStyle ) {
			cs = document.defaultView.getComputedStyle(el);
		} else {
			throw new Error('browser does not support computed style');
		}

		return k ? cs[k] : cs;
	}
	
	function isShowing(el) {
		if( computed('visibillity') === 'hidden' ) return false;
		if( (el.scrollWidth || el.scrollHeight || el.offsetWidth || el.offsetHeight || el.clientWidth || el.clientHeight) ) return true;
		return false;
	}	
	
	// function template for node attributes
	function type1(attr, arg) {
		if( !arg.length ) {
			var arr = [];
			this.each(function() {
				arr.push(this[attr]);
			});
			return array_return(arr);
		}
				
		return this.each(function() {
			this[attr] = resolve.call(this, arg[0]);
		});
	}
	
	// function template for element attributes handling
	function type2(arg) {
		if( !arg.length ) {
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
		
		var key = arg[0];
		var value = arg[1];
		
		if( typeof(key) === 'object' ) {
			for(var k in key) {
				if( key.hasOwnProperty(k) ) this.attr(k, key[k]);
			}
			return this;
		}
		
		if( typeof(key) !== 'string' ) return console.error('invalid key', key);
			
		if( arg.length === 1 ) {
			var arr = [];
			this.each(function() {
				arr.push(this.getAttribute(key));
			});
			return array_return(arr);
		}
		
		return this.each(function() {
			var v = resolve.call(this, value);
			if( v === false ) this.removeAttribute(key);
			else this.setAttribute(key, v || '');
		});
	}
	
	function boundary(el) {
		if( !el ) return console.error('invalid parameter', el);
		
		var abs = function(el) {
			var position = { x: el.offsetLeft, y: el.offsetTop };
			if (el.offsetParent) {
				var tmp = abs(el.offsetParent);
				position.x += tmp.x;
				position.y += tmp.y;
			}
			return position;
		};

		var boundary = {
			x: 0,
			y: 0,
			width: el.offsetWidth,
			height: el.offsetHeight,
			scrollWidth: el.scrollWidth,
			scrollHeight: el.scrollHeight,
			clientWidth: el.clientWidth,
			clientHeight: el.clientHeight
		};

		if( el.parentNode ) {
			boundary.x = el.offsetLeft + el.clientLeft;
			boundary.y = el.offsetTop + el.clientTop;
			if( el.offsetParent ) {
				var parentpos = abs(el.offsetParent);
				boundary.x += parentpos.x;
				boundary.y += parentpos.y;
			}
		}
		return boundary;
	}
	
	$.util.stringify = stringify;
	$.util.isShowing = isShowing;
	$.util.computed = computed;
	$.util.type1 = type1;
	$.util.boundary = boundary;
	
	
	// Let's define core functions
	// identifier & attributes
	fn.accessor = function() {
		var arr = [];
		this.each(function() {
			arr.push(accessor(this));
		});			
		return array_return(arr);
	};
	
	fn.id = function(id) {
		return type1.call(this, 'id', arguments);
	};
	
	fn.value = fn.val = function(value) {
		return type1.call(this, 'value', arguments);
	};
	
	fn.name = function(name) {
		if( !arguments.length ) return this.attr('name');
		return this.attr('name', name);
	};
	
	fn.attr = function() {
		return type2.call(this, arguments);
	};
	
	// contents handling
	fn.text = function(value) {
		return type1.call(this, 'innerText', arguments);
	};
	
	fn.html = function(value) {
		return type1.call(this, 'innerHTML', arguments);
	};
	
	fn.outer = function(value) {
		return type1.call(this, 'outerHTML', arguments);
	};
	
	fn.empty = function() {
		return this.each(function() {
			this.innerHTML = '';	
		});
	};
	
	
	// style handling
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
			var v = resolve.call(this, value);
			this.style[key] = v || '';
		});
	};
	
	fn.computed = function(key) {
		var arr = [];
		this.each(function() {
			arr.push(computed(this, key));
		});
		return array_return(arr);		
	};
	
		
	// accessor & class	
	fn.classes = function(cls, flag) {
		if( !arguments.length ) {
			var arr = [];
			this.each(function() {
				arr.push(this.className.trim().split(' '));
			});			
			return arr;			
		}
		
		return this.each(function() {
			var classes = resolve.call(this, cls);
			
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
	
	
	// find parent & children
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
	
	// creation
	fn.clone = function() {
		var arr = [];
		this.each(function() {
			arr.push(this.cloneNode(true));
		});
		return $(arr).context(this);
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
	
	fn.append = function(items, clone) {
		if( !items ) return console.error('invalid items', items);
		if( !(items instanceof $) ) items = $(items).context(this);
				
		return this.each(function() {
			var target = this;
			items.each(function() {
				var item = clone ? this.cloneNode(true) : this;
				target.appendChild(item);
			});
		});
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
	
	
	// events
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
	
	// TODO: 미구현
	fn.fire = function(type, values) {
		return this.each(function() {
			console.log('fired', this, type, values);
		});
	};
	
	
	// view handling
	fn.hide = function(options, fn) {
		var self = this;
		var internal = function() {
			self.each(function() {
				this.style.display = 'none';
				$(this).fire('hide');
			});

			if(fn) fn.apply(self, arguments);
		};

		if( typeof(options) === 'object' ) {
			this.anim(options, scope || this).run(internal);
		} else {
			if( typeof(options) === 'function' ) fn = options;
			internal.call(this);
		}
		
		return this;
	};
	
	fn.show = function(options, fn) {
		var self = this;
		var internal = function() {
			self.each(function() {
				var el = $(this);
				
				this.style.display = '';
				this.style.visibility = '';
				if( !this.style.cssText ) el.attr('style', false);
				
				if( el.computed('display').toLowerCase() === 'none' ) this.style.display = 'block';
				if( el.computed('visibility').toLowerCase() === 'hidden' ) this.style.display = 'visible';
				el.fire('show');
			});

			if(fn) fn.apply(self, arguments);
		};

		if( typeof(options) === 'object' ) {
			this.anim(options, scope || this).run(internal);
		} else {
			if( typeof(options) === 'function' ) fn = options;
			internal.call(this);
		}
		
		return this;
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
	
	
	// size & position & status
	fn.staged = function(index) {
		if( typeof(index) === 'number' ) return document.body.contains(this[index]);
		
		var cnt = 0;
		this.each(function() {
			if( document.body.contains(this) ) cnt++;
		});
		
		return (cnt > 0 && cnt === this.length);
	};
	
	fn.showing = function(index) {
		if( typeof(index) === 'number' ) return isShowing(this[index]);
		
		var cnt = 0;
		this.each(function() {
			if( isShowing(this) ) cnt++;
		});
		
		return (cnt > 0 && cnt === this.length);
	};
	
	fn.boundary = function() {
		var arr = [];
		this.each(function() {
			arr.push(boundary(this));
		});
		return array_return(arr);
	};
	
	fn.innerWidth = function() {
		var arr = [];
		this.each(function() {
			var w = 0;
			var c = this[0].children;
			if(c) {
				for(var i=0; i < c.length; i++) {
					w += c[i].offsetWidth;
				}
			}

			arr.push(w);
		});
		return array_return(arr);
	};
	
	fn.innerHeight = function() {
		var arr = [];
		this.each(function() {
			var h = 0;
			var c = this[0].children;
			if(c) {
				for(var i=0; i < c.length; i++) {
					h += c[i].offsetHeight;
				}
			}

			arr.push(h);
		});
		return array_return(arr);
	};
	
	(function() {
		var type1 = [
			'offsetWidth', 'offsetHeight', 'clientWidth', 'clientHeight', 'scrollWidth', 'scrollHeight'
		];
		
		var type2 = [
			'border', 'color', 'margin', 'padding', 'width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'maxHeight',
			'flex', 'float', 'opacity', 'zIndex'
		];
		
		type1.forEach(function(name) {
			fn[name] = (function(name) {
				return function() {
					return type1.call(this, name, arguments);
				};
			})();
		});
		
		type2.forEach(function(name) {
			fn[name] = (function(name) {
				return function() {
					return type2.call(this, name, arguments);
				};
			})();
		});
	})();	
	
	// misc
	fn.bg = function(bg) {
		if( !arguments.length ) {
			var arr = [];
			this.each(function() {
				var el = this, o = {};

				if( el.style.backgroundImage ) o['image'] = el.style.backgroundImage;
				if( el.style.backgroundColor ) o['color'] = el.style.backgroundColor;
				if( el.style.backgroundSize ) o['size'] = el.style.backgroundSize;
				if( el.style.backgroundPosition ) o['position'] = el.style.backgroundPosition;
				if( el.style.backgroundAttachment ) o['attachment'] = el.style.backgroundAttachment;
				if( el.style.backgroundRepeat ) o['repeat'] = el.style.backgroundRepeat;
				if( el.style.backgroundClip ) o['clip'] = el.style.backgroundClip;
				if( el.style.backgroundOrigin ) o['origin'] = el.style.backgroundOrigin;
	
				arr.push(o);
			});
			return array_return(arr);
		}
		
		if( typeof(bg) === 'string' ) {
			var s = bg.trim().toLowerCase();
			if( (!~bg.indexOf('(') && !~bg.indexOf(' ')) || bg.startsWith('rgb(') || bg.startsWith('rgba(') || bg.startsWith('hsl(') || bg.startsWith('hlsa(') ) bg = {'color':bg};
			else bg = {'image':bg};
		}
		
		if( typeof(bg) !== 'object' ) return this;
		
		return this.each(function() {
			var el = $(this);	
			el.style('background-image', bg['image']);
			el.style('background-color', bg['color']);
			el.style('background-size', bg['size']);
			el.style('background-position', bg['position']);
			el.style('background-attachment', bg['attachment']);
			el.style('background-repeat', bg['repeat']);
			el.style('background-clip', bg['clip']);
			el.style('background-origin', bg['origin']);
		});
	};
	
	fn.font = function(font) {
		if( !arguments.length ) {
			var arr = [];
			this.each(function() {
				var el = this, o = {};
				
				if( el.style.fontFamily ) o['family'] = el.style.fontFamily;
				if( el.style.fontSize ) o['size'] = el.style.fontSize;
				if( el.style.fontStyle ) o['style'] = el.style.fontStyle;
				if( el.style.fontVarient ) o['variant'] = el.style.fontVarient;
				if( el.style.fontWeight ) o['weight'] = el.style.fontWeight;
				if( el.style.fontSizeAdjust ) o['adjust'] = el.style.fontSizeAdjust;
				if( el.style.fontStretch ) o['stretch'] = el.style.fontStretch;
				if( el.style.letterSpacing ) o['spacing'] = el.style.letterSpacing;
				if( el.style.lineHeight ) o['height'] = el.style.lineHeight;
		
				arr.push(o);
			});
			return array_return(arr);			
		}
		
		return this.each(function() {
			var el = $(this);
			if( typeof(font) === 'string' ) {
				el.style('font', font);
			} else if( typeof(font) === 'number' ) {
				el.style('font-size', font + 'px');
			} else if( typeof(font) === 'object' ){
				el.style('font-family', font['family']);
				el.style('font-size', font['size']);
				el.style('font-style', font['style']);
				el.style('font-variant', font['variant']);
				el.style('font-weight', font['weight']);
				el.style('font-size-adjust', font['adjust']);
				el.style('font-stretch', font['stretch']);
				el.style('letter-spacing', font['spacing']);
				el.style('line-height', font['height']);
			}
		});
	};
	
	
	// animation
	fn.anim = function(options, scope) {
		return new Animator(this, options, scope || this);
	};
	
	
	// template
	fn.bind = function(values, functions) {
		var arr = [];
		this.each(function() {
			var result = new Template(this).bind(values, functions);
			arr.push(result);
		});
		return array_return(arr);
	};
	
	fn.tpl = function() {
		var arr = [];
		this.each(function() {
			arr.push(new Template(this));
		});
		return array_return(arr);
	};
})($);


// MutationObserver setup for detect DOM node changes.
// if browser doesn't support DOM3 MutationObeserver, use MutationObeserver shim (https://github.com/megawac/MutationObserver.js)
$.ready(function() {
	var observer = new MutationObserver(function(mutations){
		mutations.forEach(function(mutation) {
			//if( debug('mutation') ) console.error(mutation.target, mutation.type, mutation);
			
			if( mutation.type === 'childList' ) {
				var target = mutation.target;
				var tel = target.__handler__;
				var added = mutation.addedNodes;
				var removed = mutation.removedNodes;
				
								
				if( removed ) {
					for(var i=0; i < removed.length; i++) {
						var source = removed[i].__handler__;
						
						if( tel ) {
							tel.fire('removed', {
								removed: removed[i]
							});
						}
						
						if( source ) {
							source.fire('detached', {
								from: target
							});
						}
					}
				}
				
				if( added ) {
					for(var i=0; i < added.length; i++) {
						var source = added[i].__handler__;
							
						if( tel ) {
							tel.fire('added', {
								added: added[i]
							});
						}
						
						if( source ) {
							source.fire('attached', {
								to: target
							});
						}
					}
				}
			}
		}); 
    });

	observer.observe(document.body, {
		subtree: true,
	    childList: true,
	    attributes: true,
	    characterData: true
	});
});