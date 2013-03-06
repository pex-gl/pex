define(["pex/sys/Platform"], function(Platform) {
  function Test() {
  }

  if (Platform.isPlask) Test.msg = "Hello Node!";
  if (Platform.isBrowser) Test.msg = "Hello World Wide Web!";

  return Test;
});