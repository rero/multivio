/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @class

  ScrollView that contains thumbnails

  @author che
  @extends SC.ScrollView
  @since 0.1.0
*/
Multivio.ThumbnailView = SC.ScrollView.extend(
/** @scope Multivio.ThumbnailView.prototype */ {
  
  /**
    Link to a controller of type SC.ArrayController
  */
  thumbnailController: null,
    
  /**
    First time the childViews are created, update scroll position.
      
    @observes childViewsNeedLayout
  */
  childViewsDidChange: function () {
    if (this.get('childViewsNeedLayout')) {
        this._thumbnailSelectionDidChange();
    }
  }.observes('childViewsNeedLayout'),

  /**
    Update the position of the scroll in the view if needed.

    @private
    @observes thumbnailSelection
  */
  _thumbnailSelectionDidChange: function () {
    var selection = this.get('thumbnailController').get('selection').
        firstObject();
    if (!SC.none(selection)) {
      // retrieve the list of the thumbnails visible in the view
      var listView = this.get('contentView').get('childViews');
      var needToScroll = YES;
      // don't verify the first and the last child to force to scroll
      for (var i = 1; i < listView.get('length') - 1; i++) {
        var thumb = listView[i].content;
        if (thumb === selection) {
          needToScroll = NO;
        }
      }
      // if needed scroll to the new position
      if (needToScroll) {
        var selectionIndex = this.get('thumbnailController').indexOf(selection);
        this.get('contentView').scrollToContentIndex(selectionIndex);
        Multivio.logger.debug('update thumbnail scroll'); 
      }
    }
  }.observes('.thumbnailController.selection')

});