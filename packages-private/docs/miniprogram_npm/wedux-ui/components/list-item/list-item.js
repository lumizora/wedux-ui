Component({
  options: {
    multipleSlots: true,
  },

  relations: {
    '../list/list': {
      type: 'ancestor',
    },
  },

  properties: {},

  data: {
    _showDivider: false,
    _size: 'medium',
  },

  methods: {
    handleTap(e) {
      this.triggerEvent('tap', e.detail);
    },
  },
});
