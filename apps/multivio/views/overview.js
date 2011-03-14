/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @class

  View that contains a miniature overview of the content

  @author che
  @extends View
  @since 0.4.0
*/
Multivio.OverviewView = SC.View.extend( 
/** @scope Multivio.OverviewView.prototype */ {
  
  /**
    Link to a controler of type SC.ObjectController.
    
    This controller need to have:
      - an url for the image
      - an object that contains the visble part of the reference image
      - an object that contains the scrolls 
  */
  overviewController: null,
  
  /**
    name of the children
  */
  imageOverview: null,
  visiblePartIndicator: null,
  
  /**
    Overwrite createChildView to create the view
  */
  createChildViews: function () {
    var childViews = [];
    
    this.imageOverview = this.createChildView(
      SC.ImageView.design({
        useImageCache: NO,
        borderStyle: SC.BORDER_NONE 
      })
    );
    childViews.push(this.imageOverview);
    
    this.visiblePartIndicator = this.createChildView(
      SC.View.design({
        classNames: 'mvo-glass-zone highlight-pane-pan'
      })
    );
    childViews.push(this.visiblePartIndicator);
    
    this.set('childViews', childViews);
  },
  
  /**
    Diplay the received image
  
    @param {String} url the url of the image
    @param {Object} image the image to display or an error
  */
  displayImage: function (url, image) {
    this.imageOverview.set('layout', {
      centerX: 0,
      centerY: 0,
      width: image.width,
      height: image.height
    });
    this.imageOverview.set('value', url);
    this.drawZone();
  },
  
  /**
    Create the childView that represents the visible part 
    of the reference image
  */
  drawZone: function () {
    if (!SC.none(this.get('overviewController').get('visiblePart'))) {
      var percentHeight = this.get('overviewController').get('visiblePart').height;
      var percentWidth = this.get('overviewController').get('visiblePart').width;
      var positionX = Math.round(this.imageOverview.get('frame').width * 
          this.get('overviewController').get('visiblePart').x);
      var positionY = Math.round(this.imageOverview.get('frame').height *
          this.get('overviewController').get('visiblePart').y);

      if (!SC.none(percentHeight)) {
        this.visiblePartIndicator.set('layout', {
          top: this.imageOverview.get('frame').y - 3 + positionY, 
          left: this.imageOverview.get('frame').x - 3 + positionX, 
          width: this.imageOverview.get('frame').width * percentWidth, 
          height: this.imageOverview.get('frame').height * percentHeight
        });
      }
    }
  },
  
  /**
    The position or the size of the visible part of the reference image
    has changed. Call the drawZone methode to update it.
    
    @observes .overviewController.visiblePart 
  */
  zonePositionOrSizeDidChange: function () {
    this.drawZone();
  }.observes('.overviewController.visiblePart'),
  
  /**
    The reference image did change. Load the new image.
    
    @observes .overviewController.thumbnailUrl 
  */
  thumbnailUrlDidChange: function () {
    var newUrl = this.get('overviewController').get('thumbnailUrl');
    SC.imageCache.loadImage(newUrl, this, this.displayImage);
  }.observes('.overviewController.thumbnailUrl'),
  
  /**
    On mouse down save mouse pointer position and 
    set isDragging property to YES.
    
    @param {SC.Event} Event fired
  */
  mouseDown: function (evt) {
    // save mouse pointer loc for later use
    this._mouseDownInfo = {
      pageX: evt.pageX,
      pageY: evt.pageY,
      left: this.visiblePartIndicator.get('layout').left,
      top: this.visiblePartIndicator.get('layout').top
    };
    return YES;
  },

  /**
    On mouse up set isDragging property to false

    @param {SC.Event} Event fired
  */  
  mouseUp: function (evt) {
    // apply one more time to set final position
    this.mouseDragged(evt); 
    return YES; // handled!
  },

  /**
    On mouse dragged set the scrolls of the controller

    @param {SC.Event} Event fired
  */
  mouseDragged: function (evt) {
    var info = this._mouseDownInfo;
    var newLeft = info.left + (evt.pageX - info.pageX);
    var newTop = info.top + (evt.pageY - info.pageY);
    
    var newScroll = {};
    newScroll.horizontal = (newLeft - this.imageOverview.get('frame').x + 3) /
        this.imageOverview.get('layout').width;
    newScroll.vertical = (newTop - this.imageOverview.get('frame').y + 3) / 
        this.imageOverview.get('layout').height;
    
    this.get('overviewController').set('scrolls', newScroll);
    return YES;
  }

});