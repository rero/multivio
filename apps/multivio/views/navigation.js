/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
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
    Show a waiting image
  */
  showWaiting: function () {
    var trans = Multivio.getPath(
        'views.navigationInfo.transparentView');
    var waitingIm = Multivio.getPath(
          'views.waitingImg');
    this.appendChild(trans);
    this.appendChild(waitingIm);
  },
  
  /**
    Show this view
    
    @param {String} file the current file
    @param {String} the current position / the nomber of pages
  */
  showView: function (file, page) {
    this.removeAllChildren();
    var trans = Multivio.getPath(
        'views.navigationInfo.transparentView');
    this.appendChild(trans);
    
    var pageLabel = Multivio.getPath(
        'views.navigationInfo.transparentView.currentPage');
    pageLabel.set('value', '_Page'.loc() + ' : ' + page);
    
    // if only one file => no file Label & replace page number in the center
    if (!SC.none(file)) {    
      var fileLabel = Multivio.getPath(
          'views.navigationInfo.transparentView.currentFile');
      fileLabel.set('value', '_File'.loc() + ' : ' + file);
      this.appendChild(fileLabel);
    }
    else {
      pageLabel.set('layout', {width: 220, height: 20, centerY: 0});
      pageLabel.set('textAlign', SC.ALIGN_CENTER);
    }
    
    this.appendChild(pageLabel); 
    
    SC.Timer.schedule({
      target: this, 
      action: 'hideView', 
      interval: 2000
    });
  }
  
});