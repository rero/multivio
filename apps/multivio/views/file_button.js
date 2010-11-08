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
Multivio.FileButtonView = SC.View.extend( 
/** @scope Multivio.FileButtonView.prototype */ {
  
  hideTimer: undefined,
  
  /**
    Override render method to create a timer that hides the view after 3 sec.
    
    @param {Object} context
    @param {Boolean} firstTime 
  */  
  render: function (context, firstTime) {
    if (firstTime) {
      this.hideTimer = SC.Timer.schedule({
        target: this, 
        action: 'hideView', 
        interval: 3000
      });
    }
    
    sc_super();
  },
  
  /**
    Event that occurs when the mouse enter this view. Show this view.
    
    @param {SC.Event}
  */   
  mouseEntered: function (evt) {
    if (!SC.none(this.hideTimer)) {
      this.hideTimer.invalidate();
    }
    else {
      this.showView();
    }
    return YES;
  },
  
  /**
    Event that occurs when the mouse exit this view. Create a timer that hides
    the view after - 1 sec.
    
    @param {SC.Event}
  */
  mouseExited: function (evt) {
    this.hideTimer = SC.Timer.schedule({
      target: this, 
      action: 'hideView', 
      interval: 800
    });
    return YES;
  },
  
  /**
    Hide this view
  */
  hideView: function () {
    this.hideTimer = undefined;
    this.removeAllChildren();
    Multivio.getPath('views.mainContentView.innerMainContent').
        becomeFirstResponder();
  },
  
  /**
    Show this view
  */
  showView: function () {
    var globalView = Multivio.getPath(
        'views.mainContentView.bottomButtons.backgroundView');
    var navView = Multivio.getPath(
        'views.mainContentView.bottomButtons.backgroundView.navigationView');
    var zoomView = Multivio.getPath(
        'views.mainContentView.bottomButtons.backgroundView.zoomView');
    var rotView = Multivio.getPath(
        'views.mainContentView.bottomButtons.backgroundView.rotateView');
    this.appendChild(globalView);
    this.appendChild(navView);
    this.appendChild(zoomView);
    this.appendChild(rotView);
  }

});