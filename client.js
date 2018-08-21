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
let views = {
  buffer: Math.round(ORIGIN_WIDTH/150),
  static: {
    STIM_W: 0.3,
    ELEC_W: 0.3,
    STIM_V: 0.6
  },
  stim: {
    STIM_W: 0.5,
    STATIC_V: 0.2
  },
  brain: {
    STIM_W: 0.3,
    STIM_V: 0.3,
    STATIC_W: 0.4
  },
  spikes : {
    // empty
  }
};

let ORIGIN_W = ORIGIN_WIDTH-(views.buffer*2),
  ORIGIN_H = ORIGIN_HEIGHT-(views.buffer*2);

// computed:
views.static.ELEC_V = 1 - views.static.STIM_V;
views.static.BRAIN = Math.round(10*(1-views.static.STIM_W))/10;
// computed:
views.stim.ELEC_V = 1 - views.stim.STATIC_V;
// computed:
views.brain.BRAIN_W = 1-views.brain.STIM_W;

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
  var assetsToLoad = [ "./assets/brain_lateral.png", "./assets/brain_eyes.png","./assets/brain_medial.png"];
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