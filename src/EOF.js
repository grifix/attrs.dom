	
	// exports inner classes
	var addon = SelectorBuilder.addon;
	if( eval('typeof(Animator) !== "undefined"') ) addon.Animator = Animator;
	if( eval('typeof(CSS3Calibrator) !== "undefined"') ) addon.CSS3Calibrator = CSS3Calibrator;
	if( eval('typeof(Device) !== "undefined"') ) addon.device = Device;
	if( eval('typeof(Scroller) !== "undefined"') ) addon.Scroller = Scroller;
	if( eval('typeof(StyleSession) !== "undefined"') ) addon.StyleSession = StyleSession;
	if( eval('typeof(Template) !== "undefined"') ) addon.Template = Template;
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
		define('importor', function(module) {
			module.exports = Importer;
		});
	} else if( typeof(window.define) === 'function' && define.amd ) {
		define(function() {
			return $;
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
		define('importor', function(module) {
			module.exports = Importer;
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
