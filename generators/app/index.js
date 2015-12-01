'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');
var request = require('request');
var http = require('http');
var extend = require('deep-extend');

module.exports = yeoman.generators.Base.extend({


  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.option('playground', {
      type: String,
      desc: 'reference to a playground snippet',
      required: false
    });

    this.option('name', {
      type: String,
      desc: 'Title of your babylon project',
      required: false
    });

    this.option('port', {
      type: String,
      desc: 'node.js localhost port',
      defaults: '4000',
      required: false
    });


    this.genConfig = {};
  },

  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the exceptional ' + chalk.red('generator-babylonjs') + ' generator!'
      ));

    var prompts = [{
      type: 'input',
      name: 'name',
      message: 'Title of your babylon project',
      default: 'babylonjsSample',
      when: this.options.name === undefined
    }, {
        type: 'confirm',
        name: 'createFolder',
        message: 'Create the folder for your solution :',
        default: true
      }, {
        type: 'input',
        name: 'port',
        message: 'localhost port :',
        default: '4000',
        when: this.option.port === undefined

      }
    ];

    this.prompt(prompts, function (props) {
      this.props = props;
      // To access props later use this.props.someOption;

      this.genConfig = extend(this.genConfig, this.options);
      this.genConfig = extend(this.genConfig, props);

      done();
    }.bind(this));
  },

  configuring: function () {
    // take name submitted and strip everything out non-alphanumeric or space
    var projectName = this.genConfig.name;
    projectName = projectName.replace(/[^\w\s\-]/g, '');
    projectName = projectName.replace(/\s{2,}/g, ' ');
    projectName = projectName.trim();

    // add the result of the question to the generator configuration object
    this.genConfig.projectInternalName = projectName.toLowerCase().replace(/ /g, '-');
    this.genConfig.projectDisplayName = projectName;
  },

  writing: function () {


    if (this.genConfig.createFolder) {
      var root = this.destinationRoot();
      this.destinationRoot(path.join(root, this.genConfig.projectInternalName));
    }    
    // path to package.json
    var pathToPackageJson = this.destinationPath('package.json');

    // if package.json doesn't exist
    if (!this.fs.exists(pathToPackageJson)) {
      // copy package.json to target
      this.fs.copyTpl(this.templatePath('_package.json'), this.destinationPath('package.json'), this.genConfig);
    }

    this.genConfig.snippetPort = "var port = " + this.genConfig.port;

    var snippetCode = "var createScene = function () { \n \
            // Scene \n \
            var scene = new BABYLON.Scene(engine); \n \
            // Camera \n \
            \n \
            var camera = new BABYLON.FreeCamera(\"camera\", new BABYLON.Vector3(29, 13, 23), scene); \n \
            camera.setTarget(new BABYLON.Vector3(0, 0, 0)); \n \
            camera.attachControl(canvas); \n \
            \n \
            // Light \n \
            var light = new BABYLON.PointLight(\"Point\", new BABYLON.Vector3(-60, 60, 80), scene); \n \
            light.intensity = 1; \n \
            \n \
            // Textures \n \
            var diffuseTexture = new BABYLON.Texture(\"../assets/floor.png\", scene); \n \
            diffuseTexture.vScale = diffuseTexture.uScale = 5.0; \n \
            var boxTexture = new BABYLON.Texture(\"../assets/wood.jpg\", scene); \n \
            \n \
            // Materials \n \
            var planeMaterial = new BABYLON.StandardMaterial(\"plane_material\", scene); \n \
            planeMaterial.diffuseTexture = diffuseTexture; \n \
            var boxMaterial = new BABYLON.StandardMaterial(\"box_material\", scene); \n \
            boxMaterial.diffuseTexture = boxTexture; \n \
            \n \
            // Meshes \n \
            var plane = BABYLON.Mesh.CreateGround(\"ground\", 100, 100, 2, scene); \n \
            plane.material = planeMaterial; \n \
            var box = BABYLON.Mesh.CreateBox(\"box\", 5, scene); \n \
            box.refreshBoundingInfo(); \n \
            box.position.y = 2.5; \n \
            box.material = boxMaterial; \n \
            \n \
            return scene; \n \
        };";

    if (this.options.playground !== undefined && this.options.playground !== null) {

      var _this = this;


      var loadScript = function (currentSnippetToken) {

        var done = _this.async();

        var data = [];
        var pathM = "http://babylonjs-api.azurewebsites.net/api/snippet/" + currentSnippetToken;

        return http.get(pathM, function (response) {
          // Continuously update stream with data
          response.setEncoding('utf8');
          response.on('data', function (d) {
            data.push(d);

          });
          response.on('end', function () {
            var result = JSON.parse(data.join(''))

            var code = result.code;
            var replaceDoubleQuote = '"http://www.babylonjs-playground.com/textures/';
            var replaceSingleQuote = '\'http://www.babylonjs-playground.com/textures/';
            code = code.replace(/"textures\//gi, replaceDoubleQuote);
            code = code.replace(/'textures\//gi, replaceSingleQuote);
            replaceDoubleQuote = '"http://www.babylonjs-playground.com/scenes/';
            replaceSingleQuote = '\'http://www.babylonjs-playground.com/scenes/';
            code = code.replace(/"scenes\//gi, replaceDoubleQuote);
            code = code.replace(/'scenes\//gi, replaceSingleQuote);
            

            _this.genConfig.snippetCode = code;
            _this.fs.copyTpl(_this.templatePath('public/scripts/index.js'), _this.destinationPath('public/scripts/index.js'), _this.genConfig);

            done();

          });
        });

      }

      var t = this.options.playground.substr(1).split("#");
      var currentSnippetToken = t[0];

      if (t.length > 1) {
        currentSnippetToken = currentSnippetToken + '/' + t[1];
      }


      this.log('Adding a playground scene : ' + chalk.green('[' + this.options.playground + ']') + ' in your project!');

      loadScript(currentSnippetToken);

    } else {

      this.genConfig.snippetCode = snippetCode;
      this.fs.copyTpl(this.templatePath('public/scripts/index.js'), this.destinationPath('public/scripts/index.js'), this.genConfig);

    }


    this.fs.copy(this.templatePath('public/assets/floor.png'), this.destinationPath('public/assets/floor.png'));
    this.fs.copy(this.templatePath('public/assets/wood.jpg'), this.destinationPath('public/assets/wood.jpg'));
    this.fs.copy(this.templatePath('public/stylesheets/style.css'), this.destinationPath('public/stylesheets/style.css'));
    this.fs.copy(this.templatePath('routes/index.js'), this.destinationPath('routes/index.js'));
    this.fs.copy(this.templatePath('views/index.jade'), this.destinationPath('views/index.jade'));
    this.fs.copy(this.templatePath('views/error.jade'), this.destinationPath('views/error.jade'));
    this.fs.copyTpl(this.templatePath('app.js'), this.destinationPath('app.js'), this.genConfig);
    this.fs.copy(this.templatePath('README.md'), this.destinationPath('README.md'));
  },

  install: function () {
    this.npmInstall(['body-parser'], { 'save': true });
    this.npmInstall(['cookie-parser'], { 'save': true });
    this.npmInstall(['jade'], { 'save': true });
    this.npmInstall(['serve-favicon'], { 'save': true });
    this.npmInstall(['express'], { 'save': true });
    this.npmInstall(['babylonjs'], { 'save': true });
  }
});
