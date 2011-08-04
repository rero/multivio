/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
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
  '_Help': 'Help',
  '_ShowToolbar': 'Show the toolbar permanently or only by hovering with the mouse pointer',
  '_Download': 'Download the current file',
  '_Overview': 'Show or hide the overview',
  '_Pan': 'Activate or deactivate the \'pan\' mode',
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
  '_ThumbnailListMode': 'Show thumbnails in a list',
  '_ThumbnailGridMode': 'Show thumbnails in a grid',

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
  '_Go back':                         'Go back',

  '_EmailErrorMessageSubject':        'Multivio error',
  '_EmailErrorMessageHeader':         '[Insert your text below, or simply send this message as it is]',
  '_EmailErrorMessageTechnicalInfo':  'Technical information - DO NOT MODIFY',
  
  // Warning messages
  '_Loading the requested resolution may take a long time':
      'Loading the requested resolution may take a long time',
  '_Would you like to proceed?':
      'Would you like to proceed?',
  '_File download': 'File download',
  '_unknown size': 'unknown size',
  '_File': 'File',
  '_Page': 'Page',
  '_Proceed': 'Proceed',
  '_Continue': 'Continue',
  '_Use lower resolution': 'Use lower resolution',
  '_Incorrect page number': 'Incorrect page number',
  '_Please enter a number between 1 and %@': 'Please enter a number between 1 and %@',
  '_Yes': 'Yes',
  '_Ok': 'Ok',
  '_No': 'No',
  '_Cancel': 'Cancel',
  
  // Information messages
  '_Fetching remote data...': 'Fetching remote data...',

  // Strings for search and indexing functionality (MVO_SEIN)
  '_doSearch': 'Search',
  '_goToNext': 'Next occurence',
  '_goToPrevious': 'Previous occurence',
  '_searchIn': 'Select the file in which to search',
  '_doClear' : 'Clear',
  '_noSearchResultTitle': 'No results found',
  '_noSearchResultDesc': 'No result was found for the given query',
  '_typeQueryHere': 'Type search query here',
  '_tooManyResults': 'Search result limit reached',
  '_firstOccurrences': 'Only the first %@ occurences are displayed.',
  '_noResult': 'No result was found',
  '_searchInProgress': 'Searching...',
  '_listOfResults': '%@%@ results found',
  '_resultPages': 'in %@%@ pages',
  '_resultSelection': 'Result %@/%@',
  '_AllFiles': 'All files',
  '_More': 'More...',
  '_NoTextualContent': 'No textual content',
  '_NotSearchable': 'The file is apparently not searchable',

  // Strings for the help section
  '_helpTitle': "Help",
  '_helpIntro': "Multivio is able to display digital documents such as\
      books, articles and images. In order to know more about Multivio go to\
      the website <a href='http://www.multivio.org'>www.multivio.org</a>\
      or contact the team by email at\
      <a href='mailto:info@multivio.org'>info@multivio.org</a>.<br/>\
      A tooltip associated with each button provides a description of its\
      function. It can be accessed by hovering the mouse over the\
      corresponding button. The application contains two different groups of\
      buttons: one in the vertical sidebar on the left and the other in the\
      navigation toolbar at the bottom.",
  '_helpContentsTitle': "Help contents",
  '_helpVerticalBar': "Side toolbar",
  '_helpToc': "Displays the document structure and provides navigation capabilities.",
  '_helpThum': "Displays page thumbnails of the document. They can be disposed\
      in either a list or a grid, using the two corresponding buttons at the\
      bottom: ",
  '_helpSearch': "Allows searching inside the document. The results are shown\
      in their context and highlighted in the page.<br>\
      It is possible to perform a Boolean \"AND\" search by separating the\
      different search words by \"AND\", for instance:<br>\
      <tt>&nbsp;history AND europe</tt><br>\
      When performing a Boolean \"AND\" search, Multivio finds a combination\
      of the given words within the same page.\
      If the current document is composed of several files, it is possible to\
      select the file in which to perform the search, or to search in all\
      files at once.<br>\
      The search process is case-insensitive (searching for \"europe\" or \"Europe\"\
      produces the same result). Only the first 50 occurrences in each\
      file are shown. If this limit is exceeded, the reported number of results\
      is 50+, meaning \"50 or plus\".<br>\
      NB: certain documents do not contain textual content, which is\
      usually the case with paper documents scanned in image mode only,\
      with no character recognition process done afterwards; the application\
      shows a warning if that is the case.",
  '_helpDownload': "Downloads the current file.",
  '_helpDisplayBar': "Makes the navigation toolbar remain visible.",
  '_helpNavigationBar': "Navigation toolbar",
  '_helpNavigationBarDesc': "This toolbar is shown when the mouse pointer\
      goes over the lower part of the displayed document.",
  '_helpLoupe': "Shows or hides the overview miniature (bottom left) that\
      indicates which portion of the content is currently visible. It also\
      allows to move the visible portion around using the mouse. This tool\
      is available only when the content is too large to fit entirely in the\
      screen.",
  '_helpRotation': "Rotates the current page by 90 degrees anticlockwise\
      or clockwise.",
  '_helpNavigation': "Allows to navigate along the document: next and previous\
      page, beginning and end of document. It is also possible to access a\
      given page number by using the box located in the central part of the\
      toolbar.",
  '_helpZoom': "Zooms the displayed content in or out.",
  '_helpFullSize': "Adjusts the size of the document to the content window.",
  '_helpFullWidth': "Displays the document using the full window width.",
  '_helpNativeSize': "Displays the document using its native resolution.",
  '_mouseActionsTitle': "Mouse actions",
  '_mouseActions': "<table>\
      <thead>\
        <tr>\
          <th>ACTION</th>\
          <th>EFFECT</th>\
        </tr>\
      </thead>\
      <tbody>\
        <tr>\
          <td>Mouse wheel</td>\
          <td>Scrolls through the document.</td>\
        </tr>\
        <tr>\
          <td>Mouse pointer</td>\
          <td>\
            Clicking and dragging over the document creates an area of text\
            selection, which can be copied to the clipboard using the\
            browser\'s standard \"Copy\" command.<br>\
            NB: certain documents do not contain textual content (see note\
            about the search tool above).\
          </td>\
        </tr>\
      <tbody/>\
    </table>",
  '_keyShortcutsTitle': "Keyboard shortcuts",
  '_keyShortcuts': "<table>\
      <thead>\
        <tr>\
          <th>SHORTCUT</th>\
          <th>EFFECT</th>\
        </tr>\
      </thead>\
      <tbody>\
        <tr>\
          <td>+/-</td>\
          <td>Zooms in and out.</td>\
        </tr>\
        <tr>\
          <td>Up/down arrows</td>\
          <td>Produces the same effect as the mouse wheel.</td>\
        </tr>\
        <tr>\
          <td>Page Up/Down</td>\
          <td>Scrolls the displayed content up or down one screen at a time.</td>\
        </tr>\
        <tr>\
          <td>Shift + Page Up/Down</td>\
          <td>Jumps to the beginning of the previous/next page.</td>\
        </tr>\
      <tbody/>\
    </table>",

    // Miscellaneous
    '_and': "and",

});
