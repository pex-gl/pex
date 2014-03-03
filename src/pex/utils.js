//Module wrapper for utility classes.
define([
  'pex/utils/Log',
  'pex/utils/Time',
  'pex/utils/ObjectUtils',
  'pex/utils/MathUtils',
  'pex/utils/ArrayUtils',
  'pex/utils/ObjReader',
  'pex/utils/ObjWriter',
  'pex/utils/MovieRecorder'
], function (Log, Time, ObjectUtils, MathUtils, ArrayUtils, ObjReader, ObjWriter, MovieRecorder) {
  return {
    Log: Log,
    Time: Time,
    ObjectUtils: ObjectUtils,
    MathUtils: MathUtils,
    ArrayUtils: ArrayUtils,
    ObjReader: ObjReader,
    ObjWriter: ObjWriter,
    MovieRecorder: MovieRecorder
  };
});