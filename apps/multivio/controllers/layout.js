/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
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
    The graphical theme that is currently selected
  */
  currentTheme: 'mvo-dark-gray-theme',
  
  /**
    Show the possibility of changing themes
  */
  showThemeSelector: YES,

  // TODO: move this function to the initializer, the layout controller has
  // nothing to do with controller setup
  /**
    For a mimetype retrieves the local type, the list of controllers needed
    and the number of views
  
    @param {String} type
    @return {Array} list of controllers
  */
  getListOfControllers: function (type) {
    // set localType using the matching table
    this.localType = Multivio.configurator.getTypeForMimeType(type);
    // TODO: remove
    if (this.localType === 'image') {
      Multivio.masterController.isGrouped = YES;
    } 

    // retrieve the configuration for layout
    var config = Multivio.configurator.get('layoutConfig')[this.localType];
    var components = config.components;

    var listOfControllers = [];
    // for each view get the controller(s) and create a hash that contains
    // for each controller the view associated
    for (var i = 0; i < components.length; i++) {
      var oneView = components[i].name;
      var v = Multivio.getPath(oneView);
      var contr = v.controllers;
      for (var j = 0; j < contr.length; j++) {
        var oneController = contr[j];
        this.viewByController[oneController] = components[i];
        listOfControllers.push(oneController);
      }
    }
    this.set('nbOfComponentToAdd', listOfControllers.length);
    return listOfControllers;
  },
  
  // TODO: when getListOfControllers() moves to the initializer this
  // function should probably go along as well
  /**
    currentListOfWidget has changed, verify if all controller have create the
    view and if YES select the first element to show it.
  
    @observes nbOfComponentToAdd
  */
  nbOfComponentDidChange: function () {
    if (this.get('nbOfComponentToAdd') === 0) {
      Multivio.makeFirstResponder(Multivio.READY);
      switch (this.get('localType')) {

      case 'pdf':
      case 'image':
        Multivio.invokeLater(Multivio.sendAction, 1, 'firstPosition');
        break;

      case 'xml':
        Multivio.invokeLater(Multivio.sendAction, 1, 'firstFile');
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

    // apply the base layout to the main page's main pane
    var mainPane = Multivio.getPath('mainPage.mainPane');
    var baseLayoutName = Multivio.configurator.getPath(
        'componentLayouts.%@.baseLayout'.fmt(componentLayoutName));
    var baseLayoutConfig =
        Multivio.configurator.getPath('layouts.%@'.fmt(baseLayoutName));
    var layoutMixin = Multivio.getPath(baseLayoutConfig.layoutClass);
    if (SC.none(layoutMixin)) {
      var errMess = 'Unable to find layout mixin %@'.fmt(baseLayoutName);
      throw {message: errMess};
    }
    SC.mixin(mainPane, layoutMixin);
    mainPane.layOutGrid(baseLayoutConfig.layoutParams);

    // lay out the components
    var components = Multivio.configurator.getPath(
        'componentLayouts.%@.components'.fmt(componentLayoutName));
    for (var i = 0; i < components.length; i++) {
      var c = components[i];
      mainPane.layOutComponent(c);

      // append children to component, if required
      if (SC.typeOf(c.children) === SC.T_ARRAY) {
        this.addChildViewsToComponent(c.children, c.name);
      }
    }

    SC.RunLoop.end();
    Multivio.logger.info('layoutController workspace initialized');
  },


  /**
    Add independent, floating child views to the host view (in principle
    the main content view). This is done outside of the main grid layout;
    TODO: there might be a better place to put this
  */
  addChildViewsToComponent: function (floatingViews, hostView) {
    // get host view
    var hv = Multivio.getPath(hostView);
    
    if (SC.typeOf(hv) !== SC.T_OBJECT ||
        SC.typeOf(hv.appendChild) !== SC.T_FUNCTION) {
      throw new Error("hostView must respond to the appendChild() method");
    }

    if (SC.typeOf(floatingViews) !== SC.T_ARRAY) {
      throw new Error("floatingViews must be an array");
    }

    // append each floating view to the host view
    var len = floatingViews.length;
    for (var v = 0; v < len; v++) {
      if (SC.typeOf(floatingViews[v]) !== SC.T_STRING) {
        throw new Error("the elements of floatingViews must be strings");
      }
      var fv = Multivio.getPath(floatingViews[v]);
      if (SC.typeOf(fv) !== SC.T_OBJECT) {
        throw new Error("floatingView %@ must be an object".fmt(fv));
      }
      hv.appendChild(fv);
    }
  },

  
  /**
    Removed a view 
  
    @param {String} component the name of the component
  */
  removeComponent: function (component) {
    var mainPane = Multivio.getPath('mainPage.mainPane');
    mainPane.removeComponent(component); 
  },
  
  /**
    Add a new component to the main page
  
    @param {String} controller the name of the controller 
  */
  addComponent: function (controller) {
    // get component for this controller
    var component = this.viewByController[controller];
    var mainPane = Multivio.getPath('mainPage.mainPane');
    mainPane.layOutComponent(component);

    // append children to component, if required
    if (SC.typeOf(component.children) === SC.T_ARRAY) {
      this.addChildViewsToComponent(component.children, component.name);
    }

    this.set('nbOfComponentToAdd', this.get('nbOfComponentToAdd') - 1);
  },
  

  /**
    Change the graphical theme that is currently selected. The name of the
    theme to be applied must be a property called 'newTheme' of the object
    given as input. This object is usually a view that calls this method
    through a target/action binding. In that case the view must contain the
    newTheme property.

    @param {SC.Object} the object that called this method (usually an SC.View)
  */
  changeTheme: function (view) {
    var newTheme = view.get('newTheme');
    if (newTheme !== this.currentTheme) {
      // check that newTheme is in the list of allowed themes
      var allowedThemes = Multivio.configurator.get('allowedThemes');
      var found = NO;
      for (var t = 0; t < allowedThemes.length; t++) {
        if (newTheme === allowedThemes[t]) {
          found = YES;
          break;
        }
      }
      if (found === YES) {
        SC.$('body').addClass(newTheme).removeClass(this.currentTheme);
        this.currentTheme = newTheme;
      }
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
