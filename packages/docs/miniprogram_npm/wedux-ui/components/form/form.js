Component({
  behaviors: ['wx://form-field-group'],

  relations: {
    '../form-item/form-item': {
      type: 'descendant',
      linked() {
        this._updateChildren();
      },
      linkChanged() {
        this._updateChildren();
      },
      unlinked() {
        this._updateChildren();
      },
    },
  },

  properties: {
    model: { type: Object, value: {} },
    rules: { type: Object, value: {} },
    size: { type: String, value: 'medium' },
    disabled: { type: Boolean, value: false },
    labelPlacement: { type: String, value: 'top' },
    labelWidth: { type: String, value: '' },
    showFeedback: { type: Boolean, value: true },
    showLabel: { type: Boolean, value: true },
    showRequireMark: { type: Boolean, value: true },
    requireMarkPlacement: { type: String, value: 'right' },
    inline: { type: Boolean, value: false },
  },

  observers: {
    'model, rules, size, disabled, labelPlacement, labelWidth, showFeedback, showLabel, showRequireMark, requireMarkPlacement'() {
      this._updateChildren();
    },
  },

  lifetimes: {
    created() {
      // Store rules with functions here (not in data, to survive serialization)
      this._rules = null;
    },
  },

  methods: {
    /**
     * Set rules with custom validator functions.
     * Use this instead of the rules property when rules contain functions,
     * because setData/WXML data binding strips functions.
     *
     * Usage (in page's onReady):
     *   this.selectComponent('#form').setRules({
     *     age: [{ validator(rule, value) { ... }, trigger: 'blur' }]
     *   })
     */
    setRules(rules) {
      this._rules = rules || null;
      this._updateChildren();
    },

    /**
     * Get the effective rules (setRules > property).
     */
    _getEffectiveRules() {
      return this._rules || this.data.rules || {};
    },

    _updateChildren() {
      const children = this.getRelationNodes('../form-item/form-item');
      if (!children) return;
      const ctx = {
        size: this.data.size,
        disabled: this.data.disabled,
        labelPlacement: this.data.labelPlacement,
        labelWidth: this.data.labelWidth,
        showFeedback: this.data.showFeedback,
        showLabel: this.data.showLabel,
        showRequireMark: this.data.showRequireMark,
        requireMarkPlacement: this.data.requireMarkPlacement,
        model: this.data.model,
        rules: this._getEffectiveRules(),
      };
      children.forEach((child) => {
        child._setFormContext(ctx);
      });
    },

    getFieldValue(path) {
      if (!path || !this.data.model) return undefined;
      return this.data.model[path];
    },

    getRulesForPath(path) {
      const rules = this._getEffectiveRules();
      if (!path || !rules) return [];
      const r = rules[path];
      if (!r) return [];
      return Array.isArray(r) ? r : [r];
    },

    /**
     * Validate all form items (naive-ui style).
     * @param {Function} [callback] - callback(errors)
     *   errors: undefined if all valid, Array<{ field, message }> if invalid
     *
     * Usage:
     *   form.validate((errors) => {
     *     if (!errors) { // success }
     *     else { console.log(errors) }
     *   })
     */
    validate(callback) {
      const children = this.getRelationNodes('../form-item/form-item');
      if (!children || children.length === 0) {
        callback && callback(undefined);
        return;
      }
      const errors = [];
      children.forEach((child) => {
        const result = child._validate();
        if (!result.valid) {
          result.errors.forEach((error) => {
            errors.push({
              field: child.data.path,
              message: error.message,
            });
          });
        }
      });
      callback && callback(errors.length > 0 ? errors : undefined);
    },

    restoreValidation() {
      const children = this.getRelationNodes('../form-item/form-item');
      if (!children) return;
      children.forEach((child) => {
        child._restoreValidation();
      });
    },
  },
});
