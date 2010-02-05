/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  A CoredocumentNode is a Record with a guid, a parentId, a nextId, 
  a previousId, a sequenceNumber, a localSequenceNumber, a label, a metadata,
  an url and children.

  @extends {SC.Record}
  @version {0.1.0}
*/
Multivio.CoreDocumentNode = SC.Record.extend(
/** @scope Multivio.CoreDocumentNode.prototype */ {

  guid: SC.Record.attr(String),
  parentId: SC.Record.attr(Array),
  nextId: SC.Record.attr(String),
  previousId: SC.Record.attr(String),
  sequenceNumber: SC.Record.attr(Number),
  localSequenceNumber: SC.Record.attr(Number),
  label: SC.Record.attr(String),
  metadata: SC.Record.attr(Object),
  urlDefault: SC.Record.attr(String),
  children: SC.Record.toMany("Multivio.CoreDocumentNode"),

  
  /**
    @property {Boolean}
    
    Is this a leaf CDM node?
    A CDM leaf node has:
      - no children;
      - a urlDefault;
      - a sequenceNumber;
    
    @default {NO}
  */
  isLeafNode: function () {
    // TODO check function logic (compare with previous version c24c9996)
    var urlDefault = this.get('urlDefault');
    return (!SC.none(urlDefault));
  }.property('urlDefault').cacheable(),

  /**
    @property {Boolean}
    
    Is this an inner CDM node?
    An inner CDM node has children
    
    @default {NO}
  */
  isInnerNode: function () {
    // TODO check function logic (compare with previous version c24c9996)
    var urlDefault = this.get('urlDefault');
    return SC.none(urlDefault);
  }.property('urlDefault').cacheable()

});
