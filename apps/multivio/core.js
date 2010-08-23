/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
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
  VERSION: '0.2.1',

  // This is your application store.  You will use this store to access all
  // of your model data.  You can also set a data source on this store to
  // connect to a backend server.  The default setup below connects the store
  // to any fixtures you define.

  store: SC.Store.create()

  // TODO: Add global constants or singleton objects needed by your app here.

});

/**
  Binding template for transforming the return value of the binding into a
  single object if it is an array (returns the first object in the array)

  @see <a href="http://docs.sproutcore.com/symbols/SC.html">Adding Custom
  Transforms</a> in SC.Binding
  @see SC.Binding
 */
SC.Binding.reduceFromArray = function () {
  return this.transform(function (value, binding) {
    var result = value;
    if (value && value.isEnumerable) {
      result = value.firstObject();
    }
    return result;
  });
};
