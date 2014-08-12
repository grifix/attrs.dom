var Importer = (function() {
	"use strict";
	
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
		
	var createOwnerDocument = function(contents, script, type) {
		var doc;
		
		if( window.DOMParser ) {
			var parser = new DOMParser();
			doc = parser.parseFromString(contents, type || "text/html");
		} 
		
		if( !doc && document.implementation && document.implementation.createHTMLDocument ) {
			doc = document.implementation.createHTMLDocument('');
			doc.open();
			doc.write(contents);
			doc.close();
		} else if( window.ActiveXObject ) {
			doc = new ActiveXObject("htmlfile");
			doc.open();
			doc.write(contents);
			doc.close();
		}
		
		return doc;		
	}
	
	var process = function(data) {
		var ownerDocument = createOwnerDocument(data);
	
		// execute scripts
		var $ = SelectorBuilder(ownerDocument);
		var scripts = $('script');
		scripts.each(function() {
			var script = this;
														
			var src = script.src;
			var text = script.nodeValue || script.textContent;
			var type = script.type;

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
					Object.defineProperty(script, 'ownerDocument', {
						configurable: true,
						get: function() {
							return doc;
						}
					});
				} else {
					script.ownerDocument = ownerDocument;
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
				//result = require(src);
			} else if( text ) {
				//console.log('script', text);
				window.eval(text);
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
		});
			
		return ownerDocument;
	};
		
	return {
		load: function(options) {
			if( typeof(options) === 'string' ) options = {url:options};
			
			//options.responseType = 'document';
			var src = options.url;
			var base = options.base || Path.dir(Path.join(location.href, src));
			
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
						
							result = process(data);
							callback(null, result);
						} else {
							if( err ) throw err;
							else result = process(data);
						}
					});
					return result;
				},
				async: function(callback) {
					return Ajax.ajax(options).done(function(err, data) {						
						if( err ) return callback(err);
						callback(null, process(data));
					});
				}
			};
		}
	};
})();

SelectorBuilder.fn['import'] = function(options, async, callback) {
	var $ = this.$;
	var document = this.document;
	
	return this.each(function() {
		var el = this;
		
		if( typeof(callback) !== 'function' ) {
			callback = function(err, doc) {
				if( err ) return console.error(err.message);
				if( !doc.body || !doc.body.childNodes.length ) console.warn('body was empty', doc, el);
			};
		}
		
		Importer.load(options).done(function(err, doc) {
			if( err ) return callback(err);
			if( doc.body && doc.body.childNodes.length ) {
				var body = document.importNode(doc.body, true);
				$(el).append(body);
			}
			
			callback(null, doc);
		}, async);
	});
};
