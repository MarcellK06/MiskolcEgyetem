import * as THREE from 'three';
//import Stats from 'stats.js'
import fs from 'vite-plugin-fs/browser'

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

// STATS FOR PERFORMANCE
//const stats = new Stats()

// LIST TO STORE GYONGY DATA INTO
var allGyongyData = [];

// VECTOR3 VARIABLE TO DETERMINE FUTURE MAX SIZE OF POOL
var maxPositions = new THREE.Vector3(0, 0, 0);

var t = 0;
var v = 0;
var totalE = 0;

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

// SORT BY ÉRTÉK; EASIER PATH PLANNING
allGyongyData.sort((a, b) => b.e - a.e);

// SET UP SCENE, CAMERA AND RENDERER
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// POOL SETTINGS
const poolRotation = new THREE.Vector3(1.57, 0, 0);
const poolPosition = new THREE.Vector3(0, 0, 0);

// POOL OBJECT
const poolGeometry = new THREE.BoxGeometry(maxPositions.x, maxPositions.y, maxPositions.z);
const poolMaterial = new THREE.MeshBasicMaterial({color: 0xfffffff, side:THREE.DoubleSide , transparent:true, opacity: 0.1});

// POOL OUTLINE/BORDER
const poolObject = new THREE.Mesh(poolGeometry, poolMaterial);
const poolOutline = new THREE.LineSegments(new THREE.EdgesGeometry(poolGeometry), new THREE.LineBasicMaterial({color: 0xffffff}));
scene.add(poolObject);
scene.add(poolOutline);

// POOL DATA
var poolBoundingBoxData = [poolGeometry.center().boundingBox.min, poolGeometry.center().boundingBox.max];

/* DEBUG - POOL HALFER
const poolBordersLineGeometry = new THREE.BufferGeometry().setFromPoints(poolBoundingBoxData);
const poolBordersLine = new THREE.Line(poolBordersLineGeometry, THREE.poolMaterial);
*/

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

// ADD ORIGIN

const origin = poolBoundingBoxData[0];
const originGeometry = new THREE.SphereGeometry(2);
const originMaterial = new THREE.MeshBasicMaterial({color: 0xe4080a});
const originObject = new THREE.Mesh(originGeometry, originMaterial);
originObject.position.x = origin.x;
originObject.position.y = origin.y;
originObject.position.z = origin.z;
poolObject.add(originObject);

// APPLY SETTINGS

/* DEBUG - POOL HALFER
poolBordersLine.position.y = poolPosition.y;
poolBordersLine.rotation.setFromVector3(poolRotation);
*/

// CAMERA SETTINGS

// CALCULATE DIRECTION
const direction = new THREE.Vector3(poolObject.position.x - camera.position.x, poolObject.position.y - camera.position.y, poolObject.position.z - camera.position.z);
direction.normalize();
const distance = camera.position.distanceTo(poolBoundingBoxData[0]);
camera.translateOnAxis(direction, distance);
var distanceToMiddle = 0;
// GET FURTHEST POINT
for(var k = 0; k < poolBoundingBoxData.length; k++) {
    if (poolBoundingBoxData[k].x > distanceToMiddle)
        distanceToMiddle = poolBoundingBoxData[k].x;
    if (poolBoundingBoxData[k].y > distanceToMiddle)
        distanceToMiddle = poolBoundingBoxData[k].y;
    if (poolBoundingBoxData[k].z > distanceToMiddle)
        distanceToMiddle = poolBoundingBoxData[k].z;
}

distanceToMiddle *= 2;
camera.position.z += distanceToMiddle;

// MOVE CAMERA
var keyStates = {};    
window.addEventListener('keydown',function(e){
    keyStates[e.keyCode] = true;
},true);    
window.addEventListener('keyup',function(e){
    keyStates[e.keyCode] = false;
},true);

function moveLoop() {
    var xDirection = 0;
    var yDirection = 0;
    if (keyStates[83]) yDirection -= 1;
    if (keyStates[87]) yDirection += 1;
    if (keyStates[65]) xDirection -= 1;
    if (keyStates[68]) xDirection += 1;

    const lookDirection = new THREE.Vector3();
    poolObject.getWorldDirection(lookDirection);
    poolRotation.y -= xDirection * 0.01;
    poolRotation.x -= yDirection * 0.01;
    poolObject.rotation.setFromVector3(poolRotation);
    poolOutline.rotation.setFromVector3(poolRotation);
    setTimeout(moveLoop, 16.66);
}    


function storeValues() {
    t = document.getElementById('time').value;
    v = document.getElementById('speed').value;
}

function startRobot() {
    storeValues();
}

// STATS FOR PERFORMANCE
//stats.showPanel(0) 

//document.body.appendChild(stats.dom)

function animate() {
    //stats.begin();

	requestAnimationFrame( animate );

    camera.lookAt(poolObject.position);


	renderer.render( scene, camera );

    //stats.end();
}

moveLoop();
animate();