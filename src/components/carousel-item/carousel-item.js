Component({
  relations: {
    '../carousel/carousel': {
      type: 'ancestor',
    },
  },

  data: {
    _style: '',
    _state: 'hidden',
  },

  methods: {
    _setState(state, style) {
      this.setData({ _state: state, _style: style });
    },

    onTap() {
      const parents = this.getRelationNodes('../carousel/carousel');
      if (parents && parents.length) {
        parents[0]._onItemTap(this);
      }
    },
  },
});
