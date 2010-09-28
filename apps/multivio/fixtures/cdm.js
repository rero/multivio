/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/
sc_require('models/cdm');

Multivio.CDM.FIXTURES = {
  metadata: {
    'VAA': {
      creator: ['Karl Pearson'],
      language: 'ang',
      mime: 'text/xml',
      title: 'The Problem of Practical Eugenics'
    },
    'http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-01-screen.gif': {
      mime: 'image/gif'
    }
  },
  logical: {
    'VAA': [
      {
        "file_position": {
          "index": null, 
          "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-01-screen.gif"
        }, 
        "label": "Front Matter"
      }, 
      {
        "file_position": {
          "index": null, 
          "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-01-screen.gif"
        }, 
        "label": "Cover"
      }, 
      {
        "file_position": {
          "index": null, 
          "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-03-screen.gif"
        }, 
        "label": "Title page"
      }, 
      {
        "file_position": {
          "index": null, 
          "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-04-screen.gif"
        }, 
        "label": "Preliminaries"
      },
      {
        "file_position": {
          "index": null, 
          "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-05-screen.gif"
        }, 
        "label": "Preface"
      }, 
      {
        "file_position": {
          "index": null, 
          "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-07-screen.gif"
        }, 
        "label": "Body"
      }, 
      {
        "file_position": {
          "index": null, 
          "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-17-screen.gif"
        }, 
        "label": "Plate I"
      }, 
      {
        "file_position": {
          "index": null, 
          "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-19-screen.gif"
        }, 
        "label": "Plate II"
      },
      {
        "file_position": {
          "index": null, 
          "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-21-screen.gif"
        }, 
        "label": "Plate III"
      }, 
      {
        "file_position": {
          "index": null, 
          "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-29-screen.gif"
        }, 
        "label": "Plate IV"
      }, 
      {
        "file_position": {
          "index": null, 
          "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-51-screen.gif"
        }, 
        "label": "Back Matter"
      }, 
      {
        "file_position": {
          "index": null, 
          "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-51-screen.gif"
        }, 
        "label": "Preservation colophon"
      }          
    ]
  },
  physical: {
    'VAA': [
      {
        "label": "VAA1194-01-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-01-screen.gif"
      }, 
      {
        "label": "VAA1194-02-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-02-screen.gif"
      }, 
      {
        "label": "VAA1194-03-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-03-screen.gif"
      }, 
      {
        "label": "VAA1194-04-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-04-screen.gif"
      }, 
      {
        "label": "VAA1194-05-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-05-screen.gif"
      }, 
      {
        "label": "VAA1194-06-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-06-screen.gif"
      }, 
      {
        "label": "VAA1194-07-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-07-screen.gif"
      }, 
      {
        "label": "VAA1194-08-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-08-screen.gif"
      }, 
      {
        "label": "VAA1194-09-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-09-screen.gif"
      }, 
      {
        "label": "VAA1194-10-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-10-screen.gif"
      }, 
      {
        "label": "VAA1194-11-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-11-screen.gif"
      }, 
      {
        "label": "VAA1194-12-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-12-screen.gif"
      }, 
      {
        "label": "VAA1194-13-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-13-screen.gif"
      }, 
      {
        "label": "VAA1194-14-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-14-screen.gif"
      }, 
      {
        "label": "VAA1194-15-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-15-screen.gif"
      }, 
      {
        "label": "VAA1194-16-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-16-screen.gif"
      }, 
      {
        "label": "VAA1194-17-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-17-screen.gif"
      }, 
      {
        "label": "VAA1194-18-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-18-screen.gif"
      }, 
      {
        "label": "VAA1194-19-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-19-screen.gif"
      }, 
      {
        "label": "VAA1194-20-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-20-screen.gif"
      }, 
      {
        "label": "VAA1194-21-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-21-screen.gif"
      }, 
      {
        "label": "VAA1194-22-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-22-screen.gif"
      }, 
      {
        "label": "VAA1194-23-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-23-screen.gif"
      }, 
      {
        "label": "VAA1194-24-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-24-screen.gif"
      }, 
      {
        "label": "VAA1194-25-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-25-screen.gif"
      }, 
      {
        "label": "VAA1194-26-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-26-screen.gif"
      }, 
      {
        "label": "VAA1194-27-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-27-screen.gif"
      }, 
      {
        "label": "VAA1194-28-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-28-screen.gif"
      }, 
      {
        "label": "VAA1194-29-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-29-screen.gif"
      }, 
      {
        "label": "VAA1194-30-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-30-screen.gif"
      }, 
      {
        "label": "VAA1194-31-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-31-screen.gif"
      }, 
      {
        "label": "VAA1194-32-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-32-screen.gif"
      }, 
      {
        "label": "VAA1194-33-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-33-screen.gif"
      }, 
      {
        "label": "VAA1194-34-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-34-screen.gif"
      }, 
      {
        "label": "VAA1194-35-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-35-screen.gif"
      }, 
      {
        "label": "VAA1194-36-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-36-screen.gif"
      }, 
      {
        "label": "VAA1194-37-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-37-screen.gif"
      }, 
      {
        "label": "VAA1194-38-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-38-screen.gif"
      }, 
      {
        "label": "VAA1194-39-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-39-screen.gif"
      },             
      {
        "label": "VAA1194-40-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-40-screen.gif"
      }, 
      {
        "label": "VAA1194-41-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-41-screen.gif"
      }, 
      {
        "label": "VAA1194-42-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-42-screen.gif"
      }, 
      {
        "label": "VAA1194-43-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-43-screen.gif"
      }, 
      {
        "label": "VAA1194-44-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-44-screen.gif"
      }, 
      {
        "label": "VAA1194-45-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-45-screen.gif"
      }, 
      {
        "label": "VAA1194-46-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-46-screen.gif"
      }, 
      {
        "label": "VAA1194-47-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-47-screen.gif"
      }, 
      {
        "label": "VAA1194-48-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-48-screen.gif"
      }, 
      {
        "label": "VAA1194-49-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-49-screen.gif"
      }, 
      {
        "label": "VAA1194-50-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-50-screen.gif"
      }, 
      {
        "label": "VAA1194-51-screen.gif", 
        "url": "http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-51-screen.gif"
      }
    ]
  },
  size: {
    'VAA': {
      "/static/multivio/en/current/images/VAA/VAA1194-01-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-02-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-03-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-04-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-05-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-06-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-07-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-08-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-09-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-10-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-11-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-12-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-13-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-14-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-15-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-16-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-17-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-18-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-19-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-20-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-21-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-22-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-23-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-24-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-25-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-26-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-27-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-28-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-29-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-30-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-31-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-32-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-33-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-34-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-35-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-36-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-37-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-38-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-39-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-40-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-41-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-42-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-43-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-44-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-45-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-46-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-47-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-48-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-49-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-50-screen.gif": {
        "width": 1500,
        "height": 1500
      },
      "/static/multivio/en/current/images/VAA/VAA1194-51-screen.gif": {
        "width": 1500,
        "height": 1500
      }
    }
  }
};