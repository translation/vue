"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.writeLocaleFile = void 0;

var _fs = require("fs");

var _util = require("util");

var _path = require("path");

var writeLocaleFile = function writeLocaleFile(locale, translations, config) {
  var outputString,
      fileExtension = 'json';

  if (config.output === 'module') {
    outputString = 'module.exports = ' + (0, _util.inspect)(translations, false, 2, false);
    fileExtension = 'js';
  } else {
    outputString = JSON.stringify(translations, null, 4);
  }

  (0, _fs.writeFileSync)((0, _path.join)(process.cwd(), config.translations_directory, "".concat(locale, ".").concat(fileExtension)), outputString, {
    encoding: 'utf8'
  });
};

exports.writeLocaleFile = writeLocaleFile;