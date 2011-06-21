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
      this.scrollToSelection();
    }
  }.observes('childViewsNeedLayout'),

  /**
  */
  parentViewDidResize: function () {
    sc_super();
    Multivio.logger.debug('Multivio.ThumbnailView.parentViewDidResize');
    /*
    this.scrollToSelection();
    */
  },

  /**
    Scrolls the view's content so that the current selection is visible on screen
  */
  scrollToSelection: function () {
    /*
    var selection = this.get('thumbnailController').get('selection').
        firstObject();
    if (!SC.none(selection)) {
      var selectionIndex = this.get('thumbnailController').indexOf(selection);
      this.get('contentView').scrollToContentIndex(selectionIndex);
      Multivio.logger.debug('update thumbnail scroll');
    }
    */
    this.get('contentView').scrollToVisible(
        this.getPath('contentView.selection.firstChild'));
  },

  /**
    Update the position of the scroll in the view if needed.

    @private
    @observes thumbnailSelection
  */
  _thumbnailSelectionDidChange: function () {
    this.scrollToSelection();
  }.observes('.thumbnailController.selection')
  
  /**
    
  */
  /*
  frameDidChange: function () {
    this._thumbnailSelectionDidChange();
    //console.log(this.get('frame'));
  }.observes('frame')
  */

});