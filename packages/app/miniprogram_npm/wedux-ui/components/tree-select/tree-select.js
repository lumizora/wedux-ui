const formField = require('../../behaviors/formField');

Component({
  behaviors: ['wx://form-field', formField],

  options: {
    multipleSlots: true,
  },

  relations: {
    '../form-item/form-item': {
      type: 'ancestor',
    },
  },

  properties: {
    value: { type: null, value: null },
    data: { type: Array, value: [] },
    mode: { type: String, value: 'half' },
    title: { type: String, value: '' },
    placeholder: { type: String, value: '请选择' },
    disabled: { type: Boolean, value: false },
    readonly: { type: Boolean, value: false },
    clearable: { type: Boolean, value: false },
    multiple: { type: Boolean, value: false },
    checkable: { type: Boolean, value: false },
    cascade: { type: Boolean, value: true },
    checkStrategy: { type: String, value: 'all' },
    showPath: { type: Boolean, value: false },
    pathSeparator: { type: String, value: ' / ' },
    maxTagCount: { type: Number, value: 0 },
    filterable: { type: Boolean, value: false },
    size: { type: String, value: '' },
    status: { type: String, value: '' },
    // Pass-through to tree
    keyField: { type: String, value: 'key' },
    labelField: { type: String, value: 'label' },
    childrenField: { type: String, value: 'children' },
    accordion: { type: Boolean, value: false },
    showLine: { type: Boolean, value: false },
    defaultExpandAll: { type: Boolean, value: false },
  },

  data: {
    _visible: false,
    _displayText: '',
    _selectedTags: [],
    _overflowCount: 0,
    _searchPattern: '',
  },

  lifetimes: {
    attached() {
      this._syncDisplay();
    },
  },

  observers: {
    'value, data'() {
      this._syncDisplay();
    },
  },

  methods: {
    // ===== Form Integration =====

    _getTree() {
      return this.selectComponent('.w-tree-select__tree');
    },

    // ===== Display Sync =====

    _syncDisplay() {
      const {
        value,
        multiple,
        checkable,
        data,
        showPath,
        pathSeparator,
        maxTagCount,
        keyField,
        labelField,
        childrenField,
      } = this.data;

      if (!data || !data.length) {
        this.setData({ _displayText: '', _selectedTags: [], _overflowCount: 0 });
        return;
      }

      // Build a quick node map for display
      const nodeMap = {};
      const buildMap = (nodes, parentLabels) => {
        if (!nodes) return;
        nodes.forEach((n) => {
          const key = String(n[keyField]);
          const label = n[labelField] || '';
          const path = [...parentLabels, label];
          nodeMap[key] = { label, path };
          if (n[childrenField]) {
            buildMap(n[childrenField], path);
          }
        });
      };
      buildMap(data, []);

      if (multiple || checkable) {
        const vals = Array.isArray(value) ? value : [];
        const allTags = vals.map((v) => {
          const node = nodeMap[String(v)];
          return {
            value: v,
            label: node ? (showPath ? node.path.join(pathSeparator) : node.label) : String(v),
          };
        });

        let displayTags = allTags;
        let overflow = 0;
        if (maxTagCount > 0 && allTags.length > maxTagCount) {
          displayTags = allTags.slice(0, maxTagCount);
          overflow = allTags.length - maxTagCount;
        }

        this.setData({
          _selectedTags: displayTags,
          _overflowCount: overflow,
          _displayText: '',
        });
      } else {
        const node = value != null ? nodeMap[String(value)] : null;
        const text = node ? (showPath ? node.path.join(pathSeparator) : node.label) : '';
        this.setData({ _displayText: text, _selectedTags: [], _overflowCount: 0 });
      }
    },

    _syncTreeState() {
      const tree = this._getTree();
      if (!tree) return;

      const { value, multiple, checkable } = this.data;

      if (checkable) {
        const keys = Array.isArray(value) ? value.map(String) : [];
        tree.setData({ checkedKeys: keys });
      } else if (multiple) {
        const keys = Array.isArray(value) ? value.map(String) : [];
        tree.setData({ selectedKeys: keys });
      } else {
        const keys = value != null ? [String(value)] : [];
        tree.setData({ selectedKeys: keys });
      }
    },

    // ===== Tree Event Handlers =====

    _readTreeValue() {
      const tree = this._getTree();
      if (!tree) return this.data.value;

      if (this.data.checkable) {
        return tree._getOutputCheckedKeys();
      } else if (this.data.multiple) {
        return Object.keys(tree.data._selectedKeySet).filter((k) => tree.data._selectedKeySet[k]);
      } else {
        const keys = Object.keys(tree.data._selectedKeySet).filter(
          (k) => tree.data._selectedKeySet[k],
        );
        return keys.length ? keys[0] : null;
      }
    },

    handleTreeSelect(e) {
      const { keys } = e.detail;
      if (this.data.multiple) {
        this._pendingValue = keys;
      } else {
        this._pendingValue = keys.length ? keys[0] : null;
      }
    },

    handleTreeCheck(e) {
      const { keys } = e.detail;
      this._pendingValue = keys;
    },

    // ===== Event Handlers =====

    handleTap() {
      if (this._isDisabled() || this.data.readonly) return;
      this._pendingValue = undefined;
      this.setData({ _visible: true, _searchPattern: '' });
      // Tree sync deferred to afterenter when DOM is ready
      this.triggerEvent('open');
    },

    handleDrawerAfterEnter() {
      this._syncTreeState();
    },

    handleCancel() {
      this.setData({ _visible: false, _searchPattern: '' });
      this._pendingValue = undefined;
      this.triggerEvent('cancel');
      this.triggerEvent('close');
    },

    handleConfirm() {
      const value = this._pendingValue !== undefined ? this._pendingValue : this._readTreeValue();
      this._pendingValue = undefined;
      this._emitValue(value);
      this.triggerEvent('confirm', { value });
      this.setData({ _visible: false, _searchPattern: '' });
      this.triggerEvent('close');
    },

    handleTriggerClear() {
      const emptyVal = this.data.multiple || this.data.checkable ? [] : null;
      this._emitValue(emptyVal);
    },

    handleTagRemove(e) {
      const removeVal = e.currentTarget.dataset.value;
      const currentValue = Array.isArray(this.data.value) ? [...this.data.value] : [];
      const idx = currentValue.indexOf(removeVal);
      if (idx !== -1) {
        currentValue.splice(idx, 1);
        this._emitValue(currentValue);
      }
    },

    handleSearchInput(e) {
      this.setData({ _searchPattern: e.detail.value });
    },

    handleDrawerClose() {
      this._pendingValue = undefined;
      this.setData({ _visible: false, _searchPattern: '' });
      this.triggerEvent('close');
    },

    // ===== Value Emission =====

    _emitValue(value) {
      const tree = this._getTree();
      const nodes = [];
      if (tree) {
        const keys = Array.isArray(value) ? value : value != null ? [value] : [];
        keys.forEach((k) => {
          const node = tree._getNodeByKey(String(k));
          if (node) nodes.push(node.raw);
        });
      }

      this.triggerEvent('update:value', { value, nodes });

      this._notifyChange();
    },
  },
});
