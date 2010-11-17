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
  '_Metadata': 'Show or hide the metadata',
  '_Thumbnails': 'Show or hide page thumbnails',
  '_Tree': 'Show or hide the document structure',
  '_Search': 'Search in the document',
  '_ShowToolbar': 'Show the toolbar permanently or only by hovering with the mouse pointer',
  '_RotateLeft': 'Rotate left',
  '_RotateRight': 'Rotate right',
  '_FirstPage': 'Jump to the first page or to the previous file',
  '_PreviousPage': 'Go to the previous page (Shift+PgUp)',
  '_NextPage': 'Go to the next page (Shift+PgDown)',
  '_LastPage': 'Jump to the last page or to the next file',
  '_Zoom+': 'Zoom in (+)',
  '_Zoom-': 'Zoom out (-)',
  '_FullSize': 'Zoom to full size',
  '_FullWidth': 'Zoom to full width',
  '_NativeSize': 'Zoom to native size',
  '_Change theme to white': 'Change theme to white',
  '_Change theme to dark gray': 'Change theme to dark gray',
  '_Change theme to blue': 'Change theme to blue',
  '_Click to go to Multivio website.': 'Click to go to Multivio website.',
  '_Current client version:': 'Current client version:',
  '_Current server version:': 'Current server version:',

  // Strings for metadata
  '_creator': 'author',
  '_mime': 'file type',
  '_language': 'language',
  '_nPages': 'number of pages',
  '_title': 'title',

  // Strings for "application usage" text
  '_How to launch Multivio': 'How to launch Multivio',
  '_The calling syntax is': 'The calling syntax is',
  '_The {TARGET} URL can link to': 'The {TARGET} URL can link to',
  '_A Dublin Core record': 'A record in Dublin Core format',
  '_A MARC21 record': 'A record in MARC21 format',
  '_A MODS record': 'A record in MODS format',
  '_A METS record (supported profiles only)': 'A METS record (supported profiles only)',
  '_Examples': 'Examples',

  // Error messages
  '_An error occurred':               'An error occurred',

  '_PermissionDenied':                'You are not allowed to see this document.',
  '_UnableToRetrieveRemoteDocument':  'The requested document does not exist or is not accessible.',
  '_UnsupportedFormat':               'The format of the requested document is currently not supported.',
  '_InvalidArgument':                 'Incorrect arguments.',
  '_HttpMethodNotAllowed':            'The HTTP method is not supported by this server.',
  '_VersionIncompatibility':          'The server and the client versions are not compatible.',
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
  '_goToNext': 'Next occurence',
  '_goToPrevious': 'Previous occurence',
  '_searchIn': 'Search in file: ',
  '_doClear' : 'Clear',
  '_noSearchResultTitle': 'No results found',
  '_noSearchResultDesc': 'No result was found for the given query',
  '_typeQueryHere': 'Type search query here',
  '_tooManyResults': 'Search result limit reached',
  '_firstOccurrences': 'Only the first %@ occurences are displayed.',
  '_noResult': 'No result was found',
  '_searchInProgress': 'Searching...',
  '_resultSelection': 'Result %@/%@'

});
