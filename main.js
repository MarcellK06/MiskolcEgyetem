import * as THREE from 'three';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 35;
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// POOL SETTINGS
const poolRotation = new THREE.Vector3(15, -0.2, 0);
const poolPosition = new THREE.Vector3(0, -3, 0);

// POOL OBJECT
const poolGeometry = new THREE.BoxGeometry(20, 10, 5);
const poolMaterial = new THREE.MeshBasicMaterial({color: 0xfffffff, side:THREE.DoubleSide , transparent:true, opacity: 0.1});

// POOL OUTLINE/BORDER
const poolObject = new THREE.Mesh(poolGeometry, poolMaterial);
const poolOutline = new THREE.LineSegments(new THREE.EdgesGeometry(poolGeometry), new THREE.LineBasicMaterial({color: 0xffffff}));

// APPLY SETTINGS
poolObject.rotation.setFromVector3(poolRotation);
poolObject.position.y = poolPosition.y;
poolOutline.rotation.setFromVector3(poolRotation);
poolOutline.position.y = poolPosition.y;

scene.add(poolObject);
scene.add(poolOutline);
function animate() {
	requestAnimationFrame( animate );

	renderer.render( scene, camera );
}
animate();