/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @namespace

  Model of a search result in a tree view.

  @author dwy    
  @extends Object   
  @since 0.4.0 
*/

Multivio.SearchTreeContent =  SC.Object.extend({
  
  /**
  @property {Boolean}
  */
  treeItemIsExpanded: undefined,
  
  /**
  The size of the label
  
  @property {Number}  
  */
  labelWidth: undefined,
  
  position: undefined,


  /**
    Return the list of the children of this Multivio.Tree as TreeContent
  */
  treeItemChildren: function () {
    
    //Multivio.logger.debug('SearchTreeContent, treeItemChildren, childs: ' + this.childs);
    
    var ret = [];
    var children = this.childs;
    var label = this.label;
    var fp = this.file_position;
    this.position = fp.index;
    /*var pos = !SC.none(fp.index) ? fp.index : 0;
    var level = !SC.none(this.level) ? this.level : this.level = 2;
    if (this.level === 2) {*/
    if (!SC.none(this.position)) {
      var isPositionEmpty = Multivio.searchTreeController._treeLabelByPosition[this.position];
      //add or concat treeContent to the _treeLabelByPosition
      if (SC.none(isPositionEmpty)) {
        Multivio.searchTreeController._treeLabelByPosition[this.position] = [this];
      }
      else {
        Multivio.searchTreeController._treeLabelByPosition[this.position] = 
          isPositionEmpty.concat(this);
      }
    }
    
    // fill array of nodes by id
    if (!SC.none(this.id)) {
      Multivio.searchTreeController._treeNodeById[this.id] = this;
    }
    
    this.labelWidth = label.length;
    if (SC.none(children)) {
      this.treeItemIsExpanded = NO;
    }
    else {
      this.treeItemIsExpanded = YES;
      for (var i = 0; i < children.length; i++) {
        var onechild = this.childs[i];
        var newTreeContent = Multivio.SearchTreeContent.create(onechild);
        ret.push(newTreeContent);
      }
    }
    
    if (ret.length === 0) ret = null;
    return ret;
  }.property().cacheable() 

});