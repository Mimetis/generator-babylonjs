'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');

module.exports = yeoman.generators.Base.extend({
  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the exceptional ' + chalk.red('generator-babylonjs') + ' generator!'
      ));

    this.option('name', {
      type: String,
      desc: 'Title of your babylon project',
      required: false
    });


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
      }];

    this.prompt(prompts, function (props) {
      this.props = props;
      // To access props later use this.props.someOption;

      done();
    }.bind(this));
  },

  configuring: function () {
    // take name submitted and strip everything out non-alphanumeric or space
    var projectName = this.props.name;
    projectName = projectName.replace(/[^\w\s\-]/g, '');
    projectName = projectName.replace(/\s{2,}/g, ' ');
    projectName = projectName.trim();

    // add the result of the question to the generator configuration object
    this.props.projectInternalName = projectName.toLowerCase().replace(/ /g, '-');
    this.props.projectDisplayName = projectName;
  },

  writing: function () {


    if (this.props.createFolder) {
      var root = this.destinationRoot();
      this.destinationRoot(path.join(root, this.props.projectInternalName));
    }    
    // path to package.json
    var pathToPackageJson = this.destinationPath('package.json');

    // if package.json doesn't exist
    if (!this.fs.exists(pathToPackageJson)) {
      // copy package.json to target
      this.fs.copyTpl(this.templatePath('_package.json'), this.destinationPath('package.json'), this.props);
    }

    this.fs.copy(this.templatePath('public/assets/floor.png'), this.destinationPath('public/assets/floor.png'));
    this.fs.copy(this.templatePath('public/assets/wood.jpg'), this.destinationPath('public/assets/wood.jpg'));
    this.fs.copy(this.templatePath('public/stylesheets/style.css'), this.destinationPath('public/stylesheets/style.css'));
    this.fs.copy(this.templatePath('routes/index.js'), this.destinationPath('routes/index.js'));
    this.fs.copy(this.templatePath('views/index.jade'), this.destinationPath('views/index.jade'));
    this.fs.copy(this.templatePath('views/error.jade'), this.destinationPath('views/error.jade'));
    this.fs.copy(this.templatePath('app.js'), this.destinationPath('app.js'));
    this.fs.copy(this.templatePath('README.md'), this.destinationPath('README.md'));
  },

  install: function () {
    this.npmInstall(['body-parser'], { 'save': true });
    this.npmInstall(['cookie-parser'], { 'save': true });
    this.npmInstall(['jade'], { 'save': true });
    this.npmInstall(['serve-favicon'], { 'save': true });
    this.npmInstall(['express'], { 'save': true });
    this.npmInstall(['babylonjs'], { 'save': true });
   
    //this.installDependencies();
  }
});
