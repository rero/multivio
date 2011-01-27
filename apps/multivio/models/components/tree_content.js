/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @namespace

  Model of a tree component.
  A treeController controls objects that implement 
  the treeItemChildren property. This property returns the current array
  of child tree items.
   
  To have more information see the documentation of the SC.TreeController, 
  SC.TreeItemContent and the demo outline. 

  @author che      
  @extends Object   
  @since 0.1.0 
*/

Multivio.TreeContent =  SC.Object.extend({
  
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
  The number of search results for this element 
  
  @property {Number}  
  */
  nb_results: undefined,

  setSearchResultsNumber: function (num) {
    this.set('nb_results', num);
  },

  /**
    Return the list of the children of this Multivio.Tree as TreeContent
  */
  treeItemChildren: function () {
    var ret = [];
    var children = this.childs;
    var label = this.label;
    var fp = this.file_position;
    this.position = fp.index;
    /*var pos = !SC.none(fp.index) ? fp.index : 0;
    var level = !SC.none(this.level) ? this.level : this.level = 2;
    if (this.level === 2) {*/
    if (!SC.none(this.position)) {
      var isPositionEmpty = Multivio.treeController._treeLabelByPosition[this.position];
      //add or concat treeContent to the _treeLabelByPosition
      if (SC.none(isPositionEmpty)) {
        Multivio.treeController._treeLabelByPosition[this.position] = [this];
      }
      else {
        Multivio.treeController._treeLabelByPosition[this.position] = 
          isPositionEmpty.concat(this);
      }
    }
    
    this.labelWidth = label.length;
    if (SC.none(children)) {
      this.treeItemIsExpanded = NO;
    }
    else {
      this.treeItemIsExpanded = YES;
      for (var i = 0; i < children.length; i++) {
        var onechild = this.childs[i];
        var newTreeContent = Multivio.TreeContent.create(onechild);
        ret.push(newTreeContent);
      }
    }
    
    if (ret.length === 0) ret = null;
    return ret;
  }.property().cacheable() 

});