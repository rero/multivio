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
SC.stringsFor('French', {
  
  // ToolTips
  '_Metadata': 'Afficher ou masquer les métadonnées',
  '_Thumbnails': 'Afficher ou masquer les miniatures',
  '_Tree': 'Afficher ou masquer la structure du document',
  '_Search': 'Rechercher dans le document',
  '_ShowToolbar': 'Bloquer ou débloquer l\'affichage permanente de la barre d\'outils',
  '_RotateLeft': 'Pivoter à gauche',
  '_RotateRight': 'Pivoter à droite',
  '_FirstPage': 'Aller à la première page ou au fichier précédent',
  '_PreviousPage': 'Aller à la page précédente (touches: Majuscule + Page précédente)',
  '_NextPage': 'Aller à la page suivante (touches: Majuscule + Page suivante)',
  '_LastPage': 'Aller à la dernière page ou au fichier suivant',
  '_Zoom+': 'Augmenter (+)',
  '_Zoom-': 'Diminuer (-)',
  '_FullSize': 'Afficher tout le contenu',
  '_FullWidth': 'Ajuster à la largeur',
  '_NativeSize': 'Afficher à la taille native',
  '_Change theme to white': 'Choisir le thème blanc',
  '_Change theme to dark gray': 'Choisir le thème gris foncé',
  '_Change theme to blue': 'Choisir le thème bleu',
  '_Click to go to Multivio website.': 'Cliquez pour aller sur le site Multivio.',
  '_Current client version:': 'Version actuelle du client:',
  '_Current server version:': 'Version actuelle du serveur:',

  // Strings for metadata
  '_creator': 'auteur',
  '_mime': 'type de fichier',
  '_language': 'langue',
  '_nPages': 'nombre de pages',
  '_title': 'titre',

  // Strings for "application usage" text
  '_How to launch Multivio': 'Comment lancer Multivio',
  '_The calling syntax is': 'La syntaxe d\'appel est la suivante',
  '_The {TARGET} URL can link to': 'L\'URL cible peut pointer sur',
  '_A Dublin Core record': 'Une notice au format Dublin Core',
  '_A MARC21 record': 'Une notice au format MARC21',
  '_A MODS record': 'Une notice au format MODS',
  '_A METS record (supported profiles only)': 'Une notice au format METS (uniquement les profils supportés)',
  '_Examples': 'Exemples',

  // Error messages
  '_An error occurred':               'Une erreur s\'est produite',

  '_PermissionDenied':                'Vous n\'avez pas l\'autorisation pour accéder à ce document.',
  '_UnableToRetrieveRemoteDocument':  'Le document demandé n\'existe pas ou n\'est pas disponible.',
  '_UnsupportedFormat':               'Le format du document demandé n\'est actuellement pas supporté.',
  '_InvalidArgument':                 'Arguments incorrects.',
  '_HttpMethodNotAllowed':            'La méthode HTTP en question n\'est pas supportée par ce serveur.',
  '_VersionIncompatibility':          'Les versions du serveur et du client ne sont pas compatibles.',
  '_ServerNotFound':                  'Le serveur Multivio n\'est pas disponible.',
  '_Default':                         'Une erreur s\'est produite. Veuillez contacter l\'adresse de support %@',
  
  // Warning messages
  '_Loading the requested resolution may take a long time':
      'Le chargement du contenu dans la résolution demandée peut prendre longtemps',
  '_Would you like to proceed?':
      'Aimeriez-vous continuer?',
  '_Proceed': 'Accepter',
  '_Use lower resolution': 'Utiliser une résolution plus basse',
  '_Incorrect page number': 'Numéro de page incorrect',
  '_Please enter a number between 1 and %@': 'Veuillez introduire un nombre entre 1 et %@',
  '_Yes': 'Oui',
  '_Ok': 'Ok',
  '_No': 'Non',

  // Strings for search and indexing functionality (MVO_SEIN)
  '_doSearch': 'Rechercher',
  '_goToNext': 'Occurrence suivante',
  '_goToPrevious': 'Occurrence précédente',
  '_searchIn': 'Rechercher dans le fichier: ',
  '_doClear' : 'Réinitialiser',
  '_noSearchResultTitle': 'Texte introuvable',
  '_noSearchResultDesc': 'Le texte recherché n\'a pas été retrouvé',
  '_typeQueryHere': 'Introduire ici l\'expression à rechercher',
  '_tooManyResults': 'La limite de résultats de recherche a été atteinte',
  '_firstOccurrences': 'Seules les %@ premières occurrences sont affichées.',
  '_noResult': 'Texte introuvable',
  '_searchInProgress': 'Recherche est en cours...',
  '_resultSelection': 'Occurrence %@ sur %@',

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
  '_helpIntro': "Multivio permet de visualiser des contenus numériques, que ce soit\
    sous forme de texte (comme les livres, des articles) ou des images comme\
    des photos, des gravures. Vous pouvez en savoir plus sur\
    Multivio en consultant la page: <a href='http://www.multivio.org'>\
    www.multivio.org</a> ou par email à : <a href='mailto:info@multivio.org'>\
    info@multivio.org</a>.<br/>\
    Une aide contextuelle vous décrit l'utilité de chaque bouton lorsque vous\
    les survolez. Dans l'interface, deux ensemble d'icônes vous permettent de\
    naviguer dans le document : une barre d'outils latérale et une barre de navigation.",
  '_helpVerticalBar': "Barre d'outils latérale",
  '_helpToc': "affiche le plan du document et permet la navigation.",
  '_helpThum': "affiche les imagettes des pages du document.",
  '_helpSearch': "lance une recherche dans le document courant. Les résultats\
    apparaissent de façon contextualisés et sont surlignés dans le texte.",
  '_helpMetadata': "affiche les métadonnées du document courant : auteur, titre, etc.",
  '_helpDisplayBar': "affiche la barre de navigation de façon permanente.",
  '_helpNavigationBar': "Barre de navigation",
  '_helpNavigationBarDesc': "Cette barre apparaît lorsque vous déplacez la\
    souris en bas de la vue centrale.",
  '_helpRotation': "pivote de 90 degrés la page courante dans le sens indiqué.",
  '_helpNavigation': "permet la navigation dans le document : page suivante, page\
    précédente, début et fin du document. Vous pouvez aussi spécifier le numéro\
    de la page que vous souhaitez afficher en le mentionnant dans la partie\
    centrale.",
  '_helpZoom': "agrandit ou diminue la taille du contenu du document (zoom).",
  '_helpSize': "ajuste de la taille du document: adapte la taille du document\
    à la fenêtre de votre navigateur, affiche le document dans la totalité de\
    la largeur de votre fenêtre ou affiche la page dans sa taille d'origine.",
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
          <td>+/-</th>\
          <td>agrandi/réduit la taille de la page courante</th>\
        </tr>\
        <tr>\
          <td>molette de la souris</td>\
          <td>fait défiler la page courante</td>\
        </tr>\
        <tr>\
          <td>flèches haut/bas</td>\
          <td>réalise la même action que la molette de la souris</td>\
        </tr>\
        <tr>\
          <td>Page Préc./Suiv.</td>\
          <td>fait défiler la page d'un écran vers le haut/vers le bas</td>\
        </tr>\
        <tr>\
          <td>Marj+Page Préc./Suiv.</td>\
          <td>permet d'aller au début de la page suivante/précédente</td>\
        </tr>\
      <tbody/>\
    </table>",

});
