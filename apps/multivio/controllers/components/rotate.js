/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @class

  This controller is used to calculate the rotation angle.

  @author che
  @extends SC.ObjectController
  @since 0.2.0
*/
Multivio.rotateController = SC.ObjectController.create(
/** @scope Multivio.rotateController.prototype */ {

  /**
  The current rotation angle
  
  @property {Number}
  @default 0
  */
  currentValue: 0,
  
  /**
  Set currentValue to 0
  */
  resetRotateValue: function() {
    this.currentValue = 0;
  },
  
  /**
  Rotate to the left
  */
  rotateLeft: function() {
    var current = this.get('currentValue');
    var rotateL = 0;
    if (current !== 270) {
      rotateL = current + 90;
    }
    this.set('currentValue', rotateL);
  },
  
  /**
  Rotate to the right
  */
  rotateRight: function() {
    var current = this.get('currentValue');
    var rotateR = 0;
    if (current !== -270) {
      rotateR = current - 90;
    }
    this.set('currentValue', rotateR);
  }
  
});