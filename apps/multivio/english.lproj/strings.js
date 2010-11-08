/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

// Place strings you want to localize here.  In your app, use the key and
// localize it using "key string".loc().  HINT: For your key names, use the
// english string with an underscore in front.  This way you can still see
// how your UI will look and you'll notice right away when something needs a
// localized string added to this file!
//
SC.stringsFor('English', {
  
  // ToolTips
  '_Metadata': 'Show metadata',
  '_Thumbnails': 'Show page thumbnails',
  '_Tree': 'Show the document structure',
  '_RotateLeft': 'Rotate left',
  '_RotateRight': 'Rotate right',
  '_FirstPage': 'Jump to the first page or to the previous file',
  '_PreviousPage': 'Go to the previous page',
  '_NextPage': 'Go to the next page',
  '_LastPage': 'Jump to the last page or to the next file',
  '_Zoom+': 'Zoom in',
  '_Zoom-': 'Zoom out',
  '_Change theme to white': 'Change theme to white',
  '_Change theme to dark gray': 'Change theme to dark gray',
  '_Change theme to blue': 'Change theme to blue',

  // Strings for metadata
  '_creator': 'author',
  '_mime': 'document type',
  '_language': 'language',
  '_nPages': 'number of page',
  '_title': 'title',

  // Strings for "application usage" text
  '_How to launch Multivio': 'How to launch Multivio',
  '_The calling syntax is': 'The calling syntax is',
  '_The {TARGET} URL can link to': 'The {TARGET} URL can link to',
  '_A Dublin Core record': 'A Dublin Core record',
  '_A MARC21 record': 'A MARC21 record',
  '_A MODS record': 'A MODS record',
  '_A METS record (supported profiles only)': 'A METS record (supported profiles only)',
  '_Examples': 'Examples',

  // Error messages
  '_An error occurred':               'An error occurred',

  '_PermissionDenied':                'You are not allowed to see this document.',
  '_UnableToRetrieveRemoteDocument':  'The requested document does not exist or is not accessible.',
  '_UnsupportedFormat':               'The format of the requested document is currently not supported.',
  '_InvalidArgument':                 'Incorrect arguments.',
  '_HttpMethodNotAllowed':            'The HTTP method is not supported by this server.',
  '_VersionIncompatibility':          'The server and the client are not compatible.',
  '_ServerNotFound':                  'The Multivio server is not accessible.',
  '_Default':                         'An error occured. Please contact support at %@',
  
  // Warning messages
  '_Loading the requested resolution may take a long time':
      'Loading the requested resolution may take a long time',
  '_Would you like to proceed?':
      'Would you like to proceed?',
  '_Proceed': 'Proceed',
  '_Use lower resolution': 'Use lower resolution',
  '_Incorrect page number': 'Incorrect page number',
  '_Please enter a number between 1 and %@': 'Please enter a number between 1 and %@',
  '_Yes': 'Yes',
  '_Ok': 'Ok',
  '_No': 'No',

  // Strings for search and indexing functionality (MVO_SEIN)
  '_doSearch': 'Search',
  '_goToNext': 'Next',
  '_goToPrevious': 'Previous',
  '_searchIn': 'Search in file: ',
  '_doClear' : 'Clear'

});
