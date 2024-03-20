import * as THREE from 'three';

import fs from 'vite-plugin-fs/browser'
const gyongyPath = "./gyongyok.txt"

/**
 * @param {THREE.Vector3Like} v3 A gyöngy Vector3 adata
 * @param {number} e A gyöngy értéke 
 */
class gyongyData {
    constructor(v3, e) {
        this.v3 = v3;
        this.e = e;
    }
}

// READ AND SEPERATE LINES FOR FILE
const gyongyfile = await fs.readFile('./gyongyok.txt');
const gyongyfilelines = gyongyfile.split('\n');

// LIST TO STORE GYONGY DATA INTO
var allGyongyData = [];

// VECTOR3 VARIABLE TO DETERMINE FUTURE MAX SIZE OF POOL
var maxPositions = new THREE.Vector3(0, 0, 0);

// LOOP THROUGH LINES
for(var k = 1; k < gyongyfilelines.length; k++) {
    // CLEAN END OF LINE
    gyongyfilelines[k] = gyongyfilelines[k].substring(0, gyongyfilelines[k].lastIndexOf(';'));

    // BREAK LINE INTO PARTS AND STORE THEM TO CORRESPONDING VARIABLES
    var parts = gyongyfilelines[k].split(';');
    var x = parseInt(parts[0]),
        y=parseInt(parts[1]),
        z = parseInt(parts[2]),
        e = parseInt(parts[3]);

    // CHECK IF BIGGER SIZE IF NEEDED
    if (x > maxPositions.x) maxPositions.x = x;
    if (y > maxPositions.y) maxPositions.y = y;
    if (z > maxPositions.z) maxPositions.z = z;

    // ADD GYONGY TO THE LIST
    allGyongyData.push(new gyongyData(new THREE.Vector3(x, y, z), e))
}



// SET UP SCENE, CAMERA AND RENDERER
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// POOL SETTINGS
const poolRotation = new THREE.Vector3(15, 0, 0);
const poolPosition = new THREE.Vector3(0, 0, 0);

// POOL OBJECT
const poolGeometry = new THREE.BoxGeometry(maxPositions.x, maxPositions.y, maxPositions.z);
const poolMaterial = new THREE.MeshBasicMaterial({color: 0xfffffff, side:THREE.DoubleSide , transparent:true, opacity: 0.1});

// POOL OUTLINE/BORDER
const poolObject = new THREE.Mesh(poolGeometry, poolMaterial);
const poolOutline = new THREE.LineSegments(new THREE.EdgesGeometry(poolGeometry), new THREE.LineBasicMaterial({color: 0xffffff}));

// POOL DATA
var poolBoundingBoxData = [poolGeometry.center().boundingBox.min, poolGeometry.center().boundingBox.max];
const poolBordersLineGeometry = new THREE.BufferGeometry().setFromPoints(poolBoundingBoxData);
const poolBordersLine = new THREE.Line(poolBordersLineGeometry, THREE.poolMaterial);

// GYONGY SETUP
const gyongyMaterial = new THREE.MeshBasicMaterial({color: 0xffde59});

for(var k = 0; k < allGyongyData.length; k++) {
    const gyongyGeometry = new THREE.SphereGeometry(allGyongyData[k].e/10);
    const gyongyObject = new THREE.Mesh(gyongyGeometry, gyongyMaterial);
    poolObject.add(gyongyObject);
    gyongyObject.position.setX(poolBoundingBoxData[0].x + allGyongyData[k].v3.x);
    gyongyObject.position.setY(poolBoundingBoxData[0].y + allGyongyData[k].v3.y);
    gyongyObject.position.setZ(poolBoundingBoxData[0].z + allGyongyData[k].v3.z);
}

// APPLY SETTINGS
poolObject.rotation.setFromVector3(poolRotation);
poolOutline.rotation.setFromVector3(poolRotation);
poolBordersLine.position.y = poolPosition.y;
poolBordersLine.rotation.setFromVector3(poolRotation);

camera.position.x = 0;
camera.position.y = -70;
camera.position.z = 80;
camera.rotation.x += .4;

// ADD OBJECTS
scene.add(poolObject);
scene.add(poolOutline);
scene.add(poolBordersLine);
function animate() {
	requestAnimationFrame( animate );

	renderer.render( scene, camera );
}
animate();