/**
 * Form validation engine - powered by validator.js
 * style: validator(rule, value) => true | new Error('msg') | false
 * API: validateField(value, rules) => { valid, errors }
 */

import validatorLib from '../../libs/validator_13_56_26.min.js';

// Map rule.type to validator.js method + default message
var typeMap = {
  // Basic types
  string: {
    check(v) {
      return typeof v === 'string';
    },
    msg: '请输入字符串',
  },
  number: {
    check(v) {
      return !isNaN(Number(v));
    },
    msg: '请输入数字',
  },
  integer: { fn: 'isInt', msg: '请输入整数' },
  float: { fn: 'isFloat', msg: '请输入数字' },
  boolean: {
    check(v) {
      return v === true || v === false || v === 'true' || v === 'false';
    },
    msg: '请输入布尔值',
  },

  // Format types
  email: { fn: 'isEmail', msg: '邮箱格式不正确' },
  url: { fn: 'isURL', msg: 'URL 格式不正确' },
  phone: { fn: 'isMobilePhone', args: ['zh-CN'], msg: '手机号格式不正确' },
  ip: { fn: 'isIP', msg: 'IP 地址格式不正确' },
  date: { fn: 'isDate', msg: '日期格式不正确' },
  hex: { fn: 'isHexadecimal', msg: '十六进制格式不正确' },
  json: { fn: 'isJSON', msg: 'JSON 格式不正确' },
  ascii: { fn: 'isAscii', msg: '请输入 ASCII 字符' },
  alpha: { fn: 'isAlpha', msg: '请输入字母' },
  alphanumeric: { fn: 'isAlphanumeric', msg: '请输入字母或数字' },
  numeric: { fn: 'isNumeric', msg: '请输入数字' },
  uuid: { fn: 'isUUID', msg: 'UUID 格式不正确' },
  creditCard: { fn: 'isCreditCard', msg: '信用卡号格式不正确' },
  postalCode: { fn: 'isPostalCode', args: ['CN'], msg: '邮编格式不正确' },
  idCard: { fn: 'isIdentityCard', args: ['zh-CN'], msg: '身份证号格式不正确' },
  hexColor: { fn: 'isHexColor', msg: '颜色格式不正确' },
  lowercase: { fn: 'isLowercase', msg: '请输入小写字母' },
  uppercase: { fn: 'isUppercase', msg: '请输入大写字母' },
};

function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

/**
 * Extract error message from validator result.
 * style: new Error('msg'), string, false, true
 */
function extractError(result, fallbackMsg) {
  if (result === true) return null;
  if (result === false) return fallbackMsg || '校验失败';
  if (result instanceof Error) return result.message || fallbackMsg || '校验失败';
  if (typeof result === 'string') return result;
  return fallbackMsg || '校验失败';
}

function validateRule(value, rule) {
  // Custom validator takes priority
  if (typeof rule.validator === 'function') {
    var result = rule.validator(rule, value);
    var err = extractError(result, rule.message);
    if (err) return err;
    return null;
  }

  // Required check
  if (rule.required && isEmpty(value)) {
    return rule.message || '此项为必填';
  }

  // Skip remaining rules if value is empty and not required
  if (isEmpty(value)) return null;

  var strVal = String(value);

  // Type check via validator.js
  if (rule.type) {
    var typeDef = typeMap[rule.type];
    if (typeDef) {
      var passed = false;
      if (typeDef.check) {
        passed = typeDef.check(value);
      } else if (typeDef.fn && typeof validatorLib[typeDef.fn] === 'function') {
        var args = rule.validatorArgs || typeDef.args || [];
        passed = validatorLib[typeDef.fn].apply(validatorLib, [strVal].concat(args));
      }
      if (!passed) {
        return rule.message || typeDef.msg;
      }
    }
  }

  // Direct validator.js method: rule.validatorFn = 'isEmail' etc.
  if (rule.validatorFn && typeof validatorLib[rule.validatorFn] === 'function') {
    var fnArgs = rule.validatorArgs || [];
    if (!validatorLib[rule.validatorFn].apply(validatorLib, [strVal].concat(fnArgs))) {
      return rule.message || '格式不正确';
    }
  }

  // Pattern check
  if (rule.pattern) {
    var patternReg = typeof rule.pattern === 'string' ? new RegExp(rule.pattern) : rule.pattern;
    if (!patternReg.test(strVal)) {
      return rule.message || '格式不正确';
    }
  }

  // Length / range check
  if (typeof rule.min === 'number' || typeof rule.max === 'number') {
    if (rule.type === 'number' || rule.type === 'integer' || rule.type === 'float') {
      var numVal = Number(value);
      if (typeof rule.min === 'number' && numVal < rule.min) {
        return rule.message || '不能小于 ' + rule.min;
      }
      if (typeof rule.max === 'number' && numVal > rule.max) {
        return rule.message || '不能大于 ' + rule.max;
      }
    } else {
      var lenOpts = {};
      if (typeof rule.min === 'number') lenOpts.min = rule.min;
      if (typeof rule.max === 'number') lenOpts.max = rule.max;
      if (!validatorLib.isLength(strVal, lenOpts)) {
        if (typeof rule.min === 'number' && typeof rule.max === 'number') {
          return rule.message || '长度应在 ' + rule.min + '-' + rule.max + ' 之间';
        }
        if (typeof rule.min === 'number') {
          return rule.message || '长度不能少于 ' + rule.min;
        }
        return rule.message || '长度不能超过 ' + rule.max;
      }
    }
  }

  // Whitelist / enum check
  if (rule.enum && Array.isArray(rule.enum)) {
    if (rule.enum.indexOf(value) === -1 && rule.enum.indexOf(strVal) === -1) {
      return rule.message || '值不在允许范围内';
    }
  }

  return null;
}

/**
 * Filter rules by trigger.
 * @param {Array} rules
 * @param {String} trigger
 * @returns {Array}
 */
function filterByTrigger(rules, trigger) {
  if (!trigger) return rules;
  var filtered = [];
  for (var i = 0; i < rules.length; i++) {
    var r = rules[i];
    if (!r.trigger) {
      filtered.push(r);
      continue;
    }
    var triggers = Array.isArray(r.trigger) ? r.trigger : [r.trigger];
    if (triggers.indexOf(trigger) >= 0) {
      filtered.push(r);
    }
  }
  return filtered;
}

/**
 * Validate a value against an array of rules.
 * @param {*} value
 * @param {Array|Object} rules - single rule or array of rules
 * @param {Object} [options]
 * @param {String} [options.trigger] - filter rules by trigger
 * @param {Boolean} [options.first] - stop at first error
 * @returns {{ valid: Boolean, errors: Array<{ message: String }> }}
 */
function validateField(value, rules, options) {
  if (!rules) return { valid: true, errors: [] };
  var ruleList = Array.isArray(rules) ? rules : [rules];
  var opts = options || {};

  if (opts.trigger) {
    ruleList = filterByTrigger(ruleList, opts.trigger);
  }

  if (ruleList.length === 0) return { valid: true, errors: [] };

  var errors = [];
  for (var i = 0; i < ruleList.length; i++) {
    var msg = validateRule(value, ruleList[i]);
    if (msg) {
      errors.push({ message: msg });
      if (opts.first) break;
    }
  }
  return {
    valid: errors.length === 0,
    errors: errors,
  };
}

module.exports = {
  validateField: validateField,
};
