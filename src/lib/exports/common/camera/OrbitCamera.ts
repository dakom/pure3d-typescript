import {OrbitCamera, Spherical, PositionCamera} from "../../../Types";
import {createSpherical} from "../math/Spherical";
import {createVec2, createVec3, createQuat, createVec4, createMat4} from "../array/Array";
import {quat} from "gl-matrix";

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

export const createOrbitCamera = (camera:PositionCamera) => {
    const _c = {
        ...camera,

	// Set to false to disable this control
        enabled: true,

	// "target" sets the location of focus, where the object orbits around
        target: createVec3(),

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

        //internals
	scale: 1,
	panOffset: createVec3(), 
	zoomChanged: false,

	rotateStart: createVec2(),
	rotateEnd: createVec2(),
	rotateDelta: createVec2(),

	panStart: createVec2(),
	panEnd: createVec2(),
	panDelta: createVec2(),

	dollyStart: createVec2(),
	dollyEnd: createVec2(),
	dollyDelta: createVec2(),


        //update
        offset: createVec3(),
        //"quat" interferes with glmatrix, and the camera doesn't have a preset upvector, so it's [0,1,0]
        rQuat: quat.rotationTo(createQuat(), Float64Array.from([0,1,0]), Float64Array.from([0,1,0])), 

        rQuatInverse: createQuat(),
    }

    quat.invert(_c.rQuatInverse, _c.rQuat);

    return _c;
}


export const updateOrbitCamera = (camera:OrbitCamera):OrbitCamera => {
    const offset = camera.offset.slice();
    const position = camera.offset.slice();
    const spherical = Object.assign({}, camera.spherical);


/*
			var position = scope.object.position;

			offset.copy( position ).sub( scope.target );

			// rotate offset to "y-axis-is-up" space
			offset.applyQuaternion( quat );

			// angle from z-axis around y-axis
			spherical.setFromVector3( offset );

			if ( scope.autoRotate && state === STATE.NONE ) {

				rotateLeft( getAutoRotationAngle() );

			}

			spherical.theta += sphericalDelta.theta;
			spherical.phi += sphericalDelta.phi;

			// restrict theta to be between desired limits
			spherical.theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, spherical.theta ) );

			// restrict phi to be between desired limits
			spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );

			spherical.makeSafe();


			spherical.radius *= scale;

			// restrict radius to be between desired limits
			spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );

			// move target to panned location
			scope.target.add( panOffset );

			offset.setFromSpherical( spherical );

			// rotate offset back to "camera-up-vector-is-up" space
			offset.applyQuaternion( quatInverse );

			position.copy( scope.target ).add( offset );

			scope.object.lookAt( scope.target );

			if ( scope.enableDamping === true ) {

				sphericalDelta.theta *= ( 1 - scope.dampingFactor );
				sphericalDelta.phi *= ( 1 - scope.dampingFactor );

				panOffset.multiplyScalar( 1 - scope.dampingFactor );

			} else {

				sphericalDelta.set( 0, 0, 0 );

				panOffset.set( 0, 0, 0 );

			}

			scale = 1;

			// update condition is:
			// min(camera displacement, camera rotation in radians)^2 > EPS
			// using small-angle approximation cos(x/2) = 1 - x^2 / 8

			if ( zoomChanged ||
				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

				scope.dispatchEvent( changeEvent );

				lastPosition.copy( scope.object.position );
				lastQuaternion.copy( scope.object.quaternion );
				zoomChanged = false;

				return true;

			}

			return false;

		};
    */
    return camera;
}
