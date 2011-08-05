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
SC.stringsFor('French', {
  
  // ToolTips
  '_Metadata': 'Afficher ou masquer les métadonnées',
  '_Thumbnails': 'Afficher ou masquer les miniatures',
  '_Tree': 'Afficher ou masquer la structure du document',
  '_Search': 'Rechercher dans le document',
  '_Help': 'Aide',
  '_ShowToolbar': 'Bloquer ou débloquer l\'affichage permanente de la barre d\'outils',
  '_Download': 'Télécharger le fichier courant',
  '_Overview': 'Afficher ou masquer la vue d\'ensemble',
  '_Pan': 'Activer ou désactiver le mode \'déplacement\'',
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
  '_ThumbnailListMode': 'Montrer les miniatures dans une liste',
  '_ThumbnailGridMode': 'Montrer les miniatures dans une grille',

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
  '_Go back':                         'Revenir',

  '_EmailErrorMessageSubject':        'Erreur Multivio',
  '_EmailErrorMessageHeader':         '[Insérez votre texte ci-dessous, ou envoyez simplement ce message en l\'état]',
  '_EmailErrorMessageTechnicalInfo':  'Information technique - NE PAS MODIFIER',

  // Warning messages
  '_Loading the requested resolution may take a long time':
      'Le chargement du contenu dans la résolution demandée peut prendre longtemps',
  '_Would you like to proceed?':
      'Aimeriez-vous continuer?',
  '_File download': 'Téléchargement du fichier',
  '_unknown size': 'taille non disponible',
  '_File': 'Fichier',
  '_Page': 'Page',
  '_Proceed': 'Poursuivre',
  '_Continue': 'Continuer',
  '_Use lower resolution': 'Utiliser une résolution plus basse',
  '_Incorrect page number': 'Numéro de page incorrect',
  '_Please enter a number between 1 and %@': 'Veuillez introduire un nombre entre 1 et %@',
  '_Yes': 'Oui',
  '_Ok': 'Ok',
  '_No': 'Non',
  '_Cancel': 'Annuler',
  
  // Information messages
  '_Fetching remote data...': 'Données distantes en cours de transfert...',

  // Strings for search and indexing functionality (MVO_SEIN)
  '_doSearch': 'Rechercher',
  '_goToNext': 'Occurrence suivante',
  '_goToPrevious': 'Occurrence précédente',
  '_searchIn': 'Sélectionner le fichier où rechercher',
  '_doClear' : 'Réinitialiser',
  '_noSearchResultTitle': 'Texte introuvable',
  '_noSearchResultDesc': 'Le texte recherché n\'a pas été retrouvé',
  '_typeQueryHere': 'Introduire ici l\'expression à rechercher',
  '_tooManyResults': 'La limite de résultats de recherche a été atteinte',
  '_firstOccurrences': 'Seules les %@ premières occurrences sont affichées.',
  '_noResult': 'Texte introuvable',
  '_searchInProgress': 'La recherche est en cours...',
  '_listOfResults': '%@%@ résultats trouvés',
  '_resultsPages': 'dans %@%@ pages',
  '_resultSelection': 'Occurrence %@ sur %@',
  '_AllFiles': 'Tous les fichiers',
  '_More': 'Plus...',
  '_NoTextualContent': 'Aucun contenu textuel',
  '_NotSearchable': "La fonction de recherche n'est apparemment \
      pas disponible pour ce fichier",

  // Strings for the help section
  '_helpTitle': "Aide",
  '_helpIntro': "Multivio permet de visualiser des contenus numériques, qu'il\
      s'agisse de documents (par ex. livres, articles) ou\
      d'images (par ex. photos, gravures). Pour en savoir plus sur Multivio,\
      consulter le site <a href='http://www.multivio.org'>www.multivio.org</a>\
      ou envoyer un courriel à\
      <a href='mailto:info@multivio.org'>info@multivio.org</a>.<br/>\
      Une aide contextuelle décrit l'utilité de chaque bouton lors du survol de\
      celui-ci par la souris. Dans l'interface, deux ensembles d'icônes\
      permettent de naviguer dans le document : une barre d'outils latérale et\
      une barre de navigation.",
  '_helpContentsTitle': "Sections de l'aide",
  '_helpVerticalBar': "Barre d'outils latérale",
  '_helpToc': "Affiche le plan du document et permet la navigation.",
  '_helpThum': "Affiche les miniatures des pages du document. Elles peuvent être\
      disposées soit dans une liste soit dans une grille, à l'aide des boutons\
      correspondants qui se trouvent au fond: ",
  '_helpSearch': "Permet de lancer des recherches dans le document. Les résultats\
      apparaissent de façon contextualisée et sont surlignés dans le texte.<br>\
      Il est possible de lancer des recherches booléennes avec l'opérateur ET\
      en séparant les mots à chercher par «&nbsp;AND&nbsp;», par exemple:<br>\
      <tt>&nbsp;histoire AND europe</tt><br>\
      Lors d'une recherche booléenne ET, Multivio retient les occurrences où\
      l'ensemble des mots recherchés se retrouvent à l'intérieur d'une même\
      page.<br>\
      Si le document actuel est composé de plusieurs fichiers, il est possible\
      de lancer la recherche sur l'un d'entre eux en particulier ou alors sur\
      l'ensemble.<br>\
      La recherche ne tient pas compte de la casse (rechercher \"europe\" ou\
      \"Europe\" est équivalent). Seules les 50 premières occurrences de\
      chaque fichier sont montrées. Si cette limite est dépassée, le nombre\
      signalé de résultats sera 50+, ce qui signifie «50 ou plus».<br>\
      NB: certains documents ne sont pas munis de contenu textuel;\
      c'est typiquement le cas de documents papier qui ont été numérisés\
      uniquement en mode image, sans reconnaissance automatique de\
      caractères; l'application émet un avertissement si c'est le cas.",
  '_helpDownload': "Télécharge le fichier courant.",
  '_helpDisplayBar': "Affiche la barre de navigation de façon permanente.",
  '_helpNavigationBar': "Barre de navigation",
  '_helpNavigationBarDesc': "Cette barre apparaît lorsque la souris se\
      déplace sur le bas du document.",
  '_helpLoupe': "Affiche en bas à gauche une miniature de la page ou de l'image\
      actuelle avec indication de la partie du contenu qui est actuellement\
      visible. Elle permet aussi de déplacer la zone visible avec la souris.\
      Cet outil n'est disponible que lorsque le contenu dépasse la taille\
      de la fenêtre du navigateur.",
  '_helpRotation': "Pivote de 90 degrés la page courante dans le sens indiqué.",
  '_helpNavigation': "Permet la navigation dans le document : page suivante,\
      page précédente, début et fin du document. Il est possible de saisir dans\
      la partie centrale le numéro de la page à afficher.",
  '_helpZoom': "Agrandit ou diminue la taille du contenu du document (zoom).",
  '_helpFullSize': "Adapte la taille du document à la fenêtre du navigateur.",
  '_helpFullWidth': "Affiche le document dans la totalité de la largeur de la\
      fenêtre.",
  '_helpNativeSize': "Affiche la page dans sa taille d'origine.",
  '_mouseActionsTitle': "Actions de la souris",
  '_mouseActions': "<table>\
      <thead>\
        <tr>\
          <th>ACTION</th>\
          <th>EFFET</th>\
        </tr>\
      </thead>\
      <tbody>\
        <tr>\
          <td>Molette de la souris</td>\
          <td>Fait défiler la page courante.</td>\
        </tr>\
        <tr>\
          <td>Pointeur de la souris</td>\
          <td>\
            L'action de cliquer et glisser sur le document crée une zone de\
            sélection de texte, qui peut être copiée dans le presse-papiers\
            avec la fonction \"copier\" standard du navigateur.<br>\
            NB: certains documents ne sont pas munis de contenu textuel (voir\
            aussi la note à propos de l'outil de recherche plus haut).\
          </td>\
        </tr>\
      <tbody/>\
    </table>",
  '_keyShortcutsTitle': "Raccourcis clavier",
  '_keyShortcuts': "<table>\
      <thead>\
        <tr>\
          <th>RACCOURCI</th>\
          <th>EFFET</th>\
        </tr>\
      </thead>\
      <tbody>\
        <tr>\
          <td>+/-</td>\
          <td>Agrandit/réduit la taille de la page courante.</td>\
        </tr>\
        <tr>\
          <td>Flèches haut/bas</td>\
          <td>Réalise la même action que la molette de la souris.</td>\
        </tr>\
        <tr>\
          <td>Page Préc./Suiv.</td>\
          <td>Fait défiler la page d'un écran vers le haut/vers le bas.</td>\
        </tr>\
        <tr>\
          <td>Maj+Page Préc./Suiv.</td>\
          <td>Permet d'aller au début de la page précédente/suivante.</td>\
        </tr>\
      <tbody/>\
    </table>"

});
