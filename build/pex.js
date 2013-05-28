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

/**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.1.0
 */

/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */


(function() {
  

  var shim = {};
  if(typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    shim.exports = {};
    define('lib/gl-matrix',[],function() {
      return shim.exports;
    });
  }
  else if (typeof(exports) == 'object') {
    // gl-matrix lives in commonjs, define its namespaces in exports
    shim.exports = exports;
  }
  else {
    // gl-matrix lives in a browser, define its namespaces in global
    shim.exports = window;
  }

  (function(exports) {
    /* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */


if(!GLMAT_EPSILON) {
    var GLMAT_EPSILON = 0.000001;
}

if(!GLMAT_ARRAY_TYPE) {
    var GLMAT_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
}

/**
 * @class Common utilities
 * @name glMatrix
 */
var glMatrix = {};

/**
 * Sets the type of array used when creating new vectors and matricies
 *
 * @param {Type} type Array type, such as Float32Array or Array
 */
glMatrix.setMatrixArrayType = function(type) {
    GLMAT_ARRAY_TYPE = type;
}

if(typeof(exports) !== 'undefined') {
    exports.glMatrix = glMatrix;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2 Dimensional Vector
 * @name vec2
 */

var vec2 = {};

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
vec2.create = function() {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = 0;
    out[1] = 0;
    return out;
};

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
vec2.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
vec2.fromValues = function(x, y) {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
vec2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
vec2.set = function(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
};

/**
 * Subtracts two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
};

/**
 * Alias for {@link vec2.subtract}
 * @function
 */
vec2.sub = vec2.subtract;

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
};

/**
 * Alias for {@link vec2.multiply}
 * @function
 */
vec2.mul = vec2.multiply;

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
};

/**
 * Alias for {@link vec2.divide}
 * @function
 */
vec2.div = vec2.divide;

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    return out;
};

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    return out;
};

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */
vec2.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
};

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
vec2.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.distance}
 * @function
 */
vec2.dist = vec2.distance;

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec2.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */
vec2.sqrDist = vec2.squaredDistance;

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
vec2.length = function (a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.length}
 * @function
 */
vec2.len = vec2.length;

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec2.squaredLength = function (a) {
    var x = a[0],
        y = a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */
vec2.sqrLen = vec2.squaredLength;

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
vec2.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
};

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
vec2.normalize = function(out, a) {
    var x = a[0],
        y = a[1];
    var len = x*x + y*y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
vec2.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1];
};

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */
vec2.cross = function(out, a, b) {
    var z = a[0] * b[1] - a[1] * b[0];
    out[0] = out[1] = 0;
    out[2] = z;
    return out;
};

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */
vec2.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
};

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    return out;
};

/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2d} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2d = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
};

/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat3 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
};

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat4 = function(out, a, m) {
    var x = a[0], 
        y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
};

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec2.forEach = (function() {
    var vec = vec2.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 2;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec2} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec2.str = function (a) {
    return 'vec2(' + a[0] + ', ' + a[1] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec2 = vec2;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 3 Dimensional Vector
 * @name vec3
 */

var vec3 = {};

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
vec3.create = function() {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
};

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
vec3.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
vec3.fromValues = function(x, y, z) {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
vec3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
vec3.set = function(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
};

/**
 * Subtracts two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
};

/**
 * Alias for {@link vec3.subtract}
 * @function
 */
vec3.sub = vec3.subtract;

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
};

/**
 * Alias for {@link vec3.multiply}
 * @function
 */
vec3.mul = vec3.multiply;

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
};

/**
 * Alias for {@link vec3.divide}
 * @function
 */
vec3.div = vec3.divide;

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out;
};

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out;
};

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
vec3.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
};

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
vec3.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.distance}
 * @function
 */
vec3.dist = vec3.distance;

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec3.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */
vec3.sqrDist = vec3.squaredDistance;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
vec3.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.length}
 * @function
 */
vec3.len = vec3.length;

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec3.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredLength}
 * @function
 */
vec3.sqrLen = vec3.squaredLength;

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
vec3.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
};

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
vec3.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    var len = x*x + y*y + z*z;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
vec3.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.cross = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
};

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
};

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
    return out;
};

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
vec3.transformQuat = function(out, a, q) {
    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec3.forEach = (function() {
    var vec = vec3.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 3;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec3} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec3.str = function (a) {
    return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec3 = vec3;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 4 Dimensional Vector
 * @name vec4
 */

var vec4 = {};

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */
vec4.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    return out;
};

/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {vec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */
vec4.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */
vec4.fromValues = function(x, y, z, w) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */
vec4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */
vec4.set = function(out, x, y, z, w) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
};

/**
 * Subtracts two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    return out;
};

/**
 * Alias for {@link vec4.subtract}
 * @function
 */
vec4.sub = vec4.subtract;

/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    out[3] = a[3] * b[3];
    return out;
};

/**
 * Alias for {@link vec4.multiply}
 * @function
 */
vec4.mul = vec4.multiply;

/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    out[3] = a[3] / b[3];
    return out;
};

/**
 * Alias for {@link vec4.divide}
 * @function
 */
vec4.div = vec4.divide;

/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    out[3] = Math.min(a[3], b[3]);
    return out;
};

/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    out[3] = Math.max(a[3], b[3]);
    return out;
};

/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */
vec4.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
};

/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} distance between a and b
 */
vec4.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.distance}
 * @function
 */
vec4.dist = vec4.distance;

/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec4.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */
vec4.sqrDist = vec4.squaredDistance;

/**
 * Calculates the length of a vec4
 *
 * @param {vec4} a vector to calculate length of
 * @returns {Number} length of a
 */
vec4.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.length}
 * @function
 */
vec4.len = vec4.length;

/**
 * Calculates the squared length of a vec4
 *
 * @param {vec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec4.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */
vec4.sqrLen = vec4.squaredLength;

/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to negate
 * @returns {vec4} out
 */
vec4.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = -a[3];
    return out;
};

/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */
vec4.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    var len = x*x + y*y + z*z + w*w;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
        out[3] = a[3] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */
vec4.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};

/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec4} out
 */
vec4.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    out[3] = aw + t * (b[3] - aw);
    return out;
};

/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec4} out
 */
vec4.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2], w = a[3];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return out;
};

/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */
vec4.transformQuat = function(out, a, q) {
    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec4.forEach = (function() {
    var vec = vec4.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 4;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec4} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec4.str = function (a) {
    return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec4 = vec4;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2x2 Matrix
 * @name mat2
 */

var mat2 = {};

/**
 * Creates a new identity mat2
 *
 * @returns {mat2} a new 2x2 matrix
 */
mat2.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param {mat2} a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */
mat2.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Copy the values from one mat2 to another
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set a mat2 to the identity matrix
 *
 * @param {mat2} out the receiving matrix
 * @returns {mat2} out
 */
mat2.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Transpose the values of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a1 = a[1];
        out[1] = a[2];
        out[2] = a1;
    } else {
        out[0] = a[0];
        out[1] = a[2];
        out[2] = a[1];
        out[3] = a[3];
    }
    
    return out;
};

/**
 * Inverts a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],

        // Calculate the determinant
        det = a0 * a3 - a2 * a1;

    if (!det) {
        return null;
    }
    det = 1.0 / det;
    
    out[0] =  a3 * det;
    out[1] = -a1 * det;
    out[2] = -a2 * det;
    out[3] =  a0 * det;

    return out;
};

/**
 * Calculates the adjugate of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.adjoint = function(out, a) {
    // Caching this value is nessecary if out == a
    var a0 = a[0];
    out[0] =  a[3];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] =  a0;

    return out;
};

/**
 * Calculates the determinant of a mat2
 *
 * @param {mat2} a the source matrix
 * @returns {Number} determinant of a
 */
mat2.determinant = function (a) {
    return a[0] * a[3] - a[2] * a[1];
};

/**
 * Multiplies two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */
mat2.multiply = function (out, a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = a0 * b0 + a1 * b2;
    out[1] = a0 * b1 + a1 * b3;
    out[2] = a2 * b0 + a3 * b2;
    out[3] = a2 * b1 + a3 * b3;
    return out;
};

/**
 * Alias for {@link mat2.multiply}
 * @function
 */
mat2.mul = mat2.multiply;

/**
 * Rotates a mat2 by the given angle
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */
mat2.rotate = function (out, a, rad) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = a0 *  c + a1 * s;
    out[1] = a0 * -s + a1 * c;
    out[2] = a2 *  c + a3 * s;
    out[3] = a2 * -s + a3 * c;
    return out;
};

/**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2} out
 **/
mat2.scale = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v1;
    out[2] = a2 * v0;
    out[3] = a3 * v1;
    return out;
};

/**
 * Returns a string representation of a mat2
 *
 * @param {mat2} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2.str = function (a) {
    return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat2 = mat2;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2x3 Matrix
 * @name mat2d
 * 
 * @description 
 * A mat2d contains six elements defined as:
 * <pre>
 * [a, b,
 *  c, d,
 *  tx,ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, b, 0
 *  c, d, 0
 *  tx,ty,1]
 * </pre>
 * The last column is ignored so the array is shorter and operations are faster.
 */

var mat2d = {};

/**
 * Creates a new identity mat2d
 *
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.create = function() {
    var out = new GLMAT_ARRAY_TYPE(6);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Creates a new mat2d initialized with values from an existing matrix
 *
 * @param {mat2d} a matrix to clone
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(6);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Copy the values from one mat2d to another
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Set a mat2d to the identity matrix
 *
 * @param {mat2d} out the receiving matrix
 * @returns {mat2d} out
 */
mat2d.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Inverts a mat2d
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.invert = function(out, a) {
    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
        atx = a[4], aty = a[5];

    var det = aa * ad - ab * ac;
    if(!det){
        return null;
    }
    det = 1.0 / det;

    out[0] = ad * det;
    out[1] = -ab * det;
    out[2] = -ac * det;
    out[3] = aa * det;
    out[4] = (ac * aty - ad * atx) * det;
    out[5] = (ab * atx - aa * aty) * det;
    return out;
};

/**
 * Calculates the determinant of a mat2d
 *
 * @param {mat2d} a the source matrix
 * @returns {Number} determinant of a
 */
mat2d.determinant = function (a) {
    return a[0] * a[3] - a[1] * a[2];
};

/**
 * Multiplies two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */
mat2d.multiply = function (out, a, b) {
    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
        atx = a[4], aty = a[5],
        ba = b[0], bb = b[1], bc = b[2], bd = b[3],
        btx = b[4], bty = b[5];

    out[0] = aa*ba + ab*bc;
    out[1] = aa*bb + ab*bd;
    out[2] = ac*ba + ad*bc;
    out[3] = ac*bb + ad*bd;
    out[4] = ba*atx + bc*aty + btx;
    out[5] = bb*atx + bd*aty + bty;
    return out;
};

/**
 * Alias for {@link mat2d.multiply}
 * @function
 */
mat2d.mul = mat2d.multiply;


/**
 * Rotates a mat2d by the given angle
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */
mat2d.rotate = function (out, a, rad) {
    var aa = a[0],
        ab = a[1],
        ac = a[2],
        ad = a[3],
        atx = a[4],
        aty = a[5],
        st = Math.sin(rad),
        ct = Math.cos(rad);

    out[0] = aa*ct + ab*st;
    out[1] = -aa*st + ab*ct;
    out[2] = ac*ct + ad*st;
    out[3] = -ac*st + ct*ad;
    out[4] = ct*atx + st*aty;
    out[5] = ct*aty - st*atx;
    return out;
};

/**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {mat2d} v the vec2 to scale the matrix by
 * @returns {mat2d} out
 **/
mat2d.scale = function(out, a, v) {
    var vx = v[0], vy = v[1];
    out[0] = a[0] * vx;
    out[1] = a[1] * vy;
    out[2] = a[2] * vx;
    out[3] = a[3] * vy;
    out[4] = a[4] * vx;
    out[5] = a[5] * vy;
    return out;
};

/**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {mat2d} v the vec2 to translate the matrix by
 * @returns {mat2d} out
 **/
mat2d.translate = function(out, a, v) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4] + v[0];
    out[5] = a[5] + v[1];
    return out;
};

/**
 * Returns a string representation of a mat2d
 *
 * @param {mat2d} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2d.str = function (a) {
    return 'mat2d(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat2d = mat2d;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 3x3 Matrix
 * @name mat3
 */

var mat3 = {};

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */
mat3.create = function() {
    var out = new GLMAT_ARRAY_TYPE(9);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */
mat3.fromMat4 = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[4];
    out[4] = a[5];
    out[5] = a[6];
    out[6] = a[8];
    out[7] = a[9];
    out[8] = a[10];
    return out;
};

/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {mat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */
mat3.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(9);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
mat3.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a12 = a[5];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a01;
        out[5] = a[7];
        out[6] = a02;
        out[7] = a12;
    } else {
        out[0] = a[0];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a[1];
        out[4] = a[4];
        out[5] = a[7];
        out[6] = a[2];
        out[7] = a[5];
        out[8] = a[8];
    }
    
    return out;
};

/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b01 = a22 * a11 - a12 * a21,
        b11 = -a22 * a10 + a12 * a20,
        b21 = a21 * a10 - a11 * a20,

        // Calculate the determinant
        det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;
    return out;
};

/**
 * Calculates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    out[0] = (a11 * a22 - a12 * a21);
    out[1] = (a02 * a21 - a01 * a22);
    out[2] = (a01 * a12 - a02 * a11);
    out[3] = (a12 * a20 - a10 * a22);
    out[4] = (a00 * a22 - a02 * a20);
    out[5] = (a02 * a10 - a00 * a12);
    out[6] = (a10 * a21 - a11 * a20);
    out[7] = (a01 * a20 - a00 * a21);
    out[8] = (a00 * a11 - a01 * a10);
    return out;
};

/**
 * Calculates the determinant of a mat3
 *
 * @param {mat3} a the source matrix
 * @returns {Number} determinant of a
 */
mat3.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
};

/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
mat3.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b00 = b[0], b01 = b[1], b02 = b[2],
        b10 = b[3], b11 = b[4], b12 = b[5],
        b20 = b[6], b21 = b[7], b22 = b[8];

    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
};

/**
 * Alias for {@link mat3.multiply}
 * @function
 */
mat3.mul = mat3.multiply;

/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to translate
 * @param {vec2} v vector to translate by
 * @returns {mat3} out
 */
mat3.translate = function(out, a, v) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],
        x = v[0], y = v[1];

    out[0] = a00;
    out[1] = a01;
    out[2] = a02;

    out[3] = a10;
    out[4] = a11;
    out[5] = a12;

    out[6] = x * a00 + y * a10 + a20;
    out[7] = x * a01 + y * a11 + a21;
    out[8] = x * a02 + y * a12 + a22;
    return out;
};

/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
mat3.rotate = function (out, a, rad) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        s = Math.sin(rad),
        c = Math.cos(rad);

    out[0] = c * a00 + s * a10;
    out[1] = c * a01 + s * a11;
    out[2] = c * a02 + s * a12;

    out[3] = c * a10 - s * a00;
    out[4] = c * a11 - s * a01;
    out[5] = c * a12 - s * a02;

    out[6] = a20;
    out[7] = a21;
    out[8] = a22;
    return out;
};

/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
mat3.scale = function(out, a, v) {
    var x = v[0], y = v[2];

    out[0] = x * a[0];
    out[1] = x * a[1];
    out[2] = x * a[2];

    out[3] = y * a[3];
    out[4] = y * a[4];
    out[5] = y * a[5];

    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copies the values from a mat2d into a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
mat3.fromMat2d = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = 0;

    out[3] = a[2];
    out[4] = a[3];
    out[5] = 0;

    out[6] = a[4];
    out[7] = a[5];
    out[8] = 1;
    return out;
};

/**
* Calculates a 3x3 matrix from the given quaternion
*
* @param {mat3} out mat3 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat3} out
*/
mat3.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;

    out[3] = xy - wz;
    out[4] = 1 - (xx + zz);
    out[5] = yz + wx;

    out[6] = xz + wy;
    out[7] = yz - wx;
    out[8] = 1 - (xx + yy);

    return out;
};

/**
 * Returns a string representation of a mat3
 *
 * @param {mat3} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat3.str = function (a) {
    return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + 
                    a[6] + ', ' + a[7] + ', ' + a[8] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat3 = mat3;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 4x4 Matrix
 * @name mat4
 */

var mat4 = {};

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
mat4.create = function() {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {mat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */
mat4.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
mat4.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a03 = a[3],
            a12 = a[6], a13 = a[7],
            a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }
    
    return out;
};

/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
};

/**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    out[0]  =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
    out[1]  = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
    out[2]  =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
    out[3]  = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
    out[4]  = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
    out[5]  =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
    out[6]  = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
    out[7]  =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
    out[8]  =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
    out[9]  = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
    out[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
    out[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
    out[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
    return out;
};

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */
mat4.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
};

/**
 * Multiplies two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return out;
};

/**
 * Alias for {@link mat4.multiply}
 * @function
 */
mat4.mul = mat4.multiply;

/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
mat4.translate = function (out, a, v) {
    var x = v[0], y = v[1], z = v[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
};

/**
 * Scales the mat4 by the dimensions in the given vec3
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
mat4.scale = function(out, a, v) {
    var x = v[0], y = v[1], z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Rotates a mat4 by the given angle
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
mat4.rotate = function (out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t,
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;

    if (Math.abs(len) < GLMAT_EPSILON) { return null; }
    
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
};

/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateX = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[0]  = a[0];
        out[1]  = a[1];
        out[2]  = a[2];
        out[3]  = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateY = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[4]  = a[4];
        out[5]  = a[5];
        out[6]  = a[6];
        out[7]  = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateZ = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[8]  = a[8];
        out[9]  = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
};

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
mat4.fromRotationTranslation = function (out, q, v) {
    // Quaternion math
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    
    return out;
};

/**
* Calculates a 4x4 matrix from the given quaternion
*
* @param {mat4} out mat4 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat4} out
*/
mat4.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;

    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;

    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;

    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
};

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.frustum = function (out, left, right, bottom, top, near, far) {
    var rl = 1 / (right - left),
        tb = 1 / (top - bottom),
        nf = 1 / (near - far);
    out[0] = (near * 2) * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = (near * 2) * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (far * near * 2) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.perspective = function (out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.ortho = function (out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right),
        bt = 1 / (bottom - top),
        nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
};

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
mat4.lookAt = function (out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
        eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2],
        centerx = center[0],
        centery = center[1],
        centerz = center[2];

    if (Math.abs(eyex - centerx) < GLMAT_EPSILON &&
        Math.abs(eyey - centery) < GLMAT_EPSILON &&
        Math.abs(eyez - centerz) < GLMAT_EPSILON) {
        return mat4.identity(out);
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;

    return out;
};

/**
 * Returns a string representation of a mat4
 *
 * @param {mat4} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat4.str = function (a) {
    return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
                    a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
                    a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + 
                    a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat4 = mat4;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class Quaternion
 * @name quat
 */

var quat = {};

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */
quat.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {quat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */
quat.clone = vec4.clone;

/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */
quat.fromValues = vec4.fromValues;

/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the source quaternion
 * @returns {quat} out
 * @function
 */
quat.copy = vec4.copy;

/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */
quat.set = vec4.set;

/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
quat.identity = function(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/
quat.setAxisAngle = function(out, axis, rad) {
    rad = rad * 0.5;
    var s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
};

/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 * @function
 */
quat.add = vec4.add;

/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */
quat.multiply = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
};

/**
 * Alias for {@link quat.multiply}
 * @function
 */
quat.mul = quat.multiply;

/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {quat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */
quat.scale = vec4.scale;

/**
 * Rotates a quaternion by the given angle around the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateX = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
};

/**
 * Rotates a quaternion by the given angle around the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateY = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        by = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
};

/**
 * Rotates a quaternion by the given angle around the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateZ = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bz = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
};

/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate W component of
 * @returns {quat} out
 */
quat.calculateW = function (out, a) {
    var x = a[0], y = a[1], z = a[2];

    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
    return out;
};

/**
 * Calculates the dot product of two quat's
 *
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
quat.dot = vec4.dot;

/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 * @function
 */
quat.lerp = vec4.lerp;

/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 */
quat.slerp = function (out, a, b, t) {
    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    var cosHalfTheta = ax * bx + ay * by + az * bz + aw * bw,
        halfTheta,
        sinHalfTheta,
        ratioA,
        ratioB;

    if (Math.abs(cosHalfTheta) >= 1.0) {
        if (out !== a) {
            out[0] = ax;
            out[1] = ay;
            out[2] = az;
            out[3] = aw;
        }
        return out;
    }

    halfTheta = Math.acos(cosHalfTheta);
    sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

    if (Math.abs(sinHalfTheta) < 0.001) {
        out[0] = (ax * 0.5 + bx * 0.5);
        out[1] = (ay * 0.5 + by * 0.5);
        out[2] = (az * 0.5 + bz * 0.5);
        out[3] = (aw * 0.5 + bw * 0.5);
        return out;
    }

    ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
    ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    out[0] = (ax * ratioA + bx * ratioB);
    out[1] = (ay * ratioA + by * ratioB);
    out[2] = (az * ratioA + bz * ratioB);
    out[3] = (aw * ratioA + bw * ratioB);

    return out;
};

/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */
quat.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        dot = a0*a0 + a1*a1 + a2*a2 + a3*a3,
        invDot = dot ? 1.0/dot : 0;
    
    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

    out[0] = -a0*invDot;
    out[1] = -a1*invDot;
    out[2] = -a2*invDot;
    out[3] = a3*invDot;
    return out;
};

/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate conjugate of
 * @returns {quat} out
 */
quat.conjugate = function (out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
};

/**
 * Calculates the length of a quat
 *
 * @param {quat} a vector to calculate length of
 * @returns {Number} length of a
 * @function
 */
quat.length = vec4.length;

/**
 * Alias for {@link quat.length}
 * @function
 */
quat.len = quat.length;

/**
 * Calculates the squared length of a quat
 *
 * @param {quat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */
quat.squaredLength = vec4.squaredLength;

/**
 * Alias for {@link quat.squaredLength}
 * @function
 */
quat.sqrLen = quat.squaredLength;

/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */
quat.normalize = vec4.normalize;

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */
quat.fromMat3 = (function() {
    var s_iNext = [1,2,0];
    return function(out, m) {
        // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
        // article "Quaternion Calculus and Fast Animation".
        var fTrace = m[0] + m[4] + m[8];
        var fRoot;

        if ( fTrace > 0.0 ) {
            // |w| > 1/2, may as well choose w > 1/2
            fRoot = Math.sqrt(fTrace + 1.0);  // 2w
            out[3] = 0.5 * fRoot;
            fRoot = 0.5/fRoot;  // 1/(4w)
            out[0] = (m[7]-m[5])*fRoot;
            out[1] = (m[2]-m[6])*fRoot;
            out[2] = (m[3]-m[1])*fRoot;
        } else {
            // |w| <= 1/2
            var i = 0;
            if ( m[4] > m[0] )
              i = 1;
            if ( m[8] > m[i*3+i] )
              i = 2;
            var j = s_iNext[i];
            var k = s_iNext[j];
            
            fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
            out[i] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot;
            out[3] = (m[k*3+j] - m[j*3+k]) * fRoot;
            out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
            out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
        }
        
        return out;
    };
})();

/**
 * Returns a string representation of a quatenion
 *
 * @param {quat} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
quat.str = function (a) {
    return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.quat = quat;
}
;













  })(shim.exports);
})();

define('pex/geom/Vec2',['lib/gl-matrix'], function(glMatrix) {
  return glMatrix.vec2;
});
define('pex/geom/Vec3',['lib/gl-matrix'], function(glMatrix) {
  return glMatrix.vec3;
});
define('pex/geom/Vec4',['lib/gl-matrix'], function(glMatrix) {
  return glMatrix.vec4;
});
define('pex/geom/Mat3',['lib/gl-matrix'], function(glMatrix) {
  return glMatrix.mat3;
});
define('pex/geom/Mat4',['lib/gl-matrix'], function(glMatrix) {
  return glMatrix.mat4;
});
define('pex/geom/Quat',['lib/gl-matrix'], function(glMatrix) {
  return glMatrix.quat;
});
define('pex/geom/Vec2Array',[], function() {

  var NUM_ELEMENTS = 2;
  var ELEMENT_BYTES = 4;

  function Vec2Array(n) {
    Array.call(this);
    this.length = n;

    this.bufStorage = new ArrayBuffer(NUM_ELEMENTS * n * ELEMENT_BYTES);
    this.buf = new Float32Array(this.bufStorage, 0, NUM_ELEMENTS * n);
    for(var i=0; i<n; i++) {
      this[i] = new Float32Array(this.bufStorage, i * NUM_ELEMENTS * 4, NUM_ELEMENTS);
    }
  }

  Vec2Array.prototype = Object.create(Array.prototype);

  return Vec2Array;
});
define('pex/geom/Vec3Array',[], function() {

  var NUM_ELEMENTS = 3;
  var ELEMENT_BYTES = 4;

  function Vec3Array(n) {
    Array.call(this);
    this.length = n;

    this.bufStorage = new ArrayBuffer(NUM_ELEMENTS * n * ELEMENT_BYTES);
    this.buf = new Float32Array(this.bufStorage, 0, NUM_ELEMENTS * n);
    for(var i=0; i<n; i++) {
      this[i] = new Float32Array(this.bufStorage, i * NUM_ELEMENTS * 4, NUM_ELEMENTS);
    }
  }

  Vec3Array.prototype = Object.create(Array.prototype);

  return Vec3Array;
});
define('pex/geom/Vec4Array',[], function() {

  var NUM_ELEMENTS = 4;
  var ELEMENT_BYTES = 4;

  function Vec4Array(n) {
    Array.call(this);
    this.length = n;

    this.bufStorage = new ArrayBuffer(NUM_ELEMENTS * n * ELEMENT_BYTES);
    this.buf = new Float32Array(this.bufStorage, 0, NUM_ELEMENTS * n);
    for(var i=0; i<n; i++) {
      this[i] = new Float32Array(this.bufStorage, i * NUM_ELEMENTS * 4, NUM_ELEMENTS);
    }
  }

  Vec4Array.prototype = Object.create(Array.prototype);

  return Vec4Array;
});
define('pex/geom/Geometry',['pex/geom/Vec2Array', 'pex/geom/Vec3Array', 'pex/geom/Vec4Array'], function(Vec2Array, Vec3Array, Vec4Array) {
  var elementSizeMap = {
    'Vec2' : 2,
    'Vec3' : 3,
    'Vec4' : 4
  };

  function Geometry(attribs) {
    this.faces = [];
    this.edges = [];
    this.attribs = attribs || {};

    for(var attribName in this.attribs) {
      var attrib = this.attribs[attribName];
      attrib.isDirty = true;
      attrib.elementSize = elementSizeMap[attrib.type];
      if (attrib.type == 'Vec2') { attrib.data = new Vec2Array(attrib.length); }
      if (attrib.type == 'Vec3') { attrib.data = new Vec3Array(attrib.length); }
      if (attrib.type == 'Vec4') { attrib.data = new Vec4Array(attrib.length); }
    }
  }

  Geometry.prototype.assureSize = function(numVertices) {
    for(var attribName in this.attribs) {
      var attrib = this.attribs[attribName];
      if (attrib.length < numVertices) {
        var newSize = Math.floor(numVertices * 2);
        var newAttribData;
        if (attrib.type == 'Vec2') { newAttribData = new Vec3Array(newSize); }
        if (attrib.type == 'Vec3') { newAttribData = new Vec3Array(newSize); }
        if (attrib.type == 'Vec4') { newAttribData = new Vec3Array(newSize); }
        newAttribData.buf.set(attrib.data.buf);
        attrib.length = newSize;
        attrib.data = newAttribData;
        attrib.isDirty = true;
      }
    }
  }

  return Geometry;
});
define('pex/geom/Face4',[], function() {
  function Face4(a, b, c, d) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }
  return Face4;
});
define('pex/geom/gen/Cube',['pex/geom/Vec2', 'pex/geom/Vec3', 'pex/geom/Face4', 'pex/geom/Geometry'],
  function(Vec2, Vec3, Face4, Geometry) {
  function Cube(sx, sy, sz, nx, ny, nz) {
    sx = sx || 1;
    sy = sy || sx || 1;
    sz = sz || sx || 1;
    nx = nx || 1;
    ny = ny || 1;
    nz = nz || 1;

    var numVertices = (nx + 1) * (ny + 1) * 2 + (nx + 1) * (nz + 1) * 2 + (nz + 1) * (ny + 1) * 2;
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

    function makePlane(u, v, w, su, sv, nu, nv, pw, flipu, flipv) {
      var vertShift = vertexIndex;
      for(var j=0; j<=nv; ++j) {
        for(var i=0; i<=nu; ++i) {
          var vert = positions[vertexIndex];
          vert[u] = (-su/2 + i*su/nu) * flipu;
          vert[v] = (-sv/2 + j*sv/nv) * flipv;
          vert[w] = pw;

          var normal = normals[vertexIndex];
          normal[u] = 0;
          normal[v] = 0;
          normal[w] = pw/Math.abs(pw);

          var texCoord = texCoords[vertexIndex];
          texCoord[0] = i/nu;
          texCoord[1] = j/nv;

          ++vertexIndex;
        }
      }
      for(var j=0; j<nv; ++j) {
        for(var i=0; i<nu; ++i) {
          var n = vertShift + j * (nu + 1) + i;
          var face = new Face4(n, n + nu  + 1, n + nu + 2, n + 1);
          faces.push(face);
        }
      }
    }

    makePlane(0, 1, 2, sx, sy, nx, ny,  sz/2,  1, -1); //front
    makePlane(0, 1, 2, sx, sy, nx, ny, -sz/2, -1, -1); //back
    makePlane(2, 1, 0, sz, sy, nz, ny, -sx/2,  1, -1); //left
    makePlane(2, 1, 0, sz, sy, nz, ny,  sx/2, -1, -1); //right
    makePlane(0, 2, 1, sx, sz, nx, nz,  sy/2,  1,  1); //top
    makePlane(0, 2, 1, sx, sz, nx, nz, -sy/2,  1, -1); //bottom
  }


  Cube.prototype = Object.create(Geometry.prototype);

  return Cube;
});
define('pex/geom/Face3',[], function() {
  function Face3(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }
  return Face3;
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
      pos[0] = r * Math.sin(theta * degToRad) * Math.sin(phi * degToRad);
      pos[1] = r * Math.cos(theta * degToRad);
      pos[2] = r * Math.sin(theta * degToRad) * Math.cos(phi * degToRad);
    }

    for (var theta=0, segment=0; theta<=180; theta+=dtheta, ++segment) {
      for (var phi=0, side=0; phi<=360; phi+=dphi, ++side) {
        var vert = positions[vertexIndex];
        var normal = normals[vertexIndex];
        var texCoord = texCoords[vertexIndex];

        evalPos(vert, theta, phi);

        Vec3.copy(normal, vert);
        Vec3.normalize(normal, normal);
        Vec2.set(texCoord, phi/360.0, theta/180.0);

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

    //console.log('Num vertices estimated', numVertices, 'final', vertices.length);
  }

  Sphere.prototype = Object.create(Geometry.prototype);

  return Sphere;
});
define('pex/geom/gen/LineBuilder',[
  'pex/geom/Geometry',
  'pex/geom/Vec3',
  'pex/geom/Vec3Array',
  'pex/geom/Vec3',
  'pex/geom/Vec3Array'],
  function(Geometry, Vec3, Vec3Array, Vec4, Vec4Array) {
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
    this.assureSize(this.numVertices + 2);
    colorA = colorA || [1, 1, 1, 1];
    colorB = colorB || colorA;

    var positions = this.attribs.position.data;
    var colors = this.attribs.color.data;

    Vec3.copy(positions[this.numVertices + 0], a);
    Vec3.copy(positions[this.numVertices + 1], b);

    Vec3.copy(colors[this.numVertices + 0], colorA);
    Vec3.copy(colors[this.numVertices + 1], colorB);

    this.numVertices += 2;
  }

  LineBuilder.prototype.addCross = function(pos, size, color) {
    this.assureSize(this.numVertices + 6);

    size = size || 0.1;
    var halfSize = size / 2;

    color = color || [1, 1, 1, 1];

    var positions = this.attribs.position.data;
    var colors = this.attribs.color.data;

    Vec3.set(positions[this.numVertices + 0], pos[0] - halfSize, pos[1], pos[2]);
    Vec3.set(positions[this.numVertices + 1], pos[0] + halfSize, pos[1], pos[2]);
    Vec3.set(positions[this.numVertices + 2], pos[0], pos[1] - halfSize, pos[2]);
    Vec3.set(positions[this.numVertices + 3], pos[0], pos[1] + halfSize, pos[2]);
    Vec3.set(positions[this.numVertices + 4], pos[0], pos[1], pos[2] - halfSize);
    Vec3.set(positions[this.numVertices + 5], pos[0], pos[1], pos[2] + halfSize);

    Vec4.set(colors[this.numVertices + 0], color[0], color[1], color[2], color[3]);
    Vec4.set(colors[this.numVertices + 1], color[0], color[1], color[2], color[3]);
    Vec4.set(colors[this.numVertices + 2], color[0], color[1], color[2], color[3]);
    Vec4.set(colors[this.numVertices + 3], color[0], color[1], color[2], color[3]);
    Vec4.set(colors[this.numVertices + 4], color[0], color[1], color[2], color[3]);
    Vec4.set(colors[this.numVertices + 5], color[0], color[1], color[2], color[3]);

    this.numVertices += 6;
  }

  LineBuilder.prototype.assureSize = function(neededSize) {
    var currPositions = this.attribs.position.data;
    var currColors = this.attribs.color.data;

    if (neededSize < currPositions.length - 1) {
      return;
    }
    else {
      var newSize = 2 * currPositions.length;
      var newPositions = new Vec3Array(newSize);
      newPositions.buf.set(currPositions.buf);
      this.attribs.position.data = newPositions;

      var newColors = new Vec4Array(newSize);
      newColors.buf.set(currColors.buf);
      this.attribs.color.data = newColors;

      console.log('LineBuilder.assureSize: Resizing to ' + newSize);
    }

  }

  LineBuilder.prototype.start = function() {
    this.numVertices = 0;
  }

  LineBuilder.prototype.end = function() {
    var n = this.attribs.position.data.length;

    for(var i=this.numVertices; i<n; i++) {
      Vec3.set(this.attribs.position.data[i], 0, 0, 0);
      Vec4.set(this.attribs.color.data[i], 0, 0, 0);
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
  define('pex/geom/Line2D',['pex/geom/Vec2'], function(Vec2) {

  function Line2D(a, b) {
    this.a = a;
    this.b = b;
  }

  Line2D.prototype.isPointOnTheLeftSide = function(p){
    return ((this.b[0] - this.a[0])*(p[1] - this.a[1]) - (this.b[1] - this.a[1])*(p[0] - this.a[0])) <= 0;
  };

  Line2D.prototype.projectPoint = function(out, p) {
    var a = this.a;
    var b = this.b;

    var ab = Vec2.create();
    var ap = Vec2.create();
    Vec2.sub(ab, b, a);
    Vec2.normalize(ab, ab);
    Vec2.sub(ap, p, a);

    //point on line = a + ab * dot(ab, ap)

    var d = Vec2.dot(ab, ap);
    Vec2.scale(out, ab, d);
    Vec2.add(out, out, a);
  };

  Line2D.prototype.distanceToPoint = function(p) {
    var pOnLine = Vec2.create();
    this.projectPoint(pOnLine, p);
    return Vec2.distance(p, pOnLine);
  };

  Line2D.prototype.intersect = function(out, line) {
    var sqrEpsilon = 0.000001;
    var P0 = this.a;
    var D0 = Vec2.create();
    Vec2.sub(D0, this.b, this.a);
    var P1 = line.a;
    var D1 = Vec2.create();
    Vec2.sub(D1, line.b, line.a);

    var E = Vec2.create();
    Vec2.sub(E, P1, P0);

    var kross = D0[0] * D1[1] - D0[1] * D1[0];
    var sqrKross = kross * kross;
    var sqrLen0 = D0[0] * D0[0] + D0[1] * D0[1];
    var sqrLen1 = D1[0] * D1[0] + D1[1] * D1[1];
    if (sqrKross > sqrEpsilon * sqrLen0 * sqrLen1) {
      // lines are not parallel
      var s = (E[0] * D1[1] - E[1] *D1[0]) / kross;
      var scaled = Vec2.create();
      Vec2.scale(scaled, D0, s);
      Vec2.copy(out, P0);
      Vec2.add(out, out, scaled);
      return true;
    }
    // lines are parallel
    var sqrLenE = E[0] * E[0] + E[1] * E[1];
    kross = E[0] * D0[1] - E[1] * D0[0];
    sqrKross = kross * kross;
    if (sqrKross > sqrEpsilon * sqrLen0 * sqrLenE) {
        // lines are different
        return false;
    }
    return false;
  }

  return Line2D;

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
    return (point[0] >= this.x && point[0] <= this.x + this.width && point[1] >= this.y && point[1] <= this.y + this.height);
  }

  return Rect;
});
define('pex/geom/Triangle2D',['pex/geom/Line2D'], function(Line2D) {
  function sign(a, b, c) {
    return (a[0] - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (a[1] - c[1]);
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
      sum += v[0] * nv[0] - v[0] * nv[0];
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
    this.center[0] = 0;
    this.center[0] = 0;
    for(var i=0; i<this.vertices.length; i++) {
      this.center[0] += this.vertices[i][0];
      this.center[0] += this.vertices[i][0];
    }

    this.center[0] /= this.vertices.length;
    this.center[0] /= this.vertices.length;

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
          var intersection = Vec2.create();
          clippingEdge.intersect(intersection, new Line2D(start, end));
          clippedVertices.push( intersection );
        }
        else if (!isStartInside && !isEndInside) {
          //do nothing
          prevStart = null;
        }
        else if (!isStartInside && isEndInside) {
          var intersection = Vec2.create();
          clippingEdge.intersect(intersection, new Line2D(start, end));
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
    this.position = Vec3.fromValues(x, y, z);
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

    var n = Vec3.fromValues(0, 0, 0);
    for(var i in faces) {
      Vec3.add(n, n, faces[i].getNormal());
    }
    Vec3.normalize(n, n);

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
        Vec3.sub(edgeVec3, this.position, faceEdge.next.vert.position);
        var dist = Vec3.lengthSquared(edgeVec3);
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

    Vec3.sub(ab, b, a);
    Vec3.sub(ac, c, a);
    Vec3.cross(this.normal, ab, ac);
    Vec3.normalize(this.normal, this.normal);

    return this.normal;
  }

  //calculates the centroid of the face
  HEFace.prototype.getCenter = function() {
    if (!this.center) {
      this.center = Vec3.create();
    }
    Vec3.set(this.center, 0, 0, 0);
    var vertexCount = 0;
    var edge = this.edge;
    do {
      Vec3.add(this.center, this.center, edge.vert.position);
      vertexCount++;
      edge = edge.next;
    } while (edge != this.edge);

    Vec3.scale(this.center, this.center, 1/vertexCount);
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
      Vec3.fromValues(pos[0] - size[0]/2, pos[1] - size[1]/2, pos[2] - size[2]/2),
      Vec3.fromValues(pos[0] + size[0]/2, pos[1] + size[1]/2, pos[2] + size[2]/2)
    );
  }

  BoundingBox.fromPoints = function(points) {
    var bbox = new BoundingBox(Vec3.clone(points[0], Vec3.clone(points[0])));
    points.forEach(bbox.addPoint.bind(bbox));
    return bbox;
  }

  BoundingBox.prototype.isEmpty = function() {
    if (!this.min || !this.max) return true;
    else return false;
  }

  BoundingBox.prototype.addPoint = function(p) {
    if (this.isEmpty()) {
      this.min = Vec3.clone(p);
      this.max = Vec3.clone(p);
    }

    if (p[0] < this.min[0]) this.min[0] = p[0];
    if (p[1] < this.min[1]) this.min[1] = p[1];
    if (p[2] < this.min[2]) this.min[2] = p[2];
    if (p[0] > this.max[0]) this.max[0] = p[0];
    if (p[1] > this.max[1]) this.max[1] = p[1];
    if (p[2] > this.max[2]) this.max[2] = p[2];
  }

  BoundingBox.prototype.getSize = function(out) {
    if (!out) {
      if (!this.size) {
        this.size = Vec3.create();
      }
      out = this.size;
    }

    if (this.isEmpty()) {
      Vec3.set(out, 0, 0, 0);
      return out;
    }

    Vec3.set(out,
     (this.max[0] - this.min[0]),
     (this.max[1] - this.min[1]),
     (this.max[2] - this.min[2])
    );
    return out;
  }

  BoundingBox.prototype.getCenter = function(out) {
    if (!out) {
      if (!this.center) {
        this.center = Vec3.create();
      }
      out = this.center;
    }

    Vec3.set(out,
     (this.min[0] + this.max[0])/2,
     (this.min[1] + this.max[1])/2,
     (this.min[2] + this.max[2])/2
    );
    return out;
  }

  return BoundingBox;
});
define('pex/geom/Octree',['pex/geom/Vec3'], function(Vec3) {
  //position is bottom left corner of the cell
  function Octree(position, size, accuracy) {
    this.maxDistance = Math.max(size[0], Math.max(size[1], size[2]));
    this.accuracy = (typeof(accuracy) !== 'undefined') ? accuracy : this.maxDistance / 1000;
    this.root = new Octree.Cell(this, position, size, 0);
  }

  Octree.fromBoundingBox = function(bbox) {
    return new Octree(Vec3.clone(bbox.min), Vec3.clone(bbox.getSize()));
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
        var distSq = Vec3.squaredDistance(p, o);
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
    return p[0] >= this.position[0] - this.tree.accuracy
        && p[1] >= this.position[1] - this.tree.accuracy
        && p[2] >= this.position[2] - this.tree.accuracy
        && p[0] <= this.position[0] + this.size[0] + this.tree.accuracy
        && p[1] <= this.position[1] + this.size[1] + this.tree.accuracy
        && p[2] <= this.position[2] + this.size[2] + this.tree.accuracy;
  }

  // 1 2 3 4
  // 5 6 7 8
  Octree.Cell.prototype.split = function() {
    var x = this.position[0];
    var y = this.position[1];
    var z = this.position[2];
    var w2 = this.size[0]/2;
    var h2 = this.size[1]/2;
    var d2 = this.size[2]/2;

    this.children.push(new Octree.Cell(this.tree, Vec3.fromValues(x, y, z), Vec3.fromValues(w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.fromValues(x + w2, y, z), Vec3.fromValues( w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.fromValues(x, y, z + d2), Vec3.fromValues( w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.fromValues(x + w2, y, z + d2), Vec3.fromValues( w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.fromValues(x, y + h2, z), Vec3.fromValues(w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.fromValues(x + w2, y + h2, z), Vec3.fromValues( w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.fromValues(x, y + h2, z + d2), Vec3.fromValues( w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.fromValues(x + w2, y + h2, z + d2), Vec3.fromValues( w2, h2, d2), this.level + 1));

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
        var distSq = Vec3.squaredDistance(this.points[i], p);
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
    var newVertex = new HEVertex(newVertexPos[0], newVertexPos[1], newVertexPos[2]);
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
    var newVertPos = Vec3.clone(edge.next.vert.position);
    Vec3.sub(newVertPos, newVertPos, edge.vert.position);
    Vec3.scale(newVertPos, newVertPos, ratio);
    Vec3.add(newVertPos, newVertPos, edge.vert.position);

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
define('pex/geom/Edge',[], function() {
  function Edge(a, b) {
    this.a = a;
    this.b = b;
  }

  return Edge;
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
      this.vertices.push(new HEVertex(pos[0], pos[1], pos[2]));
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

    if (geometry) {
      geometry.assureSize(numVertices);
    }
    else {
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
        Vec3.copy(positions[vertexIndex+0], faceVertices[0].position);
        Vec3.copy(positions[vertexIndex+1], faceVertices[1].position);
        Vec3.copy(positions[vertexIndex+2], faceVertices[2].position);
        Vec3.copy(normals[vertexIndex+0], faceNormal/*faceVertices[0].getNormal()*/);
        Vec3.copy(normals[vertexIndex+1], faceNormal/*faceVertices[1].getNormal()*/);
        Vec3.copy(normals[vertexIndex+2], faceNormal/*faceVertices[2].getNormal()*/);
        vertexIndex += 3;
      }
      else if (faceVertices.length == 4) {
        Vec3.copy(positions[vertexIndex+0], faceVertices[0].position);
        Vec3.copy(positions[vertexIndex+1], faceVertices[1].position);
        Vec3.copy(positions[vertexIndex+2], faceVertices[3].position);
        Vec3.copy(positions[vertexIndex+3], faceVertices[3].position);
        Vec3.copy(positions[vertexIndex+4], faceVertices[1].position);
        Vec3.copy(positions[vertexIndex+5], faceVertices[2].position);
        Vec3.copy(normals[vertexIndex+0], faceNormal/*faceVertices[0].getNormal()*/);
        Vec3.copy(normals[vertexIndex+1], faceNormal/*faceVertices[1].getNormal()*/);
        Vec3.copy(normals[vertexIndex+2], faceNormal/*faceVertices[3].getNormal()*/);
        Vec3.copy(normals[vertexIndex+3], faceNormal/*faceVertices[3].getNormal()*/);
        Vec3.copy(normals[vertexIndex+4], faceNormal/*faceVertices[1].getNormal()*/);
        Vec3.copy(normals[vertexIndex+5], faceNormal/*faceVertices[2].getNormal()*/);
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
      Vec3.sub(a, center, e.vert.position);
      Vec3.sub(b, center, e.next.vert.position);
      Vec3.scale(a, a, offset);
      Vec3.scale(b, b, offset);
      Vec3.add(a, a, e.vert.position);
      Vec3.add(b, b, e.next.vert.position);
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
        var newVertexPos = Vec3.clone(normal);
        Vec3.scale(newVertexPos, newVertexPos, height);
        Vec3.add(newVertexPos, newVertexPos, edgeToSplit.vert.position);

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
      Vec3.add(edgePoint, edgePoint, edge.vert.position);
      Vec3.add(edgePoint, edgePoint, edge.next.vert.position);
      Vec3.add(edgePoint, edgePoint, edge.face.facePoint);
      Vec3.add(edgePoint, edgePoint, edge.pair.face.facePoint);
      Vec3.scale(edgePoint, edgePoint, 1/4);

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
        Vec3.add(F, F, face.facePoint);
        Vec3.add(R, R, faceEdge.edgePoint);
        ++n
        faceEdge = faceEdge.pair.next;
        face = faceEdge.face;
      } while(faceEdge != vertex.edge);
      Vec3.scale(F, F, 1/n);
      Vec3.scale(R, R, 1/n);

      var newVert = Vec3.create();
      Vec3.add(newVert, F, R);
      var scaledVertex = Vec3.clone(vertex.position);
      Vec3.scale(scaledVertex, scaledVertex, n - 2);
      Vec3.add(newVert, newVert, scaledVertex);
      Vec3.scale(newVert, newVert, 1/n);

      //we can't simply duplicate vertex and make operations on it
      //as dup() returns Vec3 not HEVertex
      Vec3.copy(vertex.position, newVert);
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

define('pex/geom/hem',
  [
    'pex/geom/hem/HEMesh',
    'pex/geom/hem/HESelection',
    'pex/geom/hem/HEMarking',
    'pex/geom/hem/HEGeometryConverter',
    'pex/geom/hem/HEExtrude',
    'pex/geom/hem/HECatmullClark',
  ],
  function(HEMesh, HESelection, HEMarking, HEGeometryConverter, HEExtrude, HECatmullClark) {
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
    'pex/geom/Mat3',
    'pex/geom/Mat4',
    'pex/geom/Quat',
    'pex/geom/Geometry',
    'pex/geom/gen',
    'pex/geom/Face3',
    'pex/geom/Face4',
    'pex/geom/FacePolygon',
    'pex/geom/Vec2Array',
    'pex/geom/Vec3Array',
    'pex/geom/Vec4Array',
    'pex/geom/Line2D',
    'pex/geom/Rect',
    'pex/geom/Triangle2D',
    'pex/geom/Polygon2D',
    'pex/geom/hem',
    'pex/geom/BoundingBox',
    'pex/geom/Octree'
  ],
  function(Vec2, Vec3, Vec4, Mat3, Mat4, Quat, Geometry, gen,
    Face3, Face4, FacePolygon, Vec2Array, Vec3Array, Vec4Array, Line2D, Rect, Triangle2D, Polygon2D, hem, 
    BoundingBox, Octree) {
    return {
      Vec2 : Vec2,
      Vec3 : Vec3,
      Vec4 : Vec4,
      Mat3 : Mat3,
      Mat4 : Mat4,
      Quat : Quat,
      Geometry : Geometry,
      gen : gen,
      Face3 : Face3,
      Face4 : Face4,
      FacePolygon : FacePolygon,
      Vec2Array : Vec2Array,
      Vec3Array : Vec3Array,
      Vec4Array : Vec4Array,
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

define('lib/seedrandom.js',[], function() { //added by Marcin Ignac

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

define('pex/utils/MathUtils',['lib/seedrandom.js', 'pex/geom/Vec2', 'pex/geom/Vec3'], function(seedrandom, Vec2, Vec3) {
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
    return Vec3.fromValues(x * r, y * r, z * r);
  }

  MathUtils.randomVec3InBoundingBox = function(bbox) {
    var x = bbox.min[0] + Math.random() * (bbox.max[0] - bbox.min[0]);
    var y = bbox.min[1] + Math.random() * (bbox.max[1] - bbox.min[1]);
    var z = bbox.min[2] + Math.random() * (bbox.max[2] - bbox.min[2]);
    return Vec3.fromValues(x, y, z);
  }

  MathUtils.randomVec2InRect = function(rect) {
    return Vec2.fromValues(rect.x + Math.random() * rect.width, rect.y + Math.random() * rect.height);
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
define('pex/gl/Context',[], function() {
  function Context(gl) {
    this.gl = gl;
  }

  Context.currentContext = new Context(null);

  return Context;
});
define('pex/sys/Window',['pex/sys/Platform', 'pex/sys/Node', 'pex/utils/Time', 'pex/sys/BrowserWindow', 'pex/gl/Context'],
  function(Platform, Node, Time, BrowserWindow, Context) {
  var plask;

  function Window() {
  }

  Window.create = function(obj) {
    var gl = null;
    var context = null;

    obj.__init = obj.init;
    obj.init = function() {
      gl = this.gl;
      context = new Context(gl);
      Context.currentContext = context;
      if (obj.__init) {
        obj.framerate(60); //default to 60fps
        obj.__init();
      }
    }

    obj.__draw = obj.draw;
    obj.draw = function() {
      Time.update();
      Context.currentContext = context;
      if (obj.__draw) {
        obj.__draw();
      }
    }

    if (Platform.isPlask) return Node.plask.simpleWindow(obj);
    else if (Platform.isBrowser) return BrowserWindow.simpleWindow(obj);
  }

  return Window;

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

define('pex/gl/Program',['pex/gl/Context', 'pex/sys/IO'], function(Context, IO) {
  var kShaderPrefix         = '#ifdef GL_ES\nprecision highp float;\n#endif\n';
  var kVertexShaderPrefix   = kShaderPrefix + '#define VERT\n';
  var kFragmentShaderPrefix = kShaderPrefix + '#define FRAG\n';

  function Program(vertSrc, fragSrc) {
    this.gl = Context.currentContext.gl;

    this.handle = this.gl.createProgram();
    this.uniforms  = {};
    this.attributes = {};
    this.addSources(vertSrc, fragSrc);
    this.ready = false;
    if (this.vertShader && this.fragShader) this.link();
  }

  Program.prototype.addSources = function(vertSrc, fragSrc) {
    vertSrc = vertSrc ? vertSrc : null;
    fragSrc = fragSrc ? fragSrc : vertSrc;

    if (vertSrc) this.addVertexSource(vertSrc);
    if (fragSrc) this.addFragmentSource(fragSrc);
  };

  Program.prototype.addVertexSource = function(vertSrc) {
    var gl = this.gl;
    var vert = this.vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vert, kVertexShaderPrefix + vertSrc + '\n');
    gl.compileShader(vert);
    if (!gl.getShaderParameter(vert, gl.COMPILE_STATUS)) {
      //console.log(vertSrc);
      throw gl.getShaderInfoLog(vert);
    }
  };

  Program.prototype.addFragmentSource = function(fragSrc) {
    var gl = this.gl;
    var frag = this.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(frag, kFragmentShaderPrefix + fragSrc + '\n');
    gl.compileShader(frag);
    if (!gl.getShaderParameter(frag, gl.COMPILE_STATUS)) {
      //console.log(fragSrc);
      throw gl.getShaderInfoLog(frag);
    }
  };

  Program.prototype.link = function(){
    var gl = this.gl;
    var handle = this.handle;

    gl.attachShader(handle, this.vertShader);
    gl.attachShader(handle, this.fragShader);
    gl.linkProgram(handle);

    if (!gl.getProgramParameter(handle, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(handle);
    }

    var numUniforms = gl.getProgramParameter(handle, gl.ACTIVE_UNIFORMS);

    for(var i = 0; i < numUniforms; ++i){
      var info     = gl.getActiveUniform(handle, i);
      var location = gl.getUniformLocation(handle, info.name);
      this.uniforms[info.name] = makeUniformSetter(gl, info.type, location);
    }

    var numAttributes = gl.getProgramParameter(handle, gl.ACTIVE_ATTRIBUTES);
    for(var i = 0; i < numAttributes; ++i){
      var info     = gl.getActiveAttrib(handle, i);
      var location = gl.getAttribLocation(handle, info.name);
      this.attributes[info.name] = location;
    }

    this.ready = true;
    return this;
  };

  Program.prototype.use = function(){
    this.gl.useProgram(this.handle);
  };

  Program.prototype.dispose = function(){
    this.gl.deleteShader(this.vertShader);
    this.gl.deleteShader(this.fragShader);
    this.gl.deleteProgram(this.handle);
  };

  Program.load = function(url, callback, options) {
    var program = new Program();
    IO.loadTextFile(url, function(source) {
      console.log('Program.Compiling ' + url);
      program.addSources(source);
      program.link();
      if (callback) callback();

      if (options && options.autoreload) {
        IO.watchTextFile(url, function(source) {
          try {
            program.gl.detachShader(program.handle, program.vertShader);
            program.gl.detachShader(program.handle, program.fragShader);
            program.addSources(source);
            program.link();
          }
          catch(e) {
            console.log('Progra.load : failed to reload ' + url);
            console.log(e);
          }
        })
      }
    });
    return program;
  }

  function makeUniformSetter(gl, type, location){
    var setterFun = null;
    switch(type){
      case gl.BOOL:
      case gl.INT:
      case gl.SAMPLER_2D:
      case gl.SAMPLER_CUBE:
        setterFun = function(value){
          if (isNaN(value)) {
            gl.uniform1i(location, value.handle);
          }
          else {
            gl.uniform1i(location, value);
          }
        };
        break;
      case gl.FLOAT:
        setterFun = function(value){
          gl.uniform1f(location, value);
        };
        break;
      case gl.FLOAT_VEC2:
        setterFun = function(v){
          gl.uniform2fv(location, v);
        };
        break;
      case gl.FLOAT_VEC3:
        setterFun = function(v) {
          gl.uniform3fv(location, v);
        };
        break;
      case gl.FLOAT_VEC4:
        setterFun = function(v){
          gl.uniform4fv(location, v);
        };
        break;
      case gl.FLOAT_MAT4:
        setterFun = function(mv) {
          gl.uniformMatrix4fv(location, false, mv);
        };
        break;
    }

    if (setterFun) {
      setterFun.type = type;
      return setterFun;
    }
    return function(){
      throw 'Unknown uniform type: ' + type;
    };
  }

  return Program;
});
define('pex/gl/Mesh',['pex/gl/Context', 'pex/geom/Vec3', 'pex/geom/Quat', 'pex/geom/Mat4', 'pex/geom/Face3', 'pex/geom/Face4'],
function(Context, Vec3, Quat, Mat4, Face3, Face4) {
  function Mesh(geometry, material, options) {
    this.gl = Context.currentContext.gl;
    this.geometry = geometry;
    this.material = material;
    options = options || {};

    this.gl = Context.currentContext.gl;
    this.primitiveType = (options.primitiveType !== undefined) ? options.primitiveType : this.gl.TRIANGLES;
    this.attributes = {};
    this.usage = this.gl.STATIC_DRAW;

    this.addAttrib('position', geometry.attribs.position.data, geometry.attribs.position.elementSize);
    if (geometry.attribs.normal) this.addAttrib('normal', geometry.attribs.normal.data, geometry.attribs.normal.elementSize);
    if (geometry.attribs.texCoord) this.addAttrib('texCoord', geometry.attribs.texCoord.data, geometry.attribs.texCoord.elementSize);
    if (geometry.attribs.color) this.addAttrib('color', geometry.attribs.color.data, geometry.attribs.color.elementSize);

    this.position = Vec3.fromValues(0, 0, 0);
    this.rotation = Quat.create();
    this.scale = Vec3.fromValues(1, 1, 1);
    this.modelWorldMatrix = Mat4.create();
    this.modelViewMatrix = Mat4.create();
    this.rotationMatrix = Mat4.create();
    this.normalMatrix = Mat4.create();

    this.updateIndices(geometry);
  }

  Mesh.prototype.updateMatrices = function(camera) {
    Mat4.fromQuat(this.rotationMatrix, this.rotation);

    Mat4.identity(this.modelWorldMatrix);
    Mat4.translate(this.modelWorldMatrix, this.modelWorldMatrix, this.position);
    Mat4.mul(this.modelWorldMatrix, this.modelWorldMatrix, this.rotationMatrix);
    Mat4.scale(this.modelWorldMatrix, this.modelWorldMatrix, this.scale);

    Mat4.copy(this.modelViewMatrix, camera.getViewMatrix());
    Mat4.mul(this.modelViewMatrix, this.modelViewMatrix, this.modelWorldMatrix);

    Mat4.copy(this.normalMatrix, this.modelViewMatrix);
    Mat4.invert(this.normalMatrix, this.normalMatrix);
    Mat4.transpose(this.normalMatrix, this.normalMatrix);
  }

  Mesh.prototype.updateIndices = function(geometry) {
    if (this.indices === undefined) {
      this.indices = {};
      this.indices.buffer = this.gl.createBuffer();
    }
    var data = [];
    if (geometry.faces.length > 0) {
      geometry.faces.forEach(function(face) {
        if (face instanceof Face4) {
          data.push(face.a);
          data.push(face.b);
          data.push(face.d);
          data.push(face.d);
          data.push(face.b);
          data.push(face.c);
        }
        if (face instanceof Face3) {
          data.push(face.a);
          data.push(face.b);
          data.push(face.c);
        }
      });
    }
    this.indices.data = new Uint16Array(data);
    var oldArrayBinding = this.gl.getParameter(this.gl.ELEMENT_ARRAY_BUFFER_BINDING);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices.data, this.usage);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, oldArrayBinding);
  }

  Mesh.prototype.addAttrib = function(name, data, elementSize, usage) {
    elementSize = elementSize || 3
    usage = usage || this.usage;

    var attrib = {};
    attrib.name = name;
    attrib.data = data;
    attrib.dataBuf = data.buf;
    attrib.elementSize = elementSize;
    attrib.location = -1;
    attrib.buffer = this.gl.createBuffer();
    attrib.usage = usage;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attrib.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, attrib.dataBuf, usage);

    this.attributes[attrib.name] = attrib;
  }

  Mesh.prototype.draw = function(camera) {
    var programUniforms = this.material.program.uniforms;
    var materialUniforms = this.material.uniforms;
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

    var program = this.material.program;
    for(var name in this.attributes) {
      var attrib = this.attributes[name];
      /*
      TODO:this should go another way
      instad of searching for mesh atribs in shader
      look for required attribs by shader inside mesh
      */
      if (attrib.location === undefined || attrib.location == -1) {
        attrib.location = this.gl.getAttribLocation(program.handle, attrib.name);
      }
      if (attrib.location >= 0) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attrib.buffer);
         if (this.geometry.attribs[name].isDirty) {
          attrib.dataBuf = this.geometry.attribs[name].data.buf;
          if (this.geometry.attribs[name].type == 'Vec3') {
            this.geometry.attribs[name].data.forEach(function(v, i) {
              attrib.dataBuf[i*3 + 0] = v[0];
              attrib.dataBuf[i*3 + 1] = v[1];
              attrib.dataBuf[i*3 + 2] = v[2];
            })
          }
          if (this.geometry.attribs[name].type == 'Vec2') {
            this.geometry.attribs[name].data.forEach(function(v, i) {
              attrib.dataBuf[i*2 + 0] = v[0];
              attrib.dataBuf[i*2 + 1] = v[1];
            })
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
    }
    else if (this.attributes['position']) {
      var num = this.attributes['position'].dataBuf.length/3;
      this.gl.drawArrays(this.primitiveType, 0, num);
    }

    for(var name in this.attributes) {
      var attrib = this.attributes[name];
      if (attrib.location >= 0) {
        this.gl.disableVertexAttribArray(attrib.location);
      }
    }
  }

  Mesh.prototype.resetAttribLocations = function() {
    for(var name in this.attributes) {
      var attrib = this.attributes[name];
      attrib.location = -1;
    }
  }

  Mesh.prototype.getMaterial = function() {
    return this.material;
  }

  Mesh.prototype.setMaterial = function(material) {
    this.material = material;
    this.resetAttribLocations();
  }

  Mesh.prototype.getProgram = function() {
    return this.material.program;
  }

  Mesh.prototype.setProgram = function(program) {
    this.material.program = program;
    this.resetAttribLocations();
  }

  return Mesh;
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
      screenSize : Vec2.fromValues(screenWidth, screenHeight),
      pixelPosition : Vec2.fromValues(x, y),
      pixelSize : Vec2.fromValues(w, h),
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

    geometry.attribs.position.data.buf.set([
      -1,  1,
       1,  1,
       1, -1,
      -1, -1
    ]);

    geometry.attribs.texCoord.data.buf.set([
       0, 1,
       1, 1,
       1, 0,
       0, 0
    ]);

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
  'pex/geom/Vec4',
  'pex/utils/ObjectUtils',
  'lib/text!pex/materials/SolidColor.glsl'
  ], function(Material, Context, Program, Vec4, ObjectUtils, SolidColorGLSL) {

  function SolidColor(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(SolidColorGLSL);

    var defaults = {
     color : Vec4.fromValues(1, 1, 1, 1),
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
  'pex/geom/Vec4',
  'lib/text!pex/materials/ShowDepth.glsl'
  ], function(Material, Context, Program, ObjectUtils, Vec4, ShowDepthGLSL) {

  function ShowDepth(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(ShowDepthGLSL);

    var defaults = {
      near: 0,
      far: 10,
      nearColor: Vec4.fromValues(0, 0, 0, 1),
      farColor: Vec4.fromValues(1, 1, 1, 1)
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
  'pex/geom/Vec4',
  'lib/text!pex/materials/Diffuse.glsl'
  ], function(Material, Context, Program, ObjectUtils, Vec3, Vec4, DiffuseGLSL) {

  function Diffuse(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(DiffuseGLSL);

    var defaults = {
      wrap: 1,
      pointSize : 1,
      lightPos : Vec3.fromValues(10, 20, 30),
      ambientColor : Vec4.fromValues(0, 0, 0, 1),
      diffuseColor : Vec4.fromValues(1, 1, 1, 1)
    };

    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);

    Material.call(this, program, uniforms);
  }

  Diffuse.prototype = Object.create(Material.prototype);

  return Diffuse;
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
  ],
  function(SolidColor, ShowNormals, Textured, ShowTexCoords, ShowDepth, ShowColors, PackDepth, Diffuse) {
    return {
      SolidColor : SolidColor,
      ShowNormals : ShowNormals,
      Textured : Textured,
      ShowTexCoords : ShowTexCoords,
      ShowDepth : ShowDepth,
      ShowColors : ShowColors,
      PackDepth : PackDepth,
      Diffuse : Diffuse
    };
  }
);

define('pex/scene/Camera',['pex/geom'], function(geom) {
  var Vec2 = geom.Vec2;
  var Vec3 = geom.Vec3;
  var Vec4 = geom.Vec4;
  var Mat4 = geom.Mat4;

  function Camera(fov, aspectRatio, near, far, position, target, up) {

    this.fov = fov || 60;
    this.aspectRatio = aspectRatio || 4/3;
    this.near = near || 0.1;
    this.far = far || 100;
    this.position = position || Vec3.fromValues(0, 0, 5);

    this.target = target || Vec3.fromValues(0, 0, 0);
    this.up = up || Vec3.fromValues(0, 1, 0);
    this.projectionMatrix = Mat4.create();
    this.viewMatrix = Mat4.create();
    this.updateMatrices();
  }

  Camera.prototype.setPosition = function(position) {
    this.position = position;
    this.updateMatrices();
  }

  Camera.prototype.getPosition = function() {
    return this.position;
  }

  Camera.prototype.setTarget = function(target) {
    this.target = target;
    this.updateMatrices();
  }

  Camera.prototype.getTarget = function() {
    return this.target;
  }

  Camera.prototype.setUp = function(up) {
    this.up = up;
    this.updateMatrices();
  }

  Camera.prototype.getUp = function() {
    return this.up;
  }

  Camera.prototype.lookAt = function(target, eyePosition, up) {
    if (target) this.target = target;
    if (eyePosition) this.position = eyePosition;
    if (up) this.up = up;
    this.updateMatrices();
  }


  Camera.prototype.setNear = function(near) {
    this.near = near;
    this.updateMatrices();
  }

  Camera.prototype.getNear = function() {
    return this.near;
  }

  Camera.prototype.setFar = function(far) {
    this.far = far;
    this.updateMatrices();
  }

  Camera.prototype.getFar = function() {
    return this.far;
  }

  Camera.prototype.setFov = function(fov) {
    this.fov = fov;
    this.updateMatrices();
  }

  Camera.prototype.getFov = function() {
    return this.fov;
  }

  Camera.prototype.setAspectRatio = function(ratio) {
    this.aspectRatio = ratio;
    this.updateMatrices();
  }

  Camera.prototype.getAspectRatio = function() {
    return this.aspectRatio;
  }

  Camera.prototype.getViewMatrix = function() {
    return this.viewMatrix;
  }

  Camera.prototype.getProjectionMatrix = function() {
    return this.projectionMatrix;
  }

  Camera.prototype.updateMatrices = function() {
    Mat4.perspective(this.projectionMatrix, this.fov / 180 * Math.PI, this.aspectRatio, this.near, this.far);
    Mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
  }

  var tmpPoint = Vec4.create();
  var projected = Vec4.create();

  Camera.prototype.getScreenPos = function(out, point, windowWidth, windowHeight) {
    Vec4.set(tmpPoint, point[0], point[1], point[2], 1.0);

    Vec4.transformMat4(projected, tmpPoint, this.viewMatrix);
    Vec4.transformMat4(projected, projected, this.projectionMatrix);
    Vec2.set(out, projected[0], projected[1]);

    out[0] /= projected[3];
    out[1] /= projected[3];
    out[0] = out[0] * 0.5 + 0.5;
    out[1] = out[1] * 0.5 + 0.5;
    out[0] *= windowWidth;
    out[1] *= windowHeight;
  }

  return Camera;
});
define('pex/scene/Arcball',['pex/geom/Vec2', 'pex/geom/Vec3', 'pex/geom/Vec4', 'pex/geom/Quat', 'pex/geom/Mat4'], 
  function(Vec2, Vec3, Vec4, Quat, Mat4) {
  function Arcball(window, camera, distance) {
    this.distance = distance || 2;
    this.minDistance = distance/2 || 0.3;
    this.maxDistance = distance*2 || 5;
    this.camera = camera;
    this.window = window;
    this.radius = Math.min(window.width/2, window.height/2) * 2;
    this.center = Vec2.fromValues(window.width/2, window.height/2);
    this.currRot = Quat.create();
    Quat.setAxisAngle(this.currRot, Vec3.fromValues(0, 1, 0), Math.PI/4);
    this.clickRot = Quat.create();
    this.dragRot = Quat.create();
    this.clickPos = Vec3.create();
    this.dragPos = Vec3.create();
    this.rotAxis = Vec3.create();
    this.allowZooming = true;
    this.enabled = true;

    this.updateCamera();

    var self = this;
    window.on('leftMouseDown', function(e) {
      if (e.handled || !self.enabled) return;
      self.down(e.x, self.window.height - e.y); //we flip the y coord to make rotating camera work
    });

    window.on('mouseDragged', function(e) {
      if (e.handled || !self.enabled) return;
      self.drag(e.x, self.window.height - e.y); //we flip the y coord to make rotating camera work
    });

    window.on('scrollWheel', function(e) {
      if (e.handled || !self.enabled) return;
      if (!self.allowZooming) return;
      self.distance = Math.min(self.maxDistance, Math.max(self.distance + e.dy/100*(self.maxDistance-self.minDistance), self.minDistance));
      self.updateCamera();
    });
  }

  Arcball.prototype.mouseToSphere = function(x, y) {
    var v = Vec3.fromValues((x - this.center[0]) / this.radius, -(y - this.center[1]) / this.radius, 0);

    var dist = (v[0] * v[0]) + (v[1] * v[1]);
    if (dist > 1) {
      Vec3.normalize(v, v);
    }
    else {
      v[2] = Math.sqrt( 1.0 - dist );
    }
    return v;
  }

  Arcball.prototype.down = function(x, y) {
    this.clickPos = this.mouseToSphere(x, y);
    console.log(this.clickPos[0], this.clickPos[1], this.clickPos[2])
    Quat.copy(this.clickRot, this.currRot);
    this.updateCamera();
  }

  Arcball.prototype.drag = function(x, y) {
    this.dragPos = this.mouseToSphere(x, y);
    Vec3.cross(this.rotAxis, this.clickPos, this.dragPos);
    var theta = Vec3.dot(this.clickPos, this.dragPos);
    console.log(theta)
    Quat.set(this.dragRot, this.rotAxis[0], this.rotAxis[1], this.rotAxis[2], theta);
    Quat.mul(this.currRot, this.dragRot, this.clickRot);
    this.updateCamera();
  }

  Arcball.prototype.updateCamera = function() {
    //Based on [apply-and-arcball-rotation-to-a-camera](http://forum.libcinder.org/topic/apply-and-arcball-rotation-to-a-camera) on Cinder Forum.
    var q = Quat.clone(this.currRot);
    q[3] *= -1;

    var target = Vec3.fromValues(0, 0, 0);
    var offset = Vec3.create();
    Vec3.transformQuat(offset, Vec3.fromValues(0, 0, this.distance), q)
    var eye = Vec3.create();
    Vec3.sub(eye, target, offset);
    var up = Vec3.create();
    Vec3.transformQuat(up, Vec3.fromValues(0, 1, 0), q);
    this.camera.lookAt(target, eye, up);
  }

  Arcball.prototype.disableZoom = function() {
    this.allowZooming = false;
  }

  return Arcball;
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
    program.uniforms.imageSize(Vec2.fromValues(source.width, source.height));
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
    program.uniforms.imageSize(Vec2.fromValues(source.width, source.height));
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
    programH.uniforms.imageSize(Vec2.fromValues(source.width, source.height));
    rth.bindAndClear();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, source, programH);
    rth.unbind();

    var programV = this.getShader(Blur3VGLSL);
    programV.use();
    programV.uniforms.imageSize(Vec2.fromValues(source.width, source.height));
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
    programH.uniforms.imageSize(Vec2.fromValues(source.width, source.height));
    rth.bindAndClear();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, source, programH);
    rth.unbind();

    var programV = this.getShader(Blur5VGLSL);
    programV.use();
    programV.uniforms.imageSize(Vec2.fromValues(source.width, source.height));
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
    programH.uniforms.imageSize(Vec2.fromValues(source.width, source.height));
    rth.bindAndClear();
    source.bind();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, source, programH);
    rth.unbind();

    var programV = this.getShader(Blur7VGLSL);
    programV.use();
    programV.uniforms.imageSize(Vec2.fromValues(source.width, source.height));
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
    program.uniforms.textureSize(Vec2.fromValues(depthSource.width, depthSource.height));
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
    Vec2.set(this.mousePos, e.x - this.x, e.y - this.y);
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
          var hitY = this.mousePos[1] - this.activeControl.activeArea.y;
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
//Module wrapper for the whole Pex library.
define('pex',
  [
    'pex/geom',
    'pex/utils',
    'pex/sys',
    'pex/gl',
    'pex/materials',
    'pex/scene',
    'pex/fx',
    'pex/gui'
  ],
  function(geom, utils, sys, gl, materials, scene, fx, gui) {
    return {
      geom : geom,
      utils : utils,
      sys : sys,
      gl : gl,
      materials : materials,
      scene : scene,
      fx : fx,
      require : sys.Require, //shortcut,
      gui : gui
    };
  }
);
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