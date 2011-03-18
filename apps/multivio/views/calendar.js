// ==========================================================================
// Project: Calendar
// Copyright: ©2009 Martin Ottenwaelter
// ==========================================================================
/*globals Calendar */

/** @class

  A calendar view is composed of 4 views:
    - a view that represent the year
    - a view that represent the month
    - a view that represent the days
    TO DO implement this view
    - a view that represent the logical structure
  

  @author che
  @extends SC.View
  @since 1.0.0
*/
Multivio.CalendarView = SC.View.extend(
/** Multivio.CalendarView.prototype */ {
  
  classNames: 'calendar-view',

  /**
    Link to a controler of type SC.ObjectController.
  */
  calendarController: null,
  
  /**
    Local variable for children
  */
  year: null,
  month: null,
  day: null,
  //toc: null,

  /**
    Overwrite createChildView to create the calendarView
  */
  createChildViews: function () {
    var childViews = [];
    // first view for the year
    this.year = this.createChildView(
      SC.View.design({
        layout: {top: 5, left: 10, right: 10, height: 30},
        childViews: 'prevYear currentYear nextYear'.w(),

        prevYear: SC.ButtonView.design({
          layout: {top: 5, left: 5, width: 20, height: 20},
          titleMinWidth : 0,
          needsEllipsis: NO,
          toolTip : '_goToPrevious'.loc(),
          icon: 'go_backwards_new_16',
          theme: 'mvo-button',
          renderStyle: "renderImage",
          isEnabledBinding: '.parentView.parentView.calendarController.isPreviousYearEnabled',
          target: 'Multivio.calendarController',
          action: 'previousYear'
        }),
        currentYear: SC.SelectButtonView.design({
          layout: {top: 5, left: 35, right: 35, height: 25},
          objectsBinding: '.parentView.parentView.calendarController.listOfYears',
          valueBinding: '.parentView.parentView.calendarController.selectedYear',
          nameKey: 'year',
          theme: 'square',
          disableSort: YES,
          checkboxEnabled: YES,
          needsEllipsis: NO,
          supportFocusRing: NO
        }),
        nextYear: SC.ButtonView.design({
          layout: {top: 5, right: 5, width: 20, height: 20},
          titleMinWidth : 0,
          needsEllipsis: NO,
          toolTip : '_goToNext'.loc(),
          icon: 'go_forward_new_16',
          theme: 'mvo-button',
          renderStyle: "renderImage",
          isEnabledBinding: '.parentView.parentView.calendarController.isNextYearEnabled',
          target: "Multivio.calendarController",
          action: "nextYear"
        })
      })
    );
    childViews.push(this.year);
    // view for the month
    this.month = this.createChildView(
      SC.View.design({
        layout: {top: 35, left: 10, right: 10, height: 30},
        childViews: 'prevMonth currentMonth nextMonth'.w(),

        prevMonth: SC.ButtonView.design({
          layout: {top: 5, left: 5, width: 20, height: 20},
          titleMinWidth : 0,
          needsEllipsis: NO,
          toolTip : '_goToPrevious'.loc(),
          icon: 'go_backwards_new_16',
          theme: 'mvo-button',
          renderStyle: "renderImage",
          isEnabledBinding: '.parentView.parentView.calendarController.isPreviousMonthEnabled',
          target: "Multivio.calendarController",
          action: "previousMonth"
        }),
        currentMonth: SC.SelectButtonView.design({
          layout: {top: 5, left: 35, right: 35, height: 25},       
          objectsBinding: '.parentView.parentView.calendarController.listOfMonths',
          valueBinding: '.parentView.parentView.calendarController.selectedMonth',
          theme: 'square',
          nameKey: 'name',
          disableSort: YES,
          checkboxEnabled: YES,
          needsEllipsis: NO,
          supportFocusRing: NO
        }),
        nextMonth: SC.ButtonView.design({
          layout: {top: 5, right: 5, width: 20, height: 20},
          titleMinWidth : 0,
          needsEllipsis: NO,
          toolTip : '_goToNext'.loc(),
          icon: 'go_forward_new_16',
          theme: 'mvo-button',
          renderStyle: "renderImage",
          isEnabledBinding: '.parentView.parentView.calendarController.isNextMonthEnabled',
          target: "Multivio.calendarController",
          action: "nextMonth"
        })
      })
    );
    childViews.push(this.month);
    // the calendar
    this.day = this.createChildView(
      SC.View.design({
        layout: {top: 80, left: 80, height: 180},
        childViews: 'weekDays monthDays'.w(),

        weekDays: Multivio.WeekdaysView.design({
          layout: {top: 0, left: 0, height: 24}
        }),
        monthDays: Multivio.DaysView.design({
          layout: {top: 30, left: 0, height: 150} 
        })
      })
    );
    childViews.push(this.day);
    
    this.set('childViews', childViews);
  }
  
});

Multivio.WeekdaysView = SC.View.extend(
/** Multivio.WeekdaysView.prototype */ {
  
  classNames: 'calendar-weekdays-view',
  
  /**
    Override render method to create the list of the day of the week.
    
    @param {Object} context
    @param {Boolean} firstTime 
  */
  render: function (context, firstTime) {
    var day = SC.DateTime.create().get('lastMonday');
    for (var i = 0; i < 7; ++i) {
      context = context.begin('div').addClass('calendar-weekday').addStyle({
        position: 'absolute',
        width: '29px',
        left: 29 * i + 'px',
        top: '0px',
        bottom: '0px',
        textAlign: 'center'
      });
      context.push(day.toFormattedString('%a'));
      context = context.end();
      day = day.advance({day: 1});
    }
  }
  
});
  
Multivio.DaysView = SC.View.extend(
/** Multivio.DaysView.prototype */ {
  
  classNames: 'calendar-days-view',
  
  /**
    Override render method to create the label and the data for the table of 
    metadata
    
    @param {Object} context
    @param {Boolean} firstTime 
  */
  render: function (context, firstTime) {
    var selectedMonth = this.get('parentView').get('parentView').
        get('calendarController').get('selectedMonth');
    var selectedYear = this.get('parentView').get('parentView').
        get('calendarController').get('selectedYear');
    var listOfDays = this.get('parentView').get('parentView').
        get('calendarController').get('listOfDays');
    var selectedDay = this.get('parentView').get('parentView').
        get('calendarController').get('selectedDay');
    
    // create todayDate
    var today = SC.DateTime.create();
    var currentYear = today.get('year');
    var currentMonth = today.get('month');
    var diffYear = currentYear - selectedYear.year;
    var diffMonth = currentMonth - selectedMonth.month;
    
    var newDate = today.advance({ month: -diffMonth }).advance({year: -diffYear});
    var firstVisibleDay = newDate.adjust({day: 1});
    if (firstVisibleDay.get('dayOfWeek') !== 1) {
      firstVisibleDay = firstVisibleDay.get('lastMonday');
    }
    var day = firstVisibleDay.copy();
    // create the calendar  
    for (var i = 0; i < 42; ++i) {
      context = context.begin('div').addClass('calendar-day').addStyle({
        position: 'absolute',
        width: '29px',
        height: '24px',
        left: (29 * i % 203) + 'px',
        top: (parseInt(i / 7, 10) * 25) + 'px',
        textAlign: 'center'
      }).push(day.get('day'));
      // add class for currentMonth, listOfDays and selectedDay 
      if (day.get('month') === newDate.get('month')) {
        context.removeClass('not-current-month');
        var isContained = NO;
        for (var j = 0; j < listOfDays.length; j++) {
          if (listOfDays[j] === day.get('day')) {
            isContained = YES;
            break;
          }
        }
        
        if (isContained) {
          context.addClass('sel');
          if (day.get('day') === selectedDay) {
            context.addClass('selected');
          }
          else {
            context.removeClass('selected');
          }
        }
        else {
          context.removeClass('sel');
        }
      }
      else {
        context.addClass('not-current-month');
      }
      context = context.end();
      day = day.advance({day: 1});
    }
  },
  
  /**
    On mouse down retreive the target number and set it if necessary
    as the selectedDay
    
    @param {SC.Event} Event fired
  */
  mouseDown: function (evt) {
    var target = SC.$(evt.target);
    var i = target[0].innerHTML;
    if (target[0].classList.contains('sel')) {
      this.get('parentView').get('parentView').get('calendarController').
          set('selectedDay', parseInt(i, 10));
    }    
    return YES;
  },
  
  /**
    ListOfDays or selectedDay did change re-render the view
    
    @observes 
  */
  listOfDaysDidChange: function () {
    this.updateLayer();
  }.observes('.parentView.parentView.calendarController.listOfDays', 
      '.parentView.parentView.calendarController.selectedDay')
  
});