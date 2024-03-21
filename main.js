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
allGyongyData.sort((a, b) =>  b.e - a.e || a.v3.x - b.v3.x);

// SET UP SCENE, CAMERA AND RENDERER
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// POOL SETTINGS
const poolRotation = new THREE.Vector3(180 * (180/Math.PI), 0, 0);
const poolPosition = new THREE.Vector3(0, 0, 0);

// ROBOT OBJECT
const robotRadius = 1;
const robotGeometry = new THREE.SphereGeometry(robotRadius);
const robotMaterial = new THREE.MeshBasicMaterial({color: 0xff00ff});
const robotObject = new THREE.Mesh(robotGeometry, robotMaterial);
// POOL OBJECT
const poolGeometry = new THREE.BoxGeometry(maxPositions.x, maxPositions.y, maxPositions.z);
const poolMaterial = new THREE.MeshBasicMaterial({color: 0xfffffff, side:THREE.DoubleSide , transparent:true, opacity: 0.1});
const poolObject = new THREE.Mesh(poolGeometry, poolMaterial);
scene.add(poolObject);
poolObject.add(robotObject);

// POOL OUTLINE/BORDER
const poolOutline = new THREE.LineSegments(new THREE.EdgesGeometry(poolGeometry), new THREE.LineBasicMaterial({color: 0xffffff}));
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
allGyongyData = null;
// ADD ORIGIN

const origin = poolBoundingBoxData[0];
const originGeometry = new THREE.SphereGeometry(2);
const originMaterial = new THREE.MeshBasicMaterial({color: 0xe4080a, side:THREE.DoubleSide , transparent:true, opacity: 0.4});
const originObject = new THREE.Mesh(originGeometry, originMaterial);
originObject.position.x = origin.x;
originObject.position.y = origin.y;
originObject.position.z = origin.z;
poolObject.add(originObject);

// APPLY SETTINGS

robotObject.position.set(originObject.position.x, originObject.position.y, originObject.position.z);
robotObject.rotation.x = 0;
robotObject.rotation.y = 0;
robotObject.rotation.z = 0;
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
    runScript();
}
function reset() {
    window.location = "";
}

var movedAway = false;
var goHome = false;
function runScript() {
    const s = robotObject.position.distanceTo(poolObject.children[1].position)
    const sO = robotObject.position.distanceTo(originObject.position)
    const Tn = s / v;
    var tO = sO / v;
    if(!movedAway) {
    const distFromFirstToOrigin = poolObject.children[1].position.distanceTo(originObject.position) / v;
    const canStart = t >= Tn + distFromFirstToOrigin;
        if (!canStart){ 
            alert("Not enough time to get to the first point and back.");    
            return;
        }
    }

    var normalizedTowards0nth = new THREE.Vector3();
    if ((t+0.1 <= tO && movedAway != false) || goHome) {
        goHome = true;
        normalizedTowards0nth.x = originObject.position.x - robotObject.position.x;
        normalizedTowards0nth.y = originObject.position.y - robotObject.position.y - 1;
        normalizedTowards0nth.z = originObject.position.z - robotObject.position.z - 1;
        normalizedTowards0nth.normalize();
        if (Math.floor(robotObject.position.x) != originObject.position.x - 1)
            robotObject.translateOnAxis(new THREE.Vector3(normalizedTowards0nth.x, 0, 0), v/16.66);
        if (Math.floor(robotObject.position.y) != originObject.position.y - 1)
            robotObject.translateOnAxis(new THREE.Vector3(0, normalizedTowards0nth.y, 0), v/16.66);   
        if (Math.floor(robotObject.position.z) != originObject.position.z - 1)
            robotObject.translateOnAxis(new THREE.Vector3(0, 0, normalizedTowards0nth.z), v/16.66);   
    }
    else {
    normalizedTowards0nth.x = poolObject.children[1].position.x - robotObject.position.x;
    normalizedTowards0nth.y = poolObject.children[1].position.y - robotObject.position.y;
    normalizedTowards0nth.z = poolObject.children[1].position.z - robotObject.position.z;
    normalizedTowards0nth.normalize();
    if (Math.floor(robotObject.position.x) != poolObject.children[1].position.x)
        robotObject.translateOnAxis(new THREE.Vector3(normalizedTowards0nth.x, 0, 0), v/16.66);
    if (Math.floor(robotObject.position.y) != poolObject.children[1].position.y)
        robotObject.translateOnAxis(new THREE.Vector3(0, normalizedTowards0nth.y, 0), v/16.66);   
    if (Math.floor(robotObject.position.z) != poolObject.children[1].position.z)
        robotObject.translateOnAxis(new THREE.Vector3(0, 0, normalizedTowards0nth.z), v/16.66);   
    }

    if (Math.floor(robotObject.position.x) == Math.floor(poolObject.children[1].position.x) && Math.floor(robotObject.position.y) == Math.floor(poolObject.children[1].position.y) && Math.floor(robotObject.position.z) == Math.floor(poolObject.children[1].position.z))
    {
        poolObject.children.splice(1, 1);

        totalE += Math.floor(parseFloat(poolObject.children[1].geometry.boundingSphere.radius) * 10);
        movedAway = true;
    }

    t -= 16.66/1000;
    document.getElementById('points').innerHTML = totalE;
    if (t > 0)
        setTimeout(runScript, 16.66);
        
}

// EXPOSE startRobot() and reset() AS THIS JS FILE IS ORIGINALLY IMPORTED AS A MODULE
window.startRobot = startRobot;
window.reset = reset;

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