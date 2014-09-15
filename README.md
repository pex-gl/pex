# Pex 

Pex is a javascript 3d library / engine allowing for seamless development between Plask and WebGL in the browser.

## Introduction

##### What is pex?

Pex (plask extentions) is simply a collection of JavaScript modules the combination of which becomes a powerful 3D graphics library for the desktop and web.

There are a few main points you need to understand to grok what Pex is all about:

1. Pex is based on Plask. Plask is a JavaScript multimedia programming environment for the desktop. Plask is a magical bridge between your favourite JavaScript world and a collection of C++ libraries for 3D graphics, audio and video playback and others.
But Plask, essentially, is a node.js program - meaing...

2. Pex is node.js code, too. You download the modules from npm, require them and you write 3D graphics. Naturally, you can use any other module from the enormous npm ecosystem in your program. 

3. As aforementioned Plask runs as a desktop application. Pex extends it to the web using WebGL. In other words, you can run your Pex program as a standalone desktop application or directly in a browser that supports WebGl. No changes in the code whatsoever. To top the cake, like Three.jS, you can run it on iOS using Ejecta:
https://github.com/phoboslab/ejecta

4. And finally, to answer your question - yes, Pex could be considered an alternative to Three.js. We are big fans of Three but we believe that every software or library should have an alternative. If you want to write WebGL, it should not mean you must use Three. Variety in every ecosystem is vital. We will expand on the technical differences later. 

##### How to use

This seems like a lot of text but don't be scared! I'ts really easy, especially if you have Node.js and npm installed.

1. As you already know, Pex uses Plask to run as a desktop application. To do this you will need to download Plask from here: http://www.plask.org/  
Plask is an awesome project so be sure to check out the source: https://github.com/deanm/plask  

2. You will need to install Node.js and npm. If you already have them - skip to the next step. Otherwise go to http://nodejs.org/ for further instructions on how to install Node.js on your machine. 

3. There are a few ways to get pex up and running. All of the pex modules are on npm so you could for example install them one by one or put them in your package.json. You could also do:  
`$ npm install pex`  
which installs everything neceserry to run pex, an example program to get started quickly, documentation and examples. However instead of doing this for every new project or copying files over manually we recommend installing pex-init:
`$ npm install pex-init`  
The next step would be to run:  
`$ pex-init --help`  
to list all options so you choose and run what you want or just:
`$ pex-init exampleApp`  
`$ cd exampleApp`  
`$ npm install`  
Now all you have to do is either run: 
`$ npm run watch`
which launches a new browser tab with the example app and watches for changes in **main.js** (where your pex program is) or you run **main.js** in Plask. You can open the index.html document manually and while that would work just fine since your Pex source code needs to be browserified changing **main.js** and saving wouldn't change what you see. You can usually use a gulp or grunt script instead of a npm script to watch and build **main.js** by adding the `-g --grunt` or `-u --gulp` flag when creating a new app with pex-init. For more info check out: 
https://github.com/vorg/pex-init

4. Play around with the example! If you made it this far all you need to do now is dive into the amazing world of 3D graphics. The example app is a basic cube. But Pex comes with a lot more awesome examples so try them all out, copy pasta some code to make some neat stuff and dive into the docs. 

##### Technical differences with Three.js

// Rewrite ?

ThreeJS is focusing on simplifying your experience with WebGL by hiding the hard parts and exposing an API that's easy to start with. It has better community support, better tools import/export support and it's well tested, solid code that you can confortably use for your production projects.  

Pex has different goals in mind. It's simplifying coding but there is more boilerplate code to be written with aim to give you more controll over what and when is happening. While ThreeJS is targetting browsers, Pex primary target is Plask. It is written in a way that works in any WebGL capable browser out of the box and even on iOS with Ejecta. Pex is written in a modular way with RequireJS, ThreeJS achieves similar goals with namespacing in Three

##### Community 
1. We love github issues!
2. Follow @marcinignac on twitter - main author.
// Who else? Szymon? Me? :o
3. We are on #pex on freenode.
4. // Mailing list ?
// Anything else ?

##### Projects showcase
// Well, your stuff 






![Pex](assets/pex.jpg)

Pex is a JavaScript/CoffeScript 3d utility library for WebGL.

Examples of use
http://marcinignac.com/experiments/technology/webgl/  
http://marcinignac.com/projects/technology/webgl/  
http://variable.io/ (All WebGL projects)  
http://www.flickr.com/photos/marcinignac/sets/72157629801608107/  

## How to start?

1. Download [latest Pex source](https://github.com/vorg/pex/archive/master.zip).
2. Download [Plask](http://plask.org).
3. Unpack .DMG and open PlaskLauncher.
4. Click File->Open and choose one of Pex examples e.g. pex-master/examples/basic/basic.js
5. You should see a cube. You can rotate it by dragging the mouse.

# How to use Pex in Plask?

1. Make sure the example from above runs
2. Create new folder
3. Copy there `pex.js` from pex-master/build/pex.js
4. Create `main.js` in the same folder and copy this code:

```JavaScript
var pex = require('pex.js');

pex.sys.Window.create({
  settings: {
    width: 1280,
    height: 720
  },
  init: function() {
    //your setup things like texture loading goes here
  },
  draw: function() {
    this.gl.clearColor(0.3,0.3,0.3,1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    //your drawing code goes here
  }
});
```

5. Open main.js with PlaskLauncher.
6. You should see a window with grey background

# How to use Pex in the browser*?
1. Follow steps 1-4 from "How to use in Plask from scratch?"
2. Change frist line in `main.js` to `var pex = pex || require('pex.js');` or remove it completely if you don't plan to use pex with Plask.
3. In the same folder copy `require.js` from pex-master/build/require.js
4. Create `index.html` in the same folder with the following code:

```HTML
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pex</title>
  <script type="text/javascript" src="require.js"></script>
  <script type="text/javascript" src="pex.js"></script>
  <script type="text/javascript" src="main.js"></script>
</head>
<body>
</body>
</html>
```

4. Open `index.html` in the browser
5. You should see a grey rectangle

* the borwser must support WebGL in order for Pex to work.

## Using with Sublime Text

Opening and relaunching with PlaskLauncher is tedious so I [added a Build System](http://www.sublimetext.com/docs/build):

`Plask.sublime-build`

```JSON
{
  "cmd" : [
    "/path/to/PlaskLauncher.app/Contents/Resources/Plask.app/Contents/MacOS/Plask", 
    "$file"
  ]
}
```

## FAQ

**How does it compare to ThreeJS?**

[ThreeJS](http://threejs.org) is focusing on simplifying your experience with WebGL by hiding the hard parts and exposing an API that's easy to start with. It has better community support, better tools import/export support and it's well tested, solid code that you can confortably use for your production projects.

**Why did you make Pex then?**

Pex has different goals in mind. It's simplifying coding but there is more boilerplate code to be written with aim to give you more controll over what and when is happening. While ThreeJS is targetting browsers, Pex primary target is [Plask](http://plask.org). It is written in a way that works in any WebGL capable browser out of the box and even on iOS with [Ejecta](https://github.com/phoboslab/ejecta). Pex is written in a modular way with [RequireJS](http://requirejs.org), ThreeJS achieves similar goals with namespacing in Three

**What does Pex mean?**

Pex stands for PlaskExtensions as it hass started as a set of utility functions for my [Plask](http://plask.org) projects.