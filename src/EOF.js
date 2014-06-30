	
	// exports inner classes
	if( eval('typeof(Animator) !== "undefined"') ) $.Animator = Animator;
	if( eval('typeof(CSS3Calibrator) !== "undefined"') ) $.CSS3Calibrator = CSS3Calibrator;
	if( eval('typeof(Device) !== "undefined"') ) $.device = Device;
	if( eval('typeof(Scroller) !== "undefined"') ) $.Scroller = Scroller;
	if( eval('typeof(StyleSession) !== "undefined"') ) $.StyleSession = StyleSession;
	if( eval('typeof(Template) !== "undefined"') ) $.Template = Template;
	if( eval('typeof(EventDispatcher) !== "undefined"') ) $.EventDispatcher = EventDispatcher;
	
	
	// check current is in commonjs context
	var CJS = false;
	try {
		eval('(module && exports && require)');
		CJS = true;
	} catch(e) {}
	
	
	// binding to global or regist module system. amd, cjs, traditional
	if( typeof(window.define) === 'function' && define.attrs ) {
		define('attrs.dom', function(module) {
			module.exports = $;
		});
	} else if( typeof(window.define) === 'function' && define.amd ) {
		define(function() {
			return $;
		});
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
