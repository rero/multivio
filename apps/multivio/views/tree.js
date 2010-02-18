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
  @extends SC.ListView
  @since 0.1.0
*/
Multivio.TreeView = SC.ScrollView.extend(
/** @scope Multivio.TreeView.prototype */ {
  
  /**
    Binds to the tree selection in the tree controller
    
    @binding {String}
   */
  treeSelectionBinding: "Multivio.treeController.selection",
  
  /**
    IsFirstTime ensures we adjust the view only one time.
    
    _childViewsDidChange is called every time the user 
    expand or collapse a branch of the tree. 
    
    @property {Boolean}
  */
  isFirstTime: YES,

  /**
    Adjust the treeView width and scroll to the treeSelection.
    The new width is the width of the largest label.

    @observes treeSelection
    @private
  */
  _treeSelectionDidChange: function () {
    var childViews = this.get('contentView').get('childViews');
    if (childViews.get('length') > 0) {
      //FirstTime update treeView width
      if (this.isFirstTime) {
        var maxWidth = 0;
        for (var i = 0; i < childViews.get('length'); i++) {
          var labelView = childViews[i];
          var labelWidth = labelView.content.get('labelWidth');
          //maxLabelWidth depends on the labelWidth, the outline and the position
          //of the label in the Tree (outlineLevel)
          var maxLabelWidth = (labelWidth * 6.5) + 
              (labelView.get('outlineIndent') * 
              (labelView.get('outlineLevel') + 1));

          if (maxLabelWidth > maxWidth) {            
            maxWidth = maxLabelWidth;
          }  
        }
        //update the View with the maxWidth
        this.get('contentView').adjust('width', maxWidth);
        this.isFirstTime = NO;
      }
      //verify If need to scroll
      else {
        var selection = this.get('treeSelection').firstObject();
        if (!SC.none(selection)) {
          //retreive the list of the tree visible in the view
          var needToScroll = YES;
          for (var j = 0; j < childViews.get('length'); j++) {
            var treeBranch = childViews[j].content;
            
            //if the tree selected is already in the view no scroll is needed
            if (treeBranch === selection) {
              needToScroll = NO;
            }
          }
          //if needed scroll to the new position
          if (needToScroll) {
            var arrayOfTree = Multivio.treeController.get('arrangedObjects'); 
            var selectionIndex = arrayOfTree.indexOf(selection);
            this.get('contentView').scrollToContentIndex(selectionIndex);
            Multivio.logger.debug('update tree scroll'); 
          }
        }
      }
    }
  }.observes('treeSelection')

});