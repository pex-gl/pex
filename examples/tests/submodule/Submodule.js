define(['submodule/Submodule2'], function(Submodule2) {
  return {
    hello: 'Hello from submodule! and ' + Submodule2.hello
  };
});
