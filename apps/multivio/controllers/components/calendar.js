/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  This controller manages the behavior of the header view. The header view
  contains only metadata about the global document

  @author che
  @extends SC.ObjectController
  @since 1.0.0
*/

Multivio.calendarController = SC.ObjectController.create(
/** Multivio.calendarController.prototype */{
  /**
    Local variable used for the year
      - listOfYears = [{year: 1781, index: 0}, {year: 1782, index: },...]
      - selectedYear = {year: 1781, index: 0}
      - montsByYears = {1781: [{date: 2, url: 'http'}], 1782: [{date: 4, url: 'http'}]}
  */
  
  listOfYears: null,
  selectedYear: null,
  monthsByYears: null,
  
  isNextYearEnabled: YES,
  isPreviousYearEnabled: YES,
  
  /**
    Local variables used for the month
      - listOfMonths = [{month: 2, name: 'February', url: 'http', index:0}, ...]
      - selectedMonth = {month: 2, name: 'February', url: 'http', index:0}
  */
  listOfMonths: null,
  selectedMonth: null,
  
  isNextMonthEnabled: YES,
  isPreviousMonthEnabled: YES,
  
  /**
    Local variables used for days
    
      - listOfDays = [2, 5, 11, 13]
      - selectedDay = 2
      - urlsByDay = {2: 'http', 5: 'http'}
  */
  listOfDays: null,
  selectedDay: null,
  urlsByDay: null,
  
  /**
    Local variable used for binding
  */
  physical: null,
  //currentFile: null,
  
  /**
    Initialize this controller
  */
  initialize: function () {
    if (SC.none(this.get('listOfYears'))) {
      var ref = Multivio.CDM.getReferer();
      var logical = Multivio.CDM.getLogicalStructure(ref);
      var res = [];
      this.monthsByYears = {};
      for (var i = 0; i < logical.length; i++) {
        var newY = {};
        newY.year = logical[i].label;
        newY.index = i + ''; 
        res.push(newY);
      
        var children = logical[i].childs;
        var monthsToAdd = [];
        for (var j = 0; j < children.length; j++) {
          var oneMonth = {};
          oneMonth.date = children[j].label;
          oneMonth.url = children[j].file_position.url;
          monthsToAdd.push(oneMonth);
        }
        this.monthsByYears[logical[i].label] = monthsToAdd;
      } 
      this.set('listOfYears', res);
      this.set('selectedYear', res[0]);
    }
  },
  
  /**
    SelectedDay has change retreive the list of month, select the first one
    and enabled/disabled buttons for year 
    
    @observes selectedYear
  */
  selectedYearDidChange: function () {
    var currentYear = this.get('selectedYear');
    if (!SC.none(currentYear)) {
      // set listOfMonths
      var listOfM = this.monthsByYears[currentYear.year];
      var res = [];
      
      for (var j = 0; j < listOfM.length; j++) {
        var newM = {};
        newM.month = listOfM[j].date;
        newM.name = this.getMonthName(listOfM[j].date);
        newM.url = listOfM[j].url;
        newM.index = j;
        res.push(newM);
      }
      
      this.set('listOfMonths', res);
      this.set('selectedMonth', res[0]);
      
      var index = parseInt(currentYear.index, 10);
      if (index === 0) {
        this.set('isPreviousYearEnabled', NO);
      }
      else {
        this.set('isPreviousYearEnabled', YES);
      }
      if (index === this.get('listOfYears').length - 1) {
        this.set('isNextYearEnabled', NO);
      }
      else {
        this.set('isNextYearEnabled', YES);
      }
    }
  }.observes('selectedYear'),
  
  /**
    Select the previous year
  */
  previousYear: function () {
    var currentYear = this.get('selectedYear');
    if (!SC.none(currentYear)) {
      var index = parseInt(currentYear.index, 10);
      index = index - 1;
      this.set('selectedYear', this.get('listOfYears')[index]);
    }
  },
  
  /**
    Select the next year
  */
  nextYear: function (button) {
    var currentYear = this.get('selectedYear');
    if (!SC.none(currentYear)) {
      var index = parseInt(currentYear.index, 10);
      index = index + 1;
      this.set('selectedYear', this.get('listOfYears')[index]);
    }
  },
  
  /**
    SelectedMonth did change. Retreive the list of the available days
    using the physical structure. Enabled/disabled month buttons.
  */
  selectedMonthDidChange: function () {
    var currentMonth = this.get('selectedMonth');
    if (!SC.none(currentMonth)) {
      this.selectedDay = null;
      var phys = Multivio.CDM.getPhysicalstructure(currentMonth.url);
      if (phys !== -1) {
        this.createListOfDays();
      }
      else {
        // create a binding
        this.bind('physical', SC.Binding.oneWay('Multivio.CDM.physicalStructure'));
      }
      var index = parseInt(currentMonth.index, 10);

      if (index === 0) {
        this.set('isPreviousMonthEnabled', NO);
      }
      else {
        this.set('isPreviousMonthEnabled', YES);
      }
      if (index === this.get('listOfMonths').length - 1) {
        this.set('isNextMonthEnabled', NO);
      }
      else {
        this.set('isNextMonthEnabled', YES);
      }
    }
  }.observes('selectedMonth'),
  
  /**
    Select previous month
  */
  previousMonth: function () {
    var currentMonth = this.get('selectedMonth');
    if (!SC.none(currentMonth)) {
      var index = parseInt(currentMonth.index, 10);
      index = index - 1;
      this.set('selectedMonth', this.get('listOfMonths')[index]);
    }
  },
  
  /**
    Select next month
  */
  nextMonth: function () {
    var currentMonth = this.get('selectedMonth');
    if (!SC.none(currentMonth)) {
      var index = parseInt(currentMonth.index, 10);
      index = index + 1;
      this.set('selectedMonth', this.get('listOfMonths')[index]);
    }
  },
  
  /**
    Return the name of the month
    
    @param {Number} number the number of the month
    @return {String} the name of the month
  */
  getMonthName: function (number) {
    var monthName = '';
    switch (number) {
    case '1':
      monthName = 'January'.loc();
      break;
    case '2':
      monthName = 'February'.loc();
      break;
    case '3':
      monthName = 'March'.loc();
      break;
    case '4':
      monthName = 'April'.loc();
      break;
    case '5':
      monthName = 'Mai'.loc();
      break;
    case '6':
      monthName = 'June'.loc();
      break;
    case '7':
      monthName = 'July'.loc();
      break;
    case '8':
      monthName = 'August'.loc();
      break;
    case '9':
      monthName = 'September'.loc();
      break;
    case '10':
      monthName = 'October'.loc();
      break;
    case '11':
      monthName = 'November'.loc();
      break;
    case '12':
      monthName = 'December'.loc();
      break;
    }
    return monthName;  
  },
  
  /**
    A new physical structure has been received call the function 
    createListOfDays
  */
  physicalDidChange: function () {
    var phStr = this.get('physical');
    if (!SC.none(phStr)) {
      var list = phStr[this.get('selectedMonth').url];
      if (list !== -1) {
        this.createListOfDays();
      }
    }
  }.observes('physical'),
  
  /**
    Create the list of the available days for the seleted year and month
    and set if necessary the seletedDay
  */
  createListOfDays: function () {
    console.info('create');
    this.urlsByDay = {};
    var physicalSt = Multivio.CDM.getPhysicalstructure(this.get('selectedMonth').url);
    if (physicalSt !== -1) {
      var res = [];
      for (var j = 0; j < physicalSt.length; j++) {
        var lab = physicalSt[j].label;
        var list = lab.split('-');
        var dateDay = parseInt(list[2], 10);
        res.push(dateDay);
        this.urlsByDay[dateDay] = physicalSt[j].url;
      }
      this.set('listOfDays', res);
      if (SC.none(this.get('selectedDay'))) {
        this.set('selectedDay', res[0]);
      }
    }
  },
  
  /**
    SelectedDay did change, change the currentFile of the masterController
  
    TODO use currentFile binding
    @observes selectedDay
  */
  selectedDayDidChange: function () {
    var selected = this.get('selectedDay');
    var newFile = this.urlsByDay[selected];
    if (newFile !== Multivio.masterController.get('currentFile')) {
      Multivio.makeFirstResponder(Multivio.INIT);
      Multivio.sendAction('notAllowSelection');
      Multivio.masterController.zoomState = Multivio.zoomController.currentZoomState; 
      Multivio.masterController.set('currentFile', newFile);
    } 
  }.observes('selectedDay')
  
});
