[![Build Status](https://travis-ci.org/dakom/pure3d.svg?branch=master)](https://travis-ci.org/dakom/pure3d)

## Pure3D

## **WORK-IN-PROGRESS: There will be breaking changes and what's there is sometimes purposefully broken too ;)**

## [DEMO](https://dakom.github.io/pure3d/#DAMAGED_HELMET_BINARY)

# Roadmap

## Core WebGL Abstraction (done for now)

## GlTF Models

- [x] Simple
- [ ] Complex
- [ ] Pbr Set 1
- [ ] Pbr Set 2
- [ ] Feature Test

## Remaining Features

See [Issue Tracker](https://github.com/dakom/pure3d/issues)

## What it is: 

* An abstraction to make working with WebGL a bit more more fun and simple, without sacrificing any power.
* Automatically optimize and skip unnecessary low-level webgl calls, as well as batch GLTF things.
* Pure separation of data and rendering to make interop with functional frameworks, workers, and wasm a bit more organic.
* Multi-layered approach for writing bare-metal renderers or batteries-included GLTF 
* Very simple API surface (e.g. "load, animate, transform, render")
* Some pure helpers to drive transform updates and animations (not forced into render pipeline)
* Fully exported Typescript definitions

## What it probably won't be:

* A full game engine (bring your own physics, sound, input, particle emitters, etc.)
* A full rendering engine, beyond the low-level primitives (bring your own culling)
* Bleeding edge / state of the art (e.g. GLTF extensions at the proposal stage are not on the radar)

## What it hopes to be later:

* WebGL 2 added functionality / speed gains
* Supporting more GLTF extensions (esp the official ones: lights, webgl-shader, etc.)
* Some more simple helpers to make piecing together an engine easier (e.g. get bounding boxes, drawInstanced, etc.)

## Peer-Dependencies

* Uses Fluture for initial loading (therefore Sanctuary and Fluture are peer dependencies)
