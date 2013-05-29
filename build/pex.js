(function(pexNodeRequire, pexAsyncRequire, pexAsyncDefine) {

/**
 * almond 0.2.3 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../tools/lib/almond", function(){});

//r.js does it for us but almond not
require.nodeRequire = pexNodeRequire;

PexGlobalConfig = {
  nodeRequire : pexNodeRequire,
  originalRequire : pexAsyncRequire,
  originalDefine : pexAsyncDefine,
  definedModules : [],
  libPathsMap : { text : '../tools/lib/text' }
};

//intercept almond define to capture list of defined modules
(function() {
  var almondDefine = define;
  define = function(name, deps, callback) {
    almondDefine(name, deps, callback);
    var module = require(name);
    PexGlobalConfig.definedModules.push({ name: name, module: module });
  };
  define.amd = almondDefine.amd;
})();

define("../tools/include/inject.js", function(){});

// Generated by CoffeeScript 1.6.2
define('pex/geom/Vec2',['require'],function(require) {
  var Vec2;

  return Vec2 = (function() {
    Vec2.prototype.x = 0;

    Vec2.prototype.y = 0;

    function Vec2(x, y) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
    }

    Vec2.create = function(x, y) {
      return new Vec2(x, y);
    };

    Vec2.prototype.set = function(x, y) {
      this.x = x;
      this.y = y;
      return this;
    };

    Vec2.prototype.add = function(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    };

    Vec2.prototype.sub = function(v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    };

    Vec2.prototype.scale = function(f) {
      this.x *= f;
      this.y *= f;
      return this;
    };

    Vec2.prototype.distance = function(v) {
      var dx, dy;

      dx = v.x - this.x;
      dy = v.y - this.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    Vec2.prototype.dot = function(b) {
      return this.x * b.x + this.y * b.y;
    };

    Vec2.prototype.copy = function(v) {
      this.x = v.x;
      this.y = v.y;
      return this;
    };

    Vec2.prototype.clone = function() {
      return new Vec2(this.x, this.y);
    };

    Vec2.prototype.asAdd = function(a, b) {
      this.x = a.x + b.x;
      this.y = a.y + b.y;
      return this;
    };

    Vec2.prototype.asSub = function(a, b) {
      this.x = a.x - b.x;
      this.y = a.y - b.y;
      return this;
    };

    Vec2.prototype.length = function() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    Vec2.prototype.normalize = function() {
      this.scale(1 / this.length());
      return this;
    };

    Vec2.prototype.toString = function() {
      return "{" + this.x + "," + this.y + "}";
    };

    return Vec2;

  })();
});

// Generated by CoffeeScript 1.6.2
define('pex/geom/Vec3',['require'],function(require) {
  var Vec3;

  return Vec3 = (function() {
    Vec3.prototype.x = 0;

    Vec3.prototype.y = 0;

    Vec3.prototype.z = 0;

    function Vec3(x, y, z) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.z = z != null ? z : 0;
    }

    Vec3.create = function(x, y, z) {
      return new Vec3(x, y, z);
    };

    Vec3.prototype.set = function(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    };

    Vec3.prototype.add = function(v) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      return this;
    };

    Vec3.prototype.sub = function(v) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
      return this;
    };

    Vec3.prototype.scale = function(f) {
      this.x *= f;
      this.y *= f;
      this.z *= f;
      return this;
    };

    Vec3.prototype.distance = function(v) {
      var dx, dy, dz;

      dx = v.x - this.x;
      dy = v.y - this.y;
      dz = v.z - this.z;
      return Math.sqrt(dx * dx + dy * dy);
    };

    Vec3.prototype.squareDistance = function(v) {
      var dx, dy, dz;

      dx = v.x - this.x;
      dy = v.y - this.y;
      dz = v.z - this.z;
      return dx * dx + dy * dy;
    };

    Vec3.prototype.copy = function(v) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      return this;
    };

    Vec3.prototype.clone = function() {
      return new Vec3(this.x, this.y, this.z);
    };

    Vec3.prototype.dup = function() {
      return this.clone();
    };

    Vec3.prototype.cross = function(v) {
      var vx, vy, vz, x, y, z;

      x = this.x;
      y = this.y;
      z = this.z;
      vx = v.x;
      vy = v.y;
      vz = v.z;
      this.x = y * vz - z * vy;
      this.y = z * vx - x * vz;
      this.z = x * vy - y * vx;
      return this;
    };

    Vec3.prototype.dot = function(b) {
      return this.x * b.x + this.y * b.y + this.z * b.z;
    };

    Vec3.prototype.asAdd = function(a, b) {
      this.x = a.x + b.x;
      this.y = a.y + b.y;
      this.z = a.z + b.z;
      return this;
    };

    Vec3.prototype.asSub = function(a, b) {
      this.x = a.x - b.x;
      this.y = a.y - b.y;
      this.z = a.z - b.z;
      return this;
    };

    Vec3.prototype.asCross = function(a, b) {
      return this.copy(a).cross(b);
    };

    Vec3.prototype.length = function() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    };

    Vec3.prototype.lengthSquared = function() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    };

    Vec3.prototype.normalize = function() {
      this.scale(1 / this.length());
      return this;
    };

    Vec3.prototype.transformQuat = function(q) {
      var iw, ix, iy, iz, qw, qx, qy, qz, x, y, z;

      x = this.x;
      y = this.y;
      z = this.z;
      qx = q.x;
      qy = q.y;
      qz = q.z;
      qw = q.w;
      ix = qw * x + qy * z - qz * y;
      iy = qw * y + qz * x - qx * z;
      iz = qw * z + qx * y - qy * x;
      iw = -qx * x - qy * y - qz * z;
      this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
      this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
      this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
      return this;
    };

    Vec3.prototype.transformMat4 = function(m) {
      var x, y, z;

      x = m.a14 + m.a11 * this.x + m.a12 * this.y + m.a13 * this.z;
      y = m.a24 + m.a21 * this.x + m.a22 * this.y + m.a23 * this.z;
      z = m.a34 + m.a31 * this.x + m.a32 * this.y + m.a33 * this.z;
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    };

    Vec3.prototype.toString = function() {
      return "{" + this.x + "," + this.y + "," + this.z + "}";
    };

    return Vec3;

  })();
});

// Generated by CoffeeScript 1.6.2
define('pex/geom/Vec4',['require'],function(require) {
  var Vec4;

  return Vec4 = (function() {
    Vec4.prototype.x = 0;

    Vec4.prototype.y = 0;

    Vec4.prototype.z = 0;

    Vec4.prototype.w = 0;

    function Vec4(x, y, z, w) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.z = z != null ? z : 0;
      this.w = w != null ? w : 0;
    }

    Vec4.create = function(x, y, z, w) {
      return new Vec4(x, y, z, w);
    };

    Vec4.prototype.set = function(x, y, z, w) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
      return this;
    };

    Vec4.prototype.transformMat4 = function(m) {
      var w, x, y, z;

      x = m.a14 * this.w + m.a11 * this.x + m.a12 * this.y + m.a13 * this.z;
      y = m.a24 * this.w + m.a21 * this.x + m.a22 * this.y + m.a23 * this.z;
      z = m.a34 * this.w + m.a31 * this.x + m.a32 * this.y + m.a33 * this.z;
      w = m.a44 * this.w + m.a41 * this.x + m.a42 * this.y + m.a43 * this.z;
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
      return this;
    };

    return Vec4;

  })();
});

// Generated by CoffeeScript 1.6.2
define('pex/geom/Mat4',['require','../geom/Vec3'],function(require) {
  var Mat4, Vec3;

  Vec3 = require('../geom/Vec3');
  return Mat4 = (function() {
    function Mat4() {
      this.reset();
    }

    Mat4.create = function() {
      return new Mat4();
    };

    Mat4.prototype.set4x4r = function(a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44) {
      this.a11 = a11;
      this.a12 = a12;
      this.a13 = a13;
      this.a14 = a14;
      this.a21 = a21;
      this.a22 = a22;
      this.a23 = a23;
      this.a24 = a24;
      this.a31 = a31;
      this.a32 = a32;
      this.a33 = a33;
      this.a34 = a34;
      this.a41 = a41;
      this.a42 = a42;
      this.a43 = a43;
      this.a44 = a44;
      return this;
    };

    Mat4.prototype.copy = function(m) {
      this.a11 = m.a11;
      this.a12 = m.a12;
      this.a13 = m.a13;
      this.a14 = m.a14;
      this.a21 = m.a21;
      this.a22 = m.a22;
      this.a23 = m.a23;
      this.a24 = m.a24;
      this.a31 = m.a31;
      this.a32 = m.a32;
      this.a33 = m.a33;
      this.a34 = m.a34;
      this.a41 = m.a41;
      this.a42 = m.a42;
      this.a43 = m.a43;
      this.a44 = m.a44;
      return this;
    };

    Mat4.prototype.reset = function() {
      this.set4x4r(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      return this;
    };

    Mat4.prototype.identity = function() {
      this.reset();
      return this;
    };

    Mat4.prototype.mul4x4r = function(b11, b12, b13, b14, b21, b22, b23, b24, b31, b32, b33, b34, b41, b42, b43, b44) {
      var a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44;

      a11 = this.a11;
      a12 = this.a12;
      a13 = this.a13;
      a14 = this.a14;
      a21 = this.a21;
      a22 = this.a22;
      a23 = this.a23;
      a24 = this.a24;
      a31 = this.a31;
      a32 = this.a32;
      a33 = this.a33;
      a34 = this.a34;
      a41 = this.a41;
      a42 = this.a42;
      a43 = this.a43;
      a44 = this.a44;
      this.a11 = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
      this.a12 = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
      this.a13 = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
      this.a14 = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
      this.a21 = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
      this.a22 = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
      this.a23 = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
      this.a24 = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
      this.a31 = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
      this.a32 = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
      this.a33 = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
      this.a34 = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
      this.a41 = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
      this.a42 = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
      this.a43 = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
      this.a44 = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
      return this;
    };

    Mat4.prototype.perspective = function(fovy, aspect, znear, zfar) {
      var f, nf;

      f = 1.0 / Math.tan(fovy / 180 * Math.PI / 2);
      nf = 1.0 / (znear - zfar);
      this.mul4x4r(f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (zfar + znear) * nf, 2 * znear * zfar * nf, 0, 0, -1, 0);
      return this;
    };

    Mat4.prototype.lookAt = function(eye, target, up) {
      var x, y, z;

      z = (Vec3.create(eye.x - target.x, eye.y - target.y, eye.z - target.z)).normalize();
      x = (Vec3.create(up.x, up.y, up.z)).cross(z).normalize();
      y = Vec3.create().copy(z).cross(x).normalize();
      this.mul4x4r(x.x, x.y, x.z, 0, y.x, y.y, y.z, 0, z.x, z.y, z.z, 0, 0, 0, 0, 1);
      this.translate(-eye.x, -eye.y, -eye.z);
      return this;
    };

    Mat4.prototype.translate = function(dx, dy, dz) {
      this.mul4x4r(1, 0, 0, dx, 0, 1, 0, dy, 0, 0, 1, dz, 0, 0, 0, 1);
      return this;
    };

    Mat4.prototype.asMul = function(a, b) {
      var a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44, b11, b12, b13, b14, b21, b22, b23, b24, b31, b32, b33, b34, b41, b42, b43, b44;

      a11 = a.a11;
      a12 = a.a12;
      a13 = a.a13;
      a14 = a.a14;
      a21 = a.a21;
      a22 = a.a22;
      a23 = a.a23;
      a24 = a.a24;
      a31 = a.a31;
      a32 = a.a32;
      a33 = a.a33;
      a34 = a.a34;
      a41 = a.a41;
      a42 = a.a42;
      a43 = a.a43;
      a44 = a.a44;
      b11 = b.a11;
      b12 = b.a12;
      b13 = b.a13;
      b14 = b.a14;
      b21 = b.a21;
      b22 = b.a22;
      b23 = b.a23;
      b24 = b.a24;
      b31 = b.a31;
      b32 = b.a32;
      b33 = b.a33;
      b34 = b.a34;
      b41 = b.a41;
      b42 = b.a42;
      b43 = b.a43;
      b44 = b.a44;
      this.a11 = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
      this.a12 = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
      this.a13 = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
      this.a14 = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
      this.a21 = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
      this.a22 = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
      this.a23 = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
      this.a24 = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
      this.a31 = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
      this.a32 = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
      this.a33 = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
      this.a34 = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
      this.a41 = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
      this.a42 = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
      this.a43 = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
      this.a44 = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
      return this;
    };

    Mat4.prototype.mul = function(b) {
      return this.asMul(this, b);
    };

    Mat4.prototype.scale = function(sx, sy, sz) {
      this.mul4x4r(sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1);
      return this;
    };

    Mat4.prototype.invert = function() {
      var a0, a1, a11, a12, a13, a14, a2, a21, a22, a23, a24, a3, a31, a32, a33, a34, a4, a41, a42, a43, a44, a5, b0, b1, b2, b3, b4, b5, invdet, x0, x1, x10, x11, x12, x13, x14, x15, x2, x3, x4, x5, x6, x7, x8, x9;

      x0 = this.a11;
      x1 = this.a12;
      x2 = this.a13;
      x3 = this.a14;
      x4 = this.a21;
      x5 = this.a22;
      x6 = this.a23;
      x7 = this.a24;
      x8 = this.a31;
      x9 = this.a32;
      x10 = this.a33;
      x11 = this.a34;
      x12 = this.a41;
      x13 = this.a42;
      x14 = this.a43;
      x15 = this.a44;
      a0 = x0 * x5 - x1 * x4;
      a1 = x0 * x6 - x2 * x4;
      a2 = x0 * x7 - x3 * x4;
      a3 = x1 * x6 - x2 * x5;
      a4 = x1 * x7 - x3 * x5;
      a5 = x2 * x7 - x3 * x6;
      b0 = x8 * x13 - x9 * x12;
      b1 = x8 * x14 - x10 * x12;
      b2 = x8 * x15 - x11 * x12;
      b3 = x9 * x14 - x10 * x13;
      b4 = x9 * x15 - x11 * x13;
      b5 = x10 * x15 - x11 * x14;
      invdet = 1 / (a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0);
      a11 = (+x5 * b5 - x6 * b4 + x7 * b3) * invdet;
      a12 = (-x1 * b5 + x2 * b4 - x3 * b3) * invdet;
      a13 = (+x13 * a5 - x14 * a4 + x15 * a3) * invdet;
      a14 = (-x9 * a5 + x10 * a4 - x11 * a3) * invdet;
      a21 = (-x4 * b5 + x6 * b2 - x7 * b1) * invdet;
      a22 = (+x0 * b5 - x2 * b2 + x3 * b1) * invdet;
      a23 = (-x12 * a5 + x14 * a2 - x15 * a1) * invdet;
      a24 = (+x8 * a5 - x10 * a2 + x11 * a1) * invdet;
      a31 = (+x4 * b4 - x5 * b2 + x7 * b0) * invdet;
      a32 = (-x0 * b4 + x1 * b2 - x3 * b0) * invdet;
      a33 = (+x12 * a4 - x13 * a2 + x15 * a0) * invdet;
      a34 = (-x8 * a4 + x9 * a2 - x11 * a0) * invdet;
      a41 = (-x4 * b3 + x5 * b1 - x6 * b0) * invdet;
      a42 = (+x0 * b3 - x1 * b1 + x2 * b0) * invdet;
      a43 = (-x12 * a3 + x13 * a1 - x14 * a0) * invdet;
      a44 = (+x8 * a3 - x9 * a1 + x10 * a0) * invdet;
      return this;
    };

    Mat4.prototype.transpose = function() {
      var a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44;

      a11 = this.a11;
      a12 = this.a12;
      a13 = this.a13;
      a14 = this.a14;
      a21 = this.a21;
      a22 = this.a22;
      a23 = this.a23;
      a24 = this.a24;
      a31 = this.a31;
      a32 = this.a32;
      a33 = this.a33;
      a34 = this.a34;
      a41 = this.a41;
      a42 = this.a42;
      a43 = this.a43;
      a44 = this.a44;
      this.a11 = a11;
      this.a12 = a21;
      this.a13 = a31;
      this.a14 = a41;
      this.a21 = a12;
      this.a22 = a22;
      this.a23 = a32;
      this.a24 = a42;
      this.a31 = a13;
      this.a32 = a23;
      this.a33 = a33;
      this.a34 = a43;
      this.a41 = a14;
      this.a42 = a24;
      this.a43 = a34;
      this.a44 = a44;
      return this;
    };

    Mat4.prototype.toArray = function() {
      return [this.a11, this.a21, this.a31, this.a41, this.a12, this.a22, this.a32, this.a42, this.a13, this.a23, this.a33, this.a43, this.a14, this.a24, this.a34, this.a44];
    };

    return Mat4;

  })();
});

// Generated by CoffeeScript 1.6.2
define('pex/geom/Quat',['require'],function(require) {
  var Quat, kEpsilon;

  kEpsilon = Math.pow(2, -24);
  return Quat = (function() {
    function Quat(x, y, z, w) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.z = z != null ? z : 0;
      this.w = w != null ? w : 1;
    }

    Quat.create = function(x, y, z, w) {
      return new Quat(x, y, z, w);
    };

    Quat.prototype.identity = function() {
      this.set(0, 0, 0, 1);
      return this;
    };

    Quat.prototype.setAxisAngle = function(v, a) {
      var s;

      a = a * 0.5;
      s = Math.sin(a);
      this.x = s * v.x;
      this.y = s * v.y;
      this.z = s * v.z;
      this.w = Math.cos(a);
      return this;
    };

    Quat.prototype.clone = function() {
      return new Quat(this.x, this.y, this.z, this.w);
    };

    Quat.prototype.copy = function(q) {
      this.x = q.x;
      this.y = q.y;
      this.z = q.z;
      this.w = q.w;
      return this;
    };

    Quat.prototype.set = function(x, y, z, w) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
      return this;
    };

    Quat.prototype.asMul = function(p, q) {
      var pw, px, py, pz, qw, qx, qy, qz;

      px = p.x;
      py = p.y;
      pz = p.z;
      pw = p.w;
      qx = q.x;
      qy = q.y;
      qz = q.z;
      qw = q.w;
      this.x = px * qw + pw * qx + py * qz - pz * qy;
      this.y = py * qw + pw * qy + pz * qx - px * qz;
      this.z = pz * qw + pw * qz + px * qy - py * qx;
      this.w = pw * qw - px * qx - py * qy - pz * qz;
      return this;
    };

    Quat.prototype.mul = function(q) {
      this.mul2(this, q);
      return this;
    };

    Quat.prototype.mul4 = function(x, y, z, w) {
      var aw, ax, ay, az;

      ax = this.x;
      ay = this.y;
      az = this.z;
      aw = this.w;
      this.x = w * ax + x * aw + y * az - z * ay;
      this.y = w * ay + y * aw + z * ax - x * az;
      this.z = w * az + z * aw + x * ay - y * ax;
      this.w = w * aw - x * ax - y * ay - z * az;
      return this;
    };

    Quat.prototype.length = function() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    };

    Quat.prototype.normalize = function() {
      var len;

      len = this.length();
      if (len > kEpsilon) {
        this.x /= len;
        this.y /= len;
        this.z /= len;
        this.w /= len;
      }
      return this;
    };

    Quat.prototype.toMat4 = function(out) {
      var m, wx, wy, wz, xs, xx, xy, xz, ys, yy, yz, zs, zz;

      xs = this.x + this.x;
      ys = this.y + this.y;
      zs = this.z + this.z;
      wx = this.w * xs;
      wy = this.w * ys;
      wz = this.w * zs;
      xx = this.x * xs;
      xy = this.x * ys;
      xz = this.x * zs;
      yy = this.y * ys;
      yz = this.y * zs;
      zz = this.z * zs;
      m = out || new Mat4();
      return m.set4x4r(1 - (yy + zz), xy - wz, xz + wy, 0, xy + wz, 1 - (xx + zz), yz - wx, 0, xz - wy, yz + wx, 1 - (xx + yy), 0, 0, 0, 0, 1);
    };

    return Quat;

  })();
});

/*
Quat ( x, y, z, w )
  //Builds a quaternion representing rotation around an axis
  //`x, y, z` - axis vector *{ Number }*
  //`w` - rotation (in radians) *{ Number }*
  function Quat(x, y, z, w) {
    this.x = x; this.y = y; this.z = z; this.w = w;
  }

  Quat.identity = function(){
      return new Quat(0, 0, 0, 1);
  }

  Quat.prototype.set = function(x, y, z, w) {
    this.x = x; this.y = y; this.z = z; this.w = w;
    return this;
  };

  Quat.prototype.setQuat = function(q) {
    this.x = q.x; this.y = q.y; this.z = q.z; this.w = q.w;
    return this;
  };

  Quat.prototype.reset = function(){
    return this.set(0, 0, 0, 1);
  };

  Quat.prototype.length = function(){
    var x = this.x, y = this.y, z = this.z, w = this.w;
    return Math.sqrt(x*x + y*y + z*z + w*w);
  }

  Quat.prototype.dot = function(b){
    return this.x * b.x + this.y * b.y + this.z * b.z + this.w * b.w;
  }

  Quat.prototype.mul2 = function(a, b){
    var ax = a.x, ay = a.y, az = a.z, aw = a.w
    ,   bx = b.x, by = b.y, bz = b.z, bw = b.w;

    this.x  = bw * ax + bx * aw + ay * bz - by * az;
    this.y  = bw * ay + by * aw + az * bx - bz * ax;
    this.z  = bw * az + bz * aw + ax * by - bx * ay;
    this.w  = bw * aw - bx * ax - ay * by - bz * az;


    return this;
  }

  Quat.prototype.mul = function(q){
    return this.mul2(this, q);
  }

  Quat.prototype.mulled = function(q){
    return this.dup().mul2(this, q);
  }

  Quat.prototype.mul4 = function(x, y, z, w){
    var ax = this.x, ay = this.y, az = this.z, aw = this.w;

    this.x = w*ax + x*aw + y*az - z*ay;
    this.y = w*ay + y*aw + z*ax - x*az;
    this.z = w*az + z*aw + x*ay - y*ax;
    this.w = w*aw - x*ax - y*ay - z*az;

    return this;
  }

  

  Quat.prototype.rotate = function(x, y, z, theta){
    var len = Math.sqrt(x*x + y*y + z*z)

    if(len > kEpsilon){
        var t2  = theta / 2
        ,   st2 = Math.sin(t2);
        this.mul4((x / len) * st2,
                  (y / len) * st2,
                  (z / len) * st2,
                  Math.cos(t2));
    }

    return this;
  }

  Quat.prototype.mulVec3 = function(v) {

        var x = v.x, y = v.y, z = v.z;
        var qx = this.x, qy = this.y, qz = this.z, qw = this.w;

            // calculate quat * vec
            ix = qw * x + qy * z - qz * y,
            iy = qw * y + qz * x - qx * z,
            iz = qw * z + qx * y - qy * x,
            iw = -qx * x - qy * y - qz * z;

        // calculate result * inverse quat
        var dest = v.dup();
        dest.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        dest.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        dest.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
        return dest;

  }

  Quat.prototype.toMat4 = function(){
    var xs = this.x + this.x
    ,   ys = this.y + this.y
    ,   zs = this.z + this.z
    ,   wx = this.w * xs
    ,   wy = this.w * ys
    ,   wz = this.w * zs
    ,   xx = this.x * xs
    ,   xy = this.x * ys
    ,   xz = this.x * zs
    ,   yy = this.y * ys
    ,   yz = this.y * zs
    ,   zz = this.z * zs;

    return new Mat4().set4x4r(
        1 - (yy+zz), xy - wz,      xz + wy,     0,
        xy + wz,     1 - (xx+zz ), yz - wx,     0,
        xz - wy,     yz + wx,      1 - (xx+yy), 0,
        0,           0,            0,           1
    );

//    return new Mat4().set4x4r(
//        1 - (yy+zz), xy + wz,      xz - wy,     0,
//        xy - wz,     1 - (xx+zz ), yz + wx,     0,
//        xz + wy,     yz - wx,      1 - (xx+yy), 0,
//        0,           0,            0,           1
//    );
  }

  Quat.prototype.dup = function(){
    return new Quat(this.x, this.y, this.z, this.w);
  }

  Quat.fromRotationAxis = function(a, x, y, z) {
    return Quat.identity().rotate(x, y, z, a);
  }
*/

;
// Generated by CoffeeScript 1.6.2
define('pex/color/Color',['require'],function(require) {
  var Color;

  Color = (function() {
    Color.prototype.r = 0;

    Color.prototype.g = 0;

    Color.prototype.b = 0;

    Color.prototype.a = 0;

    function Color(r, g, b, a) {
      this.r = r != null ? r : 0;
      this.g = g != null ? g : 0;
      this.b = b != null ? b : 0;
      this.a = a != null ? a : 0;
    }

    Color.create = function(r, g, b, a) {
      return new Color(r, g, b, a);
    };

    Color.prototype.set = function(r, g, b, a) {
      this.r = r;
      this.g = g;
      this.b = b;
      this.a = a;
      if (a == null) {
        this.a = 1;
      }
      return this;
    };

    Color.prototype.copy = function(c) {
      this.r = c.r;
      this.g = c.g;
      this.b = c.b;
      return this.a = c.a;
    };

    return Color;

  })();
  Color.Transparent = new Color(0, 0, 0, 0);
  Color.None = new Color(0, 0, 0, 0);
  Color.Black = new Color(0, 0, 0, 1);
  Color.White = new Color(1, 1, 1, 1);
  Color.Grey = new Color(0.5, 0.5, 0.5, 1);
  Color.Red = new Color(1, 0, 0, 1);
  Color.Green = new Color(0, 1, 0, 1);
  Color.Blue = new Color(0, 0, 1, 1);
  Color.Yellow = new Color(1, 1, 0, 1);
  Color.Pink = new Color(1, 0, 1, 1);
  Color.Cyan = new Color(0, 1, 1, 1);
  Color.Orange = new Color(1, 0.5, 0, 1);
  return Color;
});

// Generated by CoffeeScript 1.6.2
define('pex/geom/Geometry',['require','pex/geom/Vec2','pex/geom/Vec3','pex/geom/Vec4','pex/color/Color'],function(require) {
  var Color, Geometry, Vec2, Vec3, Vec4, elementSizeMap;

  Vec2 = require('pex/geom/Vec2');
  Vec3 = require('pex/geom/Vec3');
  Vec4 = require('pex/geom/Vec4');
  Color = require('pex/color/Color');
  elementSizeMap = {
    'Vec2': 2,
    'Vec3': 3,
    'Vec4': 4,
    'Color': 4
  };
  return Geometry = (function() {
    function Geometry(attribs) {
      var attrib, attribName, _ref, _ref1;

      this.faces = [];
      this.edges = [];
      this.attribs = attribs || {};
      _ref = this.attribs;
      for (attribName in _ref) {
        attrib = _ref[attribName];
        attrib.isDirty = true;
        attrib.elementSize = elementSizeMap[attrib.type];
        attrib.data = [];
        attrib.length = (_ref1 = attrib.length) != null ? _ref1 : 0;
        attrib.buf = new Float32Array(attrib.elementSize * attrib.length);
      }
    }

    Geometry.prototype.allocate = function(numVertices) {
      var attrib, attribName, i, _ref, _results;

      console.log('allocating');
      _ref = this.attribs;
      _results = [];
      for (attribName in _ref) {
        attrib = _ref[attribName];
        console.log('allocating', attribName);
        _results.push((function() {
          var _i, _ref1, _results1;

          _results1 = [];
          for (i = _i = 0, _ref1 = numVertices - 1; _i <= _ref1; i = _i += 1) {
            if (attrib.data[i] == null) {
              switch (attrib.type) {
                case 'Vec2':
                  _results1.push(attrib.data[i] = new Vec2());
                  break;
                case 'Vec3':
                  _results1.push(attrib.data[i] = new Vec3());
                  break;
                case 'Vec4':
                  _results1.push(attrib.data[i] = new Vec4());
                  break;
                case 'Color':
                  _results1.push(attrib.data[i] = new Color());
                  break;
                default:
                  _results1.push(void 0);
              }
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        })());
      }
      return _results;
    };

    return Geometry;

  })();
});

// Generated by CoffeeScript 1.6.2
define('pex/geom/Face4',['require'],function(require) {
  var Face4;

  return Face4 = (function() {
    function Face4(a, b, c, d) {
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
    }

    return Face4;

  })();
});

// Generated by CoffeeScript 1.6.2
var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

define('pex/geom/gen/Cube',['require','pex/geom/Vec2','pex/geom/Vec2','pex/geom/Face4','pex/geom/Geometry'],function(require) {
  var Cube, Face4, Geometry, Vec2, Vec3;

  Vec2 = require('pex/geom/Vec2');
  Vec3 = require('pex/geom/Vec2');
  Face4 = require('pex/geom/Face4');
  Geometry = require('pex/geom/Geometry');
  return Cube = (function(_super) {
    __extends(Cube, _super);

    function Cube(sx, sy, sz, nx, ny, nz) {
      var attribs, faces, makePlane, normals, numVertices, positions, texCoords, vertexIndex;

      sx = sx || 1;
      sy = sy || sx || 1;
      sz = sz || sx || 1;
      nx = nx || 1;
      ny = ny || 1;
      nz = nz || 1;
      numVertices = (nx + 1) * (ny + 1) * 2 + (nx + 1) * (nz + 1) * 2 + (nz + 1) * (ny + 1) * 2;
      attribs = {
        position: {
          type: 'Vec3',
          length: numVertices
        },
        normal: {
          type: 'Vec3',
          length: numVertices
        },
        texCoord: {
          type: 'Vec2',
          length: numVertices
        }
      };
      Cube.__super__.constructor.call(this, attribs);
      positions = this.attribs.position.data;
      normals = this.attribs.normal.data;
      texCoords = this.attribs.texCoord.data;
      faces = this.faces;
      vertexIndex = 0;
      makePlane = function(u, v, w, su, sv, nu, nv, pw, flipu, flipv) {
        var face, i, j, n, normal, texCoord, vert, vertShift, _i, _j, _k, _ref, _results;

        vertShift = vertexIndex;
        for (j = _i = 0; 0 <= nv ? _i <= nv : _i >= nv; j = 0 <= nv ? ++_i : --_i) {
          for (i = _j = 0; 0 <= nu ? _j <= nu : _j >= nu; i = 0 <= nu ? ++_j : --_j) {
            vert = positions[vertexIndex] = Vec3.create();
            vert[u] = (-su / 2 + i * su / nu) * flipu;
            vert[v] = (-sv / 2 + j * sv / nv) * flipv;
            vert[w] = pw;
            normal = normals[vertexIndex] = Vec3.create();
            normal[u] = 0;
            normal[v] = 0;
            normal[w] = pw / Math.abs(pw);
            texCoord = texCoords[vertexIndex] = Vec2.create();
            texCoord.x = i / nu;
            texCoord.y = j / nv;
            ++vertexIndex;
          }
        }
        _results = [];
        for (j = _k = 0, _ref = nv - 1; 0 <= _ref ? _k <= _ref : _k >= _ref; j = 0 <= _ref ? ++_k : --_k) {
          _results.push((function() {
            var _l, _ref1, _results1;

            _results1 = [];
            for (i = _l = 0, _ref1 = nu - 1; 0 <= _ref1 ? _l <= _ref1 : _l >= _ref1; i = 0 <= _ref1 ? ++_l : --_l) {
              n = vertShift + j * (nu + 1) + i;
              face = new Face4(n, n + nu + 1, n + nu + 2, n + 1);
              _results1.push(faces.push(face));
            }
            return _results1;
          })());
        }
        return _results;
      };
      makePlane('x', 'y', 'z', sx, sy, nx, ny, sz / 2, 1, -1);
      makePlane('x', 'y', 'z', sx, sy, nx, ny, -sz / 2, -1, -1);
      makePlane('z', 'y', 'x', sz, sy, nz, ny, -sx / 2, 1, -1);
      makePlane('z', 'y', 'x', sz, sy, nz, ny, sx / 2, -1, -1);
      makePlane('x', 'z', 'y', sx, sz, nx, nz, sy / 2, 1, 1);
      makePlane('x', 'z', 'y', sx, sz, nx, nz, -sy / 2, 1, -1);
    }

    return Cube;

  })(Geometry);
});

// Generated by CoffeeScript 1.6.2
define('pex/geom/Face3',['require'],function(require) {
  var Face3;

  return Face3 = (function() {
    function Face3(a, b, c) {
      this.a = a;
      this.b = b;
      this.c = c;
    }

    return Face3;

  })();
});

define('pex/geom/gen/Sphere',['pex/geom/Vec2', 'pex/geom/Vec3', 'pex/geom/Face3', 'pex/geom/Geometry'],
  function(Vec2, Vec3, Face3, Geometry) {

  function Sphere(r, nsides, nsegments) {
    r = r || 0.5;
    nsides = nsides || 36;
    nsegments = nsegments || 18;

    var numVertices = (nsides + 1) * (nsegments + 1);
    var vertexIndex = 0;

    var attribs = {
      position : {
        type : 'Vec3',
        length : numVertices
      },
      normal : {
        type : 'Vec3',
        length : numVertices
      },
      texCoord : {
        type : 'Vec2',
        length : numVertices
      }
    };

    Geometry.call(this, attribs);

    var positions = this.attribs.position.data;
    var normals = this.attribs.normal.data;
    var texCoords = this.attribs.texCoord.data;
    var faces = this.faces;

    var degToRad = 1/180.0 * Math.PI;

    var dphi   = 360.0/nsides;
    var dtheta = 180.0/nsegments;

    function evalPos(pos, theta, phi) {
      pos.x = r * Math.sin(theta * degToRad) * Math.sin(phi * degToRad);
      pos.y = r * Math.cos(theta * degToRad);
      pos.z = r * Math.sin(theta * degToRad) * Math.cos(phi * degToRad);
    }

    for (var theta=0, segment=0; theta<=180; theta+=dtheta, ++segment) {
      for (var phi=0, side=0; phi<=360; phi+=dphi, ++side) {
        var vert = positions[vertexIndex] = Vec3.create();
        var normal = normals[vertexIndex] = Vec3.create();
        var texCoord = texCoords[vertexIndex] = Vec2.create();

        evalPos(vert, theta, phi);

        normal.copy(vert).normalize();
        texCoord.set(phi/360.0, theta/180.0);

        ++vertexIndex;

        if (segment == nsegments) continue;
        if (side == nsides) continue;

        if (segment < nsegments - 1) {
          faces.push(new Face3(
            (segment  )*(nsides+1) + side,
            (segment+1)*(nsides+1) + side,
            (segment+1)*(nsides+1) + side + 1
          ));
        }

        if (segment > 0) {
          faces.push(new Face3(
            (segment  )*(nsides+1) + side,
            (segment+1)*(nsides+1) + side + 1,
            (segment  )*(nsides+1) + side + 1
          ));
        }
      }
    }
  }

  Sphere.prototype = Object.create(Geometry.prototype);

  return Sphere;
});
define('pex/geom/gen/LineBuilder',[
  'pex/geom/Geometry',
  'pex/geom/Vec3',
  'pex/color/Color'],
  function(Geometry, Vec3, Color) {
  function LineBuilder() {
    this.numVertices = 0;
    var initialLength = 8;
    Geometry.call(this, {
      position : {
        type : 'Vec3',
        length : initialLength
      },
      color : {
        type : 'Vec3',
        length : initialLength
      }
    })
  }

  LineBuilder.prototype = Object.create(Geometry);

  LineBuilder.prototype.addLine = function(a, b, colorA, colorB) {
    colorA = colorA || Color.White;
    colorB = colorB || colorA;

    var positions = this.attribs.position.data;
    var colors = this.attribs.color.data;

    positions[this.numVertices + 0] = Vec3.create().copy(a);
    positions[this.numVertices + 1] = Vec3.create().copy(b);

    colors[this.numVertices + 0] = Color.create().copy(colorA);
    colors[this.numVertices + 1] = Color.create().copy(colorB);

    this.numVertices += 2;
  }

  LineBuilder.prototype.addCross = function(pos, size, color) {
    this.assureSize(this.numVertices + 6);

    size = size || 0.1;
    var halfSize = size / 2;

    color = color || Color.White;

    var positions = this.attribs.position.data;
    var colors = this.attribs.color.data;

    positions[this.numVertices + 0] = Vec3.create().set(pos.x - halfSize, pos.y, pos.z);
    positions[this.numVertices + 1] = Vec3.create().set(pos.x + halfSize, pos.y, pos.z);
    positions[this.numVertices + 2] = Vec3.create().set(pos.x, pos.y - halfSize, pos.z);
    positions[this.numVertices + 3] = Vec3.create().set(pos.x, pos.y + halfSize, pos.z);
    positions[this.numVertices + 4] = Vec3.create().set(pos.x, pos.y, pos.z - halfSize);
    positions[this.numVertices + 5] = Vec3.create().set(pos.x, pos.y, pos.z + halfSize);

    colors[this.numVertices + 0] = Color.create().set(color.r, color.g, color.b, color.a);
    colors[this.numVertices + 1] = Color.create().set(color.r, color.g, color.b, color.a);
    colors[this.numVertices + 2] = Color.create().set(color.r, color.g, color.b, color.a);
    colors[this.numVertices + 3] = Color.create().set(color.r, color.g, color.b, color.a);
    colors[this.numVertices + 4] = Color.create().set(color.r, color.g, color.b, color.a);
    colors[this.numVertices + 5] = Color.create().set(color.r, color.g, color.b, color.a);

    this.numVertices += 6;
  }

  LineBuilder.prototype.start = function() {
    this.numVertices = 0;
  }

  LineBuilder.prototype.end = function() {
    var n = this.attribs.position.data.length;

    for(var i=this.numVertices; i<n; i++) {
      this.attribs.position.data[i].set(0, 0, 0);
      this.attribs.color.data[i].set(0, 0, 0, 0);
    }
    this.attribs.position.isDirty = true;
    this.attribs.color.isDirty = true;
    this.numVertices = 0;
  }

  return LineBuilder;
});
define('pex/geom/gen',
  [
    'pex/geom/gen/Cube',
    'pex/geom/gen/Sphere',
    'pex/geom/gen/LineBuilder'
  ],
  function(Cube, Sphere, LineBuilder) {
    return {
      Cube : Cube,
      Sphere : Sphere,
      LineBuilder : LineBuilder
    };
  }
);

// Generated by CoffeeScript 1.6.2
define('pex/geom/Edge',['require'],function(require) {
  var Edge;

  return Edge = (function() {
    function Edge(a, b) {
      this.a = a;
      this.b = b;
    }

    return Edge;

  })();
});

define('pex/geom/FacePolygon',[], function() {
  function FacePolygon(vertexIndexList) {
    this.numVertices = vertexIndexList.length;
    var indices = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    for(var i=0; i<vertexIndexList.length; i++) {
      this[indices[i]] = vertexIndexList[i];
    }
  }

  return FacePolygon;
});
// Generated by CoffeeScript 1.6.2
define('pex/geom/Line2D',['require','pex/geom/Vec2'],function(require) {
  var Line2D, Vec2;

  Vec2 = require('pex/geom/Vec2');
  return Line2D = (function() {
    function Line2D(a, b) {
      this.a = a;
      this.b = b;
    }

    Line2D.prototype.isPointOnTheLeftSide = function(p) {
      return ((this.b.x - this.a.x) * (p.y - this.a.y) - (this.b.y - this.a.y) * (p.x - this.a.x)) <= 0;
    };

    Line2D.prototype.projectPoint = function(p) {
      var ab, ap, d;

      ab = Vec2.create().asSub(this.b, this.a).normalize();
      ap = Vec2.create().asSub(p, this.a);
      d = ab.dot(ap);
      return ab.scale(d).add(this.a);
    };

    Line2D.prototype.distanceToPoint = function(p) {
      return this.projectPoint(p).distance(p);
    };

    Line2D.prototype.intersect = function(line) {
      var D0, D1, E, P0, P1, kross, out, s, sqrEpsilon, sqrKross, sqrLen0, sqrLen1, sqrLenE;

      sqrEpsilon = 0.000001;
      P0 = this.a;
      D0 = Vec2.create().asSub(this.b, this.a);
      P1 = line.a;
      D1 = Vec2.create().asSub(line.b, line.a);
      E = Vec2.create().asSub(P1, P0);
      kross = D0.x * D1.y - D0.y * D1.x;
      sqrKross = kross * kross;
      sqrLen0 = D0.x * D0.x + D0.y * D0.y;
      sqrLen1 = D1.x * D1.x + D1.y * D1.y;
      if (sqrKross > sqrEpsilon * sqrLen0 * sqrLen1) {
        s = (E.x * D1.y - E.y * D1.x) / kross;
        out = Vec2.create().copy(D0).scale(s).add(P0);
        return out;
      }
      sqrLenE = E.x * E.x + E.y * E.y;
      kross = E.x * D0.y - E.y * D0.x;
      sqrKross = kross * kross;
      if (sqrKross > sqrEpsilon * sqrLen0 * sqrLenE) {
        return null;
      }
      return null;
    };

    return Line2D;

  })();
});

define('pex/geom/Rect',[], function() {
  function Rect(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  Rect.prototype.set = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  Rect.prototype.contains = function(point) {
    return (point.x >= this.x && point.x <= this.x + this.width && point.y >= this.y && point.y <= this.y + this.height);
  }

  return Rect;
});
define('pex/geom/Triangle2D',['pex/geom/Line2D'], function(Line2D) {
  function sign(a, b, c) {
    return (a.x - c.x) * (b.y - c.y) - (b.x - c.x) * (a.y - c.y);
  }

  function Triangle2D(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }

  //http://stackoverflow.com/a/2049593
  //doesn't properly handle points on the edge of the triangle
  Triangle2D.prototype.contains = function(p) {
    var signAB = sign(this.a, this.b, p) < 0;
    var signBC = sign(this.b, this.c, p) < 0;
    var signCA = sign(this.c, this.a, p) < 0;

    return (signAB == signBC) && (signBC == signCA);
  }

  return Triangle2D;
});



define('pex/geom/Polygon2D',['pex/geom/Line2D', 'pex/geom/Vec2'], function(Line2D, Vec2) {

  //Based on http://www.mathopenref.com/coordpolygonarea.html
  //and http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order
  //`vertices` - should be counter-clockwise
  function signedPolygon2DArea(vertices) {
    var sum = 0;
    var n = vertices.length;

    for(var i=0; i<n; i++) {
      var v = vertices[i];
      var nv = vertices[(i+1) % n];
      sum += v.x * nv.y - v.y * nv.x;
    }

    return sum * 0.5;
  }

  function Polygon2D(vertices) {
    this.vertices = vertices || [];
    this.center = Vec2.create();
  }

  Polygon2D.prototype.getArea = function() {
    return Math.abs(signedPolygon2DArea(this.vertices));
  }

  Polygon2D.prototype.isClockwise = function() {
    return signedPolygon2DArea(this.vertices) > 0;
  }

  Polygon2D.prototype.flipVertexOrder = function() {
    this.vertices.reverse();
  }

  Polygon2D.prototype.getCenter = function() {
    this.center.x = 0;
    this.center.y = 0;
    for(var i=0; i<this.vertices.length; i++) {
      this.center.x += this.vertices[i].x;
      this.center.y += this.vertices[i].y;
    }

    this.center.x /= this.vertices.length;
    this.center.y /= this.vertices.length;

    return this.center;
  }

  Polygon2D.prototype.clip = function(clippingPolygon2D) {
    var clippedVertices = [];
    var vertices = this.vertices;

    var numClippingEdges = clippingPolygon2D.vertices.length;

    for(var i=0; i<numClippingEdges; i++) {
      var clippingEdge = new Line2D(clippingPolygon2D.vertices[i], clippingPolygon2D.vertices[(i+1)%numClippingEdges]);
      for(var j=0; j<vertices.length; j++) {
        var start = vertices[(j - 1 + vertices.length) % vertices.length];
        var end = vertices[j];
        var isStartInside = clippingEdge.isPointOnTheLeftSide(start);
        var isEndInside = clippingEdge.isPointOnTheLeftSide(end);
        //console.log(start, end);
        if (isStartInside && isEndInside) {
          clippedVertices.push(end);
          prevStart = end;
        }
        else if (isStartInside && !isEndInside) {
          intersection = clippingEdge.intersect(new Line2D(start, end));
          clippedVertices.push( intersection );
        }
        else if (!isStartInside && !isEndInside) {
          //do nothing
          prevStart = null;
        }
        else if (!isStartInside && isEndInside) {
          var intersection = clippingEdge.intersect(new Line2D(start, end));
          clippedVertices.push( intersection );
          clippedVertices.push( end );
        }
      }
      vertices = clippedVertices;
      clippedVertices = [];
    }

    return new Polygon2D(vertices);
  }

  return Polygon2D;
});
define('pex/geom/hem/HEEdge',[], function() {
  function HEEdge(vert, pair, face, next) {
    this.vert = vert;
    this.pair = pair;
    this.face = face;
    this.next = next;
    this.selected = 0;
  }

  HEEdge.prototype.findPrev = function() {
    var edge = this;
    while(edge.next != this) {
      edge = edge.next;
    }
    return edge;
  }
  return HEEdge;
});

define('pex/geom/hem/HEVertex',['pex/geom/Vec3'], function(Vec3) {
  function HEVertex(x, y, z, edge) {
    this.position = Vec3.create(x, y, z);
    this.edge = edge;
    this.selected = 0;
  }

  HEVertex.prototype.getNormal = function() {
    var faces = [];

    var edge = this.edge;
    do {
      faces.push(edge.face);
      edge = edge.pair.next;
    } while (edge != this.edge);

    var n = Vec3.create(0, 0, 0);
    for(var i in faces) {
      n.add(faces[i].getNormal());
    }
    n.normalize();

    return n;
  }

  HEVertex.prototype.forEachFace = function(callback) {
    var faceEdge = this.edge;
    var face = faceEdge.face;
    do {
      callback(face);
      faceEdge = faceEdge.pair.next;
      face = faceEdge.face;
    } while(faceEdge != this.edge);
  }

  HEVertex.prototype.forEachEdge = function(callback) {
    var faceEdge = this.edge;
    do {
      callback(faceEdge);
      faceEdge = faceEdge.pair.next;
    } while(faceEdge != this.edge);
  }

  HEVertex.prototype.clearCaches = function() {
    this.edgesCache = null;
  }

  var edgeVec3 = Vec3.create();
  HEVertex.prototype.forEachEdgeWithin = function(r, callback) {
    if (this.edgesCache) {
      this.edgesCache.forEach(callback);
      return;
    }

    var edges = [this.edge];
    var visited = 0;
    var r2 = r * r;

    while(visited < edges.length) {
      var startEdge = edges[visited++];
      var faceEdge = startEdge;
      do {
        edgeVec3.asSub(this.position, faceEdge.next.vert.position);
        var dist = edgeVec3.lengthSquared();
        if ((edges.indexOf(faceEdge.next) == -1) && (dist < r2)) {
          edges.push(faceEdge.next);
        }
        faceEdge = faceEdge.pair.next;
      } while(faceEdge != startEdge);
    }

    edges.shift(); //remove self

    edges.forEach(callback); //iterate with external function

    this.edgesCache = edges;
  }


  HEVertex.prototype.getNeighbors = function(radius) {
    var neighbors = [];
    this.forEachEdge(function(edge) {
      neighbors.push(edge.next.vert);
    })
    return neighbors;
  }

  return HEVertex;
});

define('pex/geom/hem/HEFace',['pex/geom/Vec3'], function(Vec3) {
  function HEFace(edge) {
    this.edge = edge;
    this.selected = 0;
    this.normal = null;
  }

  HEFace.prototype.getNormal = function() {
    if (!this.normal) {
      this.normal = Vec3.create();
    }
    var a = this.edge.vert.position;
    var b = this.edge.next.vert.position;
    var c = this.edge.next.next.vert.position;
    var ab = HEFace.prototype.getNormal.ab = HEFace.prototype.getNormal.ab || Vec3.create();
    var ac = HEFace.prototype.getNormal.ac = HEFace.prototype.getNormal.ac || Vec3.create();

    ab.asSub(b, a);
    ac.asSub(c, a);
    this.normal.asCross(ab, ac).normalize();

    return this.normal;
  }

  //calculates the centroid of the face
  HEFace.prototype.getCenter = function() {
    if (!this.center) {
      this.center = Vec3.create();
    }
    this.center.set(0, 0, 0);
    var vertexCount = 0;
    var edge = this.edge;
    do {
      this.center.add(edge.vert.position);
      vertexCount++;
      edge = edge.next;
    } while (edge != this.edge);

    this.center.scale(1/vertexCount);
    return this.center;
  }

  HEFace.prototype.getAllVertices = function() {
    var vertices = [];
    var edge = this.edge;
    do {
      vertices.push(edge.vert);
      edge = edge.next;
    } while (edge != this.edge);
    return vertices;
  }

  HEFace.prototype.edgePairLoop = function(callback) {
    var edge = this.edge;
    do {
      callback(edge, edge.next);
      edge = edge.next;
    } while(edge != this.edge);

  }

  return HEFace;
});

define('pex/geom/BoundingBox',['pex/geom/Vec3'], function(Vec3) {
  function BoundingBox(min, max) {
    this.min = min;
    this.max = max;
  }

  BoundingBox.fromPositionSize = function(pos, size) {
    return new BoundingBox(
      Vec3.create(pos.x - size.x/2, pos.y - size.y/2, pos.z - size.z/2),
      Vec3.create(pos.x + size.x/2, pos.y + size.y/2, pos.z + size.z/2)
    );
  }

  BoundingBox.fromPoints = function(points) {
    var bbox = new BoundingBox(points[0].clone(), points[0].clone());
    points.forEach(bbox.addPoint.bind(bbox));
    return bbox;
  }

  BoundingBox.prototype.isEmpty = function() {
    if (!this.min || !this.max) return true;
    else return false;
  }

  BoundingBox.prototype.addPoint = function(p) {
    if (this.isEmpty()) {
      this.min = p.clone();
      this.max = p.clone();
    }

    if (p.x < this.min.x) this.min.x = p.x;
    if (p.y < this.min.y) this.min.y = p.y;
    if (p.z < this.min.z) this.min.z = p.z;
    if (p.x > this.max.x) this.max.x = p.x;
    if (p.y > this.max.y) this.max.y = p.y;
    if (p.z > this.max.z) this.max.z = p.z;
  }

  BoundingBox.prototype.getSize = function() {
    return Vec3.create(
     (this.max.x - this.min.x),
     (this.max.y - this.min.y),
     (this.max.z - this.min.z)
    );
  }

  BoundingBox.prototype.getCenter = function(out) {
    return Vec3.create(
     this.min.x + (this.max.x - this.min.x)/2,
     this.min.y + (this.max.y - this.min.y)/2,
     this.min.z + (this.max.z - this.min.z)/2
    );
  }

  return BoundingBox;
});
define('pex/geom/Octree',['pex/geom/Vec3'], function(Vec3) {
  //position is bottom left corner of the cell
  function Octree(position, size, accuracy) {
    this.maxDistance = Math.max(size.x, Math.max(size.y, size.z));
    this.accuracy = (typeof(accuracy) !== 'undefined') ? accuracy : this.maxDistance / 1000;
    this.root = new Octree.Cell(this, position, size, 0);
  }

  Octree.fromBoundingBox = function(bbox) {
    return new Octree(bbox.min.clone(), bbox.getSize().clone());
  }

  Octree.MaxLevel = 8;

  //p = {x, y, z}
  Octree.prototype.add = function(p) {
    this.root.add(p);
  }

  //check if the point was already added to the octreee
  Octree.prototype.has = function(p) {
    return this.root.has(p);
  }

  Octree.prototype.findNearestPoint = function(p, options) {
    options = options || {};
    return this.root.findNearestPoint(p, options);
  }

  Octree.Cell = function(tree, position, size, level) {
    this.tree = tree;
    this.position = position;
    this.size = size;
    this.level = level;
    this.points = [];
    this.children = [];
  }

  Octree.Cell.prototype.has = function(p) {
    if (!this.contains(p)) return null;

    if (this.children.length > 0) {
      for(var i=0; i<this.children.length; i++) {
        var duplicate = this.children[i].has(p);
        if (duplicate) {
          return duplicate;
        }
      }
      return null;
    }
    else {
      var minDistSqrt = this.tree.accuracy * this.tree.accuracy;
      for(var i=0; i<this.points.length; i++) {
        var o = this.points[i];
        var distSq = p.squareDistance(o);
        if (distSq <= minDistSqrt) {
          return o;
        }
      }
      return null;
    }
  }

  Octree.Cell.prototype.add = function(p) {
    this.points.push(p);

    if (this.children.length > 0) {
      this.addToChildren(p);
    }
    else {
      if (this.points.length > 1 && this.level < Octree.MaxLevel) {
        this.split();
      }
    }
  }

  Octree.Cell.prototype.addToChildren = function(p) {
    for(var i=0; i<this.children.length; i++) {
      if (this.children[i].contains(p)) {
        this.children[i].add(p);
        break;
      }
    }
  }

  Octree.Cell.prototype.contains = function(p) {
    return p.x >= this.position.x - this.tree.accuracy
        && p.y >= this.position.y - this.tree.accuracy
        && p.z >= this.position.z - this.tree.accuracy
        && p.x <= this.position.x + this.size.x + this.tree.accuracy
        && p.y <= this.position.y + this.size.y + this.tree.accuracy
        && p.z <= this.position.z + this.size.z + this.tree.accuracy;
  }

  // 1 2 3 4
  // 5 6 7 8
  Octree.Cell.prototype.split = function() {
    var x = this.position.x;
    var y = this.position.y;
    var z = this.position.z;
    var w2 = this.size.x/2;
    var h2 = this.size.y/2;
    var d2 = this.size.z/2;

    this.children.push(new Octree.Cell(this.tree, Vec3.create(x, y, z), Vec3.create(w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.create(x + w2, y, z), Vec3.create( w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.create(x, y, z + d2), Vec3.create( w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.create(x + w2, y, z + d2), Vec3.create( w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.create(x, y + h2, z), Vec3.create(w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.create(x + w2, y + h2, z), Vec3.create( w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.create(x, y + h2, z + d2), Vec3.create( w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.create(x + w2, y + h2, z + d2), Vec3.create( w2, h2, d2), this.level + 1));

    for(var i=0; i<this.points.length; i++) {
      this.addToChildren(this.points[i]);
    }
  }

  Octree.Cell.prototype.findNearestPoint = function(p, options) {
    var nearest = null;
    if (this.children.length > 0) {
      for(var i=0; i<this.children.length; i++) {
        var child = this.children[i];
        if (child.points.length > 0 && child.contains(p)) {
          nearest = child.findNearestPoint(p, options);
          if (nearest) break;
        }
      }
    }
    if (!nearest && this.points.length > 0) {
      var minDistSq = this.tree.maxDistance * this.tree.maxDistance;
      for(var i=0; i<this.points.length; i++) {
        var distSq = this.points[i].squareDistance(p);
        if (distSq <= minDistSq) {
          if (distSq == 0 && options.notSelf) continue;
          minDistSq = distSq;
          nearest = this.points[i];
        }
      }
    }
    return nearest;
  }

  return Octree;
});
//Half-Edge mesh data structure
//Based on http://www.flipcode.com/archives/The_Half-Edge_Data_Structure.shtml
//and http://fgiesen.wordpress.com/2012/03/24/half-edge-based-mesh-representations-practice/
define('pex/geom/hem/HEMesh',[
  'pex/geom/Vec3',
  'pex/geom/hem/HEEdge',
  'pex/geom/hem/HEVertex',
  'pex/geom/hem/HEFace',
  'pex/geom/BoundingBox',
  'pex/geom/Octree'
],
function(Vec3, HEEdge, HEVertex, HEFace, BoundingBox, Octree) {
  function HEMesh() {
    this.vertices = new Array();
    this.faces = new Array();
    this.edges = new Array();
  }

  HEMesh.prototype.fixDuplicatedVertices = function() {
    var bbox = BoundingBox.fromPoints(this.vertices.map(function(v) { return v.position; }));
    var octree = Octree.fromBoundingBox(bbox);
    var dup = 0;
    for(var i=0; i<this.vertices.length; i++) {
      var v = this.vertices[i];
      var duplicate = octree.has(v.position);
      if (!duplicate) {
        v.position.vertex = v;
        octree.add(v.position);
      }
      else {
        this.vertices.splice(i, 1);
        i--;
        var duplicateVertex = duplicate.vertex;
        for(var j=0; j<this.edges.length; j++) {
          if (this.edges[j].vert == v) {
            this.edges[j].vert = duplicateVertex;
          }
        }
      }
    }
    return this;
  }

  HEMesh.prototype.faceHash = function(f) {
    var vertices = f.getAllVertices();
    var indices = vertices.map(function(v) {
      return this.vertices.indexOf(v);
    }.bind(this));
    indices = indices.sort();
    var hash = indices.join('_');
    if (indices[0] == indices[1] || indices[1] == indices[2]) {
      console.log(hash);
    }
    return hash;
  }

  HEMesh.prototype.edgeHash = function(e) {
    var i = this.vertices.indexOf(e.vert);
    var j = this.vertices.indexOf(e.next.vert);
    var hash = i + "_" + j;
    return hash;
  }

  HEMesh.prototype.fixDuplicatedEdges = function() {
    var uniques = [];
    for(var i=0; i<this.edges.length; i++) {
      var edge = this.edges[i];
      var hash = this.edgeHash(edge);
      var duplicateIndex = uniques.indexOf(hash);
      var duplicate = (duplicateIndex !== -1);
      if (!duplicate) {
        uniques.push(hash);
      }
      else {
        var duplicateEdge = this.edges[duplicateIndex];
        this.edges.splice(i, 1);
        i--;
        this.vertices.forEach(function(v) {
          if (v.edge == edge) v.edge = duplicateEdge;
        });
        this.faces.forEach(function(f) {
          if (f.edge == edge) {
            f.edge = duplicateEdge;
            f.edge.face = f;
          }
        });
      }
    }
  }

  HEMesh.prototype.fixVertexEdges = function() {
    this.vertices.forEach(function(v) {
      v.edge = null;
    });
    for(var i in this.edges) {
      var edge = this.edges[i];
      edge.vert.edge = edge;
    }
    return this;
  }

  var pairs = 0;
  HEMesh.prototype.fixEdgePairs = function() {
    for(var i=0; i<this.edges.length; i++) {
      this.edges[i].pair = null;
    }
    var numPairs = 0;
    var hash = {};
    for(var i=0; i<this.vertices.length; i++) {
      this.vertices[i].index = i;
    }
    for(var i=0; i<this.edges.length; i++) {
      var edge = this.edges[i];
      var edgeHash = edge.vert.index + "," + edge.next.vert.index;
      var pairEdgeHash = edge.next.vert.index + "," + edge.vert.index;
      hash[edgeHash] = edge;
      if (hash[pairEdgeHash]) {
        edge.pair = hash[pairEdgeHash];
        edge.pair.pair = edge;
      }
    }
    for(var i=0; i<this.vertices.length; i++) {
      this.vertices[i].index = -1;
    }
    return this;
  }

  // HEMesh.prototype.getEdgeBetween = function(a, b) {
  //       for(var i in this.edges) {
  //         var edge = this.edges[i];
  //         if (edge.vert == a && edge.next.vert == b) {
  //           return edge;
  //         }
  //       }
  //       return null;
  //   }

  HEMesh.prototype.check = function() {
    for(var i in this.vertices) {
      if (this.vertices[i].edge == null) {
        console.log("Missing vertex edge at ", i);
      }
      else if (this.vertices[i] != this.vertices[i].edge.vert) {
        console.log("Edge doesn't point to it's vertex at ", i);
      }
    }

    for(var i in this.faces) {
      if (this.faces[i].edge == null) {
        console.log("Missing faces edge at ", i);
      }
      else if (this.faces[i] != this.faces[i].edge.face) {
        console.log("Edge doesn't point to it's face at ", i);
      }

      if (this.edges.indexOf(this.faces[i].edge) === -1) {
        console.log("Invalid face edge at ", i);
      }
    }

    for(var i in this.edges) {
      var edge = this.edges[i];
      var e = edge;
      var watchDog = 0;

      if (edge.pair == null) {
        console.log("Edge doesn't have it's pair", i);
      }
      else if (edge.pair.pair != edge) {
        console.log("Edge pair doesn't match", i, this.edges.indexOf(edge), this.edges.indexOf(edge.pair), this.edges.indexOf(edge.pair.pair));
      }

      do {
        if (++watchDog > 100) {
          console.log("Edge watchDog break at", i, " . Wrong edge loop pointers?");
          break;
        }
        if (watchDog > 6) {
          console.log("Warning! Face with " + watchDog + " vertices");
        }
        if (e.next == null) {
          console.log("Missing edge next at ", i, ". Open loop.");
          break;
        }
        e = e.next;
      } while(e != edge)
    }

    return this;
  };

  HEMesh.prototype.splitVertex = function(vertex, newVertexPos, startEdge, endEdge) {
    var newVertex = new HEVertex(newVertexPos.x, newVertexPos.y, newVertexPos.z);
    this.vertices.push(newVertex);
    if (startEdge != null && startEdge == endEdge) {
      //edge
      var e = startEdge;
      var e2 = new HEEdge();
      e2.vert = newVertex;
      e2.next = e.next;
      e.next = e2;
      e2.face = e.face;
      this.edges.push(e2);
      newVertex.edge = e2;

      //opposite edge
      var o = startEdge.pair;
      var o2 = new HEEdge();
      o2.vert = newVertex;
      o2.next = o.next;
      o.next = o2;
      o2.face = o.face;
      this.edges.push(o2);

      o2.pair = e;
      e.pair = o2;

      e2.pair = o;
      o.pair = e2;

      return e2;
    }
    else if (startEdge == null && endEdge == null) {
      var newEdge1 = new HEEdge();
      var newEdge2 = new HEEdge();

      var edge = vertex.edge;
      var prevEdge = edge.findPrev();

      newEdge1.vert = vertex;
      newEdge2.vert = newVertex;
      newEdge1.face = edge.face;
      newEdge2.face = edge.face;

      newEdge1.next = newEdge2;
      newEdge2.next = edge;

      newEdge1.pair = newEdge2;
      newEdge2.pair = newEdge1;

      vertex.edge = newEdge1;
      prevEdge.next = newEdge1;

      newVertex.edge = newEdge2;

      this.edges.push(newEdge1);
      this.edges.push(newEdge2);

      return newEdge1;
    }
  };

  HEMesh.prototype.splitFace = function(vert1Edge, vert2Edge) {
    var vert1EdgeNext = vert1Edge.next;
    var vert2EdgeNext = vert2Edge.next;
    var vert1EdgePrev = vert1Edge.findPrev();
    var vert2EdgePrev = vert2Edge.findPrev();
    var oldFace = vert1Edge.face;

    var splitEdge1 = new HEEdge();
    var splitEdge2 = new HEEdge();
    this.edges.push(splitEdge1);
    this.edges.push(splitEdge2);

    splitEdge1.pair = splitEdge2;
    splitEdge2.pair = splitEdge1;

    splitEdge1.vert = vert2Edge.vert;
    splitEdge2.vert = vert1Edge.vert;

    splitEdge1.next = vert1Edge;
    vert2EdgePrev.next = splitEdge1;

    splitEdge2.next = vert2Edge;
    vert1EdgePrev.next = splitEdge2;

    splitEdge1.face = vert1Edge.face;

    var newFace = new HEFace(splitEdge2);
    this.faces.push(newFace);

    var tmpEdge = splitEdge2;
    do {
      tmpEdge.face = newFace;
      tmpEdge = tmpEdge.next;
    } while(tmpEdge != splitEdge2);

    //just ot make sure we don't point to one of the splitten vertices
    oldFace.edge = vert1Edge;

    if (oldFace.color) newFace.color = oldFace.color;

    return newFace;
  };

  HEMesh.prototype.splitEdge = function(edge, ratio) {
    ratio = ratio || 0.5;

    //newVertPos = v + ratio * (nv - v)
    //newVertPos = add3(v, scale3(ratio, sub3(nv, v)))
    //newVertPos = nv.clone().sub(v).scale(ratio).add(v);
    var newVertPos = Vec3.create()
      .asSub(edge.next.vert.position, edge.vert.position)
      .scale(ratio)
      .add(edge.vert.position);

    this.splitVertex(edge.vert, newVertPos, edge, edge);
  };

  HEMesh.prototype.splitFaceAtPoint = function(face, newPoint) {
    var vert = face.edge.vert;
    var edge = face.edge;
    vert.edge = edge; //to make sure we split the right face
    var newEdge = this.splitVertex(vert, newPoint); //new edges will be added before 'edge'
    var from = newEdge.next;
    var to = from.next.next; //next corner afther the old first
    //split the face from the new vertex to the next corner
    //and move one corner further
    var i = 0;
    do {
      this.splitFace(from, to);
      from = to.findPrev();
      to = from.next.next;
    } while (to != newEdge);

    return newEdge.next;
  };

  return HEMesh;
});

define('pex/utils/ArrayUtils',[], function() {
  function ArrayUtils() {
  }

  ArrayUtils.range = function(start, end) {
    var result = [];
    for(var i=start; i<end; i++) {
      result.push(i);
    }
    return result;
  }

  ArrayUtils.shuffled = function(list) {
    var newList = ArrayUtils.range(0, list.length);
    for(var i=0; i<newList.length; i++) {
      var j = Math.floor(Math.random() * newList.length);
      var tmp = newList[i];
      newList[i] = newList[j];
      newList[j] = tmp;
    }
    for(var i=0; i<newList.length; i++) {
      newList[i] = list[newList[i]];
    }
    return newList;
  }

  ArrayUtils.first = function(list, n) {
    n = n || 1;
    return list.slice(0, n);
  }

  return ArrayUtils;
});

define('pex/geom/hem/HESelection',['pex/geom/hem/HEMesh', 'pex/utils/ArrayUtils'], function(HEMesh, ArrayUtils) {

  function selected(o) { return o.selected; }

  function HESelection() {
  }

  HEMesh.prototype.clearVerticesSelection = function() {
    for(var i=0; i<this.vertices.length; i++) {
      this.vertices[i].selected = false;
    }
    return this;
  };

  HEMesh.prototype.clearEdgeSelection = function() {
    for(var i=0; i<this.edges.length; i++) {
      this.edges[i].selected = false;
    }
    return this;
  };

  HEMesh.prototype.clearFaceSelection = function() {
    for(var i=0; i<this.faces.length; i++) {
      this.faces[i].selected = false;
    }
    return this;
  };

  HEMesh.prototype.clearSelection = function() {
    this.clearVerticesSelection();
    this.clearEdgeSelection();
    this.clearFaceSelection();
    return this;
  };

  //repeat until number is satified or there is no vertices left...
  HEMesh.prototype.selectRandomVertices = function(count) {
    count = (count === undefined) ? this.vertices.length/2 : count;
    count = Math.min(count, this.vertices.length);
    if (count <= 1) count = Math.floor(count * this.vertices.length);

    var vertices = this.vertices;
    this.clearSelection();

    function selectVertex(i) { vertices[i].selected = true; }

    var indexList = ArrayUtils.range(0, this.vertices.length);
    indexList = ArrayUtils.shuffled(indexList);
    indexList = ArrayUtils.first(indexList, count);
    indexList.forEach(selectVertex);

    return this;
  };

  //repeat until number is satified or there is no vertices left...
  HEMesh.prototype.selectRandomFaces = function(count) {
    count = (count === undefined) ? this.faces.length/2 : count;
    count = Math.min(count, this.faces.length);
    if (count < 1) count = Math.floor(count * this.faces.length);

    var faces = this.faces;
    this.clearSelection();

    function selectFace(i) { faces[i].selected = true; }

    var indexList = ArrayUtils.range(0, this.faces.length);
    indexList = ArrayUtils.shuffled(indexList);
    indexList = ArrayUtils.first(indexList, count);
    indexList.forEach(selectFace);

    return this;
  };

  HEMesh.prototype.selectAllFaces = function() {
    function selectFace(f) { f.selected = true; }
    this.faces.forEach(selectFace);
    return this;
  };

  HEMesh.prototype.selectFace = function(face) {
    face.selected = true;
    return this;
  }

  HEMesh.prototype.expandVerticesSelectionToFaces = function() {
    this.vertices.filter(selected).forEach(function(vertex) {
      vertex.forEachFace(function(face) {
        face.selected = true;
      });
    });
    return this;
  };

  HEMesh.prototype.expandFaceSelection = function() {
    var neighborsToSelect = [];
    this.getSelectedFaces().forEach(function(face) {
      face.getNeighborFaces().forEach(function(neighborFace) {
        if (neighborsToSelect.indexOf(neighborFace) == -1) neighborsToSelect.push(neighborFace);
      });
    });
    function selectFace(face) { face.selected = true; }
    neighborsToSelect.forEach(selectFace);
    return this;
  };

  HEMesh.prototype.getSelectedVertices = function() {
    return this.vertices.filter(selected);
  };

  HEMesh.prototype.getSelectedFaces = function() {
    return this.faces.filter(selected);
  };

  HEMesh.prototype.hasSelection = function() {
    var selectedVertexCount = this.vertices.filter(selected).length;
    var selectedEdgesCount = this.edges.filter(selected).length;
    var selectedFacesCount = this.faces.filter(selected).length;

    return selectedVertexCount + selectedEdgesCount + selectedFacesCount > 0;
  };

  return HESelection;
});

define('pex/geom/hem/HEMarking',['pex/geom/hem/HEMesh'], function(HEMesh) {
  function HEMarking() {
  }

  function removeMark(o) { o.marked = false; }

  HEMesh.prototype.clearMarking = function() {
    this.vertices.forEach(removeMark);
    this.edges.forEach(removeMark);
    this.faces.forEach(removeMark);
    return this;
  };

  return HEMarking;
});
define('pex/geom/hem/HEGeometryConverter',[
  'pex/geom/Vec3',
  'pex/geom/Face3',
  'pex/geom/Face4',
  'pex/geom/FacePolygon',
  'pex/geom/Geometry',
  'pex/geom/hem/HEMesh',
  'pex/geom/hem/HEVertex',
  'pex/geom/hem/HEEdge',
  'pex/geom/hem/HEFace',
  'pex/geom/Edge',
  'pex/geom/gen/LineBuilder'
],
function(Vec3, Face3, Face4, FacePolygon, Geometry, HEMesh, HEVertex, HEEdge, HEFace, Edge, LineBuilder)  {
  function HEGeometryConverter() {
  }

  HEMesh.prototype.fromGeometry = function(geom) {
    this.vertices.length = 0;
    this.faces.length = 0;
    this.edges.length = 0;

    var positions = geom.attribs.position.data;

    for(var i=0; i<positions.length; i++) {
      var pos = positions[i];
      this.vertices.push(new HEVertex(pos.x, pos.y, pos.z));
    }

    var indices = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    var newEdges = [null, null, null, null, null];
    var numEdges = 3;
    if (geom.faces && geom.faces.length > 0) {
      for(var i=0; i<geom.faces.length; i++) {
        var f = geom.faces[i];
        var newFace = new HEFace();
        this.faces.push(newFace);

        if (f instanceof Face4) {
          numEdges = 4;
        }
        if (f instanceof FacePolygon) {
          numEdges = f.numVertices;
        }

        for(var j=0; j<numEdges; j++) {
          newEdges[j] = new HEEdge();
          this.edges.push(newEdges[j]);
          var vertexIndex = f[indices[j]];
          newEdges[j].vert = this.vertices[vertexIndex];
          newEdges[j].face = newFace;
        }
        for(var k=0; k<numEdges; k++) {
          newEdges[k].next = newEdges[(k+1) % numEdges];
        }

        newFace.edge = newEdges[0];
      }
    }
    else {
      for(var i=0; i<geom.vertices.length; i+=3) {
        var newFace = new HEFace();
        this.faces.push(newFace);
        var numEdges = 3;
        for(var j=0; j<numEdges; j++) {
          newEdges[j] = new HEEdge();
          this.edges.push(newEdges[j]);
          var vertexIndex = i + j;
          newEdges[j].vert = this.vertices[vertexIndex];
          newEdges[j].face = newFace;
        }
        for(var k=0; k<numEdges; k++) {
          newEdges[k].next = newEdges[(k+1) % numEdges];
        }
        newFace.edge = newEdges[0];
      }
    }

    this.fixDuplicatedVertices();
    this.fixDuplicatedEdges();
    this.fixVertexEdges();
    this.fixEdgePairs();
    this.check();
    return this;
  };

  HEMesh.prototype.toFlatGeometry = function(geometry, selectedOnly) {
    selectedOnly = (typeof(selectedOnly) === 'undefined') ? false : selectedOnly;
    var numVertices = 0;
    var faces = this.faces;
    if (selectedOnly) {
      faces = this.getSelectedFaces();
    }

    faces.forEach(function(f) {
      var faceVertexCount = f.getAllVertices().length;
      if (faceVertexCount == 3) numVertices += 3;
      else if (faceVertexCount == 4) numVertices += 6;
    });

    if (!geometry) {
      geometry = new Geometry({
        position : {
          type: 'Vec3',
          length : numVertices
        },
        normal : {
          type: 'Vec3',
          length : numVertices
        }
      });
    }

    geometry.allocate(numVertices);

    var positions = geometry.attribs.position.data;
    var normals = geometry.attribs.normal.data;

    geometry.attribs.position.isDirty = true;
    geometry.attribs.normal.isDirty = true;

    var vertexIndex = 0;
    for(var i in faces) {
      var face = faces[i];
      var faceVertices = face.getAllVertices();
      var faceNormal = face.getNormal();
      if (faceVertices.length == 3) {
        positions[vertexIndex+0].copy(faceVertices[0].position);
        positions[vertexIndex+1].copy(faceVertices[1].position);
        positions[vertexIndex+2].copy(faceVertices[2].position);
        normals[vertexIndex+0].copy(faceNormal);
        normals[vertexIndex+1].copy(faceNormal);
        normals[vertexIndex+2].copy(faceNormal);
        vertexIndex += 3;
      }
      else if (faceVertices.length == 4) {
        positions[vertexIndex+0].copy(faceVertices[0].position);
        positions[vertexIndex+1].copy(faceVertices[1].position);
        positions[vertexIndex+2].copy(faceVertices[3].position);
        positions[vertexIndex+3].copy(faceVertices[3].position);
        positions[vertexIndex+4].copy(faceVertices[1].position);
        positions[vertexIndex+5].copy(faceVertices[2].position);
        normals[vertexIndex+0].copy(faceNormal);
        normals[vertexIndex+1].copy(faceNormal);
        normals[vertexIndex+2].copy(faceNormal);
        normals[vertexIndex+3].copy(faceNormal);
        normals[vertexIndex+4].copy(faceNormal);
        normals[vertexIndex+5].copy(faceNormal);
        vertexIndex += 6;
      }
      else {
        console.log("HEGeometryConverter.thisToFlatGeometry: Unsupported face vertex count:" + faceVertices.length);
        //throw("HEGeometryConverter.thisToFlatGeometry: Unsupported face vertex count:" + faceVertices.length);
      }
    }
    return geometry;
  };

  HEMesh.prototype.toEdgesGeometry = function(offset) {
    offset = (offset !== undefined) ? offset : 0.1;
    var lineBuilder = new LineBuilder();

    var a = Vec3.create();
    var b = Vec3.create();
    this.edges.forEach(function(e) {
      var center = e.face.getCenter();
      a.asSub(center, e.vert.position).scale(offset).add(e.vert.position);
      b.asSub(center, e.next.vert.position).scale(offset).add(e.next.vert.position);
      lineBuilder.addLine(a, b);
    });
    return lineBuilder;
  };

  return HEGeometryConverter;
});

define('pex/geom/hem/HEExtrude',[
  'pex/geom/hem/HEMesh',
  'pex/geom/hem/HEVertex',
  'pex/geom/hem/HEEdge',
  'pex/geom/hem/HEFace',
  'pex/geom/Vec3'
  ],
  function(HEMesh, HEVertex, HEEdge, HEFace, Vec3) {

  function Extrude() {
  }

  HEMesh.prototype.extrude = function(height, direction) {
    height = height || 0.1;
    var numFaces = this.faces.length;

    var self = this;
    var faces = this.faces;
    var selectedFaces = this.getSelectedFaces();
    if (selectedFaces.length > 0) {
      faces = selectedFaces;
    }

    faces.forEach(function(face, i) {
      var normal = direction || face.getNormal();
      var edge = face.edge;
      var lastEdge = edge.findPrev();
      var edgeToSplit = edge;
      var prevNewEdge = null;
      var center = face.getCenter();
      var newEdges = [];

      //we split all the corners within the face effectively adding new internal vertices
      do {
        //var newVertexPos = edgeToSplit.vert.added(normal.scaled(height));
        var newVertexPos = normal.clone().scale(height).add(edgeToSplit.vert.position);

        edgeToSplit.vert.edge = edgeToSplit; //TODO: fix that, making sure we split the right face
        var newEdge = self.splitVertex(edgeToSplit.vert, newVertexPos);
        newEdges.push(newEdge);
        if (edgeToSplit == lastEdge) {
          break;
        }
        edgeToSplit = edgeToSplit.next;
      } while(edgeToSplit != edge);

      //go through all new corners and cut out faces from them
      var prevCornerEdge = newEdges[newEdges.length-1].next;
      for(var i=0; i<newEdges.length; i++) {
        //we remember what's the next edge pointing to a new corner as
        //this might change when we add new face
        var tmp = newEdges[i].next;
        var newFace = self.splitFace(newEdges[i].next, prevCornerEdge);
        prevCornerEdge = tmp;
      }
    });

    return this;
  }

  return Extrude;
});

//Catmull-Clark subdivision for half-edge meshes
//Based on http://en.wikipedia.org/wiki/Catmull–Clark_subdivision_surface
//Modified to follow Doo-Sabin scheme for new vertices 1/n*F + 1/n*R + (n-2)/n*v
//http://www.cse.ohio-state.edu/~tamaldey/course/784/note20.pdf
define('pex/geom/hem/HECatmullClark',[
  'pex/geom/hem/HEMesh',
  'pex/geom/hem/HEVertex',
  'pex/geom/hem/HEEdge',
  'pex/geom/hem/HEFace',
  'pex/geom/Vec3'
  ],
  function(HEMesh, HEVertex, HEEdge, HEFace, Vec3) {

  function CatmullClark() {
  }

  HEMesh.prototype.catmullClark = function() {
    this.clearMarking();

    //keep these numbers to iterate only over original faces/edges/vertices
    var numFaces = this.faces.length;
    var numEdges = this.edges.length;
    var numVertices = this.vertices.length;
    var i;

    //For each face, add a face point - the centroid of all original
    //points for the respective face
    for(i=0; i<numFaces; i++) {
      this.faces[i].facePoint = this.faces[i].getCenter();
    }

    //For each edge, add an edge point - the average of
    //the two neighbouring face points and its two original endpoints.
    for(i=0; i<numEdges; i++) {
      var edge = this.edges[i];
      if (edge.edgePoint != null) continue;
      var edgePoint = Vec3.create();
      edgePoint.add(edge.vert.position);
      edgePoint.add(edge.next.vert.position);
      edgePoint.add(edge.face.facePoint);
      edgePoint.add(edge.pair.face.facePoint);
      edgePoint.scale(1/4);

      edge.edgePoint = edgePoint;
      edge.pair.edgePoint = edge.edgePoint;
    }

    for(i=0; i<numVertices; i++) {
      var vertex = this.vertices[i];
      var faceEdge = vertex.edge;
      var face = faceEdge.face;
      var F = Vec3.create(); //average facePoint of neighbor faces
      var R = Vec3.create(); //average edgePoint of neighbor edges
      var n = 0; //num faces/edges
      do {
        F.add(face.facePoint);
        R.add(faceEdge.edgePoint);
        ++n
        faceEdge = faceEdge.pair.next;
        face = faceEdge.face;
      } while(faceEdge != vertex.edge);
      F.scale(1/n)
      R.scale(1/n)

      var newVert = Vec3.create().asAdd(F, R);
      var scaledVertex = vertex.position.clone().scale(n - 2);
      newVert.add(scaledVertex).scale(1/n);

      //we can't simply duplicate vertex and make operations on it
      //as dup() returns Vec3 not HEVertex
      vertex.position.copy(newVert);
    }

    var numEdges = this.edges.length;
    for(i=0; i<numEdges; i++) {
      var edge = this.edges[i];
      if (edge.marked) continue;
      edge.marked = true;
      edge.pair.marked = true;
      var edgePoint = edge.edgePoint;
      delete edge.edgePoint;
      delete edge.pair.edgePoint;
      var newEdge = this.splitVertex(edge.vert, edgePoint, edge, edge);
      edge.edgePointVertex = newEdge.next.vert;
    }

    //var selectedOnly = this.hasSelection();

    var numFaces = this.faces.length;
    for(i=0; i<numFaces; i++) {
      var face = this.faces[i];

      //if (selectedOnly && !face.selected) continue;

      var vert = face.edge.next.vert;
      var edge = face.edge.next;
      vert.edge = edge; //to make sure we split the right face
      var newEdge = this.splitVertex(vert, face.facePoint);

      var nextEdge = newEdge.next.next.next.next;
      do {
        var newFace = this.splitFace(newEdge.next, nextEdge);
        //if (selectedOnly && face.selected) newFace.selected = true;
        nextEdge = nextEdge.next.next;
      } while (nextEdge != newEdge && nextEdge.next != newEdge);

      delete face.faceVertex;
    }

    this.clearMarking();

    return this;
  }

  HEMesh.prototype.subdivide = HEMesh.prototype.catmullClark;

  return CatmullClark;
});

define('pex/geom/hem/HETriangulate',[
  'pex/geom/hem/HEMesh',
  'pex/geom/hem/HEVertex',
  'pex/geom/hem/HEEdge',
  'pex/geom/hem/HEFace',
  'pex/geom/Vec3'
  ],
  function(HEMesh, HEVertex, HEEdge, HEFace, Vec3) {

  function HETriangulate() {
  }

  HEMesh.prototype.triangulate = function() {
    var numFaces = this.faces.length;


    for(i=0; i<numFaces; i++) {
      var face = this.faces[i];
      var vertices = face.getAllVertices();

      while(vertices.length > 3) {
        var firstEdge = face.edge;
        face = this.splitFace(firstEdge, firstEdge.next.next);
        vertices = face.getAllVertices();
      }
    }

    return this;
  };

  return HETriangulate;
});

define('pex/geom/hem',
  [
    'pex/geom/hem/HEMesh',
    'pex/geom/hem/HESelection',
    'pex/geom/hem/HEMarking',
    'pex/geom/hem/HEGeometryConverter',
    'pex/geom/hem/HEExtrude',
    'pex/geom/hem/HECatmullClark',
    'pex/geom/hem/HETriangulate'
  ],
  function(HEMesh, HESelection, HEMarking, HEGeometryConverter, HEExtrude, HECatmullClark, HETriangulate) {
    return function() {
      return new HEMesh();
    }
  }
);

define('pex/geom',
  [
    'pex/geom/Vec2',
    'pex/geom/Vec3',
    'pex/geom/Vec4',
    'pex/geom/Mat4',
    'pex/geom/Quat',
    'pex/geom/Geometry',
    'pex/geom/gen',
    'pex/geom/Edge',
    'pex/geom/Face3',
    'pex/geom/Face4',
    'pex/geom/FacePolygon',
    'pex/geom/Line2D',
    'pex/geom/Rect',
    'pex/geom/Triangle2D',
    'pex/geom/Polygon2D',
    'pex/geom/hem',
    'pex/geom/BoundingBox',
    'pex/geom/Octree'
  ],
  function(Vec2, Vec3, Vec4, Mat4, Quat, Geometry, gen,
    Edge, Face3, Face4, FacePolygon, Line2D, Rect, Triangle2D, Polygon2D, hem, 
    BoundingBox, Octree) {
    return {
      Vec2 : Vec2,
      Vec3 : Vec3,
      Vec4 : Vec4,
      Mat4 : Mat4,
      Quat : Quat,
      Geometry : Geometry,
      gen : gen,
      Edge : Edge,
      Face3 : Face3,
      Face4 : Face4,
      FacePolygon : FacePolygon,
      Line2D : Line2D,
      Rect : Rect,
      Triangle2D : Triangle2D,
      Polygon2D : Polygon2D,
      hem : hem,
      BoundingBox : BoundingBox,
      Octree : Octree
    };
  }
);



define('pex/utils/Log',[], function() {
  function Log() {
  }

  Log.message = function(msg) {
    if (console !== undefined) {
      console.log(msg);
    }
  }

  Log.error = function(msg) {
    if (console !== undefined) {
      console.log('ERROR: ' + msg);
    }
  }

  return Log;
});

define('pex/utils/Time',['pex/utils/Log'], function(Log) {
  var Time = {
    now: 0,
    prev: 0,
    delta: 0,
    seconds: 0,
    frameNumber: 0,
    fpsFrames: 0,
    fpsTime: 0,
    fps: 0,
    fpsFrequency: 3,
    paused: false
  }

  Time.update = function(delta) {
    if (Time.paused) return;

    if (Time.prev == 0) {
      Time.prev = Date.now();
    }
    Time.now = Date.now();
    Time.delta = (delta !== undefined) ? delta : (Time.now - Time.prev)/1000;
    Time.prev = Time.now;
    Time.seconds += Time.delta;
    Time.fpsTime += Time.delta;
    Time.frameNumber++;
    Time.fpsFrames++;
    if (Time.fpsTime > Time.fpsFrequency) {
      Time.fps = Time.fpsFrames / Time.fpsTime;
      Time.fpsTime = 0;
      Time.fpsFrames = 0;
      Log.message('FPS: ' + Time.fps);
    }
    return Time.seconds;
  }

  var startOfMeasuredTime = 0;
  Time.startMeasuringTime = function() {
    startOfMeasuredTime = Date.now();
  }

  Time.stopMeasuringTime = function(msg) {
    var now = Date.now();

    var seconds = (now - startOfMeasuredTime)/1000;

    if (msg) {
      Log.message(msg + seconds)
    }
    return seconds;
  }

  Time.pause = function() {
    Time.paused = true;
  }

  Time.togglePause = function() {
    Time.paused = !Time.paused;
  }

  return Time;
});

define('pex/utils/ObjectUtils',[], function() {
  function ObjectUtils() {
  }

  ObjectUtils.mergeObjects = function(a, b) {
    var result = { };
    if (a) {
      for(var prop in a) {
        result[prop] = a[prop];
      }
    }
    if (b) {
      for(var prop in b) {
        result[prop] = b[prop];
      }
    }
    return result;
  }

  return ObjectUtils;
});

// seedrandom.js version 2.0.
// Author: David Bau 4/2/2011
//
// Defines a method Math.seedrandom() that, when called, substitutes
// an explicitly seeded RC4-based algorithm for Math.random().  Also
// supports automatic seeding from local or network sources of entropy.
//
// Usage:
//
//   <script src=http://davidbau.com/encode/seedrandom-min.js></script>
//
//   Math.seedrandom('yipee'); Sets Math.random to a function that is
//                             initialized using the given explicit seed.
//
//   Math.seedrandom();        Sets Math.random to a function that is
//                             seeded using the current time, dom state,
//                             and other accumulated local entropy.
//                             The generated seed string is returned.
//
//   Math.seedrandom('yowza', true);
//                             Seeds using the given explicit seed mixed
//                             together with accumulated entropy.
//
//   <script src="http://bit.ly/srandom-512"></script>
//                             Seeds using physical random bits downloaded
//                             from random.org.
//
//   <script src="https://jsonlib.appspot.com/urandom?callback=Math.seedrandom">
//   </script>                 Seeds using urandom bits from call.jsonlib.com,
//                             which is faster than random.org.
//
// Examples:
//
//   Math.seedrandom("hello");            // Use "hello" as the seed.
//   document.write(Math.random());       // Always 0.5463663768140734
//   document.write(Math.random());       // Always 0.43973793770592234
//   var rng1 = Math.random;              // Remember the current prng.
//
//   var autoseed = Math.seedrandom();    // New prng with an automatic seed.
//   document.write(Math.random());       // Pretty much unpredictable.
//
//   Math.random = rng1;                  // Continue "hello" prng sequence.
//   document.write(Math.random());       // Always 0.554769432473455
//
//   Math.seedrandom(autoseed);           // Restart at the previous seed.
//   document.write(Math.random());       // Repeat the 'unpredictable' value.
//
// Notes:
//
// Each time seedrandom('arg') is called, entropy from the passed seed
// is accumulated in a pool to help generate future seeds for the
// zero-argument form of Math.seedrandom, so entropy can be injected over
// time by calling seedrandom with explicit data repeatedly.
//
// On speed - This javascript implementation of Math.random() is about
// 3-10x slower than the built-in Math.random() because it is not native
// code, but this is typically fast enough anyway.  Seeding is more expensive,
// especially if you use auto-seeding.  Some details (timings on Chrome 4):
//
// Our Math.random()            - avg less than 0.002 milliseconds per call
// seedrandom('explicit')       - avg less than 0.5 milliseconds per call
// seedrandom('explicit', true) - avg less than 2 milliseconds per call
// seedrandom()                 - avg about 38 milliseconds per call
//
// LICENSE (BSD):
//
// Copyright 2010 David Bau, all rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//   1. Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//
//   2. Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
//
//   3. Neither the name of this module nor the names of its contributors may
//      be used to endorse or promote products derived from this software
//      without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
/**
 * All code is in an anonymous closure to keep the global namespace clean.
 *
 * @param {number=} overflow
 * @param {number=} startdenom
 */

define('lib/seedrandom',[], function() { //added by Marcin Ignac

(function (pool, math, width, chunks, significance, overflow, startdenom) {

//
// seedrandom()
// This is the seedrandom function described above.
//
math['seedrandom'] = function seedrandom(seed, use_entropy) {
  var key = [];
  var arc4;

  // Flatten the seed string or build one from local entropy if needed.
  seed = mixkey(flatten(
    use_entropy ? [seed, pool] :
    arguments.length ? seed :
    [new Date().getTime(), pool, window], 3), key);

  // Use the seed to initialize an ARC4 generator.
  arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(arc4.S, pool);

  // Override Math.random

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.

  math['random'] = function random() {  // Closure to return a random double:
    var n = arc4.g(chunks);             // Start with a numerator n < 2 ^ 48
    var d = startdenom;                 //   and denominator d = 2 ^ 48.
    var x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  // Return the seed that was used
  return seed;
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, u, me = this, keylen = key.length;
  var i = 0, j = me.i = me.j = me.m = 0;
  me.S = [];
  me.c = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) { me.S[i] = i++; }
  for (i = 0; i < width; i++) {
    t = me.S[i];
    j = lowbits(j + t + key[i % keylen]);
    u = me.S[j];
    me.S[i] = u;
    me.S[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  me.g = function getnext(count) {
    var s = me.S;
    var i = lowbits(me.i + 1); var t = s[i];
    var j = lowbits(me.j + t); var u = s[j];
    s[i] = u;
    s[j] = t;
    var r = s[lowbits(t + u)];
    while (--count) {
      i = lowbits(i + 1); t = s[i];
      j = lowbits(j + t); u = s[j];
      s[i] = u;
      s[j] = t;
      r = r * width + s[lowbits(t + u)];
    }
    me.i = i;
    me.j = j;
    return r;
  };
  // For robust unpredictability discard an initial batch of values.
  // See http://www.rsa.com/rsalabs/node.asp?id=2009
  me.g(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
/** @param {Object=} result
  * @param {string=} prop
  * @param {string=} typ */
function flatten(obj, depth, result, prop, typ) {
  result = [];
  typ = typeof(obj);
  if (depth && typ == 'object') {
    for (prop in obj) {
      if (prop.indexOf('S') < 5) {    // Avoid FF3 bug (local/sessionStorage)
        try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
      }
    }
  }
  return (result.length ? result : obj + (typ != 'string' ? '\0' : ''));
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
/** @param {number=} smear
  * @param {number=} j */
function mixkey(seed, key, smear, j) {
  seed += '';                         // Ensure the seed is a string
  smear = 0;
  for (j = 0; j < seed.length; j++) {
    key[lowbits(j)] =
      lowbits((smear ^= key[lowbits(j)] * 19) + seed.charCodeAt(j));
  }
  seed = '';
  for (j in key) { seed += String.fromCharCode(key[j]); }
  return seed;
}

//
// lowbits()
// A quick "n mod width" for width a power of 2.
//
function lowbits(n) { return n & (width - 1); }

//
// The following constants are related to IEEE 754 limits.
//
startdenom = math.pow(width, chunks);
significance = math.pow(2, significance);
overflow = significance * 2;

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

// End anonymous scope, and pass initial values.
})(
  [],   // pool: entropy pool starts empty
  Math, // math: package containing random, pow, and seedrandom
  256,  // width: each RC4 output is 0 <= x < 256
  6,    // chunks: at least six RC4 outputs for each double
  52    // significance: there are 52 significant digits in a double
);


});

define('pex/utils/MathUtils',['lib/seedrandom', 'pex/geom/Vec2', 'pex/geom/Vec3'], function(seedrandom, Vec2, Vec3) {
  function MathUtils() {
  }

  MathUtils.seed = function(s) {
    Math.seedrandom(s);
  }

  MathUtils.randomFloat = function(min, max) {
    if (typeof(max) == 'undefined') {
      min = 1;
    }
    if (typeof(max) == 'undefined') {
      max = min;
      min = 0;
    }
    return min + (max - min) * Math.random();
  }

  MathUtils.randomInt = function(min, max) {
    return Math.floor(MathUtils.randomInt(min, max));
  }

  MathUtils.randomVec3 = function(r) {
    r = r || 0.5;
    var x = Math.random() - 0.5;
    var y = Math.random() - 0.5;
    var z = Math.random() - 0.5;
    var len = x * x + y * y + z * z;
    if (len > 0) {
      len = Math.sqrt(len);
      x /= len;
      y /= len;
      z /= len;
    }
    return Vec3.create(x * r, y * r, z * r);
  }

  MathUtils.randomVec3InBoundingBox = function(bbox) {
    var x = bbox.min.x + Math.random() * (bbox.max.x - bbox.min.x);
    var y = bbox.min.y + Math.random() * (bbox.max.y - bbox.min.y);
    var z = bbox.min.z + Math.random() * (bbox.max.z - bbox.min.z);
    return Vec3.create(x, y, z);
  }

  MathUtils.randomVec2InRect = function(rect) {
    return Vec2.create(rect.x + Math.random() * rect.width, rect.y + Math.random() * rect.height);
  }

  MathUtils.mix = function(a, b, t) {
    return a + (b - a) * t;
  }

  MathUtils.map = function(value, oldMin, oldMax, newMin, newMax) {
    return newMin + (value - oldMin)/(oldMax - oldMin) * (newMax - newMin);
  }

  return MathUtils;
});
//Module wrapper for utility classes.
define('pex/utils',
  [
    'pex/utils/Log',
    'pex/utils/Time',
    'pex/utils/ObjectUtils',
    'pex/utils/MathUtils',
    'pex/utils/ArrayUtils'
  ],
  function(Log, Time, ObjectUtils, MathUtils, ArrayUtils) {
    return {
      Log : Log,
      Time : Time,
      ObjectUtils : ObjectUtils,
      MathUtils : MathUtils,
      ArrayUtils : ArrayUtils
    };
  }
);

define('pex/sys/Platform',[], function() {
  var isPlask = (typeof window === 'undefined') && (typeof process === 'object');
  var isBrowser = (typeof window === 'object') && (typeof document === 'object');
  var isEjecta = (typeof ejecta === 'object') && (typeof ejecta.include === 'function');
  return {
    isPlask : isPlask,
    isBrowser : isBrowser,
    isEjecta : isEjecta
  }
});
define('pex/sys/Node',['pex/sys/Platform'], function(Platform) {
  var include = (typeof pexNodeRequire === 'function') ? pexNodeRequire : require;

  return {
    plask : Platform.isPlask ? include('plask') : {},
    fs : Platform.isPlask ? include('fs') : {},
    path : Platform.isPlask ? include('path') : {}
  }
});
define('pex/sys/IO',['pex/utils/Log', 'pex/sys/Node'], function(Log, Node) {
  var PlaskIO = (function() {
    function IO() {}

    IO.loadTextFile = function(file, callback) {
      //var fullPath = path.resolve(IO.getWorkingDirectory(), file);
      var data = Node.fs.readFileSync(file, 'utf8');
      if (callback) {
        callback(data);
      }
    }

    IO.getWorkingDirectory = function() {
      return '';
    }

    IO.loadImageData = function(gl, texture, target, file, callback) {
      var fullPath = Node.path.resolve(IO.getWorkingDirectory(), file);
      Log.message('IO.loadImageData ' + fullPath);
      texture.flipped = true;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(texture.target, texture.handle);
      var canvas = Node.plask.SkCanvas.createFromImage(fullPath);
      gl.texImage2DSkCanvas(target, 0, canvas);
      if (callback) {
        callback(canvas);
      }
    }

    IO.watchTextFile = function(file, callback) {
      Node.fs.watch(file, {}, function(event, fileName) {
        if (event == 'change') {
          var data = Node.fs.readFileSync(file, 'utf8');
          if (callback) {
            callback(data);
          }
        }
      });
    }

    IO.saveTextFile = function(file, data) {
      Node.fs.writeFileSync(file, data);
    }

    return IO;
  });

  var WebIO = (function() {
    function IO() {}

    IO.loadTextFile = function(url, callback) {
      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.onreadystatechange = function (e) {
        if (request.readyState == 4) {
          if(request.status == 200) {
             if (callback) {
               callback(request.responseText);
             }
          }
          else {
             Log.error('WebIO.loadTextFile error : ' + request.statusText);
          }
        }
      };
      request.send(null);
    }

    IO.loadImageData = function(gl, texture, target, url, callback) {
      var image = new Image();
      image.onload = function() {
        texture.flipped = true;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(texture.target, texture.handle);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(
          target, 0, gl.RGBA, gl.RGBA,
          gl.UNSIGNED_BYTE, image
        );
        if (callback) {
          callback(image);
        }
      }
      image.src = url;
    }

    IO.watchTextFile = function() {
      console.log('Warning: WebIO.watch is not implemented!');
    }

    IO.saveTextFile = function() {
      console.log('Warning: WebIO.saveTextFile is not implemented!');
    }

    return IO;
  });

  if (typeof window !== 'undefined') {
    return WebIO();
  }
  else {
    return PlaskIO();
  }
});
define('pex/sys/Require',['pex/sys/Platform'], function(Platform) {
  var requireFunc;
  var defineFunc;

  function captureRequireJS() {
    var config = (typeof PexGlobalConfig === 'object') ? PexGlobalConfig : null;

    if (Platform.isPlask) {
      //we can't just use require by default as it might have been overwritten by almond in this context
      if (config && config.nodeRequire) {
        requireFunc = config.nodeRequire('requirejs');
      }
      else {
        requireFunc = require('requirejs');
      }
      defineFunc = requireFunc.define;
    }
    else if (config && config.originalRequire) {
      requireFunc = config.originalRequire;
      defineFunc = config.originalDefine;
    }
    else {
      requireFunc = require;
      defineFunc = define;
    }

    requireFunc.config({
      map : {
          '*' : config.libPathsMap
      }
    });

    config.definedModules.forEach(function(moduleEntry) {
      defineFunc(moduleEntry.name, [], function() { return moduleEntry.module });
    });
  }

  function Require(deps, callback) {
    if (!requireFunc && !defineFunc) {
      captureRequireJS();
    }

    requireFunc(deps, callback);
  }

  return Require;
});
define('pex/sys//Platform',[], function() {
  var isPlask = (typeof window === 'undefined') && (typeof process === 'object');
  var isBrowser = (typeof window === 'object') && (typeof document === 'object');
  var isEjecta = (typeof ejecta === 'object') && (typeof ejecta.include === 'function');
  return {
    isPlask : isPlask,
    isBrowser : isBrowser,
    isEjecta : isEjecta
  }
});
define('pex/gl/Context',[], function() {
  function Context(gl) {
    this.gl = gl;
  }

  Context.currentContext = new Context(null);

  return Context;
});
define('pex/sys/EjectaPolyfills',['pex/sys/Platform'], function(Platform) {
  if (!Platform.isEjecta) {
    return {};
  }

  HTMLElement.prototype.setAttribute = function(name, value) {
    if (!this.attributes) this.attributes = {};
    this.attributes[name] = value;
  }

  HTMLElement.prototype.getAttribute = function(name, value) {
    if (!this.attributes) return null;
    return this.attributes[name];
  }

  HTMLElement.prototype.addEventListener = function(name, callback, useCapture) {
    console.log('HTMLElement.prototype.addEventListener', name);
    if (name == 'load') {
      this.onload = function(e) {
        callback({
          type : 'load',
          currentTarget : this, 
          srcElement : this
        });
      }
    }
    else if (name == 'touchstart' || name == 'touchstart' || name == 'touchstart') {
      document.addEventListener(name, callback, useCapture);
    }
  }

  HTMLElement.prototype.removeEventListener = function(name, callback, useCapture) {
    if (name == 'load') {
      this.onload = null;
    }
    else if (name == 'touchstart' || name == 'touchstart' || name == 'touchstart') {
      document.removeEventListener(name, callback);
    }
  }

  return {};
});
define('pex/sys/BrowserWindow',['pex/sys/Platform', 'pex/sys/EjectaPolyfills'], function(Platform, EjectaPolyfills) {
  var requestAnimFrameFps = 60;

  if (Platform.isBrowser) {
    window.requestAnimFrame = (function() {
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / requestAnimFrameFps);
              };
    })();
  }

  var eventListeners = [];

  function fireEvent(eventType, event) {
    for(var i=0; i<eventListeners.length; i++) {
      if (eventListeners[i].eventType == eventType) {
        eventListeners[i].handler(event);
      }
    }
  }

  function registerEvents(canvas) {
    makeMouseDownHandler(canvas);
    makeMouseUpHandler(canvas);
    makeMouseDraggedHandler(canvas);
    makeMouseMovedHandler(canvas);
    makeScrollWheelHandler(canvas);
    makeTouchDownHandler(canvas);
    makeTouchUpHandler(canvas);
    makeTouchMoveHandler(canvas);
    makeKeyDownHandler(canvas);
  }

  function makeMouseDownHandler(canvas) {
    canvas.addEventListener('mousedown', function(e) {
      fireEvent('leftMouseDown', {
        x: (e.offsetX || e.clientX - e.target.offsetLeft) * window.devicePixelRatio,
        y: (e.offsetY || e.clientY - e.target.offsetTop) * window.devicePixelRatio,
        option: e.altKey,
        shift: e.shiftKey,
        control: e.ctrlKey
      });
    })
  }

  function makeMouseUpHandler(canvas) {
    canvas.addEventListener('mouseup', function(e) {
      fireEvent('leftMouseUp', {
        x: (e.offsetX || e.clientX - e.target.offsetLeft) * window.devicePixelRatio,
        y: (e.offsetY || e.clientY - e.target.offsetTop) * window.devicePixelRatio,
        option: e.altKey,
        shift: e.shiftKey,
        control: e.ctrlKey
      })
    })
  }

  function makeMouseDraggedHandler(canvas) {
    var down = false;
    var px = 0;
    var py = 0;
    canvas.addEventListener('mousedown', function(e) {
      down = true;
      px = (e.offsetX || e.clientX - e.target.offsetLeft) * window.devicePixelRatio;
      py = (e.offsetY || e.clientY - e.target.offsetTop) * window.devicePixelRatio;
    });
    canvas.addEventListener('mouseup', function(e) {
      down = false;
    });
    canvas.addEventListener('mousemove', function(e) {
      if (down) {
        var x = (e.offsetX || e.clientX - e.target.offsetLeft) * window.devicePixelRatio;
        var y = (e.offsetY || e.clientY - e.target.offsetTop) * window.devicePixelRatio;
        fireEvent('mouseDragged', {
          x: x,
          y: y,
          dx: x - px,
          dy: y - py,
          option: e.altKey,
          shift: e.shiftKey,
          control: e.ctrlKey
        });
        px = x;
        py = y;
      }
    })
  }

  function makeMouseMovedHandler(canvas) {
    canvas.addEventListener('mousemove', function(e) {
      fireEvent('mouseMoved', {
        x: (e.offsetX || e.clientX - e.target.offsetLeft) * window.devicePixelRatio,
        y: (e.offsetY || e.clientY - e.target.offsetTop) * window.devicePixelRatio,
        option: e.altKey,
        shift: e.shiftKey,
        control: e.ctrlKey
      });
    })
  }

  function makeScrollWheelHandler(canvas) {
    var mousewheelevt = (/Firefox/i.test(navigator.userAgent))? 'DOMMouseScroll' : 'mousewheel'
    document.addEventListener(mousewheelevt, function(e) {
      fireEvent('scrollWheel', {
        x: (e.offsetX || e.layerX) * window.devicePixelRatio,
        y: (e.offsetY || e.layerY) * window.devicePixelRatio,
        dy: e.wheelDelta/10 || -e.detail/10,
        option: e.altKey,
        shift: e.shiftKey,
        control: e.ctrlKey
      });
      e.preventDefault();
      return false;
    });
  }

  var lastTouch = null;
  function makeTouchDownHandler(canvas) {
    canvas.addEventListener('touchstart', function(e) {
      lastTouch = {
        clientX : (e.touches[0].clientX) * window.devicePixelRatio,
        clientY : (e.touches[0].clientY) * window.devicePixelRatio
      };
      fireEvent('leftMouseDown', {
        x: (e.touches[0].clientX) * window.devicePixelRatio,
        y: (e.touches[0].clientY) * window.devicePixelRatio,
        option: false,
        shift: false,
        control: false
      });
    })
  }

  function makeTouchUpHandler(canvas) {
    canvas.addEventListener('touchend', function(e) {
      fireEvent('leftMouseUp', {
        x: lastTouch ? lastTouch.clientX : 0,
        y: lastTouch ? lastTouch.clientY : 0,
        option: false,
        shift: false,
        control: false
      });
      lastTouch = null;
    })
  }

   function makeTouchMoveHandler(canvas) {
    canvas.addEventListener('touchmove', function(e) {
      lastTouch = {
        clientX : (e.touches[0].clientX) * window.devicePixelRatio,
        clientY : (e.touches[0].clientY) * window.devicePixelRatio
      };
      fireEvent('mouseDragged', {
        x: (e.touches[0].clientX) * window.devicePixelRatio,
        y: (e.touches[0].clientY) * window.devicePixelRatio,
        option: false,
        shift: false,
        control: false
      });
    })
  }

  function makeKeyDownHandler(canvas) {
    var timeout = 0;
    window.addEventListener('keydown', function(e) {
      timeout = setTimeout(function() {
        fireEvent('keyDown', {
          str: '',
          keyCode: e.keyCode,
          option: e.altKey,
          shift: e.shiftKey,
          control: e.ctrlKey
        }, 1);
      })
    })
    window.addEventListener('keypress', function(e) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = 0;
      }
      fireEvent('keyDown', {
        str: String.fromCharCode(e.charCode),
        keyCode: e.keyCode,
        option: e.altKey,
        shift: e.shiftKey,
        control: e.ctrlKey
      });
    })
  }

  function simpleWindow(obj) {
    var canvas = obj.settings.canvas;

    obj.settings.width = obj.settings.width || 800;
    obj.settings.height = obj.settings.height || 600;

    if (obj.settings.fullscreen) {
       document.body.style.margin = '0';
       document.body.style.padding = '0';
       document.body.style.overflow = 'hidden';
       obj.settings.width = window.innerWidth;
       obj.settings.height = window.innerHeight;
    }

    if ((!canvas || !document.getElementById) && Platform.isEjecta) {
      canvas = document.getElementById('canvas');
      obj.settings.width = canvas.width;
      obj.settings.height = canvas.height;
    }
    else {
      canvas = document.createElement('canvas');
      canvas.width = obj.settings.width;
      canvas.height = obj.settings.height;
    }

    if (Platform.isEjecta && (window.devicePixelRatio == 2)) {
      obj.settings.width *= 2;
      obj.settings.height *= 2;
    }

    obj.width = obj.settings.width;
    obj.height = obj.settings.height;

    canvas.style.backgroundColor = '#000000';

    function go() {
      if (obj.stencil === undefined) obj.stencil = false;

      var gl = null;
      try {
        gl = canvas.getContext('experimental-webgl'); //, {antialias: true, premultipliedAlpha : true, stencil: obj.settings.stencil}
      }
      catch(err){
        console.error(err.message);
        return;
      }

      obj.framerate = function(fps) {
        requestAnimFrameFps = fps;
      }

      obj.on = function(eventType, handler) {
        eventListeners.push({eventType:eventType, handler:handler});
      }

      registerEvents(canvas);

      obj.gl = gl;
      obj.init();

      function drawloop() {
        obj.draw();
        requestAnimFrame(drawloop);
      }

      requestAnimFrame(drawloop);
    }

    if (!canvas.parentNode) {
      if (document.body) {
        document.body.appendChild(canvas);
        go();
      }
      else {
        window.addEventListener('load', function() {
          document.body.appendChild(canvas);
          go();
        }, false);
      }
    }
  }

  var BrowserWindow = {
    simpleWindow : simpleWindow
  }

  return BrowserWindow;
});
// Generated by CoffeeScript 1.6.2
define('pex/sys/Window',['require','pex/sys//Platform','pex/sys/Node','pex/gl/Context','pex/sys/BrowserWindow','pex/utils/ObjectUtils','pex/utils/Time'],function(require) {
  var BrowserWindow, Context, Node, ObjectUtils, Platform, Time, Window;

  Platform = require('pex/sys//Platform');
  Node = require('pex/sys/Node');
  Context = require('pex/gl/Context');
  BrowserWindow = require('pex/sys/BrowserWindow');
  ObjectUtils = require('pex/utils/ObjectUtils');
  Time = require('pex/utils/Time');
  return Window = {
    create: function(obj) {
      var context, defaultSettings, gl;

      gl = null;
      context = null;
      defaultSettings = {
        width: 1280,
        height: 720,
        type: '3d',
        vsync: true,
        multisample: true,
        fullscreen: false,
        center: true
      };
      obj.setttings = obj.settings || {};
      obj.settings = ObjectUtils.mergeObjects(defaultSettings, obj.settings);
      obj.__init = obj.init;
      obj.init = function() {
        gl = this.gl;
        context = new Context(gl);
        Context.currentContext = context;
        if (obj.__init) {
          obj.framerate(60);
          return obj.__init();
        }
      };
      obj.__draw = obj.draw;
      obj.draw = function() {
        Time.update();
        Context.currentContext = context;
        if (obj.__draw) {
          return obj.__draw();
        }
      };
      if (Platform.isPlask) {
        Node.plask.simpleWindow(obj);
      }
      if (Platform.isBrowser) {
        return BrowserWindow.simpleWindow(obj);
      }
    }
  };
});

//Module wrapper for sys classes.
define('pex/sys',
  [
    'pex/sys/IO',
    'pex/sys/Node',
    'pex/sys/Require',
    'pex/sys/Platform',
    'pex/sys/Window'
  ],
  function(IO, Node, Require, Platform, Window) {
    return {
      IO : IO,
      Node : Node,
      Require : Require,
      Platform : Platform,
      Window : Window
    };
  }
);

// Generated by CoffeeScript 1.6.2
define('pex/gl/Program',['require','pex/gl/Context','pex/sys/IO','pex/utils/Log'],function(require) {
  var Context, IO, Log, Program, kFragmentShaderPrefix, kShaderPrefix, kVertexShaderPrefix;

  Context = require('pex/gl/Context');
  IO = require('pex/sys/IO');
  Log = require('pex/utils/Log');
  kShaderPrefix = '#ifdef GL_ES\nprecision highp float;\n#endif\n';
  kVertexShaderPrefix = kShaderPrefix + '#define VERT\n';
  kFragmentShaderPrefix = kShaderPrefix + '#define FRAG\n';
  return Program = (function() {
    function Program(vertSrc, fragSrc) {
      this.gl = Context.currentContext.gl;
      this.handle = this.gl.createProgram();
      this.uniforms = {};
      this.attributes = {};
      this.addSources(vertSrc, fragSrc);
      this.ready = false;
      if (this.vertShader && this.fragShader) {
        this.link();
      }
    }

    Program.prototype.addSources = function(vertSrc, fragSrc) {
      if (fragSrc == null) {
        fragSrc = vertSrc;
      }
      if (vertSrc) {
        this.addVertexSource(vertSrc);
      }
      if (fragSrc) {
        return this.addFragmentSource(fragSrc);
      }
    };

    Program.prototype.addVertexSource = function(vertSrc) {
      this.vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);
      this.gl.shaderSource(this.vertShader, kVertexShaderPrefix + vertSrc + '\n');
      this.gl.compileShader(this.vertShader);
      if (!this.gl.getShaderParameter(this.vertShader, this.gl.COMPILE_STATUS)) {
        throw this.gl.getShaderInfoLog(this.vertShader);
      }
    };

    Program.prototype.addFragmentSource = function(fragSrc) {
      this.fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
      this.gl.shaderSource(this.fragShader, kFragmentShaderPrefix + fragSrc + '\n');
      this.gl.compileShader(this.fragShader);
      if (!this.gl.getShaderParameter(this.fragShader, this.gl.COMPILE_STATUS)) {
        throw this.gl.getShaderInfoLog(this.fragShader);
      }
    };

    Program.prototype.link = function() {
      var i, info, location, numAttributes, numUniforms, _i, _j, _ref, _ref1;

      this.gl.attachShader(this.handle, this.vertShader);
      this.gl.attachShader(this.handle, this.fragShader);
      this.gl.linkProgram(this.handle);
      if (!this.gl.getProgramParameter(this.handle, this.gl.LINK_STATUS)) {
        throw this.gl.getProgramInfoLog(handle);
      }
      numUniforms = this.gl.getProgramParameter(this.handle, this.gl.ACTIVE_UNIFORMS);
      for (i = _i = 0, _ref = numUniforms - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        info = this.gl.getActiveUniform(this.handle, i);
        location = this.gl.getUniformLocation(this.handle, info.name);
        this.uniforms[info.name] = Program.makeUniformSetter(this.gl, info.type, location);
      }
      numAttributes = this.gl.getProgramParameter(this.handle, this.gl.ACTIVE_ATTRIBUTES);
      for (i = _j = 0, _ref1 = numAttributes - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        info = this.gl.getActiveAttrib(this.handle, i);
        location = this.gl.getAttribLocation(this.handle, info.name);
        this.attributes[info.name] = location;
      }
      this.ready = true;
      return this;
    };

    Program.prototype.use = function() {
      return this.gl.useProgram(this.handle);
    };

    Program.prototype.dispose = function() {
      this.gl.deleteShader(this.vertShader);
      this.gl.deleteShader(this.fragShader);
      return this.gl.deleteProgram(this.handle);
    };

    Program.load = function(url, callback, options) {
      var program;

      program = new Program();
      return IO.loadTextFile(url, function(source) {
        Log.message("Program.Compiling " + url);
        program.addSources(source);
        program.link();
        if (callback) {
          callback();
        }
        if (options && options.autoreload) {
          return IO.watchTextFile(url, function(source) {
            var e;

            try {
              program.gl.detachShader(program.handle, program.vertShader);
              program.gl.detachShader(program.handle, program.fragShader);
              program.addSources(source);
              return program.link();
            } catch (_error) {
              e = _error;
              Log.message("Progra.load : failed to reload " + url);
              return Log.message(e);
            }
          });
        }
      });
    };

    Program.makeUniformSetter = function(gl, type, location) {
      var mv, setterFun,
        _this = this;

      setterFun = null;
      switch (type) {
        case gl.BOOL:
        case gl.INT:
          setterFun = function(value) {
            return gl.uniform1i(location, value);
          };
          break;
        case gl.SAMPLER_2D:
        case gl.SAMPLER_CUBE:
          setterFun = function(value) {
            return gl.uniform1i(location, value.handle);
          };
          break;
        case gl.FLOAT:
          setterFun = function(value) {
            return gl.uniform1f(location, value);
          };
          break;
        case gl.FLOAT_VEC2:
          setterFun = function(v) {
            return gl.uniform2f(location, v.x, v.y);
          };
          break;
        case gl.FLOAT_VEC3:
          setterFun = function(v) {
            return gl.uniform3f(location, v.x, v.y, v.z);
          };
          break;
        case gl.FLOAT_VEC4:
          setterFun = function(v) {
            if (v.r != null) {
              gl.uniform4f(location, v.r, v.g, v.b, v.a);
            }
            if (v.x != null) {
              return gl.uniform4f(location, v.x, v.y, v.z, v.w);
            }
          };
          break;
        case gl.FLOAT_MAT4:
          mv = new Float32Array(16);
          setterFun = function(m) {
            mv[0] = m.a11;
            mv[1] = m.a21;
            mv[2] = m.a31;
            mv[3] = m.a41;
            mv[4] = m.a12;
            mv[5] = m.a22;
            mv[6] = m.a32;
            mv[7] = m.a42;
            mv[8] = m.a13;
            mv[9] = m.a23;
            mv[10] = m.a33;
            mv[11] = m.a43;
            mv[12] = m.a14;
            mv[13] = m.a24;
            mv[14] = m.a34;
            mv[15] = m.a44;
            return gl.uniformMatrix4fv(location, false, mv);
          };
      }
      if (setterFun) {
        setterFun.type = type;
        return setterFun;
      } else {
        return function() {
          throw "Unknown uniform type: " + type;
        };
      }
    };

    return Program;

  })();
});

// Generated by CoffeeScript 1.6.2
define('pex/gl/Mesh',['require','pex/gl/Context','pex/geom'],function(require) {
  var Context, Face3, Face4, Mat4, Mesh, Quat, Vec3, _ref;

  Context = require('pex/gl/Context');
  _ref = require('pex/geom'), Vec3 = _ref.Vec3, Quat = _ref.Quat, Mat4 = _ref.Mat4, Face3 = _ref.Face3, Face4 = _ref.Face4;
  return Mesh = (function() {
    function Mesh(geometry, material, options) {
      var _ref1;

      this.gl = Context.currentContext.gl;
      this.geometry = geometry;
      this.material = material;
      options = options || {};
      this.gl = Context.currentContext.gl;
      this.primitiveType = options.primitiveType;
      if ((_ref1 = this.primitiveType) == null) {
        this.primitiveType = this.gl.TRIANGLES;
      }
      this.attributes = {};
      this.usage = this.gl.STATIC_DRAW;
      this.addAttrib("position", geometry.attribs.position.data, geometry.attribs.position.elementSize);
      if (geometry.attribs.normal) {
        this.addAttrib("normal", geometry.attribs.normal.data, geometry.attribs.normal.elementSize);
      }
      if (geometry.attribs.texCoord) {
        this.addAttrib("texCoord", geometry.attribs.texCoord.data, geometry.attribs.texCoord.elementSize);
      }
      if (geometry.attribs.color) {
        this.addAttrib("color", geometry.attribs.color.data, geometry.attribs.color.elementSize);
      }
      this.position = Vec3.create(0, 0, 0);
      this.rotation = Quat.create();
      this.scale = Vec3.create(1, 1, 1);
      this.modelWorldMatrix = Mat4.create();
      this.modelViewMatrix = Mat4.create();
      this.rotationMatrix = Mat4.create();
      this.normalMatrix = Mat4.create();
      this.updateIndices(geometry);
    }

    Mesh.prototype.addAttrib = function(name, data, elementSize, usage) {
      var attrib;

      elementSize = elementSize || 3;
      usage = usage || this.usage;
      attrib = {};
      attrib.name = name;
      attrib.data = data;
      attrib.dataBuf = data.buf;
      attrib.elementSize = elementSize;
      attrib.location = -1;
      attrib.buffer = this.gl.createBuffer();
      attrib.usage = usage;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attrib.buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, attrib.dataBuf, usage);
      return this.attributes[attrib.name] = attrib;
    };

    Mesh.prototype.updateIndices = function(geometry) {
      var data, oldArrayBinding;

      if (this.indices === undefined) {
        this.indices = {};
        this.indices.buffer = this.gl.createBuffer();
      }
      data = [];
      if (geometry.faces.length > 0) {
        geometry.faces.forEach(function(face) {
          if (face.constructor === Face4) {
            data.push(face.a);
            data.push(face.b);
            data.push(face.d);
            data.push(face.d);
            data.push(face.b);
            data.push(face.c);
          }
          if (face.constructor === Face3) {
            data.push(face.a);
            data.push(face.b);
            return data.push(face.c);
          }
        });
      }
      this.indices.data = new Uint16Array(data);
      oldArrayBinding = this.gl.getParameter(this.gl.ELEMENT_ARRAY_BUFFER_BINDING);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices.data, this.usage);
      return this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, oldArrayBinding);
    };

    Mesh.prototype.draw = function(camera) {
      var attrib, materialUniforms, name, num, program, programUniforms, _ref1, _results;

      programUniforms = this.material.program.uniforms;
      materialUniforms = this.material.uniforms;
      if (camera) {
        this.updateMatrices(camera);
        if (programUniforms.projectionMatrix) {
          materialUniforms.projectionMatrix = camera.getProjectionMatrix();
        }
        if (programUniforms.modelViewMatrix) {
          materialUniforms.modelViewMatrix = this.modelViewMatrix;
        }
        if (programUniforms.viewMatrix) {
          materialUniforms.viewMatrix = camera.getViewMatrix();
        }
        if (programUniforms.modelWorldMatrix) {
          materialUniforms.modelWorldMatrix = this.modelWorldMatrix;
        }
        if (programUniforms.normalMatrix) {
          materialUniforms.normalMatrix = this.normalMatrix;
        }
      }
      this.material.use();
      program = this.material.program;
      _ref1 = this.attributes;
      for (name in _ref1) {
        attrib = _ref1[name];
        if (attrib.location === 'undefined' || attrib.location === -1) {
          attrib.location = this.gl.getAttribLocation(program.handle, attrib.name);
        }
        if (attrib.location >= 0) {
          this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attrib.buffer);
          if (this.geometry.attribs[name].isDirty) {
            attrib.dataBuf = this.geometry.attribs[name].buf;
            if (this.geometry.attribs[name].type === 'Vec2') {
              this.geometry.attribs[name].data.forEach(function(v, i) {
                attrib.dataBuf[i * 2 + 0] = v.x;
                return attrib.dataBuf[i * 2 + 1] = v.y;
              });
            }
            if (this.geometry.attribs[name].type === 'Vec3') {
              this.geometry.attribs[name].data.forEach(function(v, i) {
                attrib.dataBuf[i * 3 + 0] = v.x;
                attrib.dataBuf[i * 3 + 1] = v.y;
                return attrib.dataBuf[i * 3 + 2] = v.z;
              });
            }
            this.gl.bufferData(this.gl.ARRAY_BUFFER, attrib.dataBuf, attrib.usage);
            this.geometry.attribs[name].isDirty = false;
          }
          this.gl.vertexAttribPointer(attrib.location, attrib.elementSize, this.gl.FLOAT, false, 0, 0);
          this.gl.enableVertexAttribArray(attrib.location);
        }
      }
      if (this.indices && this.indices.data && this.indices.data.length > 0) {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);
        this.gl.drawElements(this.primitiveType, this.indices.data.length, this.gl.UNSIGNED_SHORT, 0);
      } else if (this.attributes["position"]) {
        num = this.attributes["position"].dataBuf.length / 3;
        this.gl.drawArrays(this.primitiveType, 0, num);
      }
      _results = [];
      for (name in this.attributes) {
        attrib = this.attributes[name];
        if (attrib.location >= 0) {
          _results.push(this.gl.disableVertexAttribArray(attrib.location));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Mesh.prototype.resetAttribLocations = function() {
      var attrib, name, _results;

      _results = [];
      for (name in this.attributes) {
        attrib = this.attributes[name];
        _results.push(attrib.location = -1);
      }
      return _results;
    };

    Mesh.prototype.updateMatrices = function(camera) {
      this.rotation.toMat4(this.rotationMatrix);
      this.modelWorldMatrix.identity().translate(this.position.x, this.position.y, this.position.z).mul(this.rotationMatrix).scale(this.scale.x, this.scale.y, this.scale.z);
      this.modelViewMatrix.copy(camera.getViewMatrix()).mul(this.modelWorldMatrix);
      return this.normalMatrix.copy(this.modelViewMatrix).invert().transpose();
    };

    Mesh.prototype.getMaterial = function() {
      return this.material;
    };

    Mesh.prototype.setMaterial = function(material) {
      this.material = material;
      return this.resetAttribLocations();
    };

    Mesh.prototype.getProgram = function() {
      return this.material.program;
    };

    Mesh.prototype.setProgram = function(program) {
      this.material.program = program;
      return this.resetAttribLocations();
    };

    Mesh;

    return Mesh;

  })();
});

define('pex/gl/Texture',['pex/gl/Context'], function(Context) {
  function Texture(target) {
    if (target) {
      this.init(target);
    }
  }

  Texture.RGBA32F = 34836;

  Texture.prototype.init = function(target) {
    this.gl = Context.currentContext.gl;
    this.target = target;
    this.handle = this.gl.createTexture();
  }

  //### bind ( unit )
  //Binds the texture to the current GL context.
  //`unit` - texture unit in which to place the texture *{ Number/Int }* = 0
  Texture.prototype.bind = function(unit) {
    unit = unit ? unit : 0;
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.target,  this.handle);
  }

  return Texture;
});
define('pex/gl/Texture2D',['pex/gl/Texture','pex/gl/Context','pex/sys/IO'], function(Texture, Context, IO) {

  function Texture2D() {
    this.gl = Context.currentContext.gl;
    Texture.call(this, this.gl.TEXTURE_2D);
  }

  Texture2D.prototype = Object.create(Texture.prototype);

  Texture2D.create = function(w, h, options) {
    options = options || {};
    var texture = new Texture2D();
    texture.bind();

    var gl = texture.gl;

    var isWebGL = gl.getExtension ? true : false;
    var internalFloatFormat = isWebGL ? gl.RGBA : 0x8814 /*RGBA32F_ARB*/;

    if (options.bpp == 32) gl.texImage2D(gl.TEXTURE_2D, 0, internalFloatFormat, w, h, 0, gl.RGBA, gl.FLOAT, null);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);

    texture.width = w;
    texture.height = h;
    texture.target = gl.TEXTURE_2D;
    texture.flipped = false;

    return texture;
  }

  Texture2D.prototype.bind = function(unit) {
    unit = unit ? unit : 0;

    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D,  this.handle);
  }

  Texture2D.genNoise = function(w, h) {
    w = w || 256;
    h = h || 256;

    var gl = Context.currentContext.gl;

    var texture = new Texture2D();
    texture.bind();

    var b = new ArrayBuffer(w*h);
    var pixels = new Uint8Array(b);
    for(var y=0; y<h; y++) {
      for(var x=0; x<w; x++) {
        pixels[y*w + x] = Math.floor(Math.random()*255);
      }
    }
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.LUMINANCE, w, h, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, pixels
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.bindTexture(gl.TEXTURE_2D, null);

    texture.width = w;
    texture.height = h;
    return texture;
  }

  Texture2D.genNoiseRGBA = function(w, h) {
    w = w || 256;
    h = h || 256;

    var gl = Context.currentContext.gl;

    var handle = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, handle);

    var b = new ArrayBuffer(w*h*4);
    var pixels = new Uint8Array(b);
    for(var y=0; y<h; y++) {
      for(var x=0; x<w; x++) {
        pixels[(y*w + x)*4+0] = Math.floor(255 * Math.random());
        pixels[(y*w + x)*4+1] = Math.floor(255 * Math.random());
        pixels[(y*w + x)*4+2] = Math.floor(255 * Math.random());
        pixels[(y*w + x)*4+3] = Math.floor(255 * Math.random());
      }
    }
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.bindTexture(gl.TEXTURE_2D, null);

    var texture = new Texture2D();
    texture.handle = handle;
    texture.width = w;
    texture.height = h;
    texture.target = gl.TEXTURE_2D;
    texture.gl = gl;

    return texture;
  }

  Texture2D.load = function(src, callback) {
    var gl = Context.currentContext.gl;

    var texture = new Texture2D();
    texture.handle = gl.createTexture();
    texture.target = gl.TEXTURE_2D;
    texture.gl = gl;

    IO.loadImageData(gl, texture, texture.target, src, function(image) {
      if (!image) {
        texture.dispose();
        var noise = Texture2D.getNoise();
        texture.handle = noise.handle;
        texture.width = noise.width;
        texture.height = noise.height;
      }

      gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindTexture(texture.target, null);
      texture.width = image.width;
      texture.height = image.height;

      if (callback) callback(texture);
    });

    return texture;
  }

  Texture2D.prototype.dispose = function() {
    if (this.handle) {
      this.gl.deleteTexture(this.handle);
      this.handle = null;
    }
  }

  return Texture2D;
});
define('pex/gl/RenderTarget',['pex/gl/Context', 'pex/gl/Texture2D'], function(Context, Texture2D) {
  function RenderTarget(width, height, options) {
    var gl = this.gl = Context.currentContext.gl;
    this.width = width;
    this.height = height;
    this.oldBinding = gl.getParameter(gl.FRAMEBUFFER_BINDING);

    this.handle = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.handle);

    this.colorAttachements = [];

    if (options && options.depth) {
      var oldRenderBufferBinding = gl.getParameter(gl.RENDERBUFFER_BINDING);
      var depthBuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
      gl.getError(); //reset error

      if (gl.DEPTH_COMPONENT24) {
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, this.width, this.height);
      }

      if (gl.getError() || !gl.DEPTH_COMPONENT24) {
        //24 bit depth buffer might be not available, trying with 16
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
      }
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
      this.depthBuffer = depthBuffer;
      gl.bindRenderbuffer(gl.RENDERBUFFER, oldRenderBufferBinding);
    }

    var texture = Texture2D.create(width, height, options);
    texture.bind();
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + this.colorAttachements.length, texture.target, texture.handle, 0);
    this.colorAttachements.push(texture);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.oldBinding);
    this.oldBinding = null;
  }

  RenderTarget.prototype.bind = function() {
    var gl = this.gl;
    this.oldBinding = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.handle);
  }

  RenderTarget.prototype.bindAndClear = function(){
    var gl = this.gl;

    this.bind();

    gl.clearColor(0, 0, 0, 1);

    if (this.depthBuffer)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    else
      gl.clear(gl.COLOR_BUFFER_BIT);
  }

  RenderTarget.prototype.unbind = function(){
    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.oldBinding);
    this.oldBinding = null;
  }

  RenderTarget.prototype.getColorAttachement = function(index) {
    index = index || 0;
    return this.colorAttachements[index];
  }

  return RenderTarget;
});
define('pex/materials/Material',['pex/gl/Context'], function(Context) {

  function Material(program, uniforms) {
    this.gl = Context.currentContext.gl;
    this.program = program;
    this.uniforms = uniforms || {};
  }

  Material.prototype.use = function() {
    this.program.use();
    var numTextures = 0;
    for(var name in this.uniforms) {
      if (this.program.uniforms[name]) {
        if (this.program.uniforms[name].type == this.gl.SAMPLER_2D
        ||  this.program.uniforms[name].type == this.gl.SAMPLER_CUBE) {
          this.gl.activeTexture(this.gl.TEXTURE0 + numTextures);

          if (this.uniforms[name].width > 0 && this.uniforms[name].height > 0) {
            this.gl.bindTexture(this.uniforms[name].target, this.uniforms[name].handle);
            this.program.uniforms[name]( numTextures );
          }

          numTextures++;
        }
        else {
          this.program.uniforms[name]( this.uniforms[name] );
        }
      }
    }
  }

  return Material;
});
/**
 * @license RequireJS text 1.0.2 Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
/*jslint regexp: false, nomen: false, plusplus: false, strict: false */
/*global require: false, XMLHttpRequest: false, ActiveXObject: false,
  define: false, window: false, process: false, Packages: false,
  java: false, location: false */

(function () {
    var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = [];

    define('lib/text',[],function () {
        var text, get, fs;

        if (typeof window !== "undefined" && window.navigator && window.document) {
            get = function (url, callback) {
                var xhr = text.createXhr();
                xhr.open('GET', url, true);
                xhr.onreadystatechange = function (evt) {
                    //Do not explicitly handle errors, those should be
                    //visible via console output in the browser.
                    if (xhr.readyState === 4) {
                        callback(xhr.responseText);
                    }
                };
                xhr.send(null);
            };
        } else if (typeof process !== "undefined" &&
                 process.versions &&
                 !!process.versions.node) {
            //Using special require.nodeRequire, something added by r.js.
            fs = require.nodeRequire('fs');

            get = function (url, callback) {
                callback(fs.readFileSync(url, 'utf8'));
            };
        } else if (typeof Packages !== 'undefined') {
            //Why Java, why is this so awkward?
            get = function (url, callback) {
                var encoding = "utf-8",
                    file = new java.io.File(url),
                    lineSeparator = java.lang.System.getProperty("line.separator"),
                    input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                    stringBuffer, line,
                    content = '';
                try {
                    stringBuffer = new java.lang.StringBuffer();
                    line = input.readLine();

                    // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                    // http://www.unicode.org/faq/utf_bom.html

                    // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                    // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                    if (line && line.length() && line.charAt(0) === 0xfeff) {
                        // Eat the BOM, since we've already found the encoding on this file,
                        // and we plan to concatenating this buffer with others; the BOM should
                        // only appear at the top of a file.
                        line = line.substring(1);
                    }

                    stringBuffer.append(line);

                    while ((line = input.readLine()) !== null) {
                        stringBuffer.append(lineSeparator);
                        stringBuffer.append(line);
                    }
                    //Make sure we return a JavaScript string and not a Java string.
                    content = String(stringBuffer.toString()); //String
                } finally {
                    input.close();
                }
                callback(content);
            };
        }

        text = {
            version: '1.0.2',

            strip: function (content) {
                //Strips <?xml ...?> declarations so that external SVG and XML
                //documents can be added to a document without worry. Also, if the string
                //is an HTML document, only the part inside the body tag is returned.
                if (content) {
                    content = content.replace(xmlRegExp, "");
                    var matches = content.match(bodyRegExp);
                    if (matches) {
                        content = matches[1];
                    }
                } else {
                    content = "";
                }
                return content;
            },

            jsEscape: function (content) {
                return content.replace(/(['\\])/g, '\\$1')
                    .replace(/[\f]/g, "\\f")
                    .replace(/[\b]/g, "\\b")
                    .replace(/[\n]/g, "\\n")
                    .replace(/[\t]/g, "\\t")
                    .replace(/[\r]/g, "\\r");
            },

            createXhr: function () {
                //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
                var xhr, i, progId;
                if (typeof XMLHttpRequest !== "undefined") {
                    return new XMLHttpRequest();
                } else {
                    for (i = 0; i < 3; i++) {
                        progId = progIds[i];
                        try {
                            xhr = new ActiveXObject(progId);
                        } catch (e) {}

                        if (xhr) {
                            progIds = [progId];  // so faster next time
                            break;
                        }
                    }
                }

                if (!xhr) {
                    throw new Error("createXhr(): XMLHttpRequest not available");
                }

                return xhr;
            },

            get: get,

            /**
             * Parses a resource name into its component parts. Resource names
             * look like: module/name.ext!strip, where the !strip part is
             * optional.
             * @param {String} name the resource name
             * @returns {Object} with properties "moduleName", "ext" and "strip"
             * where strip is a boolean.
             */
            parseName: function (name) {
                var strip = false, index = name.indexOf("."),
                    modName = name.substring(0, index),
                    ext = name.substring(index + 1, name.length);

                index = ext.indexOf("!");
                if (index !== -1) {
                    //Pull off the strip arg.
                    strip = ext.substring(index + 1, ext.length);
                    strip = strip === "strip";
                    ext = ext.substring(0, index);
                }

                return {
                    moduleName: modName,
                    ext: ext,
                    strip: strip
                };
            },

            xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

            /**
             * Is an URL on another domain. Only works for browser use, returns
             * false in non-browser environments. Only used to know if an
             * optimized .js version of a text resource should be loaded
             * instead.
             * @param {String} url
             * @returns Boolean
             */
            useXhr: function (url, protocol, hostname, port) {
                var match = text.xdRegExp.exec(url),
                    uProtocol, uHostName, uPort;
                if (!match) {
                    return true;
                }
                uProtocol = match[2];
                uHostName = match[3];

                uHostName = uHostName.split(':');
                uPort = uHostName[1];
                uHostName = uHostName[0];

                return (!uProtocol || uProtocol === protocol) &&
                       (!uHostName || uHostName === hostname) &&
                       ((!uPort && !uHostName) || uPort === port);
            },

            finishLoad: function (name, strip, content, onLoad, config) {
                content = strip ? text.strip(content) : content;
                if (config.isBuild) {
                    buildMap[name] = content;
                }
                onLoad(content);
            },

            load: function (name, req, onLoad, config) {
                //Name has format: some.module.filext!strip
                //The strip part is optional.
                //if strip is present, then that means only get the string contents
                //inside a body tag in an HTML string. For XML/SVG content it means
                //removing the <?xml ...?> declarations so the content can be inserted
                //into the current doc without problems.

                // Do not bother with the work if a build and text will
                // not be inlined.
                if (config.isBuild && !config.inlineText) {
                    onLoad();
                    return;
                }

                var parsed = text.parseName(name),
                    nonStripName = parsed.moduleName + '.' + parsed.ext,
                    url = req.toUrl(nonStripName),
                    useXhr = (config && config.text && config.text.useXhr) ||
                             text.useXhr;

                //Load the text. Use XHR if possible and in a browser.
                if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                    text.get(url, function (content) {
                        text.finishLoad(name, parsed.strip, content, onLoad, config);
                    });
                } else {
                    //Need to fetch the resource across domains. Assume
                    //the resource has been optimized into a JS module. Fetch
                    //by the module name + extension, but do not include the
                    //!strip part to avoid file system issues.
                    req([nonStripName], function (content) {
                        text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                        parsed.strip, content, onLoad, config);
                    });
                }
            },

            write: function (pluginName, moduleName, write, config) {
                if (moduleName in buildMap) {
                    var content = text.jsEscape(buildMap[moduleName]);
                    write.asModule(pluginName + "!" + moduleName,
                                   "define(function () { return '" +
                                       content +
                                   "';});\n");
                }
            },

            writeFile: function (pluginName, moduleName, req, write, config) {
                var parsed = text.parseName(moduleName),
                    nonStripName = parsed.moduleName + '.' + parsed.ext,
                    //Use a '.js' file name so that it indicates it is a
                    //script that can be loaded across domains.
                    fileName = req.toUrl(parsed.moduleName + '.' +
                                         parsed.ext) + '.js';

                //Leverage own load() method to load plugin value, but only
                //write out values that do not have the strip argument,
                //to avoid any potential issues with ! in file names.
                text.load(nonStripName, req, function (value) {
                    //Use own write() method to construct full module value.
                    //But need to create shell that translates writeFile's
                    //write() to the right interface.
                    var textWrite = function (contents) {
                        return write(fileName, contents);
                    };
                    textWrite.asModule = function (moduleName, contents) {
                        return write.asModule(moduleName, fileName, contents);
                    };

                    text.write(pluginName, nonStripName, textWrite, config);
                }, config);
            }
        };

        return text;
    });
}());
define('lib/text!pex/gl/ScreenImage.glsl',[],function () { return '#ifdef VERT\n\nattribute vec2 position;\nattribute vec2 texCoord;\nuniform vec2 screenSize;\nuniform vec2 pixelPosition;\nuniform vec2 pixelSize;\nvarying vec2 vTexCoord;\n\nvoid main() {\n  float tx = position.x * 0.5 + 0.5;\n  float ty = position.y * 0.5 + 0.5;\n  float x = (pixelPosition.x + pixelSize.x * tx)/screenSize.x * 2.0 - 1.0;\n  float y = (pixelPosition.y + pixelSize.y * ty)/screenSize.y * 2.0 - 1.0;\n  gl_Position = vec4(x, y, 0.0, 1.0);\n  vTexCoord = texCoord;\n}\n\n#endif\n\n#ifdef FRAG\n\nvarying vec2 vTexCoord;\nuniform sampler2D image;\nuniform float alpha;\n\nvoid main() {\n  gl_FragColor = texture2D(image, vTexCoord);\n  gl_FragColor.a *= alpha;\n}\n\n#endif';});

define('pex/gl/ScreenImage',[
  'pex/geom/Vec2', 'pex/gl/Context',
  'pex/gl/Program', 'pex/materials/Material', 'pex/geom/Face3', 'pex/geom/Geometry', 'pex/gl/Mesh',
  'lib/text!pex/gl/ScreenImage.glsl'],
  function(Vec2, Context, Program, Material, Face3, Geometry, Mesh, ScreenImageGLSL) {
  function ScreenImage(image, x, y, w, h, screenWidth, screenHeight) {
    x = (x !== undefined) ? x : 0;
    y = (y !== undefined) ? y : 0;
    w = (w !== undefined) ? w : 1;
    h = (h !== undefined) ? h : 1;

    screenWidth = (screenWidth !== undefined) ? screenWidth : 1;
    screenHeight = (screenHeight !== undefined) ? screenHeight : 1;

    this.image = image;

    var program = new Program(ScreenImageGLSL);

    var uniforms = {
      screenSize : Vec2.create(screenWidth, screenHeight),
      pixelPosition : Vec2.create(x, y),
      pixelSize : Vec2.create(w, h),
      alpha : 1.0
    };

    if (image) uniforms.image = image;

    var material = new Material(program, uniforms);

    var geometry = new Geometry({
      position : {
        type : 'Vec2',
        length : 4
      },
      texCoord : {
        type : 'Vec2',
        length : 4
      }
    });

    geometry.attribs.position.data = [
      new Vec2(-1,  1),
      new Vec2( 1,  1),
      new Vec2( 1, -1),
      new Vec2(-1, -1)
    ];

    geometry.attribs.texCoord.data = [
      new Vec2(0, 1),
      new Vec2(1, 1),
      new Vec2(1, 0),
      new Vec2(0, 0)
    ];

    // 0----1
    // | \  |
    // |  \ |
    // 3----2
    geometry.faces.push(new Face3(0, 2, 1));
    geometry.faces.push(new Face3(0, 3, 2));

    this.mesh = new Mesh(geometry, material);
  }

  ScreenImage.prototype.setAlpha = function(alpha) {
    this.mesh.material.uniforms.alpha = alpha;
  }

  ScreenImage.prototype.setPosition = function(position) {
  this.mesh.material.uniforms.pixelPosition = position;
  }

  ScreenImage.prototype.setSize = function(size) {
    this.mesh.material.uniforms.pixelSize = size;
  }

  ScreenImage.prototype.setWindowSize = function(size) {
    this.mesh.material.uniforms.windowSize = size;
  }

  ScreenImage.prototype.setBounds = function(bounds) {
    throw "Unimplemented";
  }

  ScreenImage.prototype.setImage = function(image) {
    this.image = image;
    this.mesh.material.uniforms.image = image;
  }

  ScreenImage.prototype.draw = function(image, program) {
    var oldImage = this.mesh.material.uniforms.image;
    if (image) {
      oldImage = this.mesh.material.uniforms.image;
      this.mesh.material.uniforms.image = image;
    }

    var oldProgram = null;
    if (program) {
      oldProgram = this.mesh.getProgram();
      this.mesh.setProgram(program);
    }
    this.mesh.draw();

    if (oldProgram) {
      this.mesh.setProgram(oldProgram);
    }
    if (oldImage) {
      this.mesh.material.uniforms.image = oldImage;
    }
  }

  return ScreenImage;
});
//Module wrapper for gl classes.
define('pex/gl',
  [
    'pex/gl/Context',
    'pex/gl/Program',
    'pex/gl/Mesh',
    'pex/gl/Texture2D',
    'pex/gl/RenderTarget',
    'pex/gl/ScreenImage'
  ],
  function(Context, Program, Mesh, Texture2D, RenderTarget, ScreenImage) {
    return {
      Context : Context,
      Program : Program,
      Mesh : Mesh,
      Texture2D : Texture2D,
      RenderTarget : RenderTarget,
      ScreenImage : ScreenImage
    };
  }
);
define('lib/text!pex/materials/SolidColor.glsl',[],function () { return '#ifdef VERT\n\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\nuniform float pointSize;\nattribute vec3 position;\n\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n  gl_PointSize = pointSize;\n}\n\n#endif\n\n#ifdef FRAG\n\nuniform vec4 color;\n\nvoid main() {\n  gl_FragColor = color;\n}\n\n#endif\n';});

define('pex/materials/SolidColor',[
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/color/Color',
  'pex/utils/ObjectUtils',
  'lib/text!pex/materials/SolidColor.glsl'
  ], function(Material, Context, Program, Color, ObjectUtils, SolidColorGLSL) {

  function SolidColor(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(SolidColorGLSL);

    var defaults = {
     color : Color.create(1, 1, 1, 1),
     pointSize : 1
    };

    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);

    Material.call(this, program, uniforms);
  }

  SolidColor.prototype = Object.create(Material.prototype);

  return SolidColor;
});
define('lib/text!pex/materials/ShowNormals.glsl',[],function () { return '#ifdef VERT\n\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\nuniform float pointSize;\nattribute vec3 position;\nattribute vec3 normal;\nvarying vec4 vColor;\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n  gl_PointSize = pointSize;\n  vColor = vec4(normal * 0.5 + 0.5, 1.0);\n}\n\n#endif\n\n#ifdef FRAG\n\nvarying vec4 vColor;\n\nvoid main() {\n  gl_FragColor = vColor;\n}\n\n#endif\n';});

define('pex/materials/ShowNormals',[
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/utils/ObjectUtils',
  'lib/text!pex/materials/ShowNormals.glsl'
  ], function(Material, Context, Program, ObjectUtils, ShowNormalGLSL) {

  function ShowNormals(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(ShowNormalGLSL);

    var defaults = {
      pointSize : 1
    };

    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);

    Material.call(this, program, uniforms);
  }

  ShowNormals.prototype = Object.create(Material.prototype);

  return ShowNormals;
});
define('lib/text!pex/materials/Textured.glsl',[],function () { return '#ifdef VERT\n\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\nattribute vec3 position;\nattribute vec2 texCoord;\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n  gl_PointSize = 2.0;\n  vTexCoord = texCoord;\n}\n\n#endif\n\n#ifdef FRAG\n\nuniform sampler2D texture;\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_FragColor = texture2D(texture, vTexCoord);\n}\n\n#endif\n';});

define('pex/materials/Textured',[
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/geom/Vec4',
  'pex/utils/ObjectUtils',
  'lib/text!pex/materials/Textured.glsl'
  ], function(Material, Context, Program, Vec4, ObjectUtils, TexturedGLSL) {

  function Textured(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(TexturedGLSL);
    var uniforms = ObjectUtils.mergeObjects({}, uniforms);

    Material.call(this, program, uniforms);
  }

  Textured.prototype = Object.create(Material.prototype);

  return Textured;
});
define('lib/text!pex/materials/ShowTexCoords.glsl',[],function () { return '#ifdef VERT\n\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\nuniform float pointSize;\nattribute vec3 position;\nattribute vec2 texCoord;\nvarying vec4 vColor;\n\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n  gl_PointSize = pointSize;\n  vColor = vec4(texCoord, 1.0, 1.0);\n}\n\n#endif\n\n#ifdef FRAG\n\nvarying vec4 vColor;\n\nvoid main() {\n  gl_FragColor = vColor;\n}\n\n#endif';});

define('pex/materials/ShowTexCoords',[
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/utils/ObjectUtils',
  'lib/text!pex/materials/ShowTexCoords.glsl'
  ], function(Material, Context, Program, ObjectUtils, ShowTexCoordGLSL) {

  function ShowTexCoords(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(ShowTexCoordGLSL);

    var defaults = {
      pointSize : 1
    };

    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);

    Material.call(this, program, uniforms);
  }

  ShowTexCoords.prototype = Object.create(Material.prototype);

  return ShowTexCoords;
});
define('lib/text!pex/materials/ShowDepth.glsl',[],function () { return '#ifdef VERT\n\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\nuniform float near;\nuniform float far;\nuniform vec4 farColor;\nuniform vec4 nearColor;\nattribute vec3 position;\nattribute vec3 normal;\nvarying vec4 vColor;\nvoid main() {\n  vec4 pos = modelViewMatrix * vec4(position, 1.0);\n  gl_Position = projectionMatrix * pos;\n  float depth = clamp((-pos.z - near) / (far - near), 0, 1);\n  vColor = mix(nearColor, farColor, depth);\n}\n\n#endif\n\n#ifdef FRAG\n\nvarying vec4 vColor;\n\nvoid main() {\n  gl_FragColor = vColor;\n}\n\n#endif\n';});

define('pex/materials/ShowDepth',[
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/utils/ObjectUtils',
  'pex/color/Color',
  'lib/text!pex/materials/ShowDepth.glsl'
  ], function(Material, Context, Program, ObjectUtils, Color, ShowDepthGLSL) {

  function ShowDepth(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(ShowDepthGLSL);

    var defaults = {
      near: 0,
      far: 10,
      nearColor: Color.create(0, 0, 0, 1),
      farColor: Color.create(1, 1, 1, 1)
    };

    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);

    Material.call(this, program, uniforms);
  }

  ShowDepth.prototype = Object.create(Material.prototype);

  return ShowDepth;
});
define('lib/text!pex/materials/ShowColors.glsl',[],function () { return '#ifdef VERT\n\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\nuniform float pointSize;\nattribute vec3 position;\nattribute vec4 color;\nvarying vec4 vColor;\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n  gl_PointSize = pointSize;\n  vColor = color;\n}\n\n#endif\n\n#ifdef FRAG\n\nvarying vec4 vColor;\n\nvoid main() {\n  gl_FragColor = vColor;\n}\n\n#endif\n';});

define('pex/materials/ShowColors',[
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/utils/ObjectUtils',
  'lib/text!pex/materials/ShowColors.glsl'
  ], function(Material, Context, Program, ObjectUtils, ShowColorsGLSL) {

  function ShowColors(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(ShowColorsGLSL);

    var defaults = {
      pointSize : 1
    };

    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);

    Material.call(this, program, uniforms);
  }

  ShowColors.prototype = Object.create(Material.prototype);

  return ShowColors;
});
define('lib/text!pex/materials/PackDepth.glsl',[],function () { return '#ifdef VERT\n\nattribute vec4 position;\n\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\nuniform float near;\nuniform float far;\n\nvarying float depth;\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * position;\n\n  //linear depth in camera space (0..far)\n  depth = (modelViewMatrix * position).z/far;\n}\n#endif\n\n#ifdef FRAG\n\nuniform float near;\nuniform float far;\n\nvarying float depth;\n\n//from http://spidergl.org/example.php?id=6\nvec4 packDepth(const in float depth) {\n  const vec4 bit_shift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);\n  const vec4 bit_mask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);\n  vec4 res = fract(depth * bit_shift);\n  res -= res.xxyz * bit_mask;\n  return res;\n}\n\nvoid main() {\n  gl_FragColor = packDepth(-depth);\n  gl_FragColor.r = 1.0;\n}\n\n#endif';});

define('pex/materials/PackDepth',[
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/materials/Material',
  'pex/utils/ObjectUtils',
  'lib/text!pex/materials/PackDepth.glsl'],
  function(Context, Program, Material, ObjectUtils, PackDepthGLSL) {
  function PackDepthMaterial(uniforms) {
      this.gl = Context.currentContext.gl;
      this.program = new Program(PackDepthGLSL);

      var defaults = {
        near: 0.1,
        far: 100
      };

      this.uniforms = ObjectUtils.mergeObjects(defaults, uniforms);
  }

  PackDepthMaterial.prototype = new Material();

  return PackDepthMaterial;
});
define('lib/text!pex/materials/Diffuse.glsl',[],function () { return '#ifdef VERT\n\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\nuniform float pointSize;\nattribute vec3 position;\nattribute vec3 normal;\nvarying vec3 vNormal;\n\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n  gl_PointSize = pointSize;\n  vNormal = normal;\n}\n\n#endif\n\n#ifdef FRAG\n\nuniform vec4 ambientColor;\nuniform vec4 diffuseColor;\nuniform vec3 lightPos;\nuniform float wrap;\nvarying vec3 vNormal;\n\nvoid main() {\n  vec3 L = normalize(lightPos);\n  vec3 N = normalize(vNormal);\n  float NdotL = max(0.0, (dot(N, L) + wrap) / (1.0 + wrap));\n  gl_FragColor = ambientColor + NdotL * diffuseColor;\n}\n\n#endif\n';});

define('pex/materials/Diffuse',[
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/utils/ObjectUtils',
  'pex/geom/Vec3',
  'pex/color/Color',
  'lib/text!pex/materials/Diffuse.glsl'
  ], function(Material, Context, Program, ObjectUtils, Vec3, Color, DiffuseGLSL) {

  function Diffuse(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(DiffuseGLSL);

    var defaults = {
      wrap: 1,
      pointSize : 1,
      lightPos : Vec3.create(10, 20, 30),
      ambientColor : Color.create(0, 0, 0, 1),
      diffuseColor : Color.create(1, 1, 1, 1)
    };

    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);

    Material.call(this, program, uniforms);
  }

  Diffuse.prototype = Object.create(Material.prototype);

  return Diffuse;
});
define('lib/text!pex/materials/Test.glsl',[],function () { return '#ifdef VERT\n\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\n\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 texCoord;\n\nvarying vec3 vNormal;\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n  gl_PointSize = 2.0;\n  vNormal = normal;\n  vTexCoord = texCoord;\n}\n\n#endif\n\n#ifdef FRAG\n\nvec4 checker(vec2 uv) {\n  float checkSize = 8.0;\n  float fmodResult = mod(floor(checkSize * uv.x) + floor(checkSize * uv.y),2.0);\n  if (fmodResult < 1.0) {\n    return vec4(1, 1, 1, 1);\n  } else {\n    return vec4(0, 0, 0, 1);\n  }\n}\n\nvarying vec3 vNormal;\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_FragColor.rgba = 0.25 * checker(vTexCoord);\n  gl_FragColor.rgb += 0.5 * normalize(vNormal)*0.5 + 0.5;\n  gl_FragColor.a = 1.0;\n}\n\n#endif';});

define('pex/materials/Test',[
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/color/Color',
  'pex/utils/ObjectUtils',
  'lib/text!pex/materials/Test.glsl'
  ], function(Material, Context, Program, Color, ObjectUtils, TestGLSL) {

  function Test() {
    this.gl = Context.currentContext.gl;
    var program = new Program(TestGLSL);

    var uniforms = {}

    Material.call(this, program, uniforms);
  }

  Test.prototype = Object.create(Material.prototype);

  return Test;
});
//Module wrapper for materials classes.
define('pex/materials',
  [
    'pex/materials/SolidColor',
    'pex/materials/ShowNormals',
    'pex/materials/Textured',
    'pex/materials/ShowTexCoords',
    'pex/materials/ShowDepth',
    'pex/materials/ShowColors',
    'pex/materials/PackDepth',
    'pex/materials/Diffuse',
    'pex/materials/Test',
  ],
  function(SolidColor, ShowNormals, Textured, ShowTexCoords, ShowDepth, ShowColors, PackDepth, Diffuse, Test) {
    return {
      SolidColor : SolidColor,
      ShowNormals : ShowNormals,
      Textured : Textured,
      ShowTexCoords : ShowTexCoords,
      ShowDepth : ShowDepth,
      ShowColors : ShowColors,
      PackDepth : PackDepth,
      Diffuse : Diffuse,
      Test : Test
    };
  }
);

// Generated by CoffeeScript 1.6.2
define('pex/scene/Camera',['require','pex/geom'],function(require) {
  var Camera, Mat4, Vec2, Vec3, Vec4, _ref;

  _ref = require('pex/geom'), Vec2 = _ref.Vec2, Vec3 = _ref.Vec3, Vec4 = _ref.Vec4, Mat4 = _ref.Mat4;
  return Camera = (function() {
    var projected;

    function Camera(fov, aspectRatio, near, far, position, target, up) {
      this.fov = fov || 60;
      this.aspectRatio = aspectRatio || 4 / 3;
      this.near = near || 0.1;
      this.far = far || 100;
      this.position = position || Vec3.create(0, 0, 5);
      this.target = target || Vec3.create(0, 0, 0);
      this.up = up || Vec3.create(0, 1, 0);
      this.projectionMatrix = Mat4.create();
      this.viewMatrix = Mat4.create();
      this.updateMatrices();
    }

    Camera.prototype.getFov = function() {
      return this.fov;
    };

    Camera.prototype.getAspectRatio = function() {
      return aspectRatio;
    };

    Camera.prototype.getNear = function() {
      return this.near;
    };

    Camera.prototype.getFar = function() {
      return this.far;
    };

    Camera.prototype.getPosition = function() {
      return this.position;
    };

    Camera.prototype.getTarget = function() {
      return this.target;
    };

    Camera.prototype.getUp = function() {
      return up;
    };

    Camera.prototype.getViewMatrix = function() {
      return this.viewMatrix;
    };

    Camera.prototype.getProjectionMatrix = function() {
      return this.projectionMatrix;
    };

    Camera.prototype.setFov = function(fov) {
      this.fov = fov;
      return this.updateMatrices();
    };

    Camera.prototype.setAspectRatio = function(ratio) {
      this.aspectRatio = ratio;
      return this.updateMatrices();
    };

    Camera.prototype.setFar = function(far) {
      this.far = far;
      return this.updateMatrices();
    };

    Camera.prototype.setNear = function(near) {
      this.near = near;
      return this.updateMatrices();
    };

    Camera.prototype.setPosition = function(position) {
      position = position;
      return this.updateMatrices();
    };

    Camera.prototype.setTarget = function(target) {
      this.target = target;
      return this.updateMatrices();
    };

    Camera.prototype.setUp = function(up) {
      this.up = up;
      return this.updateMatrices();
    };

    Camera.prototype.lookAt = function(target, eyePosition, up) {
      if (target) {
        this.target = target;
      }
      if (eyePosition) {
        this.position = eyePosition;
      }
      if (up) {
        this.up = up;
      }
      return this.updateMatrices();
    };

    Camera.prototype.updateMatrices = function() {
      this.projectionMatrix.identity().perspective(this.fov, this.aspectRatio, this.near, this.far);
      return this.viewMatrix.identity().lookAt(this.position, this.target, this.up);
    };

    projected = Vec4.create();

    Camera.prototype.getScreenPos = function(point, windowWidth, windowHeight) {
      var out;

      projected.set(point.x, point.y, point.z, 1.0);
      projected.transformMat4(this.viewMatrix);
      projected.transformMat4(this.projectionMatrix);
      out = Vec2.create().set(projected.x, projected.y);
      out.x /= projected.w;
      out.y /= projected.w;
      out.x = out.x * 0.5 + 0.5;
      out.y = out.y * 0.5 + 0.5;
      out.x *= windowWidth;
      out.y *= windowHeight;
      return out;
    };

    return Camera;

  })();
});

// Generated by CoffeeScript 1.6.2
define('pex/scene/Arcball',['require','pex/geom'],function(require) {
  var Arcball, Mat4, Quat, Vec2, Vec3, Vec4, _ref;

  _ref = require('pex/geom'), Vec2 = _ref.Vec2, Vec3 = _ref.Vec3, Vec4 = _ref.Vec4, Quat = _ref.Quat, Mat4 = _ref.Mat4;
  return Arcball = (function() {
    function Arcball(window, camera, distance) {
      this.distance = distance || 2;
      this.minDistance = distance / 2 || 0.3;
      this.maxDistance = distance * 2 || 5;
      this.camera = camera;
      this.window = window;
      this.radius = Math.min(window.width / 2, window.height / 2) * 2;
      this.center = Vec2.create(window.width / 2, window.height / 2);
      this.currRot = Quat.create();
      this.currRot.setAxisAngle(Vec3.create(0, 1, 0), Math.PI / 4);
      this.clickRot = Quat.create();
      this.dragRot = Quat.create();
      this.clickPos = Vec3.create();
      this.dragPos = Vec3.create();
      this.rotAxis = Vec3.create();
      this.allowZooming = true;
      this.enabled = true;
      this.updateCamera();
      this.addEventHanlders();
    }

    Arcball.prototype.addEventHanlders = function() {
      var _this = this;

      this.window.on('leftMouseDown', function(e) {
        if (e.handled || !_this.enabled) {
          return;
        }
        return _this.down(e.x, _this.window.height - e.y);
      });
      this.window.on('mouseDragged', function(e) {
        if (e.handled || !_this.enabled) {
          return;
        }
        return _this.drag(e.x, _this.window.height - e.y);
      });
      return this.window.on('scrollWheel', function(e) {
        if (e.handled || !_this.enabled) {
          return;
        }
        if (!_this.allowZooming) {
          return;
        }
        _this.distance = Math.min(_this.maxDistance, Math.max(_this.distance + e.dy / 100 * (_this.maxDistance - _this.minDistance), _this.minDistance));
        return _this.updateCamera();
      });
    };

    Arcball.prototype.mouseToSphere = function(x, y) {
      var dist, v;

      v = Vec3.create((x - this.center.x) / this.radius, -(y - this.center.y) / this.radius, 0);
      dist = v.x * v.x + v.y * v.y;
      if (dist > 1) {
        v.normalize();
      } else {
        v.z = Math.sqrt(1.0 - dist);
      }
      return v;
    };

    Arcball.prototype.down = function(x, y) {
      this.clickPos = this.mouseToSphere(x, y);
      this.clickRot.copy(this.currRot);
      return this.updateCamera();
    };

    Arcball.prototype.drag = function(x, y) {
      var theta;

      this.dragPos = this.mouseToSphere(x, y);
      this.rotAxis.asCross(this.clickPos, this.dragPos);
      theta = this.clickPos.dot(this.dragPos);
      this.dragRot.set(this.rotAxis.x, this.rotAxis.y, this.rotAxis.z, theta);
      this.currRot.asMul(this.dragRot, this.clickRot);
      return this.updateCamera();
    };

    Arcball.prototype.updateCamera = function() {
      var eye, offset, q, target, up;

      q = this.currRot.clone();
      q.w *= -1;
      target = Vec3.create(0, 0, 0);
      offset = Vec3.create(0, 0, this.distance).transformQuat(q);
      eye = Vec3.create().asSub(target, offset);
      up = Vec3.create(0, 1, 0).transformQuat(q);
      return this.camera.lookAt(target, eye, up);
    };

    Arcball.prototype.disableZoom = function() {
      return this.allowZooming = false;
    };

    return Arcball;

  })();
});

define('pex/scene',
  [
    'pex/scene/Camera',
    'pex/scene/Arcball'
  ],
  function(Camera, Arcball) {
    return {
      Camera : Camera,
      Arcball : Arcball
    };
  }
);

define('pex/fx/FXResourceMgr',[], function() {

  function FXResourceMgr() {
    this.cache = [];
  }

  FXResourceMgr.prototype.getResource = function(type, properties) {
    properties = properties || {};
    for(var i=0; i<this.cache.length; i++) {
      var res = this.cache[i];
      if (res.type == type && !res.used) {
        var areTheSame = true;
        for(var propName in properties) {
          if (properties[propName] != res.properties[propName]) {
            areTheSame = false;
          }
        }
        if (areTheSame) return res;
      }
    }
    return null;
  }

  FXResourceMgr.prototype.addResource = function(type, obj, properties) {
    var res = {
      type : type,
      obj : obj,
      properties : properties
    };
    this.cache.push(res);
    return res;
  }

  FXResourceMgr.prototype.markAllAsNotUsed = function() {
    for(var i=0; i<this.cache.length; i++) {
      this.cache[i].used = false;
    }
  }

  return FXResourceMgr;
});
define('pex/fx/FXStage',[
  'pex/gl/Context',
  'pex/fx/FXResourceMgr',
  'pex/gl/ScreenImage',
  'pex/gl/RenderTarget',
  'pex/gl/Program',
  'pex/gl/Texture2D',
  'pex/geom/Vec2'
  ],
  function(Context, FXResourceMgr, ScreenImage, RenderTarget, Program, Texture2D, Vec2) {
  var FXStageCount = 0;
  function FXStage(source, resourceMgr, fullscreenQuad) {
    this.id = FXStageCount++;
    console.log("FXStage+ " + FXStageCount)
    this.gl = Context.currentContext.gl;
    this.source = source || null;
    this.resourceMgr = resourceMgr || new FXResourceMgr();
    this.fullscreenQuad = fullscreenQuad || new ScreenImage();
    this.defaultBPP = 8;
  }

  FXStage.prototype.reset = function() {
    this.resourceMgr.markAllAsNotUsed();
  }

  FXStage.prototype.getOutputSize = function(width, height, verbose) {
    if (width && height) {
      return { width: width, height: height };
    }
    else if (this.source) {
      return { width: this.source.width, height: this.source.height };
    }
    else {
      var viewport = this.gl.getParameter(this.gl.VIEWPORT);
      return { width: viewport[2], height: viewport[3] };
    }
  }

  FXStage.prototype.getRenderTarget = function(w, h, depth, bpp) {
    depth = depth || false;
    bpp = bpp || this.defaultBPP;

    var resProps = {w:w, h:h, depth:depth, bpp:bpp};
    var res = this.resourceMgr.getResource('RenderTarget', resProps);
    if (!res) {
      var renderTarget = new RenderTarget(w, h, resProps);
      res = this.resourceMgr.addResource('RenderTarget', renderTarget, resProps);
    }
    res.used = true;
    return res.obj;
  }

  FXStage.prototype.getFXStage = function(name) {
    var resProps = {};
    var res = this.resourceMgr.getResource('FXStage', resProps);
    if (!res) {
      var fxState = new FXStage(null, this.resourceMgr, this.fullscreenQuad);
      res = this.resourceMgr.addResource('FXStage', fxState, resProps);
    }
    res.used = true;
    return res.obj;
  }

  FXStage.prototype.asFXStage = function(source, name) {
    var stage = this.getFXStage(name);
    stage.source = source;
    stage.name = name + '_' + stage.id;
    return stage;
  }

  FXStage.prototype.getShader = function(code) {
    if (code.indexOf('.glsl') == code.length - 5) {
      throw 'FXStage.getShader - loading files not supported yet.';
    }
    var resProps = {code: code};
    var res = this.resourceMgr.getResource('Program', resProps);
    if (!res) {
      var program = new Program(code);
      res = this.resourceMgr.addResource('Program', program, resProps);
    }
    res.used = true;
    return res.obj;
  }

  FXStage.prototype.getSourceTexture = function(source) {
    if (source) {
      if (source.source) {
        if (source.source.getColorAttachement) {
          return source.source.getColorAttachement(0);
        }
        else return source.source;
      }
      else if (source.getColorAttachement) {
        return source.getColorAttachement(0);
      }
      else return source;
    }
    else if (this.source) {
      if (this.source.getColorAttachement) {
        return this.source.getColorAttachement(0);
      }
      else return this.source;
    }
    else throw 'FXStage.getSourceTexture() No source texture!';
  }

  FXStage.prototype.drawFullScreenQuad = function(width, height, image, program) {
    this.drawFullScreenQuadAt(0, 0, width, height, image, program);
  }

  FXStage.prototype.drawFullScreenQuadAt = function(x, y, width, height, image, program) {
    var gl = this.gl;
    gl.disable(gl.DEPTH_TEST);

    var oldViewport = gl.getParameter(gl.VIEWPORT);
    gl.viewport(x, y, width, height);
    this.fullscreenQuad.draw(image, program);
    gl.viewport(oldViewport[0], oldViewport[1], oldViewport[2], oldViewport[3]);
  }

  FXStage.prototype.getImage = function(path) {
    var resProps = {path: path};
    var res = this.resourceMgr.getResource('Image', resProps);
    if (!res) {
      var image = Texture2D.load(path);
      res = this.resourceMgr.addResource('Image', image, resProps);
    }
    res.used = false; //can be shared so no need for locking
    return res.obj;
  }

  FXStage.prototype.getFullScreenQuad = function() {
    return this.fullscreenQuad;
  }


  return FXStage;
});
define('pex/fx/Render',['pex/fx/FXStage'], function(FXStage) {
  FXStage.prototype.render = function(options) {
    var gl = this.gl;
    var outputSize = this.getOutputSize(options.width, options.height);
    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    var oldViewport = gl.getParameter(gl.VIEWPORT);
    gl.viewport(0, 0, outputSize.width, outputSize.height);

    rt.bindAndClear();
    if (options.drawFunc) {
      options.drawFunc();
    }
    rt.unbind();
    gl.viewport(oldViewport[0], oldViewport[1], oldViewport[2], oldViewport[3]);

    return this.asFXStage(rt, 'render');
  }
});
define('pex/fx/Blit',['pex/fx/FXStage', 'pex/gl/ScreenImage', 'pex/geom/Vec2'], function(FXStage, ScreenImage, Vec2) {
  FXStage.prototype.blit = function(options) {
    options = options || {};

    var outputSize = this.getOutputSize(options.width, options.height);

    var x = options.x || 0;
    var y = options.y || 0;

    this.drawFullScreenQuadAt(x, y, outputSize.width, outputSize.height, this.getSourceTexture());

    return this;
  }
});
define('lib/text!pex/fx/Downsample2.glsl',[],function () { return '#ifdef VERT\n\nattribute vec2 position;\nattribute vec2 texCoord;\n\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_Position = vec4(position, 0.0, 1.0);\n  vTexCoord = texCoord;\n}\n\n#endif\n\n#ifdef FRAG\n\nvarying vec2 vTexCoord;\n\nuniform sampler2D image;\nuniform vec2 imageSize;\n\nvoid main() {\n  vec2 texel = vec2(1.0 / imageSize.x, 1.0 / imageSize.y);\n  vec4 color = vec4(0.0);\n  color += texture2D(image, vTexCoord + vec2(texel.x * -1.0, texel.y * -1.0));\n  color += texture2D(image, vTexCoord + vec2(texel.x *  0.0, texel.y * -1.0));\n  color += texture2D(image, vTexCoord + vec2(texel.x * -1.0, texel.y *  0.0));\n  color += texture2D(image, vTexCoord + vec2(texel.x *  0.0, texel.y *  0.0));\n  gl_FragColor = color / 4.0;\n}\n\n#endif';});

define('pex/fx/Downsample2',['pex/fx/FXStage', 'lib/text!pex/fx/Downsample2.glsl', 'pex/geom/Vec2'], function(FXStage, Downsample2GLSL, Vec2) {
  FXStage.prototype.downsample2 = function(options) {
    options = options || {};

    var outputSize = this.getOutputSize(options.width, options.height);
    outputSize.width /= 2;
    outputSize.height /= 2;

    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    var source = this.getSourceTexture();

    var program = this.getShader(Downsample2GLSL);
    program.use();
    program.uniforms.imageSize(Vec2.create(source.width, source.height));
    rt.bindAndClear();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, source, program);
    rt.unbind();

    return this.asFXStage(rt, 'downsample2');
  }
});
define('lib/text!pex/fx/Downsample4.glsl',[],function () { return '#ifdef VERT\n\nattribute vec2 position;\nattribute vec2 texCoord;\n\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_Position = vec4(position, 0.0, 1.0);\n  vTexCoord = texCoord;\n}\n\n#endif\n\n#ifdef FRAG\n\nvarying vec2 vTexCoord;\n\nuniform sampler2D image;\nuniform vec2 imageSize;\n\nvoid main() {\n  vec2 texel = vec2(1.0 / imageSize.x, 1.0 / imageSize.y);\n  vec4 color = vec4(0.0);\n  color += texture2D(image, vTexCoord + vec2(texel.x * -2.0, texel.y * -2.0));\n  color += texture2D(image, vTexCoord + vec2(texel.x * -1.0, texel.y * -2.0));\n  color += texture2D(image, vTexCoord + vec2(texel.x *  0.0, texel.y * -2.0));\n  color += texture2D(image, vTexCoord + vec2(texel.x *  1.0, texel.y * -2.0));\n  color += texture2D(image, vTexCoord + vec2(texel.x * -2.0, texel.y * -1.0));\n  color += texture2D(image, vTexCoord + vec2(texel.x * -1.0, texel.y * -1.0));\n  color += texture2D(image, vTexCoord + vec2(texel.x *  0.0, texel.y * -1.0));\n  color += texture2D(image, vTexCoord + vec2(texel.x *  1.0, texel.y * -1.0));\n  color += texture2D(image, vTexCoord + vec2(texel.x * -2.0, texel.y *  0.0));\n  color += texture2D(image, vTexCoord + vec2(texel.x * -1.0, texel.y *  0.0));\n  color += texture2D(image, vTexCoord + vec2(texel.x *  0.0, texel.y *  0.0));\n  color += texture2D(image, vTexCoord + vec2(texel.x *  1.0, texel.y *  0.0));\n  color += texture2D(image, vTexCoord + vec2(texel.x * -2.0, texel.y *  1.0));\n  color += texture2D(image, vTexCoord + vec2(texel.x * -1.0, texel.y *  1.0));\n  color += texture2D(image, vTexCoord + vec2(texel.x *  0.0, texel.y *  1.0));\n  color += texture2D(image, vTexCoord + vec2(texel.x *  1.0, texel.y *  1.0));\n  gl_FragColor = color / 16.0;\n}\n\n#endif';});

define('pex/fx/Downsample4',['pex/fx/FXStage', 'lib/text!pex/fx/Downsample4.glsl', 'pex/geom/Vec2'], function(FXStage, Downsample4GLSL, Vec2) {
  FXStage.prototype.downsample4 = function(options) {
    options = options || {};

    var outputSize = this.getOutputSize(options.width, options.height, true);
    outputSize.width /= 4;
    outputSize.height /= 4;

    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    var source = this.getSourceTexture();

    var program = this.getShader(Downsample4GLSL);
    program.use();
    program.uniforms.imageSize(Vec2.create(source.width, source.height));
    rt.bindAndClear();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, source, program);
    rt.unbind();

    return this.asFXStage(rt, 'downsample4');
  }
});
define('lib/text!pex/fx/Blur3H.glsl',[],function () { return '#ifdef VERT\n\nattribute vec2 position;\nattribute vec2 texCoord;\n\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_Position = vec4(position.x, position.y, 0.0, 1.0);\n  vTexCoord = texCoord;\n}\n\n#endif\n\n#ifdef FRAG\n\nvarying vec2 vTexCoord;\n\nuniform sampler2D image;\nuniform vec2 imageSize;\n\nvoid main() {\n  vec2 texel = vec2(1.0 / imageSize.x, 1.0 / imageSize.y);\n\n  vec4 color = vec4(0.0);\n  color += 0.25 * texture2D(image, vTexCoord + vec2(texel.x * -1.0, 0.0));\n  color += 0.50 * texture2D(image, vTexCoord);\n  color += 0.25 * texture2D(image, vTexCoord + vec2(texel.x *  1.0, 0.0));\n  gl_FragColor = color;\n}\n\n#endif\n';});

define('lib/text!pex/fx/Blur3V.glsl',[],function () { return '#ifdef VERT\n\nattribute vec2 position;\nattribute vec2 texCoord;\n\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_Position = vec4(position.x, position.y, 0.0, 1.0);\n  vTexCoord = texCoord;\n}\n\n#endif\n\n#ifdef FRAG\n\nvarying vec2 vTexCoord;\n\nuniform sampler2D image;\nuniform vec2 imageSize;\n\nvoid main() {\n  vec2 texel = vec2(1.0 / imageSize.x, 1.0 / imageSize.y);\n\n  vec4 color = vec4(0.0);\n  color += 0.25 * texture2D(image, vTexCoord + vec2(0.0, texel.y * -1.0));\n  color += 0.50 * texture2D(image, vTexCoord);\n  color += 0.25 * texture2D(image, vTexCoord + vec2(0.0, texel.y *  1.0));\n  gl_FragColor = color;\n}\n\n#endif\n';});

define('pex/fx/Blur3',['pex/fx/FXStage', 'lib/text!pex/fx/Blur3H.glsl', 'lib/text!pex/fx/Blur3V.glsl', 'pex/geom/Vec2'],
function(FXStage, Blur3HGLSL, Blur3VGLSL, Vec2) {
  FXStage.prototype.blur3 = function(options) {
    options = options || {};

    var outputSize = this.getOutputSize(options.width, options.height);

    var rth = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    var rtv = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    var source = this.getSourceTexture();

    var programH = this.getShader(Blur3HGLSL);
    programH.use();
    programH.uniforms.imageSize(Vec2.create(source.width, source.height));
    rth.bindAndClear();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, source, programH);
    rth.unbind();

    var programV = this.getShader(Blur3VGLSL);
    programV.use();
    programV.uniforms.imageSize(Vec2.create(source.width, source.height));
    rtv.bindAndClear();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, rth.getColorAttachement(0), programV);
    rtv.unbind();

    return this.asFXStage(rtv, 'blur3');
  }
});
define('lib/text!pex/fx/Blur5H.glsl',[],function () { return '#ifdef VERT\n\nattribute vec2 position;\nattribute vec2 texCoord;\n\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_Position = vec4(position.x, position.y, 0.0, 1.0);\n  vTexCoord = texCoord;\n}\n\n#endif\n\n#ifdef FRAG\n\nvarying vec2 vTexCoord;\n\nuniform sampler2D image;\nuniform vec2 imageSize;\n\nvoid main() {\n  vec2 texel = vec2(1.0 / imageSize.x, 1.0 / imageSize.y);\n\n  vec4 color = vec4(0.0);\n  color += 1.0/16.0 * texture2D(image, vTexCoord + vec2(texel.x * -2.0, 0.0));\n  color += 4.0/16.0 * texture2D(image, vTexCoord + vec2(texel.x * -1.0, 0.0));\n  color += 6.0/16.0 * texture2D(image, vTexCoord + vec2(texel.x *  0.0, 0.0));\n  color += 4.0/16.0 * texture2D(image, vTexCoord + vec2(texel.x *  1.0, 0.0));\n  color += 1.0/16.0 * texture2D(image, vTexCoord + vec2(texel.x *  2.0, 0.0));\n  gl_FragColor = color;\n}\n\n#endif\n';});

define('lib/text!pex/fx/Blur5V.glsl',[],function () { return '#ifdef VERT\n\nattribute vec2 position;\nattribute vec2 texCoord;\n\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_Position = vec4(position.x, position.y, 0.0, 1.0);\n  vTexCoord = texCoord;\n}\n\n#endif\n\n#ifdef FRAG\n\nvarying vec2 vTexCoord;\n\nuniform sampler2D image;\nuniform vec2 imageSize;\n\nvoid main() {\n  vec2 texel = vec2(1.0 / imageSize.x, 1.0 / imageSize.y);\n\n  vec4 color = vec4(0.0);\n  color += 1.0/16.0 * texture2D(image, vTexCoord + vec2(0.0, texel.y * -2.0));\n  color += 4.0/16.0 * texture2D(image, vTexCoord + vec2(0.0, texel.y * -1.0));\n  color += 6.0/16.0 * texture2D(image, vTexCoord + vec2(0.0, texel.y *  0.0));\n  color += 4.0/16.0 * texture2D(image, vTexCoord + vec2(0.0, texel.y *  1.0));\n  color += 1.0/16.0 * texture2D(image, vTexCoord + vec2(0.0, texel.y *  2.0));\n  gl_FragColor = color;\n}\n\n#endif\n';});

define('pex/fx/Blur5',['pex/fx/FXStage', 'lib/text!pex/fx/Blur5H.glsl', 'lib/text!pex/fx/Blur5V.glsl', 'pex/geom/Vec2'],
function(FXStage, Blur5HGLSL, Blur5VGLSL, Vec2) {
  FXStage.prototype.blur5 = function(options) {
    options = options || {};

    var outputSize = this.getOutputSize(options.width, options.height);

    var rth = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    var rtv = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    var source = this.getSourceTexture();

    var programH = this.getShader(Blur5HGLSL);
    programH.use();
    programH.uniforms.imageSize(Vec2.create(source.width, source.height));
    rth.bindAndClear();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, source, programH);
    rth.unbind();

    var programV = this.getShader(Blur5VGLSL);
    programV.use();
    programV.uniforms.imageSize(Vec2.create(source.width, source.height));
    rtv.bindAndClear();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, rth.getColorAttachement(0), programV);
    rtv.unbind();

    return this.asFXStage(rtv, 'blur5');
  }
});
define('lib/text!pex/fx/Blur7H.glsl',[],function () { return '#ifdef VERT\n\nattribute vec2 position;\nattribute vec2 texCoord;\n\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_Position = vec4(position.x, position.y, 0.0, 1.0);\n  vTexCoord = texCoord;\n}\n\n#endif\n\n#ifdef FRAG\n\nvarying vec2 vTexCoord;\n\nuniform sampler2D image;\nuniform vec2 imageSize;\n\nvoid main() {\n  vec2 texel = vec2(1.0 / imageSize.x, 1.0 / imageSize.y);\n\n  vec4 color = vec4(0.0);\n  color +=  1.0/64.0 * texture2D(image, vTexCoord + vec2(texel.x * -3.0, 0.0));\n  color +=  6.0/64.0 * texture2D(image, vTexCoord + vec2(texel.x * -2.0, 0.0));\n  color += 15.0/64.0 * texture2D(image, vTexCoord + vec2(texel.x * -1.0, 0.0));\n  color += 20.0/64.0 * texture2D(image, vTexCoord + vec2(texel.x *  0.0, 0.0));\n  color += 15.0/64.0 * texture2D(image, vTexCoord + vec2(texel.x *  1.0, 0.0));\n  color +=  6.0/64.0 * texture2D(image, vTexCoord + vec2(texel.x *  2.0, 0.0));\n  color +=  1.0/64.0 * texture2D(image, vTexCoord + vec2(texel.x *  3.0, 0.0));\n  gl_FragColor = color;\n}\n\n#endif\n';});

define('lib/text!pex/fx/Blur7V.glsl',[],function () { return '#ifdef VERT\n\nattribute vec2 position;\nattribute vec2 texCoord;\n\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_Position = vec4(position.x, position.y, 0.0, 1.0);\n  vTexCoord = texCoord;\n}\n\n#endif\n\n#ifdef FRAG\n\nvarying vec2 vTexCoord;\n\nuniform sampler2D image;\nuniform vec2 imageSize;\n\nvoid main() {\n  vec2 texel = vec2(1.0 / imageSize.x, 1.0 / imageSize.y);\n\n  vec4 color = vec4(0.0);\n  color +=  1.0/64.0 * texture2D(image, vTexCoord + vec2(0.0, texel.y * -3.0));\n  color +=  6.0/64.0 * texture2D(image, vTexCoord + vec2(0.0, texel.y * -2.0));\n  color += 15.0/64.0 * texture2D(image, vTexCoord + vec2(0.0, texel.y * -1.0));\n  color += 20.0/64.0 * texture2D(image, vTexCoord + vec2(0.0, texel.y *  0.0));\n  color += 15.0/64.0 * texture2D(image, vTexCoord + vec2(0.0, texel.y *  1.0));\n  color +=  6.0/64.0 * texture2D(image, vTexCoord + vec2(0.0, texel.y *  2.0));\n  color +=  1.0/64.0 * texture2D(image, vTexCoord + vec2(0.0, texel.y *  3.0));\n  gl_FragColor = color;\n}\n\n#endif\n';});

define('pex/fx/Blur7',['pex/fx/FXStage', 'lib/text!pex/fx/Blur7H.glsl', 'lib/text!pex/fx/Blur7V.glsl', 'pex/geom/Vec2'],
function(FXStage, Blur7HGLSL, Blur7VGLSL, Vec2) {
  FXStage.prototype.blur7 = function(options) {
    options = options || {};

    var outputSize = this.getOutputSize(options.width, options.height);

    var rth = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    var rtv = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    var source = this.getSourceTexture();

    var programH = this.getShader(Blur7HGLSL);
    programH.use();
    programH.uniforms.imageSize(Vec2.create(source.width, source.height));
    rth.bindAndClear();
    source.bind();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, source, programH);
    rth.unbind();

    var programV = this.getShader(Blur7VGLSL);
    programV.use();
    programV.uniforms.imageSize(Vec2.create(source.width, source.height));
    rtv.bindAndClear();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, rth.getColorAttachement(0), programV);
    rtv.unbind();

    return this.asFXStage(rtv, 'blur7');
  }
});
define('lib/text!pex/fx/Add.glsl',[],function () { return '#ifdef VERT\n\nattribute vec2 position;\nattribute vec2 texCoord;\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_Position = vec4(position, 0.0, 1.0);\n  vTexCoord = texCoord;\n}\n\n#endif\n\n#ifdef FRAG\n\nvarying vec2 vTexCoord;\nuniform sampler2D tex0;\nuniform sampler2D tex1;\nuniform float scale;\n\nvoid main() {\n  vec4 color = texture2D(tex0, vTexCoord).rgba;\n  vec4 color2 = texture2D(tex1, vTexCoord).rgba;\n\n  //color += scale * color2 * color2.a;\n\n  gl_FragColor = 1.0 - (1.0 - color) * (1.0 - color2 * scale);\n\n  //gl_FragColor.rgba = color + scale * color2;\n  //gl_FragColor.a = 1.0;\n}\n\n#endif';});

define('pex/fx/Add',['pex/fx/FXStage', 'lib/text!pex/fx/Add.glsl'], function(FXStage, AddGLSL) {
  FXStage.prototype.add = function(source2, options) {
    options = options || {};
    scale = (options.scale !== undefined) ? options.scale : 1;

    var outputSize = this.getOutputSize(options.width, options.height);
    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);

    rt.bind();

    this.getSourceTexture().bind(0);
    this.getSourceTexture(source2).bind(1);

    var program = this.getShader(AddGLSL);
    program.use();
    program.uniforms.tex0( 0 );
    program.uniforms.tex1( 1 );
    program.uniforms.scale( scale );
    this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);

    rt.unbind();

    return this.asFXStage(rt, 'add');
  }
});
define('lib/text!pex/fx/Threshold.glsl',[],function () { return '#ifdef VERT\n\nattribute vec2 position;\nattribute vec2 texCoord;\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_Position = vec4(position, 0.0, 1.0);\n  vTexCoord = texCoord;\n}\n\n#endif\n\n#ifdef FRAG\n\nvarying vec2 vTexCoord;\nuniform sampler2D tex0;\nuniform float threshold;\n\nvoid main() {\n  vec3 color = texture2D(tex0, vTexCoord).rgb;\n  float luma = dot(color, vec3(0.299, 0.587, 0.114));\n\n  color = (luma > threshold) ? color : vec3(0.0);\n\n  gl_FragColor.rgb = color;\n  gl_FragColor.a = 1.0;\n}\n\n#endif';});

define('pex/fx/Threshold',['pex/fx/FXStage', 'lib/text!pex/fx/Threshold.glsl'], function(FXStage, ThresholdGLSL) {
  FXStage.prototype.threshold = function(options) {
    options = options || {};
    threshold = (options.threshold !== undefined) ? options.threshold : 0.5;

    var outputSize = this.getOutputSize(options.width, options.height);
    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    rt.bind();

    this.getSourceTexture().bind();
    var program = this.getShader(ThresholdGLSL);
    program.use();
    program.uniforms.threshold( threshold );
    this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
    rt.unbind();

    return this.asFXStage(rt, 'threshold');
  }
});
define('pex/fx/Image',['pex/fx/FXStage'], function(FXStage) {
  FXStage.prototype.image = function(path, options) {
    options = options || {};

    var outputSize = this.getOutputSize(options.width, options.height);
    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);

    rt.bind();

    var image = this.getImage(path);

    image.bind();
    this.drawFullScreenQuad(outputSize.width, outputSize.height);

    rt.unbind();

    return this.asFXStage(rt, 'image');
  };
});
define('lib/text!pex/fx/Mult.glsl',[],function () { return '#ifdef VERT\n\nattribute vec2 position;\nattribute vec2 texCoord;\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_Position = vec4(position, 0.0, 1.0);\n  vTexCoord = texCoord;\n}\n\n#endif\n\n#ifdef FRAG\n\nvarying vec2 vTexCoord;\nuniform sampler2D tex0;\nuniform sampler2D tex1;\n\nvoid main() {\n  vec4 color = texture2D(tex0, vTexCoord);\n  vec4 color2 = texture2D(tex1, vTexCoord);\n\n  gl_FragColor = color * color2;\n}\n\n#endif';});

define('pex/fx/Mult',['pex/fx/FXStage', 'lib/text!pex/fx/Mult.glsl'], function(FXStage, MultGLSL) {
  FXStage.prototype.mult = function(source2, options) {
    options = options || {};

    var outputSize = this.getOutputSize(options.width, options.height);
    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);

    rt.bind();

    this.getSourceTexture().bind(0);
    this.getSourceTexture(source2).bind(1);
    var program = this.getShader(MultGLSL);
    program.use();
    program.uniforms.tex0( 0 );
    program.uniforms.tex1( 1 );
    this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);

    rt.unbind();

    return this.asFXStage(rt, 'mult');
  }
});
define('lib/text!pex/fx/SSAO.glsl',[],function () { return '//based on http://blenderartists.org/forum/showthread.php?184102-nicer-and-faster-SSAO and http://www.pasteall.org/12299\n#ifdef VERT\n\nattribute vec2 position;\nattribute vec2 texCoord;\n\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_Position = vec4(position, 0.0, 1.0);\n  vTexCoord = texCoord;\n}\n\n#endif\n\n#ifdef FRAG\n\n#define PI    3.14159265\n\nvarying vec2 vTexCoord;\n\nuniform sampler2D depthTex;\nuniform vec2 textureSize;\nuniform float near;\nuniform float far;\n\nconst int samples = 5;\nconst int rings = 3;\n\n\nvec2 rand(vec2 coord)\n{\n  float noiseX = (fract(sin(dot(coord, vec2(12.9898,78.233))) * 43758.5453));\n  float noiseY = (fract(sin(dot(coord, vec2(12.9898,78.233) * 2.0)) * 43758.5453));\n  return vec2(noiseX,noiseY) * 0.004;\n}\n\nfloat unpackDepth(const in vec4 rgba_depth) {\n  const vec4 bit_shift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);\n  float depth = dot(rgba_depth, bit_shift);\n  return depth;\n}\n\nfloat getDepth(vec2 coord) {\n  return unpackDepth(texture2D(depthTex, coord.xy));\n}\n\nfloat readDepth(vec2 coord) {\n  return (getDepth(coord) * far - near)/(far - near);\n}\n\nfloat compareDepths( in float depth1, in float depth2 )\n{\n  float aoCap = 1.0;\n  float aoMultiplier = 100.0;\n  float depthTolerance = 0.0001;\n  float aorange = 1.0;// units in space the AO effect extends to (this gets divided by the camera far range\n  float diff = sqrt(clamp(1.0-(depth1-depth2) / (aorange/(far-near)),0.0,1.0));\n  float ao = min(aoCap,max(0.0,depth1-depth2-depthTolerance) * aoMultiplier) * diff;\n  return ao;\n}\n\nvoid main() {\n  vec2 texCoord = vec2(gl_FragCoord.x / textureSize.x, gl_FragCoord.y / textureSize.y);\n  float depth = readDepth(texCoord);\n\n  //gl_FragColor = vec4(depth, depth ,depth, 1.0);\n  //return;\n\n  float d;\n\n  float aspect = textureSize.x / textureSize.y;\n  vec2 noise = rand(vTexCoord);\n\n  float w = (1.0 / textureSize.x)/clamp(depth,0.05,1.0)+(noise.x*(1.0-noise.x));\n  float h = (1.0 / textureSize.y)/clamp(depth,0.05,1.0)+(noise.y*(1.0-noise.y));\n\n  float pw;\n  float ph;\n\n  float ao;\n  float s;\n  float fade = 1.0;\n\n  for (int i = 0 ; i < rings; i += 1)\n  {\n    fade *= 0.5;\n    for (int j = 0 ; j < samples*rings; j += 1)\n    {\n      if (j >= samples*i) break;\n      float step = PI * 2.0 / (float(samples) * float(i));\n      pw = (cos(float(j)*step) * float(i) * 0.5);\n      ph = (sin(float(j)*step) * float(i) * 0.5) * aspect;\n      d = readDepth( vec2(texCoord.s + pw * w,texCoord.t + ph * h));\n      ao += compareDepths(depth,d) * fade;\n      s += 1.0 * fade;\n    }\n  }\n\n  ao /= s;\n  ao *= 1.5;\n  ao = 1.0 - ao;\n\n  if (depth > 0.99) ao += 0.5;\n\n  vec3 black = vec3(0.0, 0.0, 0.0);\n  vec3 treshold = vec3(0.2, 0.2, 0.2);\n\n  gl_FragColor = vec4(texCoord, 0.0, 1.0);\n  //gl_FragColor = vec4(getDepth(texCoord), 0.0, 0.0, 1.0);\n  gl_FragColor = vec4(ao, ao, ao, 1.0);\n}\n\n#endif';});

define('pex/fx/SSAO',['pex/fx/FXStage', 'lib/text!pex/fx/SSAO.glsl', 'pex/geom/Vec2'], function(FXStage, SSAOGLSL, Vec2) {
  FXStage.prototype.ssao = function(options) {
    options = options || {};

    var outputSize = this.getOutputSize(options.width, options.height);

    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    var depthSource = this.getSourceTexture(options.depthSource);

    var program = this.getShader(SSAOGLSL);
    program.use();
    program.uniforms.textureSize(Vec2.create(depthSource.width, depthSource.height));
    program.uniforms.depthTex(0);
    program.uniforms.near(options.near || 0.1);
    program.uniforms.far(options.far || 100);
    rt.bind();
    depthSource.bind();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
    rt.unbind();

    return this.asFXStage(rt, 'ssao');
  };
});
define('lib/text!pex/fx/FXAA.glsl',[],function () { return '#ifdef VERT\n\nfloat FXAA_SUBPIX_SHIFT = 1.0/4.0;\n\nuniform float rtWidth;\nuniform float rtHeight;\nattribute vec2 position;\nattribute vec2 texCoord;\nvarying vec4 posPos;\n\nvoid main() {\n  gl_Position = vec4(position, 0.0, 1.0);\n\n  vec2 rcpFrame = vec2(1.0/rtWidth, 1.0/rtHeight);\n  posPos.xy = texCoord.xy;\n  posPos.zw = texCoord.xy - (rcpFrame * (0.5 + FXAA_SUBPIX_SHIFT));\n}\n\n#endif\n\n#ifdef FRAG\n\n#define FXAA_REDUCE_MIN   (1.0/ 128.0)\n#define FXAA_REDUCE_MUL   (1.0 / 8.0)\n#define FXAA_SPAN_MAX     8.0\n\nuniform sampler2D tex0;\nvarying vec4 posPos;\nuniform float rtWidth;\nuniform float rtHeight;\n\n\nvec4 applyFXAA(vec2 fragCoord, sampler2D tex)\n{\n    vec4 color;\n    vec2 inverseVP = vec2(1.0 / rtWidth, 1.0 / rtHeight);\n    vec3 rgbNW = texture2D(tex, (fragCoord + vec2(-1.0, -1.0)) * inverseVP).xyz;\n    vec3 rgbNE = texture2D(tex, (fragCoord + vec2(1.0, -1.0)) * inverseVP).xyz;\n    vec3 rgbSW = texture2D(tex, (fragCoord + vec2(-1.0, 1.0)) * inverseVP).xyz;\n    vec3 rgbSE = texture2D(tex, (fragCoord + vec2(1.0, 1.0)) * inverseVP).xyz;\n    vec3 rgbM  = texture2D(tex, fragCoord  * inverseVP).xyz;\n    vec3 luma = vec3(0.299, 0.587, 0.114);\n    float lumaNW = dot(rgbNW, luma);\n    float lumaNE = dot(rgbNE, luma);\n    float lumaSW = dot(rgbSW, luma);\n    float lumaSE = dot(rgbSE, luma);\n    float lumaM  = dot(rgbM,  luma);\n    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\n    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\n\n    //return texture2D(tex, fragCoord);\n    //return vec4(fragCoord, 0.0, 1.0);\n    //return vec4(rgbM, 1.0);\n\n    vec2 dir;\n    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\n    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\n\n    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *\n                          (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);\n\n    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\n    dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),\n              max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),\n              dir * rcpDirMin)) * inverseVP;\n\n    vec3 rgbA = 0.5 * (\n        texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +\n        texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);\n    vec3 rgbB = rgbA * 0.5 + 0.25 * (\n        texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +\n        texture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);\n\n    float lumaB = dot(rgbB, luma);\n    if ((lumaB < lumaMin) || (lumaB > lumaMax))\n        color = vec4(rgbA, 1.0);\n    else\n        color = vec4(rgbB, 1.0);\n    return color;\n}\n\nvoid main() {\n  gl_FragColor = applyFXAA(posPos.xy * vec2(rtWidth, rtHeight), tex0);\n}\n\n//#version 120\n/*\nuniform sampler2D tex0;\nvarying vec4 posPos;\nuniform float rtWidth;\nuniform float rtHeight;\nfloat FXAA_SPAN_MAX = 8.0;\nfloat FXAA_REDUCE_MUL = 1.0/8.0;\n\n#define FxaaInt2 ivec2\n#define FxaaFloat2 vec2\n#define FxaaTexLod0(t, p) texture2DLod(t, p, 0.0)\n#define FxaaTexOff(t, p, o, r) texture2DLodOffset(t, p, 0.0, o)\n\nvec3 FxaaPixelShader(\n  vec4 posPos, // Output of FxaaVertexShader interpolated across screen.\n  sampler2D tex, // Input texture.\n  vec2 rcpFrame) // Constant {1.0/frameWidth, 1.0/frameHeight}.\n{\n//---------------------------------------------------------\n    #define FXAA_REDUCE_MIN   (1.0/128.0)\n    //#define FXAA_REDUCE_MUL   (1.0/8.0)\n    //#define FXAA_SPAN_MAX     8.0\n//---------------------------------------------------------\n    vec3 rgbNW = FxaaTexLod0(tex, posPos.zw).xyz;\n    vec3 rgbNE = FxaaTexOff(tex, posPos.zw, FxaaInt2(1,0), rcpFrame.xy).xyz;\n    vec3 rgbSW = FxaaTexOff(tex, posPos.zw, FxaaInt2(0,1), rcpFrame.xy).xyz;\n    vec3 rgbSE = FxaaTexOff(tex, posPos.zw, FxaaInt2(1,1), rcpFrame.xy).xyz;\n    vec3 rgbM  = FxaaTexLod0(tex, posPos.xy).xyz;\n//---------------------------------------------------------\n    vec3 luma = vec3(0.299, 0.587, 0.114);\n    float lumaNW = dot(rgbNW, luma);\n    float lumaNE = dot(rgbNE, luma);\n    float lumaSW = dot(rgbSW, luma);\n    float lumaSE = dot(rgbSE, luma);\n    float lumaM  = dot(rgbM,  luma);\n/*---------------------------------------------------------\n    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\n    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\n/*---------------------------------------------------------\n    vec2 dir;\n    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\n    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\n/*---------------------------------------------------------\n    float dirReduce = max(\n        (lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL),\n        FXAA_REDUCE_MIN);\n    float rcpDirMin = 1.0/(min(abs(dir.x), abs(dir.y)) + dirReduce);\n    dir = min(FxaaFloat2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),\n          max(FxaaFloat2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),\n          dir * rcpDirMin)) * rcpFrame.xy;\n/*--------------------------------------------------------\n    vec3 rgbA = (1.0/2.0) * (\n        FxaaTexLod0(tex, posPos.xy + dir * (1.0/3.0 - 0.5)).xyz +\n        FxaaTexLod0(tex, posPos.xy + dir * (2.0/3.0 - 0.5)).xyz);\n    vec3 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (\n        FxaaTexLod0(tex, posPos.xy + dir * (0.0/3.0 - 0.5)).xyz +\n        FxaaTexLod0(tex, posPos.xy + dir * (3.0/3.0 - 0.5)).xyz);\n    float lumaB = dot(rgbB, luma);\n    if((lumaB < lumaMin) || (lumaB > lumaMax)) return rgbA;\n    return rgbB; }\n\nvec4 PostFX(sampler2D tex, vec2 uv, float time)\n{\n  vec4 c = vec4(0.0);\n  vec2 rcpFrame = vec2(1.0/rt_w, 1.0/rt_h);\n  c.rgb = FxaaPixelShader(posPos, tex, rcpFrame);\n  //c.rgb = 1.0 - texture2D(tex, posPos.xy).rgb;\n  c.a = 1.0;\n  return c;\n}\n\nvoid main()\n{\n  vec2 uv = posPos.xy;\n  gl_FragColor = PostFX(tex0, uv, 0.0);\n}\n\n*/\n\n#endif';});

define('pex/fx/FXAA',['pex/fx/FXStage', 'lib/text!pex/fx/FXAA.glsl'], function(FXStage, FXAAGLSL) {
  FXStage.prototype.fxaa = function(options) {
    options = options || {};

    var outputSize = this.getOutputSize(options.width, options.height);
    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    rt.bind();

    var source = this.getSourceTexture();
    source.bind();
    var program = this.getShader(FXAAGLSL);
    program.use();
    program.uniforms.rtWidth(source.width);
    program.uniforms.rtHeight(source.height);
    this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
    rt.unbind();

    return this.asFXStage(rt, 'fxaa');
  }
});
define('pex/fx',
  [
    'pex/fx/FXStage',
    'pex/fx/Render',
    'pex/fx/Blit',
    'pex/fx/Downsample2',
    'pex/fx/Downsample4',
    'pex/fx/Blur3',
    'pex/fx/Blur5',
    'pex/fx/Blur7',
    'pex/fx/Add',
    'pex/fx/Threshold',
    'pex/fx/Image',
    'pex/fx/Mult',
    'pex/fx/SSAO',
    'pex/fx/FXAA'
  ],
  function(FXStage, Render, Blit, Downsample2, Downsample4, Blur3, Blur5, Blur7, Add, Threshold, Image, Mult, SSAO, FXAO) {
    var globalFx;
    return function() {
      if (!globalFx) {
        globalFx = new FXStage();
      }
      globalFx.reset();
      return globalFx;
    }
  }
);

  define('pex/gui/SkiaRenderer',['pex/sys/Node', 'pex/gl/Context', 'pex/gl/Texture2D'], function(Node, Context, Texture2D) {
  var plask = Node.plask
  function SkiaRenderer(width, height) {
    this.gl = Context.currentContext.gl;
    this.tex = Texture2D.create(width, height);
    this.canvas = new plask.SkCanvas.create(width, height);

    this.fontPaint = new plask.SkPaint();
    this.fontPaint.setStyle(plask.SkPaint.kFillStyle);
    this.fontPaint.setColor(255, 255, 255, 255);
    this.fontPaint.setTextSize(10);
    this.fontPaint.setFontFamily('Monaco');
    this.fontPaint.setStrokeWidth(0);

    this.fontHighlightPaint = new plask.SkPaint();
    this.fontHighlightPaint.setStyle(plask.SkPaint.kFillStyle);
    this.fontHighlightPaint.setColor(100, 100, 100, 255);
    this.fontHighlightPaint.setTextSize(10);
    this.fontHighlightPaint.setFontFamily('Monaco');
    this.fontHighlightPaint.setStrokeWidth(0);

    this.panelBgPaint = new plask.SkPaint();
    this.panelBgPaint.setStyle(plask.SkPaint.kFillStyle);
    this.panelBgPaint.setColor(0, 0, 0, 150);

    this.controlBgPaint = new plask.SkPaint();
    this.controlBgPaint.setStyle(plask.SkPaint.kFillStyle);
    this.controlBgPaint.setColor(150, 150, 150, 255);

    this.controlHighlightPaint = new plask.SkPaint();
    this.controlHighlightPaint.setStyle(plask.SkPaint.kFillStyle);
    this.controlHighlightPaint.setColor(255, 255, 0, 255);

    this.controlFeaturePaint = new plask.SkPaint();
    this.controlFeaturePaint.setStyle(plask.SkPaint.kFillStyle);
    this.controlFeaturePaint.setColor(255, 255, 255, 255);
  }

  SkiaRenderer.prototype.isAnyItemDirty = function(items) {
    var dirty = false;
    items.forEach(function(item) {
      if (item.dirty) {
        item.dirty = false;
        dirty = true;
      }
    });
    return dirty;
  };

  SkiaRenderer.prototype.draw = function(items) {
    if (!this.isAnyItemDirty(items)) {
      return;
    }

    var canvas = this.canvas;

    canvas.drawColor(0, 0, 0, 0, plask.SkPaint.kClearMode); //transparent

    var dy = 10;
    var dx = 10;
    var w = 160;
    for(var i=0; i<items.length; i++) {
      var e = items[i];

      if (e.px && e.px) {
        dx = e.px;
        dy = e.py;
      }
      var eh = 20;

      if (e.type == "slider") eh = 34;
      if (e.type == "multislider") eh = 18 + e.getValue().length * 20;
      if (e.type == "button") eh = 24;
      if (e.type == "texture2D") eh = 24 + e.texture.height * w / e.texture.width;
      if (e.type == "radiolist") eh = 18 + e.items.length * 20;

      canvas.drawRect(this.panelBgPaint, dx, dy, dx + w, dy + eh - 2);

      if (e.type == "slider") {
        var value = e.getValue();
        canvas.drawRect(this.controlBgPaint, dx + 3, dy + 18, dx + w - 3, dy + eh - 5);
        canvas.drawRect(this.controlHighlightPaint, dx + 3, dy + 18, dx + 3 + (w - 6)*e.getNormalizedValue(), dy + eh - 5);
        e.activeArea.set(dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18);
        canvas.drawText(this.fontPaint, items[i].title + " : " + e.getStrValue(), dx + 3, dy + 13);
      }
      else if (e.type == "multislider") {
        for(var j=0; j<e.getValue().length; j++) {
          canvas.drawRect(this.controlBgPaint, dx + 3, dy + 18 + (j)*20, dx + w - 3, dy + 18 + (j+1)*20 - 6);
          canvas.drawRect(this.controlHighlightPaint, dx + 3, dy + 18 + (j)*20, dx + 3 + (w - 6)*e.getNormalizedValue(j), dy + 18 + (j+1)*20 - 6);
        }
        canvas.drawText(this.fontPaint, items[i].title + " : " + e.getStrValue(), dx + 3, dy + 13);
        e.activeArea.set(dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18);
      }
      else if (e.type == "button") {
        var btnColor = e.active ? this.controlHighlightPaint : this.controlBgPaint;
        var btnFont = e.active ? this.fontHighlightPaint : this.fontPaint;
        canvas.drawRect(btnColor, dx + 3, dy + 3, dx + w - 3, dy + eh - 5);
        e.activeArea.set(dx + 3, dy + 3, w - 3 - 3, eh - 5);
        if (e.options.color) {
          var c = e.options.color;
          this.controlFeaturePaint.setColor(255 * c.x, 255 * c.y, 255 * c.z, 255);
          canvas.drawRect(this.controlFeaturePaint,  dx + w - 8, dy + 3, dx + w - 3, dy + eh - 5);
        }
        canvas.drawText(btnFont, items[i].title, dx + 5, dy + 15);
      }
      else if (e.type == "toggle") {
        var on = e.contextObject[e.attributeName];
        var toggleColor = on ? this.controlHighlightPaint : this.controlBgPaint;
        canvas.drawRect(toggleColor, dx + 3, dy + 3, dx + eh - 5, dy + eh - 5);
        e.activeArea.set(dx + 3, dy + 3, eh - 5, eh - 5);
        canvas.drawText(this.fontPaint, items[i].title, dx + 5 + eh - 5, dy + 13);
      }
      else if (e.type == "radiolist") {
        canvas.drawText(this.fontPaint, e.title, dx + 3, dy + 13);
        var itemColor = this.controlBgPaint;
        var itemHeight = 20;
        for(var j=0; j<e.items.length; j++) {
          var item = e.items[j];
          var on = (e.contextObject[e.attributeName] == item.value);
          var itemColor = on ? this.controlHighlightPaint : this.controlBgPaint;
          canvas.drawRect(itemColor, dx + 3, 18 + j*itemHeight + dy + 3, dx + itemHeight - 5, itemHeight + j*itemHeight + dy + 18 - 5);
          canvas.drawText(this.fontPaint, item.name, dx + 5 + itemHeight - 5, 18 + j*itemHeight + dy + 13);
        }
        e.activeArea.set(dx + 3, 18 + dy + 3, itemHeight - 5, e.items.length * itemHeight - 5);
      }
      else if (e.type == "texture2D") {
        canvas.drawText(this.fontPaint, e.title, dx + 3, dy + 13);
        e.activeArea.set(dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18);
      }
      else {
        canvas.drawText(this.fontPaint, items[i].title, dx + 3, dy + 13);
      }
      dy += eh;
    }

    this.updateTexture();
  }

  SkiaRenderer.prototype.getTexture = function() {
    return this.tex;
  }

  SkiaRenderer.prototype.updateTexture = function() {
    var gl = this.gl;
    this.tex.bind();
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texImage2DSkCanvas(gl.TEXTURE_2D, 0, this.canvas);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }


  return SkiaRenderer;
});

define('pex/gui/GUI',[
  'pex/gl/Context',
  'pex/gl/ScreenImage',
  'pex/utils/Time',
  'pex/gui/SkiaRenderer',
  //'pex/gui/HTMLCanvasRenderer',
  //'pex/gui/NodeCanvasRenderer',
  'pex/geom/Rect',
  'pex/sys/IO',
  'pex/sys/Platform',
  'pex/geom/Vec2'
],
function(Context, ScreenImage, Time, SkiaRenderer, Rect, IO, Platform, Vec2) {
  
  function GUIControl(o) {
    for(var i in o) {
      this[i] = o[i];
    }
  }

  GUIControl.prototype.setPosition = function(x, y) {
    this.px = x;
    this.py = y;
  }

  GUIControl.prototype.getNormalizedValue = function(idx) {
    if (!this.contextObject) return 0;

    var val = this.contextObject[this.attributeName];

    var options = this.options;
    if (options && options.min !== undefined && options.max !== undefined) {
      if (this.type == 'multislider') {
        val = (val[idx] - options.min) / (options.max - options.min);
      }
      else {
        val = (val - options.min) / (options.max - options.min);
      }
    }
    return val;
  }

  GUIControl.prototype.setNormalizedValue = function(val, idx) {
    if (!this.contextObject) return;

    var options = this.options;
    if (options && options.min !== undefined && options.max !== undefined) {
      if (this.type == 'multislider') {
        var a = this.contextObject[this.attributeName];
        if (idx >= a.length) {
          return;
        }
        a[idx] = options.min + val * (options.max - options.min);
        val = a;
      }
      else {
        val = options.min + val * (options.max - options.min);
      }
    }
    this.contextObject[this.attributeName] = val;
  }

  GUIControl.prototype.getValue = function() {
    if (this.type == 'slider') {
      return this.contextObject[this.attributeName];
    }
    if (this.type == 'multislider') {
      return this.contextObject[this.attributeName];
    }
    else if (this.type == 'toggle') {
      return this.contextObject[this.attributeName];
    }
    else return 0;
  }

  GUIControl.prototype.getStrValue = function() {
    if (this.type == 'slider') {
      var str = '' + this.contextObject[this.attributeName];
      var dotPos = str.indexOf('.') + 1;
      while(str.charAt(dotPos) == '0') {
        dotPos++;
      }
      return str.substr(0, dotPos+2);
    }
    else if (this.type == 'toggle') {
      return this.contextObject[this.attributeName];
    }
    else return '';
  }

  function GUI(window, x, y) {
    this.gl = Context.currentContext.gl;
    this.window = window;
    this.x = (x == undefined) ? 0 : x;
    this.y = (y == undefined) ? 0 : y;
    this.mousePos = Vec2.create();

    if (Platform.isPlask) {
      this.renderer = new SkiaRenderer(window.width, window.height);
    }
    //else if (IO.Image) {
      //this.renderer = new NodeCanvasRenderer(window.width, window.height);
    //}
    //else {
      //this.renderer = new HTMLCanvasRenderer(window.width, window.height);
    //}
    this.screenBounds = new Rect(this.x, this.y, window.width, window.height);
    this.screenImage = new ScreenImage(this.renderer.getTexture(), this.x, this.y, window.width, window.height, window.width, window.height);

    this.items = [];

    this.bindEventListeners(window);
  }

  GUI.prototype.bindEventListeners = function(window) {
    var self = this;
    window.on('leftMouseDown', function(e) {
      self.onMouseDown(e);
    });

    window.on('mouseDragged', function(e) {
      self.onMouseDrag(e);
    });

    window.on('leftMouseUp', function(e) {
      self.onMouseUp(e);
    });
  }

  GUI.prototype.onMouseDown = function(e) {
    this.activeControl = null;
    this.mousePos.set(e.x - this.x, e.y - this.y);
    for(var i=0; i<this.items.length; i++) {
      if (this.items[i].activeArea.contains(this.mousePos)) {
        this.activeControl = this.items[i];
        this.activeControl.active = true;
        this.activeControl.dirty = true;
        if (this.activeControl.type == 'button') {
          this.activeControl.contextObject[this.activeControl.methodName]();
        }
        else if (this.activeControl.type == 'toggle') {
          this.activeControl.contextObject[this.activeControl.attributeName] = !this.activeControl.contextObject[this.activeControl.attributeName];
          if (this.activeControl.onchange) {
            this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
          }
        }
        else if (this.activeControl.type == 'radiolist') {
          var hitY = this.mousePos.y - this.activeControl.activeArea.y;
          var hitItemIndex = Math.floor(this.activeControl.items.length * hitY/this.activeControl.activeArea.height);
          if (hitItemIndex < 0) continue;
          if (hitItemIndex >= this.activeControl.items.length) continue;
          this.activeControl.contextObject[this.activeControl.attributeName] = this.activeControl.items[hitItemIndex].value;
          if (this.activeControl.onchange) {
            this.activeControl.onchange(this.activeControl.items[hitItemIndex].value);
          }
        }
        e.handled = true;
        this.onMouseDrag(e);
        break;
      }
    }
  }

  GUI.prototype.onMouseDrag = function(e) {
    if (this.activeControl) {
      var aa = this.activeControl.activeArea;
      if (this.activeControl.type == 'slider') {
        var val = (e.x - aa.x) / aa.width;
        val = Math.max(0, Math.min(val, 1));
        this.activeControl.setNormalizedValue(val);
        if (this.activeControl.onchange) {
          this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
        }
        this.activeControl.dirty = true;
      }
      else if (this.activeControl.type == 'multislider') {
        var val = (e.x - aa.x) / aa.width;
        val = Math.max(0, Math.min(val, 1));
        var idx = Math.floor(this.activeControl.getValue().length * (e.y - aa.y) / aa.height);
        this.activeControl.setNormalizedValue(val, idx);
        if (this.activeControl.onchange) {
          this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
        }
        this.activeControl.dirty = true;
      }
      e.handled = true;
    }
  }

  GUI.prototype.onMouseUp = function(e) {
    if (this.activeControl) {
      this.activeControl.active = false;
      this.activeControl.dirty = true;
      this.activeControl = null;
    }
  }

  GUI.prototype.addLabel = function(title) {
    var ctrl = new GUIControl(
      { type: 'label', title: title, dirty : true,activeArea: new Rect(0, 0, 0, 0), setTitle: function(title) { this.title = title; this.dirty = true; } }
    );
    this.items.push(ctrl);
    return ctrl;
  }

  GUI.prototype.addParam = function(title, contextObject, attributeName, options, onchange) {
    options = options || {};
    if (contextObject[attributeName] instanceof Array) {
      var ctrl = new GUIControl(
        {
          type: 'multislider',
          title: title,
          contextObject: contextObject,
          attributeName: attributeName,
          activeArea: new Rect(0, 0, 0, 0),
          options: options,
          onchange : onchange,
          dirty : true
        }
      );
      this.items.push(ctrl);
      return ctrl;
    }
    else if (contextObject[attributeName] === false || contextObject[attributeName] === true) {
      var ctrl = new GUIControl(
        {
          type: 'toggle',
          title: title,
          contextObject: contextObject,
          attributeName: attributeName,
          activeArea: new Rect(0, 0, 0, 0),
          options: options,
          onchange : onchange,
          dirty : true
        }
      );
      this.items.push(ctrl);
      return ctrl;
    }
    else {
      var ctrl = new GUIControl(
        {
          type: 'slider',
          title: title,
          contextObject: contextObject,
          attributeName: attributeName,
          activeArea: new Rect(0, 0, 0, 0),
          options: options,
          onchange : onchange,
          dirty : true
        }
      );
      this.items.push(ctrl);
      return ctrl;
    }
  }

  GUI.prototype.addButton = function(title, contextObject, methodName, options) {
    var ctrl = new GUIControl(
      {
        type: 'button',
        title: title,
        contextObject: contextObject,
        methodName: methodName,
        activeArea: new Rect(0, 0, 0, 0),
        dirty : true,
        options : options || {}
      }
    );
    this.items.push(ctrl);
    return ctrl;
  }

  GUI.prototype.addRadioList = function(title, contextObject, attributeName, items, onchange) {
    var ctrl = new GUIControl(
      {
        type: 'radiolist',
        title: title,
        contextObject: contextObject,
        attributeName: attributeName,
        activeArea: new Rect(0, 0, 0, 0),
        items: items,
        onchange : onchange,
        dirty : true
      }
    );
    this.items.push(ctrl);
    return ctrl;
  }

  GUI.prototype.addTexture2D = function(title, texture) {
    var ctrl = new GUIControl(
      {
        type: 'texture2D',
        title: title,
        texture: texture,
        activeArea: new Rect(0, 0, 0, 0),
        dirty : true
      }
    );
    this.items.push(ctrl);
    return ctrl;
  }

  GUI.prototype.dispose = function() {
    //TODO: delete texture object
  }

  var frame = 0;
  GUI.prototype.draw = function() {
    if (this.items.length == 0) {
      return;
    }
    this.renderer.draw(this.items);
    //if (!IO.Image)
    var gl = Context.currentContext.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.screenImage.draw(this.renderer.getTexture());
    gl.disable(gl.BLEND);
    //this.drawTextures();
  }

  //GUI.prototype.drawTextures = function() {
  //  for(var i=0; i<this.items.length; i++) {
  //    var item = this.items[i];
  //    if (item.type == 'texture2D') {
  //      if (item.texture.bind) item.texture.bind();
  //      else {
  //        this.gl.bindTexture(item.texture.target, item.texture.handle);
  //      }
  //      var bounds;
  //      if (item.texture.flipped) {
  //        bounds  = new Rect(item.activeArea.x, this.window.height - item.activeArea.y, item.activeArea.width, -item.activeArea.height);
  //      }
  //      else {
  //        bounds = new Rect(item.activeArea.x, this.window.height - item.activeArea.y - item.activeArea.height, item.activeArea.width, item.activeArea.height);
  //      }
  //      this.screenImage.setBounds(bounds);
  //      this.screenImage.setTexture(null);
  //      this.screenImage.draw();
  //    }
  //  }
  //  this.screenImage.setBounds(this.screenBounds);
  //  this.screenImage.setTexture(this.renderer.getTexture());
  //}

  GUI.prototype.serialize = function() {
    var data = {};
    this.items.forEach(function(item, i) {
      data[item.title] = item.getNormalizedValue();
    })
    return data;
  }

  GUI.prototype.deserialize = function(data) {
    this.items.forEach(function(item, i) {
      if (!(data[item.title] == undefined)) {
        item.setNormalizedValue(data[item.title]);
      }
    })
  }

  GUI.prototype.save = function(path) {
    var data = this.serialize();
    IO.saveTextFile(path, JSON.stringify(data));
  }

  GUI.prototype.load = function(path) {
    var self = this;
    IO.loadTextFile(path, function(dataStr) {
      var data = JSON.parse(dataStr);
      self.deserialize(data);
    })
  }

  GUI.ScreenImage = ScreenImage;

  return GUI;
});

//Module wrapper for gl classes.
define('pex/gui',
  [
    'pex/gui/GUI'
  ],
  function(GUI) {
    return {
      GUI : GUI
    };
  }
);
//Module wrapper for color classes.
define('pex/color',
  [
    'pex/color/Color'
  ],
  function(Color) {
    return {
      Color : Color
    };
  }
);
// Generated by CoffeeScript 1.6.2
define('pex',['require','pex/geom','pex/utils','pex/sys','pex/gl','pex/materials','pex/scene','pex/fx','pex/gui','pex/color'],function(require) {
  var color, fx, geom, gl, gui, materials, scene, sys, utils;

  geom = require('pex/geom');
  utils = require('pex/utils');
  sys = require('pex/sys');
  gl = require('pex/gl');
  materials = require('pex/materials');
  scene = require('pex/scene');
  fx = require('pex/fx');
  gui = require('pex/gui');
  color = require('pex/color');
  return {
    geom: geom,
    utils: utils,
    sys: sys,
    gl: gl,
    materials: materials,
    scene: scene,
    fx: fx,
    require: sys.Require,
    gui: gui,
    color: color
  };
});

require(['pex'], function(pex) {
  if (typeof(exports) !== 'undefined') {
    for(var moduleName in pex) {
      exports[moduleName] = pex[moduleName];
    }
  }
  if (typeof(window) !== 'undefined') window['pex'] = pex;
}, 'export', true);

define("../tools/include/export", function(){});

require(["pex"]);
})(
    (typeof require !== "undefined") ? require : null,
    (typeof requirejs !== "undefined") ? requirejs : null,
    (typeof define !== "undefined") ? define : null
);