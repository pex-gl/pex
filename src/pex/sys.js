//Module wrapper for sys classes.
define([
  'pex/sys/IO',
  'pex/sys/Node',
  'pex/sys/Require',
  'pex/sys/Platform',
  'pex/sys/Window'
], function (IO, Node, Require, Platform, Window) {
  return {
    IO: IO,
    Node: Node,
    Require: Require,
    Platform: Platform,
    Window: Window
  };
});