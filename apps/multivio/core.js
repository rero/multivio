/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @namespace

  Multivio is a web application for digital documents.
  
  @extends SC.Application
*/
Multivio = SC.Application.create(
  /** @scope Multivio.prototype */ {

  NAMESPACE: 'Multivio',
  VERSION: '20110628',

  // This is your application store.  You will use this store to access all
  // of your model data.  You can also set a data source on this store to
  // connect to a backend server.  The default setup below connects the store
  // to any fixtures you define.

  store: SC.Store.create()

  // TODO: Add global constants or singleton objects needed by your app here.

});
