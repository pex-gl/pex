//Module wrapper for utility classes.
define(
  [
    'pex/utils/Log',
    'pex/utils/Time',
    'pex/utils/ObjectUtils',
    'pex/utils/MathUtils'
  ],
  function(Log, Time, ObjectUtils, MathUtils) {
    return {
      Log : Log,
      Time : Time,
      ObjectUtils : ObjectUtils,
      MathUtils : MathUtils
    };
  }
);
