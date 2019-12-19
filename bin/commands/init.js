"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var log = _interopRequireWildcard(require("../util/log"));

var _Translation = _interopRequireDefault(require("../Translation"));

var _languages = require("../util/languages");

var _source = require("../util/source");

var _path = require("path");

var _fs = require("fs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _default(config) {
  log.info('Initializing project over Translation.io ...');

  if (config === null) {
    log.error('The configuration file is missing. Please create a `translation.json` configuration file at the root of your project.');
    return;
  }

  var segmentsFromVueFiles = (0, _source.fetchSegmentsFromVueFiles)(config);
  var segmentsFromLanguageFiles = (0, _languages.fetchSegmentsFromLanguageFiles)(config);
  var sourceTranslations = segmentsFromLanguageFiles[config.source_locale] || [];
  var segments = {};
  config.target_locales.forEach(function (locale) {
    segments[locale] = [];
  });
  segmentsFromVueFiles.forEach(function (segment) {
    var sourceTranslation = sourceTranslations.find(function (source) {
      return source.key === segment.path;
    });
    config.target_locales.forEach(function (locale) {
      if (config.translations_type === 'key') {
        segments[locale].push({
          type: 'key',
          key: segment.path,
          source: sourceTranslation ? sourceTranslation.target : '',
          target: ''
        });
      } else {
        segments[locale].push({
          type: 'source',
          source: segment.path,
          target: ''
        });
      }
    });
  });

  if (options.debug) {
    (0, _fs.writeFileSync)((0, _path.join)(process.cwd(), "translation-debug-segments.json"), JSON.stringify(segments, null, 4), {
      encoding: 'utf8'
    });
  }

  Object.keys(segments).forEach(function (locale) {
    var languageTranslations = segmentsFromLanguageFiles[locale];

    if (languageTranslations) {
      languageTranslations.forEach(function (translation) {
        if (!translation.target) {
          return;
        }

        if (config.translations_type === 'key') {
          var segmentIndex = segments[locale].findIndex(function (segment) {
            return segment.key === translation.key;
          });

          if (segmentIndex >= 0) {
            segments[locale][segmentIndex].target = translation.target;
          }
        } else {
          var _segmentIndex = segments[locale].findIndex(function (segment) {
            return segment.source === translation.source;
          });

          if (_segmentIndex >= 0) {
            segments[locale][_segmentIndex].target = translation.target;
          }
        }
      });
    }
  });

  if (options.debug) {
    // Write debug files
    Object.keys(segments).forEach(function (locale) {
      (0, _fs.writeFileSync)((0, _path.join)(process.cwd(), "translation-debug-translations-".concat(locale, ".json")), JSON.stringify(segmentsFromLanguageFiles[locale], null, 4), {
        encoding: 'utf8'
      });
      (0, _fs.writeFileSync)((0, _path.join)(process.cwd(), "translation-debug-segments-".concat(locale, ".json")), JSON.stringify(segments[locale], null, 4), {
        encoding: 'utf8'
      });
      segments[locale].forEach(function (segment) {// console.log(locale, segment)
      });
    });
  }

  var translation = new _Translation["default"](config);
  translation.init(segments).then(function (data) {
    log.success("Project `".concat(data.project.name, "` initialized with success."));

    if (options.debug) {
      (0, _fs.writeFileSync)((0, _path.join)(process.cwd(), "translation-debug-init-success.json"), JSON.stringify(data, null, 4), {
        encoding: 'utf8'
      });
    }

    Object.keys(data.segments).forEach(function (locale) {
      var translations = {};
      data.segments[locale].forEach(function (segment) {
        if (config.translations_type === 'key') {
          translations[segment.key] = segment.target;
        } else {
          translations[segment.source] = segment.target;
        }
      });
      (0, _fs.writeFileSync)((0, _path.join)(process.cwd(), config.translations_directory, "".concat(locale, ".json")), JSON.stringify(translations, null, 4), {
        encoding: 'utf8'
      });
    });
  }, function (error) {
    if (options.debug) {
      (0, _fs.writeFileSync)((0, _path.join)(process.cwd(), "translation-debug-init-error.json"), JSON.stringify(error, null, 4), {
        encoding: 'utf8'
      });
    }
  });
}