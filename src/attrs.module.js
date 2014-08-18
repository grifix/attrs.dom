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
