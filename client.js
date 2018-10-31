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
    BRAIN: 0.3,
    ELEC_W: 0.3,
    BRAIN_W: 0.5,
    BRAIN_V: 0.5,
    TEXT_HEIGHT: 20,
    FAMILY: 'Helvetica'
  },
  stim: {
    STIM_W: 0.5,
    ELEC_V: 0.5
  },
  brain: {
    BRAIN_V: 1.0
  },
  spikes : {
    // empty
  }
};

let ORIGIN_W = ORIGIN_WIDTH-(views.buffer*2),
  ORIGIN_H = ORIGIN_HEIGHT-(views.buffer*2);

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

  // Setup ticker
  ticker = PIXI.ticker.shared;

  // set renderer stuff
  app.renderer.plugins.interaction.cursorStyles.crosshair = 'crosshair';
  app.renderer.plugins.interaction.cursorStyles.none = 'none';
  app.renderer.plugins.interaction.cursorStyles.grab = 'grab';
  app.renderer.plugins.interaction.cursorStyles.grabbing= 'grabbing';

  // asset loading -- do this at the start to have widths available immediately
  var assetsToLoad = [ "./assets/brain_lateral.png","./assets/bucket.png","./assets/mag_glass.png","./assets/brain_medial.png","./assets/stim_ex/motion.png","./assets/stim_Ex/gabor.png","./assets/brain_opener.png"];
  for (var ai=0; ai<assetsToLoad.length;ai++) {
    loader.add(assetsToLoad[ai]);
  }
  loader.load();

  // Init User Interface
  loader.onComplete.add(uiInit);

  if (browser!='Chrome') {
    alert('The demo is only fully functional in Chrome. Sorry!');
  }
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