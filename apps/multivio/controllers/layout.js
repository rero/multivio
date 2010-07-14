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
  
  /**
    Boolean that say if the worspace has been initialized.
  */
  isBasicLayoutUp: NO,
  
  /**
    The type of the document to show
  */
  localType: undefined,
  
  /**
    The number of views that need to be added to the main page
  */
  nbOfComponentToAdd: 0,
  
  /**
    The list of controllers with their view
  */
  viewByController: {},
  
  /**
    Position on the GridLayout
  */
  layoutPositionByName: {
    top:           {x: 0, y: 0, xlen: 3, ylen: 1},
    left:          {x: 0, y: 1, xlen: 1, ylen: 1},
    center:        {x: 1, y: 1, xlen: 1, ylen: 1},
    right:         {x: 2, y: 1, xlen: 1, ylen: 1},
    leftAndCenter: {x: 0, y: 1, xlen: 2, ylen: 1},
    bottom:        {x: 0, y: 2, xlen: 3, ylen: 1}
  },
  
  /**
    Translate mimetype received from the server to a local type
    used by the config layout file
  */
  typeForMimeType: {
    'text/xml': 'xml',
    'text/xml;charset=utf-8': 'xml',
    'application/xml': 'xml',
    'application/pdf': 'pdf',
    'image/jpg': 'image',
    'image/jpeg': 'image'
  },

  /**
    Initialize this controller by showing the waiting page
  */
  initialize: function () {
    // Attach the main page to the browser window in order to initiate the
    // interface of the application
    Multivio.getPath('mainPage.mainPane').append();
    this._showWaitingPage();
  },
  
  /**
    For a mimetype retreives the local type, the list of controller needed
    and the number of views
  
    @param {String} type
    @return {Array} list of controllers
  */
  getListOfController: function (type) {
    // set localType using the matching table
    this.localType = this.get('typeForMimeType')[type];
    
    // TO REMOVE
    if (this.localType === 'image') {
      console.info('LCT image');
      Multivio.masterController.isGrouped = YES;
    } 

    // retreive the configuration for layout
    var config = Multivio.configurator.get('layoutConfig')[this.localType];
    var components = config.components;

    var listOfController = [];
    // for each view get the controller(s) and create a hash that contains
    // for each controller the view associated
    for (var i = 0; i < components.length; i++) {
      var oneView = components[i].name;
      var contr = Multivio.views.get(oneView).controllers;
      for (var j = 0; j < contr.length; j++) {
        var oneController = contr[j];
        this.viewByController[oneController] = components[i];
        listOfController.push(oneController);
      }
    }
    this.set('nbOfComponentToAdd', listOfController.length);
    return listOfController;
  },
  
  /**
    currentListOfWidget has changed, verify if all controller have create the
    view and if YES select the first element to show it.
  
    @observes nbOfComponentToAdd
  */
  nbOfComponentDidChange: function () {
    if (this.get('nbOfComponentToAdd') === 0) {
      // var currentType = Multivio.masterController.get('currentType');
      switch (this.get('localType')) {

      case 'pdf':
      case 'image':
        Multivio.masterController.selectFirstPosition();
        break;

      case 'xml':
        Multivio.masterController.selectFirstFile();
        break;

      default:
        Multivio.logger.info(this.get('localType') + ' is an undefined type ');
        break;
      }
    }
  }.observes('nbOfComponentToAdd'),
  
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
  
  /**
    Set the basic Layout. Remove the waiting panel and add the header view
  */
  setBasicLayout: function () {
    this._hideWaitingPage();
    this.configureWorkspace('init');
    this.set('isBasicLayoutUp', YES);   
  },
  
  /**
    Removed a view 
  
    @param {String} component the name of the component
  */
  removeComponent: function (component) {
    var mainPage = Multivio.getPath('mainPage.mainPane');
    mainPage.removeComponent(component); 
  },
  
  /**
    Add a new component to the main page
  
    @param {String} controller the name of the controller 
  */
  addComponent: function (controller) {
    // Get component for this controller
    var component = this.viewByController[controller];
    
    var componentName = 'views.' + component.name;
    var componentPosition = component.position;
    
    // get the grid position for the component
    var gridPosition = this.layoutPositionByName[componentPosition];
    
    var mainPage = Multivio.getPath('mainPage.mainPane');
    // Verify if the view already exist if not add the component
    if (SC.none(mainPage._componentsOnGrid[componentName])) {
      mainPage.layOutComponent({
        name: componentName,
        x: gridPosition.x,
        y: gridPosition.y,
        xlen: gridPosition.xlen,
        ylen: gridPosition.ylen
      });
    }
    this.set('nbOfComponentToAdd', this.get('nbOfComponentToAdd') - 1);
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
