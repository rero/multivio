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
    var errorContent = this.get('content');
    var errorName = errorContent.err_name;
    var errorMessage = ('_' + errorName).loc();
    // if it's an unknown error get the default message
    if (errorMessage[0] === '_') {
      var support = Multivio.configurator.get('support');
      if (SC.none(support)) {
        // support variable not configured, fall back to a hard-coded default
        support = 'info@multivio.org';
      }
      errorMessage = '_Default'.loc(support);
    }
    var errorDescription = errorContent.err_description;
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
    '<div class="mvo_info_full_message">%@</div>',

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