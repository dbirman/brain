// //////////////////////////// //////////////////////////// //////////////////////////// //
// INITIALIZATION
// //////////////////////////// //////////////////////////// //////////////////////////// //

var rendererOptions = {
  antialiasing: false,
  transparent: true,
  resolution: window.devicePixelRatio,
  autoResize: true,
}

var ORIGIN_WIDTH = window.innerWidth,
		ORIGIN_HEIGHT = window.innerHeight,
		MENU_SCALEH = 0.2,
		MENU_SCALEV = 0.05, // vertical scaling of the menu bars (which we overlay over everything else)
		BRAIN_SCALEV = 0.75, // vertical scaling of brains (default: 80% of screen)
		MBRAIN_SCALEV = 0.18, // vertical scaling of mini brains (default: 20% of screen)
		VIS_SCALEH = 0.55,  // horizontal scaling of the "visual field" viewer
		SPC_SCALEH = 0.05, // horizontal scaling of the spacer between the visual field viewer and electrodes
		ELEC_SCALEH = 0.40; // horizontal scaling of the electrode boxes


const app = new PIXI.Application(ORIGIN_WIDTH,ORIGIN_HEIGHT, rendererOptions);

// The application will create a canvas element for you that you
// can then insert into the DOM
document.getElementById("canvas").appendChild(app.view);

function launch() {
	console.log('launched');

  // ensure any browser dependencies run
  checkBrowser();

  // Local stuff
  spk_init();

  // set renderer stuff
  app.renderer.plugins.interaction.cursorStyles.crosshair = 'crosshair';
  app.renderer.plugins.interaction.cursorStyles.none = 'none';
  app.renderer.plugins.interaction.cursorStyles.grab = 'grab';
  app.renderer.plugins.interaction.cursorStyles.grabbing= 'grabbing';

  // init UI
  uiInit();
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
    }
    if (event.target.className == "modal") {
      event.target.style.display = "none";
    }
}