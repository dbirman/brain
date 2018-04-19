// //////////////////////////// //////////////////////////// //////////////////////////// //
// BRAIN INFORMATION
// //////////////////////////// //////////////////////////// //////////////////////////// //


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
		MENU_SCALEV = 0.05, // vertical scaling of the menu bars (which we overlay over everything else)
		BRAIN_SCALEV = 0.75, // vertical scaling of brains (default: 80% of screen)
		MBRAIN_SCALEV = 0.20, // vertical scaling of mini brains (default: 20% of screen)
		VIS_SCALEH = 0.40,  // horizontal scaling of the "visual field" viewer
		SPC_SCALEH = 0.20, // horizontal scaling of the spacer between the visual field viewer and electrodes
		ELEC_SCALEH = 0.40, // horizontal scaling of the electrode boxes


const app = new PIXI.Application(ORIGIN_WIDTH,ORIGIN_HEIGHT, rendererOptions);

// The application will create a canvas element for you that you
// can then insert into the DOM
document.getElementById("canvas").appendChild(app.view);

function launch() {
	console.log('launched');

  // set renderer stuff
  app.renderer.plugins.interaction.cursorStyles.crosshair = 'crosshair';
  app.renderer.plugins.interaction.cursorStyles.none = 'none';
  app.renderer.plugins.interaction.cursorStyles.grab = 'grab';
  app.renderer.plugins.interaction.cursorStyles.grabbing= 'grabbing';

  // init UI
  uiInit();
}