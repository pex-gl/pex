//Module wrapper for utility classes.
define(
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
