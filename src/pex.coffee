#Module wrapper for the whole Pex library.
define (require) ->
  geom = require('pex/geom')
  utils = require('pex/utils')
  sys = require('pex/sys')
  gl = require('pex/gl')
  materials = require('pex/materials')
  scene = require('pex/scene')
  fx = require('pex/fx')
  gui = require('pex/gui')

  return {
    geom,
    utils,
    sys,
    gl,
    materials,
    scene,
    fx,
    require : sys.Require, #shortcut,
    gui
  }
