//Module wrapper for platform (Plask vs web browsers) related classes.
define([
  "pex/sys/IO",
  "pex/sys/Window"
  ],
  function(IO, Window) {
    return {
      IO : IO,
      Window : Window
    };
});