// //////////////////////////// //////////////////////////// //////////////////////////// //
// INITIALIZATION
// //////////////////////////// //////////////////////////// //////////////////////////// //

const socket = io();

var rendererOptions = {
  antialiasing: false,
  transparent: true,
  resolution: devicePixelRatio,
  autoResize: true,
}
let ORIGIN_WIDTH = document.body.clientWidth,
    ORIGIN_HEIGHT = document.body.clientHeight;

// setup the different views
let views = {};

// the first view is the static viewer
views.static = {};
views.static.VISUAL_FIELD = 0.3; // just the width, but keep in mind the view is rotated

// add constants
views.static.TEXT_HEIGHT = 20; // we can resize based on origin_height or something?

// use a 2D transform to approximate 3D  (see http://www.html5gamedevs.com/topic/24942-how-can-i-do-a-perspective-transform/ and https://github.com/pixijs/pixi-projection)

// the second view is the stimulus and electrodes view
views.stim = {};
views.stim.STIMULUS_W = 0.5; // just specify width
views.stim.STIMULUS_H = 0.8; // just specify width
views.stim.ELECTRODES = 0.25; // just specify width

// the last view is the brain viewport
views.brain = {};
views.brain.BRAIN_W = 0.75;
views.brain.BRAIN_H = 0.90;

const app = new PIXI.Application(ORIGIN_WIDTH,ORIGIN_HEIGHT, rendererOptions),
  loader = PIXI.loader;

// The application will create a canvas element for you that you
// can then insert into the DOM
document.getElementById("canvas").appendChild(app.view);

function launch() {
	console.log('launched');

  window.addEventListener('resize', resize);

  // ensure any browser dependencies run
  checkBrowser();

  // Local stuff
  spk_init();

  // Setup ticker
  ticker = PIXI.ticker.shared;

  // set renderer stuff
  app.renderer.plugins.interaction.cursorStyles.crosshair = 'crosshair';
  app.renderer.plugins.interaction.cursorStyles.none = 'none';
  app.renderer.plugins.interaction.cursorStyles.grab = 'grab';
  app.renderer.plugins.interaction.cursorStyles.grabbing= 'grabbing';

  // asset loading -- do this at the start to have widths available immediately
  var assetsToLoad = [ "./assets/brain_lateral.png"];
  for (var ai=0; ai<assetsToLoad.length;ai++) {
    loader.add(assetsToLoad[ai]);
  }
  loader.load();

  // Init User Interface
  loader.onComplete.add(uiInit);
}

function resize() {
  console.log('Resizing PIXI');
  const parent = app.view.parentNode;
   
  // Resize the renderer
  // ORIGIN_WIDTH = parent.clientWidth;
  // ORIGIN_HEIGHT = parent.clientHeight;
  let scale = Math.min(parent.clientWidth/ORIGIN_WIDTH,parent.clientHeight/ORIGIN_HEIGHT);
  app.stage.scale.set(scale);//,ORIGIN_HEIGHT);
}


// //////////////////////////// //////////////////////////// //////////////////////////// //
// MODAL CODE
// //////////////////////////// //////////////////////////// //////////////////////////// //

window.onclick = function(event) { closeCheck(event); }
window.ontouchstart = function(event) {closeCheck(event); }

function closeCheck(event) {
  target = event.target;
  if ((event.target.className == "close") || (event.target.className== "modal-content-big")) {
      // chain parentElements until you find the modal
      var parent = event.target.parentElement;
      while (parent.className!="modal") {
        parent = parent.parentElement;
      }
      parent.style.display = "none";
      document.getElementById("canvas").className = "";
    }
    if (event.target.className == "modal") {
      event.target.style.display = "none";
      document.getElementById("canvas").className = "";
    }
}