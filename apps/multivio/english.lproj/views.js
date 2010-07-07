/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

//require('views/content');
//require('views/thumbnail');
//require('views/thumbnailContent');
//require('views/tree');

/**
  @class
  
  The main page object contains all views configuration
*/  
Multivio.views = SC.Page.design(
/** @scope Multivio.views.prototype */ {

  /**
    Title view
  */
  titleView: SC.LabelView.design({
    layout: { left: 20, top: 10 },
    classNames: '',
    tagName: 'h3',
    tooltip: 'This is the title',
    value: 'Multivio prototype Edge'
  }),

  /**
    Split View with tree and main content views
  */
  treeAndContentView: SC.SplitView.design({
    layoutDirection: SC.LAYOUT_HORIZONTAL,
    autoresizeBehavior: SC.RESIZE_BOTTOM_RIGHT,
    defaultThickness: 200,
    topLeftMinThickness: 100,
    topLeftMaxThickness: 2000,
    dividerThickness: 20,
    canCollapseViews: NO,

    //add controller(s) need for this view
    controllers: ['treeDispatcher', 'imageController'],

    topLeftView: SC.View.design({
      layout: { top: 0, bottom: 0, left: 0, right: 0 },
      childViews: [
        // this intermediate view level is required due to odd behavior of
        // the SplitdDivider view
        SC.View.design({
          layout: { top: 0, bottom: 0, left: 0, right: 0 },

          childViews: 'innerTree'.w(),
          innerTree: Multivio.TreeView.design({
            layout: { top: 10, bottom: 10, left: 10, right: 10 },
            borderStyle: SC.BORDER_NONE,

            contentView: SC.ListView.design({
              layout: { top: 0, bottom: 0, left: 0, right: 0 },
              rowHeight: 18,
              borderStyle: SC.BORDER_NONE,
              contentValueKey: 'label',
              exampleView: Multivio.TreeLabelView,
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
        }).classNames('shadow_light inner_view'.w())
      ]
    }),
    
    bottomRightView: SC.View.design({
      layout: { top: 0, bottom: 0, left: 0, right: 0 },
      childViews: [
        // this intermediate view level is required due to odd behavior of
        // the SplitdDivider view
        SC.View.design({
          layout: { top: 0, bottom: 0, left: 0, right: 0 },

          childViews: 'innerMainContent'.w(),
          innerMainContent: Multivio.ContentView.design({
            layout: { top: 10, bottom: 10, left: 10, right: 10 },
            borderStyle: SC.BORDER_NONE,

            contentView: SC.ImageView.design({
              layout: { top: 0, bottom: 0, centerX: 0, minWidth: 1 },
              useImageCache: NO
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
        }).classNames('inner_content_view'.w())
      ]
    })
  }),  

  /**
    Main content view
  */
  mainContentView: SC.View.design({
    layout: { top: 0, bottom: 0, left: 0, right: 0 },
    
    childViews: 'innerMainContent'.w(),
    innerMainContent: Multivio.ContentView.design({
      layout: { top: 10, bottom: 10, left: 10, right: 10 },
      borderStyle: SC.BORDER_NONE,

      contentView: SC.ImageView.design({
        layout: { top: 0, bottom: 0, centerX: 0, minWidth: 1 },
        useImageCache: NO
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
  }).classNames('inner_content_view'.w()),
  
  /**
    Thumbnail view
  */
  thumbnailView: SC.View.design({
    layout: { top: 0, bottom: 0, left: 0, right: 0 },
    //add controller(s) need for this view
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
    Tree view
  */
  treeView: SC.View.design({
    layout: { top: 0, bottom: 0, left: 0, right: 0 },
    //add controller(s) need for this view
    controllers: ['treeDispatcher'],
    
    childViews: 'innerTree'.w(),
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
  }).classNames('shadow_light inner_view'.w()),
  


  /**
    toolbar view
  */
  toolbar: SC.View.design({
    layout: { top: 0, bottom: 0, left: 0, right: 0 },
    //add controller(s) need for this view
    controllers: ['navigationController', 'zoomController'],
    
    childViews: 'navigationView zoomView rotateView logos'.w(),
    
    //navigation
    navigationView: SC.View.design({
      layout: { centerX: -5, centerY: 0, width: 180, height: 25 },

      childViews: 'firstPageView previousPageView textPageView nextPageView lastPageView'.w(),

      firstPageView: SC.ButtonView.design({
        layout: { centerX: -75, centerY: 0, width: 30, height: 25 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        icon: static_url('images/icons/beginning.png'),
        target: "Multivio.navigationController", 
        action: "goToFirstPage"
      }),
    
      previousPageView: SC.ButtonView.design({
        layout: { centerX: -40, centerY: 0,  width: 30, height: 25 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        icon: static_url('images/icons/previous.png'),
        target: "Multivio.navigationController", 
        action: "goToPreviousPage"
      }),    
    
      textPageView: SC.TextFieldView.design({ 
        layout: { centerX: 0, centerY: -1, width: 40, height: 20 },
        textAlign: SC.ALIGN_CENTER,
        hint: 'Page',
        valueBinding: 'Multivio.navigationController.currentPage',
        validator: 'Number'
      }),

      nextPageView: SC.ButtonView.design({
        layout: { centerX: 40, centerY: 0, width: 30, height: 25 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        icon: static_url('images/icons/next.png'),
        target: "Multivio.navigationController", 
        action: "goToNextPage"
      }),

      lastPageView: SC.ButtonView.design({
        layout: { centerX: 75, centerY: 0, width: 30, height: 25 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        icon: static_url('images/icons/end.png'),
        target: "Multivio.navigationController", 
        action: "goToLastPage"
      }),
    }),    
    
    //zoom
    zoomView: SC.View.design({
      layout: { centerX: 220, centerY: 0, width: 250, height: 25 },
      
      childViews: 'zoomOutPageView zoomInPageView zoomPredefinedView'.w(),
      
      zoomOutPageView: SC.ButtonView.design({
        layout: { centerX: -110, centerY: 0, width: 30, height: 25 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        icon: static_url('images/icons/zoom-minus.png'),
        isEnabledBinding: "Multivio.zoomController.isZoomOutAllow",
        target: "Multivio.zoomController", 
        action: "doZoomOut"
      }),
      
      zoomInPageView: SC.ButtonView.design({
        layout: { centerX: -75, centerY: 0, width: 30, height: 25 },
        titleMinWidth : 0,
        needsEllipsis: NO,
        icon: static_url('images/icons/zoom-plus.png'),
        isEnabledBinding: "Multivio.zoomController.isZoomInAllow",
        target: "Multivio.zoomController", 
        action: "doZoomIn"
      }),
      
      zoomPredefinedView: SC.SegmentedView.design({
        layout: { centerX: 30, centerY: 0, width: 160, height: 25},
        items: [
        {title: "Full", value:"Full", enabled: YES},
        {title: "Width", value: "Width", enabled: YES},
        {title: "Native", value: "Native", enabled: YES}
        ],
        itemTitleKey: 'title',
        itemValueKey: 'value',
        itemIsEnabledKey: 'enabled',
        valueBinding: "Multivio.zoomController.zoomState",
        target: "Multivio.zoomController",
        action: "setPredefinedZoom"
      })
      
    }),
    
    //rotate
    rotateView: SC.View.design({
      layout: { centerX: -130, centerY: 0, width: 70, height: 25 },
      layerId: "rotatePageId",
      
      childViews: 'rotateLeftView rotateRightView'.w(),
      
      rotateLeftView: SC.ButtonView.design({
        layout: { centerX: -20, centerY: 0, width: 30, height: 25 },
        layerId: "rotateLeftPageId",
        titleMinWidth : 0,
        needsEllipsis: NO,
        icon: static_url('images/icons/rotate_left.png'),
        target: "Multivio.rotateController", 
        action: "rotateLeft"
      }),
      
      rotateRightView: SC.ButtonView.design({
        layout: { centerX: 15, centerY: 0, width: 30, height: 25 },
        layerId: "rotateRightPageId",
        titleMinWidth : 0,
        needsEllipsis: NO,
        icon: static_url('images/icons/rotate_right.png'),
        target: "Multivio.rotateController", 
        action: "rotateRight"
      })
    
    }),
    
    logos: SC.View.design({
      layout: { top: 0, height: 36, right: 6, width: 200 },

      childViews: [
        SC.View.design({
          layout: { top: 0, height: 36, right: 100, width: 100 },
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
          layout: { top: 4, height: 32, right: 0, width: 80 },
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
    })
    
  }),

  /**
    Metadata view
  */
  headerView: SC.View.design({
    childViews: 'metadataView logoView'.w(),

    metadataView: SC.View.design({
      layout: { top: 0, bottom: 0, left: 0, right: 160 },

      childViews: [
        SC.LabelView.design({
          layout: { top: 10, height: 20, left: 10, right: 10 },
          isTextSelectable: YES,
          tagName: 'span',
          classNames: 'metadata_primary',
          contentBinding: 'Multivio.metadataController.descriptiveMetadataDictionary',
          contentValueKey: 'title'
        }),
        SC.LabelView.design({
          layout: { top: 31, height: 20, left: 10, right: 10 },
          isTextSelectable: YES,
          tagName: 'span',
          classNames: 'metadata_secondary',
          contentBinding: 'Multivio.metadataController.descriptiveMetadataDictionary',
          contentValueKey: 'creator'
        })
      ]
    }).classNames(''.w()),

    logoView: SC.View.design({
      layout: { top: 0, bottom: 0, right: 0, width: 160 },

      isTextSelectable: YES,
      childViews: [
        SC.ImageView.design({
          layout: { top: 10, height: 44, right: 6, width: 140 },
          value: static_url('images/multivio_logo_bw_beta_140x44'),
          toolTip: 'Go to Multivio website. Client release: ' + Multivio.VERSION
        })
      ],
      render: function (context, firstTime) {
        context.push("<a href='https://www.multivio.org/'>");
        this.renderChildViews(context, firstTime);
        context.push("</a>");
      }
    })
  }),

  usageView: SC.View.design({
    layout: { top: 0, bottom: 0, left: 0, right: 0 },

    childViews: [
      SC.LabelView.design({
        layout: { centerX: 0, centerY: 0, width: 700, height: 400 },
        classNames: 'mvo_info_full',
        contentBinding: 'Multivio.configurator',
        contentValueKey: 'usageText',
        escapeHTML: NO
      })
    ]
  }).classNames('mvo_info_full shadow'.w()),
  
  errorView: SC.View.design({
    layout: { top: 0, bottom: 0, left: 0, right: 0 },

    childViews: [  
      SC.LabelView.design({
        layout: { centerX: 0, centerY: 0, width: 700, height: 50 },
        classNames: 'mvo_info_full',
        contentBinding: 'Multivio.errorController.serverMessage',
        contentValueKey: 'errorCode',
        escapeHTML: NO
      }),
      SC.LabelView.design({
        layout: { centerX: 0, centerY: 50, width: 700, height: 50 },
        classNames: 'mvo_info_full',
        contentBinding: 'Multivio.errorController.serverMessage',
        contentValueKey: 'errorMessage',
        escapeHTML: NO
      })
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
