var Importer = (function() {
	var Ajax = require('ajax');
	var Path = require('path');
	
	/*
	var isElement = $.util.isElement;
	var isNode = $.util.isNode;
	function OwnerDocument(el) {
		if( !(el instanceof $) ) el = $(el);
		
		var docel = document.createElement('#document');
		$(docel).create('html').create('head').append(el);
		
		if( Object.defineProperty ) {
			Object.defineProperty(this, 'documentElement', {
				enumerable: false,
				configurable: false,
				writable: false,
				value: docel
			});
		}
		
		this.querySelector = function(selector) {
			var args = $([]);
			el.each(function() {
				if( $(this).is(selector) ) args.add(this);
			});
			return args[0] || el.find(selector)[0];
		};
		
		this.querySelectorAll = function(selector) {
			var args = $([]);
			el.each(function() {
				if( $(this).is(selector) ) args.add(this);
			});
			args.add(el.find(selector));
			return new NodeList(args);
		};
		
		this.getElementById = function(id) {
			var args = $([]);
			el.each(function() {
				if( $(this).is('#' + id) ) args.add(this);
			});
			return args[0] || el.find('#' + id)[0];
		};
		
		this.getElemenetsByName = function(name) {
			var args = $([]);
			el.each(function() {
				if( $(this).is('[name="' + name + '"]') ) args.add(this);
			});
			args.add(el.find('[name="' + name + '"]'));
			return new NodeList(args);
		};
		
		this.getElementsByTagName = function(tag) {
			var args = $([]);
			el.each(function() {
				if( $(this).is(tag) ) args.add(this);
			});
			args.add(el.find(tag));
			return new NodeList(args);
		};
		
		this.getElementsByClassName = function(tag) {
			var args = $([]);
			el.each(function() {
				if( $(this).is('.' + tag) ) args.add(this);
			});
			args.add(el.find('.' + tag));
			return new NodeList(args);
		};
	};
	OwnerDocument.prototype = document || {};
	*/

	// NodeList wrap
	/*function NodeList(array) {
		for(var i=0; i < array.length;i++) {
			this[i] = array[i];
		}
		this.length = array.length;
		
		if( Object.defineProperty ) {
			Object.defineProperty(this, 'length', {
				enumerable: false,
				configurable: false,
				writable: false,
				value: array.length
			});
		}
	}
	NodeList.prototype = document.querySelectorAll('nemo') || [];
	
	if( !window.NodeList ) {
		window.NodeList = NodeList;
		NodeList.prototype.item = function(index) {
			return this[index];
		};
	}
	
	// HTMLCollection wrap
	function HTMLCollection(array) {
		for(var i=0; i < array.length;i++) {
			this[i] = array[i];
		}
		this.length = array.length;
	}
	HTMLCollection.prototype = document.createElement('nemo').children || [];
	
	if( !window.HTMLCollection ) {
		window.HTMLCollection = HTMLCollection;
		HTMLCollection.prototype.item = function(index) {
			return this[index];
		};
		
		HTMLCollection.prototype.namedItem = function(name) {
			return this[name];
		};
	}*/
		
	/*if( false ) {
		(function () {
			function CustomEvent ( event, params ) {
				params = params || { bubbles: false, cancelable: false, detail: undefined };
				var evt = document.createEvent( 'CustomEvent' );
				evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
				return evt;
			};

			CustomEvent.prototype = window.Event.prototype;
			window.CustomEvent = CustomEvent;
		})();
		
		function triggerEvent(el, type){
	        var event;
	        if( document.createEvent ) {
	            event = document.createEvent('HTMLEvents');
	            event.initEvent(type, true, true);
	        } else if( document.createEventObject ) { // IE < 9
	            event = document.createEventObject();
	            event.eventType = type;
	        }
			
	        if( el.dispatchEvent ) {
	            el.dispatchEvent(event);
	        } else if( el.fireEvent && htmlEvents['on' + type] ) { // IE < 9
	            el.fireEvent('on' + type, event); // can trigger only real event (e.g. 'click')
	        } else if( el[type]) {
	            el[eventName]();
	        } else if( el['on' + type] ) {
	            el['on' + type]();
	        }
	    }
		
	    function addEvent(el,type,handler){
	        if(el.addEventListener){
	            el.addEventListener(type,handler,false);
	        }else if(el.attachEvent && htmlEvents['on'+type]){// IE < 9
	            el.attachEvent('on'+type,handler);
	        }else{
	            el['on'+type]=handler;
	        }
	    }
		
	    function removeEvent(el,type,handler){
	        if(el.removeventListener){
	            el.removeEventListener(type,handler,false);
	        }else if(el.detachEvent && htmlEvents['on'+type]){// IE < 9
	            el.detachEvent('on'+type,handler);
	        }else{
	            el['on'+type]=null;
	        }
	    }
	}*/
		
	function resolveScript(script) {
		var src = script.getAttribute('src');
		var text = script.nodeValue || script.textContent;
		var type = script.type || script.getAttribute('type');

		if( type && type.trim().toLowerCase() !== 'text/javascript' ) return;
		
		var setcurrentscript = function(script) {
			if( Object.getOwnPropertyDescriptor ) {
				Object.defineProperty(document, 'currentScript', {
					configurable: true,
					writable: false,
					value: script
				});
				document._currentScript = script;
			} else {
				document.currentScript = script;
				document._currentScript = script;
			}
			//console.log('script.currentScript', document.currentScript);
			//console.log('script._currentScript', document._currentScript);
		}
		
		// execute
		if( src ) {
			var async = script.getAttribute('async');
			if( async === '' || async ) async = true;
			var charset = script.getAttribute('charset');
			Ajax.ajax({
				method: 'GET',
				url: src,
				sync: !async,
				charset: charset,
			}).done(function(err, text) {
				//if( err ) return console.error(err);
				setcurrentscript(script);
				if( !err ) window.__evalscript__(text);
				setcurrentscript(null);
			});
		} else if( text ) {
			setcurrentscript(script);
			window.__evalscript__(text);
			setcurrentscript(null);
		}
	
		
	}
	
	function processDocument(doc, options) {		
		if( typeof(options) === 'string' ) options = {contents:options};
		
		options = options || {};
		var url = Path.join(location.href, (options.url || doc.URL || location.href));
		var uri = Path.uri(url);
		var base = Path.dir(url);		
		
		if( typeof(options.before) === 'function' ) {
			options.before(doc);
		}
		
		var headflag = [];
		var head = doc.head && doc.head.childNodes;
		if( head && head.length ) {
			head = Array.prototype.slice.call(head);
			head.forEach(function(el) {
				doc.head.removeChild(el);
				headflag.push(el);
			});
		}
		
		var bodyflag = [];
		var body = doc.body && doc.body.childNodes;
		if( body && body.length ) {
			body = Array.prototype.slice.call(body);
			body.forEach(function(el) {
				doc.body.removeChild(el);
				bodyflag.push(el);
			});
		}
		
		// let's write & execute
		var fill = function(flag, target) {
			flag.forEach(function(el) {
				var tag = el.tagName && el.tagName.toLowerCase();
			
				// fixlink src & href
				if( tag && base ) {
					var arg = Array.prototype.slice.call(el.querySelectorAll('*'));
					arg.push(el);
				
					arg.forEach(function(sub) {
						var src = sub.getAttribute('src');
						var href = sub.getAttribute('href');
						if( src && !src.startsWith('#') ) sub.setAttribute('src', Path.join(base, src));			
						if( href && !href.startsWith('#') ) sub.setAttribute('href', Path.join(base, href));
					});
				}
				
				if( tag === 'script' ) {
					resolveScript(el);
				}
			
				target.appendChild(el);
			});
		};
		
		fill(headflag, doc.head);
		fill(bodyflag, doc.body);
					
       	var event = doc.createEvent('Event');
		event.initEvent('DOMContentLoaded', true, true);
		doc.dispatchEvent(event);
	
		if( typeof(options.after) === 'function' ) {
			options.after(doc);
		}
	}
	
	function createDocument(url, contents) {
		if( !Device.is('webkit') && window.DOMParser ) {
			var parser = new DOMParser();
			doc = parser.parseFromString(contents, "text/html");
			//WARN: DOMParser 로 초기화된 document 는 webkit 에서 dispatchEvent 가 먹히지 않는다. chrome/safari X, ff O
		}
		
		if( !doc && document.implementation && document.implementation.createHTMLDocument ) {
			doc = document.implementation.createHTMLDocument('noname');
			doc.open();
			doc.write(contents);
			doc.close();
		} else if( window.ActiveXObject ) {
			doc = new ActiveXObject("htmlfile");
			doc.open();
			doc.write(contents);
			doc.close();
		}
		
		if( Object.defineProperties ) {
			try {
				Object.defineProperties(doc, {
					'URL': {
						configurable: false,
						get: function() {
							return url;
						}
					},
					'baseURI': {
						configurable: false,
						get: function() {
							return url;
						}
					},
					'documentURI': {
						configurable: false,
						get: function() {
							return url;
						}
					}
				});
			} catch(e) {
				// 사파리의 경우 "Attempting to change access mechanism for an unconfigurable property." ...
				console.error('error', e);
			}
		} else {
			doc.URL = url;
			doc.baseURI = url;
			doc.documentURI = url;
		}
		
		return doc;
	}
	
	return {
		createDocument: createDocument,
		resolveScript: resolveScript,
		load: function(options) {
			if( typeof(options) === 'string' ) options = {url:options};
			
			var src = options.url;
			
			return {
				done: function(callback) {
					return Ajax.html(options).done(function(err, doc, xhr) {						
						if( err ) return callback(err);
						
						if( doc.nodeType !== 9 ) doc = createDocument(src, xhr.responseText);
						
						processDocument(doc, {
							url: src
						});
						
						callback(null, doc);
					});
				}
			};
		}
	};
})();

SelectorBuilder.util.createDocument = Importer.createDocument;
SelectorBuilder.util.resolveScript = Importer.resolveScript;
SelectorBuilder.staticfn.newDocument = function() {
	var doc = Importer.createDocument.apply(this, arguments);
	return SelectorBuilder(doc);
};
SelectorBuilder.staticfn.import = function(options, callback) {
	Importer.load(options).done(function(err, doc, xhr) {
		if( err ) return callback(err);		
		callback(null, doc);
	});
};

SelectorBuilder.fn['import'] = function(options, callback) {
	"use strict";
	
	var $ = this.$;
	var document = this.document;
	
	return this.each(function() {
		var el = this;
		
		if( typeof(callback) !== 'function' ) {
			callback = function(err, doc) {
				if( err ) return console.error(err.message);
				
				if( !doc.body || !doc.body.childNodes.length ) return console.warn('body was empty', options, doc, el);
				
				var el = $(this);
				if( options.append !== true ) el.empty();
				
				console.log('doc.head', doc.head);
				
				if( doc.head ) {
					var head = doc.head;
					var styles = $(head.querySelectorAll('style'));
					styles.appendTo(document.head);
					
					var stylesheets = $(head.querySelectorAll('link[rel="stylesheet"]'));
					stylesheets.appendTo(document.head);
				}
				
				el.append(doc.body.childNodes);
			};
		}
		
		Importer.load(options).done(function(err, doc, xhr) {
			if( err ) return callback.apply(el, arguments);
			
			callback.apply(el, arguments);
			
			if( err ) {
				$(el).fire('importerror', {
					error: err,
					xhr: xhr
				});
			} else {
				$(el).fire('imported', {
					url: options.url,
					document: doc,
					xhr: xhr
				});
			}
		});
	});
};
