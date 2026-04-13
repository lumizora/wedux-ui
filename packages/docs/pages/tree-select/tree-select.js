Page({
  data: {
    props: [
      { name: 'value', type: 'Any / Array', default: 'null', desc: '选中值' },
      { name: 'data', type: 'Array', default: '[]', desc: '树形数据' },
      { name: 'mode', type: 'String', default: "'half'", desc: '弹出模式: half / full' },
      { name: 'title', type: 'String', default: "''", desc: '弹出层标题' },
      { name: 'placeholder', type: 'String', default: "'请选择'", desc: '占位文字' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用' },
      { name: 'clearable', type: 'Boolean', default: 'false', desc: '可清除' },
      { name: 'multiple', type: 'Boolean', default: 'false', desc: '多选' },
      { name: 'checkable', type: 'Boolean', default: 'false', desc: 'checkbox 模式' },
      { name: 'cascade', type: 'Boolean', default: 'true', desc: '级联勾选' },
      { name: 'check-strategy', type: 'String', default: "'all'", desc: '级联策略' },
      { name: 'show-path', type: 'Boolean', default: 'false', desc: '显示完整路径' },
      { name: 'max-tag-count', type: 'Number', default: '0', desc: '最大标签数' },
      { name: 'filterable', type: 'Boolean', default: 'false', desc: '可搜索' },
      { name: 'size', type: 'String', default: "'medium'", desc: '尺寸' },
    ],

    deptData: [
      {
        key: '1',
        label: '技术部',
        children: [
          {
            key: '1-1',
            label: '前端组',
            children: [
              { key: '1-1-1', label: '小明' },
              { key: '1-1-2', label: '小红' },
            ],
          },
          {
            key: '1-2',
            label: '后端组',
            children: [
              { key: '1-2-1', label: '小李' },
              { key: '1-2-2', label: '小王' },
            ],
          },
        ],
      },
      {
        key: '2',
        label: '设计部',
        children: [
          { key: '2-1', label: 'UI 设计' },
          { key: '2-2', label: 'UX 设计' },
        ],
      },
      {
        key: '3',
        label: '产品部',
        children: [
          { key: '3-1', label: '需求分析' },
          { key: '3-2', label: '项目管理' },
        ],
      },
    ],

    val1: null,
    val2: [],
    val3: null,
    val4: [],
    val5: null,
  },

  onChange1(e) {
    this.setData({ val1: e.detail.value });
  },
  onChange2(e) {
    this.setData({ val2: e.detail.value });
  },
  onChange3(e) {
    this.setData({ val3: e.detail.value });
  },
  onChange4(e) {
    this.setData({ val4: e.detail.value });
  },
  onChange5(e) {
    this.setData({ val5: e.detail.value });
  },
});
