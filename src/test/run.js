#!/usr/bin/env node

var
jsdom   = require('jsdom'),
browser = require("jsdom/lib/jsdom/browser/index"),
fs      = require('fs'),
xhr     = require('xmlhttprequest'),
vm      = require('vm'),
assert  = require('assert'),
files = [
  __dirname +'/lex_test.html',
  __dirname +'/match_test.html',
  __dirname +'/parse_test.html'
],
scripts = [
  '../jsonselect.js',
  'js/doctest.js',
  'js/jquery-1.6.1.min.js',
  'js/conf_tests.js'
];

// JSDOM Monkey patches
(function(createWindow) {
  browser.createWindow = function(dom, options) {
    var window = createWindow(dom, options);

    window.XMLHttpRequest = xhr;

    window.eval = function(code) {
      var script = vm.createScript(code, 'Eval');
      return script.runInNewContext(this.__scriptContext);
    };

    return window;
  }
})(browser.createWindow);

files.forEach(function(file) {
  exports['test ' + file] = function() {
    jsdom.env(file, scripts, function(errors, window) {
      window.$('.doctest').each(function(k, v) {
        var el = window.$(v);
        el.text(el.text().replace(/&gt;/g,'>').replace(/&lt;/g,'<'))
      });

      window.doctest();

      assert.equal(parseInt(window.$('.failed').text(), 10), 0);
    });
  };
});
