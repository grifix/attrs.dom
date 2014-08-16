var Selectable = (function() {
	"use strict"

	function Selectable(cmp, max, autodeselect) {
		this.cmp = cmp;
		this._selected = [];
		this.autodeselect(autodeselect);
		this.selectable(max);
	}
	
	Selectable.prototype = {
		selectable: function(selectable) {
			if( !arguments.length ) return this._selectable || -1;
			if( typeof(selectable) === 'number' ) this._selectable = selectable;
			return this;
		},
		autodeselect: function(autodeselect) {
			if( !arguments.length ) return (this._autodeselect === true) ? true : false;
			if( typeof(autodeselect) === 'boolean' ) this._autodeselect = autodeselect;
			return this;
		},
		
		select: function(index) {
			var max = this.selectable();
			if( max === 0 ) return false;
			
			var item = this.cmp.get(index);
			index = this.cmp.indexOf(item);

			if( !item ) return false;
						
			if( max >= 0 ) {
				if( this._selected.length >= max ) {
					if( !this.autodeselect() ) return false;
					this.deselect(this._selected[0]);
				}
			}

			if( this.selected(item) ) return false;
			
			var e = this.cmp.fire('select', {cancelable: true, item:item, index:index});
			if( e.eventPrevented ) return false;

			this._selected.push(item);

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
			
			Util.array.removeByItem(this._selected, item, true);

			this.cmp.fire('deselected', {
				item: item,
				index: index
			});

			return true;
		},
		selected: function(index) {
			if( !arguments.length ) return (this._selected.length ? this._selected.slice() : null);

			var item = this.cmp.get(index);
			index = this.cmp.indexOf(item);

			return ~this._selected.indexOf(item) ? true : false;
		},
		selectedIndex: function(item) {
			
		}
	};
	
	return Selectable;
})();


