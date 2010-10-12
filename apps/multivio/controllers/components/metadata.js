/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  This controller manages the behavior of the header view. The header view
  contains only metadata about the global document

  @author che
  @extends SC.ObjectController
  @since 0.1.0
*/

Multivio.metadataController = SC.ObjectController.create(
/** @scope Multivio.metadataController.prototype */ {
  
  /**
    Initialize this controller by setting its content 

    @param {String} url the current file url
  */
  initialize: function (url) {
    var meta = Multivio.CDM.getFileMetadata(url);
    // normally meta is not egal to -1 because this controller is initialized
    // after the masterController received the metadata of the referer url
    if (!SC.none(meta) && meta !== -1) {
      this.set('content', meta);
    }
    Multivio.logger.info('metadataController initialized');    
  },
  
  /**
    Create a modal view that contain all metadata of the document
    
    @param {Object} button the button clicked
  */
  showMetadata: function (button) {
    var metadataView = Multivio.getPath('views.textFieldPicker');
    var textField = metadataView.get('contentView').get('childViews')[0];
    var cont = this.get('content');
    var toShow = '';
    for (var key in cont) {
      if (cont.hasOwnProperty(key)) {
        toShow += key;
        toShow += ' : ';
        toShow += cont[key];
        toShow += '\n';
      }
    }
    textField.set('value', toShow);
    metadataView.popup(button, SC.PICKER_POINTER, [0, 1, 2, 3, 0]);
  },
   
  /**
    The document's descriptive metadata
    
    @observes content
  */
  descriptiveMetadataDictionary: function () { 
    var cc = this.get('content');
    // check if metadata entries are composed of multiple values
    for (var k in cc) {
      if (cc.hasOwnProperty(k)) {
        if (SC.typeOf(cc[k]) === SC.T_ARRAY) {
          var arr = cc[k];
          // compose a string of values separated by semi-colons
          var newValue = '';
          for (var v in arr) {
            if (arr.hasOwnProperty(v)) {
              if (newValue.length > 0) {
                newValue = newValue + '; ';
              }
              newValue = newValue + arr[v];
            }
          }
          cc[k] = newValue;
        }
      }
    }
    return cc;
  }.property('content')
  
});