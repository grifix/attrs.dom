	
	var original = window.$;
	window.$ = window.Alien = $;
	
	$.noConflict = function() {
		window.$ = original;
		return $;
	};
	
	return $;
})();

// End Of File (dom.alien.js), Authored by joje6 ({https://github.com/joje6})
