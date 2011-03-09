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
    Binds to the imageController selection and 
    to the rotateController currentValue.
    
    These bindings are used to load new image

    @binding {Boolean}
  */
  selection: null,
  rotate: 0,
  
  /**
    local variables
  */
  // the overview button
  isOverviewActive: NO,
  isOverviewEnabled: NO,
  overviewButton: null,
  
  // for the overviewImage
  thumbnailUrl: null,
  // for the overview 
  visiblePart: {
    height: null,
    width: null,
    x: 0,
    y: 0
  },

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
    if (SC.none(this.get('overviewButton'))) {
      this.set('overviewButton', button);
    }
    if (! this.get('isOverviewActive')) {
      this.set('isOverviewActive', YES);
      this.get('overviewButton').set('isActive', YES);
      this.bind('selection', SC.Binding.oneWay('Multivio.imageController.selection'));
      this.bind('rotate', SC.Binding.oneWay('Multivio.rotateController.currentValue'));
      
      // create the layout
      var layout = [];
      layout.width = 150;
      layout.height = 150;
      layout.left = Multivio.getPath('views.mainContentView.content').
          get('frame').x + 15;
      layout.bottom = 150;
      
      //retreive palette design and append it
      var overviewPalette = Multivio.getPath('views.overviewPalette');
      overviewPalette.set('layout', layout);
      overviewPalette.append();
    }
    else {
      this.set('isOverviewActive', NO);
      this.get('overviewButton').set('isActive', NO);
      this.reset();
      Multivio.getPath('views.overviewPalette').remove();
    }
  },
  
  /**
    isOverviewEnabled has changed see if we have to remove the palette
    
    @observes isOverviewEnabled
  */
  isOverviewEnabledDidChange: function () {
    if (!this.get('isOverviewEnabled') && !SC.none(this.get('overviewButton'))) {
      this.set('isOverviewActive', NO);
      this.get('overviewButton').set('isActive', NO);
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