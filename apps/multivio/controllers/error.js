/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @class

  Controller for errors that occured on the server side.

  @author che
  @extends SC.ObjectController
  @since 0.1.0
*/

Multivio.errorController = SC.ObjectController.create(
/** @scope Multivio.errorController.prototype */ {
  
  /**
    Initialize the content of the controller

    @param {Object} message to show
  */
  initialize: function (message) {
    this.set('content', message);
    Multivio.logger.info('errorController initialized');
  },

  /**
    Return the message that explains the error
    
    @property {String} ths message
  */
  message: function () {
    // retrieve err_name and err_description from the content
    var errorContent = this.get('content'),
        errorName,
        errorDescription;

    if (!SC.none(errorContent)) {
      errorName = errorContent.err_name;
      errorDescription = errorContent.err_description;
    }
    else {
      errorName = 'Unknown Error';
      errorDescription = 'Error description.......';
    }

    var errorMessage = ('_' + errorName).loc();
    // if it's an unknown error get the default message
    if (errorMessage[0] === '_') {
      var support = Multivio.configurator.get('support');
      if (SC.none(support)) {
        // support variable not configured, fall back to a hard-coded default
        support = 'info@multivio.org';
      }
      var navigatorInfo = '';
      for (var p in navigator) {
        if (navigator.hasOwnProperty(p)) {
          if (SC.typeOf(navigator[p]) === SC.T_STRING) {
            navigatorInfo += '%@: %@\n'.fmt(p, navigator[p]);
          }
        }
      }
      var emailUrl = '<a href=\'mailto:%@?subject=%@&body=%@\'>%@</a>'.fmt(
          support,
          '_EmailErrorMessageSubject'.loc() + ' - ' + escape(errorDescription),
          '_EmailErrorMessageHeader'.loc() +
          '%0A%0A%0A%0A%0A' +
          '%0A-------------------------------------%0A' +
          '_EmailErrorMessageTechnicalInfo'.loc() + '%0A%0A' +
          escape(errorDescription) + '%0A%0A' +
          Date() + '%0A' +
          escape(document.baseURI) + '%0A%0A' +
          'appCodeName   : ' + navigator.appCodeName + '%0A' +
          'appName       : ' + navigator.appName + '%0A' +
          'appVersion    : ' + navigator.appVersion + '%0A' +
          'buildID       : ' + navigator.buildID + '%0A' +
          'cookieEnabled : ' + navigator.cookieEnabled + '%0A' +
          'language      : ' + navigator.language + '%0A' +
          'oscpu         : ' + navigator.oscpu + '%0A' +
          'platform      : ' + navigator.platform + '%0A' +
          'product       : ' + navigator.product + '%0A' +
          'productSub    : ' + navigator.productSub + '%0A' +
          'securityPolicy: ' + navigator.securityPolicy + '%0A' +
          'userAgent     : ' + navigator.userAgent + '%0A' +
          'vendor        : ' + navigator.vendor + '%0A' +
          'vendorSub     : ' + navigator.vendorSub +
          '%0A-------------------------------------%0A',
          support);
      errorMessage = '_Default'.loc(emailUrl);
    }

    if (!SC.none(errorDescription)) {
      errorMessage = errorMessage + '<br><br>' + errorDescription.loc();
    }

    return this.get('errorText').fmt(errorMessage);
  }.property('content'),

  /**
    The error wrapper message
  */
  errorText: '' +
    '<img src="%@" class="sc-icon-error-48">'.fmt(SC.BLANK_IMAGE_URL) +
    '<div class="mvo_info_full_title">' +
    '<h3>' + '_An error occurred'.loc() + '</h3>' +
    '</div>' +
    '<div class="mvo_info_full_message">' +
      '%@ <br/><br/>' +
      '<div id="sc-error-dialog-reload-button" onclick="window.location.reload();"' + 
        'style="' + 
          'text-align: center; ' +
          'border: 1px solid black; ' +
          'padding: 3px; ' +
          'clear: both; ' +
          'margin-top: 20px; ' +
          'width: 100px; ' +
          'cursor: pointer;' +
          'background-color: #888;' +
          'color: #fff;' +
        '">' +
      '_Go back'.loc() +
      '</div>' +
    '</div>',

  /**
    The text that explains how to call the application
  */
  usageText: '' +
    '<img src="%@" class="sc-icon-info-48">'.fmt(SC.BLANK_IMAGE_URL) +
    '<div class="mvo_info_full_title">' +
    '<h3>' + '_How to launch Multivio'.loc() + '</h3>' +
    '</div>' +
    '<div class="mvo_info_full_message">' +
    '_The calling syntax is'.loc() + ':' +
    '<ul><li>http://demo.multivio.org/client/#get&url={TARGET}</li></ul>' +
    '_The {TARGET} URL can link to'.loc() + ':' +
    '<ul>' +
    '  <li>%@</li>'.fmt('_A Dublin Core record'.loc()) +
    '  <li>%@</li>'.fmt('_A MARC21 record'.loc()) +
    '  <li>%@</li>'.fmt('_A MODS record'.loc()) +
    '  <li>%@</li>'.fmt('_A METS record (supported profiles only)'.loc()) +
    '</ul>' +
    '_Examples'.loc() + ':' +
    '<ul>' +
    '  <li>http://demo.multivio.org/client/#get&url=http://doc.rero.ch/record/9495/export/xd</li>' +
    '  <li>http://demo.multivio.org/client/#get&url=http://era.ethz.ch/oai?verb=GetRecord&metadataPrefix=mets&identifier=oai:era.ethz.ch:34314</li>' +
    '</ul>' +
    '</div>'

});
