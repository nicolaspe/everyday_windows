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
let current = 0;
let scenes  = [];
let col = [];
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

  camera = new THREE.PerspectiveCamera(80, wid/hei, 0.1, 1000);
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

  if(vrDisplay.isPresenting){ // VR rendering
    controls.update();
    effect.render(scenes[current], camera);
    vrDisplay.requestAnimationFrame(animate);
  } else {  // browser rendering
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
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(wid, hei);
	camera.aspect = wid/hei;
  camera.updateProjectionMatrix();
}
function changeScene(mode){
  current = mode;
}

/*
 * === ENVIRONMENT CREATION ===
 */
// create graphic objects
function createEnvironment(){
  col[0] = new THREE.Color("rgb(255,   0, 152)");
  col[1] = new THREE.Color("rgb(152, 102, 255)");
  col[2] = new THREE.Color("rgb(255, 204,   0)");
  col[3] = new THREE.Color("rgb( 50,  50, 230)");
  col[4] = new THREE.Color("rgb( 20, 255, 173)");
  col[5] = new THREE.Color("rgb(255,  40,  40)");


  for (let i = 0; i < 6; i++) {
    scenes[i].background = new THREE.Color( 0x555555 );
    createLights(i);
    createFloor(i);
    createRoom(i);
  }
  scene0();
  scene1();
  scene2();
  scene3();
  scene4();
  scene5();
}
function createLights(ind){
  let p_light = new THREE.PointLight(col[ind], 1.5, 1000, 2);
  p_light.position.set(0, 10, 0);
  scenes[ind].add( p_light );

  let str = 0.5;
  let d_light = new THREE.DirectionalLight(0xffffff, str);
  // scenes[ind].add( d_light );
}
function createFloor(ind){
  // let floorGeo = new THREE.BoxGeometry(roomSize*4, 1, roomSize*4, 10, 2, 10);
  let floorGeo = new THREE.CylinderGeometry(roomSize*4, roomSize*4, 1, 24);
  let floorMat = new THREE.MeshLambertMaterial({
    color: 0x666666,
    emissive: 0x101010,
  });
  let planeF = new THREE.Mesh(floorGeo, floorMat);
  planeF.position.set(0, -roomSize/4, 0);
  scenes[ind].add(planeF);
}
function createRoom(ind){
  // planes w/ images
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

  // room walls
  let wallGeo = new THREE.CylinderGeometry(roomSize*5, roomSize*5, 250, 24, 20, true);
  let wallMat = new THREE.MeshLambertMaterial({
    color: 0xd0d0d0,
    side: THREE.DoubleSide,
  });
  let wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(0, 230, 0);
  scenes[ind].add(wall);
}
// scenes
function scene0(){
  let ind = 0;

  let toySize = 8;
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
    let rad   = 12 +Math.random()*10;
    let angle = i*(Math.PI/boyNum) + Math.random()*0.05;
    let posY = 15* Math.sin( Math.PI/4 *(i%2) ) +Math.random()*6-2;
    // let posY = Math.random()*20 -5;
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
    let rad   = 12 +Math.random()*10;
    let angle = i*(Math.PI/girlNum) + Math.random()*0.1;
    let posY = 15* Math.sin( Math.PI/4 *(i%2) ) +Math.random()*6-2;
    // let posY = Math.random()*20 -5;
    let posX = rad * Math.sin(angle);
    let posZ = rad * Math.cos(angle);
    // create and add
    let toy = new THREE.Mesh(toyGeo, toyMat);
    toy.position.set(posX, posY, posZ);
    toy.rotation.y = angle +Math.PI;
    scenes[ind].add(toy);
  }

  // COLORED WALLS
  let wallGeo = new THREE.CylinderGeometry( roomSize*4.5, roomSize*4.5, 150, 24, 20, true, 0, Math.PI );

  let boyWallMat = new THREE.MeshLambertMaterial({
    color: 0x3366ff,
    side: THREE.DoubleSide,
  });
  let boyWall = new THREE.Mesh(wallGeo, boyWallMat);
  boyWall.position.set(0, 50, 0);
  boyWall.rotation.y = Math.PI;
  scenes[ind].add(boyWall);

  let girlWallMat = new THREE.MeshLambertMaterial({
    color: 0xff1a75,
    side: THREE.DoubleSide,
  });
  let girlWall = new THREE.Mesh(wallGeo, girlWallMat);
  girlWall.position.set(0, 50, 0);
  scenes[ind].add(girlWall);
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
function scene2(){
  let ind = 2;

  let imagesSize = 15;
  let imagesNum  = 48;
  // create geometry
  let phGeo = new THREE.PlaneGeometry(imagesSize, imagesSize, 1, 1);
  for (let i = 0; i < imagesNum; i++) {
    // load image as texture
    let phMat = new THREE.MeshBasicMaterial({
      // map: loader.load("media/1/gifs/" + i + ".gif"),
      map: loader.load("media/2/images/" + i + ".png"),
      side: THREE.DoubleSide,
      transparent: true,
    });
    // position
    let rad   = 30 +Math.random()*10;
    let angle = i*(2*Math.PI/imagesNum) + Math.random()*0.2;
    let posY = Math.random()*10;
    let posX = rad * Math.sin(angle);
    let posZ = rad * Math.cos(angle);
    // create and add
    let image = new THREE.Mesh(phGeo, phMat);
    image.position.set(posX, posY, posZ);
    image.rotation.y = angle +Math.PI;
    scenes[ind].add(image);
  }
}
function scene3(){
  let ind = 3;

  let imagesSize = 15;
  let imagesNum  = 10;
  // create geometry
  let phGeo = new THREE.PlaneGeometry(imagesSize, imagesSize, 1, 1);
  for (let i = 0; i < imagesNum; i++) {
    // load image as texture
    let phMat = new THREE.MeshBasicMaterial({
      map: loader.load("media/3/" + i + ".png"),
      side: THREE.DoubleSide,
      transparent: true,
    });
    // position
    let rad   = 30 +Math.random()*10;
    let angle = i*(2*Math.PI/imagesNum) + Math.random()*0.2;
    let posY = Math.random()*10;
    let posX = rad * Math.sin(angle);
    let posZ = rad * Math.cos(angle);
    // create and add
    let image = new THREE.Mesh(phGeo, phMat);
    image.position.set(posX, posY, posZ);
    image.rotation.y = angle +Math.PI;
    scenes[ind].add(image);
  }
}
function scene4(){
  let ind = 4;

  // let imagesSize = 15;
  // let imagesNum  = 28;
  // // create geometry
  // let phGeo = new THREE.PlaneGeometry(imagesSize, imagesSize, 1, 1);
  // for (let i = 0; i < imagesNum; i++) {
  //   // load image as texture
  //   let phMat = new THREE.MeshBasicMaterial({
  //     map: loader.load("media/4/" + i + ".png"),
  //     side: THREE.DoubleSide,
  //     transparent: true,
  //   });
  //   // position
  //   let rad   = 30 +Math.random()*10;
  //   let angle = i*(2*Math.PI/imagesNum) + Math.random()*0.2;
  //   let posY = Math.random()*10;
  //   let posX = rad * Math.sin(angle);
  //   let posZ = rad * Math.cos(angle);
  //   // create and add
  //   let image = new THREE.Mesh(phGeo, phMat);
  //   image.position.set(posX, posY, posZ);
  //   image.rotation.y = angle +Math.PI;
  //   scenes[ind].add(image);
  // }
}
function scene5(){
  let ind = 5;

  // let imagesSize = 15;
  // let imagesNum  = 17;
  // // create geometry
  // let phGeo = new THREE.PlaneGeometry(imagesSize, imagesSize, 1, 1);
  // for (let i = 0; i < imagesNum; i++) {
  //   // load image as texture
  //   let phMat = new THREE.MeshBasicMaterial({
  //     map: loader.load("media/5/" + i + ".png"),
  //     side: THREE.DoubleSide,
  //     transparent: true,
  //   });
  //   // position
  //   let rad   = 30 +Math.random()*10;
  //   let angle = i*(2*Math.PI/imagesNum) + Math.random()*0.2;
  //   let posY = Math.random()*10;
  //   let posX = rad * Math.sin(angle);
  //   let posZ = rad * Math.cos(angle);
  //   // create and add
  //   let image = new THREE.Mesh(phGeo, phMat);
  //   image.position.set(posX, posY, posZ);
  //   image.rotation.y = angle +Math.PI;
  //   scenes[ind].add(image);
  // }
}
