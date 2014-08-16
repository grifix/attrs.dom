var Items = (function() {
	"use strict";
	
	var isArrayType = SelectorBuilder.util.isArrayType;

	// class container
	function Items(el, selectable) {
		this.el = el;
		if( selectable ) this.selectable(selectable);
	}
	
	var fn = Items.prototype = new Array();
	
	fn.add = fn.push = function(item, index) {
		if( item == undefined || item === null ) {
			console.warn('item cannot be null', item);
			return this;
		}
		
		if( index && typeof(index) !== 'number' ) index = this.indexOf(index);
					
		// evaluation for available to add
		var e = this.el.fire('item.add', {
			item: item
		}, {
			cancelable: true
		});
		
		// if event prevented or item replaced to null, bypass
		if( e.defaultPrevented || e.item === null || e.item === undefined ) return this;
		
		// push assigned index				
		if( (!index && index !== 0) || index < 0 || index >= this.length ) {
			Array.prototype.push.call(this, item);
		} else {
			this.splice(index, 0, item);
		}

		e = this.el.fire('item.added', {item:item, index:this.indexOf(item)});

		return this;
	};
	
	fn.merge = function(items, append, index) {
		if( !arguments.length ) return Array.prototype.slice.call(this) || [];
		if( typeof(items) === 'number' ) return this.get(items);
		if( !items ) {
			console.warn('[' + this.accessor() + '] items was empty', items);
			return this;
		}
		
		if( append !== true ) {
			var current = this.slice();
			for(var i=current.length; i >= 0;i--) {
				this.remove(i);
			}
		}
		
		if( !isArrayType(items) ) items = [items];			
		if( items ) {
			for(var i=0; i < items.length; i++) {
				this.push(items[i], index);
				if( typeof(index) === 'number' ) index++;
			}
		}
		
		return this;
	};

	fn.clear = function() {
		var len = this.length;
		if( len > 0 ) {
			for(var i=0; i < len; i++) {
				var item = this.indexOf(i);
				this.el.fire('item.removed', {item:item, index:i});
				this.related(item, false);
				
				this[i] = undefined;
				try {
					delete this[i];
				} catch(e) {}
			}
		
			this.length = 0;
		}
	
		return this;
	};

	fn.get = function(index) {
		if( typeof(index) === 'number' ) return this[index];
		index = this.indexOf(index);
		if( index >= 0 ) return this[index];
		return null;
	};
	
	fn.contains = function(item) {
		return this.contains(item);
	};
	
	fn.first = function() {
		return this[0];
	};
	
	fn.last = function() {
		return this[this.length - 1];
	};
	
	fn.each = function(fn) {
		this.every(function(el) {
			return ( fn.call(el) === false ) ? false : true;
		});
		return this;
	};

	fn.remove = function(item, once) {
		if( typeof(item) === 'number' ) item = this[item];
		
		for(var index;(index = this.indexOf(item)) >= 0;) {
			this.splice(index, 1);
			
			this.el.fire('item.removed', {item:item, index:index});
			this.related(item, false);
			if( once ) break;
		}
		
		return this;
	};

	// define core functions
	fn.reverse = function() {
		Array.prototype.reverse.call(this);
		return this;
	};

	// mark
	fn.mark = function(name, flag) {
		if( !arguments.length ) name = 'initial';
		
		if( !this._marks ) this._marks = {};
		if( flag !== false ) {
			this._marks[name] = Array.prototype.slice.call(this);
		} else {
			this._marks[name] = null;
			try {
				delete this._marks[name];
			} catch(e) {}				
		}

		return this;
	};
	
	fn.restore = function(mark) {
		if( !this._marks ) return this;
		var source = ( !arguments.length ) ? this._marks['initial'] : this._marks[mark];		
		if( source ) this.clear().merge(source);
		return this;
	};
	
	fn.related = function(item, obj) {
		var related = this._related;
		if( !arguments.length ) {
			return related;
		} else if( arguments.length == 1 ) {
			return related && related.get(item);
		} else if( item && obj === false ) {
			if( related ) related['delete'](item);
			return this;
		}
		
		if( !~this.indexOf(item) ) return console.error('[' + this.component.accessor() + '] item does not exists in this container', item, this);
		
		related = this._related = this._related || new Map();
		if( item && obj ) return related.set(item, obj);
		return console.error('[' + this.component.accessor() + '] illegal arguments', item, obj);
	};
	
	// selectable interface
	fn.selectable = function(selectable) {
		if( !arguments.length ) {
			selectable = this._selectable;
			if( !selectable ) return 0;
			else return selectable.selectable.call(this);
		}
		
		if( typeof(selectable) !== 'number' || selectable < 0 ) console.error('illegal type of selectable(number>=0)', selectable);
		
		var selector = this.selector();
		if( !selector ) {			
			if( selectable === false || selectable === 0 ) this.selector(false);
			else if( selectable === 1 ) this.selector(SingleSelectable);
			else if( selectable > 0 ) this.selector(Selectable);
		}
		
		selector = this.selector();
		if( selector ) selector.selectable(selectable);
		
		return this;
	};
	
	fn.selector = function(fn) {
		if( !arguments.length ) return this._selector;
		if( fn === false ) this._selector = null;
		else if( typeof(fn) ) this._selector = new fn(this);
		else return console.error('illegal type of selector(function)', fn);
		return this;
	};
	
	fn.autodeselect = function(autodeselect) {
		var selector = this._selector;
		if( !selector ) return console.error('[' + this.el.accessor() + '] component is not selectable');
		return selector.autodeselect.apply(selector, arguments);
	};
	
	fn.select = function(index) {
		var selector = this._selector;
		if( !selector ) return console.error('[' + this.el.accessor() + '] component is not selectable');
		return selector.select.apply(selector, arguments);
	};
	
	fn.deselect = function(index) {
		var selector = this._selector;
		if( !selector ) return console.error('[' + this.el.accessor() + '] component is not selectable');
		return selector.deselect.apply(selector, arguments);
	};
	
	fn.selected = function(index) {
		var selector = this._selector;
		if( !selector ) return console.error('[' + this.el.accessor() + '] component is not selectable');
		return selector.selected.apply(selector, arguments);
	};
	
	fn.selectedIndex = function(item) {
		var selector = this._selector;
		if( !selector ) return console.error('[' + this.el.accessor() + '] component is not selectable');
		return selector.selectedIndex.apply(selector, arguments);
	};
	
	fn.prev = function() {
		var selector = this._selector;
		if( !selector ) return console.error('[' + this.el.accessor() + '] component is not selectable');
		return selector.prev.apply(selector, arguments);
	};
	
	fn.next = function() {
		var selector = this._selector;
		if( !selector ) return console.error('[' + this.el.accessor() + '] component is not selectable');
		return selector.next.apply(selector, arguments);
	};
	
	return Items;
})();

(function() {
	SelectorBuilder.addon['Items'] = Items;
	
	var fn = SelectorBuilder.fn;
	var util = SelectorBuilder.util;
	var array_return = util.array_return;
	var isArrayType = util.isArrayType;
	
	fn.item = function(item, index) {
		var $ = this.$;
		return this.each(function() {
			var items = this.items;
			if( !items ) items = this.items = new Items($(this));
			items.add(item, index);
		});
	};
	
	fn.items = function(data, append, index) {
		if( !arguments.length ) {
			var arr = [];
			this.each(function() {
				arr.push(this.items);					
			});
			return array_return(arr);
		}
		
		var $ = this.$;
		return this.each(function() {
			var items = this.items;
			if( !items ) items = this.items = new Items($(this));
			items.merge(data, append, index);
		});
	};
})();
