[![Build Status](https://travis-ci.org/dakom/pure3d.svg?branch=master)](https://travis-ci.org/dakom/pure3d)

## Pure3D

### WORK-IN-PROGRESS: There _will_ be breaking changes and what's there is sometimes purposefully broken too ;)

## [DEMO](https://dakom.github.io/pure3d/#DAMAGED_HELMET)

## What it will be:

* Pipeline to split between pure scene data and ready-to-rock renderer
* Pure scene here means it can be immutable _and_ completely serializable into primitives (hopefully just numbers)
* Very simple API surface (e.g. "load, animate, transform, render")
* Stands on the foundation of [webgl-simple](https://github.com/dakom/webgl-simple) to optimize and skip unnecessary low-level webgl calls (and can share the context)
* Follows the same idea here - e.g. batching shaders with the same source, re-using buffers, etc.
* Geared for a functional pipeline
* Initial focus is GLTF, via the reference PBR shader from Khronos Group (hence WebGL1 only for now)
* Uses Fluture for initial loading (therefore Sanctuary and Fluture are peer dependencies)
* Some helpers to drive transform updates and animations
* Fully exported Typescript definitions

## What it probably won't be:

* A full engine (bring your own physics, sound, input, particle emitters, etc.)
* A hub for added functionality (the idea is for projects to build on and around this rather than add to it, similar to the webgl-simple relationship)
* Optimized beyond the low-level (bring your own culling)
* Bleeding edge / state of the art (e.g. GLTF extensions at the proposal stage are not on the radar)

## What it might be later:

* Built on WebGL 2
* Supporting more extensions
* Some more simple helpers to make piecing together an engine easier (e.g. get bounding boxes)
