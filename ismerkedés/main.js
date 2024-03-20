import * as THREE from 'three';
import { seededRandom } from 'three/src/math/MathUtils';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.domElement.id = "renderer";
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const geometry = new THREE.SphereGeometry(1);
const material = new THREE.MeshBasicMaterial( { color:  0x43ff6480} );
material.opacity = 0.1;
const cube = new THREE.Mesh( geometry, material );
const cube2 = new THREE.Mesh( geometry, material );
scene.add( cube );
scene.add( cube2 );
camera.position.z = 5;
var canvas = document.getElementById("renderer");
canvas.addEventListener("click", async () => {
    await canvas.requestPointerLock();
  });
document.onkeydown = move;

function move(event) {
    if (event.keyCode == 87)
    camera.position.z -= 1;
    if (event.keyCode == 83)
    camera.position.z += 1;
    if (event.keyCode == 65)
    camera.position.x -= 1;
    if (event.keyCode == 68)
    camera.position.x += 1;
}
document.addEventListener("mousemove", (event) => {
    camera.rotation.y += event.movementX * -.01;
    camera.rotation.x += event.movementY * -.01;
    if (camera.rotation.x >= 1)
        camera.rotation.x = 1;
        if (camera.rotation.x <= -1)
            camera.rotation.x = -1;
    camera.rotation.z = 0;
});
var gravity = 9.81 * .01;
var maxRenderDistance = 25;
function animate() {
	requestAnimationFrame( animate );
    cube.rotation.x += seededRandom(27634278423) * .1;
    cube.rotation.y += seededRandom(27643534634278423) * .1;
    cube.rotation.z += seededRandom(27633727524278423) * .1;
    cube2.position.x = 5;
    cube2.rotation.x += seededRandom(27634278423) * .1;
    cube2.rotation.y += seededRandom(27643534634278423) * .1;
    cube2.rotation.z += seededRandom(27633727524278423) * .1;
    for(var k = 0; k < scene.children.length; k++) {
    var item = scene.children[k];
    if (item.position.distanceTo(camera.position) > maxRenderDistance)
        item.visible = false;
        else
            item.visible = true;
            
    }
	renderer.render( scene, camera );
}
animate();