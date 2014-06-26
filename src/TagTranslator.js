var TagTranslator = (function() {
	"use strict"
	
	function TagTranslator(scope) {
		this.translators = {};
		this.scope = scope;
	}
	
	TagTranslator.prototype = {
		add: function(selector, translator) {
			if( arguments.length <= 1 ) return this.translators[selector];
			
			if( typeof(translator) !== 'function' ) return console.error('translator must be a function', selector, translator);
			this.translators[selector] = translator;
			return this;
		},
		translate: function(el) {
			var translators = this.translators;
			
			var scope = this.scope || this;
			for(var selector in translators) {
				if( !translators.hasOwnProperty(selector) ) continue;
				
				var els = Array.prototype.slice.call(el.querySelectorAll(selector));
				var translator = translators[selector];
				
				els.forEach(function(el) {
					var attrs = el.attributes;

					var o = {};
					for(var i=0; i < attrs.length; i++) {
						var name = attrs[i].name;
						var value = attrs[i].value;
						o[name] = value;
					}
					
					var replaced = translator.apply(scope, [el, o]);
					
					if( replaced && el !== replaced ) {
						if( typeof(replaced.length) !== 'number' ) replaced = [replaced];
											
						for(var i=0; i < replaced.length; i++) {			
							el.parentNode.insertBefore(replaced[i], el);
						}
					}
					
					if( el !== replaced ) el.parentNode.removeChild(el);
				});
			}
		}
	};
	
	return TagTranslator;
})();

/* test 
window.onload = function() {
	var translator = new TagTranslator();
	translator.add('btn', function(el, attrs) {
		console.log('btn', el, attrs);
		
		var div = document.createElement('div');
		div.innerHTML = 'replaced';
		
		var div2 = document.createElement('div');
		div2.innerHTML = 'replaced';
		
		return div;
	});
	
	translator.translate(document.body);
};
*/