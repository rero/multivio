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

  /**
    @method
    
    Override the render function so we can hide the search scope if needed.
    
    @param {Object} context
    @param {Boolean} firstTime
  */
  render: function (context, firstTime) {
     
    if (firstTime) {
      sc_super();
      this._hideSearchScopeViewIfNeeded();
    } 
     
  },
  
  /**
    Observe the list of files, and decide whether to show search scope view.
    The scope is displayed only if there is more than one file in the document.
    
    @observes .searchController.currentFileList
    
  */
  currentFileListDidChange: function () {
    Multivio.logger.debug('==search view, currentFileListDidChange');
    this._hideSearchScopeViewIfNeeded();
  }.observes('.searchController.currentFileList'),  
               
  
  /**
    @method
    @private
    Hide the search scope (list of files to select where to search) if
    there is only one file in the document.
  */
  _hideSearchScopeViewIfNeeded: function () {

    var cl = this.get('searchController').get('currentFileList');

    Multivio.logger.debug('==search view, _hideSearchScopeViewIfNeeded: ' + cl);
    
    if (SC.none(cl)) return;
  
    // if only one file, remove it
    if (cl.length <= 1) {
      Multivio.logger.debug('==search view, hiding scope: ' + this.searchScopeView);
      this.searchScopeView.set('isVisible', NO);
    } 
    // if there are more than 1 files, show it
    else {
      this.searchScopeView.set('isVisible', YES);
    }
    
  },
  
  
  searchQueryView: SC.TextFieldView.design({
    layout: { top: 0, left: 0, right: 54, height: 24 },
    isEnabledBinding: 'Multivio.searchTreeController.allowsSelection',
    classNames: 'search',
    hint: '_typeQueryHere'.loc(),
    valueBinding: 'Multivio.searchController.currentSearchTerm',
    //#CHE change this because problem with key event
    //#DWY use keyUp so that we are sure that the new character has already
    //been inserted into the text field (prevents us from losing the
    //last character).
    keyUp: function (evt) {
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
    isEnabledBinding: 'Multivio.searchTreeController.allowsSelection',
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
    isEnabledBinding: 'Multivio.searchTreeController.allowsSelection',
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
      isEnabledBinding: 'Multivio.searchTreeController.allowsSelection',
      insertionOrientation: SC.VERTICAL_ORIENTATION,
      rowHeight: 15,
      contentBinding: 'Multivio.searchTreeController.arrangedObjects',
      selectionBinding: 'Multivio.searchTreeController.selection',
      contentValueKey: 'label',
      exampleView: Multivio.SearchTreeLabelView
      //controllers: ['searchTreeController']
    })
  }),
  
  nextResultButtonView: SC.ButtonView.design({
    layout: { top: 70, height: 20, width: 20, right: 0 },
    isEnabledBinding: 'Multivio.searchTreeController.allowsSelection',
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
    isEnabledBinding: 'Multivio.searchTreeController.allowsSelection',
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

    layout: { top: 36, left: 0, right: 0, height: 25 },
    isEnabledBinding: 'Multivio.searchTreeController.allowsSelection',    
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
  
  messageLabelView: SC.LabelView.design({
    layout: { top: 72, left: 0, right: 0, height: 22 },
    textAlign: SC.ALIGN_LEFT,
    classNames: 'message',
    valueBinding: 'Multivio.searchController.searchStatus'
  })
});
