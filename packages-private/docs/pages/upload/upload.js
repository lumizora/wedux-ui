Page({
  data: {
    props: [
      { name: 'fileList', type: 'Array', default: '[]', desc: '文件列表' },
      { name: 'mode', type: 'String', default: "'grid'", desc: "展示模式 'grid' / 'list'" },
      {
        name: 'accept',
        type: 'String',
        default: "'image'",
        desc: "接受类型 'image' / 'video' / 'media' / 'file'",
      },
      { name: 'multiple', type: 'Boolean', default: 'false', desc: '是否多选' },
      { name: 'maxCount', type: 'Number', default: '9', desc: '最大文件数，0 为不限' },
      { name: 'maxSize', type: 'Number', default: '10485760', desc: '单文件大小上限(字节)' },
      { name: 'uploadUrl', type: 'String', default: "''", desc: '上传地址，传入则自动上传' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用' },
      { name: 'readonly', type: 'Boolean', default: 'false', desc: '只读' },
      { name: 'columns', type: 'Number', default: '4', desc: 'grid 模式每行列数' },
    ],
    // Basic grid
    list1: [],
    // Multiple
    list2: [],
    // List mode
    list3: [],
    // Max count
    list4: [],
    // Readonly
    list5: [
      { url: 'https://picsum.photos/200/200?random=1', type: 'image', status: 'done' },
      { url: 'https://picsum.photos/200/200?random=2', type: 'image', status: 'done' },
      { url: 'https://picsum.photos/200/200?random=3', type: 'image', status: 'done' },
    ],
    // Disabled
    list6: [{ url: 'https://picsum.photos/200/200?random=4', type: 'image', status: 'done' }],
    // File mode (list)
    list7: [],
  },

  onList1Change(e) {
    this.setData({ list1: e.detail.fileList });
  },
  onList2Change(e) {
    this.setData({ list2: e.detail.fileList });
  },
  onList3Change(e) {
    this.setData({ list3: e.detail.fileList });
  },
  onList4Change(e) {
    this.setData({ list4: e.detail.fileList });
  },
  onList7Change(e) {
    this.setData({ list7: e.detail.fileList });
  },
  onOverlimit(e) {
    wx.showToast({ title: `最多选择 ${e.detail.maxCount} 个文件`, icon: 'none' });
  },
  onOversize() {
    wx.showToast({ title: '文件大小超出限制', icon: 'none' });
  },
});
