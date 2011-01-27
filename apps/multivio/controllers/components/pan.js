/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  This controller the pan functionality.

  @author che
  @extends SC.ObjectController
  @since 0.4.0
*/

Multivio.panController = SC.ObjectController.create(
/** @scope Multivio.panController.prototype */ {
  
  /**
    variables used to say if the panButton is enabled and if it has been 
    actived by the user.
  */
  isPanActive: NO,
  isPanButtonEnabled: NO,
  
  /**
    Pan button has been pressed active or disable it

    @param {SC.Button} button the button pressed
  */
  activePan: function (button) {
   
    if (this.isPanActive) {
      button.set('isActive', NO);
      this.set('isPanActive', NO);
    }
    else {
      button.set('isActive', YES);
      this.set('isPanActive', YES);
    }
  },
  
  /**
    isPanButtonEnabled or isPanActive did change. Change cursor's class.
  
    @observe isPanButtonEnabled {Boolean}
    @observe isPanActive {Boolean}
  */
  panButtonDidChange: function () {
    var isActive = this.get('isPanActive');
    var isEnabled = this.get('isPanButtonEnabled');
    // get highlightpane view
    var highlight = Multivio.getPath('views.mainContentView.content.' +
        'innerMainContent.contentView.highlightpane');
    if (isActive && isEnabled) {
      highlight.set('classNames', ['sc-view', 'highlight-pane-pan']);
    }
    else {
      highlight.set('classNames', ['sc-view', 'highlight-pane']);
      Multivio.getPath('views.mainContentView.bottomButtons.' +
          'backgroundView.panButton').set('isActive', NO);
      this.set('isPanActive', NO);
    }
    highlight.updateLayer();
  }.observes('isPanButtonEnabled', 'isPanActive')
  
});