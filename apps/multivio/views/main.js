/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @class

  View that contains buttons used by the current file

  @author che
  @extends View
  @since 0.3.0
*/
Multivio.MainView = SC.View.extend( 
/** @scope Multivio.ThumbnailContentView.prototype */ {
  /**
    Intercept keybord event
    
    @param {SC.Event}
  */
  keyDown: function (evt) {
    switch (evt.which) {
      case 38:
      case 33:
      Multivio.navigationController.goToPreviousPage();
      break;
      
      case 40:
      case 34:
      Multivio.navigationController.goToNextPage();
      break;
    }
    
    return YES;
  },

});