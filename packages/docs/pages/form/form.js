Page({
  data: {
    formProps: [
      { name: 'model', type: 'Object', default: '{}', desc: '表单数据对象' },
      { name: 'rules', type: 'Object', default: '{}', desc: '校验规则，key 为字段 path' },
      { name: 'size', type: 'String', default: "'medium'", desc: '级联尺寸' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '级联禁用' },
      { name: 'labelPlacement', type: 'String', default: "'top'", desc: '标签位置：top / left' },
      { name: 'labelWidth', type: 'String', default: "''", desc: 'left 模式下标签宽度' },
      { name: 'showFeedback', type: 'Boolean', default: 'true', desc: '是否显示校验反馈' },
      { name: 'showLabel', type: 'Boolean', default: 'true', desc: '是否显示标签' },
      { name: 'showRequireMark', type: 'Boolean', default: 'true', desc: '是否显示必填星号' },
      {
        name: 'requireMarkPlacement',
        type: 'String',
        default: "'right'",
        desc: '必填星号位置：left / right',
      },
      { name: 'inline', type: 'Boolean', default: 'false', desc: '行内布局' },
    ],
    formItemProps: [
      { name: 'label', type: 'String', default: "''", desc: '标签文字' },
      { name: 'path', type: 'String', default: "''", desc: '对应 model/rules 的 key' },
      { name: 'rule', type: 'Array/Object', default: 'null', desc: '组件级规则' },
      { name: 'required', type: 'Boolean', default: 'false', desc: '必填' },
      { name: 'first', type: 'Boolean', default: 'false', desc: '遇到第一个错误即停止' },
      { name: 'size', type: 'String', default: "''", desc: '覆盖 form 级 size' },
      { name: 'showFeedback', type: 'Boolean', default: 'null', desc: '覆盖 form 级' },
      { name: 'validationStatus', type: 'String', default: "''", desc: '手动状态' },
      { name: 'feedback', type: 'String', default: "''", desc: '手动反馈文字' },
      { name: 'labelWidth', type: 'String', default: "''", desc: '覆盖 form 级' },
      {
        name: 'requireMarkPlacement',
        type: 'String',
        default: "''",
        desc: '覆盖 form 级：left / right',
      },
    ],
    formData: {
      username: '',
      email: '',
      bio: '',
      gender: '',
      agree: [],
      notify: false,
    },
    formRules: {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度 2-20', trigger: 'blur' },
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
      ],
      gender: [{ required: true, message: '请选择性别', trigger: 'input' }],
      agree: [
        {
          required: true,
          message: '请至少勾选一项',
          trigger: 'input',
        },
      ],
    },

    // Custom validator demo data
    formData2: {
      age: '',
      password: '',
      reenteredPassword: '',
    },
  },

  onReady() {
    // Rules with custom validator functions must be passed via setRules,
    // because setData strips functions during serialization.
    this.selectComponent('#customForm').setRules({
      age: [
        {
          required: true,
          validator: (rule, value) => {
            if (!value) {
              return new Error('需要年龄');
            } else if (!/^\d*$/.test(value)) {
              return new Error('年龄应该为整数');
            } else if (Number(value) < 18) {
              return new Error('年龄应该超过十八岁');
            }
            return true;
          },
          trigger: ['input', 'blur'],
        },
      ],
      password: [{ required: true, message: '请输入密码' }],
      reenteredPassword: [
        {
          required: true,
          message: '请再次输入密码',
          trigger: ['input', 'blur'],
        },
        {
          validator: (rule, value) => {
            if (!this.data.formData2.password) return true;
            if (!this.data.formData2.password.startsWith(value)) {
              return new Error('两次密码输入不一致');
            }
            return true;
          },
          trigger: 'input',
        },
        {
          validator: (rule, value) => {
            return value === this.data.formData2.password ? true : new Error('两次密码输入不一致');
          },
          trigger: ['blur', 'password-input'],
        },
      ],
    });
  },

  onFieldChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`formData.${field}`]: e.detail.value });
  },

  onSwitchChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`formData.${field}`]: e.detail.checked });
  },

  onField2Change(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`formData2.${field}`]: e.detail.value });
  },

  handlePasswordInput() {
    if (this.data.formData2.reenteredPassword) {
      this.selectComponent('#rPasswordFormItem').validate({ trigger: 'password-input' });
    }
  },

  handleValidate() {
    this.selectComponent('#demoForm').validate((errors) => {
      if (!errors) {
        wx.showToast({ title: '校验通过', icon: 'success' });
      } else {
        console.error(errors);
      }
    });
  },

  handleRestore() {
    this.selectComponent('#demoForm').restoreValidation();
  },

  handleValidate2() {
    this.selectComponent('#customForm').validate((errors) => {
      if (!errors) {
        wx.showToast({ title: '校验通过', icon: 'success' });
      } else {
        console.error(errors);
      }
    });
  },

  handleRestore2() {
    this.selectComponent('#customForm').restoreValidation();
  },
});
