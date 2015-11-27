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
var async = require('async');
var exec = require('child_process').exec;

var appName = 'pexample';
var eol = os.EOL;

function loadTemplate(name) {
  return fs.readFileSync(path.join(__dirname, '.', 'templates', name), 'utf-8');
}

var mainfile    = loadTemplate('main.js');
var indexHTML   = loadTemplate('index.html');
var shader0     = loadTemplate('assets/ShowNormals.vert');
var shader1     = loadTemplate('assets/ShowNormals.frag');
var shader2     = loadTemplate('assets/ShowTexCoords.vert');
var shader3     = loadTemplate('assets/ShowTexCoords.frag');
var shader4     = loadTemplate('assets/SolidColor.vert');
var shader5     = loadTemplate('assets/SolidColor.frag');


module.exports.generate = function(destPath, options) {
    options = options || {};
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

function isOnline(callback) {
    require('dns').resolve('www.google.com', function(err) {
        if (err) { callback(err, false); }
        else callback(null, true);
    });
}

function getPackageVersion(pkg, callback) {
    var version = execSync('npm show ' + pkg.name + ' version');
    version = version.trim();
    return version;
}

var pexPackages = require('../pkg/pex-packages-core');

function getPackageVersion(packageInfo, callback) {
    exec('npm show ' + packageInfo.name + ' version', function(err, stdout, stderr) {
        var version = stdout.trim();
        console.log('   \x1b[36mmodule\x1b[0m : ' +packageInfo.name + ' @ ' + version);
        callback(null, version);
    })
}

function generatePackageInfo(callback) {
    isOnline(function(err, online) {
        var pkg = {
            name: appName,
            version: '0.0.1',
            private: true,
            dependencies: {
                'beefy':            '^2.1.5',
                'browserify':       '^12.0.1',
                'glslify-promise':  '^1.0.1',
                'is-browser':       '^2.0.1',
                'primitive-cube':   '^1.0.2'
            }
        }
        function dummy(packageName, callback) {
            callback(null, '*');
        }
        async.map(pexPackages, online ? getPackageVersion : dummy, function(err, results) {
            pexPackages.forEach(function(packageInfo, packageIndex) {
                pkg.dependencies[packageInfo.name] = '^' + results[packageIndex];
            })
            callback(null, pkg);
        })
    })
}

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
        generatePackageInfo(function(err, pkg) {
            pkg.scripts = {};
            pkg.scripts.start = 'beefy main.js:main.web.js --open -- -i plask -g glslify-promise/transform';
            pkg.scripts.build = 'browserify main.js -i plask -g glslify-promise/transform -o main.web.js';
            buildCommand = 'npm start';
            write(path + '/package.json', JSON.stringify(pkg, null, 2));
            write(path + '/main.js', mainfile);
            write(path + '/index.html', indexHTML);
            mkdir(path + '/assets', function() {
                write(path + '/assets/ShowNormals.vert', shader0);
                write(path + '/assets/ShowNormals.frag', shader1);
                write(path + '/assets/ShowTexCoords.vert', shader2);
                write(path + '/assets/ShowTexCoords.frag', shader3);
                write(path + '/assets/SolidColor.vert', shader4);
                write(path + '/assets/SolidColor.frag', shader5);
            });
        })
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
