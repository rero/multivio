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
  '_resultSelection': 'Result %@/%@',
  '_helpTitle': "Aide",
	'_helpIntro': "Multivio permet d'accéder au contenu numérique, que ce soit\
		sous forme de texte (comme les livres, articles et revues) ou d'autres\
		types de médias, y compris audio et vidéo. Vous pouvez en savoir plus sur\
		Multivio en consultant la page suivante : <a href='http://www.multivio.org'>\
		www.multivio.org</a> Pour de plus amples renseignements, n'hésitez pas\
		à vous adresser à : <a href='mailto:info@multivio.org'>info@multivio.org</a>.<br/>\
		Une aide contextuelle vous explique la portée de chaque bouton lorsque vous\
		les survolez.  Dans l'interface, deux ensemble d'icônes vous permettent de\
		naviguer et de vous repérer dans le document : une barre latérale et une\
		barre de navigation.",
	'_helpVerticalBar': "La navigation latérale",
	'_helpToc': "Affiche le plan du document et permet de naviguer.",
	'_helpThum': "Affiche les vignettes des pages du document.",
	'_helpSearch': "Lance une recherche dans le document courant. Les résultats\
		apparaissent de façon contextualisés et les termes de la recherche sont\
		surlignés dans le texte.",
	'_helpMetadata': "Affiche les métadonnées du document courant : auteur, titre, etc.",
	'_helpDisplayBar': "Affiche la barre de navigation de façon permanente.",
	'_helpNavigationBar': "La barre de navigation",
	'_helpNavigationBarDesc': "Cette barre apparaît lorsque vous glissez la\
		souris en bas d'une page ou d'un document.",
	'_helpRotation': "Pivote de 90 degrés la page courante dans le sens souhaité.",
	'_helpNavigation': "Navigation dans le document : page suivante, page\
		précédente, début et fin du document. Vous pouvez aussi spécifier le numéro\
		de la page que vous souhaitez afficher en le mentionnant dans la partie\
		centrale.",
	'_helpZoom': "Agrandit ou diminue la taille du contenu du document (fonction de zoom).",
	'_helpSize': "Ajustement de la taille du document: adapte la taille du\
		document à la fenêtre active de votre navigateur, affiche le document dans\
		la totalité de la largeur de votre fenêtre active du navigateur, affiche le\
		document dans sa taille d'origine.",
	'_keyShortcutsTitle': "Raccourcis",
	'_keyShortcuts': "<table>\
		  <thead>\
		    <tr>\
		      <th>ACTION</th>\
		      <th>RACCOURCI</th>\
		    </tr>\
		  </thead>\
		  <tbody>\
		    <tr>\
		      <td>+ et -</th>\
		      <td>Zoom ou dé-zoom sur la page</th>\
		    </tr>\
		    <tr>\
		      <td>Défiler</td>\
		      <td>La molette de la souris permet de passer d'une page à une autre</td>\
		    </tr>\
		    <tr>\
		      <td>Flèches haut/bas</td>\
		      <td>Réalise la même action que le défilement</td>\
		    </tr>\
		    <tr>\
		      <td>Page Préc./Suiv.</td>\
		      <td>Fait défiler d'une page-écran vers le haut et vers le bas</td>\
		    </tr>\
		    <tr>\
		      <td>Marj+Page Préc./Suiv.</td>\
		      <td>Permet d'aller au début de la page suivante ou précédente</td>\
		    </tr>\
		  <tbody/>\
		</table>",

});
