/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** @class

  This class handles the positioning of the interface components on the screen.

  @author {mmo}
  @extends {SC.Object}
  @since {0.1.0}
  @see Multivio.mainPage
*/

Multivio.layoutController = SC.Object.create(
/** @scope Multivio.layoutController.prototype */ {

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
  }

});
