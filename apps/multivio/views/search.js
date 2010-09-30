// ==========================================================================
// Project:   Multivio.SearchView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/** @class

  View for the search functionality

  @extends SC.View
*/
Multivio.SearchView = SC.View.extend(
/** @scope Multivio.SearchView.prototype */ {

  childViews: 'scopeLabelView searchQueryView clearButtonView searchButtonView previousResultButtonView nextResultButtonView resultsScrollView searchScopeView'.w(),
  
  _physDidChange: function () {
    
    var url = Multivio.CDM.getReferer();
    this.set('docs', this.phys[url]);
    
    //console.info("_physDidChange: ref url:" + url + ", label: " + this.get('docs')[0].label);
    
  }.observes('phys'),
  
  searchQueryView: SC.TextFieldView.design({ 
    layout: { left: 0, right: 0, height: 22 },
    classNames: 'search',
    valueBinding: 'Multivio.searchController.currentSearchTerm' // TODO ??
    //value: ''
  }),

  searchButtonView: SC.ButtonView.design({
    layout: { top: 80, right: 0, left: "50%" },
    title : '_doSearch'.loc(),
    //isDefault: YES, // trigger action when pressing enter. Note: can interfere with other components
    target: 'Multivio.searchController', 
    action: 'doSearch'
  }),
  
/*  search: function () {
    Multivio.logger.debug('SearchView::doSearch("%@")'.fmt(this.searchQueryView.get('value')));
    Multivio.searchController.doSearch(this.searchQueryView.get('value'));
  },
*/  
  clearButtonView: SC.ButtonView.design({
    layout: { top: 80, left: 0, right: "50%" },
    title : '_doClear'.loc(),
    //isCancel: YES, // trigger action when pressing escape. Note: can interfere with other components
    target: 'Multivio.searchController', 
    action: 'doClear'
  }),
  
  resultsScrollView: SC.ScrollView.design({
    layout: { top: 120, left: 0, right: 0, bottom: 35 },
    borderStyle: SC.BORDER_NONE,
    hasHorizontalScroller: YES,
    hasVerticalScroller: YES,    
    
    contentView: SC.ListView.design({
      layout: { top: 0, left: 0, right: 0, bottom: 0 },
      insertionOrientation: SC.VERTICAL_ORIENTATION,
      rowHeight: 15,
      contentBinding: 'Multivio.searchController.arrangedObjects',
      selectionBinding: 'Multivio.searchController.selection',
      contentValueKey: 'context'
    })
  }),
  
  previousResultButtonView: SC.ButtonView.design({
    layout: { bottom: 0, height: 25, left: 0, right: "40%" },
    
    title : '_goToPrevious'.loc(),
    target: 'Multivio.searchController', 
    action: 'goToPreviousResult'
  }),
  
  nextResultButtonView: SC.ButtonView.design({
    layout: { bottom: 0, height: 25, left: "40%", right: 0 },
    
    title : '_goToNext'.loc(),
    target: 'Multivio.searchController', 
    action: 'goToNextResult'
  }),
  
  //or SC.SelectFieldView ?
  searchScopeView : SC.SelectButtonView.design({
  //searchScopeView : SC.SelectFieldView.design({
	
    layout: { top: 50, left: 40, right: 0 },

    valueBinding: 'Multivio.searchController.currentSearchFile', 
    objectsBinding: 'Multivio.searchController.currentFileList',         
    nameKey: 'label',
    theme: 'square',
    valueKey: 'url',
    //sortKey: 'label',
    disableSort: YES,
    checkboxEnabled: YES,
    itemIdx: 1 // select first item by default, does not work...
  }), 
  
  scopeLabelView: SC.LabelView.design({
    layout: { top: 30, left: 0, height: 50, width: 80 },
    textAlign: SC.ALIGN_LEFT,
    value: '_searchIn'.loc()
  })
  

});
