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
    Binds to the paletteController isHorizontalToolbarActive property.
    
    This binding is used to show permanently the toolbar or to hide it.

    @binding {Boolean}
  */
  isHorizontalToolbarActiveBinding: 
      SC.Binding.oneWay("Multivio.paletteController.isHorizontalToolbarActive"),
  
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
    // if the toolbar button is active do nothing
    if (!this.get('isHorizontalToolbarActive')) {
      if (!SC.none(this.hideTimer)) {
        this.hideTimer.invalidate();
      }
      else {
        this.showView();
      }
    }
    return YES;
  },
  
  /**
    Event that occurs when the mouse exit this view. Create a timer that hides
    the view after - 1 sec.
    
    @param {SC.Event}
  */
  mouseExited: function (evt) {
    // if the toolbar button is active do nothing
    if (!this.get('isHorizontalToolbarActive')) {
      this.hideTimer = SC.Timer.schedule({
        target: this, 
        action: 'hideView', 
        interval: 800
      });
    }
    return YES;
  },
  
  /**
    Toolbar button has been pressed, verify if we must show the toolbar or hide
    it.
  */
  isHorizontalToolbarActivedidChange: function () {
    var isActive = this.get('isHorizontalToolbarActive');
    if (!SC.none(isActive)) {
      if (isActive) {
        this.showView();
      }
      else {
        this.hideView();
      }
    }
  }.observes('isHorizontalToolbarActive'),
  
  /**
    Hide this view
  */
  hideView: function () {
    this.hideTimer = undefined;
    this.set('classNames', ['sc-view', 'mvo-front-view-invisible']);
    this.updateLayer();
    Multivio.getPath('views.mainContentView.content.innerMainContent').
        becomeFirstResponder();
  },
  
  /**
    Show this view
  */
  showView: function () {
    this.set('classNames', ['sc-view', 'mvo-front-view']);
    this.updateLayer();
  }

});