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
		
	function resolveScript(ownerDocument, script) {
		var src = script.getAttribute('src');
		var text = script.nodeValue || script.textContent;
		var type = script.type || script.getAttribute('type');

		if( type && type.trim().toLowerCase() !== 'text/javascript' ) return;
									
		var original_ownerDocument, original_currentScript;
	
		if( Object.getOwnPropertyDescriptor ) {
			original_ownerDocument = Object.getOwnPropertyDescriptor(script, 'ownerDocument');
			original_currentScript = Object.getOwnPropertyDescriptor(document, 'currentScript');
		} else {
			original_ownerDocument = script.ownerDocument;
			original_currentScript = document.currentScript;
		}
		
		var doc = ownerDocument;
		
		// make currentScript & ownerDocument
		if( !script.ownerDocument ) {
			if( Object.defineProperty ) {
				try {
					Object.defineProperty(script, 'ownerDocument', {
						configurable: true,
						get: function() {
							return doc;
						}
					});
				} catch(e) {
					script.ownerDocument = doc;
				}
			} else {		
				script.ownerDocument = doc;
			}
		}
		
		if( !document.currentScript ) {
			if( Object.defineProperty ) {									
				Object.defineProperty(document, 'currentScript', {
					configurable: true,
					get: function() {
						return script;
					}
				});
			} else {
				document.currentScript = script;
			}
		}
	
		// execute
		if( src ) {
			console.log('remote', src);
			var async = script.getAttribute('async');
			if( async === '' || async ) async = true;
			var charset = script.getAttribute('charset');
			Ajax.ajax({
				url: src,
				sync: !async,
				charset: charset,
			}).done(function(err, text) {
				//if( err ) return console.error(err);
				if( !err ) window.__evalscript__(text);
			});
		} else if( text ) {
			window.__evalscript__(text);
		}
	
		if( Object.defineProperty ) {
			if( original_ownerDocument ) Object.defineProperty(script, 'ownerDocument', original_ownerDocument);
			if( original_currentScript ) Object.defineProperty(document, 'currentScript', original_currentScript);
			
			script = null;
			doc = null;
		} else {
			script.ownerDocument = original_ownerDocument;
			document.currentScript = original_currentScript;
		}
	}
	
	function createDocument(options) {
		var doc;
		
		if( typeof(options) === 'string' ) options = {contents:options};
		
		options = options || {};
		var contents = options.contents || '';
		var noscript = options.noscript;
		var url = Path.join(location.href, (options.url || location.href));
		var uri = Path.uri(url);
		var base = Path.dir(url);
		
		if( false ) {
			var req = new XMLHttpRequest;
			req.open('GET', 'partials/partial.html', true);
			/*if (req.overrideMimeType) {
				req.overrideMimeType('application/xml');
			}*/
			req.onreadystatechange = function() {
				if (this.readyState == 4) {
					var doc = this.responseXML;
					console.debug('result', doc, doc.URL);
				}
			}
			req.responseType = 'document';
			req.send(null);
		}
		
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
		
		if( noscript !== true ) {
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
					
					if( tag === 'template' ) {
						el.style.display = 'none';
					} else if( tag === 'script' ) {
						resolveScript(doc, el);
					} else if( tag === 'style' ) {
						document.head.appendChild(el.cloneNode(true));
					} else if( tag === 'link' ) {
						var rel = (el.getAttribute('rel') || '').toLowerCase().trim();
						if( rel === 'stylesheet' ) {
							document.head.appendChild(el.cloneNode(true));
						}
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
		
		return doc;
	}
	
	return {
		createDocument: createDocument,
		resolveScript: resolveScript,
		load: function(options) {
			if( typeof(options) === 'string' ) options = {url:options};
			
			//options.responseType = 'document';
			var src = options.url;
						
			return {
				done: function(callback, async) {
					if( async === true ) return this.async(callback);
					else return this.sync(callback);
				},
				sync: function(callback) {
					options.sync = true;
					
					var result;
					Ajax.ajax(options).done(function(err, data) {
						if( typeof(callback) === 'function' ) {
							if( err ) return callback(err);
						
							result = createDocument({contents:data, url:src});
							callback(null, result);
						} else {
							if( err ) throw err;
							else result = createDocument({contents:data, url:src});
						}
					});
					return result;
				},
				async: function(callback) {
					return Ajax.ajax(options).done(function(err, data) {						
						if( err ) return callback(err);
						callback(null, createDocument({contents:data, url:src}));
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

SelectorBuilder.fn['import'] = function(options, async, callback) {
	"use strict";
	
	var $ = this.$;
	var document = this.document;
	
	if( typeof(async) === 'function' ) {
		callback = async;
		async = null;
	}
	
	return this.each(function() {
		var el = this;
		
		if( typeof(callback) !== 'function' ) {
			callback = function(err, doc) {
				if( err ) return console.error(err.message);
				if( !doc.body || !doc.body.childNodes.length ) console.warn('body was empty', doc, el);
			};
		}
		
		Importer.load(options).done(function(err, doc, xhr) {
			if( err ) return callback(err);
			if( doc.body && doc.body.childNodes.length ) {
				//var body = document.adoptNode(doc.body);
				$(el).append(doc.body.childNodes);
			}
			
			callback(null, doc);
			
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
		}, async);
	});
};
