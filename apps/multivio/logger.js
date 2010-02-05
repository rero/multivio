/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

//require('configurator');
//require('models/core_document_node');
 
/**
Define Log levels
*/
Multivio.LOG_ERROR = 40000;
Multivio.LOG_WARN = 30000;
Multivio.LOG_INFO = 20000;
Multivio.LOG_DEBUG = 10000;


/**
  @class
 
  Object logger.
 
  @author {che, fca, mmo}
  @extends {Object}
  @since {0.1.0}
*/
 
Multivio.logger = SC.Object.create(
/** @scope Multivio.logger.prototype */ {
 
  errorLogger: undefined,
  warningLogger: undefined,
  infoLogger: undefined,
  debugLogger: undefined,
 
  loggers: [],
 
  /**
    @method
 
    Initialize loggers, set level and add appender(s)

    We use 4 loggers => error, warning, info, debug; each one corresponds to a
    log level. The use of several loggers, one per log level, instead of a
    single global logger, is because log4js does not allow different appenders
    to receive different log levels.
  */
  init: function () {

    // force deactivation of console logging associated with Ajax loggging,
    // as done by Log4js (this overrides the last lines of code in log4js.js)
    var log4jsLogger = Log4js.getLogger("Log4js");
    log4jsLogger.setLevel(Log4js.Level.OFF);

    // initialize loggers by level
    this.errorLogger = Log4js.getLogger("error");
    this.errorLogger.setLevel(Log4js.Level.ERROR);
    this.loggers.push(this.errorLogger);
    
    this.warningLogger = Log4js.getLogger("warning");
    this.warningLogger.setLevel(Log4js.Level.WARN);
    this.loggers.push(this.warningLogger);
    
    this.infoLogger = Log4js.getLogger("info");
    this.infoLogger.setLevel(Log4js.Level.INFO);
    this.loggers.push(this.infoLogger);
    
    this.debugLogger = Log4js.getLogger("debug");
    this.debugLogger.setLevel(Log4js.Level.DEBUG);
    this.loggers.push(this.debugLogger);
 
    // create appenders according to the configuration in Multivio.CONFIG.log
    // (see file core.js)
    var appenders = Multivio.configurator.getPath('logParameters.log');
    for (var appender in appenders) {
      if (appenders.hasOwnProperty(appender)) {
        var level = Multivio.get(appenders[appender]);
        var appenderObject = undefined;
        switch (appender) {
        // TODO check if the ajax appender is removed in case a server is not available
        case 'ajax':
          appenderObject = new Log4js.AjaxAppender(
              Multivio.configurator.getPath('logParameters.logFile'));
          appenderObject.setLayout(new Log4js.BasicLayout());
          //appenderObject.setLayout(new Log4js.JSONLayout());
          break;
        case 'console' :
          appenderObject = new Log4js.ConsoleAppender(false);
          break;
        case 'browserConsole':
          appenderObject = new Log4js.BrowserConsoleAppender(true);
          break;
        }
        if (appenderObject) this._attachAppender(appenderObject, level);
      }
    }
    this.info('end of logger.init');
  },
  
  /**
    @method
 
    Attach the given appender to the appropriate log level logger
 
    It also attaches it to all log levels above it. For example, if log level =
    LOG_INFO, then the appender should also be attached to warningLogger and
    errorLogger.
 
    @private
    @param {Object} appender
    @param {Number} level
  */
  _attachAppender: function (appender, level) {
    for (var i = 0; i < this.loggers.length; i++) {
      var aLogger = this.loggers[i];
      if (aLogger.level.level >= level) {
        aLogger.addAppender(appender);
      }
    }
  },
  
  /**
    @method
    
    Create a log of error
    
    @param {String} message
  */
  error: function (message) {
    this.errorLogger.error(message);
  },

  /**
    @method
    
    Create a log of warning
    
    @param {String} message
  */ 
  warning: function (message) {
    this.warningLogger.warn(message);
  },
 
  /**
    @method
    
    Create a log of info
    
    @param {String} message
  */
  info: function (message) {
    this.infoLogger.info(message);
  },
 
  /**
    @method
    
    Create a log of debug
    
    @param {String} message
  */
  debug: function (message) {
    this.debugLogger.debug(message);
  },
 
  /**
    @method
    
    Create a log of logException
    
    @param {String} message
  */ 
  logException: function (ex, customMessage) {
    var exDetails = "\n\t{";
    for (var key in ex) {
      if (ex.hasOwnProperty(key)) {
        exDetails += "'%@': '%@',\n ".fmt(key, ex[key]);
      }
    }
    if (exDetails.length > 4) {
      // remove ", " at the end of last property
      exDetails = exDetails.substring(0, exDetails.length - 4);
    }
    exDetails += "}\n";
    this.error("Exception Caught %@ \"custom message\": \"%@\""
    .loc(exDetails, customMessage));
  }
 
});
