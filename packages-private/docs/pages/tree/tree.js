Page({
  data: {
    props: [
      { name: 'data', type: 'Array', default: '[]', desc: '树形数据' },
      { name: 'checked-keys', type: 'Array', default: '[]', desc: '勾选的节点 key' },
      { name: 'selected-keys', type: 'Array', default: '[]', desc: '选中的节点 key' },
      { name: 'expanded-keys', type: 'Array', default: '[]', desc: '展开的节点 key' },
      { name: 'default-expand-all', type: 'Boolean', default: 'false', desc: '默认展开全部' },
      { name: 'checkable', type: 'Boolean', default: 'false', desc: '显示 checkbox' },
      { name: 'selectable', type: 'Boolean', default: 'true', desc: '是否可选中' },
      { name: 'multiple', type: 'Boolean', default: 'false', desc: '是否多选' },
      { name: 'cascade', type: 'Boolean', default: 'true', desc: '父子级联勾选' },
      {
        name: 'check-strategy',
        type: 'String',
        default: "'all'",
        desc: '级联策略: all / parent / child',
      },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用整棵树' },
      { name: 'pattern', type: 'String', default: "''", desc: '搜索关键词' },
      {
        name: 'filter-mode',
        type: 'String',
        default: "'filter'",
        desc: '搜索模式: highlight / filter',
      },
      { name: 'accordion', type: 'Boolean', default: 'false', desc: '手风琴模式' },
      { name: 'indent', type: 'Number', default: '40', desc: '缩进宽度 (rpx)' },
      { name: 'show-line', type: 'Boolean', default: 'false', desc: '显示连接线' },
      { name: 'check-on-click', type: 'Boolean', default: 'false', desc: '点击节点行即勾选' },
      { name: 'expand-on-click', type: 'Boolean', default: 'false', desc: '点击节点行即展开' },
    ],

    treeData: [
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
              { key: '1-1-3', label: '小张' },
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

    selectedKeys: [],
    checkedKeys: [],
    searchPattern: '',
    asyncData: [
      { key: 'a1', label: '一级节点 1', isLeaf: false },
      { key: 'a2', label: '一级节点 2', isLeaf: false },
    ],
  },

  onSelectChange(e) {
    this.setData({ selectedKeys: e.detail.keys });
  },

  onCheckChange(e) {
    this.setData({ checkedKeys: e.detail.keys });
  },

  onSearchInput(e) {
    this.setData({ searchPattern: e.detail.value });
  },

  onAsyncLoad(e) {
    const { node } = e.detail;
    const tree = this.selectComponent('#asyncTree');
    setTimeout(() => {
      tree.loadChildren(node.key, [
        { key: `${node.key}-1`, label: `${node.label} 子节点 1` },
        { key: `${node.key}-2`, label: `${node.label} 子节点 2` },
      ]);
    }, 1000);
  },
});
