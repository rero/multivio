/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

/**
  Redefine the general SC exception handler to just use the console while the
  application is being set up. This prevents SC-related errors to break the
  application at that phase.
  
  Later on, when Multivio.main() is run, the exception handler is properly and
  permanently redefined.
*/
SC.ExceptionHandler.handleException = function (exception) {
  console.error(exception);
};

/** 
  @namespace

  Multivio is a web application for digital documents.
  
  @extends SC.Application
*/
Multivio = SC.Application.create(
  /** @scope Multivio.prototype */ {

  NAMESPACE: 'Multivio',
  VERSION: '1.0.0',

  // This is your application store.  You will use this store to access all
  // of your model data.  You can also set a data source on this store to
  // connect to a backend server.  The default setup below connects the store
  // to any fixtures you define.

  store: SC.Store.create()

  // TODO: Add global constants or singleton objects needed by your app here.

});

