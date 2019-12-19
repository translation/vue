"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchSegmentsFromVueFiles = void 0;

var _regeneratorRuntime = _interopRequireDefault(require("regenerator-runtime"));

var _glob = require("glob");

var _fs = require("fs");

var _path = require("path");

var log = _interopRequireWildcard(require("./log"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _marked =
/*#__PURE__*/
_regeneratorRuntime["default"].mark(getMatches);

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var fetchSegmentsFromVueFiles = function fetchSegmentsFromVueFiles(config) {
  var vueFilesPath = (0, _path.resolve)(process.cwd(), config.source_path); // Read all Vue files

  var vueFiles = (0, _glob.sync)(vueFilesPath).map(function (file) {
    var fileName = file.replace(process.cwd(), '');
    return {
      fileName: fileName,
      path: file,
      content: (0, _fs.readFileSync)(file, 'utf8')
    };
  });

  if (vueFiles.length === 0) {
    log.error('No vue files where found. Please check your `source_path` config.');
    return;
  } // Extract segments from vue files


  var allMatches = vueFiles.reduce(function (accumulator, file) {
    var methodMatches = extractMethodMatches(file);
    var componentMatches = extractComponentMatches(file); // For later, support v-t directive with extension
    // const directiveMatches = extractDirectiveMatches(file)

    return [].concat(_toConsumableArray(accumulator), _toConsumableArray(methodMatches), _toConsumableArray(componentMatches));
  }, []); // Remove duplicates path

  return allMatches.filter(function (match, index) {
    return allMatches.findIndex(function (m) {
      return m.path === match.path;
    }) === index;
  });
};

exports.fetchSegmentsFromVueFiles = fetchSegmentsFromVueFiles;

function extractMethodMatches(file) {
  // const methodRegExp = /(?:[$ .]tc?)\(\s*?("|'|`)(.*?)\1/g
  var methodRegExp = /(?:[$.]tc?)\(\s*?(\'|\"|\`)(.*?)(?<!\\)\1/g;
  return _toConsumableArray(getMatches(file, methodRegExp, 2));
}

function extractComponentMatches(file) {
  var componentRegExp = /(?:<i18n|<I18N)(?:.|\n)*?(?:[^:]path=("|'))(.*?)\1/g;
  return _toConsumableArray(getMatches(file, componentRegExp, 2));
}

function extractDirectiveMatches(file) {
  var directiveRegExp = /v-t="'(.*)'"/g;
  return _toConsumableArray(getMatches(file, directiveRegExp));
}

function getMatches(file, regExp) {
  var captureGroup,
      match,
      line,
      _args = arguments;
  return _regeneratorRuntime["default"].wrap(function getMatches$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          captureGroup = _args.length > 2 && _args[2] !== undefined ? _args[2] : 1;

        case 1:
          if (!true) {
            _context.next = 10;
            break;
          }

          match = regExp.exec(file.content);

          if (!(match === null)) {
            _context.next = 5;
            break;
          }

          return _context.abrupt("break", 10);

        case 5:
          line = (file.content.substring(0, match.index).match(/\n/g) || []).length + 1;
          _context.next = 8;
          return {
            path: match[captureGroup].replace(/\\/g, ''),
            line: line,
            file: file.fileName
          };

        case 8:
          _context.next = 1;
          break;

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, _marked);
}