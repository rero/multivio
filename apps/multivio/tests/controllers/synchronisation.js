/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

module("Synchronisation between controllers", {

  setup: function () {
    var prop = {};
    prop.scenario = 'get';
    Multivio.initializer.set('inputParameters', prop);
    //load structure for http://doc.rero.ch/lm.php?url=1000,10,33,20091127115226-BM/FR_1599_01_EC435.pdf
    var url = 'http://doc.rero.ch/lm.php?url=1000,10,33,20091127115226-BM/FR_1599_01_EC435.pdf'
    Multivio.CDM.setReferer(url);
    stop(6000);
    // First request
    var req = SC.Request.getUrl("/server/metadata/get?url=http://doc.rero.ch/lm.php?url=1000,10,33,20091127115226-BM/FR_1599_01_EC435.pdf").json().notify(this, function() {
      ok(SC.typeOf(req.get('response')) !== SC.T_ERROR, "response of the metadata should not be an error");
      var jsonRes = req.get("body");
      var t2 = {};
      t2[url] = jsonRes;
      Multivio.CDM.fileMetadata = t2;
       
      // Second request
      var req_2 = SC.Request.getUrl("/server/structure/get_logical?url=http://doc.rero.ch/lm.php?url=1000,10,33,20091127115226-BM/FR_1599_01_EC435.pdf").json().notify(this, function() {
        ok(SC.typeOf(req_2.get('response')) !== SC.T_ERROR, "response of the logical structure should not be an error");
        var jsonRes_2 = req_2.get("body");
        var t22 = {};
        t22[url] = jsonRes_2;
        Multivio.CDM.logicalStructure = t22;
        
        // Third request
        var req_3 = SC.Request.getUrl("/server/structure/get_physical?url=http://doc.rero.ch/lm.php?url=1000,10,33,20091127115226-BM/FR_1599_01_EC435.pdf").json().notify(this, function() {
          ok(SC.typeOf(req_3.get('response')) !== SC.T_ERROR, "response of the physical structure should not be an error");
          var jsonRes_3 = req_3.get("body");
          var t23 = {};
          t23[url] = jsonRes_3;
          Multivio.CDM.physicalStructure = t23;
           
          // Fourth request
          var req_4 = SC.Request.getUrl("/server/document/get_size?page_nr=1&url=http://doc.rero.ch/lm.php?url=1000,10,33,20091127115226-BM/FR_1599_01_EC435.pdf").json().notify(this, function() {
            ok(SC.typeOf(req_4.get('response')) !== SC.T_ERROR, "response of the size should not be an error");
            var jsonRes_4 = req_4.get("body");
            var t24 = {};
            var n_url = 'page_nr=1&'+url;
            t24[n_url] = jsonRes_4;
            Multivio.CDM.imageSize =  t24;
             
            // initialize controllers and select first position
            SC.RunLoop.begin();
            Multivio.treeController.initialize(url);
            Multivio.imageController.initialize(url);
            Multivio.navigationController.initialize(url);
            Multivio.thumbnailController.initialize(url);
            Multivio.masterController.currentFile = url;
            Multivio.masterController.selectFirstPosition();
            SC.RunLoop.end();
             
            equals(Multivio.masterController.get('currentPosition'), 1, "should find currentPosition is 1");
            equals(Multivio.treeController.get('position'), 1, "should find position is 1");
            equals(Multivio.imageController.get('position'), 1, "should find position is 1");
            equals(Multivio.navigationController.get('currentPage'), 1, "should find currentPage is 1");
            equals(Multivio.thumbnailController.get('position'), 1, "should find position is 1");
             
            start();
          }).send();
        }).send();
      }).send();
    }).send();
  },
  
  teardown: function () {
    console.info('teardown');
  }
});

test("select page 2 using next page", function() {
  SC.RunLoop.begin();
  Multivio.navigationController.goToNextPage();
  SC.RunLoop.end();
  
  equals(Multivio.masterController.get('currentPosition'), 2, "should find currentPosition is 2");
  equals(Multivio.treeController.get('position'), 2, "should find position is 2");
  equals(Multivio.imageController.get('position'), 2, "should find position is 2");
  equals(Multivio.navigationController.get('currentPage'), 2, "should find currentPage is 2");
  equals(Multivio.thumbnailController.get('position'), 2, "should find position is 2");
});