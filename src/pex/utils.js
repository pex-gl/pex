//Module wrapper for utility classes.
define(
  [
    "pex/utils/Log",
    "pex/utils/Time",
    "pex/utils/Object"
  ],
  function(Log, Time, Object) {
    return {
      Log : Log,
      Time : Time,
      Object : Object
    };
  }
);
