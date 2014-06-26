var StyleSession = (function() {
	"use strict"
	
	var calibrator = new CSS3Calibrator({
		prefix: '-webkit-',
		is: function(qry) {
			return true
		}
	});

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
							var key = keyvalue[0];
							var value = keyvalue[1];
							if( typeof(value) === 'string') value = value.trim();
							o[key.trim()] = value;
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
