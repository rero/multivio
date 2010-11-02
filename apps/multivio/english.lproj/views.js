/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

sc_require('views/content');
sc_require('views/thumbnail');
sc_require('views/thumbnail_content');
sc_require('views/tree');
sc_require('views/file_button');
sc_require('views/metadata');

/**
  @class
  
  The main page object contains all views configuration
*/  
Multivio.views = SC.Page.design(
/** @scope Multivio.views.prototype */ {

  /**
    Main content view
  */
  mainContentView: SC.View.design({
    layout: { top: 0, bottom: 0, left: 0, right: 0 },
    acceptsFirstResponder: YES,
    isKeyResponder: YES,
    controllers: [ 'zoomController', 'navigationController',
        'imageController',  'treeController', 'thumbnailController'],
      
    childViews: 'bottomButtons leftButtons innerMainContent'.w(),
      
    bottomButtons: Multivio.FileButtonView.design({
      //layout: {bottom: 50, left: 0, height: 50},
      layout: {bottom: -40, centerX: 0, width: 850, height: 150},
      classNames: 'mvo-front-view',
      
      childViews: 'navigationView zoomView rotateView'.w(),
      
      //navigation
      navigationView: SC.View.design({
        layout: { centerX: 0, centerY: 0, width: 220, height: 24 },

        childViews: 'firstPageView previousPageView textPageView nextPageView lastPageView'.w(),

        firstPageView: SC.ButtonView.design({
          layout: { centerX: -90, centerY: 0, width: 40, height: 24 },
          titleMinWidth : 0,
          needsEllipsis: NO,
          toolTip: '_FirstPage'.loc(),
          icon: static_url('images/icons/beginning.png'),
          isEnabledBinding: "Multivio.navigationController.isPreviousEnabled",
          target: "Multivio.navigationController", 
          action: "goToFirstPage"
        }),

        previousPageView: SC.ButtonView.design({
          layout: { centerX: -45, centerY: 0,  width: 40, height: 24 },
          titleMinWidth : 0,
          needsEllipsis: NO,
          toolTip: '_PreviousPage'.loc(),
          icon: static_url('images/icons/previous.png'),
          isEnabledBinding: "Multivio.navigationController.isPreviousEnabled",
          target: "Multivio.navigationController", 
          action: "goToPreviousPage"
        }),    

        textPageView: SC.TextFieldView.design({ 
          layout: { centerX: 0, centerY: -1, width: 40, height: 24 },
          textAlign: SC.ALIGN_CENTER,
          valueBinding: 'Multivio.navigationController.currentPage',
          isEnabledBinding: 'Multivio.navigtionController.isCurrentPageEnabled'
        }),

        nextPageView: SC.ButtonView.design({
          layout: { centerX: 45, centerY: 0, width: 40, height: 24 },
          titleMinWidth : 0,
          needsEllipsis: NO,
          toolTip: '_NextPage'.loc(),
          acceptsFirstResponder: YES,
          icon: static_url('images/icons/next.png'),
          isEnabledBinding: "Multivio.navigationController.isNextEnabled",
          target: "Multivio.navigationController", 
          action: "goToNextPage"
        }),

        lastPageView: SC.ButtonView.design({
          layout: { centerX: 90, centerY: 0, width: 40, height: 24 },
          titleMinWidth : 0,
          needsEllipsis: NO,
          toolTip: '_LastPage'.loc(),
          icon: static_url('images/icons/end.png'),
          isEnabledBinding: "Multivio.navigationController.isNextEnabled",
          target: "Multivio.navigationController", 
          action: "goToLastPage"
        })
      }),    

      //zoom
      zoomView: SC.View.design({
        layout: { centerX: 350, centerY: 0, width: 400, height: 24 },

        childViews: 'zoomOutPageView zoomInPageView zoomPredefinedView'.w(),

        zoomOutPageView: SC.ButtonView.design({
          layout: { centerX: -180, centerY: 0, width: 40, height: 24 },
          titleMinWidth : 0,
          needsEllipsis: NO,
          toolTip: '_Zoom-'.loc(),
          icon: static_url('images/icons/zoom-minus.png'),
          isEnabledBinding: "Multivio.zoomController.isZoomOutAllowed",
          target: "Multivio.zoomController", 
          action: "doZoomOut"
        }),

        zoomInPageView: SC.ButtonView.design({
          layout: { centerX: -135, centerY: 0, width: 40, height: 24 },
          titleMinWidth : 0,
          needsEllipsis: NO,
          toolTip: '_Zoom+'.loc(),
          icon: static_url('images/icons/zoom-plus.png'),
          isEnabledBinding: "Multivio.zoomController.isZoomInAllowed",
          target: "Multivio.zoomController", 
          action: "doZoomIn"
        }),

        zoomPredefinedView: SC.SegmentedView.design({
          layout: { left: 90, centerY: 0, width: 180, height: 24 },
          items: [
            {title: "Full", value: "Full", enabled: YES },
            {title: "Width", value: "Width", enabled: YES },
            {title: "Native", value: "Native", enabled: YES }
          ],
          itemTitleKey: 'title',
          itemValueKey: 'value',
          itemIsEnabledKey: 'enabled',
          valueBinding: "Multivio.zoomController.currentZoomState",
          //valueBinding: "Multivio.zoomController.toto",
          isEnabledBinding: 'Multivio.zoomController.isStateEnabled',
          target: "Multivio.zoomController",
          action: "setPredefinedZoom"
        })

      }),

      //rotate
      rotateView: SC.View.design({
        layout: { centerX: -190, centerY: 0, width: 90, height: 24 },
        layerId: "rotatePageId",

        childViews: 'rotateLeftView rotateRightView'.w(),

        rotateLeftView: SC.ButtonView.design({
          layout: { centerX: -25, centerY: 0, width: 40, height: 24 },
          layerId: "rotateLeftPageId",
          titleMinWidth : 0,
          needsEllipsis: NO,
          toolTip: '_RotateLeft'.loc(),
          icon: static_url('images/icons/rotate_left.png'),
          target: "Multivio.rotateController",
          isEnabledBinding: 'Multivio.rotateController.isLeftAllow', 
          action: "rotateLeft"
        }),

        rotateRightView: SC.ButtonView.design({
          layout: { centerX: 20, centerY: 0, width: 40, height: 24 },
          layerId: "rotateRightPageId",
          titleMinWidth : 0,
          needsEllipsis: NO,
          toolTip: '_RotateRight'.loc(),
          icon: static_url('images/icons/rotate_right.png'),
          target: "Multivio.rotateController",
          isEnabledBinding: 'Multivio.rotateController.isRigthAllow',
          action: "rotateRight"
        })
      })
    }),
    
    leftButtons: SC.View.design({
      layout: { top: 0, left: 5, bottom: 0, width: 40},
      //classNames: 'mvo-front-view',
      classNames: 'workspace_black',
      
      childViews: [
        SC.ButtonView.design({
          layout: { top: 10, centerX: 0, width: 35, height: 24 },
          titleMinWidth : 0,
          needsEllipsis: NO,
          name: 'metadata',
          toolTip: '_Metadata'.loc(),
          icon: static_url('images/icon/info.gif'),
          /*target: "Multivio.metadataController",
          action: "showMetadata"*/
          target: "Multivio.paletteController",
          action: "showMetadata"
        }),
        SC.ButtonView.design({
          layout: { top: 40, centerX: 0, width: 35, height: 24 },
          titleMinWidth : 0,
          needsEllipsis: NO,
          name: 'thumbnails',
          toolTip: '_Thumbnails'.loc(),
          icon: static_url('images/icon/movie.gif'),
          //target: "Multivio.thumbnailController",
          target: "Multivio.paletteController",
          action: "showThumbnails"
        }),
        SC.ButtonView.design({
          layout: { top: 70, centerX: 0, width: 35, height: 24 },
          titleMinWidth : 0,
          needsEllipsis: NO,
          name: 'tree',
          toolTip: '_Tree'.loc(),
          icon: static_url('images/icon/fs_tree_2.gif'),
          //target: "Multivio.treeController",
          target: "Multivio.paletteController",
          action: "showTree"
        })
      ]
    }),
    
    innerMainContent: Multivio.ContentView.design({
      layout: { top: 0, bottom: 0, left: 45, right: 0 },
      isFirstResponder: YES,
      acceptsFirstResponder: YES,
      isKeyResponder: YES,
      
      borderStyle: SC.BORDER_NONE,
      classNames: 'inner_content_view',

      contentView: SC.ImageView.design({
        layout: { top: 0, bottom: 0, centerX: 0, minWidth: 1 },
        useImageCache: NO
      }),
    }),
    render: function (context, firstTime) {
      if (context.needsContent) {
        this.renderChildViews(context, firstTime);
        context.push(
          "<div class='top-edge'></div>",
          "<div class='right-edge'></div>",
          "<div class='bottom-edge'></div>",
          "<div class='left-edge'></div>");
      }
    }
  }),
  
  /**
    Thumbnail view
  */
  thumbnailPalette: SC.PalettePane.design({
    layout: {width: 150},
    classNames: 'mvo-transparent',
    contentView: SC.View.design({
      layout: { top: 0, bottom: 0, left: 0, right: 0 },
      
      childViews: 'innerThumbnail'.w(),
      innerThumbnail: Multivio.ThumbnailView.design({
        layout: { top: 10, bottom: 10, left: 10, right: 10 },
        hasHorizontalScroller: NO,
        //classNames: 'mvo-transparent',
        borderStyle: SC.BORDER_NONE,

        contentView: SC.ListView.design({
          layout: { top: 0, bottom: 0, left: 0, right: 0 },
          insertionOrientation: SC.VERTICAL_ORIENTATION,
          rowHeight: 130,
          
          exampleView: Multivio.ThumbnailContentView,
          //useImageCache: NO,
          contentBinding: 'Multivio.thumbnailController.arrangedObjects',
          selectionBinding: 'Multivio.thumbnailController.selection'
        })
      }),
      render: function (context, firstTime) {
        if (context.needsContent) {
          this.renderChildViews(context, firstTime);
          context.push(
            "<div class='top-edge'></div>",
            "<div class='right-edge'></div>",
            "<div class='bottom-edge'></div>",
            "<div class='left-edge'></div>");
        }
      }
    })
    //}).classNames('shadow_light inner_view'.w()),
  }),
    
    
  thumbnailView: SC.View.design({
    layout: { top: 0, bottom: 0, left: 0, right: 0 },
    // add controller(s) need for this view
    controllers: ['thumbnailController'],
    
    childViews: 'innerThumbnail'.w(),
    innerThumbnail: Multivio.ThumbnailView.design({
      layout: { top: 10, bottom: 10, left: 10, right: 10 },
      hasHorizontalScroller: NO,
      borderStyle: SC.BORDER_NONE,

      contentView: SC.ListView.design({
        layout: { top: 0, bottom: 0, left: 0, right: 0 },
        insertionOrientation: SC.VERTICAL_ORIENTATION,
        rowHeight: 130,
        exampleView: Multivio.ThumbnailContentView,
        //useImageCache: NO,
        contentBinding: 'Multivio.thumbnailController.arrangedObjects',
        selectionBinding: 'Multivio.thumbnailController.selection'
      })
    }),
    render: function (context, firstTime) {
      if (context.needsContent) {
        this.renderChildViews(context, firstTime);
        context.push(
          "<div class='top-edge'></div>",
          "<div class='right-edge'></div>",
          "<div class='bottom-edge'></div>",
          "<div class='left-edge'></div>");
      }
    }
  }).classNames('shadow_light inner_view'.w()),

  /**
    Tree palette
  */
  treePalette: SC.PalettePane.design({
    classNames: 'mvo-transparent',
    contentView: SC.View.design({
      layout: { top: 0, bottom: 0, left: 0, right: 0 },
      childViews: 'innerTree '.w(),
      innerTree:  Multivio.TreeView.design({
        layout: { top: 10, bottom: 10, left: 10, right: 10 },
        borderStyle: SC.BORDER_NONE,

        contentView: SC.ListView.design({
          layout: { top: 0, bottom: 0, left: 0, right: 0 },
          rowHeight: 18,
          borderStyle: SC.BORDER_NONE,
          exampleView: Multivio.TreeLabelView,
          contentValueKey: 'label',
          contentBinding: 'Multivio.treeController.arrangedObjects',
          selectionBinding: 'Multivio.treeController.selection'
        })
      }),
      render: function (context, firstTime) {
        if (context.needsContent) {
          this.renderChildViews(context, firstTime);
          context.push(
            "<div class='top-edge'></div>",
            "<div class='right-edge'></div>",
            "<div class='bottom-edge'></div>",
            "<div class='left-edge'></div>");
        }
      }
    })
  }),

  treeView: SC.View.design({
    layout: { top: 0, bottom: 0, left: 0, right: 0 },
    // add controller(s) need for this view
    controllers: ['treeController'],
  }),
  
  
  metadataPalette: SC.PalettePane.design({
    isAnchored: YES,
    classNames: 'mvo-transparent',
    
    contentView: SC.View.design({
      layout: { top: 0, left: 0, bottom: 0, right: 0 },

      childViews: [
        SC.ListView.design({
          layout: { top:10, left:10, bottom: 10, right:10},
          exampleView: Multivio.Metadata,
        })
      ],
      render: function (context, firstTime) {
        if (context.needsContent) {
          this.renderChildViews(context, firstTime);
          context.push(
            "<div class='top-edge'></div>",
            "<div class='right-edge'></div>",
            "<div class='bottom-edge'></div>",
            "<div class='left-edge'></div>");
        }
      }
    })
  }),
  
  
  /**
    Logo of e-lib & rero
  */
  logoElib: SC.View.design({
    layout: { top: 0, height: 24, left: 6, width: 200 },

    childViews: [
      SC.View.design({
        layout: { top: 0, height: 32, right: 100, width: 100 },
        childViews: [
          SC.ImageView.design({
            layout: { top: 0, bottom: 0, left: 0, right: 0 },
            value: static_url('images/logo_rero_100x36_bw.png')
          })
        ],
        render: function (context, firstTime) {
          context.push("<a href='http://www.rero.ch/'>");
          this.renderChildViews(context, firstTime);
          context.push("</a>");
        }
      }),
      SC.View.design({
        layout: { top: 0, height: 32, right: 0, width: 80 },
        childViews: [
          SC.ImageView.design({
            layout: { top: 0, bottom: 0, left: 0, right: 0 },
            value: static_url('images/e-lib.ch_80x32_bw.png')
          })
        ],
        render: function (context, firstTime) {
          context.push("<a href='http://www.e-lib.ch/'>");
          this.renderChildViews(context, firstTime);
          context.push("</a>");
        }
      })
    ]
  }),
  
  /** 
    Logo of Multivio
  */
  logoMvoView: SC.View.design({
    layout: { top: 0, bottom: 0, left: 10, width: 160 },

    isTextSelectable: YES,
    childViews: [
      SC.ImageView.design({
        layout: { top: 0, left: 0, height: 35, width: 140 },
        value: static_url('images/multivio_logo_bw_beta_140x44.png'),
        toolTip: 'Go to Multivio website. Client release: ' + 
            Multivio.VERSION
      })
    ],
    render: function (context, firstTime) {
      context.push("<a href='https://www.multivio.org/'>");
      // add the version of the server in the tooltip
      var childView = this.get('childViews')[0];
      var toolTip = childView.get('toolTip');
      var sererVersion = Multivio.configurator.get('serverVersion');
      toolTip += ' & Server release: ' + sererVersion;
      childView.set('toolTip', toolTip);
      this.renderChildViews(context, firstTime);
      context.push("</a>");
    }
  }),

  /**
    Metadata view
  */
  headerView: SC.View.design({
    childViews: 'metadataView'.w(),

    metadataView: SC.View.design({
      layout: { top: 0, bottom: 0, right: 160 },

      childViews: [
        SC.LabelView.design({
          layout: { top: 2, height: 23, left: 0, right: 10 },
          isTextSelectable: YES,
          tagName: 'span',
          classNames: 'metadata_primary',
          contentBinding: 'Multivio.metadataController.descriptiveMetadataDictionary',
          contentValueKey: 'title'
        })
      ]
    }).classNames(''.w()),
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
