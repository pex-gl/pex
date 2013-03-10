//Module wrapper for utility classes.
define(
  [
    "pex/utils/Log",
    "pex/utils/Time",
    "pex/utils/ObjectUtils"
  ],
  function(Log, Time, ObjectUtils) {
    return {
      Log : Log,
      Time : Time,
      ObjectUtils : ObjectUtils
    };
  }
);
