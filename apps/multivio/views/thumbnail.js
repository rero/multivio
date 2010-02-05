/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @class

  View that contains thumbnails

  @author {che}     
  @extends {SC.ScrollView}  
  @since {0.1.0}    
*/
Multivio.ThumbnailView = SC.ScrollView.extend(
/** @scope Multivio.Thumbnail.prototype */ {
  
  /**
    @binding {String}
    
    Binds to the thumbnail selection in the thumbnail controller
   */
  thumbnailSelectionBinding: "Multivio.thumbnailController.selection",

  /**
    @method
    
    Update the position of the scroll in the view if needed.

    @observes {thumbnailSelection}
  */
  _thumbnailSelectionDidChange: function () {
    var selection = this.get('thumbnailSelection').firstObject();
    if (!SC.none(selection)) {
      //retreive the list of the thumbnails visible in the view
      var listView = this.get('contentView').get('childViews');
      var needToScroll = YES;
      for (var i = 0; i < listView.get('length'); i++) {
        var thumb = listView[i].content;
        //if the thumbnail selected is already in the view no scroll is needed
        if (thumb === selection) {
          needToScroll = NO;
        }
      }
      //if needed scroll to the new position
      if (needToScroll) {
        var selectionIndex = Multivio.thumbnailController.indexOf(selection);
        this.scrollTo(null, selectionIndex *
            this.get('contentView').get('rowHeight'));
        Multivio.logger.debug('update thumbnail scroll'); 
      }
    }
  }.observes('thumbnailSelection')

});