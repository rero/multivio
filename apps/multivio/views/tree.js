/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
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
    Binds to the treeController's selection
    
    @binding
  */  
  treeSelection: null,
  treeSelectionBinding: SC.Binding.oneWay('Multivio.treeController.selection'), 
  
  /**
    Updates scollposition by observing changes of the treeController selection.
    
    @observes treeSelection
  */  
  treeSelectionDidChange: function() {
    var selection = this.get('treeSelection').firstObject();
    if (!SC.none(selection)) {
      var needToScroll = YES;
      var childViews = this.get('contentView').get('childViews');
      for (var j = 0; j < childViews.get('length'); j++) {
        var treeBranch = childViews[j].content;
        if (treeBranch === selection) {
          needToScroll = NO;
        }
      }
      if (needToScroll) {
        var arrayOfTree = Multivio.treeController.get('arrangedObjects');
        var selectionIndex = arrayOfTree.indexOf(selection);
        this.get('contentView').scrollToContentIndex(selectionIndex);
        Multivio.logger.debug('update tree scroll'); 
      }
    }
  }.observes('treeSelection')
  
});

Multivio.TreeLabelView = SC.ListItemView.extend(
  /** @scope Multivio.TreeLabelView.prototype */ {

  /**
    Override renderLabel method to set some labels in bold 

    @param {Object} context
    @param {String} label
  */    
  renderLabel: function (context, label) {
    if (this.content.get('position') === 0) {
      context.push('<label class="document-label-view">', label || '', '</label>') ;
    }
    else {
      context.push('<label>', label || '', '</label>') ;
    }
  }

});