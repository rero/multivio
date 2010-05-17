/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  This controller manages the behavior of the tree document Structure. 
  It depends on the master controller.

  @author che
  @extends SC.Object
  @since 0.1.1  
*/

Multivio.treeDispatcher = SC.Object.create(
/** @scope Multivio.treeDispatcher.prototype */ {

  /**
    Binds to the CDM.logicalStructure
    
    @binding {hash}
  */
  lS: null,
  //lSBinding: SC.Binding.oneWay('Multivio.CDM.logicalStructure'),
  pS: null,
  isTreeStructure: NO,
  //pSBinding: SC.Binding.oneWay('Multivio.CDM.physicalStructure')
  
  
  /**
    Initialize this controller and verify if the sub-model can be created. 
    The sub-model need to have the logical structure of the document.

    @param {String} url the current file url
  */
  initialize: function (url) {
    if (this.get('bindings').length !== 0) {
      this.reset();
    }
    this.bind('lS', 'Multivio.CDM.logicalStructure');
    var logStr = Multivio.CDM.getLogicalStructure(url);
    console.info('TDS: initialize logS = ' + logStr);
    if (logStr !== -1) {
      if (this.get('isTreeStructure')) {
        //Multivio.treeStructureController.updateTree(logStr);
        console.info('updateTree dans init');
        Multivio.treeController.updateTree(logStr);
      }
      else {
        console.info('createTree dans init');
        Multivio.treeController.initialize();
        Multivio.treeController._createTree(logStr, NO);
      }
    }
    console.info('TDS: bindins length = ' + this.get('bindings').length);
    Multivio.logger.info('documentStructure initialized');
  },
  
  reset: function () {
    var listOfBindings = this.get('bindings');
    console.info('TDS: bindins length init = ' + listOfBindings.length);
    for (var i = 0; i < listOfBindings.length; i++) {
      var oneBinding = listOfBindings[i];
      oneBinding.disconnect();
    }
    console.info('TDS: bindins length init2 = ' + this.get('bindings').length);   
    this.set('bindings', []);
  },
  
  /**
    CDM.logicalStructure has changed. Verify if we can create the sub-model.

    @observes logicalStructure
  */  
  logicalStructureDidChange: function () {
    console.info('TDS: logicalDidChange ' + this.get('lS'));
    if (!SC.none(this.get('lS'))) {
      var cf = Multivio.masterController.get('currentFile');
      if (!SC.none(cf)) {
        var logStr = this.get('lS')[cf];
        var logStrFCDM = Multivio.CDM.getLogicalStructure(cf);
        console.info('TDS: logstr have changed = ' + logStr + ' = ' + logStrFCDM);
        //if (logStr === logStrFCDM) {
        if (logStr !== -1) {
            //if logStr === undefined we need physicalStructure
          if (SC.none(logStr)) {
            console.info('TDS: reset binding');
            //this.set('bindings', []);
            this.reset();
            this.bind('pS',  'Multivio.CDM.physicalStructure');
            var phSt = Multivio.CDM.getPhysicalstructure(cf);
            console.info('TDS: physical = -1? ' + phSt);
            if (phSt !== -1) {
              console.info('PROB');
              
              //Multivio.treeStructure.initialize(phSt);
            }
          }
            //create tree
          else {
            if (this.get('isTreeStructure')) {
              //Multivio.treeStructureController.updateTree(logStr);
              Multivio.treeController.updateTree(logStr);
            }
            else {
              Multivio.treeController.initialize();
              Multivio.treeController._createTree(logStr, NO);
            }
          }
        }
        else {
          console.info('TDS: logical = -1');
        }
        //}
      }
    }
  }.observes('lS'),
  
  physicalStructureDidChange: function () {
    console.info('TDS: physicalDidChange ' + this.get('pS'));
    if (!SC.none(this.get('pS'))) {
      console.info('DEDANS------');
      var cf = Multivio.masterController.get('currentFile');
      if (!SC.none(cf)) {    
        var phStr = this.get('pS')[cf];
        var phSFCDM = Multivio.CDM.getPhysicalstructure(cf);
        console.info('TDS: phS changed = ' + phStr);
        if (phStr !== -1 && phStr === phSFCDM) {
          console.info('TDS: valid physicalStructure');
          var res = [];
          for (var i = 0; i < phStr.length; i++) {
            var oneEl = phStr[i];
            var oneLabel = {
              "file_position": {
                "url": oneEl.url
              }, 
              "label": oneEl.label
            };
            res.push(oneLabel);
          }
          //Multivio.treeStructureController.initialize();
          //Multivio.treeStructureController._createTree(res);
          Multivio.treeController.initialize();
          console.info('res length '+ res.length);
          Multivio.treeController._createTree(res, YES);          
          this.set('isTreeStructure', YES);
        }
        else {
          console.info('TDS: phS Probleme ' + phStr + ' ' + phSFCDM);
        }
      }
    }
  }.observes('pS')

});
