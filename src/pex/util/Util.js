//Module wrapper for utility classes.
define([
  "pex/util/Log", 
  "pex/util/ObjUtils", 
  "pex/util/Time", 
  "pex/util/RandUtils", 
  "pex/util/GLUtils"
  ], 
  function(Log, ObjUtils, Time, RandUtils, GLUtils) {
    return {
      Log : Log,
      ObjUtils : ObjUtils,
      Time : Time,
      RandUtils : RandUtils,
      GLUtils : GLUtils
    };
  }
);
