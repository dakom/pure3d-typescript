import {Spherical, PositionCamera} from "../../../Types";
import {createSpherical} from "../math/Spherical";
import {createVec2, createVec3, createQuat, createVec4, createMat4} from "../array/Array";

export enum ORBIT_CAMERA_STATE { 
    NONE = -1, 
    ROTATE = 0, 
    DOLLY = 1, 
    PAN = 2, 
    TOUCH_ROTATE = 3, 
    TOUCH_DOLLY_PAN = 4 
};

/* Ported from THREE.JS Orbit Camera. Original authors:
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or arrow keys / touch: two-finger move

export const initializeDomController = (domElement) => {
	// The four arrow keys
//	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// Mouse buttons
//	this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };
    //// Set to false to disable use of the keys
//	this.enableKeys = true;


}

export const createOrbitCamera = (camera:PositionCamera) => ({
        ...camera,

	// Set to false to disable this control
        enabled: true,

	// "target" sets the location of focus, where the object orbits around
        target: createVec3().fill(0),

	// How far you can dolly in and out ( PerspectiveCamera only )
	minDistance: 0,
        maxDistance: Infinity,

	// How far you can zoom in and out ( OrthographicCamera only )
	minZoom: 0,
	maxZoom: Infinity,

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	minPolarAngle: 0, // radians
	maxPolarAngle: Math.PI, // radians

	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	minAzimuthAngle: - Infinity, // radians
	maxAzimuthAngle: Infinity, // radians

	// Set to true to enable damping (inertia)
	// If damping is enabled, you must call controls.update() in your animation loop
	enableDamping: false,
	dampingFactor: 0.25,

	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	// Set to false to disable zooming
	enableZoom: true,
	zoomSpeed: 1.0,

	// Set to false to disable rotating
	enableRotate: true,
	rotateSpeed: 1.0,

	// Set to false to disable panning
	enablePan: true,
	panSpeed: 1.0,
	screenSpacePanning: false, // if true, pan in screen-space
	keyPanSpeed: 7.0,	// pixels moved per arrow key push

	// Set to true to automatically rotate around the target
	// If auto-rotate is enabled, you must call controls.update() in your animation loop
	autoRotate: false,
	autoRotateSpeed: 2.0, // 30 seconds per round when fps is 60


	state: ORBIT_CAMERA_STATE.NONE,

	EPS: 0.000001,

	// current position in spherical coordinates
	spherical: createSpherical(),
	sphericalDelta: createSpherical(),

	scale: 1,
	panOffset: createVec3().fill(0), 
	zoomChanged: false,

	rotateStart: createVec2().fill(0),
	rotateEnd: createVec2().fill(0),
	rotateDelta: createVec2().fill(0),

	panStart: createVec2().fill(0),
	panEnd: createVec2().fill(0),
	panDelta: createVec2().fill(0),

	dollyStart: createVec2().fill(0),
	dollyEnd: createVec2().fill(0),
	dollyDelta: createVec2().fill(0)
});
