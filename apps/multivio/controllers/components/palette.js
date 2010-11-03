/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  This controller manages all palettes.   the behavior of the palette view. 
  A palette view is a non modal view.

  @author che
  @extends SC.ObjectController
  @since 0.3.0
*/

Multivio.paletteController = SC.ObjectController.create(
/** @scope Multivio.paletteController.prototype */ {
  
  /**
    local variable used by this controller
  */
  defaultWidth: 360,
  activeButton: null,
  
  /**
    Return the layout position of the palette
    
    @param {Boolean} withDefaultWidth says if used the default width or not
  */
  paletteLayout: function (withDefaultWidth) {
    // retreive the view to append the palette
    var toAppend = Multivio.getPath('views.mainContentView.innerMainContent');
    var viewHeight = toAppend.get('frame').height;
    var layout = [];
    layout.height = viewHeight - 60;
    layout.top = toAppend.get('parentView').get('frame').y;
    layout.left = toAppend.get('frame').x + 5;
    if (withDefaultWidth) {
      layout.width = this.defaultWidth;
    }
    else {
      layout.width = 150;
    }
    return layout;
  },
  
  /**
    Metatada button has been pressed show the metadataPalette or hide it
    
    @param {SC.Button} button the button pressed
  */
  showMetadata: function (button) {
    var metadataView = Multivio.getPath('views.metadataPalette');
    // no activeButton => show this palette
    if (SC.none(this.activeButton)) {
      this.activeButton = button;
      // retreive the view and set the content
      var textField = metadataView.get('contentView').get('childViews')[0];
      textField.set('content', Multivio.metadataController.getTranslatedMetadata());
      metadataView.set('layout', this.paletteLayout(YES));
      metadataView.append();
    }
    else {
      // if activeButton = button close the palette
      // else replace the palette by an other one
      if (this.activeButton !== button) {
        this.activeButton ;
        this.hidePalette(this.activeButton.name);
        this.activeButton = null;
        this.showOtherPalette(button);
      }
      else {
        this.activeButton = null;
        metadataView.remove();
      }
    }
  },
  
  /**
    Thumbnails button has been pressed show the thumbnailPalette or hide it
    
    @param {SC.Button} button the button pressed
  */
  showThumbnails: function (button) {
    var thumbnailsView = Multivio.getPath('views.thumbnailPalette');
    // no activeButton => show this palette
    if (SC.none(this.activeButton)) {
      this.activeButton = button;
      thumbnailsView.set('layout', this.paletteLayout(NO));
      thumbnailsView.append();
    }
    else {
      if (this.activeButton !== button) {
        this.hidePalette(this.activeButton.name);
        this.activeButton = null;
        this.showOtherPalette(button);
      }
      else {
        this.activeButton = null;
        thumbnailsView.remove();
      }
    }
  },
  
  /**
    Tree button has been pressed show the treePalette or hide it
    
    @param {SC.Button} button the button pressed
  */
  showTree: function (button) {
    var treeView = Multivio.getPath('views.treePalette');
    // no activeButton => show this palette
    if (SC.none(this.activeButton)) {
      this.activeButton = button;
      treeView.set('layout', this.paletteLayout(YES));
      treeView.append();
    }
    else {
      if (this.activeButton !== button) {
        this.hidePalette(this.activeButton.name);
        this.activeButton = null;
        this.showOtherPalette(button);
      }
      else {
        this.activeButton = null;
        treeView.remove();
      }
    }
  },
  
  
  /**
     Tree button has been pressed show the treePalette or hide it

     @param {SC.Button} button the button pressed
   */
   showSearch: function (button) {
     var searchPalette = Multivio.getPath('views.searchPalette');
     // no activeButton => show this palette
     if (SC.none(this.activeButton)) {
       this.activeButton = button;
       var ref = Multivio.CDM.getReferer();
       var phys = Multivio.CDM.getPhysicalstructure(ref);
       if ( phys !== -1 && phys.length < 2 && 
           searchPalette.get('contentView').get('childViews')[0].
           get('childViews').length === 8) {
         searchPalette.get('contentView').get('childViews')[0].
             get('childViews')[7].remove();
       }
       searchPalette.set('layout', this.paletteLayout(YES));
       searchPalette.append();
     }
     else {
       if (this.activeButton !== button) {
         this.hidePalette(this.activeButton.name);
         this.activeButton = null;
         this.showOtherPalette(button);
       }
       else {
         this.activeButton = null;
         searchPalette.remove();
       }
     }
   },
  
  /**
    Call the method to show the good palette
    
    @param {SC.Button} the button pressed
  */
  showOtherPalette: function (button) {
    switch (button.name) {
    case 'thumbnails': 
      this.showThumbnails(button);
      break;
    case 'tree':
      this.showTree(button);
      break;
    case 'metadata':
      this.showMetadata(button);
      break;
    case 'search':
    this.showSearch(button);
    break;
      
    default:
      Multivio.logger.info('unable to show the selected palette');
      break;
    }
  },
  
  /**
    Remove the palette that contains this button
    
    @param {String} the name of the button
  */
  hidePalette: function (buttonName) {
    switch (buttonName) {
    case 'thumbnails': 
      Multivio.getPath('views.thumbnailPalette').remove(); 
      break;
    case 'tree':
      Multivio.getPath('views.treePalette').remove();
      break;
    case 'metadata':
      Multivio.getPath('views.metadataPalette').remove();
      break;
    case 'search':
    Multivio.getPath('views.searchPalette').remove();
    break;
      
    default:
      Multivio.logger.info('unable to hide the selected palette');
      break;
    }
  }
});