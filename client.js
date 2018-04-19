console.log('alive');

// //////////////////////////// //////////////////////////// //////////////////////////// //
// INITIALIZATION
// //////////////////////////// //////////////////////////// //////////////////////////// //
var rendererOptions = {
  antialiasing: false,
  transparent: true,
  resolution: window.devicePixelRatio,
  autoResize: true,
}

var ORIGIN_WIDTH = window.innerWidth, ORIGIN_HEIGHT = window.innerHeight;
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