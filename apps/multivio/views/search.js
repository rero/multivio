/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** @class

  View for the search functionality.

  @author dwy
  @extends SC.View
  @since 0.2.0
*/
Multivio.SearchView = SC.View.extend(
/** @scope Multivio.SearchView.prototype */ {
                  
  childViews: ['scopeLabelView', 'searchQueryView', 'clearButtonView',
               'searchButtonView', 'previousResultButtonView',
               'nextResultButtonView', 'resultsScrollView', 'searchScopeView'],
  
  searchQueryView: SC.TextFieldView.design({ 
    layout: { left: 0, width: 250, height: 22 },
    classNames: 'search',
    valueBinding: 'Multivio.searchController.currentSearchTerm'
  }),

  searchButtonView: SC.ButtonView.design({
    layout: { top: 0, right: 43, width: 40 },
    icon: static_url('images/icons/loupe.png'), // TODO: search icon
    titleMinWidth : 0,
    // trigger action when pressing enter. 
    // Note: can interfere with other components
    isDefault: YES, 
    needsEllipsis: NO,
    toolTip: '_doSearch'.loc(),
    target: 'Multivio.searchController', 
    action: 'doSearch'
  }),
  
  clearButtonView: SC.ButtonView.design({
    layout: { top: 0, right: 0, width: 40 },
    icon: static_url('images/icons/pause.png'), // TODO: search icon
    toolTip : '_doClear'.loc(),
    // trigger action when pressing escape. 
    // Note: can interfere with other components
    //isCancel: YES, 
    titleMinWidth : 0,
    target: 'Multivio.searchController', 
    action: 'doClear'
  }),
  
  resultsScrollView: SC.ScrollView.design({
    layout: { top: 70, left: 0, right: 0, bottom: 10 },
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
  
  /**
    Update the position of the scroll in the view if needed.

    @private
    @observes Multivio.searchController.selection
  */
  _searchResultSelectionDidChange: function () {
    var selection = Multivio.searchController.get('selection').firstObject();

    if (!SC.none(selection)) {
      // retrieve the list of the results visible in the view
      var listView = this.get('resultsScrollView')
                          .get('contentView').get('childViews');
      var needToScroll = YES;
      // don't verify the first and the last child to force to scroll
      for (var i = 1; i < listView.get('length') - 1; i++) {
        var res = listView[i].content;

        if (res === selection) {
          needToScroll = NO;
        }
      }

      // if needed, scroll to the new position
      if (needToScroll) {
        var selectionIndex = Multivio.searchController.indexOf(selection);
        this.get('resultsScrollView').get('contentView')
                                    .scrollToContentIndex(selectionIndex);
      }
    }
  }.observes('Multivio.searchController.selection'),
  
  previousResultButtonView: SC.ButtonView.design({
    layout: { top: 30, height: 25, width: 40, right: 43 },
    needsEllipsis: NO,
    toolTip : '_goToPrevious'.loc(),
    icon: static_url('images/icons/previous.png'),
    titleMinWidth : 0,
    target: 'Multivio.searchController', 
    action: 'goToPreviousResult'
  }),
  
  nextResultButtonView: SC.ButtonView.design({
    layout: { top: 30, height: 25, width: 40, right: 0 },
    needsEllipsis: NO,
    toolTip : '_goToNext'.loc(),
    icon: static_url('images/icons/next.png'),
    titleMinWidth : 0,
    target: 'Multivio.searchController', 
    action: 'goToNextResult'
  }),
  
  searchScopeView : SC.SelectButtonView.design({
  //searchScopeView : SC.SelectFieldView.design({
	
    layout: { top: 30, left: 0, right: 90 },

    toolTip: '_searchIn'.loc(),
    valueBinding: 'Multivio.searchController.currentSearchFile',
    objectsBinding: 'Multivio.searchController.currentFileList',       
    nameKey: 'label',
    theme: 'square',
    valueKey: 'url',
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
