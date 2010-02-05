/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  A tree is a Record width a guid, a label, children, a targetCdmLeaf and 
  a list of cdmLeafNodesIds

  @extends {SC.Record}
  @version {0.1.0}
*/
Multivio.Tree = SC.Record.extend(
/** @scope Multivio.Tree.prototype */ {

  guid: SC.Record.attr(String),
  label: SC.Record.attr(String),
  children: SC.Record.toMany("Multivio.Tree"),
  // the CDM node that should be selected after this tree node
  targetCdmLeaf: SC.Record.toOne("Multivio.CoreDocumentNode"),
  // the CDM leaf nodes that can be active when this tree node is selected;
  // this is useful to know if the tree selection must actually change if the
  // selected CDM leaf node changes (in many cases it doesn't)
  cdmLeafNodeIds: SC.Record.attr(Array)
});
