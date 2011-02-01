/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @class

  Create the main page of Multivio.
  
  @since 0.1.0
*/

Multivio.mainPage = SC.Page.design({

  // The main pane is made visible on screen as soon as your app is loaded.
  // Add childViews to this pane for views to display immediately on page 
  // load.
  mainPane: SC.MainPane.design({
    
    // setting default responder to the application
    defaultResponder: 'Multivio',

    /**
      @property
    */
    acceptsFirstResponder: YES,
    isKeyResponder: YES,
      
    /**
      This Method is call when a key of the keyboard has been selected
      
      @param {SC.Event} Event fired 
      @returns {Boolean} Return value if executed or not 
    */  
    keyDown: function (evt) {
      console.info('keyDown mainPage');
      switch (evt.which) {
        
      // page_up
      // page_down
      case 33:
      case 34:
        this.sendEvent('keyEvent', evt, Multivio.navigationController);
        return YES;
        
      // +
      // -
      case 43:
      case 45:
        this.sendEvent('keyEvent', evt, Multivio.zoomController);
        return YES;
        
      default:
        return NO;
      }
    }
    
  // child view are defined in views.js
  }).classNames('workspace_black')

});
