Component({
  options: {
    multipleSlots: true,
  },

  properties: {
    title: {
      type: String,
      value: '',
    },
    back: {
      type: Boolean,
      value: true,
    },
    useBackSlot: {
      type: Boolean,
      value: false,
    },
    useTitleSlot: {
      type: Boolean,
      value: false,
    },
    useContentSlot: {
      type: Boolean,
      value: false,
    },
    preventBack: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    _statusBarHeight: 0,
    _navbarHeight: 44,
    _capsuleWidth: 0,
    _showBack: false,
  },

  lifetimes: {
    attached() {
      const { statusBarHeight, windowWidth } = wx.getWindowInfo();
      const { platform } = wx.getDeviceInfo();
      const rect = wx.getMenuButtonBoundingClientRect();
      const pages = getCurrentPages();

      // 导航栏高度 = 胶囊按钮垂直居中所需高度
      const navbarHeight = (rect.top - statusBarHeight) * 2 + rect.height;
      // 右侧需要避让胶囊按钮的宽度
      const capsuleWidth = windowWidth - rect.left;

      this.setData({
        _statusBarHeight: statusBarHeight,
        _navbarHeight: navbarHeight,
        _capsuleWidth: capsuleWidth,
        _showBack: this.data.back && pages.length > 1,
        _platform: platform,
      });
    },
  },

  observers: {
    back(val) {
      const pages = getCurrentPages();
      this.setData({ _showBack: val && pages.length > 1 });
    },
  },

  methods: {
    _onBack() {
      this.triggerEvent('back');
      if (!this.data.preventBack) {
        wx.navigateBack();
      }
    },
  },
});
