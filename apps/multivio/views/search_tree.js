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

  TODO 

  @author dwy
  @extends SC.ScrollView
  @since 0.4.0
*/
Multivio.SearchTreeView = SC.ScrollView.extend(
/** @scope Multivio.SearchTreeView.prototype */ {

  /**
    Binds to the treeController's selection
    
    @binding
  */  
  treeSelection: null,
  treeSelectionBinding: SC.Binding.oneWay('Multivio.searchTreeController.selection'),
  
  /**
    Updates scrollposition by observing changes of the treeController selection.
    
    @observes treeSelection
  */  
  treeSelectionDidChange: function () {
    var selection = this.get('treeSelection');
    if (!SC.none(selection)) {
      var treeS = this.get('treeSelection').firstObject();
      var needToScroll = YES;
      var childViews = this.get('contentView').get('childViews');
      // Don't verify the first and the last child to force to scroll
      for (var j = 1; j < childViews.get('length') - 1 ; j++) {
        var treeBranch = childViews[j].content;
        if (treeBranch === treeS) {
          needToScroll = NO;
          break;
        }
      }
      var leftScroll = this.get('horizontalScrollOffset');
      if (needToScroll) {
        var arrayOfTree = Multivio.searchTreeController.get('arrangedObjects');
        
        // TODO test dwy
        if (SC.none(arrayOfTree)) return;
        
        var selectionIndex = arrayOfTree.indexOf(treeS);
        // get the scroll offset before the move and set it after
        this.get('contentView').scrollToContentIndex(selectionIndex);
        Multivio.logger.debug('update tree scroll'); 
      }
      if (leftScroll === this.get('maximumHorizontalScrollOffset')) {
        leftScroll = 0;
      }
      this.set('horizontalScrollOffset', leftScroll);
    }
  }.observes('treeSelection')
});

Multivio.SearchTreeLabelView = SC.ListItemView.extend(
/** @scope Multivio.SearchTreeLabelView.prototype */ {
  hasContentIcon: YES,
  
  render: function (context, firstTime) {
    sc_super();
    var lab = this.get('content').label;
    
    //Multivio.logger.debug('SearchTreeView, render, content.label: ' + lab);
    
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
    
    // TODO test dwy: get label from content because the one given as parameter
    // above is undefined
    var label = this.get('content').label;
    
    //Multivio.logger.debug('SearchTreeView, renderLabel, label: ' + label + ' context: ' + context);
    
    /*if (!SC.none(nb) && nb !== 0) {
      label = label + " (" + nb + ")";
    }*/
    
    if (SC.none(this.content.get('file_position').index)) {
      context.push('<label class="document-label-view">', label || '', '</label>');
    }
    else {
      context.push('<label>', label || '', '</label>');
    }
  }

});