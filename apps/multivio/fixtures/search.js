/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

// examples of search results
Multivio.SearchController.FIXTURES = 
  
  {
    "label": 'comit\u00e9',
    "context": 'text',
    "file_position": {
      "url": "http://doc.rero.ch/lm.php?url=1000,10,38,20100803165622-EB/2008_-_Rapport_du_groupe_de_travail_du_cio_pour_acceptation_des_candidatures_-_fre.pdf", 
      "results": [
        {
          "index": {
            "bounding_box": {
              "y1": 138.0, 
              "x2": 195.0, 
              "x1": 120.0, 
              "y2": 161.0
            }, 
            "page": 1
          }, 
          "preview": "COMIT\u00c9 INTERNATION"
        }, 
        {
          "index": {
            "bounding_box": {
              "y1": 613.0, 
              "x2": 234.0, 
              "x1": 179.0, 
              "y2": 626.0
            }, 
            "page": 1
          }, 
          "preview": "DU COMIT\u00c9 INTERNATI"
        }, 
        {
          "index": {
            "bounding_box": {
              "y1": 582.0, 
              "x2": 272.0, 
              "x1": 234.0, 
              "y2": 593.0
            }, 
            "page": 5
          }, 
          "preview": "onales, des Comit\u00e9s Nationaux "
        }
      ]
    }
  };
  
  
  /*
  { 
    term:     'test1',
    context:  '... test1 shows that ...',
    position: {
      index:  1,
      type:   'search',
      url:    'http://url.com/file.pdf',
      current : {top: 111, left: 121, width: 43,  height: 6 },
      original: {top: 412, left: 449, width: 159, height: 27}
    } 
  },

  { 
    term:     'test2',
    context:  '... but for test2 it was not the case ...',
    position: {
      index:  1,
      type:   'search',
      url:    'http://url.com/file2.pdf',
      current : {top: 200, left: 145, width: 25, height: 6 },
      original: {top: 742, left: 540, width: 92, height: 27}
    } 
  },
  
  { 
    term:     'test3',
    context:  '... test3 was not sucessful ...',
    position: {
      index:  1,
      type:   'search',
      url:    'http://url.com/file3.pdf',
      current : {top: 81, left: 108, width: 69, height: 7 },
      original: {top: 299, left: 400, width: 256, height: 25}
    } 
  }*/

