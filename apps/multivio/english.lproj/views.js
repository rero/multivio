/**
==============================================================================
Project: Multivio - https://www.multivio.org/
Copyright: (c) 2009-2011 RERO
License: See file license.js
==============================================================================
*/

sc_require('views/main_content');
sc_require('views/image_content');
sc_require('views/highlight_content');
sc_require('views/thumbnail');
sc_require('views/tree');
sc_require('views/calendar');
sc_require('views/file_button');
sc_require('views/metadata');
sc_require('views/search');
sc_require('views/navigation');
sc_require('views/overview');
sc_require('mixins/interface');

/**
  @class

  The main page object contains all views configuration.
  
  Note: being an SC.Page, this class contains view definitions, but these are
  not directly shown in the workspace; they must be explicitly appended to
  the SC.MainPane instance of the application's main page.
*/
Multivio.views = SC.Page.design(
/** @scope Multivio.views.prototype */ {

  /**
    Main content view
  */
  mainContentView: SC.View.design(Multivio.innerGradient, {
    layout: { top: 0, bottom: 0, left: 0, right: 0 },
    acceptsFirstResponder: YES,
    isKeyResponder: YES,

    /**
      On mouse down, hide the current palette.
      Since this view is the first responder, it will catch unhandled mouse
      events in the navigationInfo view below as well.

      Notes on mouse events:

      mouseUp events can be propagated from child views to here, whereas 
      if a child view wants to use mouseUp and/or mouseDragged, this child view
      will need to return YES to its mouseDown when it occurs. In this case,
      it will be possible for a child view to propagate mouseUp up to here,
      but not mouseDown (unless the child view manually creates and triggers
      a new mouseDown event to its parent or nextResponder).
      
      Another note: according to tests I made, mouseDragged is not propagated up 
      in the view hierarchy, even though this event should be propagated when
      the child view that catches mouseDragged returns NO, as per documentation.
      -dwy

      @param {SC.Event} Event fired
    */
    mouseDown: function (evt) {
      Multivio.paletteController.hidePalette(null);
      return YES; // return YES so this view can capture mouseUp
    },

    controllers: ['zoomController', 'navigationController', 
                  'searchController', 'selectionController', 
                  'imageController',  'treeController', 'thumbnailController',
                  'searchTreeController'],

    //childViews: 'navigation bottomButtons content'.w(),
    childViews: 'content'.w(),
    
    content: SC.View.design({
      layout: { top: 0, bottom: 0, left: 48, right: 0 },
      classNames: 'outer_content_view',
      childViews: 'innerMainContent'.w(),

      innerMainContent: Multivio.ContentView.design({
        layout: { top: 5, bottom: 5, left: 5, right: 5 },
        imageController: Multivio.imageController,
        isFirstResponder: YES,
        acceptsFirstResponder: YES,
        isKeyResponder: YES,
    
        borderStyle: SC.BORDER_NONE,
        classNames: 'inner_content_view',

        contentView: SC.View.design({
          layout: { top: 0, bottom: 0, centerX: 0, minWidth: 1 },
          useImageCache: NO,
      
          // note: draw highlight pane on top of the content image
          childViews: 'innerContent highlightpane'.w(),

          innerContent: Multivio.ImageContentView.design({
            imageController: Multivio.imageController,
            layout: { top: 0, left: 0, minWidth: 1 },
            useImageCache: NO
          }),

          highlightpane: Multivio.HighlightContentView.design({
            layout: { top: 0, left: 0, right: 0, minWidth: 1 },
            /* controllers */
            masterController: Multivio.masterController,
            selectionController: Multivio.selectionController,
            searchController: Multivio.searchController,
            searchTreeController: Multivio.searchTreeController,
            paletteController: Multivio.paletteController,
            zoomController: Multivio.zoomController,
            rotateController: Multivio.rotateController
          }).classNames('highlight-pane'.w())
        }).classNames('image-and-highlight-container'.w())
      })
    })
  }),


  navigationInfo: Multivio.NavigationView.design({
    layout: { width: 220, height: 50, centerX: 24, top: 16},
    classNames: 'mvo-front-view',
    
    childViews: 'transparentView '.w(),
       
    transparentView: SC.View.design({
      layout: { left: 0, right: 0, top: 0, bottom: 0 },
      classNames: 'mvo-front-view-transparent',

      childViews: 'currentFile currentPage'.w(), 
    
      currentFile: SC.LabelView.design({
        layout: {width: 220, height: 20, left: 5, top: 5},
        classNames: 'mvo-metadata-label',
        escapeHTML: YES,
        value: null
      }),
      currentPage: SC.LabelView.design({
        layout: {width: 220, height: 20, left: 5, top: 25},
        classNames: 'mvo-metadata-label',
        escapeHTML: NO,
        value: null
      })
    })
  }),


  bottomButtons: Multivio.FileButtonView.design({
    layout: {bottom: 20, centerX: 24, width: 728, height: 48},
    classNames: 'mvo-front-view',
    
    childViews: 'backgroundView '.w(),
    
    backgroundView: SC.View.design({
      layout: { left: 0, right: 0, top: 0, bottom: 0 },
      classNames: 'mvo-front-view-transparent',
    
      childViews: [
      /*
        'goPreviousFileButton',
        'goNextFileButton',
        */
        'overviewButton',
        'rotateLeftButton',
        'rotateRightButton',
        'firstPageButton',
        'previousPageButton',
        'textPageView',
        'nextPageButton',
        'lastPageButton',
        'zoomOutButton',
        'zoomInButton',
        'zoomFullSizeButton',
        'zoomFullWidthButton',
        'zoomNativeSizeButton'
      ],

      /*
      goPreviousFileButton: SC.ButtonView.design({
        layout: { centerX: -336, centerY: 0,  width: 32, height: 32 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        name: 'goPrevious',
        toolTip: '_GoPrevious'.loc(),
        renderStyle: "renderImage",
        icon: 'go_previous_new',
        theme: 'mvo-button',
        isEnabledBinding:
            SC.Binding.not("Multivio.navigationController.isFirstFile"),
        target: "Multivio.navigationController", 
        action: "goToPreviousFile"
      }),
      
      goNextFileButton: SC.ButtonView.design({
        layout: { centerX: -304, centerY: 0,  width: 32, height: 32 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        name: 'goNext',
        toolTip: '_GoNext'.loc(),
        renderStyle: "renderImage",
        icon: 'go_next_new',
        theme: 'mvo-button',
        isEnabledBinding:
            SC.Binding.not("Multivio.navigationController.isLastFile"),
        target: "Multivio.navigationController", 
        action: "goToNextFile"
      }),
      */
      
      overviewButton: SC.ButtonView.design({
        layout: { centerX: -240, centerY: 0,  width: 32, height: 32 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        name: 'overview',
        toolTip: '_Overview'.loc(),
        renderStyle: "renderImage",
        icon: 'overview_new',
        theme: 'mvo-button',
        isEnabledBinding: 'Multivio.overviewController.isOverviewEnabled',
        isActiveBinding: 'Multivio.overviewController.isOverviewActive',
        target: "Multivio.overviewController",
        action: "showOverview"
      }),

      rotateLeftButton: SC.ButtonView.design({
        layout: { centerX: -176, centerY: 0, width: 32, height: 32 },
        layerId: "rotateLeftPageId",
        titleMinWidth : 0,
        needsEllipsis: NO,
        toolTip: '_RotateLeft'.loc(),
        renderStyle: "renderImage",
        icon: 'rotate_left_new',
        theme: 'mvo-button',
        target: "Multivio.rotateController",
        isEnabledBinding: 'Multivio.rotateController.isLeftAllow', 
        action: "rotateLeft"
      }),

      rotateRightButton: SC.ButtonView.design({
        layout: { centerX: -144, centerY: 0, width: 32, height: 32 },
        layerId: "rotateRightPageId",
        titleMinWidth : 0,
        needsEllipsis: NO,
        toolTip: '_RotateRight'.loc(),
        renderStyle: "renderImage",
        icon: 'rotate_right_new',
        theme: 'mvo-button',
        target: "Multivio.rotateController",
        isEnabledBinding: 'Multivio.rotateController.isRigthAllow',
        action: "rotateRight"
      }),
      
      firstPageButton: SC.ButtonView.design({
        layout: { centerX: -80, centerY: 0, width: 32, height: 32 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        toolTip: '_FirstPage'.loc(),
        renderStyle: "renderImage",
        icon: 'jump_backwards_new',
        theme: 'mvo-button',
        isEnabledBinding: "Multivio.navigationController.isFirstEnabled",
        target: "Multivio.navigationController", 
        action: "goToFirstPage"
      }),

      previousPageButton: SC.ButtonView.design({
        layout: { centerX: -48, centerY: 0,  width: 32, height: 32 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        toolTip: '_PreviousPage'.loc(),
        renderStyle: "renderImage",
        icon: 'go_backwards_new',
        theme: 'mvo-button',
        isEnabledBinding: "Multivio.navigationController.isPreviousEnabled",
        target: "Multivio.navigationController", 
        action: "goToPrevious"
      }),    

      textPageView: SC.TextFieldView.design({ 
        layout: { centerX: 0, centerY: -1, width: 50, height: 24 },
        // Note: the total width of this in the toolbar is 64
        textAlign: SC.ALIGN_CENTER,
        valueBinding: 'Multivio.navigationController.currentPage',
        isEnabledBinding: 'Multivio.navigationController.isCurrentPageEnabled',
        
        mouseDown: function (evt) {
          this.becomeFirstResponder();
          evt.stopPropagation(); // don't propagate but execute default action
          return YES;
        },
        keyDown: function (evt) {
          // if enter set the value
          // if (evt.which === 13) {
          //   var temp = this.$input()[0].value.replace(/^[0]*/, '');
          //   this.set('value', temp);
          //   // don't propagate the event
          //   evt.stop();
          //   return YES;
          // }
          // intercept - and + and do nothing
          if (evt.which === 43 || evt.which === 45) {
            // prevent default action (do not insert char in textfield)
            evt.preventDefault();
            return YES;
          }
          return NO;
        }
      }),

      nextPageButton: SC.ButtonView.design({
        layout: { centerX: 48, centerY: 0, width: 32, height: 32 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        toolTip: '_NextPage'.loc(),
        acceptsFirstResponder: YES,
        renderStyle: "renderImage",
        icon: 'go_forward_new',
        theme: 'mvo-button',
        isEnabledBinding: "Multivio.navigationController.isNextEnabled",
        target: "Multivio.navigationController", 
        action: "goToNext"
      }),

      lastPageButton: SC.ButtonView.design({
        layout: { centerX: 80, centerY: 0, width: 32, height: 32 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        toolTip: '_LastPage'.loc(),
        renderStyle: "renderImage",
        icon: 'jump_forward_new',
        theme: 'mvo-button',
        isEnabledBinding: "Multivio.navigationController.isLastEnabled",
        target: "Multivio.navigationController", 
        action: "goToLastPage"
      }),

      zoomOutButton: SC.ButtonView.design({
        layout: { centerX: 144, centerY: 0, width: 32, height: 32 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        toolTip: '_Zoom-'.loc(),
        renderStyle: "renderImage",
        icon: 'zoom_minus_new',
        theme: 'mvo-button',
        isEnabledBinding: "Multivio.zoomController.isZoomOutAllowed",
        target: "Multivio.zoomController", 
        action: "doZoomOut"
      }),

      zoomInButton: SC.ButtonView.design({
        layout: { centerX: 176, centerY: 0, width: 32, height: 32 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        toolTip: '_Zoom+'.loc(),
        renderStyle: "renderImage",
        icon: 'zoom_plus_new',
        theme: 'mvo-button',
        isEnabledBinding: "Multivio.zoomController.isZoomInAllowed",
        target: "Multivio.zoomController", 
        action: "doZoomIn"
      }),
    
      zoomFullSizeButton: SC.ButtonView.design({
        layout: { centerX: 240, centerY: 0, width: 32, height: 32 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        name: 'Full',
        toolTip: '_FullSize'.loc(),
        renderStyle: "renderImage",
        icon: 'full_size_new',
        theme: 'mvo-button',
        isEnabledBinding: "Multivio.zoomController.isFullEnabled",
        target: "Multivio.zoomController",
        action: "setPredefinedZoom"
      }),

      zoomFullWidthButton: SC.ButtonView.design({
        layout: { centerX: 272, centerY: 0, width: 32, height: 32 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        name: 'Width',
        toolTip: '_FullWidth'.loc(),
        renderStyle: "renderImage",
        icon: 'full_width_new',
        theme: 'mvo-button',
        isEnabledBinding: "Multivio.zoomController.isWidthEnabled",
        target: "Multivio.zoomController", 
        action: "setPredefinedZoom"
      }),

      zoomNativeSizeButton: SC.ButtonView.design({
        layout: { centerX: 304, centerY: 0, width: 32, height: 32 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        name: 'Native',
        toolTip: '_NativeSize'.loc(),
        renderStyle: "renderImage",
        icon: 'native_size_new',
        theme: 'mvo-button',
        isEnabledBinding: "Multivio.zoomController.isNativeEnabled",
        target: "Multivio.zoomController",
        action: "setPredefinedZoom"
      })
    })
  }),

  leftButtons: SC.View.design({
    layout: { top: 0, left: 4, bottom: 0, width: 40},
    //classNames: 'mvo-front-view',
    classNames: 'workspace_black',
    
    childViews: [
      SC.ButtonView.design({
        layout: { top: 10, centerX: 0, width: 32, height: 32 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        name: 'search',
        toolTip: '_Search'.loc(),
        renderStyle: "renderImage",
        icon: 'search_new',
        theme: 'mvo-button',
        target: "Multivio.paletteController",
        action: "showSearch"
      }),
      SC.ButtonView.design({
        layout: { top: 50, centerX: 0, width: 32, height: 32 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        name: 'tree',
        toolTip: '_Tree'.loc(),
        renderStyle: "renderImage",
        icon: 'tree_new',
        theme: 'mvo-button',
        target: "Multivio.paletteController",
        action: "showTree"
      }),
      SC.ButtonView.design({
        layout: { top: 90, centerX: 0, width: 32, height: 32 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        name: 'thumbnails',
        toolTip: '_Thumbnails'.loc(),
        renderStyle: "renderImage",
        icon: 'thumbnails_new',
        theme: 'mvo-button',
        target: "Multivio.paletteController",
        action: "showThumbnails"
      }),
      SC.ButtonView.design({
        layout: { top: 130, centerX: 0, width: 32, height: 32 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        name: 'download',
        toolTip: '_Download'.loc(),
        renderStyle: "renderImage",
        icon: 'download_new',
        theme: 'mvo-button',
        target: "Multivio.paletteController",
        action: "downloadFile"
      }),
      SC.ButtonView.design({
        layout: { top: 170, centerX: 0, width: 32, height: 32 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        name: 'show_toolbar',
        toolTip: '_ShowToolbar'.loc(),
        renderStyle: "renderImage",
        icon: 'show_toolbar_new',
        theme: 'mvo-button',
        target: "Multivio.paletteController",
        action: "showHorizontalToolbar"
      }),
      SC.ButtonView.design({
        layout: { top: 210, centerX: 0, width: 32, height: 32 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        name: 'help',
        toolTip: '_Help'.loc(),
        renderStyle: "renderImage",
        icon: 'help_new',
        theme: 'mvo-button',
        target: "Multivio.paletteController",
        action: "showHelpPalette"
      })
    ]
  }),
 
  // Thumbnails
  thumbnailPalette: SC.PalettePane.design({
    isAnchored: YES,
    classNames: 'mvo-transparent',
    contentView: SC.View.design({
      layout: { top: 0, bottom: 0, left: 0, right: 0 },
      
      childViews: 'innerThumbnail thumbnailListModeButtom thumbnailGridModeButtom'.w(),

      innerThumbnail: Multivio.ThumbnailView.design(Multivio.innerGradientThinTopBottom, {
        layout: { top: 2, bottom: 42, left: 2, right: 2 },
        hasHorizontalScroller: NO,
        borderStyle: SC.BORDER_NONE,
        thumbnailController: Multivio.thumbnailController,

        contentView: SC.GridView.design({
          layout: { top: 0, bottom: 0, left: 0, right: 0 },
          insertionOrientation: SC.VERTICAL_ORIENTATION,
          rowHeight: 130,
          columnWidth: 130,
          contentBinding: 'Multivio.thumbnailController.arrangedObjects',
          selectionBinding: 'Multivio.thumbnailController.selection',
          
          exampleView: SC.View.design({
            childViews: 'thumbImage thumbLabel'.w(),
            isSelectedDidChange: function () {
              this.get('thumbLabel').updateLayer();
            }.observes('isSelected'),
            thumbImage: SC.View.design({
              layout:  { top: 4, height: 100, centerX: 0, width: 100 },
              childViews: [
                SC.ImageView.design({
                  useImageCache: NO,
                  classNames: 'centered-image',
                  contentBinding: '.parentView.parentView.content',
                  contentValueKey: 'url'
                })
              ]
            }),
            thumbLabel: SC.LabelView.design({
              layout:  { bottom: 4, height: 18, centerX: 0, width: 46 },
              textAlign: SC.ALIGN_CENTER,
              contentBinding: '.parentView.content',
              contentValueKey: 'pageNumber', 
              render: function (context, firstTime) {
                var isSelected = this.get('parentView').get('isSelected');
                var classes = {'standard': !isSelected, 'selected': isSelected};
                context.setClass(classes);
                sc_super();
              }
            })
          }).classNames('custom-thumbnail-item-view'.w())
          /*
          ,
          selectionDidChange: function () {
            this.scrollToVisible(this.getPath('selection.firstChild'));
          }.observes('selection').cacheable()
          */
        })
      }),
    
      thumbnailListModeButtom: SC.ButtonView.design({
        layout: { height: 32, bottom: 4, width: 32, left: 2 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        name: 'thumbnailListMode',
        toolTip: '_ThumbnailListMode'.loc(),
        renderStyle: "renderImage",
        icon: 'thumbnail_list_mode_new',
        theme: 'mvo-button',
        valueBinding: 'Multivio.paletteController.thumbnailMode',
        buttonBehavior: SC.TOGGLE_ON_BEHAVIOR,
        toggleOnValue: 'list'
      }),
      
      thumbnailGridModeButtom: SC.ButtonView.design({
        layout: { height: 32, bottom: 4, width: 32, left: 32 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        name: 'thumbnailGridMode',
        toolTip: '_ThumbnailGridMode'.loc(),
        renderStyle: "renderImage",
        icon: 'thumbnail_grid_mode_new',
        theme: 'mvo-button',
        valueBinding: 'Multivio.paletteController.thumbnailMode',
        buttonBehavior: SC.TOGGLE_ON_BEHAVIOR,
        toggleOnValue: 'grid'
      })
    })
  }),
    
    
  /**
    Search view 
  */
  searchPalette: SC.PalettePane.design({
    isAnchored: YES,
    classNames: 'mvo-transparent',
    contentView: SC.View.design({
      layout: { top: 0, bottom: 0, left: 0, right: 0 },
    
      //add controller(s) needed for this view
      controllers: ['imageController'],
    
      childViews: 'innerSearch'.w(),
      innerSearch: Multivio.SearchView.design({
        layout: { top: 2, bottom: 2, left: 2, right: 2 },
        borderStyle: SC.BORDER_NONE,
        /* controllers */
        searchController: Multivio.searchController,
        searchTreeController: Multivio.searchTreeController
      })
    })
  }), //.classNames('shadow_light inner_view'.w()),

  /**
    Tree palette
  */
  treePalette: SC.PalettePane.design({
    isAnchored: YES,
    classNames: 'mvo-transparent',
    contentView: SC.View.design({
      layout: { top: 0, bottom: 0, left: 0, right: 0 },
      childViews: 'innerTree '.w(),
      innerTree:  Multivio.TreeView.design(Multivio.innerGradientThinTopBottom, {
        layout: { top: 2, bottom: 2, left: 2, right: 2 },
        borderStyle: SC.BORDER_NONE,
        treeController: Multivio.treeController,

        contentView: SC.ListView.design({
          layout: { top: 0, bottom: 0, left: 0, right: 0 },
          classNames: 'mvo-test',
          rowHeight: 18,
          borderStyle: SC.BORDER_NONE,
          exampleView: Multivio.TreeLabelView,
          contentValueKey: 'label',
          contentBinding: 'Multivio.treeController.arrangedObjects',
          selectionBinding: 'Multivio.treeController.selection'
        })
      })
    })
  }),
  
  /**
    Calendar palette
  */
  calendarPalette: SC.PalettePane.design({
    isAnchored: YES,
    classNames: 'mvo-transparent',
    contentView: SC.View.design({
      layout: { top: 0, bottom: 0, left: 0, right: 0 },
      childViews: [
        Multivio.CalendarView.design(Multivio.innerGradientThinTopBottom, {
          layout: { top: 2, bottom: 2, left: 2, right: 2 },
          borderStyle: SC.BORDER_NONE,
          calendarController: Multivio.calendarController
        })
      ]
    })
  }),

  treeView: SC.View.design({
    layout: { top: 0, bottom: 0, left: 0, right: 0 },
    // add controller(s) need for this view
    controllers: ['treeController']
  }),
  
  // metadata
  metadataPalette: SC.PalettePane.design({
    isAnchored: YES,
    classNames: 'mvo-transparent',
    
    contentView: SC.View.design({
      layout: { top: 0, left: 0, bottom: 0, right: 0 },

      childViews: [
        SC.ListView.design({
          layout: { top: 2, bottom: 2, left: 2, right: 2 },
          exampleView: Multivio.Metadata,
          // update row position
          didCreateLayer: function () {
            var childs = this.get('childViews');
            var newTopPosition = 13;
            for (var i = 0; i < childs.length; i++) {
              childs[i].set('layout', {'top': newTopPosition});
              newTopPosition += childs[i].get('customHeight');
            }
          }
        })
      ]
    })
  }),
  
  // miniature overview
  overviewPalette: SC.PalettePane.design({
    isAnchored: YES,
    classNames: 'mvo-transparent',
    contentView: Multivio.OverviewView.design({
      layout: { top: 0, bottom: 0, left: 0, right: 0 },
      overviewController: Multivio.overviewController
    }),
    acceptsKeyPane: NO // do not not steal keyboard control from the main pane
  }),
  
  // waiting image
  waitingImg: SC.ImageView.design({
    layout: { centerX: 0, centerY: 0, width: 36, height: 36 },
    value: static_url('images/progress_wheel_medium.gif')
  }),
  
  // help
  helpPalette: SC.PalettePane.design({
    isAnchored: YES,
    classNames: 'mvo-transparent',
    contentView: SC.View.design({
      layout: { top: 0, bottom: 0, left: 0, right: 0 },
    
      childViews: 'innerHelp'.w(),
      innerHelp: SC.ScrollView.design(Multivio.innerGradientThinTopBottom, {
        layout: { top: 2, bottom: 2, left: 2, right: 2 },
        borderStyle: SC.BORDER_NONE,
        hasHorizontalScroller: NO,
        //contentView: SC.StaticContentView.design({
        contentView: SC.LabelView.design({
          layout: {top: 2, right: 2, width: 280},
          classNames: "help-panel",
          escapeHTML: NO,
          isTextSelectable: YES,
          useStaticLayout: YES,
          //content: ''
          value: ''
              +'<h1>' + '_helpTitle'.loc() + '</h1>'
              + '_helpIntro'.loc()
              + '<h3>' + '_helpContentsTitle'.loc() + '</h3>'
              + '<ul>'
              + '<li>' + '_helpVerticalBar'.loc() + '</li>'
              + '<li>' + '_helpNavigationBar'.loc() + '</li>'
              + '<li>' + '_mouseActionsTitle'.loc() + '</li>'
              + '<li>' + '_keyShortcutsTitle'.loc() + '</li>'
              + '</ul>'
              + '<h3 id="helpVerticalBar">1. ' + '_helpVerticalBar'.loc() + '</h3>'
              + '<img class="help-image" style= "" src="' + sc_static("images/icons/24x24/search_dark_24x24.png") + '"/><div class="help-text">' + '_helpSearch'.loc() + '</div>'
              + '<img class="help-image" style= "" src="' + sc_static("images/icons/24x24/tree_dark_24x24.png") + '"/><div class="help-text">' + '_helpToc'.loc() + '</div>'
              + '<img class="help-image" style= "" src="' + sc_static("images/icons/24x24/thumbnails_dark_24x24.png") + '"/><div class="help-text">' + '_helpThum'.loc() + '</div>'
              + '<img class="help-image" style= "" src="' + sc_static("images/icons/24x24/download_dark_24x24.png") + '"/><div class="help-text">' + '_helpDownload'.loc() + '</div>'
              + '<img class="help-image" style= "" src="' + sc_static("images/icons/24x24/show_toolbar_dark_24x24.png") + '"/><div class="help-text">' + '_helpDisplayBar'.loc() + '</div>'
              + '<h3 id="helpNavigationBar">2. ' + '_helpNavigationBar'.loc() + '</h3>'
              + '<p>' + '_helpNavigationBarDesc'.loc() + '<p/>'
              + '<img class="help-image" style= "" src="' + sc_static("images/icons/24x24/loupe_dark_24x24.png") + '"/><div class="help-text">' + '_helpLoupe'.loc() + '</div>'
              + '<img class="help-image" style= "" src="' + sc_static("images/icons/24x24/rotate_left_dark_24x24.png") + '"/>'
              + '<img class="help-image" style= "" src="' + sc_static("images/icons/24x24/rotate_right_dark_24x24.png") + '"/><div class="help-text">' + '_helpRotation'.loc() + '</div>'
              + '<img class="help-image" style= "" src="' + sc_static("images/icons/24x24/jump_backwards_dark_24x24.png") + '"/>'
              + '<img class="help-image" style= "" src="' + sc_static("images/icons/24x24/go_backwards_dark_24x24.png") + '"/>'
              + '<img class="help-image" style= "" src="' + sc_static("images/icons/24x24/go_forward_dark_24x24.png") + '"/>'
              + '<img class="help-image" style= "" src="' + sc_static("images/icons/24x24/jump_forward_dark_24x24.png") + '"/><div class="help-text">' + '_helpNavigation'.loc() + '</div>'
              + '<img class="help-image" style= "" src="' + sc_static("images/icons/24x24/zoom_minus_dark_24x24.png") + '"/>'
              + '<img class="help-image" style= "" src="' + sc_static("images/icons/24x24/zoom_plus_dark_24x24.png") + '"/><div class="help-text">' + '_helpZoom'.loc() + '</div>'
              + '<img class="help-image" style= "" src="' + sc_static("images/icons/24x24/full_size_dark_24x24.png") + '"/><div class="help-text">' + '_helpFullSize'.loc() + '</div>'
              + '<img class="help-image" style= "" src="' + sc_static("images/icons/24x24/full_width_dark_24x24.png") + '"/><div class="help-text">' + '_helpFullWidth'.loc() + '</div>'
              + '<img class="help-image" style= "" src="' + sc_static("images/icons/24x24/100_percent_dark_24x24.png") + '"/><div class="help-text">' + '_helpNativeSize'.loc() + '</div>'
              + '<h3 id="mouseActions">3. ' + '_mouseActionsTitle'.loc() + '</h3>'
              + '<p>' + '_mouseActions'.loc('<img class="" style= "" src="' + sc_static("images/icons/24x24/pan_dark_24x24.png") + '"/>') + '</p>'
              + '<h3 id="keyShortcuts">4. ' + '_keyShortcutsTitle'.loc() + '</h3>'
              + '<p>' + '_keyShortcuts'.loc() + '</p>',
          isVisibleInWindowDidChange: function () {
            // force the parent scroll view to update each time the palette is reopened
            if (this.get('isVisibleInWindow')) this.viewDidResize();
          }.observes('isVisibleInWindow')
        })
      })
    })
  }),
  
  /**
    Footer view
  */
  footerView: SC.View.design({
    layout: { top: 10, bottom: 0, left: 0, right: 0 },
    childViews: 'metadataView themeSelectionView logoMvoView'.w(),

    metadataView: SC.View.design({
      layout: { top: 0, bottom: 0, left: 0, right: 230 },

      childViews: [
        SC.LabelView.design({
          layout: { top: 5, height: 20, left: 0 },
          isTextSelectable: YES,
          tagName: 'span',
          classNames: 'metadata_primary',
          valueBinding: 'Multivio.metadataController.title',
          render: function (context, firstTime) {
            context.attr('title', Multivio.metadataController.title());
            sc_super();
          }
        })
      ]
    }).classNames(''.w()),

    themeSelectionView: SC.View.design({
      layout: { top: 0, bottom: 0, width: 72, right: 150 },
      isVisibleBinding: 'Multivio.layoutController.showThemeSelector',

      childViews: [
        SC.ButtonView.design({
          layout: { top: 0, bottom: 0, right: 48, width: 24 },
          toolTip: '_Change theme to white'.loc(),
          renderStyle: 'renderImage',
          icon: 'theme-button-white',
          theme: 'mvo-button',
          target: "Multivio.layoutController",
          action: "changeTheme",
          newTheme: 'mvo-white-theme'
        }),
        SC.ButtonView.design({
          layout: { top: 0, bottom: 0, right: 24, width: 24 },
          toolTip: '_Change theme to dark gray'.loc(),
          renderStyle: 'renderImage',
          icon: 'theme-button-dark-gray',
          theme: 'mvo-button',
          target: "Multivio.layoutController",
          action: "changeTheme",
          newTheme: 'mvo-dark-gray-theme'
        }),
        SC.ButtonView.design({
          layout: { top: 0, bottom: 0, right: 0, width: 24 },
          toolTip: '_Change theme to blue'.loc(),
          renderStyle: 'renderImage',
          icon: 'theme-button-blue',
          theme: 'mvo-button',
          target: "Multivio.layoutController",
          action: "changeTheme",
          newTheme: 'mvo-blue-theme'
        })
      ]
    }),

    /** 
      Logo of Multivio
    */
    logoMvoView: SC.View.design({
      layout: { top: 0, height: 31, right: 0, width: 100 },

      isTextSelectable: YES,
      childViews: [
        SC.View.design({
          layout:  { top: 0, height: 31, right: 0, left: 0 },
          childViews: [
            SC.ImageView.design({
              layout: { top: 0, height: 31, right: 0, width: 100 },
              classNames: 'multivio_logo',
              toolTip: '_Click to go to Multivio website.'.loc() + ' ' +
                '_Current client version:'.loc() + ' ' + Multivio.VERSION
            })
          ],
          render: function (context, firstTime) {
            context.push("<a href='https://www.multivio.org/' target='_blank'>");
            // add the version of the server in the tooltip
            var childView = this.get('childViews')[0];
            var toolTip = childView.get('toolTip');
            var serverVersion = Multivio.configurator.get('serverVersion');
            toolTip += ' ' + '_Current server version:'.loc() + ' ' + serverVersion;
            childView.set('toolTip', toolTip);
            this.renderChildViews(context, firstTime);
            context.push("</a>");
          }
        })
      ]
    })
  }),

  usageView: SC.View.design({
    layout: { top: 0, bottom: 0, left: 0, right: 0 },

    childViews: [
      SC.View.design({
        layout: { centerX: 0, centerY: 0, width: 700, height: 500 },
        childViews: [
          SC.LabelView.design({
            layout: { top: 50, bottom: 50, right: 50, left: 50 },
            classNames: 'mvo_info_full',
            contentBinding: 'Multivio.errorController',
            contentValueKey: 'usageText',
            escapeHTML: NO
          })
        ]
      }).classNames('mvo_info_full_background'.w())
    ]
  }).classNames('mvo_info_full shadow'.w()),
  
  errorView: SC.View.design({
    layout: { top: 0, bottom: 0, left: 0, right: 0 },

    childViews: [
      SC.View.design({
        layout: { centerX: 0, centerY: 0, width: 700, height: 400 },
        childViews: [
          SC.LabelView.design({
            layout: { top: 50, bottom: 50, right: 50, left: 50 },
            classNames: 'mvo_info_full',
            contentBinding: 'Multivio.errorController',
            contentValueKey: 'message',
            escapeHTML: NO
          })
        ]
      }).classNames('mvo_info_full_background'.w())
    ]
  }).classNames('mvo_info_full shadow'.w()),

  waitingView: SC.View.design({
    childViews: [
      SC.View.design({
        layout: { centerX: 0, centerY: 0, width: 500, height: 300 },
        //layout: { top: 200, bottom: 200, left: 200, right: 200 },
        classNames: 'mvo-pane loading'.w(),
        childViews: [
          SC.LabelView.design({
            layout: { centerX: 0, centerY: -33, width: 230, height: 33 },
            classNames: 'mvo-pane loading'.w(),
            tagName: 'div',
            value: '<h3>Fetching data...</h3>',
            escapeHTML: NO
          }),
          SC.ImageView.design({
            layout: { centerX: 0, centerY: 50, width: 36, height: 36 },
            value: static_url('images/progress_wheel_medium.gif'),
            classNames: ['mvo_info_full_progress']
          })
        ]
      })
    ]
  }),

  blankPane: SC.View.design({
    layout: { top: 0, bottom: 0, left: 0, right: 0 },
    classNames: 'blank-bg'.w()
  })

});

Multivio.waitingPane = SC.PanelPane.create({
  layout: { width: 500, height: 250, centerX: 0, centerY: 0 },

  contentView: SC.View.extend({
    childViews: [
      SC.LabelView.design({
        layout: { centerX: 0, centerY: -33, width: 230, height: 33 },
        classNames: 'mvo-pane sc-large-size'.w(),
        value: 'Fetching data...'
      }),
      SC.ImageView.design({
        layout: { centerX: 0, centerY: 50, width: 36, height: 36 },
        value: static_url('images/progress_wheel_medium.gif'),
        classNames: 'mvo_info_full_progress'.w()
      })
    ]
  }).classNames('mvo-pane'.w())
});


Multivio.newErrorPane = SC.PanelPane.create({
  layout: { centerX: 0, centerY: 0, width: 700, height: 400 },
  contentView: SC.View.design({
    layout: { top: 0, bottom: 0, right: 0, left: 0 },
    classNames: 'mvo_info_full',
    childViews: [
      SC.LabelView.extend({
        layout: { top: 50, bottom: 50, right: 50, left: 50 },
        contentBinding: 'Multivio.errorController',
        contentValueKey: 'message',
        escapeHTML: NO
      }).classNames('mvo_info_full_background'.w())
    ]
  })
});
