"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchSegmentsFromLanguageFiles = void 0;

var _glob = require("glob");

var _fs = require("fs");

var _path = require("path");

var _dotObject = require("dot-object");

var log = _interopRequireWildcard(require("./log"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var fetchSegmentsFromLanguageFiles = function fetchSegmentsFromLanguageFiles(config) {
  if (!(0, _fs.existsSync)(config.translations_directory)) {
    (0, _fs.mkdirSync)(config.translations_directory);
  }

  var languageFilesPath = (0, _path.resolve)(process.cwd(), config.translations_directory);
  var languageFiles = (0, _fs.readdirSync)(languageFilesPath).map(function (file) {
    var languagePath = (0, _path.resolve)(process.cwd(), config.translations_directory, file);
    var languageObject;

    if (config.output === 'module') {
      languageObject = require(languagePath);
    } else {
      var languageModule = require(languagePath);

      var defaultImport = languageModule["default"];
      languageObject = defaultImport ? defaultImport : languageModule;
    }

    var fileName = file.replace(process.cwd(), '');
    return {
      fileName: fileName,
      path: file,
      content: languageObject
    };
  });

  if (languageFiles.length === 0) {
    return [];
  }

  return languageFiles.reduce(function (accumulator, file) {
    var language = file.fileName.substring(file.fileName.lastIndexOf('/') + 1, file.fileName.lastIndexOf('.'));
    var flattenedObject = (0, _dotObject.dot)(file.content);
    var segmentsInFile = Object.keys(flattenedObject).map(function (key, index) {
      if (config.translations_type === 'key') {
        return {
          key: key,
          target: flattenedObject[key]
        };
      } else {
        return {
          source: key,
          target: flattenedObject[key]
        };
      }
    });
    accumulator[language] = segmentsInFile;
    return accumulator;
  }, {});
};

exports.fetchSegmentsFromLanguageFiles = fetchSegmentsFromLanguageFiles;