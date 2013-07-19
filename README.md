# Pex

![Pex](assets/pex.jpg)

Pex is a JavaScript/CoffeScript 3d utility library for WebGL.

Examples of use
http://marcinignac.com/experiments/technology/webgl/  
http://marcinignac.com/projects/technology/webgl/  
http://variable.io/ (All WebGL projects)  
http://www.flickr.com/photos/marcinignac/sets/72157629801608107/  

## FAQ

1. How it compares to ThreeJS?

	ThreeJS is focusing on simplifying your experience with WebGL by hiding the hard parts and exposing an API that's easy to start with. It has better community support, better tools import/export support and it's well tested, solid code that you can confortably use for your production projects.

2. Why did you do Pex then?

	Pex has different goals in mind. It's simplifying coding but there is more boilerplate code to be written with aim to give you more controll over what and when is happening. While ThreeJS is targetting browsers, Pex primary target is [Plask](http://plask.org). It is written in a way that works in any WebGL capable browser out of the box and even on iOS with [Ejecta](https://github.com/phoboslab/ejecta). Pex is written in a modular way with [RequireJS](http://requirejs.org), ThreeJS achieves similar goals with namespacing in Three

3. What does Pex mean?

	Pex stands for PlaskExtensions as it hass started as a set of utility functions for my [Plask](http://plask.org) projects.