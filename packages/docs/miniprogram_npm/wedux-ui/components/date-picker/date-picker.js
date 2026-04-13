import { format, monthDays } from '../../libs/tempo_1_0_0';

const pad = (n) => String(n).padStart(2, '0');

const QUARTER_LABELS = ['一季度 (1-3月)', '二季度 (4-6月)', '三季度 (7-9月)', '四季度 (10-12月)'];
const QUARTER_SHORT = ['一季度', '二季度', '三季度', '四季度'];

const RANGE_TYPES = ['daterange', 'datetimerange', 'monthrange', 'yearrange', 'quarterrange'];

const DEFAULT_FORMATS = {
  date: 'YYYY-MM-DD',
  datetime: 'YYYY-MM-DD HH:mm:ss',
  month: 'YYYY-MM',
  year: 'YYYY',
  daterange: 'YYYY-MM-DD',
  datetimerange: 'MM-DD HH:mm',
  monthrange: 'YYYY-MM',
  yearrange: 'YYYY',
  quarter: '',
  quarterrange: '',
  week: '',
};

const formField = require('../../behaviors/formField');

Component({
  behaviors: ['wx://form-field', formField],

  relations: {
    '../form-item/form-item': {
      type: 'ancestor',
    },
  },

  properties: {
    value: { type: null, value: null },
    type: { type: String, value: 'date' },
    placeholder: { type: String, value: '请选择日期' },
    disabled: { type: Boolean, value: false },
    readonly: { type: Boolean, value: false },
    size: { type: String, value: '' },
    status: { type: String, value: '' },
    clearable: { type: Boolean, value: false },
    format: { type: String, value: '' },
    weekStartsOn: { type: Number, value: 1 },
  },

  data: {
    _visible: false,
    _panelMode: 'date',
    _displayYear: 2024,
    _displayMonth: 0,
    _days: [],
    _weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    _monthLabels: [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月',
    ],
    _yearList: [],
    _yearRangeStart: 2020,
    _selectedYear: -1,
    _selectedMonth: -1,
    _selectedDay: -1,
    _panelTitle: '',
    _displayText: '',
    _timeHours: [],
    _timeMinutes: [],
    _timeSeconds: [],
    _timePickerValue: [0, 0, 0],

    // Range fields
    _isRange: false,
    _rangeStart: null,
    _rangeEnd: null,
    _activeEndpoint: 'start',
    _rangeStartText: '',
    _rangeEndText: '',
    _startTimePickerValue: [0, 0, 0],
    _endTimePickerValue: [0, 0, 0],

    // Quarter fields
    _quarterLabels: QUARTER_LABELS,
    _selectedQuarter: -1,
    _quarterList: [],

    // Week fields
    _selectedWeekStart: null,
    _selectedWeekEnd: null,

    // Month list for range types (objects with state)
    _monthList: [],
    // Year list for range types (objects with state)
    _yearObjList: [],
  },

  lifetimes: {
    attached() {
      this._initPanel();
    },
  },

  observers: {
    value() {
      this._syncFromValue();
    },
  },

  methods: {
    _isRangeType() {
      return RANGE_TYPES.includes(this.data.type);
    },

    _getDefaultFormat() {
      return this.data.format || DEFAULT_FORMATS[this.data.type] || 'YYYY-MM-DD';
    },

    _getQuarter(month) {
      return Math.floor(month / 3);
    },

    _formatQuarter(year, quarter) {
      return `${year}年${QUARTER_SHORT[quarter]}`;
    },

    _getWeekNumber(date) {
      const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
      const jan4 = new Date(d.getFullYear(), 0, 4);
      return (
        1 +
        Math.round(((d.getTime() - jan4.getTime()) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7)
      );
    },

    _getWeekRange(year, month, day) {
      const weekStartsOn = this.data.weekStartsOn;
      const d = new Date(year, month, day);
      const dow = d.getDay();
      const diff = (dow - weekStartsOn + 7) % 7;
      const start = new Date(year, month, day - diff);
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
      return { start, end };
    },

    _formatWeek(date) {
      const weekNum = this._getWeekNumber(date);
      return `${date.getFullYear()}年第${weekNum}周`;
    },

    _dateToObj(d) {
      return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
    },

    _compareDates(a, b) {
      if (!a || !b) return 0;
      if (a.year !== b.year) return a.year - b.year;
      if (a.month !== b.month) return a.month - b.month;
      return (a.day || 0) - (b.day || 0);
    },

    _isSameDate(a, b) {
      if (!a || !b) return false;
      return a.year === b.year && a.month === b.month && a.day === b.day;
    },

    _isBetweenDates(date, start, end) {
      if (!start || !end || !date) return false;
      return this._compareDates(date, start) > 0 && this._compareDates(date, end) < 0;
    },

    _isSameMonth(a, b) {
      if (!a || !b) return false;
      return a.year === b.year && a.month === b.month;
    },

    _isBetweenMonths(m, start, end) {
      if (!start || !end) return false;
      const mv = m.year * 12 + m.month;
      const sv = start.year * 12 + start.month;
      const ev = end.year * 12 + end.month;
      return mv > sv && mv < ev;
    },

    _isSameQuarter(a, b) {
      if (!a || !b) return false;
      return a.year === b.year && a.quarter === b.quarter;
    },

    _isBetweenQuarters(q, start, end) {
      if (!start || !end) return false;
      const qv = q.year * 4 + q.quarter;
      const sv = start.year * 4 + start.quarter;
      const ev = end.year * 4 + end.quarter;
      return qv > sv && qv < ev;
    },

    // ----- Init / Sync -----

    _initPanel() {
      const now = new Date();
      const { type } = this.data;
      const isRange = this._isRangeType();

      if (type === 'datetime' || type === 'datetimerange') {
        this._buildTimeColumns();
      }

      const panelMode = this._getInitialPanelMode();

      const weekDays =
        type === 'week' ? this._buildWeekDayHeaders() : ['日', '一', '二', '三', '四', '五', '六'];

      this.setData({
        _panelMode: panelMode,
        _displayYear: now.getFullYear(),
        _displayMonth: now.getMonth(),
        _yearRangeStart: now.getFullYear() - (now.getFullYear() % 10),
        _isRange: isRange,
        _weekDays: weekDays,
      });

      this._syncFromValue();
      this._buildPanel();
    },

    _getInitialPanelMode() {
      const { type } = this.data;
      if (type === 'month' || type === 'monthrange') return 'month';
      if (type === 'year' || type === 'yearrange') return 'year';
      if (type === 'quarter' || type === 'quarterrange') return 'quarter';
      return 'date';
    },

    _buildWeekDayHeaders() {
      const labels = ['日', '一', '二', '三', '四', '五', '六'];
      const { weekStartsOn } = this.data;
      if (weekStartsOn === 0) return labels;
      return [...labels.slice(weekStartsOn), ...labels.slice(0, weekStartsOn)];
    },

    _syncFromValue() {
      const { value, type } = this.data;
      const isRange = this._isRangeType();

      if (isRange) {
        this._syncRangeFromValue();
      } else if (type === 'quarter') {
        this._syncQuarterFromValue();
      } else if (type === 'week') {
        this._syncWeekFromValue();
      } else {
        this._syncSingleFromValue();
      }
      this._buildPanel();
    },

    _syncSingleFromValue() {
      const { value, type, _timeHours, _timeMinutes, _timeSeconds } = this.data;
      if (!value && value !== 0) {
        this.setData({
          _displayText: '',
          _selectedYear: -1,
          _selectedMonth: -1,
          _selectedDay: -1,
        });
        return;
      }
      const d = new Date(value);
      if (isNaN(d.getTime())) return;

      const fmt = this._getDefaultFormat();
      const updates = {
        _displayText: format(d, fmt),
        _selectedYear: d.getFullYear(),
        _selectedMonth: d.getMonth(),
        _selectedDay: d.getDate(),
        _displayYear: d.getFullYear(),
        _displayMonth: d.getMonth(),
      };

      if (type === 'year') {
        updates._yearRangeStart = d.getFullYear() - (d.getFullYear() % 10);
      }

      if (type === 'datetime' && _timeHours.length) {
        updates._timePickerValue = [
          _timeHours.indexOf(pad(d.getHours())),
          _timeMinutes.indexOf(pad(d.getMinutes())),
          _timeSeconds.indexOf(pad(d.getSeconds())),
        ];
      }

      this.setData(updates);
    },

    _syncQuarterFromValue() {
      const { value } = this.data;
      if (!value && value !== 0) {
        this.setData({ _displayText: '', _selectedQuarter: -1, _selectedYear: -1 });
        return;
      }
      const d = new Date(value);
      if (isNaN(d.getTime())) return;
      const quarter = this._getQuarter(d.getMonth());
      this.setData({
        _displayText: this._formatQuarter(d.getFullYear(), quarter),
        _selectedQuarter: quarter,
        _selectedYear: d.getFullYear(),
        _displayYear: d.getFullYear(),
      });
    },

    _syncWeekFromValue() {
      const { value } = this.data;
      if (!value && value !== 0) {
        this.setData({
          _displayText: '',
          _selectedWeekStart: null,
          _selectedWeekEnd: null,
          _selectedYear: -1,
        });
        return;
      }
      const d = new Date(value);
      if (isNaN(d.getTime())) return;
      const range = this._getWeekRange(d.getFullYear(), d.getMonth(), d.getDate());
      this.setData({
        _displayText: this._formatWeek(d),
        _selectedWeekStart: this._dateToObj(range.start),
        _selectedWeekEnd: this._dateToObj(range.end),
        _selectedYear: d.getFullYear(),
        _displayYear: d.getFullYear(),
        _displayMonth: d.getMonth(),
      });
    },

    _syncRangeFromValue() {
      const { value, type } = this.data;
      if (!Array.isArray(value) || value.length < 2) {
        this.setData({
          _displayText: '',
          _rangeStart: null,
          _rangeEnd: null,
          _rangeStartText: '',
          _rangeEndText: '',
        });
        return;
      }

      const startD = new Date(value[0]);
      const endD = new Date(value[1]);
      if (isNaN(startD.getTime()) || isNaN(endD.getTime())) return;

      const startObj = this._dateToObj(startD);
      const endObj = this._dateToObj(endD);

      let startText, endText;
      if (type === 'quarterrange') {
        const sq = this._getQuarter(startD.getMonth());
        const eq = this._getQuarter(endD.getMonth());
        startObj.quarter = sq;
        endObj.quarter = eq;
        startText = this._formatQuarter(startD.getFullYear(), sq);
        endText = this._formatQuarter(endD.getFullYear(), eq);
      } else {
        const fmt = this._getDefaultFormat();
        if (type === 'datetimerange') {
          startText = this._formatDatetimeRange(startD, endD, 'start');
          endText = this._formatDatetimeRange(startD, endD, 'end');
        } else {
          startText = format(startD, fmt);
          endText = format(endD, fmt);
        }
      }

      const updates = {
        _rangeStart: startObj,
        _rangeEnd: endObj,
        _rangeStartText: startText,
        _rangeEndText: endText,
        _displayText: `${startText} ~ ${endText}`,
        _displayYear: startD.getFullYear(),
        _displayMonth: startD.getMonth(),
      };

      if (type === 'yearrange') {
        updates._yearRangeStart = startD.getFullYear() - (startD.getFullYear() % 10);
      }

      if (type === 'datetimerange' && this.data._timeHours.length) {
        updates._startTimePickerValue = [
          this.data._timeHours.indexOf(pad(startD.getHours())),
          this.data._timeMinutes.indexOf(pad(startD.getMinutes())),
          this.data._timeSeconds.indexOf(pad(startD.getSeconds())),
        ];
        updates._endTimePickerValue = [
          this.data._timeHours.indexOf(pad(endD.getHours())),
          this.data._timeMinutes.indexOf(pad(endD.getMinutes())),
          this.data._timeSeconds.indexOf(pad(endD.getSeconds())),
        ];
      }

      this.setData(updates);
    },

    _formatDatetimeRange(startD, endD, which) {
      const d = which === 'start' ? startD : endD;
      const fmt = this.data.format || '';
      if (fmt) return format(d, fmt);
      const crossYear = startD.getFullYear() !== endD.getFullYear();
      if (crossYear) {
        return format(d, 'YY/MM/DD HH:mm');
      }
      return format(d, 'MM-DD HH:mm');
    },

    // ----- Build -----

    _buildPanel() {
      this._updatePanelTitle();
      const mode = this.data._panelMode;
      if (mode === 'date') this._buildCalendar();
      else if (mode === 'year') this._buildYearList();
      else if (mode === 'month') this._buildMonthList();
      else if (mode === 'quarter') this._buildQuarterList();
    },

    _buildCalendar() {
      const { _displayYear: year, _displayMonth: month, type } = this.data;
      const daysInMonth = monthDays(new Date(year, month, 1));
      const firstDay = new Date(year, month, 1).getDay();
      const weekStartsOn = type === 'week' ? this.data.weekStartsOn : 0;
      const adjustedFirstDay = (firstDay - weekStartsOn + 7) % 7;

      const today = new Date();
      const ty = today.getFullYear();
      const tm = today.getMonth();
      const td = today.getDate();

      const days = [];

      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = monthDays(new Date(prevYear, prevMonth, 1));

      for (let i = adjustedFirstDay - 1; i >= 0; i--) {
        const d = daysInPrevMonth - i;
        days.push(this._buildDayObj(prevYear, prevMonth, d, false, ty, tm, td));
      }

      for (let d = 1; d <= daysInMonth; d++) {
        days.push(this._buildDayObj(year, month, d, true, ty, tm, td));
      }

      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const remaining = 42 - days.length;
      for (let d = 1; d <= remaining; d++) {
        days.push(this._buildDayObj(nextYear, nextMonth, d, false, ty, tm, td));
      }

      this.setData({ _days: days });
    },

    _buildDayObj(year, month, day, isCurrentMonth, ty, tm, td) {
      const { type, _selectedYear: sy, _selectedMonth: sm, _selectedDay: sd } = this.data;
      const obj = {
        day,
        year,
        month,
        isCurrentMonth,
        isSelected: false,
        isToday: year === ty && month === tm && day === td,
        isRangeStart: false,
        isRangeEnd: false,
        isInRange: false,
      };

      const dateObj = { year, month, day };

      if (type === 'week') {
        const { _selectedWeekStart, _selectedWeekEnd } = this.data;
        if (_selectedWeekStart && _selectedWeekEnd) {
          obj.isRangeStart = this._isSameDate(dateObj, _selectedWeekStart);
          obj.isRangeEnd = this._isSameDate(dateObj, _selectedWeekEnd);
          obj.isInRange = this._isBetweenDates(dateObj, _selectedWeekStart, _selectedWeekEnd);
        }
      } else if (type === 'daterange' || type === 'datetimerange') {
        const { _rangeStart, _rangeEnd } = this.data;
        if (_rangeStart) {
          obj.isRangeStart = this._isSameDate(dateObj, _rangeStart);
        }
        if (_rangeEnd) {
          obj.isRangeEnd = this._isSameDate(dateObj, _rangeEnd);
        }
        if (_rangeStart && _rangeEnd) {
          obj.isInRange = this._isBetweenDates(dateObj, _rangeStart, _rangeEnd);
        }
      } else {
        obj.isSelected = year === sy && month === sm && day === sd;
      }

      return obj;
    },

    _buildMonthList() {
      const { type, _displayYear, _selectedMonth, _selectedYear, _rangeStart, _rangeEnd } =
        this.data;
      const isRange = type === 'monthrange';
      const labels = [
        '1月',
        '2月',
        '3月',
        '4月',
        '5月',
        '6月',
        '7月',
        '8月',
        '9月',
        '10月',
        '11月',
        '12月',
      ];
      const now = new Date();
      const list = labels.map((label, i) => {
        const mObj = { year: _displayYear, month: i };
        const item = {
          label,
          month: i,
          isSelected: false,
          isRangeStart: false,
          isRangeEnd: false,
          isInRange: false,
          isCurrent: _displayYear === now.getFullYear() && i === now.getMonth(),
        };
        if (isRange) {
          if (_rangeStart) item.isRangeStart = this._isSameMonth(mObj, _rangeStart);
          if (_rangeEnd) item.isRangeEnd = this._isSameMonth(mObj, _rangeEnd);
          if (_rangeStart && _rangeEnd)
            item.isInRange = this._isBetweenMonths(mObj, _rangeStart, _rangeEnd);
        } else {
          item.isSelected = _selectedYear === _displayYear && _selectedMonth === i;
        }
        return item;
      });
      this.setData({ _monthList: list });
    },

    _buildYearList() {
      const start = this.data._yearRangeStart;
      const { type, _selectedYear, _rangeStart, _rangeEnd } = this.data;
      const isRange = type === 'yearrange';
      const now = new Date();
      const list = [];
      for (let i = 0; i < 12; i++) {
        const y = start + i;
        const item = {
          year: y,
          isSelected: false,
          isRangeStart: false,
          isRangeEnd: false,
          isInRange: false,
          isCurrent: y === now.getFullYear(),
        };
        if (isRange) {
          if (_rangeStart) item.isRangeStart = _rangeStart.year === y;
          if (_rangeEnd) item.isRangeEnd = _rangeEnd.year === y;
          if (_rangeStart && _rangeEnd) {
            item.isInRange = y > _rangeStart.year && y < _rangeEnd.year;
          }
        } else {
          item.isSelected = _selectedYear === y;
        }
        list.push(item);
      }
      this.setData({ _yearList: list, _yearObjList: list });
    },

    _buildQuarterList() {
      const { type, _displayYear, _selectedQuarter, _selectedYear, _rangeStart, _rangeEnd } =
        this.data;
      const isRange = type === 'quarterrange';
      const now = new Date();
      const curQ = this._getQuarter(now.getMonth());
      const list = QUARTER_LABELS.map((label, i) => {
        const qObj = { year: _displayYear, quarter: i };
        const item = {
          label,
          quarter: i,
          isSelected: false,
          isRangeStart: false,
          isRangeEnd: false,
          isInRange: false,
          isCurrent: _displayYear === now.getFullYear() && i === curQ,
        };
        if (isRange) {
          if (_rangeStart) item.isRangeStart = this._isSameQuarter(qObj, _rangeStart);
          if (_rangeEnd) item.isRangeEnd = this._isSameQuarter(qObj, _rangeEnd);
          if (_rangeStart && _rangeEnd)
            item.isInRange = this._isBetweenQuarters(qObj, _rangeStart, _rangeEnd);
        } else {
          item.isSelected = _selectedYear === _displayYear && _selectedQuarter === i;
        }
        return item;
      });
      this.setData({ _quarterList: list });
    },

    _buildTimeColumns() {
      const hours = [];
      const minutes = [];
      const seconds = [];
      for (let i = 0; i < 24; i++) hours.push(pad(i));
      for (let i = 0; i < 60; i++) minutes.push(pad(i));
      for (let i = 0; i < 60; i++) seconds.push(pad(i));
      this.setData({ _timeHours: hours, _timeMinutes: minutes, _timeSeconds: seconds });
    },

    _updatePanelTitle() {
      const { _panelMode, _displayYear, _displayMonth, _yearRangeStart } = this.data;
      let title = '';
      if (_panelMode === 'date') {
        title = `${_displayYear}年${_displayMonth + 1}月`;
      } else if (_panelMode === 'month' || _panelMode === 'quarter') {
        title = `${_displayYear}年`;
      } else if (_panelMode === 'year') {
        title = `${_yearRangeStart} – ${_yearRangeStart + 11}`;
      }
      this.setData({ _panelTitle: title });
    },

    _getHeaderTitle() {
      const titles = {
        date: '选择日期',
        datetime: '选择日期时间',
        month: '选择月份',
        year: '选择年份',
        daterange: '选择日期范围',
        datetimerange: '选择日期时间范围',
        monthrange: '选择月份范围',
        yearrange: '选择年份范围',
        quarter: '选择季度',
        quarterrange: '选择季度范围',
        week: '选择周',
      };
      return titles[this.data.type] || '选择日期';
    },

    // ----- Handlers -----

    handleTap() {
      if (this._isDisabled() || this.data.readonly) return;
      const panelMode = this._getInitialPanelMode();

      const updates = { _panelMode: panelMode };
      if (this._isRangeType()) {
        updates._activeEndpoint = 'start';
      }

      this.setData(updates);
      this._buildPanel();
      this.setData({ _visible: true });
    },

    handlePrev() {
      const { _panelMode, _displayYear, _displayMonth, _yearRangeStart } = this.data;
      if (_panelMode === 'date') {
        let y = _displayYear;
        let m = _displayMonth - 1;
        if (m < 0) {
          m = 11;
          y--;
        }
        this.setData({ _displayYear: y, _displayMonth: m });
      } else if (_panelMode === 'month' || _panelMode === 'quarter') {
        this.setData({ _displayYear: _displayYear - 1 });
      } else if (_panelMode === 'year') {
        this.setData({ _yearRangeStart: _yearRangeStart - 12 });
      }
      this._buildPanel();
    },

    handleNext() {
      const { _panelMode, _displayYear, _displayMonth, _yearRangeStart } = this.data;
      if (_panelMode === 'date') {
        let y = _displayYear;
        let m = _displayMonth + 1;
        if (m > 11) {
          m = 0;
          y++;
        }
        this.setData({ _displayYear: y, _displayMonth: m });
      } else if (_panelMode === 'month' || _panelMode === 'quarter') {
        this.setData({ _displayYear: _displayYear + 1 });
      } else if (_panelMode === 'year') {
        this.setData({ _yearRangeStart: _yearRangeStart + 12 });
      }
      this._buildPanel();
    },

    handleTitleTap() {
      const { _panelMode, type } = this.data;
      // Types that lock panel mode
      if (['year', 'yearrange', 'month', 'monthrange', 'quarter', 'quarterrange'].includes(type))
        return;
      if (_panelMode === 'date') {
        this.setData({ _panelMode: 'month' });
      } else if (_panelMode === 'month') {
        this.setData({ _panelMode: 'year' });
      }
      this._buildPanel();
    },

    handleDayTap(e) {
      const { year, month, day } = e.currentTarget.dataset;
      const { type } = this.data;

      if (type === 'week') {
        this._handleWeekDayTap(year, month, day);
      } else if (type === 'daterange' || type === 'datetimerange') {
        this._handleRangeDayTap(year, month, day);
      } else {
        this.setData({
          _selectedYear: year,
          _selectedMonth: month,
          _selectedDay: day,
          _displayYear: year,
          _displayMonth: month,
        });
        this._buildCalendar();
      }
    },

    _handleWeekDayTap(year, month, day) {
      const range = this._getWeekRange(year, month, day);
      this.setData({
        _selectedWeekStart: this._dateToObj(range.start),
        _selectedWeekEnd: this._dateToObj(range.end),
        _displayYear: year,
        _displayMonth: month,
      });
      this._buildCalendar();
    },

    _handleRangeDayTap(year, month, day) {
      const { _rangeStart, _rangeEnd, _activeEndpoint } = this.data;
      const tapped = { year, month, day };

      if (_activeEndpoint === 'start') {
        this.setData({
          _rangeStart: tapped,
          _rangeEnd: null,
          _activeEndpoint: 'end',
          _rangeStartText: format(new Date(year, month, day), 'YYYY-MM-DD'),
          _rangeEndText: '',
          _displayYear: year,
          _displayMonth: month,
        });
      } else {
        // Selecting end
        if (_rangeStart && this._compareDates(tapped, _rangeStart) < 0) {
          // Before start -> reset start
          this.setData({
            _rangeStart: tapped,
            _rangeEnd: null,
            _activeEndpoint: 'end',
            _rangeStartText: format(new Date(year, month, day), 'YYYY-MM-DD'),
            _rangeEndText: '',
          });
        } else {
          this.setData({
            _rangeEnd: tapped,
            _rangeEndText: format(new Date(year, month, day), 'YYYY-MM-DD'),
          });
        }
      }
      this._buildCalendar();
    },

    handleMonthTap(e) {
      const month = e.currentTarget.dataset.month;
      const { type, _displayYear } = this.data;

      if (type === 'monthrange') {
        this._handleRangeMonthTap(_displayYear, month);
        return;
      }

      this.setData({ _selectedMonth: month, _displayMonth: month });
      if (type === 'month') {
        this.setData({ _selectedYear: _displayYear });
      } else {
        // Drill back to date mode
        this.setData({ _panelMode: 'date' });
        this._buildPanel();
        return;
      }
      this._updatePanelTitle();
      this._buildMonthList();
    },

    _handleRangeMonthTap(year, month) {
      const { _rangeStart, _activeEndpoint } = this.data;
      const tapped = { year, month };

      if (_activeEndpoint === 'start') {
        this.setData({
          _rangeStart: tapped,
          _rangeEnd: null,
          _activeEndpoint: 'end',
          _rangeStartText: format(new Date(year, month, 1), 'YYYY-MM'),
          _rangeEndText: '',
        });
      } else {
        if (_rangeStart) {
          const tappedVal = year * 12 + month;
          const startVal = _rangeStart.year * 12 + _rangeStart.month;
          if (tappedVal < startVal) {
            this.setData({
              _rangeStart: tapped,
              _rangeEnd: null,
              _activeEndpoint: 'end',
              _rangeStartText: format(new Date(year, month, 1), 'YYYY-MM'),
              _rangeEndText: '',
            });
          } else {
            this.setData({
              _rangeEnd: tapped,
              _rangeEndText: format(new Date(year, month, 1), 'YYYY-MM'),
            });
          }
        }
      }
      this._buildMonthList();
    },

    handleYearTap(e) {
      const year = e.currentTarget.dataset.year;
      const { type } = this.data;

      if (type === 'yearrange') {
        this._handleRangeYearTap(year);
        return;
      }

      this.setData({ _selectedYear: year, _displayYear: year });
      if (type === 'year') {
        // stay
      } else {
        const backMode = ['month', 'monthrange'].includes(type)
          ? 'month'
          : ['quarter', 'quarterrange'].includes(type)
            ? 'quarter'
            : 'date';
        this.setData({
          _panelMode: backMode,
          _yearRangeStart: year - (year % 10),
        });
      }
      this._buildPanel();
    },

    _handleRangeYearTap(year) {
      const { _rangeStart, _activeEndpoint } = this.data;

      if (_activeEndpoint === 'start') {
        this.setData({
          _rangeStart: { year },
          _rangeEnd: null,
          _activeEndpoint: 'end',
          _rangeStartText: `${year}`,
          _rangeEndText: '',
        });
      } else {
        if (_rangeStart && year < _rangeStart.year) {
          this.setData({
            _rangeStart: { year },
            _rangeEnd: null,
            _activeEndpoint: 'end',
            _rangeStartText: `${year}`,
            _rangeEndText: '',
          });
        } else {
          this.setData({
            _rangeEnd: { year },
            _rangeEndText: `${year}`,
          });
        }
      }
      this._buildYearList();
    },

    handleQuarterTap(e) {
      const quarter = e.currentTarget.dataset.quarter;
      const { type, _displayYear } = this.data;

      if (type === 'quarterrange') {
        this._handleRangeQuarterTap(_displayYear, quarter);
        return;
      }

      this.setData({
        _selectedQuarter: quarter,
        _selectedYear: _displayYear,
      });
      this._buildQuarterList();
    },

    _handleRangeQuarterTap(year, quarter) {
      const { _rangeStart, _activeEndpoint } = this.data;
      const tapped = { year, quarter };

      if (_activeEndpoint === 'start') {
        this.setData({
          _rangeStart: tapped,
          _rangeEnd: null,
          _activeEndpoint: 'end',
          _rangeStartText: this._formatQuarter(year, quarter),
          _rangeEndText: '',
        });
      } else {
        if (_rangeStart) {
          const tappedVal = year * 4 + quarter;
          const startVal = _rangeStart.year * 4 + _rangeStart.quarter;
          if (tappedVal < startVal) {
            this.setData({
              _rangeStart: tapped,
              _rangeEnd: null,
              _activeEndpoint: 'end',
              _rangeStartText: this._formatQuarter(year, quarter),
              _rangeEndText: '',
            });
          } else {
            this.setData({
              _rangeEnd: tapped,
              _rangeEndText: this._formatQuarter(year, quarter),
            });
          }
        }
      }
      this._buildQuarterList();
    },

    handleEndpointTap(e) {
      const endpoint = e.currentTarget.dataset.endpoint;
      this.setData({ _activeEndpoint: endpoint });
    },

    handleTimeChange(e) {
      const { type, _activeEndpoint } = this.data;
      if (type === 'datetimerange') {
        if (_activeEndpoint === 'start') {
          this.setData({ _startTimePickerValue: e.detail.value });
        } else {
          this.setData({ _endTimePickerValue: e.detail.value });
        }
      } else {
        this.setData({ _timePickerValue: e.detail.value });
      }
    },

    handleShortcut(e) {
      const action = e.currentTarget.dataset.action;
      const now = new Date();
      const { type } = this.data;

      if (action === 'today') {
        if (this._isRangeType()) {
          const todayObj = this._dateToObj(now);
          const todayFmt = format(now, 'YYYY-MM-DD');
          this.setData({
            _rangeStart: todayObj,
            _rangeEnd: todayObj,
            _rangeStartText: todayFmt,
            _rangeEndText: todayFmt,
            _displayYear: now.getFullYear(),
            _displayMonth: now.getMonth(),
          });
          this._buildCalendar();
        } else {
          this.setData({
            _selectedYear: now.getFullYear(),
            _selectedMonth: now.getMonth(),
            _selectedDay: now.getDate(),
            _displayYear: now.getFullYear(),
            _displayMonth: now.getMonth(),
          });
          this._buildCalendar();
        }
      } else if (action === 'thisWeek') {
        const range = this._getWeekRange(now.getFullYear(), now.getMonth(), now.getDate());
        this.setData({
          _selectedWeekStart: this._dateToObj(range.start),
          _selectedWeekEnd: this._dateToObj(range.end),
          _displayYear: now.getFullYear(),
          _displayMonth: now.getMonth(),
        });
        this._buildCalendar();
      } else if (action === 'thisMonth') {
        if (type === 'monthrange') {
          const mObj = { year: now.getFullYear(), month: now.getMonth() };
          this.setData({
            _rangeStart: mObj,
            _rangeEnd: mObj,
            _rangeStartText: format(now, 'YYYY-MM'),
            _rangeEndText: format(now, 'YYYY-MM'),
            _displayYear: now.getFullYear(),
          });
          this._buildMonthList();
        }
      } else if (action === 'thisYear') {
        if (type === 'yearrange') {
          const yObj = { year: now.getFullYear() };
          this.setData({
            _rangeStart: yObj,
            _rangeEnd: yObj,
            _rangeStartText: `${now.getFullYear()}`,
            _rangeEndText: `${now.getFullYear()}`,
            _yearRangeStart: now.getFullYear() - (now.getFullYear() % 10),
          });
          this._buildYearList();
        }
      } else if (action === 'thisQuarter') {
        const curQ = this._getQuarter(now.getMonth());
        if (type === 'quarterrange') {
          const qObj = { year: now.getFullYear(), quarter: curQ };
          this.setData({
            _rangeStart: qObj,
            _rangeEnd: qObj,
            _rangeStartText: this._formatQuarter(now.getFullYear(), curQ),
            _rangeEndText: this._formatQuarter(now.getFullYear(), curQ),
            _displayYear: now.getFullYear(),
          });
          this._buildQuarterList();
        } else {
          this.setData({
            _selectedQuarter: curQ,
            _selectedYear: now.getFullYear(),
            _displayYear: now.getFullYear(),
          });
          this._buildQuarterList();
        }
      } else if (action === 'now') {
        // For datetimerange - set current time for active endpoint
        const { _activeEndpoint, _timeHours, _timeMinutes, _timeSeconds } = this.data;
        const hIdx = _timeHours.indexOf(pad(now.getHours()));
        const mIdx = _timeMinutes.indexOf(pad(now.getMinutes()));
        const sIdx = _timeSeconds.indexOf(pad(now.getSeconds()));
        if (type === 'datetimerange') {
          if (_activeEndpoint === 'start') {
            this.setData({ _startTimePickerValue: [hIdx, mIdx, sIdx] });
          } else {
            this.setData({ _endTimePickerValue: [hIdx, mIdx, sIdx] });
          }
        } else {
          this.setData({ _timePickerValue: [hIdx, mIdx, sIdx] });
        }
      }
    },

    // ----- Confirm / Cancel / Clear -----

    handleConfirm() {
      const { type } = this.data;

      if (this._isRangeType()) {
        this._confirmRange();
      } else if (type === 'quarter') {
        this._confirmQuarter();
      } else if (type === 'week') {
        this._confirmWeek();
      } else {
        this._confirmSingle();
      }
    },

    _confirmSingle() {
      const {
        type,
        _selectedYear: sy,
        _selectedMonth: sm,
        _selectedDay: sd,
        _timePickerValue,
        _timeHours,
        _timeMinutes,
        _timeSeconds,
        _displayYear,
      } = this.data;

      let date;
      if (type === 'year') {
        if (sy < 0 && _displayYear > 0) {
          date = new Date(_displayYear, 0, 1);
        } else if (sy < 0) {
          this.setData({ _visible: false });
          return;
        } else {
          date = new Date(sy, 0, 1);
        }
      } else if (type === 'month') {
        if (sy < 0 || sm < 0) {
          this.setData({ _visible: false });
          return;
        }
        date = new Date(sy, sm, 1);
      } else if (type === 'datetime') {
        if (sy < 0 || sm < 0 || sd < 0) {
          this.setData({ _visible: false });
          return;
        }
        const h = parseInt(_timeHours[_timePickerValue[0]] || '0', 10);
        const m = parseInt(_timeMinutes[_timePickerValue[1]] || '0', 10);
        const s = parseInt(_timeSeconds[_timePickerValue[2]] || '0', 10);
        date = new Date(sy, sm, sd, h, m, s);
      } else {
        if (sy < 0 || sm < 0 || sd < 0) {
          this.setData({ _visible: false });
          return;
        }
        date = new Date(sy, sm, sd);
      }

      const ts = date.getTime();
      const fmt = this._getDefaultFormat();
      this.setData({
        _visible: false,
        _displayText: format(date, fmt),
        _selectedYear: date.getFullYear(),
        _selectedMonth: date.getMonth(),
        _selectedDay: date.getDate(),
      });
      this.triggerEvent('update:value', { value: ts });
      this.triggerEvent('confirm', { value: ts, formatted: format(date, fmt) });
      this._notifyChange();
    },

    _confirmQuarter() {
      const { _selectedQuarter, _selectedYear, _displayYear } = this.data;
      const year = _selectedYear >= 0 ? _selectedYear : _displayYear;
      const quarter = _selectedQuarter;
      if (quarter < 0) {
        this.setData({ _visible: false });
        return;
      }
      const date = new Date(year, quarter * 3, 1);
      const ts = date.getTime();
      const displayText = this._formatQuarter(year, quarter);
      this.setData({ _visible: false, _displayText: displayText });
      this.triggerEvent('update:value', { value: ts });
      this.triggerEvent('confirm', {
        value: ts,
        formatted: displayText,
        quarter: quarter + 1,
        year,
      });
      this._notifyChange();
    },

    _confirmWeek() {
      const { _selectedWeekStart } = this.data;
      if (!_selectedWeekStart) {
        this.setData({ _visible: false });
        return;
      }
      const s = _selectedWeekStart;
      const startDate = new Date(s.year, s.month, s.day);
      const ts = startDate.getTime();
      const displayText = this._formatWeek(startDate);
      const e = this.data._selectedWeekEnd;
      const endDate = new Date(e.year, e.month, e.day);

      this.setData({ _visible: false, _displayText: displayText });
      this.triggerEvent('update:value', { value: ts });
      this.triggerEvent('confirm', {
        value: ts,
        formatted: displayText,
        weekNumber: this._getWeekNumber(startDate),
        weekStart: ts,
        weekEnd: endDate.getTime(),
      });
      this._notifyChange();
    },

    _confirmRange() {
      const {
        type,
        _rangeStart,
        _rangeEnd,
        _startTimePickerValue,
        _endTimePickerValue,
        _timeHours,
        _timeMinutes,
        _timeSeconds,
      } = this.data;

      if (!_rangeStart) {
        this.setData({ _visible: false });
        return;
      }

      // If end not set, default to start
      const rangeEnd = _rangeEnd || _rangeStart;

      let startDate, endDate;

      if (type === 'daterange') {
        startDate = new Date(_rangeStart.year, _rangeStart.month, _rangeStart.day);
        endDate = new Date(rangeEnd.year, rangeEnd.month, rangeEnd.day);
      } else if (type === 'datetimerange') {
        const sh = parseInt(_timeHours[_startTimePickerValue[0]] || '0', 10);
        const smin = parseInt(_timeMinutes[_startTimePickerValue[1]] || '0', 10);
        const ss = parseInt(_timeSeconds[_startTimePickerValue[2]] || '0', 10);
        const eh = parseInt(_timeHours[_endTimePickerValue[0]] || '0', 10);
        const emin = parseInt(_timeMinutes[_endTimePickerValue[1]] || '0', 10);
        const es = parseInt(_timeSeconds[_endTimePickerValue[2]] || '0', 10);
        startDate = new Date(_rangeStart.year, _rangeStart.month, _rangeStart.day, sh, smin, ss);
        endDate = new Date(rangeEnd.year, rangeEnd.month, rangeEnd.day, eh, emin, es);
      } else if (type === 'monthrange') {
        startDate = new Date(_rangeStart.year, _rangeStart.month, 1);
        endDate = new Date(rangeEnd.year, rangeEnd.month, 1);
      } else if (type === 'yearrange') {
        startDate = new Date(_rangeStart.year, 0, 1);
        endDate = new Date(rangeEnd.year, 0, 1);
      } else if (type === 'quarterrange') {
        startDate = new Date(_rangeStart.year, (_rangeStart.quarter || 0) * 3, 1);
        endDate = new Date(rangeEnd.year, (rangeEnd.quarter || 0) * 3, 1);
      }

      const startTs = startDate.getTime();
      const endTs = endDate.getTime();

      let startText, endText;
      if (type === 'quarterrange') {
        startText = this._formatQuarter(_rangeStart.year, _rangeStart.quarter || 0);
        endText = this._formatQuarter(rangeEnd.year, rangeEnd.quarter || 0);
      } else if (type === 'datetimerange') {
        startText = this._formatDatetimeRange(startDate, endDate, 'start');
        endText = this._formatDatetimeRange(startDate, endDate, 'end');
      } else {
        const fmt = this._getDefaultFormat();
        startText = format(startDate, fmt);
        endText = format(endDate, fmt);
      }

      const displayText = `${startText} ~ ${endText}`;

      this.setData({
        _visible: false,
        _displayText: displayText,
        _rangeStartText: startText,
        _rangeEndText: endText,
      });
      this.triggerEvent('update:value', { value: [startTs, endTs] });
      this.triggerEvent('confirm', { value: [startTs, endTs], formatted: [startText, endText] });
      this._notifyChange();
    },

    handleCancel() {
      this.setData({ _visible: false });
      this._syncFromValue();
    },

    handleClear() {
      this.triggerEvent('update:value', { value: null });
      this.triggerEvent('clear');
      this.setData({
        _displayText: '',
        _rangeStart: null,
        _rangeEnd: null,
        _rangeStartText: '',
        _rangeEndText: '',
        _selectedWeekStart: null,
        _selectedWeekEnd: null,
        _selectedQuarter: -1,
      });
      this._notifyChange();
    },
  },
});
