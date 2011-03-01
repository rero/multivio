/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @class

  View that contains the tree

  @author che
  @extends SC.ScrollView
  @since 0.1.0
*/
Multivio.TreeView = SC.ScrollView.extend(
/** @scope Multivio.TreeView.prototype */ {

  /**
    Link to a controller of type SC.TreeController
  */  
  treeController: null,
  
  /**
    First time the childViews are created, update scroll position.
    
    @observes childViewsNeedLayout
  */
  childViewsDidChange: function () {
    if (this.get('childViewsNeedLayout') && this.get('contentView').
        get('childViews').get('length') !== 0) {
      this.treeSelectionDidChange();
    }
  }.observes('childViewsNeedLayout'),
  
  /**
    Updates scroll position by observing changes of the treeController selection.
    
    @observes treeSelection
  */  
  treeSelectionDidChange: function () {
    var selection = this.get('treeController').get('selection');
    if (!SC.none(selection)) {
      var leftScroll = this.get('horizontalScrollOffset');
      var selectionIndex = this.get('treeController').get('arrangedObjects')
          .indexOf(selection.firstObject());

      // add 1 because the horizontalScroll is not visible the firstTime
      // this method is call
      if (!this.get('isHorizontalScrollerVisible')) {
        selectionIndex++;
      }
      this.get('contentView').scrollToContentIndex(selectionIndex);
      Multivio.logger.debug('update tree scroll'); 

      if (leftScroll === this.get('maximumHorizontalScrollOffset')) {
        leftScroll = 0;
      }
      this.set('horizontalScrollOffset', leftScroll);
    }
  }.observes('.treeController.selection')
});

Multivio.TreeLabelView = SC.ListItemView.extend(
/** @scope Multivio.TreeLabelView.prototype */ {
  hasContentIcon: YES,
  
  render: function (context, firstTime) {
    sc_super();
    var lab = this.get('content').label;
    var list = context._classNames;
    var newLabelSize =   SC.metricsForString(lab, list.toString());  
    var newWidth = newLabelSize.width + parseInt(context._STYLE_PAIR_ARRAY[1],
        10) + 24;
    //update size if necessary
    if (this.get('parentView').get('frame').width < newWidth) {
      this.get('parentView').adjust('width', newWidth);
    }
  },
    
  /**
    Override renderIcon method to add a generic icon 

    @param {Object} context
    @param {String} icon a URL or class name
  */
  renderIcon: function (context, icon) {
    if (SC.none(this.content.get('file_position').index)) {
      context.begin('img').addClass('icon').addClass('')
          .attr('src', static_url('images/icons/file')).end();
    }
  }, 

  /**
    Override renderLabel method to set some labels in bold 

    @param {Object} context
    @param {String} label
  */    
  renderLabel: function (context, label) {
    // display number of search results for this element
    var nb = this.content.get('nb_results');
    
    if (!SC.none(nb) && nb !== 0) {
      label = label + " (" + nb + ")";
    }
    
    if (SC.none(this.content.get('file_position').index)) {
      context.push('<label class="document-label-view">', label || '', '</label>');
    }
    else {
      context.push('<label>', label || '', '</label>');
    }
  }

});