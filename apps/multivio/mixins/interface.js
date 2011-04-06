/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/


//////////////////////////////////////////////////////////////////////////////
// MIXINS FOR THE USER INTERFACE
//////////////////////////////////////////////////////////////////////////////


/**
  @namespace
  @mixin

  Adds an inner gradient to a view.

  @author mmo
  @extends SC.Object
  @since 0.3.0
*/
Multivio.innerGradient = {
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
};

/**
  @namespace
  @mixin

  Adds an inner gradient to a view, with thin top and bottom edges.

  @author dwy
  @extends SC.Object
  @since 0.3.0
*/
Multivio.innerGradientThinTopBottom = {
  render: function (context, firstTime) {
    if (context.needsContent) {
      this.renderChildViews(context, firstTime);
      context.push(
        "<div class='top-edge-thin'></div>",
        "<div class='right-edge-thin'></div>",
        "<div class='bottom-edge-thin'></div>",
        "<div class='left-edge-thin'></div>");
    }
  }
};

/**
  @namespace
  @mixin

  Applies an outer frame composed of segments to a view. It can be used for a
  gradient outer border or to make rounded boxes.
  
  +----+---------------+----+
  | tl |       t       | tr |
  +----+---------------+----+
  |    |               |    |
  | l  |               | r  |
  |    |               |    |
  +----+---------------+----+
  | bl |       b       | br |
  +-------------------------+
  

  @author mmo
  @extends SC.Object
  @since 0.3.0
*/
Multivio.outerGradient = {
  render: function (context, firstTime) {
    if (context.needsContent) {
      this.renderChildViews(context, firstTime);
      context.push(
        "<div class='outer-top-left-edge'></div>",
        "<div class='outer-top-edge'></div>",
        "<div class='outer-top-right-edge'></div>",
        "<div class='outer-right-edge'></div>",
        "<div class='outer-bottom-right-edge'></div>",
        "<div class='outer-bottom-edge'></div>",
        "<div class='outer-bottom-left-edge'></div>",
        "<div class='outer-left-edge'></div>");
    }
  }
};
