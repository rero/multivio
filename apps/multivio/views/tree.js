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
    Updates scrollposition by observing changes of the treeController selection.
    
    @observes treeSelection
  */  
  treeSelectionDidChange: function () {
    var selection = this.get('treeSelection').firstObject();
    if (!SC.none(selection)) {
      var needToScroll = YES;
      var childViews = this.get('contentView').get('childViews');
      // Don't verify the first and the last child to force to scroll
      for (var j = 1; j < childViews.get('length') - 1 ; j++) {
        var treeBranch = childViews[j].content;
        if (treeBranch === selection) {
          needToScroll = NO;
          break;
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
  hasContentIcon: YES,
    
  /**
    Override renderIcon method to add a generic icon 

    @param {Object} context
    @param {String} icon a URL or class name
  */
  renderIcon: function (context, icon) {
    if (SC.none(this.content.get('file_position').index)) {
      context.begin('img').addClass('icon').addClass('')
          .attr('src', static_url('images/icons/mute')).end();
    }
  }, 

  /**
    Override renderLabel method to set some labels in bold 

    @param {Object} context
    @param {String} label
  */    
  renderLabel: function (context, label) {
    if (SC.none(this.content.get('file_position').index)) {
      context.push('<label class="document-label-view">', label || '', '</label>');
    }
    else {
      context.push('<label>', label || '', '</label>');
    }
  }

});