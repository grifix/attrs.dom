var SelectorBuilder = (function() {
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

	if ( !Array.prototype.every ) {
		Array.prototype.every = function(fun /*, thisArg */) {
			'use strict';

			if (this === void 0 || this === null) throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== 'function') throw new TypeError();

			var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
			for (var i = 0; i < len; i++) {
				if (i in t && !fun.call(thisArg, t[i], i, t))
					return false;
			}

			return true;
		};
	}

	// common functions
	function isNode(o){
		return (typeof(Node) === "object") ? o instanceof Node : 
			(o && typeof(o.nodeType) === 'number' && typeof(o.nodeName) === 'string');
	}

	function isElement(el) {
		if( typeof(el) !== 'object' ) return false;
		else if( !(window.attachEvent && !window.opera) ) return (el instanceof window.Element);
		else return (el.nodeType == 1 && el.tagName);
	}

	function isHtml(html) {
		return ((typeof(html) === 'string') && (html.match(/(<([^>]+)>)/ig) || ~html.indexOf('\n'))) ? true : false;
	}

	function isArrayType(o) {
		if( !o ) return false;
		return (o instanceof Commons || Array.isArray(o) || o instanceof NodeList || o instanceof HTMLCollection || (typeof(o.length) === 'number' && typeof(o.forEach) === 'function')) ? true : false;
	}

	function merge(o, index) {
		var push = function(o, index) {
			if( o === null || o === undefined || ~this.indexOf(o) ) return index;
		
			if( typeof(index) !== 'number' || index > this.length ) {
				this.push(o);
				return index;
			}
		
			if( index < 0 ) index = 0;
			this.splice(index, 0, o);
			return index + 1;
		};
	
		if( !isNode(o) && typeof(o.length) === 'number' ) {
			for(var i=0; i < o.length; i++) {
				index = push.call(this, o[i], index);
			}
		} else {
			index = push.call(this, o, index);
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

	function resolve(value) {
		if( typeof(value) !== 'function' ) return value;
		return value.call(this, data.call(this, 'arg'));
	}

	function array_return(arr) {
		if( !arr || !arr.length ) return null;
		if( arr.length === 1 ) return arr[0];
		return arr;
	}

	function evalHtml(document, html, includeall) {
		var els = [];		
		if( typeof(html) !== 'string' ) return els;
	
		var lower = html.trim().toLowerCase();
		var el;
		if( !lower.indexOf('<tr') ) el = document.createElement('tbody');
		else if( !lower.indexOf('<tbody') || !lower.indexOf('<thead') || !lower.indexOf('<tfoot') ) el = document.createElement('table');
		else if( !lower.indexOf('<td') ) el = document.createElement('tr');
		else el = document.createElement('div');

		el.innerHTML = html;
	
		var children = (includeall) ? el.childNodes : el.children;
		if( children ) {
			for(var i=0; i < children.length; i++) {
				els.push(children[i]);
			}

			els.forEach(function(item) {
				el.removeChild(item);
			});
		}

		return els;
	}
	
	function computed(el, k) {
		var cs;
		if ( el.currentStyle ) {
			cs = el.currentStyle;
		} else if( document.defaultView && document.defaultView.getComputedStyle ) {
			cs = document.defaultView.getComputedStyle(el);
		} else {
			return console.error('not support computed style');
			//throw new Error('browser does not support computed style');
		}

		return k ? cs[k] : cs;
	}

	function accessor(el) {
		var tag = el.tagName.toLowerCase();
		var id = el.id;
		var cls = el.className.split(' ').join('.');
		id = id ? ('#' + id) : '';
		cls = cls ? ('.' + cls) : '';
	
		return tag + id + cls;
	}

	function assemble(selector) {
		if( !selector || typeof(selector) !== 'string' ) return console.error('invalid selector', selector);
	
		var arr = selector.split(':');
	
		var accessor = arr[0];
		var pseudo = arr[1];
	
		arr = accessor.split('.');
		var tag = arr[0];
		var id;
		var classes = arr.splice(1).join(' ').trim();
	
		if( ~tag.indexOf('#') ) {
			var t = tag.split('#');
			tag = t[0];
			id = t[1];
		}
	
		return {
			selector: selector,
			accessor: accessor,
			tag: tag && tag.toLowerCase() || '',
			id: id || '',
			classes: classes || '',
			pseudo: pseudo || ''
		};
	}
	
	function hasClass(el, classes) {
		var elcls = el.className.split(' ');
		var s = classes.split(' ');
		var hasnot = false;
		for(var i=0; i < s.length; i++) {
			var cls = s[i];
			if( !cls || !~elcls.indexOf(cls) ) hasnot = true;
		}
		
		return !hasnot;
	}

	function match(el, accessor) {
		if( accessor === '*' ) return true;
		if( !isElement(el) ) {
			return ( el.nodeName === accessor );
		}
	
		var o = assemble(accessor);
		var tag = o.tag;
		var classes = o.classes;
		var id = o.id;
		var pseudo = o.pseudo;
			
		if( !tag || el.tagName.toLowerCase() === tag ) {
			if( !id || el.id === id ) {
				if( !classes || hasClass(el, classes) ) {
					if( !pseudo || matchPseudo(el, pseudo) ) return true;
				}
			}
		}
	
		return false;
	}
	

	function matchPseudo(el, pseudo) {
		if( !el || !pseudo ) return false;
		var p = el.parentNode;
	
		if( pseudo === 'first' ) {
			if( p && p.children[0] === el ) return true;
		} else if( pseudo === 'last' ) {
			if( p && p.children[p.children.length - 1] === el ) return true;
		} else if( pseudo === 'checked' ) {
			return (el.checked) ? true : false;		
		} else if( pseudo === 'selected' ) {
			return (el.selected) ? true : false;
		} else if( pseudo === 'empty' ) {
			return (!el.childNode.length) ? true : false;
		} else if( pseudo === 'checkbox' || pseudo === 'radio' || pseudo === 'select' ) {
			return (function(type) {
				return (el.tagName.toLowerCase() === 'input' && (el.getAttribute('type') || '').trim().toLowerCase() === type ) ? true : false;
			})(pseudo);
		} 
	
		return false;
	}
	
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

	function isShowing(el) {
		if( computed(el, 'visibillity') === 'hidden' ) return false;
		if( (el.scrollWidth || el.scrollHeight || el.offsetWidth || el.offsetHeight || el.clientWidth || el.clientHeight) ) return true;
		return false;
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

	function camelcase(key) {
		var position;
		try {
			while( ~(position = key.indexOf('-')) ) {
				var head = key.substring(0, position);
				var lead = key.substring(position + 1, position + 2).toUpperCase();
				var tail = key.substring(position + 2);
				key = head + lead + tail;
			}

			key = key.substring(0,1).toLowerCase() + key.substring(1);
		} catch(e) {
			console.error('WARN:style key camelcase translation error', key, e);
		}

		return key;
	}
	
	var Commons = function Commons() {};
	Commons.prototype = new Array();
	var commons = new Commons();
	
	// build selector
	var SelectorBuilder = function(document) {
		"use strict";
	
		function Selection(selector, criteria, single) {
			this.length = 0;
			this.refresh.apply(this, arguments);
		}
	
		var __root__ = {};
		function Selector(selector, criteria, single) {
			if( selector instanceof Selector ) return selector;
			else if( selector === document || selector === window ) return Selector;
			else if( selector !== __root__ ) return new Selection(selector, criteria, single);
		}
	
		Selector.prototype = commons;
		var fns = Selection.prototype = new Selector(__root__);
		
		Selector.document = fns.document = document;	
		Selector.fn = commons;
		Selector.plugins = fns;
		Selector.plugins.$ = Selector;
		Selector.builder = SelectorBuilder;
		Selector.branch = function(doc) {
			return SelectorBuilder(doc);	
		};
		
		Selector.create = function() {
			var tmp = Selector(document.createElement('div'));
			var items = tmp.create.apply(tmp, arguments).owner(null);
			tmp = null;
			return items;
		};
	
		Selector.html = function(text) {
			return Selector.create('div').html(text).contents().owner(null);
		};
	
		Selector.text = function(text) {
			var el = document.createElement('div');
			el.innerText = text;
			return Selector(el).contents().owner(null);
		};
		
		Selector.ready = function(fn) {
			document.addEventListener('DOMContentLoaded', fn);
			return this;
		};
		
		Selector.util = SelectorBuilder.util;
		Selector.addon = SelectorBuilder.addon;
		Selector.on = SelectorBuilder.on;
		Selector.off = SelectorBuilder.off;
		
		return Selector;
	};
	
	SelectorBuilder.fn = commons;
	SelectorBuilder.on = function(type, fn, bubble) {
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

	SelectorBuilder.off = function(type, fn, bubble) {
		if( window.removeEventListener ) {
			window.removeEventListener(type, fn, ((bubble===true) ? true : false));
		} else {
			document.detachEvent('on' + type, fn, ((bubble===true) ? true : false));
		}
		return this;
	};

	SelectorBuilder.ready = function(fn) {
		return SelectorBuilder.on('DOMContentLoaded', fn);
	};
	
	SelectorBuilder.addon = {};
	SelectorBuilder.util = {
		merge: merge,
		data: data,
		isNode: isNode,
		match: match,
		isElement: isElement,
		isHtml: isHtml,
		isArrayType: isArrayType,
		evalHtml: evalHtml,
		accessor: accessor,
		assemble: assemble,
		array_return: array_return,
		resolve: resolve,
		matchPseudo: matchPseudo,
		stringify: stringify,
		isShowing: isShowing,
		computed: computed,
		boundary: boundary,
		camelcase: camelcase
	};
	
	// setup essential functions
	(function() {
		"use strict";
		
		var fn = commons;
		
		fn.refresh = function(selector, criteria, single) {			
			var document = this.document;
			if( isHtml(selector) ) selector = evalHtml(document, selector, true);
			this.clear();
			this.selector = selector = selector || [];
			if( criteria ) this.criteria = criteria;
			if( single === true ) this.single = single = true;
			if( typeof(selector) === 'string' ) {
				var items = [];
				
				if( criteria instanceof Commons ) {
					var self = this;
					criteria.each(function() {
						//console.log('selector', this, this.querySelectorAll(selector));	
						if( single && self.length > 0 ) return;
				
						if( single && this.querySelector ) self.push(this.querySelector(selector));
						else if( this.querySelectorAll ) merge.call(self, this.querySelectorAll(selector));
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
	
		fn.each = function(fn) {
			this.every(function(el) {
				return ( fn.call(el) === false ) ? false : true;
			});
			return this;
		};
	
		fn.add = merge;
	
		fn.remove = function(item, once) {
			if( typeof(item) === 'number' ) item = this[item];
			for(var index;(index = this.indexOf(item)) >= 0;) {
				this.splice(index, 1);
				if( once ) break;
			}
			return this;
		};	
	
		// define core functions
		fn.reverse = function() {
			Array.prototype.reverse.call(this);
			return this;
		};
	
		fn.clear = function() {
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
	
		fn.get = function(index) {
			return this[index];
		};
		
		fn.data = function(key, value) {
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
	
		fn.returns = function(o) {
			if( !arguments.length ) return;
			return o;
		};
	
		fn.arg = function(value) {
			if( !arguments.length ) return this.data('arg');
			this.data('arg', value);
			return this;
		};
	
		fn.owner = function(owner) {
			if( !arguments.length ) return this.__owner__;
		
			if( owner && !(owner instanceof Commons) ) return console.error('owner selection must be an Selector instance, but', owner);
			this.__owner__ = owner || null;
			return this;
		};
	
		fn.call = function(fn) {
			if( typeof(fn) !== 'function' ) return console.error('require function', fn);
			return this.each(function() {
				resolve.call(this, fn);
			});
		};
	
		fn.array = function() {
			return this.slice();	
		};
	
		fn.out = fn.end = function(step) {
			step = step || 1;
				
			var c = this;
			var last = c;
			var cnt = 0;
			for(;(c = (c.owner && c.owner()));) {
				cnt++;
				if( c ) last = c;
				if( typeof(step) === 'number' && step === cnt ) return last;
				else if( typeof(step) === 'string' && last.is(step) ) return last;
			
				if( cnt > 100 ) return console.error('so many out', this);
			}
		
			return console.error('can not found parent:' + (step || ''));
		};
	})();

	// setup core functions
	(function() {
		"use strict";
	
		var fn = commons;
	
		function findChild(method, selector, arr) {
			if( typeof(selector) === 'number' ) {
				var c = this[method][selector];
				if( c ) arr.push(c);
			} else if( typeof(selector) === 'string' && !selector.startsWith('arg:') ) {	// find by selector
				var children = this[method];
				for(var i=0; i < children.length; i++) {
					var el = children[i];
					if( match(el, selector) ) arr.push(el);
				}
			} else if( selector ) {	// find by element's arg data
				if( selector.startsWith('arg:') ) selector = selector.substring(4);
				var children = this[method];
				for(var i=0; i < children.length; i++) {
					var el = children[i];
					if( data.call(el, 'arg') === selector ) arr.push(el);
				}
			} else {	// all children
				merge.call(arr, this[method]);	
			}
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
			var key = arg[0];
			var value = arg[1];
		
			if( typeof(key) !== 'string' ) return console.error('invalid key', key);
			
			if( arg.length === 1 ) {
				var arr = [];
				this.each(function() {
					if( isElement(this) ) arr.push(this.getAttribute(key));
					else arr.push(null);
				});
				return array_return(arr);
			}
		
			return this.each(function() {
				if( !isElement(this) ) return;
				var v = resolve.call(this, value);
				if( v === null || v === undefined ) this.removeAttribute(key);
				else this.setAttribute(key, (v + ''));
			});
		}	
	
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
	
		fn.checked = function(checked) {
			checked = ( checked === true ) ? true : false;
			return type1.call(this, 'checked', arguments);
		};
	
		fn.check = function() {
			return this.each(function() {
				this.checked = true;	
			});
		};
	
		fn.uncheck = function() {
			return this.each(function() {
				this.checked = false;	
			});
		};
	
		fn.selected = function(selected) {
			selected = ( selected === true ) ? true : false;
			return type1.call(this, 'selected', arguments);
		};
	
		fn.select = function() {
			return this.each(function() {
				this.selected = true;	
			});
		};
	
		fn.unselect = function() {
			return this.each(function() {
				this.selected = false;	
			});
		};
	
		fn.name = function(name) {
			if( !arguments.length ) return this.attr('name');
			return this.attr('name', name);
		};
	
		fn.attr = function() {
			return type2.call(this, arguments);
		};
	
		fn.attrs = function(attrs) {
			if( !arguments.length ) {
				var arr = [];
				this.each(function() {
					var attrs = this.attributes;
					if( !attrs ) return arr.push([]);
					var o = {}; 
					for(var i= attrs.length-1; i>=0; i--) {
						o[attrs[i].name] = attrs[i].value;
					}

					arr.push(o);
				});			
				return array_return(arr);
			}
		
			if( typeof(attrs) !== 'object' ) return console.error('attrs must be an object', attrs);
			for(var k in attrs) this.attr(k, attrs[k]);
			return this;
		};
	
		// contents handling
		fn.text = function(value) {
			return type1.call(this, 'innerText', arguments);
		};
	
		fn.html = function(value) {
			if( !arguments.length ) {
				var arr = [];
				this.each(function() {
					arr.push(this.innerHTML);
				});
				return array_return(arr);
			}
		
			if( !isArrayType(value) ) value = [value];
			
			var document = this.document;
			var $ = this.$;
			return this.each(function() {
				this.innerHTML = '';
				for(var i=0; i < value.length;i++) {
					var v = resolve.call(this, value[i]);
				
					if( !v ) continue;
					else if( isNode(v) && v.nodeName === '#text' && !v.nodeValue ) continue;
					else if( isNode(v) ) this.appendChild(v);
					else if( isHtml(v) ) $(this).append($.create(v));
					else this.appendChild(document.createTextNode(v + ''));
				}
			});
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
		fn.css = function(key, value) {
			if( !arguments.length ) {
				var styles = this.style();
			
				if( !Array.isArray(styles) ) styles = [styles];
				var arr = [];
				for(var i=0; i < styles.length; i++) {
					arr.push(styles[i].get());
				}
				return array_return(arr);
			}
		
			return this.style.apply(this, arguments);
		};
	
		fn.style = function(key, value) {		
			if( !arguments.length ) {
				var arr = [];
				this.each(function() {
					arr.push(new StyleSession(this));
				});
				return array_return(arr);
			}
		
			if( typeof(key) === 'object' ) {
				return this.each(function() {
					new StyleSession(this).set(key).commit();
				});
			} else if( arguments.length === 1 ) {
				if( key === false ) {
					return this.each(function() {
						new StyleSession(this).clear().commit();
					});
				} else if( typeof(key) === 'string' && ~key.indexOf(':') ) {
					return this.each(function() {
						new StyleSession(this).text(key).commit();
					});
				} else if( typeof(key) === 'string' ) {
					var arr = [];
					this.each(function() {
						arr.push(new StyleSession(this).get(key));
					});
					return array_return(arr);
				} else {
					return console.error('illegal key', key);
				}
			}
		
			return this.each(function() {
				var v = resolve.call(this, value);
				new StyleSession(this).set(key, v).commit();
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
				return array_return(arr);
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
						var c = classes[i];
						if( c ) {
							if( !flag && ~args.indexOf(c) ) args.splice(args.indexOf(c), 1);
							else if( flag && !~args.indexOf(c) ) args.push(c);
						}
					}

					el.className = args.join(' ').trim();
				} else {
					el.className = '';
					el.removeAttribute('class');
					if( Array.isArray(classes) ) classes = classes.join(' ').trim();
					if( classes ) el.className = classes.trim();
				}
			});
		};	
	
		fn.ac = fn.addClass = function(s) {
			return this.classes(s, true);
		};
		
		fn.has = fn.hasClass = function(s) {
			if( !s || typeof(s) !== 'string' ) return s;
			s = s.split(' ');
		
			var hasnot = false;
			this.each(function() {
				for(var i=0; i < s.length; i++) {
					var cls = s[i];
					if( !cls || !~this.className.split(' ').indexOf(cls) ) hasnot = true;
				}
			});
		
			return !hasnot;
		};
	
		fn.is = function(s) {
			if( !s || typeof(s) !== 'string' ) return false;
			var hasnot = false;
			this.each(function() {
				if( !match(this, s) ) hasnot = true;
			});
		
			return !hasnot;
		};
	
		fn.not = function(s) {
			return !this.is(s);
		};
	
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
			return this.$(arr).owner(this);
		};
	
		fn.all = function(includeself) {
			if( includeself === true ) return this.$(this).add(this.$('*', this)).owner(this);
			return this.$('*', this).owner(this);
		};
	
		fn.find = function(selector) {
			if( !arguments.length ) selector = '*';
			return this.$(selector, this).owner(this);
		};
	
		fn.one = function(selector) {
			if( !arguments.length ) selector = '*';
			return this.$(selector, this, true).owner(this);
		};
	
		fn.children = function(selector) {
			var arr = [];
			this.each(function() {
				findChild.call(this, 'children', selector, arr);
			});
			return this.$(arr).owner(this);
		};
	
		fn.contents = function(selector) {
			var arr = [];
			this.each(function() {
				findChild.call(this, 'childNodes', selector, arr);
			});
			return this.$(arr).owner(this);	
		};
	
		fn.filter = fn.except = function(fn) {
			return this.subset(fn, false);
		};
	
		fn.subset = function(selector, positive) {
			var items = [];
		
			positive = (positive === false) ? false : true;
		
			var fn = selector;
			if( typeof(selector) === 'string' ) {
				fn = function() {
					return match(this, selector);
				}
			}
		
			this.each(function() {
				var result = fn.apply(this, arguments);
				if( positive ) {
					if( result === true ) items.push(this);
				} else {
					if( result !== true ) items.push(this);
				}			
			});
			return this.$(items).owner(this);
		};
	
		fn.visitup = function(visitor, containSelf) {
			if( typeof(visitor) !== 'function' ) return console.error('visitor must be a function');
		
			containSelf = (containSelf === true) ? true : false;
		
			return this.each(function() {			
				if( containSelf && visitor.call(this) === false ) return false;
	
				var propagation = function(el) {
					var p = el.parentNode;
					if( p ) {
						if( visitor.call(p) !== false ) {
							propagation(p);
						} else {
							return false;
						}
					}
				};

				return propagation(this);
			});
		};
	
		fn.visit = function(visitor, containSelf, allcontents) {
			if( typeof(visitor) !== 'function' ) return console.error('visitor must be a function');
		
			containSelf = (containSelf === true) ? true : false;
			allcontents = (allcontents === true) ? true : false;
			
			var $ = this.$;
			return this.each(function() {			
				if( containSelf && visitor.call(this) === false ) return false;
	
				var propagation = function(el) {
					var argc = $((allcontents) ? el.childNodes : el.children);
					argc.each(function() {
						if( visitor.call(this) !== false ) {
							propagation(this);
						} else {
							return false;
						}
					});
				};

				return propagation(this);
			});
		};
	
		fn.contains = function(child) {
			var contains = false;
			this.each(function() {
				var self = this;
				// TODO: 교집합을 구하는 것으로 수정해야 한다. child 가 모두 포함되어 있어야 contains 로 인정
				if( child instanceof Commons ) return child.each(function() {
					if( self !== this && self.contains(this) ) contains = true;
				});

				if( typeof(child) === 'string' ) child = this.querySelector(child);
				if( this !== child && this.contains(child) ) contains = true;
			});		
			return contains;
		};
	
		fn.first = function() {
			return this.$(this[0]).owner(this);
		};
	
		fn.last = function() {
			return this.$(this[this.length - 1]).owner(this);
		};
	
		fn.at = function(index) {
			return this.$(this[index]).owner(this);
		};
		
		// creation
		fn.clone = function(args) {
			if( !args ) args = [null];
			if( typeof(args) === 'number') args = new Array(args);
			if( args && typeof(args.length) !== 'number' ) args = [args];
			
			var $ = this.$;
			var arr = [];
			this.each(function() {
				for(var i=0, len=args.length; i < len; i++) {
					var el = this.cloneNode(true);				
					$(el).data('arg', args[i]).save('#create');
					arr.push(el);
				}
			});
			return $(arr).owner(this);
		};
	
		fn.create = function(accessor, args, fn) {
			if( typeof(accessor) !== 'string' ) return console.error('invalid accessor', accessor);
		
			if( arguments.length === 2 && typeof(args) === 'function' ) {
				fn = args;
				args = [null];
			} else if( arguments.length === 1 ) {
				args = [null];
			} else if( !args ) {
				args = [];
			}
		
			if( typeof(args) === 'number') args = new Array(args);
			if( typeof(args) === 'string') args = [args];
			if( args && typeof(args.length) !== 'number' ) args = [args];
		
			var arr = [];
			var document = this.document;
			var $ = this.$;
			
			function create(accessor, contents, force) {
				if( !accessor || typeof(accessor) !== 'string' ) return console.error('invalid parameter', accessor);
	
				var el;
				if( force === true || isHtml(accessor) ) {
					el = $(evalHtml(document, accessor, true));
					if( !el.length ) return null;
					if( contents ) el.html(contents);
					return array_return(el.array());
				} else {
					var o = assemble(accessor);
					var tag = o.tag;
					var classes = o.classes;
					var id = o.id;
		
					if( !tag ) return console.error('invalid parameter', accessor);
	
					el = document.createElement(tag);
					if( id ) el.id = id;
					if( classes ) el.className = classes;
				}
	
				if( typeof(contents) === 'function' ) contents = contents.call(el);
	
				if( typeof(contents) === 'string' ) el.innerHTML = contents;
				else if( isElement(contents) ) el.appendChild(contents);
				else if( contents instanceof Commons ) contents.appendTo(el);
	
				return el;
			}
			
			this.each(function() {
				for(var i=0, len=args.length; i < len; i++) {
					var el = $(create(accessor));				
					$(this).append(el);
					el.data('arg', args[i]).save('#create');
				
					el.each(function() {
						arr.push(this);
					});
				}
			});
		
			return $(arr).owner(this);
		};
	
		fn.save = function(name) {
			return this.each(function() {
				var attrs = this.attributes;
				if( !attrs ) return;
				var o = {};
				for(var i= attrs.length-1; i>=0; i--) {
					o[attrs[i].name] = attrs[i].value;
				}
			
				var o = {
					html: this.innerHTML,
					attrs: o
				};
			
				data.call(this, 'save.' + name, o);
				data.call(this, 'save.#last', o);
			});
		};
	
		fn.restore = function(name) {
			return this.each(function() {
				var saved = name ? data.call(this, 'save.' + name) : data.call(this, 'save.#last');
			
				if( !saved ) return ~name.indexOf('#') ? null : console.warn('no saved status', name || '');			
				this.innerHTML = saved.html || '';
			
				// remove current attributes
				var attrs = this.attributes;
				for(var i= attrs.length-1; i>=0; i--) {
					this.removeAttribute(attrs[i].name);
				}
			
				attrs = saved.attrs;
				for(var k in attrs) {
					this.setAttribute(k, attrs[k]);
				}
			});
		};
	
		fn.append = function(items) {
			if( !items ) return console.error('items was null', items);
				
			var $ = this.$;
			return this.each(function() {
				var els = resolve.call(this, items);
			
				if( !(els instanceof Commons) ) els = $(els);
			
				var target = this;
				els.each(function() {
					if( this.nodeName === '#text' && !this.nodeValue ) return;
					target.appendChild(this);
				});
			});
		};
	
		fn.prepend = function(items) {
			if( !items ) return console.error('items was null', items);
			
			var $ = this.$;
			return this.each(function() {
				var els = resolve.call(this, items);
			
				if( !(els instanceof Commons) ) els = $(els);
			
				var target = this;
				els.each(function() {
					if( this.nodeName === '#text' && !this.nodeValue ) return;
					if( target.childNodes.length ) target.insertBefore(this, target.childNodes[0]);
					else target.appendChild(this);
				});
			});		
		};
	
		fn.before = fn.insertBefore = function(items) {
			if( !items ) return console.error('items was null', items);
			
			var $ = this.$;
			return this.each(function() {
				var els = resolve.call(this, items);
			
				if( !(els instanceof Commons) ) els = $(els);
			
				var target = this.parentNode;
				var before = this;
				if( target ) {
					els.each(function() {
						if( this.nodeName === '#text' && !this.nodeValue ) return;
						//console.error('before', this, before, target);
						target.insertBefore(this, before);
					});
				}
			});
		};
	
		fn.after = fn.insertAfter = function(items) {
			if( !items ) return console.error('items was null', items);
			
			var $ = this.$;
			return this.each(function() {
				var els = resolve.call(this, items);
			
				if( !(els instanceof Commons) ) els = $(els);
			
				var target = this.parentNode;
				if( target ) {
					var before = this.nextSibling; //;target.children[target.children.indexOf(this) + 1];
					els.each(function() {
						if( this.nodeName === '#text' && !this.nodeValue ) return;
						if( before ) target.insertBefore(this, before);
						else target.appendChild(this);
					});
				}
			});
		};
	
		fn.appendTo = function(target) {			
			var $ = this.$;
			return this.each(function() {
				var dest = resolve.call(this, target);
			
				if( typeof(dest) === 'string' ) dest = $(dest);
				if( dest instanceof Commons ) dest = dest[dest.length - 1];
			
				if( this.nodeName === '#text' && !this.nodeValue ) return;
				if( dest ) dest.appendChild(this);
			});
		};
	
		fn.prependTo = function(target) {			
			var $ = this.$;
			return this.each(function() {
				var dest = resolve.call(this, target);
			
				if( typeof(dest) === 'string' ) dest = $(dest);
				if( dest instanceof Commons ) dest = dest[dest.length - 1];
			
				if( this.nodeName === '#text' && !this.nodeValue ) return;
				if( dest.childNodes.length ) dest.insertBefore(this, dest.childNodes[0]);
				else dest.appendChild(this);
			});
		};
	
		fn.detach = function() {
			return this.each(function() {
				var p = this.parentNode;
				if( p ) p.removeChild(this);
			});
		};
	
		fn.unwrap = function() {
			return this.each(function() {
				var p = this.parentNode;
				if( !p ) return;
			
				var nodes = p.childNodes;
				var argc = [];
				if( nodes ) for(var a=0; a < nodes.length;a++) argc.push(nodes[a]);

				if( argc ) {
					if( p.parentNode ) {
						for(var a=0; a < argc.length;a++) {
							p.parentNode.insertBefore(argc[a], p);
						}
						p.parentNode.removeChild(p);
					}
				}
			});
		};
	
		fn.wrap = function(accessor) {
			var el = this.$.create(accessor)[0];
			if( !isElement(el) ) return console.error('invalid accessor or html', accessor);
				
			var arr = [];
			var $ = this.$;
			this.each(function() {
				var p = this.parentNode;
				var newp = $(el).clone()[0];
				if( p ) p.insertBefore(newp, this);
				newp.appendChild(this);
				arr.push(newp);
			});		
			return $(arr).owner(this);
		};
	
	
		// events
		fn.on = function(types, fn, capture) {
			if( typeof(types) !== 'string' ) return console.error('invalid event type', types);
			if( typeof(fn) !== 'function' ) return console.error('invalid fn', fn);
	
			capture = (capture===true) ? true : false;
			types = types.split(' ');
	
			return this.each(function() {
				var el = this;
		
				for(var i=0; i < types.length; i++) {
					var type = types[i];
			
					if( el.addEventListener ) {
						el.addEventListener(type, fn, capture);

						if( type.toLowerCase() == 'transitionend' ) {
							el.addEventListener('webkitTransitionEnd', fn, capture);
						}
					} else if( el.attachEvent ) {
						el.attachEvent('on' + type, fn);
					}
				}			
			});
		};
	

		fn.off = function(types, fn, capture) {
			if( typeof(types) !== 'string' ) return console.error('invalid event type', types);
			if( typeof(fn) !== 'function' ) return console.error('invalid fn', fn);
	
			capture = (capture===true) ? true : false;
			types = types.split(' ');
	
			return this.each(function() {			
				var el = this;
		
				for(var i=0; i < types.length; i++) {
					var type = types[i];
			
					if( el.removeEventListener ) {
						el.removeEventListener(type, fn, capture);

						if( type.toLowerCase() == 'transitionend' )
							el.removeEventListener('webkitTransitionEnd', fn, capture);
					} else if( el.attachEvent ) {
						el.detachEvent('on' + type, fn);
					}
				}
			});
		};

		fn.fire = function(types, values) {
			if( !types ) return console.error('invalid event type:', types);
	
			values = values || {};
			types = types.split(' ');
			
			var document = this.document;
			return this.each(function() {
				var e, el = this;
		
				for(var i=0; i < types.length; i++) {
					var type = types[i];
			
					// eventName, bubbles, cancelable
					if( document.createEvent ) {
						e = document.createEvent('Event');
						e.initEvent(type, ((values.bubbles===true) ? true : false), ((values.cancelable===true) ? true : false));
					} else if( document.createEventObject ) {
						e = document.createEventObject();
					} else {
						return console.error('this browser does not supports manual dom event fires');
					}
	
					for(var k in values) {
						if( !values.hasOwnProperty(k) ) continue;
						var v = values[k];
						try {
							e[k] = v;
						} catch(err) {
							console.error('[WARN] illegal event value', e, k);
						}
					}
					e.values = values;
					e.src = this;

					if( el.dispatchEvent ) {
						el.dispatchEvent(e);
					} else {
						e.cancelBubble = ((values.bubbles===true) ? true : false);
						el.fireEvent('on' + type, e );
					}
				}
			});
		};
	
	
		// view handling
		fn.hide = function(options, fn) {
			var self = this;
			var $ = this.$;
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
	
		fn.invisible = function(options, fn) {
			var self = this;
			var $ = this.$;
			var internal = function() {
				self.each(function() {
					this.style.visibility = 'hidden';
					$(this).fire('invisible');
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
			var $ = this.$;
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
		
	
		// status
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
	
	
		// size & position
		fn.boundary = function() {
			var arr = [];
			this.each(function() {
				arr.push(boundary(this));
			});
			return array_return(arr);
		};
	
	
		// misc
		fn.bg = function(bg) {
			var $ = this.$;
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
			var $ = this.$;
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
	
		// for comfortable use
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
	
		fn.width = function(width) {
			if( !arguments.length ) return type1.call(this, 'offsetWidth', arguments);		
			return this.style.call(this, 'width', width);
		};
	
		fn.height = function(height) {
			if( !arguments.length ) return type1.call(this, 'offsetHeight', arguments);		
			return this.style.call(this, 'height', height);
		};
	
		(function() {
			var type_prop = [
				'offsetWidth', 'offsetHeight', 'clientWidth', 'clientHeight', 'scrollWidth', 'scrollHeight'
			];
		
			var type_style = [
				'border', 'color', 'margin', 'padding', 'min-width', 'max-width', 'min-height', 'max-height',
				'flex', 'float', 'opacity', 'z-index'
			];
		
			type_prop.forEach(function(name) {
				fn[name] = fn[name] || (function(name) {
					return function() {
						return type1.call(this, name, arguments);
					};
				})(name);
			});
		
			type_style.forEach(function(name) {
				var cname = camelcase(name);
				fn[cname] = fn[cname] || (function(name) {
					return function(value) {
						var args = [name];
						if( arguments.length ) args.push(value);
						return this.style.apply(this, args);
					};
				})(name);
			});
		})();
	})();
	
	return SelectorBuilder;
})();
