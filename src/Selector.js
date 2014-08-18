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
	
	// instantiatable NodeList
	function XNodeList(array) {
		for(var i=0; i < array.length;i++) {
			this[i] = array[i];
		}
		
		if( Object.defineProperty ) {
			Object.defineProperty(this, 'length', {
				enumerable: false,
				configurable: false,
				writable: false,
				value: array.length
			});
		}
		
		this.length = array.length;
	}
	XNodeList.prototype = document.querySelectorAll('.sulmairungeisslriga') || [];
	XNodeList.prototype.item = function(index) {
		return this[index];
	};
	
	if( !window.NodeList ) window.NodeList = XNodeList;
	

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
		
		if( !isElement(el) && isNode(el) ) {
			return ( el.nodeName === accessor );
		}
		
		if( typeof(el) === 'string' ) {
			var a = assemble(el);
			el = {
				tagName: a.tag,
				className: a.classes,
				id: a.id
			};
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
	
	function normalizeContentType(mimeType, url) {
		if( mimeType && typeof(mimeType) === 'string' ) {
			mimeType = mimeType.split(';')[0];
		
			if( ~mimeType.indexOf('javascript') ) return 'js';
			else if( ~mimeType.indexOf('html') ) return 'html';
			else if( ~mimeType.indexOf('json') ) return 'json';
			else if( ~mimeType.indexOf('xml') ) return 'xml';
			else if( ~mimeType.indexOf('css') ) return 'css';
			else return mimeType;
		} else if( url && typeof(url) === 'string' ) {
			var ext = Path.ext(url).toLowerCase();
			if( ext === 'htm') return 'html';
			else return ext;
		} else {
			return console.error('illegal parameter', mimeType, url);
		}
	}	

	function wrappingstringevent(script) {
		return function(e) {
			return eval(script);
		};
	}
	
	function evaljson(script) {
		var fn;
		eval('fn = function() { return ' + script + ';}');
		return fn();
	}

	function mixselector(baseAccessor, selector) {
		// base accessor : .app-x.application
		// selector : div#id.a.b.c[name="name"]
		// result = div#id.app-x.application.a.b.c[name="name"]			
		selector = selector || '*';
		if( selector === '*' ) return baseAccessor;
		else if( !~selector.indexOf('.') ) return selector + baseAccessor;
	
		var h = selector.substring(0, selector.indexOf('.'));
		var t = selector.substring(selector.indexOf('.'));
		return h + baseAccessor + t;
	}
	
	function findChild(method, selector) {
		var arr = [];
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
		return arr;
	}
	
	var Commons = function Commons() {};
	Commons.prototype = new Array();
	var commons = new Commons();
	
	var Selectors = [];
	// build selector
	var SelectorBuilder = function(document, root) {
		"use strict";
		
		if( !document || document.nodeType !== 9 ) return console.error('illegal arguments', document, root);
	
		function Selection(selector, criteria, single) {
			this.length = 0;
			this.refresh.apply(this, arguments);
		}
	
		var __root__ = {};
		function Selector(selector, criteria, single) {
			if( !arguments.length || selector === ':root' ) selector = Selector.root;
			
			if( selector && selector.nodeType === 9 ) return SelectorBuilder(selector);
			else if( selector === document || selector === window ) return Selector;
			else if( selector !== __root__ ) return new Selection(selector, criteria, single);
		}
	
		Selector.prototype = commons;
		var fns = Selection.prototype = new Selector(__root__);
		
		Selector.document = fns.document = document;
		Selector.root = fns.root = root || document.documentElement;
		Selector.fn = commons;
		Selector.plugins = fns;
		Selector.plugins.$ = Selector;
		Selector.builder = SelectorBuilder;
		Selector.branch = function(doc) {
			if( !doc ) return console.error('illegal arguments', doc);	
			if( doc && doc.nodeType === 9 ) return SelectorBuilder(doc);
			
			if( typeof(doc) === 'string' ) {
				var els = document.querySelectorAll(doc);
				if( doc.length === 1 && isElement(doc[0]) ) doc = doc[0];
				else doc = $(doc);
			}
			
			if( isElement(doc) ) {
				return SelectorBuilder(doc.ownerDocument, doc);
			} else if( doc instanceof Commons ) {
				return SelectorBuilder(document, doc);
			} else {
				return console.error('illegal argument', doc);
			}
		};
		
		Selector.current = function() {
			return SelectorBuilder((document.currentScript && document.currentScript.ownerDocument) || document)
		};
		
		Selector.create = function() {
			var tmp = Selector(document.createDocumentFragment());
			var items = tmp.create.apply(tmp, arguments).owner(null);
			return items;
		};
	
		Selector.html = function(text) {
			return Selector.create('div').html(text).contents().owner(null);
		};
	
		Selector.text = function(text) {
			var el = document.createElement('p');
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
		
		var staticfn = SelectorBuilder.staticfn;
		for(var k in staticfn) {
			Selector[k] = staticfn[k];
		}
		
		Selectors.push(Selector);
		return Selector;
	};
	
	SelectorBuilder.fn = commons;
	SelectorBuilder.on = function(type, fn, bubble) {
		window.addEventListener(type, fn, ((bubble===true) ? true : false));
		return this;
	};

	SelectorBuilder.off = function(type, fn, bubble) {
		window.removeEventListener(type, fn, ((bubble===true) ? true : false));
		return this;
	};

	SelectorBuilder.ready = function(fn) {
		document.addEventListener('DOMContentLoaded', fn);
		return this;
	};
	
	// want use $.fn
	SelectorBuilder.staticfn = {
		refresh: function() {
			var staticfn = SelectorBuilder.staticfn;
			Selectors.forEach(function($) {
				for(var k in staticfn) {
					$[k] = staticfn[k];
				}	
			});
		}
	};
	
	// sub addon classes, $.addon.fn
	SelectorBuilder.addon = {};
	
	// util, $.util.fn
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
		camelcase: camelcase,
		normalizeContentType: normalizeContentType,
		mixselector: mixselector,
		evaljson: evaljson,
		wrappingstringevent: wrappingstringevent,
		findChild: findChild
	};
	
	// setup essential functions
	(function() {
		"use strict";
		
		var fn = commons;
				
		fn.refresh = function(selector, criteria, single) {			
			var document = this.document;
			var root = this.root;
			this.clear();
			this.selector = selector = selector || [];
			if( criteria ) this.criteria = criteria;
			if( single === true ) this.single = single = true;
			
			if( isHtml(selector) ) {
				selector = evalHtml(document, selector, true);
				merge.call(this, selector);
			} else if( typeof(selector) === 'string' ) {
				var items = [];
				
				if( criteria instanceof Commons ) {
					var self = this;
					criteria.each(function() {
						//console.log('selector', this, this.querySelectorAll(selector));	
						if( single && self.length > 0 ) return false;
				
						if( single && this.querySelector ) self.push(this.querySelector(selector));
						else if( this.querySelectorAll ) merge.call(self, this.querySelectorAll(selector));
					});
				} else {
					if( single ) merge.call(this, (criteria || root).querySelector(selector));
					else merge.call(this, (criteria || root).querySelectorAll(selector));
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
			var $ = this.$;
			return this.each(function() {
				//var v = resolve.call(this, value);
				var oldValue = data.call(this, key);
				data.call(this, key, value);
				
				$(this).fire('data', {
					key: key,
					value: value,
					oldValue: oldValue
				});
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
		
		fn.tag = function() {
			var arr = [];
			this.each(function() {
				var tag = this.tagName && this.tagName.toLowerCase();	
				arr.push(tag);
			});
			return array_return(arr);
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
				
				$(this).fire('selected');
			});
		};
	
		fn.deselect = function() {
			return this.each(function() {
				this.selected = false;
				
				$(this).fire('deselected');
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
		
		fn.outer = function(value) {
			return type1.call(this, 'outerHTML', arguments);
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
		
		fn.hc = fn.hasClass = function(s) {
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
		
		// evaluation
		fn.is = function(selector, or) {
			if( !selector || typeof(selector) !== 'string' ) return false;
			
			var selectors = selector.split(',');
			if( !this.length || !selectors.length ) return false;
				
			if( or === true ) {
				var isnt = false;
				this.each(function() {
					var contains = false;
					for(var i=0; i < selectors.length;i++) {
						var s = selectors[i].trim();
						if( s && match(this, selectors[i].trim()) ) contains = true;
					}
					
					if( contains === false ) isnt = true;
				});
				return !isnt;
			} else {
				var isnt = false;
				this.each(function() {
					for(var i=0; i < selectors.length;i++) {
						var s = selectors[i].trim();
						if( !s || !match(this, selectors[i].trim()) ) isnt = true;
					}
				});
				return !isnt;
			}
			
			return false;
		};
	
		fn.not = function(selector) {
			return !this.is(selector);
		};
		
		fn.contains = function(child) {
			if( !child ) return false;
			
			var contains = false;
			if( typeof(child) === 'string' ) {
				var has = false;
				var selectors = child.split(',');
				this.each(function() {
					for(var i=0; i < selectors.length;i++) {
						var s = selectors[i].trim();
						if( s && match(this, s) ) {
							has = true;
							return false;
						}
					}
				});		
				return has;
			} else if( isNode(child) ) {
				this.each(function() {
					if( this === child ) contains = true;
				});
			} else if( child instanceof Commons ) {
				this.each(function() {
					// TODO: 미구현
				});
			}
			
			return contains;
		};
		
		fn.hasChild = function(child) {
			if( !child ) return false;
						
			var contains = false;
			this.each(function() {
				if( typeof(child) === 'string' ) {
					var result = this.querySelector(child);
					if( result ) contains = true;
				}
				
				if( this.contains && this.contains(child) ) contains = true;
			});
			
			return contains;
		};
	
		// find parent & children
		fn.parent = function(cnt) {
			var arr = [];
			this.each(function() {
				if( !isNode(this) ) return;
				
				var p = this.parentNode;
				if( !p ) return;		
				arr.push(p.__host__ || p);
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
		
		fn.querySelectorAll = function(selector) {
			var arr = [];
			this.each(function() {
				if( $(this).is(selector, true) ) arr.push(this);
				var result = this.querySelectorAll(selector);
				if( result ) {
					for(var i=0; i < result.length;i++) {
						arr.push(result[i]);
					}
				}
			});
			
			return new XNodeList(arr);
		};
		
		fn.querySelector = function(selector) {
			var arr = [];
			this.each(function() {
				if( $(this).is(selector) ) {
					arr.push(this);
					return false;
				}
				var result = this.querySelector(selector);
				if( result ) {
					arr.push(result);
					return false;
				}
			});
			
			return arr[0];
		};
	
		fn.children = function(selector) {
			var arr = this.$([]).owner(this);
			this.each(function() {
				if( !isElement(this) ) return;
				
				var shadow = data.call(this, 'shadow');
				if( shadow ) arr.add(shadow.children());
				else arr.add(findChild.call(this, 'children', selector));
			});
			return arr;
		};
	
		fn.contents = function(newcontents) {
			if( !arguments.length ) {
				var arr = this.$([]).owner(this);
				this.each(function() {
					if( !isElement(this) ) return;
					
					var shadow = data.call(this, 'shadow');
					if( shadow ) arr.add(shadow.contents());
					else arr.add(this.childNodes);
				});
				return arr;
			}
			
			return this.html(newcontents);
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
	
		fn.first = function() {
			return this.$(this[0]).owner(this);
		};
	
		fn.last = function() {
			return this.$(this[this.length - 1]).owner(this);
		};
	
		fn.at = function(index) {
			return this.$(this[index]).owner(this);
		};
		
		// save & restore
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
		
		fn.update = function(accessor, args, fn) {
			var result = this.find(accessor);
			if( !result.length ) return this.create.apply(this, arguments);
			
			var nothing = {};
			if( !args ) args = [nothing];
			
			var arr = [];
			if( isArrayType(args) ) {
				for(var i=0; i < args.length; i++) {
					var el = result[i];
					if( isElement(el) ) {
						if( args[i] !== nothing ) $(el).arg(args[i]);
						arr.push(el);
						if( typeof(fn) === 'function' ) fn.call(this, $(el).arg());
					}
				}
			}
			return $(arr).owner(this);			
		};
	
		fn.create = function(accessor, args, fn) {
			if( typeof(accessor) !== 'string' ) return console.error('invalid accessor', accessor);
		
			if( arguments.length === 2 && typeof(args) === 'function' ) {
				fn = args;
				args = [null];
			}
			
			if( !args ) args = [null];
		
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
					
					if( typeof(fn) === 'function' ) fn.call(this, el.arg());
				}
			});
		
			return $(arr).owner(this);
		};
		
		// contents
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
				var el = $(this);
				el.empty();
				for(var i=0; i < value.length;i++) {
					var v = resolve.call(this, value[i]);
				
					if( !v ) continue;
					else if( isNode(v) && v.nodeName === '#text' && !v.nodeValue ) continue;
					else if( isNode(v) ) el.append(v);
					else if( isHtml(v) ) el.append($.create(v));
					else el.append(document.createTextNode(v + ''));
				}
			});
		};
	
		fn.empty = function() {
			return this.each(function() {
				var shadow = data.call(this, 'shadow');
				if( shadow ) shadow.empty();
				else this.innerHTML = '';
			});
		};
		
		// shadow
		function Shadow(host, template) {
			this.host = host;
			this.template = template;
			
			template.all(true).each(function() {
				this.__host__ = host[0];
			});
			
			var contents = host.contents().detach();
			host.append(template);
			this.append(contents);
		}
		Shadow.prototype = {
			dom: function() {
				return this.template;
			},
			children: function(selector) {
				var arr = this.host.$([]);
				this.slots().each(function() {
					if( !isElement(this) ) return;
			
					arr.add(findChild.call(this, 'children', selector));
				});
				return arr;
			},
			contents: function(newcontents) {
				if( !arguments.length ) {
					var arr = this.host.$([]);
					this.slots().each(function() {
						if( !isElement(this) ) return;
				
						arr.add(this.childNodes);
					});
					return arr;
				}
		
				return this.host.html(newcontents);
			},
			prepend: function(contents) {
				if( !contents ) return this; 
				if( !(contents instanceof Commons) ) contents = $(contents);
				
				var $ = this.host.$;
				var self = this;
				contents.each(function() {
					if( !isNode(this) ) return;
					
					var slot = self.slot(this);
					if( slot ) $(slot).prepend(this);
				});
				return this;
			},
			empty: function() {
				this.slots().each(function() {
					this.innerHTML = '';	
				});
				return this;
			},
			append: function(contents) {
				if( !contents ) return this; 
				if( !(contents instanceof Commons) ) contents = $(contents);
				
				var $ = this.host.$;
				var self = this;
				contents.each(function() {
					if( !isNode(this) ) return;
					
					var slot = self.slot(this);
					if( slot ) $(slot).append(this);
				});
				return this;
			},
			slots: function() {
				return this.template.find('content');
			},
			slot: function(selector) {
				var argc = this.template.find('content');
				
				var slotany;
				var slot;
				argc.each(function() {
					var select = this.getAttribute('select');
					if( !select || select === '*' ) slotany = this;
					
					if( selector && select && match(selector, select) ) {
						slot = this;
						return false;
					}
				});
				return slot || slotany;
			}
		};
		
		fn.shadow = function(dom) {
			var $ = this.$;
			if( !arguments.length ) {
				var arr = [];
				this.each(function() {
					arr.push(data.call(this, 'shadow'));
				});
				return array_return(arr);
			}
			
			if( dom === null || dom === false ) {
				return this.each(function() {
					if( !isElement(this) ) return;
					
					var shadow = data.call(this, 'shadow');
					data.call(this, 'shadow', null);
					
					shadow.template.detach();
					var contents = shadow.contents();
					$(this).append(contents);
				});
			}
			
			if( typeof(dom) === 'string' || isNode(dom) ) dom = $(dom);			
			if( !(dom instanceof Commons) || !dom.length ) return this;
			
			if( dom.length === 1 ) {
				var el = dom[0];
				if( el.tagName && el.tagName.toLowerCase() === 'script' ) {
					var content = el.textContent || el.innerHTML || el.innerText || '';
					dom = $.html(content.trim());
				}
			}
			
			return this.each(function() {
				if( !isElement(this) ) return;
				
				var shadow = new Shadow($(this), dom.clone());
				data.call(this, 'shadow', shadow);
			});
		};
		
		// insertion
		fn.append = function(items) {
			if( !items ) return console.error('items was null', items);
				
			var $ = this.$;
			return this.each(function() {
				if( !isElement(this) ) return;
				
				var els = $(resolve.call(this, items));
								
				var shadow = data.call(this, 'shadow');				
				if( shadow ) {
					shadow.append(els);
				} else {
					var target = this;
					els.each(function() {
						if( !isNode(this) ) return;
						target.appendChild(this);
					});
				}
			});
		};
	
		fn.prepend = function(items) {
			if( !items ) return console.error('items was null', items);
			
			var $ = this.$;
			return this.each(function() {
				if( !isElement(this) ) return;
				
				var els = $(resolve.call(this, items));
				
				var shadow = data.call(this, 'shadow');				
				if( shadow ) {
					shadow.prepend(els);
				} else {
					var target = this;
					els.each(function() {
						if( !isNode(this) ) return;
						if( target.childNodes.length ) target.insertBefore(this, target.childNodes[0]);
						else target.appendChild(this);
					});
				}
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
				if( dest ) $(dest).append(this);
			});
		};
	
		fn.prependTo = function(target) {			
			var $ = this.$;
			return this.each(function() {
				var dest = resolve.call(this, target);
			
				if( typeof(dest) === 'string' ) dest = $(dest);
				if( dest instanceof Commons ) dest = dest[dest.length - 1];
			
				if( this.nodeName === '#text' && !this.nodeValue ) return;
				if( dest ) $(dest).prepend(this);
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
		var mutationevents = ['attributes', 'added', 'removed', 'textdata', 'attached', 'detached', 'contents'];
		fn.on = function(types, fn, capture) {
			if( typeof(types) !== 'string' ) return console.error('invalid event type', types);
			if( typeof(fn) !== 'function' ) return console.error('invalid fn', fn);
	
			capture = (capture===true) ? true : false;
			types = types.split(' ');
			
			return this.each(function() {
				for(var i=0; i < types.length; i++) {
					var type = types[i];
					if( ~mutationevents.indexOf(type) ) $(this).mutationsupport();
					this.addEventListener(type, fn, capture);
				}
			});
		};
	
		fn.off = function(types, fn, capture) {
			if( typeof(types) !== 'string' ) return console.error('invalid event type', types);
			if( typeof(fn) !== 'function' ) return console.error('invalid fn', fn);
	
			capture = (capture===true) ? true : false;
			types = types.split(' ');
	
			return this.each(function() {
				for(var i=0; i < types.length; i++) {
					this.removeEventListener(types[i], fn, capture);
				}
			});
		};
		
		fn.firethru = function() {
			this.fire.apply(this, arguments);			
			return this;
		};
		
		fn.fire = function(types, values, options) {
			if( !types ) return console.error('invalid event type:', types);
	
			values = values;
			options = options || {};
			types = types.split(' ');
			
			if( values ) options.detail = values;
			
			var arge = [];
			var document = this.document;
			this.each(function() {
				var e, el = this;
		
				for(var i=0; i < types.length; i++) {
					var type = types[i];
					
					if( window.Event && values instanceof Event ) {
						e = values;
					} else if( window.CustomEvent ) {
						e = new CustomEvent(type, options);
					} else {
						if( document.createEvent ) {
							e = document.createEvent(options.eventType || 'Event');
							e.initEvent(type, options.bubbles, options.cancelable);
						} else {
							return console.error('this browser does not supports manual dom event fires');
						}
					}
					
					try {
						if( !e.detail ) e.detail = values;
					
						if( values && (!window.Event || !(values instanceof Event)) && typeof(values) === 'object' ) { 
							for(var k in values) e[k] = values[k];
						}
					
						e.src = this;
					} catch(e) {}
					
					if( el.dispatchEvent ) {
						el.dispatchEvent(e);
					} else {
						return console.error('this browser does not supports manual dom event fires');
					}
				}
				
				arge.push(e);
			});
			
			return array_return(arge);
		};
		
		// action & href shim		
		fn.action = function(href, e) {
			return this.each(function() {
				if( !isElement(this) ) return;
				
				var el = $(this);
				if( !href ) href = el.attr('href');
				if( !href ) return;
						
				if( href.toLowerCase().trim().startsWith('javascript:') ) {
					wrappingstringevent(href.trim().substring(11)).call(this, e);
				} else {
					if( href.startsWith('#') || !target ) {
						location.href = href;
					} else {
						//TODO: target 이 있을경우...어떻게 해야 하나.
						location.href = href;
					}
				}
			});
		};
		
		fn.href = function(href) {
			if( !arguments.length ) {
				var arr = [];
				this.each(function() {
					var href = this.getAttribute && this.getAttribute('href');
					arr.push(href);
				});				
				return array_return(arr);
			}
			
			return this.each(function() {
				var el = $(this);
				
				var tag = el.tag();
				if( !tag ) return;
				
				if( !href ) el.attr('href', false);
				else el.attr('href', href);
								
				href = el.attr('href');
				if( tag !== 'a' ) {
					var listener = el.data('href_listener');
					
					if( !href ) {
						if( listener ) el.off('click', listener);
					} else {
						if( !listener ) {
							listener = function(e) {
								var href = this.getAttribute('href');
								if( href ) el.action(href, e);
							};
						}
						
						el.on('click', listener);
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
		
		
		fn.routes = function(routes) {
			var $ = this.$;
			if( !arguments.length ) {
				var arr = [];
				this.each(function() {
					if( !isElement(this) ) return arr.push(null);
					var routes = $(this).data('routes');
					arr.push(routes);					
				});
				return array_return(arr);
			}
			
			return this.each(function() {
				if( !isElement(this) ) return;
				
				if( routes === false ) {
					routes = $(this).data('routes');
					if( !routes ) return;
				
					for(var k in routes) {
						$(this).route(k, false);
					}
				} else if( typeof(routes) === 'object' ) {
					for(var k in routes) {
						$(this).route(k, routes[k]);
					}
				} else {
					return console.error('illegal arguments', routes);
				}
				return this;
			});
		};
		
		fn.route = function(hash, fn) {
			if( !arguments.length ) return console.error('missing arguments:hash');
			
			var $ = this.$;
			if( arguments.length === 1 ) {
				var arr = [];
				this.each(function() {
					if( !isElement(this) ) return arr.push(null);
					var routes = $(this).data('routes');
					if( !routes ) return arr.push(null);
					var route = routes[hash];
					arr.push(route);
				});
				return array_return(arr);
			}
			
			return this.each(function() {
				if( !isElement(this) ) return;
				
				var el = $(this);
				if( typeof(hash) === 'string' && fn === false ) {
					var routes = el.data('routes');
					if( routes && routes[hash] ) {				
						routes[hash] = null;
						try { delete routes[hash]; } catch(e) {}				
						el.fire('route.removed', {hash:hash});
					}
				} else if( typeof(hash) === 'string' && typeof(fn) === 'function' ) {
					var routes = el.data('routes');
					if( !routes ) {
						routes = {};
						el.data('routes', routes);
					}

					routes[hash] = fn;
					
					var listener = el.data('routes.listener');
					if( !listener ) {
						listener = function(e) {
							var hash = e.hash;
							if( hash === '' ) hash = '@default';
							
							var current = routes[hash];
							var notfound = routes['@notfound'];
							
							if( !current && !notfound ) {
								return;
							}
							
							var init = routes['@init'];
							var changed = routes['@changed'];
							var before = routes['@before'];
							var after = routes['@after'];
							var def = routes['@default'];
							var notfound = routes['@notfound'];
						
							if( !this._router_inited && init ) init.call(this, e);
							else if( changed ) changed.call(this, e);
						
							if( !current ) {
								if( !this._router_inited ) current = current || def;
								else current = current || notfound;
							}
						
							if( e.hash === '' ) current = def;
						
							this._router_inited = true;
						
							if( before ) before.call(this, e);
							if( current ) current.call(this, e);
							if( after ) after.call(this, e);
						};
						
						el.data('routes.listener', listener);
						el.on('route', listener);
					}
				
					el.fire('route.added', {hash:hash, handler:fn});
				} else {
					return console.error('illegal arguments', hash, fn);
				}
			});
		};
		
		fn.fireroute = function(hash) {
			if( !arguments.length ) hash = location.hash || '';
			if( hash.startsWith('#') ) hash = hash.substring(1);
			
			var $ = this.$;
			this.visit(function() {
				if( !isElement(this) ) return;
				var el = $(this);
				var e = el.fire('route', {
					hash: hash
				});
				if( e.cancelBubble === true ) return false;
			}, true);
			return this;
		};
		
		// mutation observe
		if( eval('typeof(MutationObserver) !== "undefined"') ) {
			var create = function(target, fn, options) {
				if( !isElement(target) ) return console.error('illegal target(element)', target);
				if( typeof(fn) !== 'function' ) return console.error('illegal fn(function)', fn);
			
				// MutationObserver setup for detect DOM node changes.
				// if browser doesn't support DOM3 MutationObeserver, use MutationObeserver shim (https://github.com/megawac/MutationObserver.js)
				var observer = new MutationObserver(function(mutations){
					mutations.forEach(function(mutation) {
						fn.call(target, mutation);
					});
			    });

				observer.observe(target, options);			
				return observer;
			};
						
			fn.mutationsupport = function(remove) {
				var $ = this.$;
				
				var options = {
					childList: true,
					attributes: true,
					characterData: true,
					attributeOldValue: true,
					characterDataOldValue: true,
					attributeFilter: true,
					fn: function(e) {
						var type = e.type;
						var target = e.target;
				
						if( type === 'childList' ) {
							var added = e.addedNodes;
							var removed = e.removedNodes;				
					
							if( removed && removed.length ) {
								for(var i=0; i < removed.length; i++) {
									$(removed[i]).fire('detached', {
										from: target,
										mutation: e
									});
								}
						
								$(target).fire('removed', {
									removed: removed,
									mutation: e
								});
							}
	
							if( added && added.length ) {
								for(var i=0; i < added.length; i++) {
									$(added[i]).fire('attached', {
										to: target,
										mutation: e
									});
								}
						
								$(target).fire('added', {
									added: added,
									mutation: e
								});
							}
					
							$(target).fire('contents', {
								removed: removed,
								added: added,
								mutation: e
							});
						} else if( type === 'attributes' ) {
							var name = e.attributeName;
							var old = e.oldValue;
							var value = target.getAttribute(name);
					
							$(target).fire('attributes', {
								attributeName: name,
								oldValue: old,
								value: value,
								mutation: e
							});
						} else if( type === 'characterData' ) {
							var old = e.oldValue;
							var value = e.target.nodeValue;
					
							$(target).fire('textdata', {
								oldValue: old,
								value: value,
								mutation: e
							});
						}
					}
				};
				
				return this.each(function() {
					if( !isNode(this) ) return;
					var el = $(this);
					var observer = el.data('observer');
					
					if( remove === false ) {
						if( observer ) observer.disconnect();
						el.data('observer', false);
					} else if( !observer ) {
						observer = create(this, options.fn, options);
						el.data('observer', observer);
					}
				});
			};
		
			fn.observe = function(options) {
				if( typeof(options) !== 'object' ) return console.error('illegal argument', options);
				if( typeof(options.fn) !== 'function' ) return console.error('options.fn(function) required', options);
			
				var $ = this.$;
				return this.each(function() {
					if( !isNode(this) ) return;
					var el = $(this);
					var observer = el.data('observer.custom');
					if( observer ) observer.disconnect();
					
					if( options === false ) {
						el.data('observer.custom', false);
					} else {		
						observer = create(this, options.fn, options);
						el.data('observer.custom', observer);
					}
				});
			};
		
			SelectorBuilder.ready(function() {
				var $ = SelectorBuilder(document);
				$(document.documentElement).observe({
					subtree: true,
				    childList: true,
					fn: function(e) {
						if( e.type === 'childList' ) {
							var target = e.target;
							var added = e.addedNodes;
							var removed = e.removedNodes;
							
							if( removed ) {
								for(var i=0; i < removed.length; i++) {
									$(removed[i]).fire('unstaged', {
										from: target
									});
								}
							}
			
							if( added ) {
								for(var i=0; i < added.length; i++) {
									$(added[i]).fire('staged', {
										to: target
									});
								}
							}
						}
					}
				});
			});
		}
		

		// load & loader
		var Path = require('path');
		var Ajax = require('ajax');
		fn.loader = function(fn) {
			if( typeof(fn) !== 'function' ) return console.error('illegal argument', fn);
			
			var $ = this.$;
			return this.each(function() {
				var el = $(this);
				el.data('loader', fn);
			});
		};
		
		fn.load = function(options, fn) {
			if( typeof(options) === 'string' ) options = {url:options};
			
			options.url = Path.join(this.document.URL || location.href, options.url);
			options.sync = false;
			options.cache = true;
			
			var $ = this.$;
			return this.each(function() {
				var el = $(this);
				Ajax.ajax(options).done(function(err, data, xhr) {
					if( err && typeof(fn) === 'function' ) return fn.apply(el[0], [err, data]);
					
					var contentType = normalizeContentType(xhr.getResponseHeader('content-type'), options.url);
					
					var loader = el.data('loader');
					if( typeof(fn || loader) === 'function' ) {
						(fn || loader).apply(el[0], [err, data, contentType, options.url, xhr]);
					}
					
					if( err ) {
						el.fire('loaderror', {
							error: err,
							xhr: xhr
						});
					} else {
						el.fire('load', {
							url: options.url,
							data: data,
							contentType: contentType,
							xhr: xhr
						});
					}
				});
			});
		};
	})();
	
	return SelectorBuilder;
})();
