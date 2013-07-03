//Module wrapper for utility classes.
define(
  [
    'pex/utils/Log',
    'pex/utils/Time',
    'pex/utils/ObjectUtils',
    'pex/utils/MathUtils',
    'pex/utils/ArrayUtils',
    'pex/utils/ObjReader',
    'pex/utils/ObjWriter'
  ],
  function(Log, Time, ObjectUtils, MathUtils, ArrayUtils, ObjReader, ObjWriter) {
    return {
      Log : Log,
      Time : Time,
      ObjectUtils : ObjectUtils,
      MathUtils : MathUtils,
      ArrayUtils : ArrayUtils,
      ObjReader : ObjReader,
      ObjWriter : ObjWriter
    };
  }
);
