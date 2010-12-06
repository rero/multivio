/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @class

  View that contains the metadata of the document

  @author che
  @extends View
  @since 0.3.0
*/
Multivio.Metadata = SC.View.extend(SC.ContentDisplay,
/** @scope Multivio.Multivio.Metadata.prototype */ {

  contentDisplayProperties: 'key data'.w(),
  isTextSelectable: YES,
  // property used by the listView to calculate new position of the line
  customHeight: 0,
  
  
  /**
    Override render method to create the label and the data for the table of 
    metadata
    
    @param {Object} context
    @param {Boolean} firstTime 
  */
  render: function (context, firstTime) {
    // retreive key and data of the content
    var content = this.get('content');
    var key = content.key.capitalize();
    // calculate the height of the key and the data 
    // to set the height of the parentView
    var keyHeight = SC.heightForString(key, 110, 'font-weight: bold', 
        ['mvo-metadata-label']);
    var data = content.data;
    
    var dataHeight = SC.heightForString(data, 220, ['mvo-metadata-data']);

    // if no data, skip this line
    if (dataHeight !== 0) {
      // keep the bigger height
      if (keyHeight < dataHeight) {
        keyHeight = dataHeight;
      }
      
      context.addStyle('height', keyHeight);
      this.set('customHeight', keyHeight);
    
      context = context.begin('span').addClass('mvo-metadata-label').push(key).end();
      context = context.begin('p').addClass('mvo-metadata-data').push(data).end();

      sc_super();
    }
  }
});