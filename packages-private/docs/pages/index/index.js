Component({
  data: {
    headerPaddingTop: 'padding-top: 44px',
  },
  lifetimes: {
    attached() {
      const { statusBarHeight } = wx.getWindowInfo();
      this.setData({
        headerPaddingTop: `padding-top: ${statusBarHeight}px`,
      });
    },
  },
});
