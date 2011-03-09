/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

sc_require('mixins/interface');
sc_require('views/search_tree');

/** @class

View for the search functionality.

@author dwy
@extends SC.View
@since 0.2.0
*/
Multivio.SearchView = SC.View.extend(
/** @scope Multivio.SearchView.prototype */ {
  
  /* reference to controllers */
  searchController: null,
  searchTreeController: null,
                  
  childViews: ['messageLabelView', 'searchQueryView', 'clearButtonView',
               'searchButtonView', 'previousResultButtonView',
               'nextResultButtonView', 'resultsScrollView', 'searchScopeView'],
  
  searchQueryView: SC.TextFieldView.design({
    layout: { top: 0, left: 0, right: 54, height: 24 },
    classNames: 'search',
    hint: '_typeQueryHere'.loc(),
    valueBinding: 'Multivio.searchController.currentSearchTerm',
    //#CHE change this because problem with key event
    keyDown: function (evt) {
      //if press tab or enter set the value
      if (evt.which === 13) {
        this.get('parentView').get('searchController').set('currentSearchTerm', 
                                                        this.$input()[0].value);
        this.get('parentView').get('searchController').doSearch();
        evt.stop();
        return YES;
      } 
      else { 
        // if another key was pressed, notify that the value changed
        this.fieldValueDidChange(NO);
        return NO;
      }
    }
  }),

  searchButtonView: SC.ButtonView.design({
    layout: { top: 2, right: 24, width: 20, height: 20 },
    icon: 'search_new_16',
    renderStyle: "renderImage",
    titleMinWidth : 0,
    // trigger action when pressing enter.
    // Note: can interfere with other components
    //#CHE remove this because interfere with navigation enter key event
    //keyEquivalent: 'return',
    //needsEllipsis: NO,
    theme: 'mvo-button',
    toolTip: '_doSearch'.loc(),
    target: 'Multivio.searchController',
    action: 'doSearch'
  }),
  
  clearButtonView: SC.ButtonView.design({
    layout: { top: 2, right: 0, width: 20, height: 20 },
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
  
  resultsScrollView: Multivio.SearchTreeView.design({

    layout: { top: 100, left: 0, right: 0, bottom: 0 },

    borderStyle: SC.BORDER_NONE,
    hasHorizontalScroller: YES,
    hasVerticalScroller: YES,
    
    contentView: SC.ListView.design(Multivio.innerGradientThinTopBottom, {
      layout: { top: 0, left: 0, right: 0, bottom: 0 },
      insertionOrientation: SC.VERTICAL_ORIENTATION,
      rowHeight: 15,
      contentBinding: 'Multivio.searchTreeController.arrangedObjects',
      selectionBinding: 'Multivio.searchTreeController.selection',
      contentValueKey: 'label',
      exampleView: Multivio.SearchTreeLabelView
      //controllers: ['searchTreeController']
    })
  }),
  
  /**
Update the position of the scroll in the view if needed.

@private
@observes Multivio.searchController.selection
*/
  /*_searchResultSelectionDidChange: function () {
    var selection = this.get('searchController').get('selection');

    if (!SC.none(selection)) {
      var selectionIndex = this.get('searchController').get('arrangedObjects')
                .indexOf(selection.firstObject());
      this.get('resultsScrollView').get('contentView')
                                          .scrollToContentIndex(selectionIndex);
      Multivio.logger.debug('_searchResultSelectionDidChange, scroll to index: ' + selectionIndex);                                          
    }
  }.observes('.searchController.selection'),*/
  
  nextResultButtonView: SC.ButtonView.design({
    layout: { top: 70, height: 20, width: 20, right: 0 },
    needsEllipsis: NO,
    toolTip : '_goToNext'.loc(),
    icon: 'down_new_16',
    theme: 'mvo-button',
    renderStyle: "renderImage",
    titleMinWidth : 0,
    target: 'Multivio.searchTreeController',
    action: 'goToNextResult'
  }),

  previousResultButtonView: SC.ButtonView.design({
    layout: { top: 70, height: 20, width: 20, right: 24 },
    needsEllipsis: NO,
    toolTip : '_goToPrevious'.loc(),
    icon: 'up_new_16',
    theme: 'mvo-button',
    renderStyle: "renderImage",
    titleMinWidth : 0,
    target: 'Multivio.searchTreeController',
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
