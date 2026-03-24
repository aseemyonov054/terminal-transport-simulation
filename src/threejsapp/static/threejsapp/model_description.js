import * as THREE from 'three';
import { TWEEN } from 'tween';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MapControls } from 'three/addons/controls/MapControls.js';
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
renderer.outputColorSpace = THREE.SRGBColorSpace;
//document.body.appendChild( renderer.domElement );
animation_container.appendChild( renderer.domElement )

camera.position.z = 50;
camera.position.y = 50;
camera.position.x = 50;

//light
const light = new THREE.AmbientLight( 0xffffff, 1 );
scene.add( light );
const dirLight = new THREE.DirectionalLight( 0xffffff, 2 );
dirLight.position.set( 100, -200, -100 );
scene.add( dirLight );

// earth
const earth_geometry = new THREE.PlaneGeometry( img_width, img_height );
var earth_material;
if(image_path){
    earth_material = new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load(image_path), side: THREE.DoubleSide});
}else{
    earth_material = new THREE.MeshBasicMaterial( {color: 0x30b355, side: THREE.DoubleSide} );
}
const earth_plane = new THREE.Mesh( earth_geometry, earth_material );
earth_plane.position.z = 0;
earth_plane.position.x = 0; 
earth_plane.rotation.x = -90 * 3.14 / 180
earth_plane.rotation.z = -90 * 3.14 / 180
scene.add( earth_plane )

// controls settings
const controls = new MapControls( camera, renderer.domElement );
controls.enableDamping = true;

// cube in the center
const geometry = new THREE.BoxGeometry( 5, 5, 10 );
const material = new THREE.MeshBasicMaterial( { color: 0xeb6e34 } );
const geometry_cube0 = new THREE.BoxGeometry( 20, 10, 10 );
var cube0 = new THREE.Mesh( geometry_cube0, material );
cube0.position.x = 0;
cube0.position.z = 30;
cube0.position.y = 5;
//cube0.rotation.y = list_of_points[0][2] * 3.14 / 180;
//scene.add(cube0);

//var system_counter = 0;
var tweens_list = [];
var list_of_cubes = [];

// fucntion updates charts
function update_chart(system_counter, i, j){
    if(list_of_processes[system_counter].list_of_events["Car_" + String(i)][j].length === 4){
        for(let u = 0; u < list_of_processes[system_counter].queue_points.length; u++){
            addData(list_of_queue_charts[system_counter][u], list_of_processes[system_counter].list_of_events["Car_" + String(i)][j][3][0], list_of_processes[system_counter].list_of_events["Car_" + String(i)][j][3][1+u]);
        }
    }
}

// load model

var cont_ship_model;
//const loader = new GLTFLoader();

for(let system_counter = 0; system_counter < list_of_processes.length; system_counter++){
    var element = list_of_processes[system_counter];
    var list_of_events = element.list_of_events;
    var list_of_roads = element.list_of_roads;
    var list_of_points = element.road_path;
    var travel_time = element.travel_time;
    var queue_points = element.queue_points;
    var draw_road = element.draw_road;

    // queue place
    if(draw_road === "True"){
        const queue_geometry = new THREE.PlaneGeometry(50,50);
        const queue_color = new THREE.MeshBasicMaterial( {color: 0x808080, side: THREE.DoubleSide} );
        for(let i = 0; i < queue_points.length; i++){
            var queue_plane1 = new THREE.Mesh(queue_geometry, queue_color);
            queue_plane1.position.z = queue_points[i][0][0];
            queue_plane1.position.x = queue_points[i][0][1];
            queue_plane1.position.y = 1;
            queue_plane1.rotation.x = 90 * 3.14 / 180;
            scene.add(queue_plane1);
        }
    }

    // create 'cars'
    list_of_cubes.push([]);
    var time_scale = 1000;
    
    tweens_list.push([])
    if(list_of_models[system_counter] != "-"){
        var loader = new GLTFLoader();
        loader.load(
            list_of_models[system_counter],
            function ( gltf ) {
                const m = gltf.scene;
                cont_ship_model = m;
                for(let i = 0; i < Object.keys(list_of_events).length; i++){
                    /*var cube = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: "rgb(" + String(Math.floor(Math.random() * 255)) + "," + String(Math.floor(Math.random() * 255)) + "," + String(Math.floor(Math.random() * 255)) + ")"}));
                    cube.position.z = list_of_points[0][1][0];
                    cube.position.x = list_of_points[0][1][1];
                    cube.position.y = 3;
                    cube.rotation.y = list_of_points[0][2] * Math.PI / 180;
                    list_of_cubes[system_counter].push(cube);
                    scene.add( cube );*/
                    const cont_ship = SkeletonUtils.clone(cont_ship_model);
                    /*cont_ship.scale.x = 0.15;
                    cont_ship.scale.y = 0.15;
                    cont_ship.scale.z = 0.15;*/
                    
                    cont_ship.position.z = list_of_points[0][1][0];
                    cont_ship.position.x = list_of_points[0][1][1];
                    cont_ship.position.y = 3;
                    cont_ship.rotation.y = 3.14 / 2;
                    cont_ship.name = "ship-" + String(system_counter) + "-" + String(i);
                    scene.add(cont_ship);
                    list_of_cubes[system_counter].push(cont_ship);

                    /*
                        Animation settings
                    */
                    tweens_list[system_counter].push([new TWEEN.Tween(cont_ship.position).delay(1000)]);
                    var animation_num = 1;
                    var animation_type;
                    for(let j = 0; j < list_of_processes[system_counter].list_of_events["Car_" + String(i)].length; j++){
                        animation_type = list_of_processes[system_counter].list_of_events["Car_" + String(i)][j][0];
                        if(animation_type === "delay"){
                            tweens_list[system_counter][i].push(new TWEEN.Tween(cont_ship.position)
                            .to({z : Number(list_of_processes[system_counter].list_of_events["Car_" + String(i)][j][2][0]), x : Number(list_of_processes[system_counter].list_of_events["Car_" + String(i)][j][2][1])}, 1 )
                            .onComplete(function() {
                                update_chart(system_counter, i, j);
                            }));
                            tweens_list[system_counter][i][animation_num-1].chain(tweens_list[system_counter][i][animation_num]);
                            animation_num += 1;
                            tweens_list[system_counter][i].push(new TWEEN.Tween(cont_ship.position).delay(Number(list_of_processes[system_counter].list_of_events["Car_" + String(i)][j][1]) * time_scale))
                            tweens_list[system_counter][i][animation_num-1].chain(tweens_list[system_counter][i][animation_num]);
                            animation_num += 1;
                        }else if(animation_type === "rotate"){
                            tweens_list[system_counter][i].push(new TWEEN.Tween(cont_ship.rotation).to({y : (Number(list_of_processes[system_counter].list_of_events["Car_" + String(i)][j][2])) * Math.PI / 180 + 3.14 / 2}, 1));
                            tweens_list[system_counter][i][animation_num-1].chain(tweens_list[system_counter][i][animation_num]);
                            animation_num += 1;
                        }else{
                            tweens_list[system_counter][i].push(new TWEEN.Tween(cont_ship.position)
                            .to({z : Number(list_of_processes[system_counter].list_of_events["Car_" + String(i)][j][2][0]), x : Number(list_of_processes[system_counter].list_of_events["Car_" + String(i)][j][2][1])}, Number(list_of_processes[system_counter].list_of_events["Car_" + String(i)][j][1]) * time_scale)
                            .onComplete(function() {
                                update_chart(system_counter, i, j);
                            }));
                            tweens_list[system_counter][i][animation_num-1].chain(tweens_list[system_counter][i][animation_num]);
                            animation_num += 1;
                        }
                    } 
                    tweens_list[system_counter][i][0].start();
                }
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
    }else{
        var cont_ship = new THREE.Mesh( geometry_cube0, material );
        scene.add(cont_ship);
        list_of_cubes[system_counter].push(cont_ship);

        /*
            Animation settings
        */
        tweens_list[system_counter].push([new TWEEN.Tween(cont_ship.position).delay(1000)]);
        var animation_num = 1;
        var animation_type;
        for(let j = 0; j < list_of_processes[system_counter].list_of_events["Car_" + String(i)].length; j++){
            animation_type = list_of_processes[system_counter].list_of_events["Car_" + String(i)][j][0];
            if(animation_type === "delay"){
                tweens_list[system_counter][i].push(new TWEEN.Tween(cont_ship.position)
                .to({z : Number(list_of_processes[system_counter].list_of_events["Car_" + String(i)][j][2][0]), x : Number(list_of_processes[system_counter].list_of_events["Car_" + String(i)][j][2][1])}, 1 )
                .onComplete(function() {
                    update_chart(system_counter, i, j);
                }));
                tweens_list[system_counter][i][animation_num-1].chain(tweens_list[system_counter][i][animation_num]);
                animation_num += 1;
                tweens_list[system_counter][i].push(new TWEEN.Tween(cont_ship.position).delay(Number(list_of_processes[system_counter].list_of_events["Car_" + String(i)][j][1]) * time_scale))
                tweens_list[system_counter][i][animation_num-1].chain(tweens_list[system_counter][i][animation_num]);
                animation_num += 1;
            }else if(animation_type === "rotate"){
                tweens_list[system_counter][i].push(new TWEEN.Tween(cont_ship.rotation).to({y : (Number(list_of_processes[system_counter].list_of_events["Car_" + String(i)][j][2])) * Math.PI / 180 + 3.14 / 2}, 1));
                tweens_list[system_counter][i][animation_num-1].chain(tweens_list[system_counter][i][animation_num]);
                animation_num += 1;
            }else{
                tweens_list[system_counter][i].push(new TWEEN.Tween(cont_ship.position)
                .to({z : Number(list_of_processes[system_counter].list_of_events["Car_" + String(i)][j][2][0]), x : Number(list_of_processes[system_counter].list_of_events["Car_" + String(i)][j][2][1])}, Number(list_of_processes[system_counter].list_of_events["Car_" + String(i)][j][1]) * time_scale)
                .onComplete(function() {
                    update_chart(system_counter, i, j);
                }));
                tweens_list[system_counter][i][animation_num-1].chain(tweens_list[system_counter][i][animation_num]);
                animation_num += 1;
            }
        } 
        tweens_list[system_counter][i][0].start();

    }

    // road 
    if(draw_road === "True"){
        var road_geometry;
        var road_material;
        var road_plane;
        for(let i = 0; i < list_of_roads.length; i+=1){
            road_geometry = new THREE.PlaneGeometry( 8, list_of_roads[i][0]+8 );
            road_material = new THREE.MeshBasicMaterial( {color: 0x808080, side: THREE.DoubleSide} );
            road_plane = new THREE.Mesh( road_geometry, road_material );
            road_plane.rotation.x = 90 * Math.PI / 180;
            road_plane.rotation.z = (-1) * list_of_roads[i][2] * Math.PI / 180;
            road_plane.position.z = list_of_roads[i][1][0];
            road_plane.position.x = list_of_roads[i][1][1];
            road_plane.position.y = 1;
            scene.add( road_plane );
        }
        // basic vector
        /*road_geometry = new THREE.PlaneGeometry( 8, 1000 );
        road_material = new THREE.MeshBasicMaterial( {color: 0x808080, side: THREE.DoubleSide} );
        road_plane = new THREE.Mesh( road_geometry, road_material );
        road_plane.rotation.x = 90 * Math.PI / 180;
        //road_plane.rotation.z = list_of_roads[i][2] * Math.PI / 180;
        road_plane.position.z = 500;
        road_plane.position.x = 0;
        road_plane.position.y = 1;
        scene.add( road_plane );*/
    }

    /*
        Statistics collection
    */
    function add_data_to_table(table_id, data){
        var table = document.getElementById(table_id);
        var new_row = document.createElement('tr');
        var inner_string = "";
        for(let cell = 0; cell < data.length; cell++){
            inner_string += "<td>" + String(data[cell]) + "</td>"
        }
        new_row.innerHTML = inner_string;
        table.appendChild(new_row);
    }
}

// main animation funtion
function animate() {
	TWEEN.update();
    controls.update();
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
    console.log(camera.position.x);
}

animate();