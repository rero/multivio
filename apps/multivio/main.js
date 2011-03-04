/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/
/*globals Multivio*/
// This is the function that will start your app running.  The default
// implementation will load any fixtures you have created then instantiate
// your controllers and awake the elements on your page.
//
// As you develop your application you will probably want to override this.
// See comments for some pointers on what to do next.
//

Multivio.main = function main() {

  SC.ExceptionHandler.handleException = function (exception) {
    Multivio.errorController.initialize({
        'err_name':         'General Error',
        'err_description':  exception.toString()
      });
    Multivio.makeFirstResponder(Multivio.ERROR);
  };
  
  Multivio.getPath('mainPage.mainPane').append();

  // Multivio.initializer#readInputParameters() is declared as the callback
  // function that parses the parameters given in the applications's URL; this
  // is done using the SC.routes mechanism.
  SC.routes.add('*', Multivio.initializer, 'readInputParameters');
  //SC.routes.add(':', Multivio.initializer, 'readInputParameters');

};

function main() {
  Multivio.main();
}
