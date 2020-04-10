#!/usr/bin/env node
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _commander = _interopRequireDefault(require("commander"));

var _package = _interopRequireDefault(require("../package.json"));

var _resolveConfig = _interopRequireDefault(require("./util/resolveConfig"));

var log = _interopRequireWildcard(require("./util/log"));

var _sync = _interopRequireDefault(require("./commands/sync"));

var _init = _interopRequireDefault(require("./commands/init"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_commander["default"].version(_package["default"].version, '-v, --version').option('-c, --config <path>', 'Set the config path. Defaults to ./translation.json', './translation.json');

_commander["default"].command('init').description('Init the translation.io project by pushing all source and translated text into the backend. This should only be executed one time per project.').action(function (options) {
  var config = (0, _resolveConfig["default"])(options, _commander["default"].config);

  if (config === null) {
    log.error('The configuration file is missing. Please create a `translation.json` configuration file at the root of your project.');
    return;
  }

  (0, _init["default"])(config);
});

_commander["default"].command('sync').description('Sync translations').option('-p, --purge', 'Purge when syncing keys', false).option('-r, --readonly', 'Only pull translations (do not push local translations)', false).action(function (options) {
  var config = (0, _resolveConfig["default"])(options, _commander["default"].config);

  if (config === null) {
    log.error('The configuration file is missing. Please create a `translation.json` configuration file at the root of your project.');
    return;
  }

  (0, _sync["default"])(config);
});

_commander["default"].parse(process.argv);

if (process.argv.length === 2) {
  _commander["default"].help();
}