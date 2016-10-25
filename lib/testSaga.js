'use strict';

exports.__esModule = true;

var _reduxSaga = require('redux-saga');

var reduxSaga = _interopRequireWildcard(_reduxSaga);

var _createTestSaga = require('./createTestSaga');

var _createTestSaga2 = _interopRequireDefault(_createTestSaga);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = (0, _createTestSaga2.default)(reduxSaga);