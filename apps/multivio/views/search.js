/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

sc_require('mixins/interface');


/** @class

  View for the search functionality.

  @author dwy
  @extends SC.View
  @since 0.2.0
*/
Multivio.SearchView = SC.View.extend(
/** @scope Multivio.SearchView.prototype */ {
                  
  childViews: ['messageLabelView', 'searchQueryView', 'clearButtonView',
               'searchButtonView', 'previousResultButtonView',
               'nextResultButtonView', 'resultsScrollView', 'searchScopeView'],
  
  searchQueryView: SC.TextFieldView.design({ 
    layout: { top: 0, left: 0, right: 54, height: 24 },
    classNames: 'search',
    hint: '_typeQueryHere'.loc(),
    valueBinding: 'Multivio.searchController.currentSearchTerm'
  }),

  searchButtonView: SC.ButtonView.design({
    layout: { top: 0, right: 24, width: 24, height: 24 },
    icon: 'search_new_16',
    renderStyle: "renderImage",
    titleMinWidth : 0,
    // trigger action when pressing enter. 
    // Note: can interfere with other components
    keyEquivalent: 'return', 
    //needsEllipsis: NO,
    theme: 'mvo-button',
    toolTip: '_doSearch'.loc(),
    target: 'Multivio.searchController', 
    action: 'doSearch'
  }),
  
  clearButtonView: SC.ButtonView.design({
    layout: { top: 0, right: 0, width: 24, height: 24 },
    icon: 'cancel_new_16',
    renderStyle: "renderImage",
    toolTip : '_doClear'.loc(),
    theme: 'mvo-button',
    // trigger action when pressing escape. 
    // Note: can interfere with other components
    //isCancel: YES, 
    //keyEquivalent: 'escape', 

    titleMinWidth : 0,
    target: 'Multivio.searchController', 
    action: 'doClear'
  }),
  
  resultsScrollView: SC.View.design({
    layout: { top: 100, left: 0, right: 0, bottom: 0 },

    borderStyle: SC.BORDER_NONE,
    hasHorizontalScroller: YES,
    hasVerticalScroller: YES,    
    
    contentView: SC.ListView.design(Multivio.innerGradient, {
      layout: { top: 0, left: 0, right: 0, bottom: 0 },
      insertionOrientation: SC.VERTICAL_ORIENTATION,
      rowHeight: 15,
      contentBinding: 'Multivio.searchController.arrangedObjects',
      selectionBinding: 'Multivio.searchController.selection',
      contentValueKey: 'context'
    })/*,
    render: function (context, firstTime) {
      if (context.needsContent) {
        this.renderChildViews(context, firstTime);
        context.push(
          "<div class='top-edge'></div>",
          "<div class='right-edge'></div>",
          "<div class='bottom-edge'></div>",
          "<div class='left-edge'></div>");
      }
    }*/
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
      var listView = this.get('resultsScrollView').get('childViews')[0]
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
        this.get('resultsScrollView').get('childViews')[0].get('contentView')
                                    .scrollToContentIndex(selectionIndex);
      }
    }
  }.observes('Multivio.searchController.selection'),
  
  previousResultButtonView: SC.ButtonView.design({
    layout: { top: 70, height: 24, width: 24, right: 24 },
    needsEllipsis: NO,
    toolTip : '_goToNext'.loc(),
    icon: 'down_new_16',
    theme: 'mvo-button',
    renderStyle: "renderImage",
    titleMinWidth : 0,
    target: 'Multivio.searchController', 
    action: 'goToNextResult'
  }),
  
  nextResultButtonView: SC.ButtonView.design({
    layout: { top: 70, height: 24, width: 24, right: 0 },
    needsEllipsis: NO,
    toolTip : '_goToPrevious'.loc(),
    icon: 'up_new_16',
    theme: 'mvo-button',
    renderStyle: "renderImage",
    titleMinWidth : 0,
    target: 'Multivio.searchController', 
    action: 'goToPreviousResult'
  }),
  
  searchScopeView : SC.SelectButtonView.design({
  //searchScopeView : SC.SelectFieldView.design({

    layout: { top: 36, left: 0, right: 0, height: 25 },

    toolTip: '_searchIn'.loc(),
    valueBinding: 'Multivio.searchController.currentSearchFile',
    objectsBinding: 'Multivio.searchController.currentFileList',       
    nameKey: 'label',
    theme: 'square',
    valueKey: 'url',
    disableSort: YES,
    checkboxEnabled: YES,
    needsEllipsis: NO,
    supportFocusRing: NO
  }),
  
  /*scopeLabelView: SC.LabelView.design({
    layout: { top: 30, left: 0, height: 50, width: 80 },
    textAlign: SC.ALIGN_LEFT,
    value: '_searchIn'.loc()
  })*/
  
  messageLabelView: SC.LabelView.design({
    layout: { top: 72, left: 0, right: 0, height: 22 },
    textAlign: SC.ALIGN_LEFT,
    classNames: 'message',
    valueBinding: 'Multivio.searchController.searchStatus'
  })
});
