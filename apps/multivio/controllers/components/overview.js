/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  This controller is the link between the image (Multivio.ImageContentView) 
  in the Multivio.ContentView and the image contains in the palette overview
  (Multivio.OverviewView).

  @author che
  @extends SC.ObjectController
  @since 0.4.0
*/

Multivio.overviewController = SC.ObjectController.create(
/** @scope Multivio.overviewController.prototype */ {
  
  
  /**
    Binds to the imageController selection, visiblePart and 
    to the rotateController currentValue.
    
    These bindings are used to load new image

    @binding {Boolean}
  */
  selection: null,
  rotate: 0,
  visiblePart: null,
  
  /**
    local variables
  */
  // the overview button
  isOverviewActive: NO,
  isOverviewEnabled: NO,
  
  // for the overviewImage
  thumbnailUrl: null,

  // for the scroll of the main image
  scrolls : {
    horizontal: 0,
    vertical: 0
  },
  
  /**
    Action show or hide the overviewPalette
    
    @param {SC.Button} button the button pressed
  */
  showOverview: function (button) {
    if (! this.get('isOverviewActive')) {
      this.set('isOverviewActive', YES);
      this.bind('selection', SC.Binding.oneWay('Multivio.imageController.selection'));
      this.bind('rotate', SC.Binding.oneWay('Multivio.rotateController.currentValue'));
      this.bind('visiblePart', SC.Binding.oneWay('Multivio.imageController.visiblePart'));
      
      // create the layout
      var mcvFrame = Multivio.getPath('views.mainContentView.content').get('frame');
      var layout = [];
      layout.width = 150;
      layout.height = 150;
      layout.right = 34;
      layout.bottom = 150;
      
      //retreive palette design and append it
      var overviewPalette = Multivio.getPath('views.overviewPalette');
      overviewPalette.set('layout', layout);
      overviewPalette.append();
    }
    else {
      this.set('isOverviewActive', NO);
      this.reset();
      Multivio.getPath('views.overviewPalette').remove();
    }
  },
  
  /**
    isOverviewEnabled has changed see if we have to remove the palette
    
    @observes isOverviewEnabled
  */
  isOverviewEnabledDidChange: function () {
    if (!this.get('isOverviewEnabled')) {
      this.set('isOverviewActive', NO);
      this.reset();
      Multivio.getPath('views.overviewPalette').remove();
    }
  }.observes('isOverviewEnabled'),
   
  /**
    Reset variables and disconnect bindings
  */
  reset: function () {
    // first disconnect bindings
    var listOfBindings = this.get('bindings');
    for (var i = 0; i < listOfBindings.length; i++) {
      var oneBinding = listOfBindings[i];
      oneBinding.disconnect();
    }
    this.set('bindings', []);
    this.selection = null;
    this.rotate = 0;
    this.visiblePart = null;
  },
  
  /**
    Scrolls did change. This indicates that the visiblePartIndicator view of 
    the overview Palette has moved. 
    Update scrollPosition of the imageController.
  
    @observes scrolls
  */
  scrollsDidChange: function () {
    var newScrolls = {};
    newScrolls.verticalPos = this.get('scrolls').vertical;
    newScrolls.horizontalPos = this.get('scrolls').horizontal;
    Multivio.imageController.set('scrollPosition', newScrolls);
  }.observes('scrolls'),
   
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
      this.set('thumbnailUrl', imageUrl);
    }
  }.observes('selection'),

  /**
    Load a new image by observing changes of the rotate value

    @observes rotate
  */
  rotateDidChange: function () {
    var currentSelection = this.get('selection');
    if (!SC.none(currentSelection) && !SC.none(currentSelection.firstObject())) {
      var imageUrl = currentSelection.firstObject().url;
      var rot = this.get('rotate');
      imageUrl = imageUrl.replace('?', '?max_width=130&max_height=130&angle=' + 
          rot + '&');
      this.set('thumbnailUrl', imageUrl);
    }
  }.observes('rotate')
});