/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  A thumbnail is a Record with an url, a pageNumber and 
  a reference to a CDM Node

  @extends {SC.Record}
  @version {0.1.0}
*/
Multivio.Thumbnail = SC.Record.extend(
/** @scope Multivio.Thumbnail.prototype */ {

  guid: SC.Record.attr(String),
  url: SC.Record.attr(String),
  //pageNumber = CDM.sequenceNumber
  pageNumber: SC.Record.attr(Number),
  coreDocumentNode: SC.Record.toOne("Multivio.CoreDocumentNode")
 
});