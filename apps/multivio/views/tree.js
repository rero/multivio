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
Multivio.TreeView = SC.ListView.extend(
/** @scope Multivio.TreeView.prototype */ {
  
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

    @observes childViews
    @private
  */
  _childViewsDidChange: function () {
    console.info('!----!childViewDidChange ' + this.isFirstTime);
    var childViews = this.get('childViews');
    if (childViews.get('length') > 0 & this.isFirstTime) {
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
      this.adjust('width', maxWidth);
      this.isFirstTime = NO;
    }
  }.observes('childViews')

});