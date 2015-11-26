'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-generator').test;

describe('generator-babylonjs:app', function () {
  before(function (done) {
    this.timeout(0);

    var pathApp = path.join(__dirname, '../generators/app');


    helpers.run(pathApp)
      .withOptions({ playground: '#2FW07A#0' })
      .withPrompts({ name: 'testapp', createFolder: true })
      .on('end', done);
  });

  it('creates files', function () {
    assert.file([
      'dummyfile.txt'
    ]);
  });
});
