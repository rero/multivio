/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @class

  View that contains create a magnifying glass

  @author che
  @extends View
  @since 0.4.0
*/
Multivio.MagnifyingGlassView = SC.View.extend( 
/** @scope Multivio.MagnifyingGlassView.prototype */ {
  
  /**
    Binds to the imageController selection.
    
    This binding is used load new image

    @binding {Boolean}
  */
  selection: null,
  selectionBinding: 'Multivio.imageController.selection',
  
  /**
    Binds to the masterController isLoadingContent property.
    
    This binding is used to draw the highlighted zone

    @binding {Boolean}
  */
  isLoadingContent: null,
  isLoadingContentBinding: 'Multivio.masterController.isLoadingContent',
  
  rotate: 0,
  rotateBinding: 'Multivio.rotateController.currentValue',
  
  
  /** 
    @property {Object}
    
    define the highlighted zone
    
    @default width, height, x, y = 0 
  */
  zoneToDraw: {
    width: 0,
    height: 0,
    x: 0,
    y: 0
  },
  
  /** 
    @property {Object}
    
    define the image size
    
    @default width, height = 0
  */
  imageSize: {
    width: 0,
    height: 0
  },
  
  /** 
    @property {String}
    
    @default null
  */
  imageUrl: null,
  
  /**
    First time creates the children of this view. Then set value of the
    image and the layout for the highlighted zone.
    
    @param {Object} context
    @param {Boolean} firstTime 
  */
  render: function (context, firstTime) {
    if (firstTime) {
      // first child is an image
      var thumbnail = this.createChildView(SC.ImageView.design({
        layout: { top: 10, bottom: 10, left: 10, right: 10},
        useImageCache: NO,
        value: '',
        borderStyle: SC.BORDER_NONE 
      }));
      this.appendChild(thumbnail);
      // second child is the highlighted zone
      var zone = this.createChildView(SC.View.design({
        layout: {top: 5, left: 5,  width: 30, height: 30},
        classNames: 'mvo-glass-zone'
      }));
      this.appendChild(zone);
    }
    else {
      this.get('childViews')[0].set('value', this.imageUrl);
      this.get('childViews')[1].set('layout', {
        'top': this.zoneToDraw.y, 
        'left': this.zoneToDraw.x, 
        'width': this.zoneToDraw.width, 
        'height': this.zoneToDraw.height
      });
    }
    sc_super();
  },
  
  reset: function () {
    this.removeAllChildren();
  },
  
  /**
    Calculate the size and the position of the highlighted zone.
  */
  drawZone: function () {
    // get the referer image
    var centralView = Multivio.getPath('views.mainContentView.content.innerMainContent');
    var imageView = centralView.get('contentView');
    // calculate position and size of the zone
    var widthRatio = 100 / imageView.get('frame').width * centralView.get('frame').width;
    var heightRatio = 100 / imageView.get('frame').height * centralView.get('frame').height;
    var relPosX = imageView.get('frame').x < 0 ? 
        imageView.get('frame').width / imageView.get('frame').x : 0;
    var relPosY = imageView.get('frame').y < 0 ? 
        imageView.get('frame').height / imageView.get('frame').y : 0;
    this.zoneToDraw.width = widthRatio >= 100 ? this.imageSize.width :
        (this.imageSize.width * widthRatio) / 100;
    this.zoneToDraw.height = heightRatio >= 100 ? this.imageSize.height : 
        (this.imageSize.height * heightRatio) / 100;
    this.zoneToDraw.width = Math.round(this.zoneToDraw.width);
    this.zoneToDraw.height = Math.round(this.zoneToDraw.height);
    relPosX = -1 * relPosX;
    this.zoneToDraw.x = relPosX === 0 ? 5 : 
        5  + Math.round(this.imageSize.width / relPosX);
    relPosY = -1 * relPosY;
    this.zoneToDraw.y = relPosY === 0 ? 5 : 
        5 + Math.round(this.imageSize.height / relPosY);
    this.updateLayer();
  },
  
  /**
    Retreive the size of the loaded image and the url
    
    @callback SC.imageCache.load
    @param {String} url
    @param {Image} image
  */
  load: function (url, image) {
    this.imageUrl = url;
    this.imageSize.width = image.width;
    this.imageSize.height = image.height;
    this.drawZone();
  },
  
  /**
    Load a new image by observing changes of the current selection
    
    @observes selection
  */
  selectionDidChange: function () {
    var currentSelection = this.get('selection');
    if (!SC.none(currentSelection) && !SC.none(currentSelection.firstObject())) {
      var imageUrl = currentSelection.firstObject().url;
      var rot = this.get('rotate');
      imageUrl = imageUrl.replace('?', '?max_width=130&max_height=130&angle=' + 
          rot + '&');
      SC.imageCache.loadImage(imageUrl, this, this.load);
    }
  }.observes('selection'),
  
  /**
    Load a new image by observing changes of the value of the rotation
    
    @observes rotate
  */
  rotateDidChange: function () {
    this.selectionDidChange();
  }.observes('rotate'),
  
  
  /**
    Draw the new highlighted zone by observing changes of the isLoadingContent
    property
    
    @observes selection
  */
  isLoadingContentDidChange: function () {
    if (!this.get('isLoadingContent')) {
      this.drawZone();
    }
  }.observes('isLoadingContent'),
  
  /**
    On mouse down save mouse pointer position
    
    @param {SC.Event} Event fired
  */
  mouseDown: function (evt) {
    // indicate dragging - rerenders view
    this.get('childViews')[1].set('isDraggin', YES);
    // save mouse pointer loc for later use
    this._mouseDownInfo = {
      pageX: evt.pageX,
      pageY: evt.pageY,
      left: this.get('childViews')[1].get('layout').left,
      top: this.get('childViews')[1].get('layout').top
    };
    this.oldT = 0;
    this.oldL = 0;
    return YES;
  },

  /**
    On mouse up set isDragging property to false

    @param {SC.Event} Event fired
  */  
  mouseUp: function (evt) {
    this.get('childViews')[1].set('isDragging', NO);
    // apply one more time to set final position
    this.mouseDragged(evt); 
    return YES; // handled!
  },

  /**
    On mouse dragged set move the highlighted zone and send and event to the 
    referer image

    @param {SC.Event} Event fired
  */  
  oldT: 0,
  oldL: 0,
  mouseDragged: function (evt) {
    var info = this._mouseDownInfo;
    var newLeft = info.left + (evt.pageX - info.pageX);
    var newTop = info.top + (evt.pageY - info.pageY);
    var newT = 0;
    var newL = 0;
    
    // define border : left, rigth, top, bottom
    if (newLeft < 5) {
      newLeft = 5;
    }
    if (newLeft > 5 + this.imageSize.width - this.zoneToDraw.width) {
      newLeft = 5 + this.imageSize.width - this.zoneToDraw.width;
    }
    if (newTop < 5) {
      newTop = 5;
    }
    if (newTop > 5 + this.imageSize.height - this.zoneToDraw.height) {
      newTop = 5 + this.imageSize.height - this.zoneToDraw.height;
    }
    // move zone 
    this.get('childViews')[1].set('layout', {
        'top': newTop,
        'left': newLeft, 
        'width': this.zoneToDraw.width, 
        'height': this.zoneToDraw.height
      });
    // calculate the scroll move and send event 
    var centralV = Multivio.getPath('views.mainContentView.content.innerMainContent'); 
    newT = evt.pageY - info.pageY;
    var diff = newT - this.oldT; 
    var ratioH = centralV.get('contentView').get('frame').height / 
        this.imageSize.height;
    this.oldT = newT;
    
    newL = evt.pageX - info.pageX;
    var diffL = newL - this.oldL;
    this.oldL = newL;
    
    centralV.moveScroll(Math.round(diff * ratioH), Math.round(diffL * ratioH));
    return YES;
  }

});