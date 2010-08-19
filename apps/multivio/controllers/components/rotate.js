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
    Binds to the masterController isLoadingContent property.
    
    This binding is used to enabled and disabled rotate buttons

    @binding {Boolean}
  */
  isLoadingContent: null,
  isLoadingContentBinding: 'Multivio.masterController.isLoadingContent',
  
  /**
    Boolean to enabled and disabled rotate Button
  */
  isRigthAllow: YES,
  isLeftAllow: YES,
  
  /**
    Set currentValue to 0
  */
  resetRotateValue: function () {
    //this.currentValue = 0;
    SC.RunLoop.begin();
    this.set('currentValue', 0);
    SC.RunLoop.end();
  },
  
  /**
    Change buttons status observing isLoadingContent property.
    
    @observes isLoadingContent
  */
  isLoadingContentDidChange: function () {
    var isLoadingContent = this.get('isLoadingContent');
    if (isLoadingContent) {
      // disabled
      this.set('isRigthAllow', NO);
      this.set('isLeftAllow', NO);
    }
    else {
      // enabled
      this.set('isRigthAllow', YES);
      this.set('isLeftAllow', YES);
    }  
  }.observes('isLoadingContent'),
  
  /**
    Rotate to the left
  */
  rotateLeft: function () {
    var current = this.get('currentValue');
    var rotateL = 0;
    if (current !== 270) {
      rotateL = current + 90;
    }
    SC.RunLoop.begin();
    this.set('isLoadingContent', YES);
    SC.RunLoop.end();
    this.set('currentValue', rotateL);
  },
  
  /**
    Rotate to the right
  */
  rotateRight: function () {
    var current = this.get('currentValue');
    var rotateR = 0;
    if (current !== -270) {
      rotateR = current - 90;
    }
    SC.RunLoop.begin();
    this.set('isLoadingContent', YES);
    SC.RunLoop.end();
    this.set('currentValue', rotateR);
  }
  
});