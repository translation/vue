"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _fs = require("fs");

var _path = require("path");

var log = _interopRequireWildcard(require("./util/log"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Translation =
/*#__PURE__*/
function () {
  function Translation(config) {
    _classCallCheck(this, Translation);

    this.config = config;
    this.setupApi();
  }

  _createClass(Translation, [{
    key: "setupApi",
    value: function setupApi() {
      this.api = _axios["default"].create({
        baseURL: 'https://translation.io/api/v1/',
        headers: {
          'x-api-key': this.config.key
        }
      });
      this.api.interceptors.response.use(function (response) {
        return response;
      }, function (error) {
        if (error.response) {
          var response = error.response;

          if (response.data && response.data.errors) {
            response.data.errors.map(function (message) {
              return log.error(message);
            });
          } else {
            log.error("".concat(response.status, ": ").concat(response.statusText, " (").concat(error.config.url, ")"));
          }
        }

        throw error;
      });
    }
  }, {
    key: "getTimestamp",
    value: function getTimestamp() {
      var timestamp = 0;

      try {
        timestamp = (0, _fs.readFileSync)((0, _path.join)(process.cwd(), 'translation.timestamp.js'), 'utf8');
      } catch (error) {}

      return timestamp;
    }
  }, {
    key: "storeTimestamp",
    value: function storeTimestamp(timestamp) {
      (0, _fs.writeFileSync)((0, _path.join)(process.cwd(), 'translation.timestamp.js'), timestamp, {
        encoding: 'utf8'
      });
    }
  }, {
    key: "init",
    value: function init(segments) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.api.post('segments/init', {
          source_language: _this.config.source_locale,
          target_languages: _this.config.target_locales,
          segments: segments
        }).then(function (response) {
          // console.log('response', response.data)
          resolve(response.data);
        }, reject);
      });
    }
  }, {
    key: "pull",
    value: function pull() {
      var _this2 = this;

      var timestamp = this.getTimestamp();
      return new Promise(function (resolve, reject) {
        _this2.api.get("source_edits/pull", {
          params: {
            timestamp: timestamp
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(function (response) {
          log.success("Pulled source edits for `".concat(response.data.project.name, "`."));

          _this2.storeTimestamp(response.data.timestamp);

          resolve(response.data);
        }, reject);
      });
    }
  }, {
    key: "sync",
    value: function sync(segments) {
      var _this3 = this;

      var readonly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var purge = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      return new Promise(function (resolve, reject) {
        _this3.api.post('segments/sync', {
          source_language: _this3.config.source_locale,
          target_languages: _this3.config.target_locales,
          segments: segments,
          readonly: readonly,
          purge: purge
        }).then(function (response) {
          resolve(response.data);
        }, reject);
      });
    }
  }]);

  return Translation;
}();

exports["default"] = Translation;