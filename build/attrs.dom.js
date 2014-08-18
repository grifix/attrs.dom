/*!
 * attrs.dom - dom selector (MIT License)
 * 
 * @author: joje (https://github.com/joje6)
 * @version: 0.1.0
 * @date: 2014-08-19 5:20:37
*/

/*!
 * attrs.module - javascript module loader that supports cjs, amd (MIT License)
 * 
 * @author: joje (https://github.com/joje6)
 * @version: 0.1.0
 * @date: 2014-08-19 5:10:5
*/

(function() {
	if (!String.prototype.trim) {
	  String.prototype.trim = function () {
	    return this.replace(/^\s+|\s+$/g, '');
	  };
	}
	

var Path = (function() {
	"use strict"

	function Path(src) {
		if( src instanceof Path ) src = src.src;
		if( !src || typeof(src) !== 'string' ) throw new Error('invalid path:' + src);
		this.src = src.trim();
	}

	Path.prototype = {
		join: function(path) {
			return Path.join(this.src, path);
		},
		dir: function() {
			return Path.dir(this.src);
		},
		uri: function() {
			return Path.uri(this.src);
		},
		filename: function() {
			return Path.filename(this.src);
		},
		ext: function() {
			return Path.ext(this.src);
		},
		querystring: function() {
			return Path.querystring(this.src);
		},
		query: function() {
			return Path.query(this.src);
		},
		host: function() {
			return Path.host(this.src);
		},
		parse: function() {
			return Path.parse(this.src);
		},
		parent: function() {
			return Path.parent(this.src);
		},
		isFile: function() {
			return !( src.endsWith('/') );
		},
		isDirectory: function() {
			return src.endsWith('/');
		},
		toString: function() {
			return this.src;
		}
	};
		
	Path.join = function(base, path) {
		if( !base ) return path;
		if( path.trim() === '.' ) return base;
		if( base instanceof Path ) base = base.src;
		if( path instanceof Path ) path = path.src;

		base = this.dir(base);
		path = path.trim();

		if( path.indexOf(':') >= 0 ) return path;

		if( path.startsWith('/') ) {
			var i;
			if( (i = base.indexOf('://')) >= 0 ) {
				base = base.substring(0, base.indexOf('/', i + 3));
			} else if( (i = base.indexOf(':')) >= 0 ) {
				base = base.substring(0, i + 1);
			} else {
				return path;
			}
		} else {			
			// 상대경로 맞추기
			for(;path.startsWith('.');) {
				if( path.startsWith('./') ) {
					path = path.substring(2);
				} else if( path.startsWith('../') ) {
					base = this.parent(base);
					path = path.substring(3);
					if( !base ) return null;
				} else {
					return null;	// 오류
				}
			}
		}
		
		return base + path;
	};
	
	Path.dir = function(path) {
		if( !path ) return '';
		if( path instanceof Path ) path = path.src;

		path = path.trim();

		if( ~path.indexOf('?') ) path = path.substring(0, path.indexOf('?'));
		if( ~path.indexOf('#') ) path = path.substring(0, path.indexOf('#'));

		var base = '', i;
		
		if( (i = path.indexOf('://')) ) {
			i = path.indexOf('/', i + 3);
			
			if( i < 0 ) return path + '/';
			else if( !~path.indexOf('/', i + 1) ) return path;

			base = path.substring(0, i) || path;
			path = path.substring(i);
		}
		
		if( path.endsWith('/') ) {
			path = path;
		} else if( path.indexOf('/') >= 0 ) {
			path = path.substring(0, path.lastIndexOf('/')) + '/';
		} else {
			path = path + '/';
		}

		return base + path;
	};
	
	Path.filename = function(path) {
		if( !path ) return '';
		if( path instanceof Path ) path = path.src;

		path = Path.uri(path).trim();

		if( path.endsWith('/') ) {
			path = path.substring(0, path.length - 1);
			return path.substring(path.lastIndexOf('/') + 1);
		} else {
			return path.substring(path.lastIndexOf('/') + 1);
		}
	};
	
	Path.ext = function(path) {
		if( !path ) return '';
		if( path instanceof Path ) path = path.src;
		
		path = Path.filename(path);
		
		var arg = path.split('.');
		if( arg.length <= 1 ) return '';
		return arg[arg.length - 1];		
	};

	Path.uri = function(path) {
		if( !path ) return '';
		if( path instanceof Path ) path = path.src;

		path = path.trim();

		if( ~path.indexOf('?') ) path = path.substring(0, path.indexOf('?'));
		if( ~path.indexOf('#') ) path = path.substring(0, path.indexOf('#'));

		return path;
	};

	Path.querystring = function(path) {
		if( !path ) return '';
		if( path instanceof Path ) path = path.src;

		path = path.trim();

		if( ~path.indexOf('?') ) path = path.substring(path.indexOf('?') + 1);
		else return '';
	};

	Path.query = function(path) {
		if( !path ) return '';
		if( path instanceof Path ) path = path.src;

		var q = this.querystring(q);
		var query = {};
		q.replace(
			new RegExp('([^?=&]+)(=([^&]*))?', 'g'),
			function($0, key, $2, value) {
				if( !key || value === undefined ) return;

				if( value.indexOf('#') >= 0 ) value = value.substring(0, value.lastIndexOf('#'));

				if( o.query[key] !== undefined ) {
					if( !Array.isArray(query[key]) ) query[key] = [query[key]];
					query[key].push(value);
				} else {
					query[key] = value;
				}
			}
		);

		return query;
	};

	Path.host = function(url) {
		if( !url ) return '';
		if( url instanceof Path ) url = url.src;

		if( (i = url.indexOf('://')) >= 0 ) {
			var j = url.indexOf('/', i + 3);
			url = url.substring(i + 3, (j >= 0) ? j : url.length);
			if( (i = url.indexOf(':')) >= 0 ) url = url.substring(0, i);
			return url;
		} else {
			return null;
		}
	};

	Path.parse = function(url) {
		if( !url ) return {};
		if( url instanceof Path ) url = url.src;

		return {
			url: url,
			uri: this.uri(url),
			host: this.host(url),
			querystring: this.querystring(url),
			query: this.query(url),
			name: this.filename(url),
			dir: this.dir(url),
			parent: this.parent(url)			
		};			
	};

	Path.parent = function(path) {
		if( !path ) return '';
		if( path instanceof Path ) path = path.src;

		path = this.dir(path);

		if( ~path.indexOf('?') ) path = path.substring(0, path.indexOf('?'));
		if( ~path.indexOf('#') ) path = path.substring(0, path.indexOf('#'));

		var arg = path.split('/');
		if( !arg || arg.length <= 2 ) return null;
		return arg.splice(0, arg.length - 2).join('/') + '/';
	};

	return Path;
})();



/*
var url_file = 'http://host:8080/appbus/module/appbus.ui.json';
var windows_file = 'c:/appbus/module/appbus.ui.json';
var unix_file = '/appbus/module/appbus.ui.json';

var url_dir = 'http://host:8080/appbus/module/';
var windows_dir = 'c:/appbus/module/';
var unix_dir = '/appbus/module/';

var empty = '';
var path_abs = '/other/other.ui.json';
var path_rel1 = './other.js';
var path_rel2 = '../';
var path_rel3 = '../other/other.ui.json';

console.log('dir.url(file)', Path.dir(url_file));
console.log('dir.windows(file)', Path.dir(windows_file));
console.log('dir.unix(file)', Path.dir(unix_file));

console.log('dir.url(dir)', Path.dir(url_dir));
console.log('dir.windows(dir)', Path.dir(windows_dir));
console.log('dir.unix(dir)', Path.dir(unix_dir));

console.log('name.url(file)', Path.filename(url_file));
console.log('name.windows(file)', Path.filename(windows_file));
console.log('name.unix(file)', Path.filename(unix_file));

console.log('name.url(dir)', Path.filename(url_dir));
console.log('name.windows(dir)', Path.filename(windows_dir));
console.log('name.unix(dir)', Path.filename(unix_dir));

console.log('parent.url(file)', Path.parent(url_file));
console.log('parent.windows(file)', Path.parent(windows_file));
console.log('parent.unix(file)', Path.parent(unix_file));

console.log('parent.url(dir)', Path.parent(url_dir));
console.log('parent.windows(dir)', Path.parent(windows_dir));
console.log('parent.unix(dir)', Path.parent(unix_dir));

console.log('join.url.path_abs(file)', Path.join(url_file, path_abs));
console.log('join.url.path_rel1(file)', Path.join(url_file, path_rel1));
console.log('join.url.path_rel2(file)', Path.join(url_file, path_rel2));
console.log('join.url.path_rel3(file)', Path.join(url_file, path_rel3));

console.log('join.windows.path_abs(file)', Path.join(windows_file, path_abs));
console.log('join.windows.path_rel1(file)', Path.join(windows_file, path_rel1));
console.log('join.windows.path_rel2(file)', Path.join(windows_file, path_rel2));
console.log('join.windows.path_rel3(file)', Path.join(windows_file, path_rel3));

console.log('join.unix.path_abs(file)', Path.join(unix_file, path_abs));
console.log('join.unix.path_rel1(file)', Path.join(unix_file, path_rel1));
console.log('join.unix.path_rel2(file)', Path.join(unix_file, path_rel2));
console.log('join.unix.path_rel3(file)', Path.join(unix_file, path_rel3));


console.log('dir(a)', Path.dir('a'));
console.log('dir(http://host:80)', Path.dir('http://host:80'));
console.log('dir(http://host:80/)', Path.dir('http://host:80/'));
console.log('dir(http://host:80/a)', Path.dir('http://host:80/a'));
console.log('dir(http://host:80/a/b)', Path.dir('http://host:80/a/b'));
console.log('dir(http://host:80/a/b/c)', Path.dir('http://host:80/a/b/c'));
console.log('host(ftp://a.b.c.com)', Path.host('ftp://a.b.c.com'));
console.log('host(ftp://a.b.c.com:8080)', Path.host('ftp://a.b.c.com:8080'));
console.log('host(ftp://a.b.c.com:8080/)', Path.host('ftp://a.b.c.com:8080/'));
console.log('host(ftp://a.b.c.com:8080/a/b/c)', Path.host('ftp://a.b.c.com:8080/a/b/c'));
*/

// eval script in global scope
function eval_in_global(script, env) {
	with(env || {}) {
		var result;
		eval('result = (function() {\n' + script + '\n})();');
		return result;
	}
}

var Ajax = (function() {
	"use strict";

	// string to xml
	function createXMLDocument(text){
		if( window.ActiveXObject ) {
			var doc = new ActiveXObject('Microsoft.XMLDOM');
			doc.async = 'false';
			doc.loadXML(text);
		} else {
			var doc = new DOMParser().parseFromString(text, 'text/xml');
		}
		return doc;
	}
	
	function createHTMLDocument(url, contents) {
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
	
	function toqry(o) {
		if( !o || typeof(o) != 'object' ) return '';

		var s = '';
		var first = true;
		for(var k in o) {
			var v = o[k];
			var type = typeof(v);
			if( type == 'string' || type == 'number' || type == 'boolean' ) {
				v = encodeURIComponent(v);
				if( k ) s += ( ((first) ? '':'&') + k + '=' + v);
				first = false;
			}
		}

		return s;
	}

	// class ajax
	var Ajax = function() {};
	
	Ajax.prototype = {
		toqry: toqry,
		get: function(options, cache) {
			if( !options ) return console.error('illegal arguments', url);
			if( typeof(options) === 'string' ) options = {url: options};			
			if( typeof(cache) === 'boolean' ) options.cache = cache;			
			return this.ajax(options).get();;
		},
		text: function(url, cache) {
			if( !url ) return console.error('illegal arguments', url);
			if( typeof(url) === 'string' ) url = {url: url};
			url.responseType = 'text';			
			return this.get(url, cache);
		},
		script: function(url, env, cache) {
			if( !url ) return console.error('illegal arguments', url);
			if( typeof(url) === 'string' ) url = {url: url};
			url.responseType = 'script';	
			url.env = env;		
			return this.get(url, cache);
		},
		json: function(url, cache, fn) {
			if( typeof(url) === 'string' ) url = {url: url};
			url.responseType = 'json';			
			return this.get(url, cache);
		},
		html: function(url, cache, fn) {
			if( typeof(url) === 'string' ) url = {url: url};
			url.responseType = 'document';			
			return this.get(url, cache);
		},
		xml: function(url, cache, fn) {
			if( typeof(url) === 'string' ) url = {url: url};
			url.responseType = 'xml';			
			return this.get(url, cache);
		},
		blob: function(url, cache, fn) {
			if( typeof(url) === 'string' ) url = {url: url};
			url.responseType = 'blob';			
			return this.get(url, cache);
		},
		ajax: function(options) {
			if( typeof(options) === 'string' ) {
				url = {
					method: 'get',
					sync: false,
					responseType: 'text'
				};
			}
			
			if( typeof(options.url) !== 'string' ) return console.error('invalid url', options.url);
			
			var xhr = ( window.XMLHttpRequest ) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
			var url;
			var executed = false;
			var loaded = false;
			var self = this;
			var payload;
			
			var committer = (function() {
				var queue = [];
				var parsed = false;
				
				var committer = function(listeners) {
					if( !loaded ) {
						queue.push(listeners);
						return;
					}
					
					var scope = options.scope || self;
					var responseType = options.responseType || 'text';
					var contentType = xhr.getResponseHeader('Content-Type');
					
					var err;
					if( !(xhr.status == 200 || xhr.status == 204) ) {
						err = xhr.statusText || xhr.status;
					}
				
					if( !parsed ) {
						if( responseType === 'text' ) {
							payload = xhr.response || xhr.responseText;
						} else if( responseType === 'document' ) {
							payload = xhr.responseXML || createHTMLDocument(options.url, xhr.responseText);
						} else if( responseType === 'blob' ) {
							payload = new Blob([xhr.response], {type: options.blobType || contentType || 'application/octet-binary'});
						} else if( responseType === 'xml' ) {
							payload = xhr.responseXML || createXMLDocument(xhr.responseText);
						} else if( responseType === 'jsone' ) {
							try {
								eval('payload = ' + xhr.responseText);
							} catch(e) {
								console.error('json parse error:', e.message, '[in ' + options.url + ']');
								err = e;
							}
						} else if( responseType === 'json' ) {
							try {
								payload = xhr.response || JSON.parse(xhr.responseText);
							} catch(e) {
								try {
									eval('payload = ' + xhr.responseText);
								} catch(e) {
									console.error('json parse error:', e.message, '[in ' + options.url + ']');
									err = e;
								}
							}
						} else if( responseType === 'script' ) {
							try {
								eval_in_global(xhr.responseText, options.env);
								payload = options.env || {};
							} catch(e) {
								console.error('script error:', e.message, '[in ' + options.url + ']');
								err = e;
							}
						} else {
							err = 'unknown responseType:' + responseType;
						}
						
						parsed = true;
					}
					
					function invokeListener(listeners) {
						if( err && listeners.error ) listeners.error.call(scope, err, payload, xhr, responseType);
						else if( !err && listeners.success ) listeners.success.call(scope, payload, xhr, responseType);					
						if( listeners.done ) listeners.done.call(scope, err, payload, xhr, responseType);
					}
					
					if( queue.length ) {
						queue.forEach(function(listeners) {
							invokeListener(listeners);
						});
						queue = [];
					}
				
					invokeListener(listeners);
				};
				
				return committer;
			})();
			
			var execute = function() {
				executed = true;
				loaded = false;
				
				var o = options;
								
				// build & send
				try {
					url = o.url;
					var qry = toqry(o.qry) || '';
					if( url.indexOf('?') > 0 ) url += ((o.cache === false ? '&_nc=' + Math.random() : '') + ((qry) ? ('&' + qry) : ''));
					else url += ((o.cache === false ? '?_nc=' + Math.random() : '') + ((qry) ? ('&' + qry) : ''));
				
					// create xhr
					xhr.open(o.method, url, !o.sync);
					if( o.accept ) xhr.setRequestHeader("Accept", o.accept);
					if( o.responseType ) xhr.responseType = o.responseType;
				
					// success
					var oncomplete = function () {
						loaded = true;
						committer({
							error: o.error,
							success: o.success,
							done: o.done,
							interceptor: o.interceptor
						});
					};

					// error
					var onerror = function() {
						loaded = true;
						committer({
							error: o.error,
							success: o.success,
							done: o.done,
							interceptor: o.interceptor
						});
					};

					if( xhr.addEventListener ) {
						xhr.addEventListener("load", oncomplete, false);
						xhr.addEventListener("error", onerror, false);
						xhr.addEventListener("abort", onerror, false);
					} else {
						xhr.onreadystatechange = function() {
							if( xhr.readyState === 4 ) oncomplete();
						};
						xhr.onload = onload;
						xhr.onerror = onerror;
						xhr.onabort = onerror;
					}
					
					if( o.payload ) {
						if( typeof(o.payload) === 'object' ) {
							o.payload = JSON.stringify(o.payload);
							o.contentType = 'application/json';
						}
						
						var charset = o.charset ? ('; charset=' + o.charset) : '';						
						xhr.setRequestHeader('Content-Type', (o.contentType || 'application/x-www-form-urlencoded') + charset);
						xhr.send(o.payload);
					} else {
						xhr.send();
					}
				} catch(e) {
					loaded = true;
					console.error('ajax error', e);
				}
			};

			return {
				qry: function(qry) {
					if( !qry ) return this;
					options.qry = qry;
					return this;
				},
				nocache: function(b) {
					if( !arguments.length) b = true;
					if( typeof(b) != 'boolean' ) return this;
					return this.cache(!b);
				},
				cache: function(b) {
					if( !arguments.length) b = true;
					if( typeof(b) != 'boolean' ) return this;
					options.cache = b;
					return this;
				},
				parse: function(b) {
					if( !arguments.length) b = true;
					if( typeof(b) != 'boolean' ) return this;
					options.parse = b;
					return this;
				},
				sync: function(b) {
					if( !arguments.length) b = true;
					if( typeof(b) != 'boolean' ) return this;
					options.sync = b;
					return this;
				},
				url: function(url) {
					if( !url ) return this;
					options.url = url;
					return this;
				},
				contentType: function(type) {
					options.contentType = type;
					return this;
				},
				responseType: function(type) {
					options.responseType = type;
					return this;
				},
				blobType: function(type) {
					options.blobType = type;
					return this;
				},
				env: function(env) {
					options.env = env;
					return this;
				},
				charset: function(charset) {
					options.charset = charset;
					return this;
				},
				accept: function(accept) {
					options.accept = accept;
					return this;
				},
				content: function(content) {
					options.payload = content;
				},
				post: function(payload) {
					options.method = 'post';
					if( payload ) options.payload = payload;
					return this;
				},
				put: function(payload) {
					options.method = 'put';
					if( payload ) options.payload = payload;
					return this;
				},
				get: function(payload) {
					options.method = 'get';
					if( payload ) options.payload = payload;
					return this;
				},
				options: function(payload) {
					options.method = 'options';
					if( payload ) options.payload = payload;
					return this;
				},
				del: function(payload) {
					options.method = 'delete';
					if( payload ) options.payload = payload;
					return this;
				},
				listeners: function(listeners) {
					if( listeners.success ) options.success = listeners.success;
					if( listeners.error ) options.error = listeners.error;
					if( listeners.done ) options.done = listeners.done;

					return this;
				},
				scope: function(scope) {
					options.scope = scope;
					return this;
				},
				
				// execute
				execute: function() {
					execute();
					return payload;
				},
				done: function(fn) {
					if( !executed ) execute();
					committer({
						done: fn
					});
					return this;
				},
				success: function(fn) {
					if( !executed ) execute();
					committer({
						success: fn
					});
					return this;
				},
				error: function(fn) {
					if( !executed ) execute();
					committer({
						error: fn
					});
					return this;
				}
			};
		}
	};

	return new Ajax();
})();

var Require = (function() {	
	// imports
	var global = window;
	
	var current_uri = Path.uri(location.href);

	// privates
	// create new require environment for each module
	function createRequire(src) {		
		src = Path.join(current_uri, src) || current_uri;
		src = Path.dir(src);
		return (function(base) {
			return function require(path, reload, nocache) {				
				if( path.startsWith('./') || ~path.indexOf('://') ) {
					path = Path.join(base, path);
				}

				return Require.get(path, reload, nocache);
				
			};
		})(src);
	}

	// create sandbox
	var excepts = ['document', 'window', 'require', 'Map', 'Set', 'WeakMap', 'console', 'alert', 'confirm', 'print', 'prompt', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'];
	var sandbox = function() {
		var o = {};

		/*for(var k in window) {
			//if( ~excepts.indexOf(k) ) continue;
			//o[k] = undefined;
		}*/

		return o;
	};

	var global = {__sandbox_global__:1};
	
	// eval as module
	function eval_as_module(script, src) {
		// closure variables clear prepare for a possible illegal access in inner modules
		//var document = null, Element = null, window = null, $ = null, $$ = null;
		src = src || current_uri;
		
		var exports = {};
		var require = createRequire(src);
		var module = {
			exports:exports
		};

		// extract current require dirname & filename
		var __filename = Path.join(Path.dir(current_uri), src);
		var __dirname = Path.dir(__filename);

		//try {
			var scope = sandbox();
			scope.Ajax = undefined;
			scope.Path = undefined;
			scope.Require = undefined;
			scope.eval_as_module = undefined;
			scope.sandbox = undefined;
			scope.excepts = undefined;
			scope.createRequire = undefined;
			scope.global = global;

			with(scope) {
				if( typeof(script) === 'string' ) {
					eval('(function(module, require, exports, __filename, __dirname) {	' + script + ' \n})(module, require, exports, __filename, __dirname);');
				} else if( typeof(script) === 'function' ) {
					script(module, require, exports, __filename, __dirname);
				} else {
					throw new Error('illegal script or function');
				}
			}
		/*} catch(e) {
			//throw new SyntaxError('remote module syntax error (' + e.message + ' at ' + e.lineNumber + ') in [' + __filename + ']');
			console.error('remote module syntax error (' + e.message + ') in [' + __filename + ']');
			//throw e;
		}*/

		return module;
	}
	
	var Require;
	return Require = (function() {
		"use strict"
		
		// eval script in global scope
		function eval_json(json, src) {
			try {
				eval('json = ' + json);
				return json;
			} catch(e) {							
				throw new SyntaxError('json [' + src + '] has syntax error (' + e.message + ')');
			}

			/*try {
				if( window.JSON ) {
					try {
						json = JSON.parse(json);
					} catch(err) {
						try {
							eval('json = ' + json);
							console.error('[WARN] json syntax warning "' + err.message + '" at "' + src + '"');
						} catch(e) {							
							throw new SyntaxError('json [' + src + '] has syntax error (' + e.message + ')');
						}
					}
				} else {
					eval('json = ' + json);
				}

				return json;
			} catch(err) {
				throw new SyntaxError('json file [' + src + '] has syntax error (' + err.message + ')');
			}*/
		}
		
		// ajax execute to eval remote script
		function conn(src, cache, sync, fn) {
			Ajax.ajax(src).cache(cache).parse(false).sync(sync).get().done(function(err, data, xhr) {
				if( err ) return fn(err, data, xhr);
				
				var contentType = xhr.getResponseHeader('content-type');
					
				if( contentType && ~contentType.indexOf('javascript') ) {
					data = eval_as_module(data, src);
				} else if( contentType && ~contentType.indexOf('/json') || (src.lastIndexOf('.json') >= 0 && src.lastIndexOf('.json') === src.length - '.json'.length) ) {
					data = {
						exports: eval_json(data, src)
					};
				} else if( contentType && ~contentType.indexOf('text/') || (src.lastIndexOf('.html') >= 0 && src.lastIndexOf('.html') === src.length - '.html'.length) ) {
					data = data;
				} else {
					data = eval_as_module(data, src);
				}

				fn(null, data);
			});
		}

		var cached = {};
		var bundles = {
			'window': window,
			'document': document,
			'require': Require,
			'ajax': function(module) {  module.exports = Ajax; },
			'path': function(module) {  module.exports = Path; },
			'events': function(module) {  module.exports = EventDispatcher; }
		};

		// class Require, singleton
		function Require() {}
		
		Require.prototype = {
			resolve: eval_as_module,
			bundles: function() {
				return bundles;
			},
			bundle: function(name) {
				return bundles[name];
			},
			cached: function() {
				return cached;
			},
			define: function(name, fn) {
				if( !name || typeof(name) !== 'string' ) return this;

				bundles[name] = fn;
			},
			defines: function(o) {
				if( !arguments.length ) return bundles;

				if( typeof(o) !== 'object' ) return null;

				for(var k in o) {
					if( !o.hasOwnProperty(k) || k[0] === '_' || ~k.indexOf(' ') ) continue;				
					this.define(k, o[k]);
				}

				return this;
			},
			get: function(path, reload, nocache, fn) {
				if( reload === true ) cached[path] = null;

				if( typeof(path) !== 'string' ) throw new Error('invalid path \'' +  + path + '\'');

				var module;
				
				//console.log('path', path, this.bundle(path));

				// if in bundles
				var bundle = this.bundle(path);
				
				if( typeof(bundle) === 'function' ) {					
					module = cached[path] || eval_as_module(bundle);					
				} else if( bundle ) {
					module = {exports:bundle};
				} else if( path.startsWith('./') || ~path.indexOf('://') ) {
					var cache = (nocache === true) ? false : true;
					
					if( typeof(fn) === 'function' ) {
						if( cached[path] ) return fn(null, cached[path]);
						
						conn(path, cache, false, function(err, module) {
							if( err ) fn(err);

							if( module ) cached[path] = module;
							else fn(new Error('Can not load module \'' + path + '\''));

							fn(null, module);
						});
						return;
					} else {
						conn(path, cache, true, function(err, data) {
							if( err ) throw err;
							module = data;
						});
					}
				}

				if( module ) cached[path] = module;

				if( typeof(fn) === 'function' ) {
					if( !module ) fn(new Error('Can not find module \'' + path + '\''));
					return fn(null, (module && module.exports || module));
				} else {				
					if( !module ) throw new Error('Can not find module \'' + path + '\'');
					return module && module.exports;
				}
			},
			sync: function(path, reload, nocache) {
				return this.get(path, reload, nocache);
			},
			async: function(path, reload, nocache) {
				var self = this;
				return {
					done: function(fn) {
						self.get(path, reload, nocache, fn);
					}
				};
			}
		};

		return Require = new Require();
	})();
})();

(function() {
	// export require in global
	var another = window.require;
	var anotherd = window.define;
	
	var require = function(src, cache) {
		return Require.sync(src, cache);
	};
	require.resolve = Require.resolve;

	window.require = require;
	window.define = Require.define;
	window.define.attrs = true;

	window.require.noConflict = function() {
		window.require = another;
		window.define = anotherd;
		return require;
	};
	
	//console.log('define', define, define.attrs);

	var __require_jquery_url__ = 'http://code.jquery.com/jquery-latest.js';
	if( window.__require_jquery_url__ ) __require_jquery_url__ = window.__require_jquery_url__;

	// additional bundle module for jquery... 
	Require.define('jquery', function(module) {
		var $, error;

		var load = function(fn) {
			var script = document.createElement("script");
			script.charset = 'utf-8';
			script.async = false;
			script.src = __require_jquery_url__;
			
			var done = false;
			script.onload = script.onreadystatechange = function(e) {
				if ( !this.readyState || this.readyState === "loaded" || this.readyState === "complete" ) {
					done = true;
					$ = window.jQuery;
					fn($);
				} else if( this.readyState === "error" ) {
					error = 'jquery(http://code.jquery.com/jquery-latest.js) load error';
					console.error(error);
				}
			};

			script.onerror = function(e) {
				error = 'jquery(http://code.jquery.com/jquery-latest.js) load error';
				console.error(error);
			};
			
			var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
			head.appendChild(script);
		};
		
		console.log('$', $);
		module.exports = $;
		
		/*module.exports = {
			ready: function(fn) {
				if( $ ) fn($);
				else if( error ) console.error(error);
				else load(fn);
			}
		};*/
	});
})();


/*
-- TODO : 언젠간 jsonp 를...
var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
var script = document.createElement("script");
if ( charset ) script.charset = charset;

script.async = false;

if( script.addEventListener ) {
	script.addEventListener('load', function() {
	});
	script.addEventListener('error', function() {
	});
} else if(script.attachEvent) {
	script.attachEvent('onload', function() {
	});
	script.attachEvent('onerror', function() {
	});
} else {
	var done = false;
	script.onload = script.onreadystatechange = function() {
		if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
		} else if( this.readyState === "error" ) {
		}
	};
}

script.src = 'http://code.jquery.com/jquery-latest.js';
head.insertBefore(script, head.firstChild);
*/


	
})();


window.__evalscript__ = function(script) {
	with({}) {
		return eval(script);
	}
};

(function() {
	

var DefaultCSS3Validator = (function() {
	"use strict"

	var PREFIX_KEYS = [
		'align-content',
		'align-items',
		'align-self',
		'animation-delay',
		'animation-direction',
		'animation-duration',
		'animation-fill-mode',
		'animation-iteration-count',
		'animation-name',
		'animation-play-state',
		'animation-timing-function',
		'appearance',
		'backface-visibility',
		'background-clip',
		'background-composite',
		'background-origin',
		'background-size',
		'border-fit',
		'border-horizontal-spacing',
		'border-image',
		'border-vertical-spacing',
		'box-align',
		'box-decoration-break',
		'box-direction',
		'box-flex',
		'box-flex-group',
		'box-lines',
		'box-ordinal-group',
		'box-orient',
		'box-pack',
		'box-reflect',
		'box-shadow',
		'box-sizing',
		'color-correction',
		'column-axis',
		'column-break-after',
		'column-break-before',
		'column-break-inside',
		'column-count',
		'column-gap',
		'column-rule-color',
		'column-rule-style',
		'column-rule-width',
		'column-span',
		'column-width',
		'filter',
		'flex',
		'flex-direction',
		'flex-flow',
		'flex-wrap',
		'flow-from',
		'flow-into',
		'flex-glow',
		'flex-shrink',
		'flex-basis',
		'font-kerning',
		'font-smoothing',
		'font-variant-ligatures',
		'grid-column',
		'grid-columns',
		'grid-row',
		'grid-rows',
		'highlight',
		'hyphenate-character',
		'hyphenate-limit-after',
		'hyphenate-limit-before',
		'hyphenate-limit-lines',
		'hyphens',
		'justify-content',
		'line-align',
		'line-box-contain',
		'line-break',
		'line-clamp',
		'line-grid',
		'line-snap',
		'locale',
		'margin-after-collapse',
		'margin-before-collapse',
		'marquee-direction',
		'marquee-increment',
		'marquee-repetition',
		'marquee-style',
		'mask-attachment',
		'mask-box-image',
		'mask-box-image-outset',
		'mask-box-image-repeat',
		'mask-box-image-slice',
		'mask-box-image-source',
		'mask-box-image-width',
		'mask-clip',
		'mask-composite',
		'mask-image',
		'mask-origin',
		'mask-position',
		'mask-repeat',
		'mask-size',
		'nbsp-mode',
		'order',
		'perspective',
		'perspective-origin',
		'print-color-adjust',
		'region-break-after',
		'region-break-before',
		'region-break-inside',
		'region-overflow',
		'rtl-ordering',
		'shape-inside',
		'shape-outside',
		'svg-shadow',
		'tap-highlight-color',
		'text-combine',
		'text-decorations-in-effect',
		'text-emphasis-color',
		'text-emphasis-position',
		'text-emphasis-style',
		'text-fill-color',
		'text-orientation',
		'text-security',
		'text-stroke-color',
		'text-stroke-width',
		'transform',
		'transform-origin',
		'transform-style',
		'transition',
		'transition-delay',
		'transition-duration',
		'transition-property',
		'transition-timing-function',
		'user-drag',
		'user-modify',
		'user-select',
		'wrap-flow',
		'wrap-margin',
		'wrap-padding',
		'wrap-through',
		'writing-mode',
		'text-size-adjust'
	];

	var PREFIX_VALUES = {
		'display': ['box', 'flex', 'flexbox'],
		'transition': ['transform'],
		'transition-property': ['transform']
	};
	
	var NUMBER_SUFFIXES = {
		'height': 'px',
		'min-height': 'px',
		'max-height': 'px',
		'width': 'px',
		'min-width': 'px',
		'max-width': 'px',
		'margin': 'px',
		'margin-left': 'px',
		'margin-right': 'px',
		'margin-top': 'px', 
		'margin-bottom': 'px', 
		'padding': 'px',
		'padding-left': 'px',
		'padding-right': 'px',
		'padding-top': 'px',
		'padding-bottom': 'px',
		'line-height': 'px',
		'marquee-increment': 'px',
		'mask-box-image-outset': 'px',
		'column-rule-width': 'px',
		'border-image-outset': 'px',
		'border-left-width': 'px',
		'border-right-width': 'px',
		'border-top-width': 'px',
		'border-bottom-width': 'px',
		'border-radius': 'px',
		'border-top-left-radius': 'px',
		'border-top-right-radius': 'px',
		'border-bottom-left-radius': 'px',
		'border-bottom-right-radius': 'px',
		'outline-offset': 'px',
		'outline-width': 'px',
		'word-spacing': 'px',
		'text-indent': 'px',
		'font-size': 'px',

		'animation-duration': 's',
		'animation-delay': 's',
		'transition-delay': 's',
		'transition-duration': 's',

		'perspective-origin': '%',
		'text-stroke-width': 'px'
	};

	// remove prefix in value
	function normalizeValue(v) {
		if( !v || typeof(v) !== 'string' ) return v;

		v = v.trim();
		v = v.split('-webkit-').join('');
		v = v.split('-moz-').join('');
		v = v.split('-ms-').join('');
		v = v.split('-o-').join('');
		v = v.split('-wap-').join('');

		return v;
	}
	
	// remove prefix in key
	function normalizeKey(v) {
		if( typeof(v) === 'string' ) return normalizeValue(v.toLowerCase());
		return v;
	}

	// class DefaultCSSValidator
	function DefaultCSS3Validator(prefix) {
		prefix = prefix || '';
		if( prefix ) prefix = '-' + prefix + '-';
		prefix = prefix.split('--').join('-');
		this.prefix = prefix;
	}

	DefaultCSS3Validator.prototype = {
		rule: function(rule) {
			if( typeof(rule) !== 'string' ) throw new Error('invalid css rule', rule);

			var rule = normalizeValue(rule);
			
			var device;
			var prefix = this.prefix;
			if( ~rule.indexOf(':input-placeholder') || ~rule.indexOf(':placeholder')) {
				rule = rule.split('::input-placeholder').join(':placeholder');
				rule = rule.split(':input-placeholder').join(':placeholder');
				rule = rule.split('::placeholder').join(':placeholder');
				rule = rule.split(':placeholder').join('::placeholder');

				device = [];

				if( prefix === '-ms-' ) {
					device = rule.split('::placeholder').join(':' + prefix + 'input-placeholder');
				} else if( prefix === '-webkit-' ) {
					device = rule.split('::placeholder').join('::' + prefix + 'input-placeholder');
				} else if( prefix === '-moz-' ) {
					device.push(rule.split('::placeholder').join(':' + prefix + 'placeholder'));
					device.push(rule.split('::placeholder').join('::' + prefix + 'placeholder'));
				} else {
					device = rule.split('::placeholder').join('::' + prefix + 'placeholder');
				}
			}

			if( ~rule.indexOf('@keyframes') ) device = rule.split('@keyframes').join('@' + prefix + 'keyframes');
			
			device = device || rule;

			return {
				original: rule,
				device: device
			};
		},
		key: function(key) {
			if( typeof(key) !== 'string' ) throw new Error('invalid css key', key);

			key = normalizeKey(key);

			var deviceKey = key;
			if(~PREFIX_KEYS.indexOf(key)) {
				deviceKey = this.prefix + key;
			}
			
			return {
				original: key,
				device: deviceKey,
				merged: (key === deviceKey) ? key : [key, deviceKey]
			};
		},
		value: function(key, value) {
			if( typeof(key) !== 'string' ) throw new Error('invalid css key', key);
			
			var key = this.key(key);

			var processValue = function(prefix, keyname, value) {
				value = normalizeValue(value);

				var pv = PREFIX_VALUES[keyname];
				var targetValue = pv ? pv[pv.indexOf(value)] : null;

				return {
					key: key,
					original: value,
					device: (( targetValue ) ? (prefix + targetValue) : value)
				};
			};
			
			var prefix = this.prefix;			
			if( typeof(value) === 'string' ) {
				var splits = value.split(',');

				var argo = [];
				var argd = [];
				for(var i=0; i < splits.length; i++) {
					var value = splits[i].trim();

					var result = processValue(prefix, key.original, value);
					argo.push(result.original);
					argd.push(result.device);
				}

				return {
					key: key,
					original: argo.join(', '),
					device: argd.join(', ')
				};
			} else if( typeof(value) === 'number' ) {
				value = ((value === 0) ? '0' : (value + (NUMBER_SUFFIXES[key.original] || '')));

				return {
					key: key,
					original: value,
					device: value
				};
			}

			return {
				key: key,
				original: value,
				device: value
			};
		}
	};

	return DefaultCSS3Validator;
})();


var CSS3Calibrator = (function() {
	"use strict"
	
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

	function CSS3Calibrator(device) {
		this.device = device;
		var prefix = device.prefix;
		if( !prefix || typeof(prefix) !== 'string' ) prefix = '';
		this.adapter = new DefaultCSS3Validator(prefix || '');
	}

	CSS3Calibrator.prototype = {
		adapter: function(c) {
			if( !arguments.length ) return this.adapter;
			if( typeof(c) !== 'object' ) throw new Error('invalid calibrator(object)', c);
			this.adapter = c;
			return this;
		},
		camelcase: function(key) {
			if( key === 'float' ) {
				if( this.device.is('ie') ) return 'styleFloat';
				else if( this.device.is('gecko') ) return 'cssFloat';
			}

			return camelcase(key);
		},
		value: function(key, value) {
			if( typeof(key) !== 'string' ) throw new Error('invalid key(string)', key);

			if( Array.isArray(value) ) {
				var o = {original:{},device:{},merged:{}};

				for(var i=0; i < value.length; i++) {
					var result = this.adapter.value(key, value[i]);

					var k = result.key;

					if( !o.original[k.original] ) o.original[k.original] = [];
					if( !o.device[k.device] ) o.device[k.device] = [];

					o.original[k.original].push(result.original);
					o.device[k.device].push(result.device);

					if( key.original === key.device ) {
						if( !o.merged[k.original] ) o.merged[k.original] = [];

						if( result.original === result.device ) {
							o.merged[k.original].push(result.original);
						} else {
							o.merged[k.original].push(result.original);
							o.merged[k.device].push(result.device);
						}
					} else {
						if( !o.merged[k.original] ) o.merged[k.original] = [];						
						if( !o.merged[k.device] ) o.merged[k.device] = [];

						o.merged[k.original].push(result.original);
						o.merged[k.device].push(result.device);
					}
				}

				return o;
			} else {
				var result = this.adapter.value(key, value);

				var k = result.key;
				
				var o = {original:{},device:{},merged:{}};
				o.original[k.original] = result.original;
				o.device[k.device] = result.device;
				
				if( k.original === k.device && result.original !== result.device ) {
					o.merged[k.original] = [];
					o.merged[k.original].push(result.original);
					o.merged[k.original].push(result.device);
				} else {
					o.merged[k.original] = result.original;
					o.merged[k.device] = result.device;
				}
				return o;
			}
		},
		values: function(values) {
			if( typeof(values) !== 'object' ) throw new Error('invalid values(object)');
			
			var result = {
				original: {},
				device: {},
				merged: {}
			};
			for(var key in values) {
				if( !values.hasOwnProperty(key) ) continue;
								
				var calibrated = this.value(key, values[key]);
				key = this.key(key);

				result.original[key.original] = calibrated.original[key.original];
				result.device[key.device] = calibrated.device[key.device];

				if( !Array.isArray(key.merged) ) key.merged = [key.merged];

				for(var i=0; i < key.merged.length;i++) {
					result.merged[key.merged[i]] = calibrated.merged[key.merged[i]];
				}
			}
			return result;
		},
		key: function(key) {
			if( typeof(key) !== 'string' ) throw new Error('invalid key(string)', key);
			return this.adapter.key(key);
		},
		rule: function(rule) {
			if( typeof(rule) !== 'string' ) throw new Error('invalid rule(string)', rule);

			if( ~rule.indexOf(',') ) rule = rule.split(',');
			
			if( Array.isArray(rule) ) {
				var result = {
					original: [],
					device: [],
					merged: []
				};

				for(var i=0; i < rule.length;i++) {
					var calibrated = this.adapter.rule(rule[i].trim());

					result.original.push(calibrated.original);
					result.device.push(calibrated.device);

					if( calibrated.original === calibrated.device ) {
						result.merged.push(calibrated.original);
					} else {
						result.merged.push(calibrated.original);

						if( Array.isArray(calibrated.device) ) result.merged = result.merged.concat(calibrated.device);
						else result.merged.push(calibrated.device);
					}
				}

				result.original = result.original.join(', ');
				result.device = result.device.join(', ');
				result.merged = result.merged.join(', ');

				return result;
			} else {
				var result = {};

				var calibrated = this.adapter.rule(rule);
				result.original = calibrated.original;
				result.device = calibrated.device;
				if( calibrated.original !== calibrated.device ) {
					result.merged = [calibrated.original];	
					
					if( Array.isArray(calibrated.device) ) result.merged = result.merged.concat(calibrated.device);
					else result.merged.push(calibrated.device);	
				} else {
					result.merged = result.original;
				}

				if(Array.isArray(result.original)) result.original = result.original.join(', ');
				if(Array.isArray(result.device)) result.device = result.device.join(', ');
				if(Array.isArray(result.merged)) result.merged = result.merged.join(', ');

				return result;
			}
		},
		proofread: function(rule, values) {
			var rules = this.rule(rule);
			values = this.values(values);

			var result = {
				original: {},
				device: {},
				merged: {}
			};

			var args = rules.original;
			if( !Array.isArray(args) ) args = [args];
			for(var i=0; i < args.length;i++) {
				var rule = args[i];
				result.original[rule] = values.original;
			}

			args = rules.device;
			if( !Array.isArray(args) ) args = [args];
			for(var i=0; i < args.length;i++) {
				var rule = args[i];
				result.device[rule] = values.device;
			}

			args = rules.merged;
			if( !Array.isArray(args) ) args = [args];
			for(var i=0; i < args.length;i++) {
				var rule = args[i];
				result.merged[rule] = values.merged;
			}
			
			return result;
		}
	};

	return CSS3Calibrator;
})();

/*

var c = new CSS3Calibrator('-webkit-');

if( false ) {
	console.log('display', JSON.stringify(c.key('display'), null, '\t'), '\n\n\n');
	console.log('box-flex', JSON.stringify(c.key('box-flex'), null, '\t'), '\n\n\n');
	console.log('-webkit-box-flex', JSON.stringify(c.key('-webkit-box-flex'), null, '\t'), '\n\n\n');
	console.log('-ms-box-flex', JSON.stringify(c.key('-ms-box-flex'), null, '\t'), '\n\n\n');
	console.log('-o-box-flex', JSON.stringify(c.key('-o-box-flex'), null, '\t'), '\n\n\n');
	console.log('-moz-box-flex', JSON.stringify(c.key('-moz-box-flex'), null, '\t'), '\n\n\n');
}

if( false ) {
	console.log('transition(width, transform, height)', JSON.stringify(c.value('transition', 'width, transform, height'), null, '\t'), '\n\n\n');
	console.log('transition(transform)', JSON.stringify(c.value('transition', 'transform'), null, '\t'), '\n\n\n');
	console.log('display(box)', JSON.stringify(c.value('display', 'box'), null, '\t'), '\n\n\n');
	console.log('display(block)', JSON.stringify(c.value('display', 'block'), null, '\t'), '\n\n\n');
	console.log('display(flex)', JSON.stringify(c.value('display', 'flex'), null, '\t'), '\n\n\n');
	console.log('box-flex', JSON.stringify(c.value('box-flex', 1), null, '\t'), '\n\n\n');
	console.log('height', JSON.stringify(c.value('height', 100), null, '\t'), '\n\n\n');
	
	console.log('display([box, flex])', JSON.stringify(c.value('display', ['box', 'flex']), null, '\t'), '\n\n\n');
	console.log('box-flex([1,2])', JSON.stringify(c.value('box-flex', [1, 2]), null, '\t'), '\n\n\n');
}

if( false ) {
	var o = {
		'display': 'box',
		'box-flex': 1,
		'box-align': 'start',
		'margin': 0,
		'height': 100,
		'transition': 'transform, width',
		'-moz-transition': 'background-color, color',
		'font-weight': 'bold'
	};

	console.log('values', JSON.stringify(c.values(o), null, '\t'), '\n\n\n');
}

if( false ) {
	console.log('.cmp, #cmp', JSON.stringify(c.rule('.cmp, #cmp'), null, '\t'), '\n\n\n');
	console.log('.cmp, .cmp:input-placeholder, #cmp, .cmp > .a, .cmp .b', JSON.stringify(c.rule('.cmp, .cmp:input-placeholder, #cmp, .cmp > .a, .cmp .b'), null, '\t'), '\n\n\n');
	console.log('@keyframes', JSON.stringify(c.rule('@keyframes'), null, '\t'), '\n\n\n');
	console.log('@-webkit-keyframes', JSON.stringify(c.rule('@-webkit-keyframes'), null, '\t'), '\n\n\n');
	console.log('.cmp:input-placeholder', JSON.stringify(c.rule('.cmp:input-placeholder'), null, '\t'), '\n\n\n');
	console.log('.cmp::input-placeholder', JSON.stringify(c.rule('.cmp::input-placeholder'), null, '\t'), '\n\n\n');
	console.log('.cmp::-webkit-input-placeholder', JSON.stringify(c.rule('.cmp::-webkit-input-placeholder'), null, '\t'), '\n\n\n');
	console.log('.cmp:-ms-input-placeholder', JSON.stringify(c.rule('.cmp:-ms-input-placeholder'), null, '\t'), '\n\n\n');
}

if( true ) {
	console.log('.field_text::input-placeholder ', JSON.stringify(c.rule('.field_text::input-placeholder '), null, '\t'), '\n\n\n');
}

if( false ) {
	var rule = '.cmp, .cmp:input-placeholder, #cmp, .cmp > .a, .cmp .b';
	var o = {
		'display': ['box', 'flex'],
		'box-flex': 1,
		'box-align': 'start',
		'margin': 0,
		'height': 100,
		'transition': 'transform, width',
		'font-weight': 'bold'
	};

	console.log(rule, JSON.stringify(c.proofread(rule, o), null, '\t'), '\n\n\n');
}

if( false ) {
	var rule = '.cmp';
	var o = {
		'display': ['box', 'flex'],
		'box-flex': 1,
		'box-align': 'start',
		'margin': 0,
		'height': 100,
		'transition': 'transform, width',
		'font-weight': 'bold'
	};

	console.log(rule, JSON.stringify(c.proofread(rule, o), null, '\t'), '\n\n\n');
}


- key(key)
	display
	{
		original: 'display',
		device: 'display',
		merged: 'display'
	}

	box-flex
	{
		original: 'box-flex',
		device: '-webkit-box-flex',
		merged: ['box-flex', '-webkit-box-flex']
	}

	-webkit-box-flex
	{
		original: 'box-flex',
		device: '-webkit-box-flex',
		merged: ['box-flex', '-webkit-box-flex']
	}

- value(key, value)
	display, box
	{
		original: {
			'display': 'box'
		},
		device: {
			'display': '-webkit-box'
		},
		merged: {
			'display': ['box', '-webkit-box']
		}
	}

	box-flex, 1
	{
		original: {
			'box-flex': '1'
		},
		device: {
			'-webkit-box-flex': '1'
		},
		merged: {
			'box-flex': '1',
			'-webkit-box-flex': '1'
		}
	}

- rule(rule)
	.cmp
	{
		original: '.cmp',
		device: '.cmp',
		merged: '.cmp'
	}

	.cmp:input-placeholder
	{
		original: '.cmp:input-placeholder',
		device: '.cmp::-webkit-input-placeholder',
		merged: ['.cmp:input-placeholder', '.cmp::-webkit-input-placeholder']
	}

	.cmp, .cmp:input-placeholder, #cmp, .cmp > .a, .cmp
	{
		original: ['.cmp', '.cmp:input-placeholder, #cmp', '.cmp > .a', '.cmp'],
		device: ['.cmp', '.cmp:input-placeholder, #cmp', '.cmp > .a', '.cmp'],
		merged: ['.cmp', '.cmp:input-placeholder', '.cmp::-webkit-input-placeholder', '#cmp', '.cmp > .a']
	}

- proofread(rule, o)
	".view > .a, .view > .b::input-placeholder", {
		'display': 'box',
		'box-flex': 1
	}

	{
		original: {
			'.view > .a': {
				'display': 'box',
				'box-flex': 1
			},
			'.view > .b::input-placeholder': {
				'display': 'box',
				'box-flex': 1
			}
		},
		device: {
			'.view > .a': {
				'display': '-webkit-box',
				'-webkit-box-flex': 1
			},
			'.view > .b::-webkit-input-placeholder': {
				'display': '-webkit-box',
				'-webkit-box-flex': 1
			}
		},
		merged: {
			'.view > .a': {
				'display': ['box', '-webkit-box'],
				'-webkit-box-flex': 1,
				'box-flex': 1
			},
			'.view > .b::input-placeholder': {
				'display': ['box', '-webkit-box'],
				'-webkit-box-flex': 1,
				'box-flex': 1
			},
			'.view > .b::-webkit-input-placeholder': {
				'display': ['box', '-webkit-box'],
				'-webkit-box-flex': 1,
				'box-flex': 1
			}
		}
	}
*/

var Device = (function() {
	// class device
	function Device() {
		"use strict";
		
		var nav = window.navigator;
		var _platform = nav.platform;
		var agent = nav.userAgent;
		
		var platform = {
			name: '',
			version: '',
			codename: '',
			type: ''
		};
		var device = 'desktop';
		var engine = '';
		var browser = '';
		var version = '';
		var retina = ('devicePixelRatio' in window && window.devicePixelRatio > 1);
		var touchable = 'ontouchstart' in window;
		var prefix = '';
		var hasTransform = false;
		var has3d = false;
		var resolution = {
			width: screen.width,
			height: screen.height 
		};
		
		if( ~agent.indexOf('Seamonkey/') ) engine = 'gecko', browser = 'seamonkey', prefix = '-moz-';
		else if( ~agent.indexOf('Firefox/') ) engine = 'gecko', browser = 'firefox', prefix = '-moz-';
		else if( ~agent.indexOf('Opera/') ) engine = 'presto', browser = 'opera', prefix = '-o-';
		else if( ~agent.indexOf('MSIE ') ) engine = 'trident', browser = 'msie', prefix = '-ms-';
		else if( ~agent.indexOf('webOS/') ) engine = 'webkit', browser = 'webos', prefix = '-webkit-';
		else if( ~agent.indexOf('Chromium/') ) engine = 'webkit', browser = 'chromium', prefix = '-webkit-';
		else if( ~agent.indexOf('Chrome/') ) engine = 'webkit', browser = 'chrome', prefix = '-webkit-';
		else if( ~agent.indexOf('Android') ) engine = 'webkit', browser = 'android', prefix = '-webkit-';
		else if( ~agent.indexOf('Safari/') ) engine = 'webkit', browser = 'safari', prefix = '-webkit-';
		else if( ~agent.indexOf('Kindle/')) engine = 'netfront', browser = 'kindle', prefix = '', platform = {name: 'kindle', type: 'tablet'};
		else if( ~agent.indexOf('NetFront/')) engine = 'netfront', browser = 'netfront', prefix = '';
		else if( ~agent.indexOf('BlackBerry')) engine = 'webkit', browser = 'blackberry', prefix = '', platform = {name: 'kindle', type: 'tablet'};
		else if( ~agent.indexOf('AppleWebKit/') ) engine = 'webkit', browser = 'webkit', prefix = '-webkit-';
		else if( ~agent.indexOf('Gecko/') ) engine = 'gecko', browser = 'gecko', prefix = '-moz-';
				
		if( !platform.name ) {
			if( ~agent.indexOf('(iPhone;') ) device = 'iphone', platform = {name: 'ios', type: 'mobile'};
			else if( ~agent.indexOf('(iPad;') ) device = 'ipad', platform = {name: 'ios', type: 'tablet'};
			else if( ~agent.indexOf('(iPod;') ) device = 'ipod', platform = {name: 'ios', type: 'mobile'};
			else if( ~agent.indexOf('Android') && ~agent.indexOf('Mobile') ) device = 'android', platform = {name: 'android', type: 'mobile'};
			else if( ~agent.indexOf('Android') ) device = 'android', platform = {name: 'android', type: 'tablet'};
		}

		if( !platform.type ) {
			if( (/ipad|android 3|xoom|sch-i800|playbook|tablet|kindle/i.test(agent.toLowerCase())) ) platform.type = 'tablet';
			else if( (/iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(agent.toLowerCase())) ) platform.type = 'mobile';
		}
		
		if( !platform.name ) {			
			if( ~agent.indexOf('Mac OS X;') ) platform = {name: 'osx', type: 'desktop'};
			else if( ~agent.indexOf('Mac OS') ) platform = {name: 'mac', type: 'desktop'};
			else if( ~agent.indexOf('Windows;') || _platform === 'Win32' ) platform = {name: 'windows', type: 'desktop'};
			else if( ~agent.indexOf('Linux;') ) platform = {name: 'linux', type: 'desktop'};
			else platform.name = _platform;
		}
		
		var style = document.documentElement.style;
		if( engine == 'webkit' ) hasTransform = ('webkitTransform' in style), has3d = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix());
		else if( engine == 'gecko' ) hasTransform = ('MozTransform' in style);
		else if( engine == 'presto' ) hasTransform = ('OTransform' in style);
		else if( engine == 'trident' ) hasTransform = ('MSTransform' in style);
		if( !hasTransform ) hasTransform = ('Transform' in style);
		
		var index;
		if( browser === 'android' && ~(index = agent.indexOf('Android')) ) version = platform.version = agent.substring(index + 7, agent.indexOf(' ', index + 1));
		else if( browser === 'msie' && ~(index = agent.indexOf('MSIE ')) ) version = agent.substring(index + 5, agent.indexOf(';', index + 1));
		else if( browser === 'chrome' && ~(index = agent.indexOf('Chrome/')) ) version = agent.substring(index + 7, agent.indexOf(' ', index + 1));
		else if( browser === 'safari' && ~(index = agent.indexOf('Version/')) ) version = agent.substring(index + 8, agent.indexOf(' ', index + 1));
		
		this.agent = agent;
		this.platform = platform;
		this.device = device;
		this.engine = engine;
		this.browser = browser;
		this.versionString = version;
		this.version = parseInt(version.split('.')[0]);
		this.retina = retina;
		this.touchable = touchable;
		this.prefix = prefix;
		this.transform = hasTransform;
		this.has3d = has3d;
		this.resolution = resolution;

		this.calibrator = new CSS3Calibrator(this);
		
		// represent attributes
		this.gecko = (this.engine === 'gecko');
		this.webkit = (this.engine === 'webkit');
		
		this.firefox = (this.browser === 'firefox');
		this.ie = (this.browser === 'msie');
		this.opera = (this.browser === 'opera');
		this.chrome = (this.browser === 'chrome');
		this.safari = (this.browser === 'safari');
		
		this.iphone = (this.device === 'iphone');
		this.ipad = (this.device === 'ipad');
		this.ipod = (this.device === 'ios');

		this.ios = (this.platform.name === 'ios');
		this.android = (this.platform.name === 'android');
		this.osx = (this.platform.name === 'osx');
		this.windows = (this.platform.name === 'windows');
		this.linux = (this.platform.name === 'linux');		

		this.phone = (this.platform.type === 'phone');
		this.tablet = (this.platform.type === 'tablet');
		this.desktop = (this.platform.type === 'desktop');		

		// gecko 의 경우 innerText 바인딩
		if( engine === 'gecko' && window.HTMLElement && window.HTMLElement.prototype.__defineGetter__ ) {
			HTMLElement.prototype.__defineGetter__("innerText",function() {
				if(this.textContent) {
					return(this.textContent)
				} 
				else {
					var r = this.ownerDocument.createRange();
					r.selectNodeContents(this);
					return r.toString();
				}
			});
			
			HTMLElement.prototype.__defineSetter__("innerText",function(sText) {
				this.innerHTML = sText
			});
		}

		//console.log('device', JSON.stringify(this, null, '\t'));
	}

	Device.prototype = {
		is: function(query) {
			with(this) {
				try {
					return eval(query);
				} catch(err) {
					console.warn('incorrect query [' + query + ']', err.message);
					return false;
				} 
			}
		}
	};

	return new Device();
})();


//console.log('Device', Device.is('webkit && version > 30 && desktop'));

var StyleSession = (function() {
	"use strict"
	
	var calibrator = Device.calibrator;

	// class Template
	function StyleSession(el) {
		this.el = el;
		this.buffer = {};
	}

	StyleSession.prototype = {
		toString: function() {
			return this.text();
		},
		toJSON: function() {
			return this.get();
		},
		raw: function(text) {
			if( !arguments.length ) return this.el.style.cssText;			
			if( typeof(text) === 'string' ) this.el.attr('style', text);
			return this;
		},
		text: function(text) {
			if( !arguments.length ) {
				var styles = this.get();
			
				var text = '';
				for(var key in styles) {
					text += key + ': ' + (styles[key] || '') + '; ';
				}
				
				return text;
			}
			
			if( typeof(text) === 'string') {
				var args = text.split(';');
				for(var i=0; i < args.length ; i++) {					
					var item = args[i];
					if( item ) {
						var keyvalue = item.split(':');
						var key = keyvalue[0];
						var value = keyvalue[1];
						if( typeof(value) === 'string') value = value.trim();
						
						this.set(key.trim(), value);
					}
				}
			} else {
				console.error('[WARN] illegal style text', text);
			}
			
			return this;
		},
		get: function(key) {
			if( !arguments.length ) {
				var o = {};
				var el = this.el;
				
				var raw = el.style.cssText;
				if( raw ) {
					var args = raw.split(';');
					for(var i=0; i < args.length ; i++) {					
						var item = args[i];
						if( item ) {
							var keyvalue = item.split(':');
							var key = calibrator.key(keyvalue[0].trim()).original;
							
							o[key] = this.get(key);
						}
					}
				}
				
				var buffer = this.buffer;
				for(var key in buffer) {
					o[key] = buffer[key];
				}
				
				return o;				
			}
			
			if( typeof(key) !== 'string' ) console.error('[WARN] invalid key', key);
			
			var buffer = this.buffer;
			if( buffer[key] ) return buffer[key];
			
			var el = this.el;
			key = calibrator.key(key);
			var value = el.style[calibrator.camelcase(key.device)] || el.style[calibrator.camelcase(key.original)];
			var calibrated = calibrator.value(key.original, value);
			return calibrated.original[key.original];
		},
		set: function(key, value) {
			if( arguments.length === 1 && key === false ) return this.clear();
						
			var o = {};
			if( typeof(key) === 'string' ) o[key] = value;
			else if( typeof(key) === 'object' ) o = key;
			else return this;

			var calibrated = calibrator.values(o);
			var merged = calibrated.merged;
			var buffer = this.buffer;
			
			if( merged ) {
				for(var key in merged) {
					if( !merged.hasOwnProperty(key) ) continue;
				
					var value = merged[key];
					buffer[key] = value;
				}
			}
			
			return this;
		},
		clear: function() {
			this.buffer = {$clear: true};
		},
		rollback: function() {
			this.buffer = {};
		},
		commit: function() {
			var el = this.el;
			
			try {
				var original = el.style.cssText;
				var buffer = this.buffer || {};
				this.buffer = {};
				if( buffer.$clear) el.style.cssText = '';
			
				for(var key in buffer) {
					if( !buffer.hasOwnProperty(key) ) continue;
				
					var value = buffer[key];
					key = calibrator.camelcase(key);
					if( !Array.isArray(value) ) value = [value];
									
					for(var i=0; i < value.length; i++) {
						try {
							if( value[i] === false ) el.style[key] = null;
							else el.style[key] = value[i];
						} catch(err) {
							console.error('[ERROR] style write failure (' + key + ':' + value[i] + ')');
							el.style.cssText = original;
							return this;
						}
					}
				}
			
				if( !el.style.cssText ) el.removeAttribute('style');
			} catch(err) {
				console.error('[ERROR] style write failure (' + err.message + ')', buffer, err);
				el.style.cssText = original;
			}
			
			return this;			
		}
	};

	return StyleSession;
})();

// test
if( false ) {
	var el = document.createElement('div');
	el.style.cssText = 'display:block;width:100%;';
	
	var session = new StyleSession(el);
	
	console.log('el', el);
	console.log('raw', session.raw());
	console.log('text', session.text());
	console.log('toString', session.toString());
	console.log('json', JSON.stringify(session));
	console.log('display', session.get('display'));
	console.log('width', session.get('width'));	
	
	session.set('font-weight', 'bold');
	session.set('height', 50);
	session.set('transition', 'all 1s');
	console.log('raw', session.raw());
	console.log('json', JSON.stringify(session));
	console.log('buffer', session.buffer);
	session.commit();
}


var Color = (function() {
	"use strict"

	return {
		hexToR : function(h) {return parseInt((this.cutHex(h)).substring(0,2),16)},
		hexToG : function(h) {return parseInt((this.cutHex(h)).substring(2,4),16)},
		hexToB : function(h) {return parseInt((this.cutHex(h)).substring(4,6),16)},
		cutHex : function(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h},
		toRGBA : function(h, alpha) {
			if( !h ) return null;
			if( ! alpha ) alpha = 1;
			alpha = parseInt(alpha);
			if( isNaN(alpha) ) alpha = 1;

			//*console.log(h);

			if( typeof(h) == 'object' ) {
				return 'rgba(' + h.r + ',' + h.g + ',' + h.b + ',' + alpha + ')';
			} else if( typeof(h) == 'string' ) {		
				return 'rgba(' + this.hexToR(h) + ',' + this.hexToG(h) + ',' + this.hexToB(h) + ',' + alpha + ')';
			}
		},
		toRGB : function(h) {
			if( !h ) return null;
			return {
				r : this.hexToR(h),
				g : this.hexToG(h),
				b : this.hexToB(h)
			};
		},
		changeAlpha: function(rgba, alpha) {
			if( !rgba ) return null;

			if( rgba.startsWith('#') ) {
				var rgba = toRGB(rgba);
			}

			if( rgba.startsWith('rgba(') ) {
				var digits = /(.*?)rgba\((.*?),(.*?),(.*?),(.*?)\)(.*?)/.exec(rgba);
			} else if( rgba.startsWith('rgb(') ) {
				var digits = /(.*?)rgb\((.*?),(.*?),(.*?)\)(.*?)/.exec(rgba);
			}

			if( digits ) {
				var r = parseInt(digits[2]);
				var g = parseInt(digits[3]);
				var b = parseInt(digits[4]);

				return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
			}
			return null;
		},
		getAlpha: function(rgba) {
			if( !rgba ) return null;
			if( rgba.startsWith('rgba(') ) {
				var digits = /(.*?)rgba\((.*?),(.*?),(.*?),(.*?)\)(.*?)/.exec(rgba);
				
				var a = parseFloat(digits[5]);
				return a;
			}
			return null;
		},
		toHex: function(rgba) {
			if( !rgba ) return null;
			if( rgba.startsWith('rgba(') ) {
				var digits = /(.*?)rgba\((.*?),(.*?),(.*?),(.*?)\)(.*?)/.exec(rgba);
				
				var red = parseInt(digits[2]);
				var green = parseInt(digits[3]);
				var blue = parseInt(digits[4]);
				
				var rgb = blue | (green << 8) | (red << 16);
				return '#' + rgb.toString(16).toUpperCase();
			} else if( rgba.startsWith('rgb(') ) {
				var digits = /(.*?)rgb\((.*?),(.*?),(.*?)\)(.*?)/.exec(rgba);
				
				var red = parseInt(digits[2]);
				var green = parseInt(digits[3]);
				var blue = parseInt(digits[4]);
				
				var rgb = blue | (green << 8) | (red << 16);
				return '#' + rgb.toString(16).toUpperCase();
			} else if( rgba.startsWith('#') ) {
				return rgba;
			} else {
				return null;
			}
		},
		sumRGB : function(h, r, g, b) {
			if( !h ) return null;
			var a = {
				r : this.hexToR(h) + r,
				g : this.hexToG(h) + g,
				b : this.hexToB(h) + b
			};

			a.r = (a.r <= 255) ? a.r : 255;
			a.g = (a.g <= 255) ? a.g : 255;
			a.b = (a.b <= 255) ? a.b : 255;

			return a;
		},
		sumRGBA : function(h, r, g, b, alpha) {
			if( !h ) return null;
			var a;
			
			if( typeof(h) == 'object' ) {
				a = {
					r : h.r + r,
					g : h.g + g,
					b : h.b + b
				};
			} else if( typeof(h) == 'string' ) {
				a = {
					r : this.hexToR(h) + r,
					g : this.hexToG(h) + g,
					b : this.hexToB(h) + b
				};
			}

			a.r = (a.r <= 255) ? a.r : 255;
			a.g = (a.g <= 255) ? a.g : 255;
			a.b = (a.b <= 255) ? a.b : 255;

			return this.toRGBA(a, alpha);
		}
	};
})();


var DateUtil = (function() {
	"use strict"

	/*
	 * Date Format 1.2.3
	 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
	 * MIT license
	 *
	 * Includes enhancements by Scott Trenda <scott.trenda.net>
	 * and Kris Kowal <cixar.com/~kris.kowal/>
	 *
	 * Accepts a date, a mask, or a date and a mask.
	 * Returns a formatted version of the given date.
	 * The date defaults to the current date/time.
	 * The mask defaults to dateFormat.masks.default.
	 */
	var dateFormat = function () {
		var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
			timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
			timezoneClip = /[^-+\dA-Z]/g,
			pad = function (val, len) {
				val = String(val);
				len = len || 2;
				while (val.length < len) val = "0" + val;
				return val;
			};

		// Regexes and supporting functions are cached through closure
		return function (date, mask, utc) {
			var dF = dateFormat;

			// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
			if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
				mask = date;
				date = undefined;
			}

			// Passing date through Date applies Date.parse, if necessary
			date = date ? new Date(date) : new Date;
			//if (isNaN(date)) throw SyntaxError("invalid date");
			if (isNaN(date)) return date;

			mask = String(dF.masks[mask] || mask || dF.masks["default"]);

			// Allow setting the utc argument via the mask
			if (mask.slice(0, 4) == "UTC:") {
				mask = mask.slice(4);
				utc = true;
			}

			var	_ = utc ? "getUTC" : "get",
				d = date[_ + "Date"](),
				D = date[_ + "Day"](),
				m = date[_ + "Month"](),
				y = date[_ + "FullYear"](),
				H = date[_ + "Hours"](),
				M = date[_ + "Minutes"](),
				s = date[_ + "Seconds"](),
				L = date[_ + "Milliseconds"](),
				o = utc ? 0 : date.getTimezoneOffset(),
				flags = {
					d:    d,
					dd:   pad(d),
					ddd:  dF.i18n.dayNames[D],
					dddd: dF.i18n.dayNames[D + 7],
					m:    m + 1,
					mm:   pad(m + 1),
					mmm:  dF.i18n.monthNames[m],
					mmmm: dF.i18n.monthNames[m + 12],
					yy:   String(y).slice(2),
					yyyy: y,
					h:    H % 12 || 12,
					hh:   pad(H % 12 || 12),
					H:    H,
					HH:   pad(H),
					M:    M,
					MM:   pad(M),
					s:    s,
					ss:   pad(s),
					l:    pad(L, 3),
					L:    pad(L > 99 ? Math.round(L / 10) : L),
					t:    H < 12 ? "a"  : "p",
					tt:   H < 12 ? "am" : "pm",
					T:    H < 12 ? "A"  : "P",
					TT:   H < 12 ? "AM" : "PM",
					Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
					o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
					S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
				};

			return mask.replace(token, function ($0) {
				return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
			});
		};
	}();

	// Some common format strings
	dateFormat.masks = {
		"default":      "ddd mmm dd yyyy HH:MM:ss",
		shortDate:      "m/d/yy",
		mediumDate:     "mmm d, yyyy",
		longDate:       "mmmm d, yyyy",
		fullDate:       "dddd, mmmm d, yyyy",
		shortTime:      "h:MM TT",
		mediumTime:     "h:MM:ss TT",
		longTime:       "h:MM:ss TT Z",
		isoDate:        "yyyy-mm-dd",
		isoTime:        "HH:MM:ss",
		isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
		isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
	};

	// Internationalization strings
	dateFormat.i18n = {
		dayNames: [
			"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
			"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
		],
		monthNames: [
			"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
			"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
		]
	};

	// For convenience...
	Date.prototype.format = function (mask, utc) {
		return dateFormat(this, mask, utc);
	};

	return {
		format: function(date, mask, utc) {
			return dateFormat(date, mask, utc);
		}
	};
})();


var Class = (function() {	
	"use strict"
	
	// extract function name
	function fname(f) {
		if( typeof(f) != 'function' ) return null;
		var n = /\W*function\s+([\w\$]+)\(/.exec( f.toString() );
		return (n) ? n[1] : null;
	}

	// copy getter/setter
	function cgs(src, dest, k) {
		var g, s;
		if( src.__lookupGetter__ ) {
			g = src.__lookupGetter__(k);
			s = src.__lookupSetter__(k);
		}

		if ( dest.__defineGetter__ && (g || s) ) {
			//TODO : 같은 애트리뷰트가 상위의 getter/setter 일 수 있으므로... 체크해야 한다.
			if ( g ) dest.__defineGetter__(k, g);
			if ( s ) dest.__defineSetter__(k, s);
			return true;
		} else {
			return false;
		}
	}

	var _ = {}, issuper = false, debug = true;

	var Class = {
		fname: fname,
		inherit: function inherit(clz, sclz, instantiatable) {
			if( typeof(clz) !== 'function' ) throw new TypeError('class must be a function');
			if( sclz && typeof(sclz) !== 'function' ) throw new TypeError('super class must be a function');
			
			//console.log('-- ' + fname(clz));
						
			var attrs = {};
			var constructor = function(a) {
				if( a !== _ ) {
					if( instantiatable === false && !issuper ) throw new TypeError('this class cannot instantiatable');
					// bind $super initializer
					var self = this;
					this.$super = function() {
						issuper = true;
						var r = sclz.apply(self, arguments);
						issuper = false;
						return r;
					};
					
					// bind prototype attributes : ignore if called by $super
					if( !issuper ) {
						for (var k in attrs) {
							this[k] = attrs[k];
						}
					}
					
					// call initializer
					var r = clz.apply(this, arguments);
					try {delete this['$super'];} catch(e) {this['$super'] = null;}
					return r;
				};
			};

			// define cls class
			var cls = function cls() {constructor.apply(this, arguments);}			
			//cls.__meta__ = {};
			
			// for debug
			if( debug ) {
				var name = clz.fname || fname(clz);
				eval('cls = function ' + (name || 'anonymous') + '() {constructor.apply(this, arguments);}');
				//cls.__meta__ = {};
				//cls.__meta__.name = name;
			}

			// inheritance
			if( sclz ) cls.prototype = new sclz(_);
			cls.prototype.constructor = cls;
			
			//cls.__meta__.origin = clz;
			//cls.__meta__.superclass = sclz;
			cls.clone = function() {
				return Class.inherit(clz, sclz, instantiatable);
			};
			cls.superclass = function() {
				return sclz;
			};
			cls.source = function() {
				return clz;	
			};

			// copy prototype
			var proto = clz.prototype;
			for( var k in proto ) {
				if( !proto.hasOwnProperty(k) ) continue;

				if( !cgs(proto, cls, k) ) {
					var v = proto[k];
					
					if( sclz && typeof(v) == 'function' && typeof(sclz.prototype[k]) == 'function' ) {
						cls.prototype[k] = function(name, fn) {
							return function() {
								var self = this;
								var p = this.$super;
								this.$super = function() {
									return sclz.prototype[name].apply(self, arguments);
								};
								var r = fn.apply(this, arguments);
								if( p ) {
									this.$super = p;
								} else {
									this.$super = null;
									try {delete this['$super'];} catch(e) {this['$super'] = null;}
								}

								return r;
							};
						}(k, v);
					} else {
						cls.prototype[k] = v;
					}
				}
			}

			// copy static
			for( var k in clz ) {
				if( clz.hasOwnProperty(k) ) if( !cgs(clz, cls, k) ) cls[k] = clz[k];
			}

			// extract attributes
			for( var k in cls.prototype ) {
				var v = cls.prototype[k];
				if( typeof(v) != 'function' ) {
					attrs[k] = v;
				}
			}
			
			return cls;
		}
	};
	
	return Class;
})();



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


var Template = (function() {
	"use strict"
	
	//var TPL_PATTERN = new RegExp('[{][.\\w:\\w(.\\w)?\\-]+[}]', 'igm');
	var TPL_PATTERN = new RegExp('[{][a-zA-Z0-9 :.,()\'";?<>\|ㄱ-ㅎ|ㅏ-ㅣ|가-힝]+[}]', 'igm');

	function currency(n, f){
		var c, d, t;

		var n = n, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "." : d, t = t == undefined ? "," : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
		return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + ((f===false) ? '' : (c ? d + Math.abs(n - i).toFixed(c).slice(2) : ""));
	}

	var TRANSLATORS = {
		image: function(v) {
			return ( typeof(v) === 'string' ) ? '<img src="' + v + '" />' : '';
		},
		currency: function(v) {
			var value = v;
			if( typeof(value) === 'number' ) value = parseInt(value);
			if( isNaN(value) ) return v;
			return currency(value, false);
		},
		stringify: function(v) {
			if( typeof(v) === 'object' ) return JSON.stringify(v, null, '\t');
			else if( typeof(v) === 'function' ) return v.toString();
			else return v;
		},
		date: function(v, format) {
			if( !(v instanceof Date) ) v = new Date(v);
			return v.format(format || 'yyyy.mm.dd');
		}
	};

	// class Template
	function Template(el) {
		if( !el ) throw new TypeError('el was null');
		this.el = el;
	}
	
	Template.translators = TRANSLATORS;

	Template.prototype = {
		bind: function(o, fns) {
			o = o || {};
			fns = fns || {};

			var el = this.el;

			var parseKey = function(k) {
				if( typeof(k) !== 'string' ) return null;

				if( k.startsWith('{') ) k = k.substring(1);
				if( k.endsWith('}') ) k = k.substring(0, k.length -1);
				
				var args = k.split(':');

				var fn = args[1];
				var option, pos;
				if( fn && (pos = fn.indexOf('(')) > 0 ) {
					option = fn.substring(fn.indexOf('(') + 1, fn.indexOf(')', pos+1));
					fn = fn.substring(0, fn.indexOf('('));
				}

				return {
					key: args[0],
					fn: fn,
					option: option,
					defaultValue: args[2],
					mask: args[3],
					args: args
				}
			};

			var getValue = function(key, o) {
				if( typeof(key) !== 'string' ) return null;
				
				if( key.indexOf('.') > 0 ) {
					var c = o;
					var arg = key.split('.');
					arg.forEach(function(k) {
						if( c ) c = c[k];
					});
					return c;
				}

				return o[key];
			};
			
			var evaluate = function(path, el, nodeValue, o, fns, global, preprocessor) {
				var v = nodeValue;
				var pos = -1;
				while((pos = v.indexOf('{')) >= 0) {
					v = v.substring(pos + 1);
					var matched  = v.substring(0, v.indexOf('}'));
					var parsed = parseKey(matched);
					var key = parsed.key;
					var fn = parsed.fn;
					var option = parsed.option;
					var def = parsed.defaultValue || '';
					var fnc = fns[fn] || global[fn] || TRANSLATORS[fn];
				
					var row = o;
					while( key.startsWith('.') ) {
						row = row._parent || {};
						fnc = (fns._parent || {})[fn] || (fns._parent || {})['all'];
						key = key.substring(1);
					}

					var value = getValue(key, row);

					if( preprocessor ) {
						var result = preprocessor(path, key, value, option, row, el, fns);
						if( result !== undefined ) value = result;
					}

					if( fns && fns.$all ) {							
						var result = fns.$all(key, value, option, row, el, fns);
						if( result !== undefined ) value = result;
					}

					if( fnc ) {
						if( typeof(fnc) !== 'function' && typeof(fnc.$) === 'function' ) fnc = fnc.$;
						var result = fnc(value, option, row, el, fns);
						if( result !== undefined ) value = result;
					}
					
					if( !value ) value = def;
					nodeValue = nodeValue.split('{' + matched + '}').join(value);
				}

				return nodeValue;
			};

			var parse = function(path, el, o, fns, global, preprocessor) {
				if( el.nodeName == '#text' ) {
					if( el.nodeValue ) {
						var value = evaluate(path, el, el.nodeValue, o, fns, global, preprocessor);
						var p = el.parentNode;
						var nel = document.createElement((p.tagName || 'div'));
						nel.innerHTML = value;

						var c = nel.childNodes;
						var argc = [];
						if( c ) for(var j=0; j < c.length;j++) argc.push(c[j]);
						if( argc ) for(var j=0; j < argc.length;j++) p.insertBefore(argc[j], el);
						p.removeChild(el);
					}
				} else if( el.getAttribute ) {
					var attrs = el.attributes;
					for(var i=0; i < attrs.length; i++) {
						var attr = attrs[i];
						var value = evaluate(path, el, attr.value, o, fns, global, preprocessor);
						if( value !== attr.value ) {
							el.setAttribute(attr.name, value);
						}
					}
				}
				
				var childNodes = el.childNodes;
				var argc = [];
				if( childNodes && childNodes.length ) {
					for(var i=0; i < childNodes.length;i++) argc.push(childNodes[i]);
				}

				if( argc ) {
					for(var i=0; i < argc.length;i++) {
						var sub = argc[i];
						var v;

						if( sub.getAttribute && (v = sub.getAttribute('bypass')) ) {
							if( v.trim().toLowerCase() === 'true' ) continue;
						}
						
						// if hash console attr
						if( sub.getAttribute && (v = sub.getAttribute('log')) ) {
							sub.removeAttribute('log');
							
							(function(condition) {
								try {
									console.log(condition + ':', eval(v));
								} catch(e){
									console.error('tpl console log error', e, v);
								}
							}).call(o, v);

							if( sub.tagName.toUpperCase() === 'TPL' && !sub.getAttribute('for') && !sub.getAttribute('if') ) {
								el.removeChild(sub);
							}
						}

						// if in condition
						if( sub.getAttribute && (v = sub.getAttribute('if')) ) {
							//console.log('is condition', sub);
							var elsetag = sub.querySelector('else');
							if( elsetag && elsetag.parentNode !== sub ) elsetag = null;
							if( elsetag ) sub.removeChild(elsetag);
							sub.removeAttribute('if');

							var checktrue = (function(condition) {
								try {
									//console.log('evaluation', this, condition);
									//return eval('(row.items && row.items.length)');
									var item = o;
									var row = o;
									var r = eval('(' + condition + ')');
									//console.log('eval', condition, r);
									return r;
								} catch(e){
									console.error('tpl evaluation error', e, condition);
									return false;
								}
							}).call(o, v);

							var cnodes = [], rebuild = false;
							if( checktrue ) {
								if( sub.tagName.toUpperCase() === 'TPL' && !sub.getAttribute('for') ) {
									var subc = sub.childNodes;
									if( subc ) for(var p=0; p < subc.length;p++) cnodes.push(subc[p]);
									rebuild = true;
								}
							} else {
								if( elsetag ) {
									var subc = elsetag.childNodes;
									if( subc ) {
										for(var p=0; p < subc.length;p++) cnodes.push(subc[p]);
									}
								}
								rebuild = true;
							}

							if( rebuild ) {
								//console.log('is rebuild', sub);
								for(var p=0; p < cnodes.length; p++) {
									var n = cnodes[p];
									el.insertBefore(n, sub);
									argc.push(cnodes[p]);
								}
								el.removeChild(sub);
								continue;
							}
						}
						
						// if for loop
						if( sub.getAttribute && (v = sub.getAttribute('for')) ) {
							var parsed = parseKey(v);
							if( parsed ) {
								var key = parsed.key;
								var fn = parsed.fn;
								var def = parsed.defaultValue;
								var option = parsed.option;
								var arg = getValue(key, o) || def;
								var sfns = fns[fn || key] || global[fn || key] || TRANSLATORS[fn || key];
								var spath = ((path) ? (path + '.') : '') + key;
								var snext = sub.nextSibling;
								
								el.removeChild(sub);

								if( typeof(arg) === 'string' ) {
									el.innerHTML = arg;
									return;
								}

								if( !arg ) continue;

								if( typeof(arg.length) !== 'number' ) arg = [arg];

								for(var j=0; j < arg.length; j++) {
									var row = arg[j];

									var type = typeof(row);
									if( type === 'string' ) {
										var r = {};
										r[key] = row;
										row = r;
									} else if( !row || type !== 'object' ) {
										continue;
									}

									//console.error('#' + path, key, row, sfns, sub);

									var temp = sub.cloneNode(true);
									
									//만약 노드의 fn 이 펑션이라면 펑션 실행
									if( preprocessor ) {
										var result = preprocessor(path, key, row, option, o, temp, fns);
										if( result !== undefined ) row = result;
									}

									if( sfns && typeof(sfns.$) === 'function' ) {
										var result = sfns.$(key, row, option, o, temp, fns);
										if( result !== undefined ) row = result;
									}

									if( typeof(sfns) === 'function' ) {
										var result = sfns(row, option, o, temp, fns);
										if( result !== undefined ) row = result;
									}

									/*if( row ) {
										console.log(row);
										/*if( $.util.isElement(row) ) {
											temp = row;
										} else if( row instanceof $ ) {
											temp = row.el;
										} else if( row === false) {
											continue;
										} */
									if( row === false) {
										continue;
									} else if( row === undefined ) {
										row = arg[j];
									}

									if( !sfns ) sfns = {};

									temp.removeAttribute('for');
									row._parent = o;
									sfns._parent = fns;

									row._index = j;
									parse(spath, temp, row, sfns, global, preprocessor);
									
									if( temp.tagName.toUpperCase() === 'TPL' ) {
										var nodes = temp.childNodes;
										var _argc = [];
										if( nodes && nodes.length ) {
											for(var a=0; a < nodes.length;a++) _argc.push(nodes[a]);
										}

										if( _argc ) {
											for(var a=0; a < _argc.length;a++) {
												if( snext ) el.insertBefore(_argc[a], snext);
												else el.appendChild(_argc[a]);
											}
										}
									} else {
										if( snext ) el.insertBefore(temp, snext);
										else el.appendChild(temp);
									}
								}
							}
						} else {
							parse(path, sub, o, fns, global, preprocessor);
						}
					}
				}
			};

			parse('', el, o, fns, fns['global'] || {}, fns['preprocessor']);
			
			return this;
		}
	};

	return Template;
})();

(function() {
	var fn = SelectorBuilder.fn;
	var util = SelectorBuilder.util;
	var array_return = util.array_return;
	var resolve = util.resolve;
	var evalHtml = util.evalHtml;
	
	fn.bind = function(data, functions) {
		this.restore('#bind').save('#bind');
		return this.each(function() {
			new Template(this).bind(data, functions);
		});
	};

	fn.tpl = function(data, functions) {
		var document = this.document;
		var $ = this.$;
		if( !data ) data = {};
		
		var arr = [];
		this.each(function() {
			if( typeof(data) === 'function' ) data = resolve.call(this, data);				
	
			if( typeof(data.length) !== 'number' ) data = [data];
	
			for(var i=0; i < data.length; i++) {
				var el = $(this).clone()[0];
				if( el.tagName.toLowerCase() === 'script' ) {
					el = evalHtml(document, el.textContent || el.innerHTML || el.innerText)[0];
				}
		
				new Template(el).bind(data[i], functions);
				arr.push(el);
			}
		});
		return $(arr).owner(this);
		
	};
})();

var HashObserver = (function() {
	"use strict"
	
	var handlers = [];

	// singleton
	function HashObserver() {
		this.options = {};
	}

	HashObserver.prototype = {
		config: function(options) {
			if( typeof(options) !== 'object' ) return console.error('illegal parameter', options);
			this.options = options;
		},
		current: function() {
			var hash = window.location.hash || '#';
			return hash.substring(1);
		},
		start: function() {
			var self = this;
			if( "onhashchange" in window ) {
				this.listener = function (e) {
					self.invoke();
				};

				if( window.addEventListener ) window.addEventListener("hashchange", this.listener, false);
				else window.attachEvent("hashchange", this.listener);
			} else {
				var current = window.location.hash;
				this.poller = window.setInterval(function () {
					if (window.location.hash != current) {
						current = window.location.hash;
						self.invoke();
					}
				}, 200);
			}
		},
		stop: function() {
			if( this.poller ) window.clearInterval(this.poller);
			if( this.listener ) {
				if( window.removeEventListener ) window.removeEventListener("hashchange", this.listener, false);
				else window.detachEvent("hashchange", this.listener);
			}
		},
		invoke: function() {
			for(var i=0; i < handlers.length; i++) {
				var handler = handlers[i];
				var fn = handler.fn;
				var scope = handler.scope || window;

				if( typeof(fn) === 'object' ) {
					scope = fn;
					fn = fn.onHash;
					if( !fn ) continue;
				}

				//try {
					var hash = window.location.hash || '';
					hash = hash.split('#').join('');

					fn.call(scope, hash, window.location);
				//} catch(err) {
				//	console.error('WARN:exception occured in hash handler', err.message, err, fn, scope);
				//}
			}
		},
		handlers: function() {
			return handlers.slice();
		},
		unregist: function(fn) {
			if( !fn ) return false;
			if( typeof(fn) === 'object' && fn.onHash ) {
				fn = fn.onHash;
			}
			
			var target;
			for(var i=0; i < handlers.length;i++) {
				if( handlers[i] && handlers[i].fn === fn ) {
					target = handlers[i];
				}
			}

			if( !target ) return false;

			handlers.splice(handlers.indexOf(target), 1);
			return true;
		},
		regist: function(fn, scope) {
			if( !fn ) return this;

			handlers.push({
				fn: fn,
				scope: scope
			});

			return this;
		}
	};

	return new HashObserver();	
})();


// regist hash controller
(function() {
	HashObserver.regist(function(hash, location) {
		var $ = SelectorBuilder(document);
		$(document.body).fireroute(hash);
	});
	HashObserver.start();
	SelectorBuilder.addon['HashObserver'] = HashObserver;	
	SelectorBuilder.on('load', function(e) {
		HashObserver.invoke();
	});
})();




var Animator = (function() {
	"use strict";

	// privates	
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
		if( !$.util.isElement(el) ) throw new TypeError('el must be a element', el);
		this.el = $(el);
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

			if( typeof(before) !== 'function' ) return console.error('Animator:before must be a function', before);
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
					console.log('animation no affects', options);
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

var AnimationGroup = (function() {
	"use strict";
	
	// class AnimationGroup
	/*function AnimationGroup(el, options, scope) {
		var self = this;
		el.each(function() {
			self.push(new Animator(this, options, scope));
		});
	}
	
	var fn = AnimationGroup.prototype = new Array();
	fn.merge = function(o) {
		if( !o ) return this;
		if( typeof(o.length) === 'number' ) {
			for(var i=0; i < o.length; i++) {
				if( !~this.indexOf(o[i]) ) this.push(o[i]);
			}
		} else {
			if( !~this.indexOf(o) ) this.push(o);
		}
		return this;
	};
	
	fn.each = function(fn) {
		this.every(function(animator) {
			return ( fn.call(animator) === false ) ? false : true;
		});
		return this;
	};
	
	fn.out = fn.end = function(exit) {
		if( !arguments.length ) return this._exit;
		this._exit = exit;
		return this;
	};
	
	fn.chain = function(options) {
		return this.each(function() {
			this.chain(options);
		});
	};
	fn.scope = function(scope) {
		return this.each(function() {
			this.scope(options);
		});
	};
	fn.length = function() {
	};
	fn.reset = function(options) {
	};
	fn.before = function(before) {
	};
	fn.run = function(callback) {
	};
	fn.reverse = function(callback) {
	};
	fn.executeCurrent = function(callback) {
	};
	fn.first = function() {
	};
	fn.last = function() {
	};
	fn.next = function(callback) {
	};
	fn.prev = function(callback) {
	};*/
})();

(function() {
	var fn = SelectorBuilder.fn;
	
	fn.animate = function(options, callback) {
		return new AnimationGroup(this, options, this, this).run(callback).out();
	};

	fn.animator = function(options, scope) {
		return new AnimationGroup(this, options, scope || this, this);
	};
})();

var Scroller = (function() {
	var SCROLL_INPUT_ELEMENTS =  ['input','textarea', 'select'];
	var SCROLL_HAS_TOUCH = ('createTouch' in document);

	var D = Device;

	function Scroller(el, options) {
		//*console.log('setup scroller', options);
		var s = this.options;
		var o = options;
		for(var k in o ) {
			var v = o[k];
			s[k] = v;	
		}

		this.id = (options) ? options.id : '';
		this.el = el.el || el;

		this.unlock();
	}

	Scroller.prototype = {
		options: {
			fps: (( D.is('android') ) ? 45 : (( D.is('ios') ) ? undefined : 120)),
			snapEasing: 'cubic-bezier(0.3, 0.6, 0.6, 1)',
			snapDelay: 250,
			initialY: 0,
			initialX: 0,
			lockThreshold: 0,
			overscroll: true,
			acceleration: true
		},
		
		id: undefined,
		clientWidth: 0,
		clientHeight: 0,
		contentWidth: 0,
		contentHeight: 0,
		lockThreshold: 0,
		
		target: undefined,
		overscroll: true,
		axisx: false,
		axisy: false,
		axisauto: false,
		startx: 0,
		starty: 0,
		lastx: 0,
		lasty: 0,
		lastd: 0,
		fpsInterval: undefined,
		use3d: true,
		beginTime: 0,
		acceleration: true,
		isDragging: false,
		hl: false,
		scale: 1,
		e: {},

		initialized: false,

		lock: function() {
			var el = this.el;

			if( SCROLL_HAS_TOUCH ) {
				el.removeEventListener('touchstart', this, false);
				el.removeEventListener('touchmove', this, false);
				el.removeEventListener('touchend', this, false);
			} else {
				el.removeEventListener('mousedown', this, false);
				el.removeEventListener('mousemove', this, false);
				el.removeEventListener('mouseup', this, false);
				el.removeEventListener('mouseout', this, false);
			}
			el.removeEventListener('gesturechange', this, false);
			el.removeEventListener('gestureend', this, false);
			el.removeEventListener('click', this, false);
			el.removeEventListener('click', this, true);
			el.removeEventListener('transitionend', this, false);
		},

		unlock: function() {
			var el = this.el;
			
			if( SCROLL_HAS_TOUCH ) {
				el.addEventListener('touchstart', this, false);
				el.addEventListener('touchmove', this, false);
				el.addEventListener('touchend', this, false);
			} else {
				el.addEventListener('mousedown', this, false);
				el.addEventListener('mousemove', this, false);
				el.addEventListener('mouseup', this, false);
				el.addEventListener('mouseout', this, false);
			}
			el.addEventListener('click', this, false);
			el.addEventListener('click', this, true);
			el.addEventListener('transitionend', this, false);
			
			if( this.options.zoom ) {
				el.addEventListener('gesturechange', this, false);
				el.addEventListener('gestureend', this, false);
			}
		},
		
		on : function( type, listener ) {
			if( !type || !listener ) return;
			this.e[type] = listener;
			this.hl = true;
		},

		fire : function(type, a,b,c,d,e,f,g,h) {
			var li = this.e[type];
			if( li && typeof(li) == 'function' ) li(a,b,c,d,e,f,g,h);
		},

		changeAxis: function(axis) {
			this.axisx = this.axisy = false;

			if( axis ) {
				if( axis == 'x' ) this.axisx = true;
				if( axis == 'y' ) this.axisy = true;
				if( axis == 'xy' || axis == 'yx' ) this.axisx = this.axisy = true;
			} else {
				this.axisy = true;
				this.axisauto = true;
			}

			//console.log('[' + this.id + ']', axis, this.axisx, this.axisy);

			this.validate();
		},

		reload: function() {
			this.initialized = true;
			var o = this.options;
			var self = this;

			this.stop();
			
			window.removeEventListener('resize', self.validate, false);
			window.addEventListener('resize', self.validate, false);

			this.clientWidth = this.el.parentNode.clientWidth;
			this.clientHeight = this.el.parentNode.clientHeight;
			this.contentWidth = this.el.scrollWidth;
			this.contentHeight = this.el.scrollHeight;

			this.target = undefined;
			this.clientWidth = 0;
			this.clientHeight = 0;
			this.contentWidth = 0;
			this.contentHeight = 0;
			this.starty = 0;
			this.startx = 0;
			this.lastx = 0;
			this.lasty = 0;
			this.lastd = 0;
			this.use3d = (o.use3d === false) ? false : true;
			this.beginTime = 0;
			this.isDragging = false;

			this.acceleration = !(o.acceleration == false);		
			this.lockThreshold = o.lockThreshold ? o.lockThreshold : 0;
			this.overscroll = (o.overscroll == false) ? false : true;
			if( o.e ) {
				this.e = o.e;
				this.hl = true;
			}

			this.changeAxis(o.axis);

			this.unlock();

			var fps = o.fps;
			if( fps && !isNaN(parseInt(fps)) ) this.fpsInterval = Math.round(1000 / fps);
			//*//*console.log('[' + this.id + '] fps interval:' + this.fpsInterval + ' use 3d:' +  this.use3d + ' axisx:' + this.axisx + ', axisy:' + this.axisy + ', momentum:', this.acceleration);
		},

		destroy: function() {
			var el = this.el;

			this.lock();

			if( this.hl ) this.fire('destroyed', this);
		},
		
		validate: function(e) {
			if( this.hl ) this.fire('beforevalidate', this);
			
			//console.warn('clientHeight(' + this.el.parentNode.getAttribute('id') + ')', this.el.clientHeight);
			//console.warn('scrollHeight(' + this.el.parentNode.getAttribute('id') + ')', this.el.scrollHeight);
			//console.warn('offsetHeight(' + this.el.parentNode.getAttribute('id') + ')', this.el.offsetHeight);
			
			if( !this.el || !this.el.parentNode ) return;

			this.clientWidth = this.el.parentNode.clientWidth;
			this.clientHeight = this.el.parentNode.clientHeight;
			if( this.scale == 1) this.contentWidth = this.el.scrollWidth;
			if( this.scale == 1) this.contentHeight = this.el.scrollHeight;
			this.bottomx = -(this.contentWidth - this.clientWidth);
			this.bottomy = -(this.contentHeight - this.clientHeight);
			var x = this.lastx;
			var y = this.lasty;

			if( this.scale === 1 ) {
				this.ocw = this.contentWidth;
				this.och = this.contentHeight;
			}

			if( this.axisauto ) {			
				this.axisx = false;
				this.axisy = true;
				if( this.contentWidth > this.clientWidth ) {
					this.axisx = true;
					this.axisy = false;
				}
				if( this.contentHeight > this.clientHeight ) this.axisy = true;
				//console.log('axisauto', this.axisx, this.axisy);
			}
			
			////*//*console.log('[' + this.id + '] x:' + this.clientWidth + ',' + this.contentWidth + ' = ' + -(this.contentWidth - this.clientWidth));
			//*//*console.log('[' + this.id + '] y:' + this.clientHeight + '/' + this.contentHeight + ', ' + this.bottomy + ',' + y);

			var bx = this.bottomx = -(this.contentWidth - this.clientWidth);
			var by = this.bottomy = -(this.contentHeight - this.clientHeight);
			
			//this.stop();
			//console.log('[' + this.id + ']', x, y, bx, by);

			//바운더리 벗어났다면, 바운드한다.
			if( this.axisy ) {
				if( y > 0 || by >= 0 ) {
					this.toTop();
				} else if( y < by ) {
					this.toBottom();
				}
			}
			
			if( this.axisx ) {
				if( x > 0 || bx >= 0 ) {
					this.toLeft();
				} else if( x < bx ) {
					this.toRight();
				}
			}
			if( this.hl ) this.fire('aftervalidate', this);
		},

		//event handler
		handleEvent: function(e) {
			if( !this.initialized ) this.reload();
			//scrollTo 피니시 펑션 수행 : 새로운 사용자 액션 혹은 트랜지션 종료시 실행
			if( this.scrollToFn ) {
				var fn = this.scrollToFn;
				this.scrollToFn = null;
				//console.log('finished scrollTo');
				fn(this, this.lastx, this.lasty)
			}

			if( !e.type == 'click' ) e._handleByScroller = true;
			//y가 고정이면 x 축 스크롤링(axisx) 일 경우만 동작, x 가 고정이면 y축 스크롤링(axisy) 인 경우만 동작
			if( (e.lockx && this.axisx) || (e.locky && this.axisy) ) return;
			
			var tag = e.target.tagName;

			//줌
			if( this.options.zoom ) {
				//console.log('줌');
				if( e.type == 'gesturechange' ) {
					e.preventDefault();
					this.zoomlock = true;
					var scale = this.scale = e.scale;				
					
					this.contentWidth = Math.round(scale * this.ocw);
					this.contentHeight = Math.round(scale * this.och);

					this.axisx = true;
					this.axisy = true;
					
					var el = this.el;
					el.css('transition', '');
					el.css('transform', 'scale(' + e.scale + ')');
				} else if( e.type == 'gestureend' ) {
					e.preventDefault();
					e.stopPropagation();				

					this.contentWidth = Math.round(scale * this.ocw);
					this.contentHeight = Math.round(scale * this.och);
					
					var el = this.el;
					el.css('transition', '');
					el.css('transform', 'scale(' + e.scale + ')');
					

					this.validate();

					this.zoomlock = false;				
				}
			
				if( this.zoomlock ) return;
			}

			if( e.type == 'touchstart' || e.type == 'mousedown' ) {
				this.begin(e);
			} else if( this.isDragging && (e.type == 'touchmove' || e.type == 'mousemove') ) {
				var p = e.touches ? e.touches[0] : e;
				if( (!this.fpsInterval || this.lastd == 0 || (e.timeStamp - this.lastd) > this.fpsInterval) ) {
					this.moving(e,p);
				}

				//하위 이벤트에 락 통보
				if( this.lockThreshold ) {
					var dx = Math.abs(p.clientX - this.startx);
					var dy = Math.abs(p.clientY - this.starty);

					////*//*console.log('dx,dy:', dx, dy);

					if( this.axisy && dx <= this.lockThreshold ) e.lockx = true;
					if( this.axisx && dy <= this.lockThreshold ) e.locky = true;
				}

				if( this.axisx && this.lastx < 0 && this.lastx > this.bottomx ) e.lockx = true;
				if( this.axisy && this.lasty < 0 && this.lasty > this.bottomy ) e.locky = true;
				////*console.warn('[' + this.id + '] lock:', e.lockx, e.locky );	
			} else if( this.isDragging && (e.type == 'touchend' || e.type == 'mouseup') ) {		
				this.finish(e);
			/*} else if( this.isDragging && e.type == 'mouseout' ) {
				this.out(e);*/
			} else if( e.type == 'click' ) {
				if( e.touches && e.touches.length > 1 ) {
					e.stopPropagation();
					return;
				}
				//e.preventDefault();
				//console.warn(e._handleByScroller);
				
				//안드로이드의 경우 select 이벤트를 소프트로 대체해줘야 한다... 망할
				if( D.is('android') && tag == 'SELECT' ) {
					return;
				}

				if( !e._handleByScroller ) {
					e.stopPropagation();
					//e.preventDefault();
				}
				return;
			} else if( e.type == 'webkitTransitionEnd' ) {
				if( e.target != this.el ) return;
				//console.warn(e.target, e);

				if( e.propertyName == '-webkit-transform' ) {
					//*console.log('scroller transition finished : ' + this.id, e);
					if( this.hl ) {
						if( this.isOver ) {
							console.log('finished with transition');
							this.fire('finish', this, this.lastx, this.lasty, this.bottomx, this.bottomy, this.isOver, e, this.dx, this.dy);
						}
					}
				}

				this.validate();

				e.stopPropagation();
				return;
			}
			
			
			//TODO: 이거 왜 했을까.. 이유를 알 수 없음
			//아무튼 안드로이드에서만 유독 인풋에서 발생한 이벤트가 상위로 올라감. 
			if( ~tag.indexof('SELECT', 'INPUT', 'TEXTAREA') ) {
				//this.validate();
				//e.preventDefault();
				//e.stopPropagation();
			}
		},

		begin: function(e) {
			//*//*console.log('[' + this.id + '] begin');
			////*console.log(e);

			this.stop();
			this.validate();

			this.el.css('transition', '');
			
			//*console.log('[' + this.id + '] x:' + this.clientWidth + ',' + this.contentWidth + ' = ' + -(this.contentWidth - this.clientWidth));
			//*console.log('[' + this.id + '] y:' + this.clientHeight + ',' + this.contentHeight + ' = ' + -(this.contentHeight - this.clientHeight));

			this.isDragging = true;
			this.beginTime = e.timeStamp;

			var p = e.touches ? e.touches[0] : e;
			this.target = e.target;

			this.starty = p.clientY;
			this.startOffsetY = this.lasty;

			this.startx = p.clientX;
			this.startOffsetX = this.lastx;

			this.dx = 0;
			this.dy = 0;

			if( this.hl ) this.fire('begin', this, e);
		},

		moving: function(e,p) {
			this.lastd = e.timeStamp;

			var currenty = p.clientY;
			var deltay = currenty - this.starty;
			var y = deltay + this.startOffsetY;

			var currentx = p.clientX;
			var deltax = currentx - this.startx;
			var x = deltax + this.startOffsetX;

			this.dx = (p.clientX - this.startx);
			this.dy = (p.clientY - this.starty);
			
			//바운더리를 넘었다면. 특정값에 수렴하도록 한다.
			if(y && this.axisy) {
				if( y >= 0 ) {
					if( !this.overscroll ) return;
					y = y - (deltay/2); //TODO : 바운더리가 넘어간만큼에 대해서만 1/2 하게 바꿔야 해
				} else if( y <= this.bottomy ) {
					if( !this.overscroll ) return;
					y = y - (deltay/2); //TODO : 바운더리가 넘어간만큼에 대해서만 1/2 하게 바꿔야 해
				}
				
				if(y) this._scrollBy(null,y);
			}

			//바운더리를 넘었다면. 특정값에 수렴하도록 한다.
			if(x && this.axisx) {
				if( x >= 0 ) {
					if( !this.overscroll ) return;
					x = x - (deltax/2); //TODO : 바운더리가 넘어간만큼에 대해서만 1/2 하게 바꿔야 해
				} else if( x <= this.bottomx ) {
					if( !this.overscroll ) return;
					x = x - (deltax/2); //TODO : 바운더리가 넘어간만큼에 대해서만 1/2 하게 바꿔야 해
				}
				
				if(x) this._scrollBy(x,null);
			}

			if( this.hl ) this.fire('moving', this, e, this.dx, this.dy);
		},

		finish: function(e) {
			if( this.hl ) this.fire('beforefinish', this, e);
			//*console.log('[' + this.id + '] finish');

			this.clientWidth = this.el.parentNode.clientWidth;
			this.clientHeight = this.el.parentNode.clientHeight;
			if( this.scale == 1) this.contentWidth = this.el.scrollWidth;
			if( this.scale == 1) this.contentHeight = this.el.scrollHeight;

			var bx = this.bottomx = -(this.contentWidth - this.clientWidth);
			var by = this.bottomy = -(this.contentHeight - this.clientHeight);
			var x = this.lastx;
			var y = this.lasty;
			var duration = e.timeStamp - this.beginTime;

			//console.log('[' + this.id + '] finish:', this.contentHeight, this.clientHeight);
			
			var isOver = false;
			
			//*//*console.log('[' + this.id + '] y:' + this.clientHeight + '/' + this.contentHeight + ', ' + this.bottomy + ',' + y);
			
			if( this.axisx && this.axisy ) {
				if( y >= 0 || by >= 0 ) {
					isOver = true;
					this.toTop();
				} else if( y < by ) {
					isOver = true;
					this.toBottom();
				} else if (duration < 300 && this.acceleration) {
					if(this.dy > 0) this.toTop(3000);
					if(this.dy < 0) this.toBottom(3000);
				}

				if( x >= 0 || bx >= 0 ) {
					isOver = true;
					this.toLeft();
				} else if( x < bx ) {
					isOver = true;
					this.toRight();
				} else if (duration < 300 && this.acceleration) {
					//this.toRight(1200);
					if(this.dx > 0) this.toLeft(3000);
					if(this.dx < 0) this.toRight(3000);
				}
			} else if( this.axisy ) {
				if( y >= 0 || by >= 0 ) {
					isOver = true;
					if( this.hl ) this.fire('over', this, 'y', y, e);
					this.toTop();
				} else if( y < by ) {
					isOver = true;
					if( this.hl ) this.fire('over', this, 'y', y - by, e);
					this.toBottom();
				} else if (duration < 300 && this.acceleration) {
					var my = this._momentum(y - this.startOffsetY, duration, -y, ((this.clientHeight - this.contentHeight) < 0 ? this.contentHeight - this.clientHeight + y : 0), this.options.overscroll ? this.clientHeight : 0);
					var ny = y + my.dist;
					this.scrollTo(0, ny, my.time);
				}
			} else if( this.axisx ) {
				if( x >= 0 || bx >= 0 ) {
					isOver = true;
					if( this.hl ) this.fire('over', this, 'x', x, e);
					this.toLeft();
				} else if( x < bx ) {
					isOver = true;
					if( this.hl ) this.fire('over', this, 'x', x - bx, e);
					this.toRight();
				} else if (duration < 300 && this.acceleration) {
					var mx = this._momentum(x - this.startOffsetX, duration, -x, ((this.clientWidth - this.contentWidth) < 0 ? this.contentWidth - this.clientWidth + x : 0), this.options.overscroll ? this.clientWidth : 0);
					var nx = x + mx.dist;
					this.scrollTo(nx, 0, mx.time);
				}
			}

			this.isDragging = false;
			
			if( !e._dispatched && Math.abs(this.dx) <= 20 && Math.abs(this.dy) <= 20 ) {
				this._dispatchOriginalEvent(e);
			}
			e._dispatched = true;

			this.isOver = isOver;
			if( this.hl ) {
				if( ! this.isOver ) {
					//console.log('finished normally');
					this.fire('finish', this, this.lastx, this.lasty, this.bottomx, this.bottomy, this.isOver, e, this.dx, this.dy);
				}
			}
		},
		
		/*out: function(e) {
			var target = e.target;
			var related = e.relatedTarget;
			console.log('[' + this.id + '] out', this.el, target, related);
			if (false) {
				//만약 out 이벤트가 element 의 자식이 아닌것으로 일어났다면, 정지한다. 자식이라면 그대로 진행.
				

				if (!target) {
					//*//*console.log('[' + this.id + '] out', target);
					this.finish(e);
					return;
				}

				if(target.parentNode == this.el) {
					//*//*console.log('[' + this.id + '] out', target);
					this.finish(e);
					return;
				}
				
				//*//*console.log('[' + this.id + '] related', target);
				//*//*console.log('[' + this.id + '] element', this.el);

				while (target = target.parentNode) {
					//*//*console.log('[' + this.id + '] elemend', target);
					if (target == this.el) {
						this.finish(e);
						return;
					}
				}
			}
		},*/

		//private
		_momentum: function (dist, time, maxDistUpper, maxDistLower, size) {
			var mround = function(r) { return r >> 0; }

			var deceleration = 0.00065,
				speed = Math.abs(dist) / time,
				newDist = (speed * speed) / (2 * deceleration),
				newTime = 0, outsideDist = 0;

			// Proportinally reduce speed if we are outside of the boundaries 
			if (dist > 0 && newDist > maxDistUpper) {
				outsideDist = size / (6 / (newDist / speed * deceleration));
				maxDistUpper = maxDistUpper + outsideDist;
				speed = speed * maxDistUpper / newDist;
				newDist = maxDistUpper;
			} else if (dist < 0 && newDist > maxDistLower) {
				outsideDist = size / (6 / (newDist / speed * deceleration));
				maxDistLower = maxDistLower + outsideDist;
				speed = speed * maxDistLower / newDist;
				newDist = maxDistLower;
			}

			newDist = newDist * (dist < 0 ? -1 : 1);
			newTime = speed / deceleration;

			return { dist: newDist, time: mround(newTime) };
		},
		/*_momentum : function(dx,dy,mx,my,d) {
			var nx, ny, timex, timey;

			if( dx ) {
				var vx = dx / d;
				var ax = vx < 0 ? 0.0006 : -0.0006;
				nx = - (vx * vx) / (2 * ax);
				timex = - vx / ax;
				
				if( nx >= 0 ) {
					timex = timex * (mx/nx);
					nx = 0;
				} else if( nx < mx ) {
					timex = timex * (mx/nx);
					nx = mx;
				}
			}
			
			if( dy ) {
				var vy = dy / d;
				var ay = vy < 0 ? 0.0006 : -0.0006;
				ny = - (vy * vy) / (2 * ay);
				timey = - vy / ay;

				if( ny >= 0 ) {
					timey = timey * (my/ny);
					ny = 0;
				} else if( ny < my ) {
					timey = timey * (my/ny);
					ny = my;
				}
			}
			
			return {
				time: ((timex > timey) ? timex : timey),
				nx: nx,
				ny: ny
			};
		},*/

		_scrollBy: function(x,y) {
			////*//*console.log('[' + this.id + '] _scrollBy:', x, y);
			if(x != 0 ) x = x || this.lastx;
			if(y != 0 ) y = y || this.lasty;
			
			this.lastx = x;
			this.lasty = y;
			//this.el.style('transform'] = 'translate(' + (x ? x + 'px' : 0) + ', ' + (y ? y + 'px' : 0) + ')';
			
			if( this.use3d ) {
				this.el.css('transform', 'translate3d(' + (x ? x + 'px' : 0) + ', ' + (y ? y + 'px' : 0) + ', 0)');
			} else {
				this.el.css('transform', 'translate(' + (x ? x + 'px' : 0) + ', ' + (y ? y + 'px' : 0) + ')');
			}
		},

		_dispatchOriginalEvent: function (e) {
			var target = this.target;
			
			//인풋 개체인 경우 click 이벤트 발생하지 않는다.
			if (SCROLL_INPUT_ELEMENTS.indexOf(target.localName) != -1) {
				return;
			}

			if( D.is('webkit') ) {
				var pe = document.createEvent('MouseEvent');
				pe.initMouseEvent('click', true, false, document.defaultView, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null);
				pe._handleByScroller = true;
				pe._ignoreInner = e._ignoreInner;
				target.dispatchEvent(pe);
			} else if( document.dispatchEvent ) {
				var pe = document.createEvent( "MouseEvents" );
				pe.initMouseEvent("click", true, true, window, 1, 1, 1, 1, 1, false, false, false, false, 0, target);
				pe._handleByScroller = true;
				pe._ignoreInner = e._ignoreInner;
				target.dispatchEvent(pe);
			} else if( document.fireEvent ) {
				target.fireEvent("onclick");
			}
		},
		
		//public
		scrollTo: function(x, y, ms, fn, easing) {
			//*//*console.log('[' + this.id + '] scrollTo:', x, y, ms);
			//*//*console.log('[' + this.id + '] translate3d(0, ' + y + 'px, 0)');
			if(ms !== 0) this.el.css('transition', 'transform ' + (ms || this.options.snapDelay) + 'ms ' + (easing || this.options.snapEasing));
			this._scrollBy(x, y, fn);
			
			if( fn && typeof(fn) == 'function' ) {
				if( ms == 0 && fn ) {
					fn(this, this.lastx, this.lasty);
				} else {
					this.scrollToFn = fn;
				}
			}
		},

		stop: function() {
			if( this.hl ) this.fire('beforestop', this);
			//*//*console.log('[' + this.id + '] stop');
			var style = document.defaultView.getComputedStyle(this.el, null);
			if( window.WebKitCSSMatrix ) {
				var transform = new WebKitCSSMatrix(style['webkitTransform']);
				this._scrollBy(transform.m41, transform.m42);
				this.el.css('transition', '');
				this.el.css('transition-duration', '');
				this.el.css('transition-delay', '');
				this.el.css('transform-timing-function', '');
				//*console.warn('[' + this.id + '] m41/m42:', transform.m41, transform.m42);
			}

			//this.validate();
			if( this.hl ) this.fire('afterstop', this);
		},

		toTop: function(ms, easing, fn) {
			//*//*console.log('[' + this.id + '] toTop:', ms);
			this.scrollTo(null,0,ms, easing, fn);
		},
		
		toBottom: function(ms, easing, fn) {
			if( !this.axisy ) return;
			//console.log('[' + this.id + '] toBottom:', ms, this.contentHeight, this.clientHeight);
			this.scrollTo(null,-(this.contentHeight - this.clientHeight),ms, easing, fn);
		},

		toLeft: function(ms, easing, fn) {
			//*//*console.log('[' + this.id + '] toLeft:', ms);
			this.scrollTo(0,null,ms, easing, fn);
		},
		
		toRight: function(ms, easing, fn) {
			if( !this.axisx ) return;
			//*//*console.log('[' + this.id + '] toRight:', ms);
			this.scrollTo(-(this.contentWidth - this.clientWidth),null,ms, easing);
		},

		toFirst: function(ms, easing, fn) {
			//*//*console.log('[' + this.id + '] toFirst:', ms);
			this.scrollTo(0,0,ms, easing, fn);
		},
		
		toLast: function(ms, easing, fn) {
			//*//*console.log('[' + this.id + '] toLast:', ms);
			var x = -(this.contentWidth - this.clientWidth);
			var y = -(this.contentHeight - this.clientHeight)
			
			if( !this.axisx ) x = 0;
			if( !this.axisy ) y = 0;

			this.scrollTo(x,y,ms, easing, fn);
		}
	};

	return Scroller;
})();

var SingleSelectable = (function() {
	"use strict";

	function SingleSelectable(cmp, selectable, autodeselect) {
		this.cmp = cmp;
		this.autodeselect(autodeselect);
	}
	
	SingleSelectable.prototype = {
		selectable: function() {
			if( !arguments.length ) return 1;
			return this;
		},
		autodeselect: function(autodeselect) {
			if( !arguments.length ) return (this._autodeselect === true) ? true : false;
			if( typeof(autodeselect) === 'boolean' ) this._autodeselect = autodeselect;
			return this;
		},
		
		select: function(index) {
			var item = this.cmp.get(index);
			index = this.cmp.indexOf(item);

			if( !item ) return false;

			if( this.selected() === item ) return false;
			if( this.selected() ) {
				if( !this.autodeselect() ) return false;
				this.deselect(this.selected());
			}

			if( this.selected(item) ) return false;

			var e = this.cmp.fire('select', {cancelable: true, item:item, index:index});
			if( e.eventPrevented ) return false;

			this._selected = item;

			this.cmp.fire('selected', {
				item: e.item,
				index: e.index
			});

			return true;
		},
		deselect: function(index) {
			var item = this.cmp.get(index);
			index = this.cmp.indexOf(item);

			if( !item ) return false;
			
			var e = this.cmp.fire('deselect', {cancelable: true, item:item, index:index});
			if( e.eventPrevented ) return false;
			
			if( !this.selected(item) ) return false;

			this._selected = null;

			this.cmp.fire('deselected', {
				item: e.item,
				index: e.index
			});

			return true;
		},
		selected: function(index) {
			if( !arguments.length ) return this._selected;

			var item = this.cmp.get(index);
			index = this.cmp.indexOf(item);

			return (this._selected === item);
		},
		selectedIndex: function(item) {
			if( !this._selected ) return -1;
			return this.cmp.indexOf(this._selected);
		},
		prev: function() {
			var i = this.selectedIndex();
			if( i > 0 ) return this.select(i--);
			return false;
		},
		next: function() {
			var i = this.selectedIndex();
			if( i >= 0 && i < (this.length() - 1) ) return this.select(i++);
			return false;
		},
		first: function() {
			return this.select(0);
		},
		last: function() {
			return this.select(this.cmp.length());
		}
	};

	return SingleSelectable;
})();


var Selectable = (function() {
	"use strict"

	function Selectable(cmp, max, autodeselect) {
		this.cmp = cmp;
		this._selected = [];
		this.autodeselect(autodeselect);
		this.selectable(max);
	}
	
	Selectable.prototype = {
		selectable: function(selectable) {
			if( !arguments.length ) return this._selectable || -1;
			if( typeof(selectable) === 'number' ) this._selectable = selectable;
			return this;
		},
		autodeselect: function(autodeselect) {
			if( !arguments.length ) return (this._autodeselect === true) ? true : false;
			if( typeof(autodeselect) === 'boolean' ) this._autodeselect = autodeselect;
			return this;
		},
		
		select: function(index) {
			var max = this.selectable();
			if( max === 0 ) return false;
			
			var item = this.cmp.get(index);
			index = this.cmp.indexOf(item);

			if( !item ) return false;
						
			if( max >= 0 ) {
				if( this._selected.length >= max ) {
					if( !this.autodeselect() ) return false;
					this.deselect(this._selected[0]);
				}
			}

			if( this.selected(item) ) return false;
			
			var e = this.cmp.fire('select', {cancelable: true, item:item, index:index});
			if( e.eventPrevented ) return false;

			this._selected.push(item);

			this.cmp.fire('selected', {
				item: e.item,
				index: e.index
			});

			return true;
		},
		deselect: function(index) {
			var item = this.cmp.get(index);
			index = this.cmp.indexOf(item);

			if( !item ) return false;
			
			var e = this.cmp.fire('deselect', {cancelable: true, item:item, index:index});
			if( e.eventPrevented ) return false;
			
			if( !this.selected(item) ) return false;
			
			Util.array.removeByItem(this._selected, item, true);

			this.cmp.fire('deselected', {
				item: item,
				index: index
			});

			return true;
		},
		selected: function(index) {
			if( !arguments.length ) return (this._selected.length ? this._selected.slice() : null);

			var item = this.cmp.get(index);
			index = this.cmp.indexOf(item);

			return ~this._selected.indexOf(item) ? true : false;
		},
		selectedIndex: function(item) {
			
		}
	};
	
	return Selectable;
})();




var Items = (function() {
	"use strict";
	
	var isArrayType = SelectorBuilder.util.isArrayType;

	// class container
	function Items(el, selectable) {
		this.el = el;
		if( selectable ) this.selectable(selectable);
	}
	
	var fn = Items.prototype = new Array();
	
	fn.add = fn.push = function(item, index) {
		if( item == undefined || item === null ) {
			console.warn('item cannot be null', item);
			return this;
		}
		
		if( index && typeof(index) !== 'number' ) index = this.indexOf(index);
					
		// evaluation for available to add
		var e = this.el.fire('item.add', {
			item: item
		}, {
			cancelable: true
		});
		
		// if event prevented or item replaced to null, bypass
		if( e.defaultPrevented || e.item === null || e.item === undefined ) return this;
		
		// push assigned index				
		if( (!index && index !== 0) || index < 0 || index >= this.length ) {
			Array.prototype.push.call(this, item);
		} else {
			this.splice(index, 0, item);
		}

		e = this.el.fire('item.added', {item:item, index:this.indexOf(item)});

		return this;
	};
	
	fn.merge = function(items, append, index) {
		if( !arguments.length ) return Array.prototype.slice.call(this) || [];
		if( typeof(items) === 'number' ) return this.get(items);
		if( !items ) {
			console.warn('[' + this.accessor() + '] items was empty', items);
			return this;
		}
		
		var removed = [];
		if( append !== true ) {
			var current = this.slice();
			for(var i=current.length; i >= 0;i--) {
				removed.push(current[i]);
				this.remove(i);
			}
		}
		
		if( !isArrayType(items) ) items = [items];			
		if( items ) {
			for(var i=0; i < items.length; i++) {
				this.push(items[i], index);
				if( typeof(index) === 'number' ) index++;
			}
		}
		
		this.el.fire('items', {
			items: this.slice(),
			added: items,
			removed: removed
		});
		
		return this;
	};

	fn.clear = function() {
		var len = this.length;
		if( len > 0 ) {
			for(var i=0; i < len; i++) {
				var item = this.indexOf(i);
				this.el.fire('item.removed', {item:item, index:i});
				this.related(item, false);
				
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
		if( typeof(index) === 'number' ) return this[index];
		index = this.indexOf(index);
		if( index >= 0 ) return this[index];
		return null;
	};
	
	fn.contains = function(item) {
		return this.contains(item);
	};
	
	fn.first = function() {
		return this[0];
	};
	
	fn.last = function() {
		return this[this.length - 1];
	};
	
	fn.each = function(fn) {
		this.every(function(el) {
			return ( fn.call(el) === false ) ? false : true;
		});
		return this;
	};

	fn.remove = function(item, once) {
		if( typeof(item) === 'number' ) item = this[item];
		
		for(var index;(index = this.indexOf(item)) >= 0;) {
			this.splice(index, 1);
			
			this.el.fire('item.removed', {item:item, index:index});
			this.related(item, false);
			if( once ) break;
		}
		
		return this;
	};

	// define core functions
	fn.reverse = function() {
		Array.prototype.reverse.call(this);
		return this;
	};

	// mark
	fn.mark = function(name, flag) {
		if( !arguments.length ) name = 'initial';
		
		if( !this._marks ) this._marks = {};
		if( flag !== false ) {
			this._marks[name] = Array.prototype.slice.call(this);
		} else {
			this._marks[name] = null;
			try {
				delete this._marks[name];
			} catch(e) {}				
		}

		return this;
	};
	
	fn.restore = function(mark) {
		if( !this._marks ) return this;
		var source = ( !arguments.length ) ? this._marks['initial'] : this._marks[mark];		
		if( source ) this.clear().merge(source);
		return this;
	};
	
	fn.related = function(item, obj) {
		var related = this._related;
		if( !arguments.length ) {
			return related;
		} else if( arguments.length == 1 ) {
			return related && related.get(item);
		} else if( item && obj === false ) {
			if( related ) related['delete'](item);
			return this;
		}
		
		if( !~this.indexOf(item) ) return console.error('[' + this.component.accessor() + '] item does not exists in this container', item, this);
		
		related = this._related = this._related || new Map();
		if( item && obj ) return related.set(item, obj);
		return console.error('[' + this.component.accessor() + '] illegal arguments', item, obj);
	};
	
	// selectable interface
	fn.selectable = function(selectable) {
		if( !arguments.length ) {
			selectable = this._selectable;
			if( !selectable ) return 0;
			else return selectable.selectable.call(this);
		}
		
		if( typeof(selectable) !== 'number' || selectable < 0 ) console.error('illegal type of selectable(number>=0)', selectable);
		
		var selector = this.selector();
		if( !selector ) {			
			if( selectable === false || selectable === 0 ) this.selector(false);
			else if( selectable === 1 ) this.selector(SingleSelectable);
			else if( selectable > 0 ) this.selector(Selectable);
		}
		
		selector = this.selector();
		if( selector ) selector.selectable(selectable);
		
		return this;
	};
	
	fn.selector = function(fn) {
		if( !arguments.length ) return this._selector;
		if( fn === false ) this._selector = null;
		else if( typeof(fn) ) this._selector = new fn(this);
		else return console.error('illegal type of selector(function)', fn);
		return this;
	};
	
	fn.autodeselect = function(autodeselect) {
		var selector = this._selector;
		if( !selector ) return console.error('[' + this.el.accessor() + '] component is not selectable');
		return selector.autodeselect.apply(selector, arguments);
	};
	
	fn.select = function(index) {
		var selector = this._selector;
		if( !selector ) return console.error('[' + this.el.accessor() + '] component is not selectable');
		return selector.select.apply(selector, arguments);
	};
	
	fn.deselect = function(index) {
		var selector = this._selector;
		if( !selector ) return console.error('[' + this.el.accessor() + '] component is not selectable');
		return selector.deselect.apply(selector, arguments);
	};
	
	fn.selected = function(index) {
		var selector = this._selector;
		if( !selector ) return console.error('[' + this.el.accessor() + '] component is not selectable');
		return selector.selected.apply(selector, arguments);
	};
	
	fn.selectedIndex = function(item) {
		var selector = this._selector;
		if( !selector ) return console.error('[' + this.el.accessor() + '] component is not selectable');
		return selector.selectedIndex.apply(selector, arguments);
	};
	
	fn.prev = function() {
		var selector = this._selector;
		if( !selector ) return console.error('[' + this.el.accessor() + '] component is not selectable');
		return selector.prev.apply(selector, arguments);
	};
	
	fn.next = function() {
		var selector = this._selector;
		if( !selector ) return console.error('[' + this.el.accessor() + '] component is not selectable');
		return selector.next.apply(selector, arguments);
	};
	
	return Items;
})();

(function() {
	SelectorBuilder.addon['Items'] = Items;
	
	var fn = SelectorBuilder.fn;
	var util = SelectorBuilder.util;
	var array_return = util.array_return;
	var isArrayType = util.isArrayType;
	
	fn.item = function(item, index) {
		var $ = this.$;
		return this.each(function() {
			var items = this.items;
			if( !items ) items = this.items = new Items($(this));
			items.merge(item, true, index);
		});
	};
	
	fn.items = function(data, append, index) {
		var $ = this.$;
		if( !arguments.length ) {
			var arr = [];
			this.each(function() {
				var items = this.items = this.items || new Items($(this));
				arr.push(items);					
			});
			return array_return(arr);
		}
		
		var $ = this.$;
		return this.each(function() {
			var items = this.items;
			if( !items ) items = this.items = new Items($(this));
			items.merge(data, append, index);
		});
	};
})();


	
	// exports inner classes
	var addon = SelectorBuilder.addon;
	if( eval('typeof(Animator) !== "undefined"') ) addon.Animator = Animator;
	if( eval('typeof(CSS3Calibrator) !== "undefined"') ) addon.CSS3Calibrator = CSS3Calibrator;
	if( eval('typeof(Device) !== "undefined"') ) addon.device = Device;
	if( eval('typeof(Scroller) !== "undefined"') ) addon.Scroller = Scroller;
	if( eval('typeof(StyleSession) !== "undefined"') ) addon.StyleSession = StyleSession;
	if( eval('typeof(Template) !== "undefined"') ) addon.Template = Template;
	if( eval('typeof(Importer) !== "undefined"') ) addon.Importer = Importer;
	if( eval('typeof(Class) !== "undefined"') ) addon.Class = Class;
	if( eval('typeof(Color) !== "undefined"') ) addon.Color = Color;
	
	
	// check current is in commonjs context
	var CJS = false;
	try {
		eval('(module && exports && require)');
		CJS = true;
	} catch(e) {}	
	
	// binding to global or regist module system. amd, cjs, traditional
	if( typeof(window.define) === 'function' && define.attrs ) {
		define('attrs.dom', function(module) {
			module.exports = SelectorBuilder(document);
		});
		define('animator', function(module) {
			module.exports = Animator;
		});
		define('css-calibrator', function(module) {
			module.exports = CSS3Calibrator;
		});
		define('device', function(module) {
			module.exports = Device;
		});
		define('scroller', function(module) {
			module.exports = Scroller;
		});
		define('template', function(module) {
			module.exports = Template;
		});
		define('style-session', function(module) {
			module.exports = StyleSession;
		});
		define('html-import', function(module) {
			module.exports = Importer;
		});
		define('class', function(module) {
			module.exports = Class;
		});
		define('color', function(module) {
			module.exports = Color;
		});
	} else if( typeof(window.define) === 'function' && define.amd ) {
		define(function() {
			return $;
		});
		define('animator', function(module) {
			return Animator;
		});
		define('css-calibrator', function(module) {
			return CSS3Calibrator;
		});
		define('device', function(module) {
			return Device;
		});
		define('scroller', function(module) {
			return Scroller;
		});
		define('template', function(module) {
			return Template;
		});
		define('style-session', function(module) {
			return StyleSession;
		});
		define('html-import', function(module) {
			return Importer;
		});
		define('class', function(module) {
			return Class;
		});
		define('color', function(module) {
			return Color;
		});
	} else if( CJS ) {
		exports = $;
	} else {
		var original = window.$;
		var attrsdom = window.$ = SelectorBuilder(document);
	
		$.noConflict = function() {
			window.$ = original;
			return attrsdom;
		};
	}
})();

// End Of File (dom.alien.js), attrs ({https://github.com/attrs})
