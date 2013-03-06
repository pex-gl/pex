//Module wrapper for utility classes.
define(
  [
    "pex/utils/Log",
    "pex/utils/Time"
  ],
  function(Log, Time) {
    return {
      Log : Log,
      Time : Time
    };
  }
);
