/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @class

  View that contains the search results tree.

  @author dwy
  @extends SC.ScrollView
  @since 0.4.0
*/
Multivio.SearchTreeView = SC.ScrollView.extend(
/** @scope Multivio.SearchTreeView.prototype */ {

  /**
    Reference to the controller for the search results' tree
    
    TODO export explicit reference
  */
  searchTreeController: Multivio.searchTreeController,

  /**
    Updates scrollposition by observing changes of the searchTreeController selection.
    
    @observes .searchTreeController.selection
    
  */  
  treeSelectionDidChange: function () {
    var selection = this.get('searchTreeController').get('selection');
    if (!SC.none(selection)) {
      var leftScroll = this.get('horizontalScrollOffset');
      var tree_content = this.get('searchTreeController').get('arrangedObjects');
      if (SC.none(tree_content)) return;
      var selectionIndex = tree_content.indexOf(selection.firstObject());

      // add 1 because the horizontalScroll is not visible the firstTime
      // this method is call
      if (!this.get('isHorizontalScrollerVisible')) {
        selectionIndex++;
      }
      this.get('contentView').scrollToContentIndex(selectionIndex);
      Multivio.logger.debug('update search tree scroll');

      if (leftScroll === this.get('maximumHorizontalScrollOffset')) {
        leftScroll = 0;
      }
      this.set('horizontalScrollOffset', leftScroll);
    }
  }.observes('.searchTreeController.selection')
});

Multivio.SearchTreeLabelView = SC.ListItemView.extend(
/** @scope Multivio.SearchTreeLabelView.prototype */ {

  /**
    Reference to search controller:
    TODO: remove explicit reference to the Multivio.searchController object
  */
  searchController: Multivio.searchController,

  hasContentIcon: YES,
  
  isEnabledBinding: 'Multivio.searchTreeController.allowsSelection',
  
  render: function (context, firstTime) {
    sc_super();
    var lab = this.get('content').label;
    
    // TODO: find a better method to calculate size
    var labelSize = SC.metricsForString(lab, 
        '"Helvetica Neue", Arial, Helvetica, Geneva, sans-serif;');
    var newWith = labelSize.width + ((this.get('outlineLevel') + 1) * 32);
    //update size if necessary 
    if (this.get('parentView').get('frame').width < newWith) {
      this.get('parentView').adjust('width', newWith);
    }
  },
    
  /**
    Override renderIcon method to add a generic icon 

    @param {Object} context
    @param {String} icon a URL or class name
  */
  renderIcon: function (context, icon) {
    // don't draw icon for 'More' nodes
    if (this.content.get('type') === 'more') return;
    if (SC.none(this.content.get('file_position').index)) {
      context.begin('img').addClass('icon').addClass('')
          .attr('src', static_url('images/icons/file')).end();
    }
  }, 

  /**
    Override renderLabel method to set some labels in bold
    
    NOTE: 'More' nodes have file_position.index === null, so they get the
    document-label-view class as well.
    
    @param {Object} context
    @param {String} label
  */    
  renderLabel: function (context, label) {
    
    // disable element if needed
    var cl = (this.get('isEnabled')? '': 'disabled');

    if (SC.none(this.content.get('file_position').index)) {
      context.push('<label class="document-label-view %@">'.fmt(cl), label || '', '</label>');
    }
    else {
      var text = label || '';

      // try to render the current search term in bold in the label
      var cst = this.searchController.get('currentSearchTerm');

      if (SC.typeOf(cst) === SC.T_STRING && SC.typeOf(label) === SC.T_STRING) {
        // split the complete string in parts using "cst" as separator - after
        // converting evrything to lowercase, so that all cases can be
        // considered (search is case insensitive)
        var parts = label.toLowerCase().split(cst.toLowerCase());
        if (SC.typeOf(parts) === SC.T_ARRAY) {
          // set initial and final positions of the current part
          var posI = 0;
          var posF = parts[0].length;
          text = label.substring(posI, posF);
          for (var p = 1; p < parts.length; p++) {
            var cstText = label.substr(posF, cst.length);
            // re-set initial and final positions of the current part
            posI = posF + cst.length;
            posF = posI + parts[p].length;
            var partText = label.substring(posI, posF);
            text = text + "<strong>" + cstText + "</strong>" + partText;
          }
        }
      }

      context.push('<label class="%@">'.fmt(cl));
      context.push(text);
      context.push('</label>');
    }
  }

});