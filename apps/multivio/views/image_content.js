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
    Link to the imageController. This controller contains an object
    to store the clippingFrame of this view
  */
  imageController: null,
  
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
    ClippingFrame did change, update overviewController values.
    
    clippingFrame: the clipping frame returns the visible portion of the view.
  
    @observes clippingFrame
  */
  clippingFrameDidChange: function () {
    // test no division by 0
    if (this.get('frame').height > 0 &&  this.get('frame').width > 0) {
      var clipping = {};
      clipping.height =  Math.round((this.get('clippingFrame').height / 
          this.get('frame').height) * 100) / 100;
      clipping.width =  Math.round((this.get('clippingFrame').width / 
          this.get('frame').width) * 100) / 100;
      clipping.x =  Math.round((this.get('clippingFrame').x / 
          this.get('frame').width) * 100) / 100;
      clipping.y =  Math.round((this.get('clippingFrame').y / 
          this.get('frame').height) * 100) / 100;
      
      this.get('imageController').set('visiblePart', clipping);
    }
  }.observes('clippingFrame'),

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