	
	var CJS = false;
	try {
		eval('(module && exports && require)');
		CJS = true;
	} catch(e) {}
	
	// regist module system. amd, cjs, traditional
	if( typeof(window.define) === 'function' ) {
		if( define.alien ) {
			define('dom', function(module) {
				module.exports = $;
			});
		} else if( define.amd ) {
			define(function() {
				return $;
			});
		}
	} else if( CJS ) {
		exports = $;
	} else {
		var original = window.$;
		window.$ = window.Alien = $;
	
		$.noConflict = function() {
			window.$ = original;
			return $;
		};
	}
})();

// End Of File (dom.alien.js), attrs ({https://github.com/attrs})
