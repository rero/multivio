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
Multivio.NavigationView = SC.View.extend( 
/** @scope Multivio.NavigationView.prototype */ {
  
  /**
     Hide this view
   */
  hideView: function () {
    this.removeAllChildren();
    Multivio.getPath('views.mainContentView.content.innerMainContent').
        becomeFirstResponder();
  },

  /**
    Show this view
  */
  showView: function (file, page) {
    var trans = Multivio.getPath(
        'views.mainContentView.navigation.transparentView');
    var fileLabel = Multivio.getPath(
        'views.mainContentView.navigation.transparentView.currentFile');
    fileLabel.set('value', 'File : ' + file);
    var pageLabel = Multivio.getPath(
        'views.mainContentView.navigation.transparentView.currentPage');
    pageLabel.set('value', 'Page : ' + page);
      
    this.appendChild(trans);
    this.appendChild(fileLabel);
    this.appendChild(pageLabel);
    
    SC.Timer.schedule({
      target: this, 
      action: 'hideView', 
      interval: 2000
    });
  }
  
});