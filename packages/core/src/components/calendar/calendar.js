import { monthDays } from '../../libs/tempo_1_0_0';

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

Component({
  properties: {
    value: { type: Number, value: null },
    defaultValue: { type: Number, value: null },
    weekStartsOn: { type: Number, value: 1 },
    minDate: { type: Number, value: null },
    maxDate: { type: Number, value: null },
    marks: { type: Array, value: [] },
  },

  data: {
    _displayYear: 0,
    _displayMonth: 0, // 0-11
    _selectedTimestamp: null,
    _days: [],
    _weekDays: [],
    _panelTitle: '',
  },

  lifetimes: {
    attached() {
      this._initDisplay();
      this._buildWeekDays();
      this._buildCalendar();
      this._initialized = true;
    },
  },

  observers: {
    value: function (val) {
      if (!this._initialized) return;
      if (val !== null && val !== undefined) {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          this.setData({
            _selectedTimestamp: this._normalizeTimestamp(val),
            _displayYear: d.getFullYear(),
            _displayMonth: d.getMonth(),
          });
          this._buildCalendar();
        }
      } else {
        this.setData({ _selectedTimestamp: null });
        this._buildCalendar();
      }
    },
    marks: function () {
      if (!this._initialized) return;
      this._buildCalendar();
    },
    weekStartsOn: function () {
      if (!this._initialized) return;
      this._buildWeekDays();
      this._buildCalendar();
    },
    'minDate, maxDate': function () {
      if (!this._initialized) return;
      this._buildCalendar();
    },
  },

  methods: {
    // --- Public methods ---

    setIsDateDisabled(fn) {
      this._isDateDisabledFn = fn;
      this._buildCalendar();
    },

    navigateTo(year, month) {
      // month: 1-12 from caller, convert to 0-11 internally
      this.setData({
        _displayYear: year,
        _displayMonth: month - 1,
      });
      this._buildCalendar();
      this._emitPanelChange();
    },

    // --- Private methods ---

    _initDisplay() {
      const { value, defaultValue } = this.data;
      let initDate;

      if (value !== null && value !== undefined) {
        initDate = new Date(value);
        this.setData({ _selectedTimestamp: this._normalizeTimestamp(value) });
      } else if (defaultValue !== null && defaultValue !== undefined) {
        initDate = new Date(defaultValue);
        this.setData({ _selectedTimestamp: this._normalizeTimestamp(defaultValue) });
      } else {
        initDate = new Date();
      }

      if (isNaN(initDate.getTime())) initDate = new Date();

      this.setData({
        _displayYear: initDate.getFullYear(),
        _displayMonth: initDate.getMonth(),
      });
    },

    _buildWeekDays() {
      const { weekStartsOn } = this.data;
      const days = [
        ...WEEKDAY_LABELS.slice(weekStartsOn),
        ...WEEKDAY_LABELS.slice(0, weekStartsOn),
      ];
      this.setData({ _weekDays: days });
    },

    _buildCalendar() {
      const { _displayYear: year, _displayMonth: month, _selectedTimestamp, marks } = this.data;
      const { weekStartsOn } = this.data;
      const minDate =
        this.data.minDate != null ? this._normalizeTimestamp(this.data.minDate) : null;
      const maxDate =
        this.data.maxDate != null ? this._normalizeTimestamp(this.data.maxDate) : null;

      const daysInMonth = monthDays(new Date(year, month, 1));
      const firstDay = new Date(year, month, 1).getDay();
      const adjustedFirstDay = (firstDay - weekStartsOn + 7) % 7;

      const today = new Date();
      const ty = today.getFullYear();
      const tm = today.getMonth();
      const td = today.getDate();

      // Build marks lookup map: "YYYY-M-D" -> mark
      const marksMap = {};
      if (marks && marks.length) {
        marks.forEach((m) => {
          const md = new Date(m.date);
          if (!isNaN(md.getTime())) {
            const key = `${md.getFullYear()}-${md.getMonth()}-${md.getDate()}`;
            marksMap[key] = { color: m.color || '', text: m.text || '' };
          }
        });
      }

      const days = [];

      // Previous month padding
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = monthDays(new Date(prevYear, prevMonth, 1));

      for (let i = adjustedFirstDay - 1; i >= 0; i--) {
        const d = daysInPrevMonth - i;
        days.push(
          this._buildDayObj(
            prevYear,
            prevMonth,
            d,
            false,
            ty,
            tm,
            td,
            _selectedTimestamp,
            marksMap,
            minDate,
            maxDate,
          ),
        );
      }

      // Current month
      for (let d = 1; d <= daysInMonth; d++) {
        days.push(
          this._buildDayObj(
            year,
            month,
            d,
            true,
            ty,
            tm,
            td,
            _selectedTimestamp,
            marksMap,
            minDate,
            maxDate,
          ),
        );
      }

      // Next month padding
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const remaining = 42 - days.length;
      for (let d = 1; d <= remaining; d++) {
        days.push(
          this._buildDayObj(
            nextYear,
            nextMonth,
            d,
            false,
            ty,
            tm,
            td,
            _selectedTimestamp,
            marksMap,
            minDate,
            maxDate,
          ),
        );
      }

      this.setData({
        _days: days,
        _panelTitle: `${year}年${month + 1}月`,
      });
    },

    _buildDayObj(
      year,
      month,
      date,
      inCurrentMonth,
      ty,
      tm,
      td,
      selectedTs,
      marksMap,
      minDate,
      maxDate,
    ) {
      const timestamp = new Date(year, month, date).getTime();
      const key = `${year}-${month}-${date}`;
      const mark = marksMap[key] || null;

      let isDisabled = false;
      if (minDate !== null && minDate !== undefined && timestamp < minDate) isDisabled = true;
      if (maxDate !== null && maxDate !== undefined && timestamp > maxDate) isDisabled = true;
      if (this._isDateDisabledFn && this._isDateDisabledFn(timestamp)) isDisabled = true;

      return {
        year,
        month,
        date,
        timestamp,
        inCurrentMonth,
        isToday: year === ty && month === tm && date === td,
        isSelected: selectedTs !== null && timestamp === selectedTs,
        isDisabled,
        mark,
      };
    },

    _normalizeTimestamp(ts) {
      const d = new Date(ts);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    },

    // --- Event handlers ---

    handlePrevMonth() {
      let { _displayYear: year, _displayMonth: month } = this.data;
      if (month === 0) {
        year -= 1;
        month = 11;
      } else {
        month -= 1;
      }
      this.setData({ _displayYear: year, _displayMonth: month });
      this._buildCalendar();
      this._emitPanelChange();
    },

    handleNextMonth() {
      let { _displayYear: year, _displayMonth: month } = this.data;
      if (month === 11) {
        year += 1;
        month = 0;
      } else {
        month += 1;
      }
      this.setData({ _displayYear: year, _displayMonth: month });
      this._buildCalendar();
      this._emitPanelChange();
    },

    handleDayTap(e) {
      const { year, month, date, disabled } = e.currentTarget.dataset;
      if (disabled) return;

      const timestamp = new Date(year, month, date).getTime();
      this.setData({ _selectedTimestamp: timestamp });
      this._buildCalendar();

      this.triggerEvent('update:value', {
        value: timestamp,
        year,
        month: month + 1,
        date,
      });
    },

    _emitPanelChange() {
      const { _displayYear: year, _displayMonth: month } = this.data;
      this.triggerEvent('panel-change', { year, month: month + 1 });
    },
  },
});
