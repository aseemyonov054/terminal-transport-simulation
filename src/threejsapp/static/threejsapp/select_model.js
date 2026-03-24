import * as THREE from 'three';
import { TWEEN } from 'tween';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

// scene description
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x34e1eb );

var axes = new THREE.AxesHelper( 20 );
//axes.position.y = 10
scene.add(axes);

//camera description
var animation_container = document.getElementById("animation_screen");
const camera = new THREE.PerspectiveCamera( 75, 800 / 600, 0.1, 20000 );

//renderer description
const renderer = new THREE.WebGLRenderer();
renderer.setSize( 800, 600 );
//document.body.appendChild( renderer.domElement );
animation_container.appendChild( renderer.domElement )

camera.position.z = 50;
camera.position.y = 50;
camera.position.x = 50;

//light
const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( light );

// controls settings
const controls = new OrbitControls( camera, renderer.domElement );

// load model
const loader = new GLTFLoader();
loader.load(
    load_model_path,
    function ( gltf ) {
        var cont_ship = gltf.scene;
        /*cont_ship.scale.x = 0.15;
        cont_ship.scale.y = 0.15;
        cont_ship.scale.z = 0.15;*/
        
        /*cont_ship.position.z = list_of_points[0][1][0];
        cont_ship.position.x = list_of_points[0][1][1];
        cont_ship.position.y = 3;
        cont_ship.rotation.y = 3.14 / 2;*/
        cont_ship.name = "loaded_model";
        scene.add(cont_ship);

    },
    // called while loading is progressing
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    function ( error ) {
        console.log( 'An error happened' );
        console.log(error);
    }
);

// model update
var old_selection = document.getElementById("list_of_models").value;

function update_selection_model(selection){
    var current_model = scene.getObjectByName("loaded_model");
    scene.remove(current_model);
    if(selection == "-"){
        var geometry = new THREE.BoxGeometry( 5, 5, 10 );
        var material = new THREE.MeshBasicMaterial( { color: 0xeb6e34 } );
        var cube0 = new THREE.Mesh( geometry, material );
        cube0.name = "loaded_model";
        scene.add(cube0)
    }else{
        loader.load(
            selection,
            function ( gltf ) {
                var cont_ship = gltf.scene;
                cont_ship.name = "loaded_model";
                scene.add(cont_ship);
            },
            // called while loading is progressing
            function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            function ( error ) {
                console.log( 'An error happened' );
                console.log(error);
            }
        );
    }
}

// main animation funtion
function animate() {
	TWEEN.update();
    controls.update();
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
    var new_selection = document.getElementById("list_of_models").value;
    if(new_selection != old_selection){
        old_selection = new_selection;
        console.log(new_selection);
        update_selection_model(new_selection);
    }
}

animate();