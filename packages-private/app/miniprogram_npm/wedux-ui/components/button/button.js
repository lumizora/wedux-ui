Component({
  behaviors: ['wx://form-field-button'],
  relations: {
    '../button-group/button-group': {
      type: 'ancestor',
      unlinked() {
        this.setData({ _groupClass: '', _groupSize: '' });
      },
    },
  },

  properties: {
    type: {
      type: String,
      value: 'default', // 'default' | 'tertiary' | 'primary' | 'success' | 'info' | 'warning' | 'error'
    },
    size: {
      type: String,
      value: 'medium', // default | medium | small
    },
    strong: {
      type: Boolean,
      value: false,
    },
    secondary: {
      type: Boolean,
      value: false,
    },
    tertiary: {
      type: Boolean,
      value: false,
    },
    ghost: {
      type: Boolean,
      value: false,
    },
    dashed: {
      type: Boolean,
      value: false,
    },
    quaternary: {
      type: Boolean,
      value: false,
    },
    round: {
      type: Boolean,
      value: false,
    },
    circle: {
      type: Boolean,
      value: false,
    },
    block: {
      type: Boolean,
      value: false,
    },
    disabled: {
      type: Boolean,
      value: false,
    },
    loading: {
      type: Boolean,
      value: false,
    },
    color: {
      type: String,
      value: '',
    },
    textColor: {
      type: String,
      value: '',
    },
    text: {
      type: Boolean,
      value: false,
    },
    openType: {
      type: String,
      value: '', // 'contact' | 'share' | 'getPhoneNumber' | 'getRealtimePhoneNumber' | 'getUserInfo' | 'launchApp' | 'openSetting' | 'feedback' | 'chooseAvatar' | 'agreePrivacyAuthorization' | 'liveActivity'
    },
    formType: {
      type: String,
      value: '', // 'submit' | 'reset' | 'submitToGroup'
    },
  },

  data: {
    _groupClass: '',
    _groupSize: '',
    _style: '',
  },

  observers: {
    'color, textColor'(color, textColor) {
      let style = '';
      if (color) {
        style += `background-color: ${color}; border-color: ${color};`;
      }
      if (textColor) {
        style += ` color: ${textColor};`;
      }
      this.setData({ _style: style });
    },
  },

  methods: {
    handleTap() {
      if (this.data.disabled || this.data.loading) return;
      this.triggerEvent('tap', {}, { bubbles: true, composed: true });
    },

    handleGetPhoneNumber(e) {
      this.triggerEvent('getphonenumber', e.detail);
    },

    handleChooseAvatar(e) {
      this.triggerEvent('chooseavatar', e.detail);
    },

    handleUserInfo(e) {
      this.triggerEvent('getuserinfo', e.detail);
    },

    handleGetRealtimePhoneNumber(e) {
      this.triggerEvent('getrealtimephonenumber', e.detail);
    },

    handleContact(e) {
      this.triggerEvent('contact', e.detail);
    },

    handleLaunchApp(e) {
      this.triggerEvent('launchapp', e.detail);
    },

    handleOpenSetting(e) {
      this.triggerEvent('opensetting', e.detail);
    },

    handleAgreePrivacyAuthorization(e) {
      this.triggerEvent('agreeprivacyauthorization', e.detail);
    },

    _setGroupContext(ctx) {
      const prefix = ctx.vertical ? 'w-btn--group-v-' : 'w-btn--group-';
      this.setData({
        _groupClass: prefix + ctx.position,
        _groupSize: ctx.size || '',
      });
    },
  },
});
