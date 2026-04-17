import { getActivityById, activityTypes, tagOptions, activities } from '../../utils/mock';

Page({
  data: {
    theme: {},
    isEdit: false,
    editId: null,
    submitting: false,
    submitSuccess: false,
    typeOptions: activityTypes.map((t) => ({ label: t.label, value: t.value })),
    tagOptions: tagOptions.map((t) => ({ label: t, value: t })),
    formData: {
      title: '',
      type: '',
      description: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      targetCount: 100,
      budget: 10000,
      location: '',
      tags: [],
      coverFiles: [],
      enableNotify: false,
    },
  },

  onReady() {
    this.selectComponent('#activityForm').setRules({
      title: [
        { required: true, message: '请输入活动名称', trigger: 'blur' },
        { min: 2, max: 30, message: '名称长度 2-30 个字符', trigger: 'blur' },
      ],
      type: [{ required: true, message: '请选择活动类型', trigger: 'input' }],
      description: [
        { required: true, message: '请输入活动描述', trigger: 'blur' },
        { min: 10, message: '描述至少 10 个字符', trigger: 'blur' },
      ],
      startDate: [{ required: true, message: '请选择开始日期', trigger: 'input' }],
      startTime: [{ required: true, message: '请选择开始时间', trigger: 'input' }],
      endDate: [{ required: true, message: '请选择结束日期', trigger: 'input' }],
      endTime: [{ required: true, message: '请选择结束时间', trigger: 'input' }],
      budget: [
        { required: true, message: '请输入预算', trigger: 'blur' },
        {
          validator(rule, value, callback) {
            if (Number(value) <= 0) {
              callback(new Error('预算必须大于0'));
            } else {
              callback();
            }
          },
          trigger: 'blur',
        },
      ],
    });
  },

  onLoad(query) {
    this.loadTheme();
    if (query.id) {
      this.setData({ isEdit: true, editId: query.id });
      this.prefillForm(query.id);
    }
  },

  onShow() {
    this.loadTheme();
  },

  loadTheme() {
    const app = getApp();
    this.setData({ theme: app.globalData.theme });
  },

  prefillForm(id) {
    const activity = getActivityById(id);
    if (!activity) return;
    const [startDate, startTime] = (activity.startTime || '').split(' ');
    const [endDate, endTime] = (activity.endTime || '').split(' ');
    this.setData({
      formData: {
        title: activity.title,
        type: activity.type,
        description: activity.description,
        startDate: startDate || '',
        startTime: startTime || '',
        endDate: endDate || '',
        endTime: endTime || '',
        targetCount: activity.targetCount,
        budget: activity.budget,
        location: activity.location || '',
        tags: activity.tags || [],
        coverFiles: activity.coverImage ? [{ url: activity.coverImage, name: 'cover' }] : [],
        enableNotify: false,
      },
    });
  },

  onFormFieldChange(e, field) {
    this.setData({ [`formData.${field}`]: e.detail.value });
  },

  onTitleChange(e) {
    this.setData({ 'formData.title': e.detail.value });
  },

  onTypeChange(e) {
    this.setData({ 'formData.type': e.detail.value });
  },

  onDescChange(e) {
    this.setData({ 'formData.description': e.detail.value });
  },

  onStartDateChange(e) {
    this.setData({ 'formData.startDate': e.detail.value });
  },

  onStartTimeChange(e) {
    this.setData({ 'formData.startTime': e.detail.value });
  },

  onEndDateChange(e) {
    this.setData({ 'formData.endDate': e.detail.value });
  },

  onEndTimeChange(e) {
    this.setData({ 'formData.endTime': e.detail.value });
  },

  onTargetCountChange(e) {
    this.setData({ 'formData.targetCount': e.detail.value });
  },

  onBudgetChange(e) {
    this.setData({ 'formData.budget': Number(e.detail.value) || 0 });
  },

  onLocationChange(e) {
    this.setData({ 'formData.location': e.detail.value });
  },

  onTagsChange(e) {
    this.setData({ 'formData.tags': e.detail.value });
  },

  onNotifyChange(e) {
    this.setData({ 'formData.enableNotify': e.detail.value });
  },

  onUploadChange(e) {
    this.setData({ 'formData.coverFiles': e.detail.fileList });
  },

  onSubmit() {
    const form = this.selectComponent('#activityForm');
    form.validate((valid, errors) => {
      if (!valid) {
        wx.showToast({ title: '请检查必填项', icon: 'error' });
        return;
      }
      this.doSubmit();
    });
  },

  doSubmit() {
    this.setData({ submitting: true });
    // Simulate API call
    setTimeout(() => {
      const { formData, isEdit, editId } = this.data;
      const now = new Date().toISOString().slice(0, 10);
      if (isEdit) {
        const idx = activities.findIndex((a) => a.id === editId);
        if (idx !== -1) {
          activities[idx] = {
            ...activities[idx],
            title: formData.title,
            type: formData.type,
            typeName: this.data.typeOptions.find((t) => t.value === formData.type)?.label || '',
            description: formData.description,
            startTime: `${formData.startDate} ${formData.startTime}`,
            endTime: `${formData.endDate} ${formData.endTime}`,
            targetCount: formData.targetCount,
            budget: formData.budget,
            location: formData.location,
            tags: formData.tags,
          };
        }
      } else {
        activities.unshift({
          id: String(Date.now()),
          title: formData.title,
          type: formData.type,
          typeName: this.data.typeOptions.find((t) => t.value === formData.type)?.label || '',
          description: formData.description,
          status: 'draft',
          startTime: `${formData.startDate} ${formData.startTime}`,
          endTime: `${formData.endDate} ${formData.endTime}`,
          targetCount: formData.targetCount,
          actualCount: 0,
          budget: formData.budget,
          location: formData.location,
          tags: formData.tags,
          coverImage: formData.coverFiles[0]?.url || 'https://picsum.photos/seed/new/600/300',
          createdAt: now,
        });
      }
      this.setData({ submitting: false, submitSuccess: true });
      wx.showToast({ title: isEdit ? '保存成功' : '创建成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1200);
    }, 1000);
  },

  onReset() {
    wx.showModal({
      title: '确认重置',
      content: '将清空所有已填内容',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            formData: {
              title: '',
              type: '',
              description: '',
              startDate: '',
              startTime: '',
              endDate: '',
              endTime: '',
              targetCount: 100,
              budget: 10000,
              location: '',
              tags: [],
              coverFiles: [],
              enableNotify: false,
            },
          });
        }
      },
    });
  },
});
