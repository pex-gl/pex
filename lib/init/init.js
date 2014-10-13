var aasciArt = (
        '            _               _        _      _       \n'
        +'           /\\ \\            /\\ \\    /_/\\    /\\ \\    \n'
        +'          /  \\ \\          /  \\ \\   \\ \\ \\   \\ \\_\\   \n'
        +'         / /\\ \\ \\        / /\\ \\ \\   \\ \\ \\__/ / /   \n'
        +'        / / /\\ \\_\\      / / /\\ \\_\\   \\ \\__ \\/_/    \n'
        +'       / / /_/ / /     / /_/_ \\/_/    \\/_/\\__/\\    \n'
        +'      / / /__\\/ /     / /____/\\        _/\\/__\\ \\   \n'
        +'     / / /_____/     / /\\____\\/       / _/_/\\ \\ \\  \n'
        +'    / / /           / / /______      / / /   \\ \\ \\  \n'
        +'   / / /           / / /_______\\    / / /    /_/ /  \n'
        +'   \\/_/            \\/__________/    \\/_/     \\_\\/  \n'
);


var mkdirp = require('mkdirp');
var os = require('os');
var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');

var appName = 'pexample';
var eol = os.EOL;

function loadTemplate(name) {
  return fs.readFileSync(path.join(__dirname, '.', 'templates', name), 'utf-8');
}

var mainfile    = loadTemplate('main.js');
var indexHTML   = loadTemplate('index.html');
var gulpfile    = loadTemplate('gulpfile.js');
var gruntfile   = loadTemplate('gruntfile.js');
var watchscript = loadTemplate('watchscript.js');

module.exports.generate = function(destPath, options) {
    options.grunt = options.grunt || false;
    options.gulp = options.gulp || false;
    options.force = options.force || false;

    appName = path.basename(path.resolve(destPath));
    emptyDirectory(destPath, function(empty){
        if (empty || options.force) {
            createApplicationAt(destPath, options);
        } else {
            inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'deleteDestPath',
                    message: 'destination path is not empty. continue?',
                    default: false
            }],

            function(response){
                if (response.deleteDestPath) {
                    createApplicationAt(destPath, options);
                } else {
                    abort('aborting');
                }
            });
        }
    });
};


function createApplicationAt(path, options) {
    var buildCommand = '';
    console.log();
    process.on('exit', function(){
        console.log();
        console.log(aasciArt);
        console.log();
        console.log(' don\'t forget to install dependencies:');
        console.log();
        console.log('     $ cd %s', path);
        console.log('     $ npm install');
        console.log('     $ ' + buildCommand);
        console.log();
    });

    mkdir(path, function() {

        var pkg = {
            name: appName,
            version: '0.0.1',
            private: true,
            dependencies: {
                'brfs':                 '1.2.0',
                'browser-sync':         '1.3.2',
                'browserify':           '5.9.1',
                'pex-color':            '*',
                'pex-fx':               '*',
                'pex-gen':              '*',
                'pex-geom':             '*',
                'pex-glu':              '*',
                'pex-gui':              '*',
                'pex-helpers':          '*',
                'pex-materials':        '*',
                'pex-sys':              '*',
                'vinyl-source-stream':  '0.1.1',
                'watchify':             '1.0.1',
            }
        }
        if (options.gulp) {
            write(path + '/gulpfile.js', gulpfile);
            pkg.dependencies['gulp'] = '3.8.6';
            pkg.dependencies['gulp-util'] = '3.0.0';
            buildCommand = 'gulp';
        } else if (options.grunt) {
            write(path + '/gruntfile.js', gruntfile);
            pkg.dependencies['grunt'] = '*';
            pkg.dependencies['grunt-browserify'] = '*';
            pkg.dependencies['grunt-browser-sync'] = '*';
            buildCommand = 'grunt';
        } else {
            mkdir(path + '/lib', function() {
                write(path +'/lib/watchscript.js', watchscript, 0755);
            });
            pkg.scripts = {};
            pkg.scripts.watch = './lib/watchscript.js';
            buildCommand = 'npm run watch';
        }
        write(path + '/package.json', JSON.stringify(pkg, null, 2));
        write(path + '/main.js', mainfile);
        write(path + '/index.html', indexHTML);

        mkdir(path + '/lib');
    });
}

function copyTemplate(from, to) {
  from = path.join(__dirname, '..', 'templates', from);
  write(to, fs.readFileSync(from, 'utf-8'));
}

function emptyDirectory(path, fn) {
    fs.readdir(path, function(err, files){
        if (err && 'ENOENT' != err.code) throw err;
        fn(!files || !files.length);
    });
}


function write(path, str, mode) {
    fs.writeFile(path, str, { mode: mode || 0666 });
    console.log('   \x1b[36mcreate\x1b[0m : ' + path);
}


function mkdir(path, fn) {
    mkdirp(path, 0755, function(err){
        if (err) throw err;
        console.log('   \033[36mcreate\033[0m : ' + path);
        fn && fn();
    });
}

function abort(str) {
    console.error(str);
    process.exit(1);
}


