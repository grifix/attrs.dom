	
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
