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
  log.info('Synchronizing project over Translation.io ...');
  var segmentsFromVueFiles = (0, _source.fetchSegmentsFromVueFiles)(config);
  var segmentsFromLanguageFiles = (0, _languages.fetchSegmentsFromLanguageFiles)(config);

  if (segmentsFromVueFiles.length === 0) {
    log.error('No translations found in your vue files. Please check your `source_path` config and make sure you have localized strings in your code.');
    return;
  }

  if (Object.keys(segmentsFromLanguageFiles).length === 0) {
    log.error('No language files where found. Please check your `translations_directory` config.');
    return;
  }

  var sourceTranslations = segmentsFromLanguageFiles[config.source_locale] || [];
  var sourceSegments = segmentsFromVueFiles.map(function (segment) {
    if (config.translations_type === 'key') {
      var sourceTranslation = sourceTranslations.find(function (source) {
        return source.key === segment.path;
      });

      if (!sourceTranslation) {
        // Add missing keys to the source translations
        sourceTranslations.push({
          type: 'key',
          key: segment.path,
          source: config.default_empty ? '' : segment.path
        });
      }

      return {
        type: 'key',
        key: segment.path,
        source: sourceTranslation ? sourceTranslation.target : config.default_empty ? '' : segment.path
      };
    } else {
      return {
        type: 'source',
        source: segment.path
      };
    }
  });

  if (config.translations_type === 'key') {
    // Remove unused keys from source translations
    sourceTranslations.forEach(function (translation, index) {
      if (sourceSegments.findIndex(function (segment) {
        return segment.key === translation.key;
      }) < 0) {
        log.warn('Remove unused translation', translation.key);
        sourceTranslations.splice(index, 1);
      }
    }); // Update source translations file

    var updatedSourceTranslations = {};
    sourceTranslations.forEach(function (segment) {
      updatedSourceTranslations[segment.key] = segment.target;
    });
    (0, _fs.writeFileSync)((0, _path.join)(process.cwd(), config.translations_directory, "".concat(config.source_locale, ".json")), JSON.stringify(updatedSourceTranslations, null, 4), {
      encoding: 'utf8'
    });

    if (config.debug) {
      (0, _fs.writeFileSync)((0, _path.join)(process.cwd(), 'translation-debug-sync-source-translations.json'), JSON.stringify(sourceTranslations, null, 4), {
        encoding: 'utf8'
      });
    }
  }

  if (config.debug) {
    (0, _fs.writeFileSync)((0, _path.join)(process.cwd(), 'translation-debug-sync-segments.json'), JSON.stringify(sourceSegments, null, 4), {
      encoding: 'utf8'
    });
  }

  var api = new _Translation["default"](config);

  if (config.translations_type === 'key') {
    api.pull().then(function (data) {
      if (data.source_edits.length === 0) {
        log.info("No source edits for `".concat(data.project.name, "`"));
        return;
      } // Update source edits


      data.source_edits.forEach(function (edit) {
        var translationIndex = sourceTranslations.findIndex(function (translation) {
          return translation.key === edit.key;
        });

        if (translationIndex >= 0) {
          log.info("Replacing old traduction `".concat(edit.new_source, "` by `").concat(edit.old_source, "` for key `").concat(edit.key, "`."));
          sourceTranslations[translationIndex].target = edit.new_source;
        }
      }); // Update source translations in file

      var translations = {};
      sourceTranslations.forEach(function (segment) {
        translations[segment.key] = segment.target;
      });
      (0, _fs.writeFileSync)((0, _path.join)(process.cwd(), config.translations_directory, "".concat(config.source_locale, ".json")), JSON.stringify(translations, null, 4), {
        encoding: 'utf8'
      });
    });
  }

  api.sync(sourceSegments, config.readonly, config.purge).then(function (data) {
    if (config.debug) {
      (0, _fs.writeFileSync)((0, _path.join)(process.cwd(), 'translation-debug-sync-response.json'), JSON.stringify(data, null, 4), {
        encoding: 'utf8'
      });
    }

    Object.keys(data.segments).forEach(function (locale) {
      var translations = {};
      data.segments[locale].forEach(function (segment) {
        if (segment.target) {
          // Only add existing translations to allow fallback
          if (config.translations_type === 'key') {
            translations[segment.key] = segment.target;
          } else {
            translations[segment.source] = segment.target;
          }
        }
      });
      (0, _fs.writeFileSync)((0, _path.join)(process.cwd(), config.translations_directory, "".concat(locale, ".json")), JSON.stringify(translations, null, 4), {
        encoding: 'utf8'
      });
    });

    if (config.purge) {
      // Perform purge
      log.success("`".concat(data.unused_segment_ids.length, "` segments removed."));
    }

    log.success("Project `".concat(data.project.name, "` synchronized with success."));
  }, function (error) {
    log.error('An error occured..');
    log.error(error.message);
  });
}