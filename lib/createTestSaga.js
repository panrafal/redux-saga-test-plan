'use strict';

exports.__esModule = true;
exports.default = createTestSaga;

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.matches');

var _lodash4 = _interopRequireDefault(_lodash3);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _historyTypes = require('./historyTypes');

var _keys = require('./keys');

var _SagaTestError = require('./SagaTestError');

var _SagaTestError2 = _interopRequireDefault(_SagaTestError);

var _identity = require('./identity');

var _identity2 = _interopRequireDefault(_identity);

var _createErrorMessage = require('./createErrorMessage');

var _createErrorMessage2 = _interopRequireDefault(_createErrorMessage);

var _assertSameEffect = require('./assertSameEffect');

var _assertSameEffect2 = _interopRequireDefault(_assertSameEffect);

var _validateTakeHelperEffects = require('./validateTakeHelperEffects');

var _validateTakeHelperEffects2 = _interopRequireDefault(_validateTakeHelperEffects);

var _validateThrottleHelperEffect = require('./validateThrottleHelperEffect');

var _validateThrottleHelperEffect2 = _interopRequireDefault(_validateThrottleHelperEffect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createTestSaga(rs) {
  var effects = rs.effects;
  var is = rs.utils.is;


  return function testSaga(saga) {
    var api = {
      next: next,
      back: back,
      finish: finish,
      restart: restart,
      save: save,
      restore: restore,
      throw: throwError,
      takeEvery: createTakeHelperProgresser('takeEvery'),
      takeLatest: createTakeHelperProgresser('takeLatest'),
      throttle: createThrottleHelperProgresser('throttle')
    };

    var savePoints = {};
    var history = [];

    for (var _len = arguments.length, sagaArgs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      sagaArgs[_key - 1] = arguments[_key];
    }

    var finalSagaArgs = sagaArgs;
    var iterator = createIterator();

    function createEffectTester(name, key) {
      var effect = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _identity2.default;

      return function (yieldedValue) {
        return function () {
          (0, _assertSameEffect2.default)(rs.eventChannel, name, key, yieldedValue, effect.apply(undefined, arguments), history.length);

          return api;
        };
      };
    }

    function createEffectTesterFromEffects(name, key) {
      if (!(name in effects)) {
        return function () {
          return function () {
            throw new Error('The ' + name + ' effect is not available in your version of redux-saga.');
          };
        };
      }

      return createEffectTester(name, key, effects[name]);
    }

    function createEffectHelperTester(name) {
      if (!(name in rs)) {
        return function () {
          return function () {
            throw new Error('Your version of redux-saga does not support ' + name + '.');
          };
        };
      }

      if (!('helper' in is)) {
        return function () {
          return function () {
            throw new Error('Your version of redux-saga does not support yielding ' + name + ' directly.');
          };
        };
      }

      // eslint-disable-next-line import/namespace
      return createEffectTester(name, undefined, rs[name]);
    }

    var effectsTestersCreators = {
      actionChannel: createEffectTesterFromEffects('actionChannel', _keys.ACTION_CHANNEL),
      apply: createEffectTesterFromEffects('apply', _keys.CALL),
      call: createEffectTesterFromEffects('call', _keys.CALL),
      cancel: createEffectTesterFromEffects('cancel', _keys.CANCEL),
      cancelled: createEffectTesterFromEffects('cancelled', _keys.CANCELLED),
      cps: createEffectTesterFromEffects('cps', _keys.CPS),
      flush: createEffectTesterFromEffects('flush', _keys.FLUSH),
      fork: createEffectTesterFromEffects('fork', _keys.FORK),
      join: createEffectTesterFromEffects('join', _keys.JOIN),
      parallel: createEffectTester('parallel'),
      put: createEffectTesterFromEffects('put', _keys.PUT),
      race: createEffectTesterFromEffects('race', _keys.RACE),
      select: createEffectTesterFromEffects('select', _keys.SELECT),
      spawn: createEffectTesterFromEffects('spawn', _keys.FORK),
      take: createEffectTesterFromEffects('take', _keys.TAKE),
      takem: createEffectTesterFromEffects('takem', _keys.TAKE),
      takeEveryFork: createEffectHelperTester('takeEvery'),
      takeLatestFork: createEffectHelperTester('takeLatest'),
      throttleFork: createEffectHelperTester('throttle'),

      isDone: function isDone(done) {
        return function () {
          if (!done) {
            throw new _SagaTestError2.default('saga not done');
          }

          return api;
        };
      },

      is: function is(value) {
        return function (arg) {
          if (!(0, _lodash2.default)(arg, value)) {
            var errorMessage = (0, _createErrorMessage2.default)('yielded values do not match', history.length, value, arg);

            throw new _SagaTestError2.default(errorMessage);
          }

          return api;
        };
      },

      matches: function matches(value) {
        return function (arg) {
          if (!(0, _lodash4.default)(arg)(value)) {
            var errorMessage = (0, _createErrorMessage2.default)('yielded values do not match', history.length, value, arg);

            throw new _SagaTestError2.default(errorMessage);
          }

          return api;
        };
      },

      returns: function returns(value, done) {
        return function (arg) {
          if (!done) {
            throw new _SagaTestError2.default('saga not done');
          }

          if (!(0, _lodash2.default)(arg, value)) {
            var errorMessage = (0, _createErrorMessage2.default)('returned values do not match', history.length, value, arg);

            throw new _SagaTestError2.default(errorMessage);
          }

          return api;
        };
      },

      yields: function yields(value) {
        return function (fn) {
          if (typeof fn !== 'function') {
            throw new _SagaTestError2.default('must pass a function to yields');
          }

          fn(value);

          return api;
        };
      }

    };

    function createIterator() {
      return saga.apply(undefined, finalSagaArgs);
    }

    function apiWithEffectsTesters(_ref) {
      var value = _ref.value;
      var done = _ref.done;

      return (0, _objectAssign2.default)({}, api, {
        actionChannel: effectsTestersCreators.actionChannel(value),
        apply: effectsTestersCreators.apply(value),
        call: effectsTestersCreators.call(value),
        cancel: effectsTestersCreators.cancel(value),
        cancelled: effectsTestersCreators.cancelled(value),
        cps: effectsTestersCreators.cps(value),
        flush: effectsTestersCreators.flush(value),
        fork: effectsTestersCreators.fork(value),
        join: effectsTestersCreators.join(value),
        parallel: effectsTestersCreators.parallel(value),
        put: effectsTestersCreators.put(value),
        race: effectsTestersCreators.race(value),
        select: effectsTestersCreators.select(value),
        spawn: effectsTestersCreators.spawn(value),
        take: effectsTestersCreators.take(value),
        takem: effectsTestersCreators.takem(value),
        takeEveryFork: effectsTestersCreators.takeEveryFork(value),
        takeLatestFork: effectsTestersCreators.takeLatestFork(value),
        throttleFork: effectsTestersCreators.throttleFork(value),
        is: effectsTestersCreators.is(value),
        matches: effectsTestersCreators.matches(value),
        isDone: effectsTestersCreators.isDone(done),
        getValue: function getValue() {
          return value;
        },

        returns: effectsTestersCreators.returns(value, done),
        yields: effectsTestersCreators.yields(value)
      });
    }

    function restart() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      if (args.length > 0) {
        finalSagaArgs = args;
      }

      history = [];
      iterator = createIterator();

      return api;
    }

    function next() {
      var arg = arguments.length <= 0 ? undefined : arguments[0];
      var result = void 0;

      if (arguments.length === 0) {
        history.push({ type: _historyTypes.NONE });
        result = iterator.next();
      } else {
        history.push({ type: _historyTypes.ARGUMENT, value: arg });
        result = iterator.next(arg);
      }

      return apiWithEffectsTesters(result);
    }

    function finish() {
      var arg = arguments.length <= 0 ? undefined : arguments[0];
      var result = void 0;

      if (arguments.length === 0) {
        history.push({ type: _historyTypes.FINISH });
        result = iterator.return();
      } else {
        history.push({ type: _historyTypes.FINISH_ARGUMENT, value: arg });
        result = iterator.return(arg);
      }

      return apiWithEffectsTesters(result);
    }

    function throwError(error) {
      history.push({ type: _historyTypes.ERROR, value: error });

      var result = iterator.throw(error);

      return apiWithEffectsTesters(result);
    }

    function restore(name) {
      if (!savePoints[name]) {
        throw new Error('No such save point ' + name);
      }

      iterator = createIterator();
      history = savePoints[name];
      return applyHistory();
    }

    function back() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      if (n > history.length) {
        throw new Error('Cannot go back any further');
      }

      var m = n;

      while (m--) {
        history.pop();
      }

      iterator = createIterator();

      return applyHistory();
    }

    function save(name) {
      savePoints[name] = history.slice(0);
      return api;
    }

    function createTakeHelperProgresser(helperName) {
      // eslint-disable-next-line import/namespace
      var helper = rs[helperName];

      return function takeHelperProgresser(pattern, otherSaga) {
        for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
          args[_key3 - 2] = arguments[_key3];
        }

        var errorMessage = (0, _validateTakeHelperEffects2.default)(helperName, iterator, // this will be mutated (i.e. 2 steps will be taken)
        helper.apply(undefined, [pattern, otherSaga].concat(args)), history.length + 1);

        history.push({ type: _historyTypes.NONE });
        history.push({ type: _historyTypes.NONE });

        if (errorMessage) {
          throw new _SagaTestError2.default(errorMessage);
        }

        return api;
      };
    }

    function createThrottleHelperProgresser(helperName) {
      if (!(helperName in rs)) {
        return function () {
          throw new Error('Your version of redux-saga does not support ' + helperName + '.');
        };
      }

      // eslint-disable-next-line import/namespace
      var helper = rs[helperName];

      return function throttleHelperProgresser(delayTime, pattern, otherSaga) {
        for (var _len4 = arguments.length, args = Array(_len4 > 3 ? _len4 - 3 : 0), _key4 = 3; _key4 < _len4; _key4++) {
          args[_key4 - 3] = arguments[_key4];
        }

        var errorMessage = (0, _validateThrottleHelperEffect2.default)(rs.eventChannel, helperName, iterator, // this will be mutated (i.e. 4 steps will be taken)
        helper.apply(undefined, [delayTime, pattern, otherSaga].concat(args)), history.length + 1);

        history.push({ type: _historyTypes.NONE });
        history.push({ type: _historyTypes.NONE });
        history.push({ type: _historyTypes.NONE });
        history.push({ type: _historyTypes.NONE });

        if (errorMessage) {
          throw new _SagaTestError2.default(errorMessage);
        }

        return api;
      };
    }

    function applyHistory() {
      for (var i = 0, l = history.length; i < l; i++) {
        var arg = history[i];

        switch (arg.type) {
          case _historyTypes.NONE:
            iterator.next();
            break;

          case _historyTypes.ARGUMENT:
            iterator.next(arg.value);
            break;

          case _historyTypes.ERROR:
            iterator.throw(arg.value);
            break;

          case _historyTypes.FINISH:
            iterator.return();
            break;

          case _historyTypes.FINISH_ARGUMENT:
            iterator.return(arg.value);
            break;

          // no default
        }
      }

      return api;
    }

    return api;
  };
}