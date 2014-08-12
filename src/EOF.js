	
	// exports inner classes
	var addon = SelectorBuilder.addon;
	if( eval('typeof(Animator) !== "undefined"') ) addon.Animator = Animator;
	if( eval('typeof(CSS3Calibrator) !== "undefined"') ) addon.CSS3Calibrator = CSS3Calibrator;
	if( eval('typeof(Device) !== "undefined"') ) addon.device = Device;
	if( eval('typeof(Scroller) !== "undefined"') ) addon.Scroller = Scroller;
	if( eval('typeof(StyleSession) !== "undefined"') ) addon.StyleSession = StyleSession;
	if( eval('typeof(Template) !== "undefined"') ) addon.Template = Template;
	if( eval('typeof(EventDispatcher) !== "undefined"') ) addon.EventDispatcher = EventDispatcher;
	if( eval('typeof(Importer) !== "undefined"') ) addon.Importer = Importer;
	
	
	// check current is in commonjs context
	var CJS = false;
	try {
		eval('(module && exports && require)');
		CJS = true;
	} catch(e) {}
	
	
	// binding to global or regist module system. amd, cjs, traditional
	var $ = SelectorBuilder(document);
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
		window.$ = $;
	
		$.noConflict = function() {
			window.$ = original;
			return $;
		};
	}
})();

// End Of File (dom.alien.js), attrs ({https://github.com/attrs})
