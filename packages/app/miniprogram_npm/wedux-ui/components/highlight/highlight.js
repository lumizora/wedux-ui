Component({
  properties: {
    text: {
      type: String,
      value: '',
    },
    patterns: {
      type: Array,
      value: [],
    },
    caseSensitive: {
      type: Boolean,
      value: false,
    },
    autoEscape: {
      type: Boolean,
      value: true,
    },
    highlightClass: {
      type: String,
      value: '',
    },
    highlightStyle: {
      type: String,
      value: '',
    },
  },

  data: {
    _segments: [],
  },

  observers: {
    'text, patterns, caseSensitive, autoEscape': function (
      text,
      patterns,
      caseSensitive,
      autoEscape,
    ) {
      if (!text || !patterns || patterns.length === 0) {
        this.setData({ _segments: text ? [{ text, isMatch: false }] : [] });
        return;
      }

      const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const pattern = patterns
        .filter((w) => w)
        .map((w) => (autoEscape ? escapeRegExp(w) : w))
        .join('|');

      if (!pattern) {
        this.setData({ _segments: [{ text, isMatch: false }] });
        return;
      }

      const regex = new RegExp(`(${pattern})`, caseSensitive ? 'g' : 'gi');
      const segments = [];
      let lastIndex = 0;

      for (const match of text.matchAll(regex)) {
        const { index } = match;
        if (index > lastIndex) {
          segments.push({ text: text.slice(lastIndex, index), isMatch: false });
        }
        segments.push({ text: match[0], isMatch: true });
        lastIndex = index + match[0].length;
      }

      if (lastIndex < text.length) {
        segments.push({ text: text.slice(lastIndex), isMatch: false });
      }

      this.setData({ _segments: segments });
    },
  },
});
