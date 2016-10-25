'use strict';

exports.__esModule = true;
exports.default = validateEffects;

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _createErrorMessage = require('./createErrorMessage');

var _createErrorMessage2 = _interopRequireDefault(_createErrorMessage);

var _validateHelperEffectNamesMatch = require('./validateHelperEffectNamesMatch');

var _validateHelperEffectNamesMatch2 = _interopRequireDefault(_validateHelperEffectNamesMatch);

var _validateTakeHelperEffects = require('./validateTakeHelperEffects');

var _validateTakeHelperEffects2 = _interopRequireDefault(_validateTakeHelperEffects);

var _validateThrottleHelperEffect = require('./validateThrottleHelperEffect');

var _validateThrottleHelperEffect2 = _interopRequireDefault(_validateThrottleHelperEffect);

var _isHelper = require('./isHelper');

var _isHelper2 = _interopRequireDefault(_isHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validateEffects(eventChannel, effectName, effectKey, actual, expected, stepNumber) {
  var expectedIsHelper = (0, _isHelper2.default)(expected);
  var actualIsHelper = (0, _isHelper2.default)(actual);

  var finalEffectName = expectedIsHelper ? effectName + ' helper' : effectName;

  if (actual == null) {
    return (0, _createErrorMessage2.default)('expected ' + finalEffectName + ' effect, but the saga yielded nothing', stepNumber, actual, expected, effectKey);
  }

  if (!Array.isArray(actual) && actualIsHelper && !Array.isArray(expected) && expectedIsHelper) {
    var errorMessage = (0, _validateHelperEffectNamesMatch2.default)(effectName, actual, stepNumber);

    if (errorMessage) {
      return errorMessage;
    }

    if (effectName === 'throttle') {
      return (0, _validateThrottleHelperEffect2.default)(eventChannel, effectName, actual, expected, stepNumber);
    }

    return (0, _validateTakeHelperEffects2.default)(effectName, actual, expected, stepNumber);
  }

  if (Array.isArray(actual) && !Array.isArray(expected)) {
    return (0, _createErrorMessage2.default)('expected ' + finalEffectName + ' effect, but the saga yielded parallel effects', stepNumber, actual, expected, effectKey);
  }

  if (!Array.isArray(actual) && Array.isArray(expected)) {
    return (0, _createErrorMessage2.default)('expected parallel effects, but the saga yielded a single effect', stepNumber, actual, expected, effectKey);
  }

  if (!Array.isArray(actual) && !actual[effectKey] || !Array.isArray(expected) && !expected[effectKey]) {
    return (0, _createErrorMessage2.default)('expected ' + finalEffectName + ' effect, but the saga yielded a different effect', stepNumber, actual, expected);
  }

  if (!(0, _lodash2.default)(actual, expected)) {
    return (0, _createErrorMessage2.default)(finalEffectName + ' effects do not match', stepNumber, actual, expected, effectKey);
  }

  return null;
}