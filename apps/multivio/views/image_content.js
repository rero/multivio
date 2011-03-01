/**
==============================================================================
Project: Multivio - https://www.multivio.org/
Copyright: (c) 2009-2011 RERO
License: See file license.js
==============================================================================
*/

/** @class

  The content view image. It contains the image displaying the main content. 
  
  @author {dwy}
  @extends {SC.ImageView}
  @since {0.2.0}
*/
Multivio.ImageContentView = SC.ImageView.extend(
/** @scope Multivio.ImageContentView.prototype */ {
  
  /**
    Catch mouse Event and send it to the HighlightContentView
    
    #CHE  
    Note: Add this 3 functions because selection doesn't work on IE
  */
  mouseDown: function (evt) {
    this.get('parentView').get('childViews')[1].mouseDown(evt);
  },
  
  mouseDragged: function (evt) {
    this.get('parentView').get('childViews')[1].mouseDragged(evt);
  },
  
  mouseUp: function (evt) {
    this.get('parentView').get('childViews')[1].mouseUp(evt);
  },

  /**
    @method

    Called when the parent view was resized.
    Applies the same dimensions to this element.

  */
  parentViewDidResize: function () {

    // get parent view of element, exit if none
    var parent = this.get('parentView');

    if (SC.none(parent)) return;

    // get dimensions of parent element
    var contentWidth = parent.get('layout').width;
    var contentHeight = parent.get('layout').height;

    // adjust dimensions of child accordingly
    this.adjust('width',  contentWidth);
    this.adjust('height', contentHeight);

  }
});