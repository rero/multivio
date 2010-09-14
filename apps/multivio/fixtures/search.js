/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

// examples of search results
Multivio.SearchController.FIXTURES = [
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
  }
];
