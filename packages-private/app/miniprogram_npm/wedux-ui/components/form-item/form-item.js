const validator = require('../form/validator');
const { makeDescendantRelations } = require('../../utils/relations');

const FIELD_PATHS = [
  '../input/input',
  '../textarea/textarea',
  '../switch/switch',
  '../radio-group/radio-group',
  '../checkbox-group/checkbox-group',
  '../time-picker/time-picker',
  '../date-picker/date-picker',
  '../color-picker/color-picker',
  '../rate/rate',
  '../select/select',
  '../upload/upload',
  '../tree-select/tree-select',
  '../input-otp/input-otp',
  '../stepper/stepper',
];

Component({
  options: {
    multipleSlots: true,
  },

  relations: {
    '../form/form': {
      type: 'ancestor',
    },
    ...makeDescendantRelations(FIELD_PATHS, {
      linked() {
        this._updateFieldChildren();
      },
      linkChanged() {
        this._updateFieldChildren();
      },
      unlinked() {
        this._updateFieldChildren();
      },
    }),
  },

  properties: {
    label: { type: String, value: '' },
    path: { type: String, value: '' },
    rule: { type: null, value: null },
    required: { type: Boolean, value: false },
    first: { type: Boolean, value: false },
    size: { type: String, value: '' },
    showFeedback: { type: null, value: null },
    validationStatus: { type: String, value: '' },
    feedback: { type: String, value: '' },
    labelWidth: { type: String, value: '' },
    requireMarkPlacement: { type: String, value: '' },
  },

  observers: {
    'required, path, rule'() {
      this._updateIsRequired();
    },
  },

  lifetimes: {
    created() {
      this._rule = null;
      // Store form rules as instance property to preserve function references
      this._formRulesRef = {};
    },
  },

  data: {
    _validationMessage: '',
    _validationStatus: '',
    _formSize: 'medium',
    _formDisabled: false,
    _formLabelPlacement: 'top',
    _formLabelWidth: '',
    _formShowFeedback: true,
    _formShowLabel: true,
    _formShowRequireMark: true,
    _formRequireMarkPlacement: 'right',
    _formModel: {},
    _isRequired: false,
  },

  methods: {
    _setFormContext(ctx) {
      // Store rules as instance property to preserve function references
      this._formRulesRef = ctx.rules || {};
      this.setData({
        _formSize: ctx.size,
        _formDisabled: ctx.disabled,
        _formLabelPlacement: ctx.labelPlacement,
        _formLabelWidth: ctx.labelWidth,
        _formShowFeedback: ctx.showFeedback,
        _formShowLabel: ctx.showLabel,
        _formShowRequireMark: ctx.showRequireMark,
        _formRequireMarkPlacement: ctx.requireMarkPlacement || 'right',
        _formModel: ctx.model,
      });
      this._updateIsRequired();
      this._updateFieldChildren();
    },

    _updateFieldChildren() {
      const size = this.data.size || this.data._formSize;
      const disabled = this.data._formDisabled;
      const ctx = { size, disabled };
      FIELD_PATHS.forEach((type) => {
        const nodes = this.getRelationNodes(type);
        if (nodes) {
          nodes.forEach((node) => {
            node._setFormItemContext(ctx);
          });
        }
      });
    },

    _updateIsRequired() {
      if (this.data.required) {
        this.setData({ _isRequired: true });
        return;
      }
      const rules = this._getRules();
      let isRequired = false;
      for (let i = 0; i < rules.length; i++) {
        if (rules[i].required) {
          isRequired = true;
          break;
        }
      }
      this.setData({ _isRequired: isRequired });
    },

    /**
     * Set rules with custom validator functions on this form-item.
     * Use this instead of the rule property when rules contain functions.
     */
    setRule(rule) {
      this._rule = rule || null;
      this._updateIsRequired();
    },

    _getRules() {
      const rules = [];
      // Form-level rules (from instance ref, preserves function references)
      const path = this.data.path;
      const formRulesObj = this._formRulesRef || {};
      if (path && formRulesObj[path]) {
        const formRules = formRulesObj[path];
        rules.push(...(Array.isArray(formRules) ? formRules : [formRules]));
      }
      // Component-level rules (setRule > property)
      const itemRule = this._rule || this.data.rule;
      if (itemRule) {
        rules.push(...(Array.isArray(itemRule) ? itemRule : [itemRule]));
      }
      // Auto-add required rule
      if (this.data.required) {
        let hasRequired = false;
        for (let i = 0; i < rules.length; i++) {
          if (rules[i].required) {
            hasRequired = true;
            break;
          }
        }
        if (!hasRequired) {
          rules.unshift({ required: true, message: '此项为必填' });
        }
      }
      return rules;
    },

    _getValue() {
      const path = this.data.path;
      if (path && this.data._formModel) {
        return this.data._formModel[path];
      }
      return undefined;
    },

    /**
     * Public validate method (naive-ui style).
     * Usage:
     *   formItem.validate()
     *   formItem.validate({ trigger: 'blur' })
     *   formItem.validate({ trigger: 'password-input' })
     * @param {Object} [options]
     * @param {String} [options.trigger] - filter rules by trigger
     * @returns {{ valid: Boolean, errors: Array }}
     */
    validate(options) {
      const opts = options || {};
      return this._validate(opts.trigger);
    },

    _validate(trigger) {
      // Manual status overrides
      if (this.data.validationStatus) {
        return {
          valid: this.data.validationStatus !== 'error',
          errors: this.data.feedback ? [{ message: this.data.feedback }] : [],
        };
      }
      const rules = this._getRules();
      const value = this._getValue();
      const result = validator.validateField(value, rules, {
        trigger,
        first: this.data.first,
      });
      this.setData({
        _validationStatus: result.valid ? '' : 'error',
        _validationMessage: result.errors.length > 0 ? result.errors[0].message : '',
      });
      return result;
    },

    _restoreValidation() {
      this.setData({
        _validationStatus: '',
        _validationMessage: '',
      });
    },

    /**
     * Public alias for _restoreValidation.
     */
    restoreValidation() {
      this._restoreValidation();
    },

    _handleFieldChange() {
      this._validate('input');
    },

    _handleFieldBlur() {
      this._validate('blur');
    },
  },
});
