const SIZE_VAR_MAP = {
  small: 'var(--w-empty-image-size-sm)',
  medium: 'var(--w-empty-image-size-md)',
  large: 'var(--w-empty-image-size-lg)',
};

Component({
  options: {
    multipleSlots: true,
  },

  properties: {
    title: {
      type: String,
      value: '暂无数据',
    },
    description: {
      type: String,
      value: '',
    },
    size: {
      type: String,
      value: 'medium', // small | medium | large
    },
  },

  data: {
    _imageStyle: '--w-empty-image-size: var(--w-empty-image-size-md)',
  },

  observers: {
    size(size) {
      const varVal = SIZE_VAR_MAP[size] || SIZE_VAR_MAP.medium;
      this.setData({ _imageStyle: `--w-empty-image-size: ${varVal}` });
    },
  },
});
