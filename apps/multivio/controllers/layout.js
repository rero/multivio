/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  This class handles the positioning of the interface components on the screen.

  @author mmo
  @extends SC.Object
  @since 0.1.0
  @see Multivio.mainPage
*/

Multivio.layoutController = SC.Object.create(
/** @scope Multivio.layoutController.prototype */ {

  initialize: function () {
    // Attach the main page to the browser window in order to initiate the
    // interface of the application
    Multivio.getPath('mainPage.mainPane').append();
    this._showWaitingPage();
  },
  
  /**
    Sets up the views in the workspace.

    This setup cannot be done in this object's init() function because when
    this object is created, the other views have not yet been initialized, so
    they cannot yet be referenced.

    This function must therefore be explicitly called from the main() function
    during application setup.
    
    @see Multivio.main
    @param {String} componentLayoutName
  */
  configureWorkspace: function (componentLayoutName) {
    SC.RunLoop.begin();

    // apply the base layout to the main page
    var mainPage = Multivio.getPath('mainPage.mainPane');
    var baseLayoutName = Multivio.configurator.getPath(
        'componentLayouts.%@.baseLayout'.fmt(componentLayoutName));
    var baseLayoutConfig =
        Multivio.configurator.getPath('layouts.%@'.fmt(baseLayoutName));
    var layoutMixin = Multivio.getPath(baseLayoutConfig.layoutClass);
    if (SC.none(layoutMixin)) {
      var errMess = 'Unable to find layout mixin %@'.fmt(baseLayoutName);
      throw {message: errMess};
    }
    SC.mixin(mainPage, layoutMixin);
    mainPage.layOutGrid(baseLayoutConfig.layoutParams);

    // lay out the components
    var components = Multivio.configurator.getPath(
        'componentLayouts.%@.components'.fmt(componentLayoutName));
    for (var i = 0; i < components.length; i++) {
      var c = components[i];
      mainPage.layOutComponent(c);
    }

    SC.RunLoop.end();
    Multivio.logger.info('layoutController workspace initialized');
  },
  
  setBasicLayout: function () {
    this._hideWaitingPage();
    this.configureWorkspace('init');   
  },
  
  removeComponent: function (component) {
    var mainPage = Multivio.getPath('mainPage.mainPane');
    mainPage.removeComponent(component); 
  },
  
  addComponent: function (component) {
    var mainPage = Multivio.getPath('mainPage.mainPane');
    switch (component) {
    case 'views.thumbnailView':
      mainPage.layOutComponent({
          name: 'views.thumbnailView', 
          x: 2, 
          y: 1, 
          xlen: 1, 
          ylen: 1
        });
      break;
        
    case 'views.treeView':
      mainPage.layOutComponent({
          name: 'views.treeView', 
          x: 0, 
          y: 1, 
          xlen: 1, 
          ylen: 1
        });
      break;
      
    case 'views.navigationView':
      mainPage.layOutComponent({
          name: 'views.navigationView',
          x: 1, 
          y: 2, 
          xlen: 2, 
          ylen: 1
        });
      break;
    default:
      console.info('unknown component ' + component);
      break;
    }
  },
  
  /**
    Show usage page

    @private  
  */
  _showUsagePage: function () {
    SC.RunLoop.begin();
    // Call the layout controller in order to setup the interface components
    try {
      this.configureWorkspace('usage');
    }
    catch (e) {
      Multivio.logger.logException(e, 'Error showing usage page');
    }
    finally {
      SC.RunLoop.end();
    }
  },
  
 /**
    Show error page

    @private  
  */
  _showErrorPage: function () {
    SC.RunLoop.begin();
    // Call the layout controller in order to setup the interface components
    try {
      this.configureWorkspace('error');
    }
    catch (e) {
      Multivio.logger.logException(e, 'Error from server show error page');
    }
    finally {
      SC.RunLoop.end();
    }
  },
  
  /**
    Show waiting page

    @private  
  */
  _showWaitingPage: function () {
    // show waiting pane
    SC.RunLoop.begin();
    Multivio.waitingPane.append();
    SC.RunLoop.end();
  },

  /**
    Hide waiting page

    @private  
  */
  _hideWaitingPage: function () {
    // remove waiting pane
    SC.RunLoop.begin();
    Multivio.waitingPane.remove();
    SC.RunLoop.end();
  }

});
