[![Build Status](https://travis-ci.org/dakom/pure3d.svg?branch=master)](https://travis-ci.org/dakom/pure3d)

## Pure3D

## **WORK-IN-PROGRESS: There will be breaking changes and what's there is sometimes purposefully broken too ;)**

## [DEMO](https://dakom.github.io/pure3d/#/gltf/DAMAGED_HELMET_BINARY)

## Remaining Features

See [Issue Tracker](https://github.com/dakom/pure3d/issues)

## What it is: 

* For DIY renderers - a generic abstraction to make working with WebGL a bit more more fun and simple, without sacrificing any power.
* For batteries included - a GLTF renderer with super easy API surface.

## How it works

See [Wiki](https://github.com/dakom/pure3d/wiki) for more details

* Generic layer automatically optimizes and skip unnecessary low-level webgl calls.
* Gltf layer has strong separation of concerns to make interop with functional frameworks, workers, and wasm a bit more organic.
* Some pure functional helpers to drive transform updates and animations (not forced into render pipeline)
* Fully exported Typescript definitions

## What it probably won't be:

* A full game engine (bring your own physics, sound, input, particle emitters, etc.)
* Bleeding edge / state of the art (e.g. GLTF extensions at the proposal stage are not on the radar)

## What it hopes to be later:

* WebGL 2 added functionality / speed gains
* Supporting more GLTF extensions, lighting and shadow techniques, etc.
* Some more simple helpers to make piecing together an engine easier (e.g. get bounding boxes, drawInstanced, etc.)

## Story behind it

It's a rite of passage to make your own WebGL renderer while learning it. This is my attempt :D
I also wanted something that can work more organically with declarative languages and immutable data

## Peer-Dependencies

* Uses Fluture for initial loading (therefore Sanctuary and Fluture are peer dependencies)

