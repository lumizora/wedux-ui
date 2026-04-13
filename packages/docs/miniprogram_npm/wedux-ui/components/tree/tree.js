Component({
  options: {
    multipleSlots: true,
  },

  relations: {
    '../tree-select/tree-select': {
      type: 'ancestor',
    },
  },

  properties: {
    data: { type: Array, value: [] },
    checkedKeys: { type: Array, value: [] },
    selectedKeys: { type: Array, value: [] },
    expandedKeys: { type: Array, value: [] },
    defaultExpandAll: { type: Boolean, value: false },
    checkable: { type: Boolean, value: false },
    selectable: { type: Boolean, value: true },
    multiple: { type: Boolean, value: false },
    cascade: { type: Boolean, value: true },
    checkStrategy: { type: String, value: 'all' },
    disabled: { type: Boolean, value: false },
    pattern: { type: String, value: '' },
    filterMode: { type: String, value: 'filter' },
    accordion: { type: Boolean, value: false },
    indent: { type: Number, value: 40 },
    showLine: { type: Boolean, value: false },
    keyField: { type: String, value: 'key' },
    labelField: { type: String, value: 'label' },
    childrenField: { type: String, value: 'children' },
    checkOnClick: { type: Boolean, value: false },
    expandOnClick: { type: Boolean, value: false },
  },

  data: {
    _visibleNodes: [],
    _checkedKeySet: {},
    _selectedKeySet: {},
    _expandedKeySet: {},
    _indeterminateKeySet: {},
    _loadingKeys: {},
    _highlightPattern: '',
  },

  lifetimes: {
    created() {
      this._nodeMap = {};
      this._flatNodes = [];
      this._filterFn = null;
      this._initialized = false;
    },
  },

  observers: {
    'data, keyField, labelField, childrenField'() {
      this._buildTree();
    },
    checkedKeys(val) {
      if (!this._initialized) return;
      this._setCheckedKeys(val);
    },
    selectedKeys(val) {
      if (!this._initialized) return;
      const map = {};
      val.forEach((k) => {
        map[k] = true;
      });
      this.setData({ _selectedKeySet: map });
      this._updateVisibleNodes();
    },
    expandedKeys(val) {
      if (!this._initialized) return;
      const map = {};
      val.forEach((k) => {
        map[k] = true;
      });
      this.setData({ _expandedKeySet: map });
      this._updateVisibleNodes();
    },
    'pattern, filterMode'() {
      this._applyFilter();
    },
  },

  methods: {
    // ===== Public Methods =====

    setFilter(fn) {
      this._filterFn = fn;
      this._applyFilter();
    },

    loadChildren(key, children) {
      const node = this._nodeMap[key];
      if (!node) return;

      const { keyField, labelField, childrenField } = this.data;
      const newNodes = this._normalizeNodes(
        children,
        node.level + 1,
        key,
        keyField,
        labelField,
        childrenField,
      );
      node.childrenKeys = children.map((c) => String(c[keyField]));
      node.isLeaf = newNodes.length === 0;

      newNodes.forEach((n) => {
        this._nodeMap[n.key] = n;
      });

      // Insert into _flatNodes after parent
      const parentIdx = this._flatNodes.findIndex((n) => n.key === key);
      if (parentIdx !== -1) {
        this._flatNodes.splice(parentIdx + 1, 0, ...newNodes);
      }

      const loading = { ...this.data._loadingKeys };
      delete loading[key];

      const expanded = { ...this.data._expandedKeySet, [key]: true };
      this.setData({ _loadingKeys: loading, _expandedKeySet: expanded });
      this._updateVisibleNodes();
      this._emitExpandedKeys();
    },

    getCheckedNodes() {
      const keys = this._getOutputCheckedKeys();
      return keys.map((k) => this._nodeMap[k]?.raw).filter(Boolean);
    },

    getSelectedNodes() {
      return Object.keys(this.data._selectedKeySet)
        .filter((k) => this.data._selectedKeySet[k])
        .map((k) => this._nodeMap[k]?.raw)
        .filter(Boolean);
    },

    expandAll() {
      const map = {};
      this._flatNodes.forEach((n) => {
        if (!n.isLeaf) map[n.key] = true;
      });
      this.setData({ _expandedKeySet: map });
      this._updateVisibleNodes();
      this._emitExpandedKeys();
    },

    collapseAll() {
      this.setData({ _expandedKeySet: {} });
      this._updateVisibleNodes();
      this._emitExpandedKeys();
    },

    // ===== Tree Building =====

    _buildTree() {
      const {
        data,
        keyField,
        labelField,
        childrenField,
        defaultExpandAll,
        checkedKeys,
        selectedKeys,
        expandedKeys,
      } = this.data;
      this._nodeMap = {};
      this._flatNodes = this._normalizeNodes(data, 0, null, keyField, labelField, childrenField);

      this._flatNodes.forEach((n) => {
        this._nodeMap[n.key] = n;
      });

      // Initialize state sets
      const expandedMap = {};
      if (defaultExpandAll && !this._initialized) {
        this._flatNodes.forEach((n) => {
          if (!n.isLeaf) expandedMap[n.key] = true;
        });
      } else {
        expandedKeys.forEach((k) => {
          expandedMap[k] = true;
        });
      }

      const selectedMap = {};
      selectedKeys.forEach((k) => {
        selectedMap[k] = true;
      });

      this.setData({
        _expandedKeySet: expandedMap,
        _selectedKeySet: selectedMap,
      });

      this._setCheckedKeys(checkedKeys);
      this._initialized = true;
      this._updateVisibleNodes();
    },

    _normalizeNodes(nodes, level, parentKey, keyField, labelField, childrenField) {
      const result = [];
      if (!nodes || !nodes.length) return result;

      nodes.forEach((raw, index) => {
        const key = String(raw[keyField]);
        const children = raw[childrenField];
        const hasChildren = Array.isArray(children) && children.length > 0;
        const isLeaf = raw.isLeaf !== undefined ? raw.isLeaf : !hasChildren;

        const node = {
          key,
          label: raw[labelField] || '',
          level,
          parentKey,
          icon: raw.icon || '',
          prefixIcon: raw.prefixIcon || '',
          suffixText: raw.suffixText || '',
          disabled: raw.disabled || false,
          isLeaf,
          isLast: index === nodes.length - 1,
          childrenKeys: [],
          raw,
        };

        result.push(node);

        if (hasChildren) {
          const childNodes = this._normalizeNodes(
            children,
            level + 1,
            key,
            keyField,
            labelField,
            childrenField,
          );
          node.childrenKeys = children.map((c) => String(c[keyField]));
          result.push(...childNodes);
        }
      });

      return result;
    },

    // ===== Visible Nodes =====

    _updateVisibleNodes() {
      const {
        _expandedKeySet,
        _loadingKeys,
        _checkedKeySet,
        _selectedKeySet,
        _indeterminateKeySet,
        _highlightPattern,
      } = this.data;
      const { indent } = this.data;
      const visible = [];
      const hiddenParents = new Set();

      this._flatNodes.forEach((node) => {
        // Skip if any ancestor is collapsed
        if (node.parentKey !== null && hiddenParents.has(node.parentKey)) {
          hiddenParents.add(node.key);
          return;
        }

        if (node.parentKey !== null && !_expandedKeySet[node.parentKey]) {
          hiddenParents.add(node.key);
          return;
        }

        // Apply filter (filter mode)
        if (this._filteredKeySet && !this._filteredKeySet[node.key]) {
          return;
        }

        const paddingLeft = node.level * indent;
        const isExpanded = !!_expandedKeySet[node.key];
        const isChecked = !!_checkedKeySet[node.key];
        const isSelected = !!_selectedKeySet[node.key];
        const isIndeterminate = !!_indeterminateKeySet[node.key];
        const isLoading = !!_loadingKeys[node.key];

        // Highlight matching
        let labelParts = null;
        if (_highlightPattern && node.label) {
          const idx = node.label.toLowerCase().indexOf(_highlightPattern.toLowerCase());
          if (idx !== -1) {
            labelParts = [
              node.label.slice(0, idx),
              node.label.slice(idx, idx + _highlightPattern.length),
              node.label.slice(idx + _highlightPattern.length),
            ];
          }
        }

        visible.push({
          key: node.key,
          label: node.label,
          level: node.level,
          icon: node.icon,
          prefixIcon: node.prefixIcon,
          suffixText: node.suffixText,
          disabled: node.disabled,
          isLeaf: node.isLeaf,
          isLast: node.isLast,
          paddingLeft,
          isExpanded,
          isChecked,
          isSelected,
          isIndeterminate,
          isLoading,
          labelParts,
        });
      });

      this.setData({ _visibleNodes: visible });
    },

    // ===== Check Logic =====

    _setCheckedKeys(keys) {
      const checkedMap = {};
      keys.forEach((k) => {
        checkedMap[k] = true;
      });

      if (this.data.cascade && this.data.checkable) {
        const indeterminateMap = {};
        this._flatNodes.forEach((node) => {
          if (node.isLeaf || !node.childrenKeys.length) return;
          const allDescendants = this._getAllDescendantKeys(node.key);
          const checkedCount = allDescendants.filter((k) => checkedMap[k]).length;
          if (checkedCount > 0 && checkedCount < allDescendants.length) {
            indeterminateMap[node.key] = true;
          }
        });
        this.setData({ _checkedKeySet: checkedMap, _indeterminateKeySet: indeterminateMap });
      } else {
        this.setData({ _checkedKeySet: checkedMap, _indeterminateKeySet: {} });
      }

      this._updateVisibleNodes();
    },

    _handleCheck(key) {
      const node = this._nodeMap[key];
      if (!node || node.disabled || this.data.disabled) return;

      const isChecked = !!this.data._checkedKeySet[key];
      const newChecked = { ...this.data._checkedKeySet };
      const newIndeterminate = { ...this.data._indeterminateKeySet };

      if (this.data.cascade) {
        const descendants = this._getAllDescendantKeys(key).filter(
          (k) => !this._nodeMap[k]?.disabled,
        );
        if (isChecked) {
          delete newChecked[key];
          descendants.forEach((k) => {
            delete newChecked[k];
          });
        } else {
          newChecked[key] = true;
          descendants.forEach((k) => {
            newChecked[k] = true;
          });
        }
        this._updateAncestorCheckState(key, newChecked, newIndeterminate);
      } else {
        if (isChecked) {
          delete newChecked[key];
        } else {
          newChecked[key] = true;
        }
      }

      this.setData({ _checkedKeySet: newChecked, _indeterminateKeySet: newIndeterminate });
      this._updateVisibleNodes();
      this._emitCheckedKeys();
    },

    _updateAncestorCheckState(key, checkedMap, indeterminateMap) {
      let current = this._nodeMap[key];
      while (current && current.parentKey !== null) {
        const parent = this._nodeMap[current.parentKey];
        if (!parent) break;

        const childKeys = parent.childrenKeys;
        const allLeafKeys = [];
        childKeys.forEach((ck) => {
          allLeafKeys.push(...this._getAllDescendantKeys(ck), ck);
        });

        const nonDisabledKeys = allLeafKeys.filter((k) => !this._nodeMap[k]?.disabled);
        const checkedCount = nonDisabledKeys.filter((k) => checkedMap[k]).length;

        delete checkedMap[parent.key];
        delete indeterminateMap[parent.key];

        if (checkedCount === 0) {
          // nothing
        } else if (checkedCount === nonDisabledKeys.length) {
          checkedMap[parent.key] = true;
        } else {
          indeterminateMap[parent.key] = true;
        }

        current = parent;
      }
    },

    _getAllDescendantKeys(key) {
      const node = this._nodeMap[key];
      if (!node || !node.childrenKeys.length) return [];
      const result = [];
      const stack = [...node.childrenKeys];
      while (stack.length) {
        const k = stack.pop();
        result.push(k);
        const child = this._nodeMap[k];
        if (child && child.childrenKeys.length) {
          stack.push(...child.childrenKeys);
        }
      }
      return result;
    },

    _getOutputCheckedKeys() {
      const { _checkedKeySet } = this.data;
      const keys = Object.keys(_checkedKeySet).filter((k) => _checkedKeySet[k]);
      const { checkStrategy } = this.data;

      if (checkStrategy === 'parent') {
        return keys
          .filter((k) => {
            const node = this._nodeMap[k];
            if (!node || node.isLeaf) return true;
            const desc = this._getAllDescendantKeys(k);
            return desc.every((dk) => _checkedKeySet[dk]);
          })
          .filter((k) => {
            const node = this._nodeMap[k];
            if (!node || node.parentKey === null) return true;
            const parent = this._nodeMap[node.parentKey];
            if (!parent) return true;
            const parentDesc = this._getAllDescendantKeys(parent.key);
            return !parentDesc.every((dk) => _checkedKeySet[dk]);
          });
      }

      if (checkStrategy === 'child') {
        return keys.filter((k) => {
          const node = this._nodeMap[k];
          return node && node.isLeaf;
        });
      }

      return keys;
    },

    // ===== Select Logic =====

    _handleSelect(key) {
      const node = this._nodeMap[key];
      if (!node || node.disabled || this.data.disabled || !this.data.selectable) return;

      const isSelected = !!this.data._selectedKeySet[key];
      let newSelected;

      if (this.data.multiple) {
        newSelected = { ...this.data._selectedKeySet };
        if (isSelected) {
          delete newSelected[key];
        } else {
          newSelected[key] = true;
        }
      } else {
        newSelected = isSelected ? {} : { [key]: true };
      }

      this.setData({ _selectedKeySet: newSelected });
      this._updateVisibleNodes();
      this._emitSelectedKeys();
    },

    // ===== Expand Logic =====

    _handleExpand(key) {
      const node = this._nodeMap[key];
      if (!node || node.isLeaf) return;

      // Async loading
      if (!node.childrenKeys.length && !node.isLeaf && !this.data._loadingKeys[key]) {
        this.setData({ _loadingKeys: { ...this.data._loadingKeys, [key]: true } });
        this._updateVisibleNodes();
        this.triggerEvent('load', { node: node.raw });
        return;
      }

      const isExpanded = !!this.data._expandedKeySet[key];
      const newExpanded = { ...this.data._expandedKeySet };

      if (isExpanded) {
        delete newExpanded[key];
      } else {
        if (this.data.accordion) {
          this._flatNodes.forEach((n) => {
            if (n.parentKey === node.parentKey && n.key !== key && !n.isLeaf) {
              delete newExpanded[n.key];
            }
          });
        }
        newExpanded[key] = true;
      }

      this.setData({ _expandedKeySet: newExpanded });
      this._updateVisibleNodes();
      this._emitExpandedKeys();
    },

    // ===== Filter Logic =====

    _applyFilter() {
      const { pattern, filterMode } = this.data;

      if (!pattern) {
        this._filteredKeySet = null;
        this.setData({ _highlightPattern: '' });
        this._updateVisibleNodes();
        return;
      }

      const matchFn =
        this._filterFn || ((pat, node) => node.label.toLowerCase().includes(pat.toLowerCase()));

      if (filterMode === 'highlight') {
        this._filteredKeySet = null;
        this.setData({ _highlightPattern: pattern });
        this._updateVisibleNodes();
        return;
      }

      // Filter mode: show only matching nodes + ancestors
      const matchedKeys = new Set();
      this._flatNodes.forEach((node) => {
        if (matchFn(pattern, node)) {
          matchedKeys.add(node.key);
          let parentKey = node.parentKey;
          while (parentKey !== null) {
            matchedKeys.add(parentKey);
            const parent = this._nodeMap[parentKey];
            parentKey = parent ? parent.parentKey : null;
          }
        }
      });

      this._filteredKeySet = {};
      matchedKeys.forEach((k) => {
        this._filteredKeySet[k] = true;
      });

      // Auto-expand ancestors of matched nodes
      const newExpanded = { ...this.data._expandedKeySet };
      matchedKeys.forEach((k) => {
        const node = this._nodeMap[k];
        if (node && !node.isLeaf) {
          newExpanded[k] = true;
        }
      });

      this.setData({ _expandedKeySet: newExpanded, _highlightPattern: pattern });
      this._updateVisibleNodes();
    },

    // ===== Event Emission =====

    _emitCheckedKeys() {
      const keys = this._getOutputCheckedKeys();
      const nodes = keys.map((k) => this._nodeMap[k]?.raw).filter(Boolean);
      this.triggerEvent('update:checked-keys', { keys, nodes });
    },

    _emitSelectedKeys() {
      const keys = Object.keys(this.data._selectedKeySet).filter(
        (k) => this.data._selectedKeySet[k],
      );
      const nodes = keys.map((k) => this._nodeMap[k]?.raw).filter(Boolean);
      this.triggerEvent('update:selected-keys', { keys, nodes });
    },

    _emitExpandedKeys() {
      const keys = Object.keys(this.data._expandedKeySet).filter(
        (k) => this.data._expandedKeySet[k],
      );
      const nodes = keys.map((k) => this._nodeMap[k]?.raw).filter(Boolean);
      this.triggerEvent('update:expanded-keys', { keys, nodes });
    },

    // ===== Event Handlers =====

    handleNodeTap(e) {
      const { key } = e.currentTarget.dataset;
      const node = this._nodeMap[key];
      if (!node || node.disabled || this.data.disabled) return;

      this.triggerEvent('node-tap', { node: node.raw });

      if (this.data.checkOnClick && this.data.checkable) {
        this._handleCheck(key);
      } else if (this.data.expandOnClick && !node.isLeaf) {
        this._handleExpand(key);
      } else if (this.data.selectable) {
        this._handleSelect(key);
      }
    },

    handleSwitcherTap(e) {
      const { key } = e.currentTarget.dataset;
      this._handleExpand(key);
    },

    handleCheckTap(e) {
      const { key } = e.currentTarget.dataset;
      this._handleCheck(key);
    },

    // ===== Helpers for tree-select =====

    _getNodeByKey(key) {
      return this._nodeMap[key];
    },

    _getNodePath(key) {
      const path = [];
      let current = this._nodeMap[key];
      while (current) {
        path.unshift(current.label);
        current = current.parentKey !== null ? this._nodeMap[current.parentKey] : null;
      }
      return path;
    },
  },
});
