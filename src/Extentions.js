(function($) {
	"use strict";
	
	var fn = $.fn;
	
	var array_return = $.util.array_return;
	var resolve = $.util.resolve;
	var data = $.util.data;
	var evalHtml = $.util.evalHtml;
	
	// event extention		
	if( eval('typeof(EventDispatcher) !== "undefined"') ) {
		fn.on = function(types, fn, capture) {
			if( typeof(types) !== 'string' ) return console.error('invalid event type', types);
			if( typeof(fn) !== 'function' ) return console.error('invalid fn', fn);
	
			capture = (capture===true) ? true : false;
			types = types.split(' ');
	
			return this.each(function() {
				var el = this;
		
				for(var i=0; i < types.length; i++) {
					var type = types[i];
			
					if(('on' + type) in el || type.toLowerCase() == 'transitionend') {	// if dom events			
						if( el.addEventListener ) {
							el.addEventListener(type, fn, capture);

							if( type.toLowerCase() == 'transitionend' ) {
								el.addEventListener('webkitTransitionEnd', fn, capture);
							}
						} else if( el.attachEvent ) {
							el.attachEvent('on' + type, fn);
						}
					} else {
						var dispatcher = data.call(this, 'dispatcher');
						if( !dispatcher ) {
							dispatcher = new EventDispatcher(this);
							data.call(this, 'dispatcher', dispatcher);
						}
				
						dispatcher.on(type, fn, capture);
					}
				}
			});
		};

		fn.off = function(types, fn, capture) {
			if( typeof(types) !== 'string' ) return console.error('invalid event type', types);
			if( typeof(fn) !== 'function' ) return console.error('invalid fn', fn);
	
			capture = (capture===true) ? true : false;
			types = types.split(' ');
	
			return this.each(function() {			
				var el = this;
		
				for(var i=0; i < types.length; i++) {
					var type = types[i];
			
					if(('on' + type) in el || type.toLowerCase() == 'transitionend') {	// if dom events
						if( el.removeEventListener ) {
							el.removeEventListener(type, fn, capture);

							if( type.toLowerCase() == 'transitionend' )
								el.removeEventListener('webkitTransitionEnd', fn, capture);
						} else if( el.attachEvent ) {
							el.detachEvent('on' + type, fn);
						}
					} else {
						var dispatcher = data.call(this, 'dispatcher');
						if( !dispatcher ) continue;
				
						dispatcher.un(type, fn, capture);
					}
				}
			});
		};

		fn.fire = function(types, values) {
			if( !types ) return console.error('invalid event type:', types);
	
			values = values || {};
			types = types.split(' ');
	
			return this.each(function() {
				var e, el = this;
		
				for(var i=0; i < types.length; i++) {
					var type = types[i];
			
					if(('on' + type) in el) {	// if dom events
						// eventName, bubbles, cancelable
						if( document.createEvent ) {
							e = document.createEvent('Event');
							e.initEvent(type, ((values.bubbles===true) ? true : false), ((values.cancelable===true) ? true : false));
						} else if( document.createEventObject ) {
							e = document.createEventObject();
						} else {
							return console.error('this browser does not supports manual dom event fires');
						}
		
						for(var k in values) {
							if( !values.hasOwnProperty(k) ) continue;
							var v = values[k];
							try {
								e[k] = v;
							} catch(err) {
								console.error('[WARN] illegal event value', e, k);
							}
						}
						e.values = values;
						e.src = this;

						if( el.dispatchEvent ) {
							el.dispatchEvent(e);
						} else {
							e.cancelBubble = ((values.bubbles===true) ? true : false);
							el.fireEvent('on' + type, e );
						}
					} else {
						var dispatcher = data.call(this, 'dispatcher');
						if( !dispatcher ) continue;
				
						e = dispatcher.fireSync(type, values);
					}
				}
			});
		};
		
		// MutationObserver setup for detect DOM node changes.
		// if browser doesn't support DOM3 MutationObeserver, use MutationObeserver shim (https://github.com/megawac/MutationObserver.js)
		$.ready(function() {
			var observer = new MutationObserver(function(mutations){
				mutations.forEach(function(mutation) {
					//if( debug('mutation') ) console.error(mutation.target, mutation.type, mutation);
			
					if( mutation.type === 'childList' ) {
						var target = mutation.target;
						var tel = $(target);
						var added = mutation.addedNodes;
						var removed = mutation.removedNodes;				
								
						if( removed ) {
							for(var i=0; i < removed.length; i++) {
								var source = $(removed[i]);
						
								tel.fire('removed', {
									removed: removed[i]
								});
						
								source.fire('detached', {
									from: target
								});
							}
						}
				
						if( added ) {
							for(var i=0; i < added.length; i++) {
								var source = $(added[i]);
							
								tel.fire('added', {
									added: added[i]
								});
						
								source.fire('attached', {
									to: target
								});
							}
						}
					}
				}); 
		    });

			observer.observe(document.body, {
				subtree: true,
			    childList: true,
			    attributes: true,
			    characterData: true
			});
		});
	}

	// animation
	if( eval('typeof(Animator) !== "undefined"') ) {
		fn.animate = function(options, callback) {
			return new Animator(this, options, this, this).run(callback).out();
		};

		fn.animator = function(options, scope) {
			return new Animator(this, options, scope || this, this);
		};
	}

	// template
	if( eval('typeof(Template) !== "undefined"') ) {
		fn.bind = function(data, functions) {
			this.restore('#bind').save('#bind');
			return this.each(function() {
				new Template(this).bind(data, functions);
			});
		};

		fn.tpl = function(data, functions) {
			if( !arguments.length ) {
				var arr = [];
				this.each(function() {
					arr.push(new Template($(this).clone()[0]));
				});
				return array_return(arr);
			} else if( data ) {
				var arr = [];
				this.each(function() {
					var d = data;
					if( typeof(d) === 'function' ) d = resolve.call(this, d);				
			
					if( typeof(d.length) !== 'number' ) d = [d];
			
					for(var i=0; i < d.length; i++) {
						var el = $(this).clone()[0];
						if( el.tagName.toLowerCase() === 'script' ) {
							el = evalHtml(el.textContent || el.innerHTML || el.innerText)[0];
						}					
				
						new Template(el).bind(d[i], functions);
						arr.push(el);
					}
				});
				return $(arr).context(this);
			} else {
				return console.error('illegal data', data);
			}
		};
	}
})($);
