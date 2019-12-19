"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verbose = exports.error = exports.warn = exports.success = exports.info = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var print = function print(color) {
  return function () {
    for (var _len = arguments.length, str = new Array(_len), _key = 0; _key < _len; _key++) {
      str[_key] = arguments[_key];
    }

    console.log(color(str));
  };
};

var info = print(_chalk["default"].cyan);
exports.info = info;
var success = print(_chalk["default"].green);
exports.success = success;
var warn = print(_chalk["default"].yellow);
exports.warn = warn;
var error = print(_chalk["default"].red);
exports.error = error;
var verbose = print(_chalk["default"].magenta);
exports.verbose = verbose;