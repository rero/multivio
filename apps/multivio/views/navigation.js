/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @class

  View that contains the current file or the current position

  @author che
  @extends View
  @since 0.3.0
*/
Multivio.navigationView = SC.View.extend( 
/** @scope Multivio.navigationView.prototype */ {
  
  /**
    Override render method to create a timer that hides the view after 3 sec.
    
    @param {Object} context
    @param {Boolean} firstTime 
  */  
  render: function (context, firstTime) {
    if (firstTime) {
      SC.Timer.schedule({
        target: this, 
        action: 'hideView', 
        interval: 3000
      });
    }
    sc_super();
  },
  
  /**
     Hide this view
   */
  hideView: function () {
    this.removeAllChildren();
    Multivio.getPath('views.mainContentView.innerMainContent').
        becomeFirstResponder();
  },

  /**
    Show this view
  */
  showView: function (val) {
    var trans = Multivio.getPath(
        'views.mainContentView.navigation.transparentView');

    var navView = Multivio.getPath(
        'views.mainContentView.navigation.transparentView.currentView');
    navView.set('value', val);
    this.appendChild(trans);
    this.appendChild(navView);
    SC.Timer.schedule({
      target: this, 
      action: 'hideView', 
      interval: 1000
    });
  }
  
});