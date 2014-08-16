var SingleSelectable = (function() {
	"use strict";

	function SingleSelectable(cmp, selectable, autodeselect) {
		this.cmp = cmp;
		this.autodeselect(autodeselect);
	}
	
	SingleSelectable.prototype = {
		selectable: function() {
			if( !arguments.length ) return 1;
			return this;
		},
		autodeselect: function(autodeselect) {
			if( !arguments.length ) return (this._autodeselect === true) ? true : false;
			if( typeof(autodeselect) === 'boolean' ) this._autodeselect = autodeselect;
			return this;
		},
		
		select: function(index) {
			var item = this.cmp.get(index);
			index = this.cmp.indexOf(item);

			if( !item ) return false;

			if( this.selected() === item ) return false;
			if( this.selected() ) {
				if( !this.autodeselect() ) return false;
				this.deselect(this.selected());
			}

			if( this.selected(item) ) return false;

			var e = this.cmp.fire('select', {cancelable: true, item:item, index:index});
			if( e.eventPrevented ) return false;

			this._selected = item;

			this.cmp.fire('selected', {
				item: e.item,
				index: e.index
			});

			return true;
		},
		deselect: function(index) {
			var item = this.cmp.get(index);
			index = this.cmp.indexOf(item);

			if( !item ) return false;
			
			var e = this.cmp.fire('deselect', {cancelable: true, item:item, index:index});
			if( e.eventPrevented ) return false;
			
			if( !this.selected(item) ) return false;

			this._selected = null;

			this.cmp.fire('deselected', {
				item: e.item,
				index: e.index
			});

			return true;
		},
		selected: function(index) {
			if( !arguments.length ) return this._selected;

			var item = this.cmp.get(index);
			index = this.cmp.indexOf(item);

			return (this._selected === item);
		},
		selectedIndex: function(item) {
			if( !this._selected ) return -1;
			return this.cmp.indexOf(this._selected);
		},
		prev: function() {
			var i = this.selectedIndex();
			if( i > 0 ) return this.select(i--);
			return false;
		},
		next: function() {
			var i = this.selectedIndex();
			if( i >= 0 && i < (this.length() - 1) ) return this.select(i++);
			return false;
		},
		first: function() {
			return this.select(0);
		},
		last: function() {
			return this.select(this.cmp.length());
		}
	};

	return SingleSelectable;
})();
