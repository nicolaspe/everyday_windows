// global threejs/VR variables
let container;
let renderer;
let camera;
let controls;
let loader;
let lastRenderTime;

let effect;
let vrDisplay;    // variable for the display
let vrButton;     // button to render in VR

// environment variables
let current = 0
let scenes = [];
let roomSize = 30;

window.addEventListener('load', onLoad);

function onLoad(){
  container = document.querySelector('#sketch');
  let wid = window.innerWidth;
  let hei = window.innerHeight;

  // INITIALIZATION
  renderer = new THREE.WebGLRenderer({ });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(wid, hei);
  container.appendChild(renderer.domElement);
  effect = new THREE.VREffect(renderer);
  effect.setSize(window.innerWidth, window.innerHeight);
	scenes[0]  = new THREE.Scene();
	scenes[1]  = new THREE.Scene();
	scenes[2]  = new THREE.Scene();
	scenes[3]  = new THREE.Scene();
	scenes[4]  = new THREE.Scene();
	scenes[5]  = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, wid/hei, 0.1, 1000);
	controls = new THREE.VRControls( camera );
  controls.standing = true;
  camera.position.y = controls.userHeight;
	controls.update();

  loader = new THREE.TextureLoader();
  createEnvironment();

  // Initialize (Web)VR
  renderer.vr.enabled = true;
  setupVRStage();

  // EVENTS
  window.addEventListener('resize', onWindowResize, true );
  window.addEventListener('vrdisplaypresentchange', onWindowResize, true);
}


// sets up the VR stage + button
function setupVRStage(){
  // get available displays
  navigator.getVRDisplays().then( function(displays){
    if(displays.length > 0) {
      vrDisplay = displays[0];
      // setup button
      vrButton = WEBVR.getButton( vrDisplay, renderer.domElement );
      document.getElementById('vr_button').appendChild( vrButton );
    } else {
      console.log("NO VR DISPLAYS PRESENT");
    }
    update();
  });
}

function update(){
	window.requestAnimationFrame(animate);
}
function animate(timestamp) {
  let delta = Math.min(timestamp - lastRenderTime, 500);
  lastRenderTime = timestamp;

  if(vrDisplay.isPresenting){
    controls.update();
    effect.render(scenes[current], camera);
    vrDisplay.requestAnimationFrame(animate);
  } else {
		controls.update();
    renderer.render(scenes[current], camera);
    window.requestAnimationFrame(animate);
  }
}


/*
 * === EVENTS ===
 */
function onWindowResize(){
  let wid = window.innerWidth;
  let hei = window.innerHeight;

  effect.setSize(wid, hei);
  renderer.setSize(wid, hei);
	camera.aspect = wid/hei;
  camera.updateProjectionMatrix();
}


/*
 * === ENVIRONMENT CREATION ===
 */
// create graphic objects
function createEnvironment(){
  let col = [];
  col[0] = 0xff0000;
  col[1] = 0x00ff00;
  col[2] = 0x0000ff;

  for (let i = 0; i < 3; i++) {
    scenes[i].background = new THREE.Color( 0x555555 );
    // scenes[i].background = new THREE.Color( 0xeeeeee );
    createLights(i);
    createFloor(i);
    createRoom(i);
    createSphere(i, col[i]);
  }
  scene0();
  scene1();
}
function createLights(ind){
  let p_light = new THREE.PointLight(0xffffff, 1, 1000, 2);
  p_light.position.set(0, 0, 0);
  scenes[ind].add( p_light );

  let str = 0.5;
  let d_light = new THREE.DirectionalLight(0xffffff, str);
  scenes[ind].add( d_light );
}
function createFloor(ind){
  let floorGeo = new THREE.BoxGeometry(roomSize*4, 1, roomSize*4, 10, 2, 10);
  let floorMat = new THREE.MeshPhongMaterial({
    color: 0xd0d0d0,
    specular: 0x000000,
    flatShading: true,
    wireframe: true,
  });
  let planeF = new THREE.Mesh(floorGeo, floorMat);
  planeF.position.set(0, -roomSize/4, 0);
  scenes[ind].add(planeF);
}
function createRoom(ind){
  let plGeo = new THREE.PlaneGeometry(roomSize, roomSize, 10, 10);
  // images
  let windowMat = new THREE.MeshBasicMaterial({
    map: loader.load("media/" + ind + "/window.png"),
    side: THREE.DoubleSide,
    transparent: true,
  });
  let personMat = new THREE.MeshBasicMaterial({
    map: loader.load("media/" + ind + "/main.gif"),
    side: THREE.DoubleSide,
    transparent: true,
  });
  for (let i = 0; i < 4; i++) {
    let windowPlane = new THREE.Mesh(plGeo, windowMat);
    let personPlane = new THREE.Mesh(plGeo, personMat);
    let rad = 10;
    let posX = rad * Math.sin(i*Math.PI/2);
    let posZ = rad * Math.cos(i*Math.PI/2);
    personPlane.position.set(posX*6, roomSize/4, posZ*6);
    personPlane.rotation.y = Math.PI/2 * Math.sin(i*Math.PI/2);
    scenes[ind].add(personPlane);
    windowPlane.position.set(posX*8, roomSize*.3, posZ*8);
    windowPlane.rotation.y = Math.PI/2 * Math.sin(i*Math.PI/2);
    scenes[ind].add(windowPlane);
  }
}
function createSphere(ind, col){
  let spGeo = new THREE.SphereGeometry(1, 25, 25);
	let spMat = new THREE.MeshPhongMaterial({
		color: col,
		// emissive: 0xffffff,
		flatShading: true,
	});
  let sphere = new THREE.Mesh(spGeo, spMat);
  sphere.position.set(0, 0, -20);
  scenes[ind].add(sphere);
}
// scenes
function scene0(){
  let ind = 0;

  let toySize = 5;
  let boyNum  = 18;
  let girlNum = 21;
  // create geometry
  let toyGeo = new THREE.PlaneGeometry(toySize, toySize, 1, 1);
  // BOY TOYS
  for (let i = 1; i < boyNum+1; i++) {
    // load toy as texture
    let toyMat = new THREE.MeshBasicMaterial({
      map: loader.load("media/0/boys" + i + ".png"),
      side: THREE.DoubleSide,
      transparent: true,
    });
    // position (only LEFT side)
    let rad   = 30 +Math.random()*5;
    let angle = i*(Math.PI/boyNum) + Math.random()*0.1;
    let posY = Math.random()*20 -10;
    let posX = rad * Math.sin(angle +Math.PI);
    let posZ = rad * Math.cos(angle +Math.PI);
    // create and add
    let toy = new THREE.Mesh(toyGeo, toyMat);
    toy.position.set(posX, posY, posZ);
    toy.rotation.y = angle
    scenes[ind].add(toy);
  }
  // GIRL TOYS
  for (let i = 1; i < girlNum+1; i++) {
    // load toy as texture
    let toyMat = new THREE.MeshBasicMaterial({
      map: loader.load("media/0/girls" + i + ".png"),
      side: THREE.DoubleSide,
      transparent: true,
    });
    // position (only RIGHT side)
    let rad   = 30 +Math.random()*5;
    let angle = i*(Math.PI/girlNum) + Math.random()*0.1;
    let posY = Math.random()*20 -10;
    let posX = rad * Math.sin(angle);
    let posZ = rad * Math.cos(angle);
    // create and add
    let toy = new THREE.Mesh(toyGeo, toyMat);
    toy.position.set(posX, posY, posZ);
    toy.rotation.y = angle +Math.PI;
    scenes[ind].add(toy);
  }
}
function scene1(){
  let ind = 1;

  let phraseSize = 15;
  let phraseNum  = 12;
  // create geometry
  let phGeo = new THREE.PlaneGeometry(phraseSize, phraseSize, 1, 1);
  for (let i = 0; i < phraseNum; i++) {
    // load phrase as texture
    let phMat = new THREE.MeshBasicMaterial({
      // map: loader.load("media/1/gifs/" + i + ".gif"),
      map: loader.load("media/1/images/" + i + ".png"),
      side: THREE.DoubleSide,
      transparent: true,
    });
    // position
    let rad   = 30 +Math.random()*10;
    let angle = i*(2*Math.PI/phraseNum) + Math.random()*0.2;
    let posY = Math.random()*10;
    let posX = rad * Math.sin(angle);
    let posZ = rad * Math.cos(angle);
    // create and add
    let phrase = new THREE.Mesh(phGeo, phMat);
    phrase.position.set(posX, posY, posZ);
    phrase.rotation.y = angle +Math.PI;
    scenes[ind].add(phrase);
  }
}
