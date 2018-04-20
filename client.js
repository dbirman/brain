// //////////////////////////// //////////////////////////// //////////////////////////// //
// BRAIN INFORMATION
// //////////////////////////// //////////////////////////// //////////////////////////// //

let brain = {};

function brainInit() {
	// The brain starts from location [0,0]. As the brain gets scrolled we will adjust this.
	brain.position = {};
	brain.position.x = 0; brain.position.y = 0;
}

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
		VIS_SCALEH = 0.40,  // horizontal scaling of the "visual field" viewer
		SPC_SCALEH = 0.20, // horizontal scaling of the spacer between the visual field viewer and electrodes
		ELEC_SCALEH = 0.40; // horizontal scaling of the electrode boxes


const app = new PIXI.Application(ORIGIN_WIDTH,ORIGIN_HEIGHT, rendererOptions);

// The application will create a canvas element for you that you
// can then insert into the DOM
document.getElementById("canvas").appendChild(app.view);

function launch() {
	console.log('launched');

	brainInit();

  // set renderer stuff
  app.renderer.plugins.interaction.cursorStyles.crosshair = 'crosshair';
  app.renderer.plugins.interaction.cursorStyles.none = 'none';
  app.renderer.plugins.interaction.cursorStyles.grab = 'grab';
  app.renderer.plugins.interaction.cursorStyles.grabbing= 'grabbing';

  // init UI
  uiInit();
}



// //////////////////////////// //////////////////////////// //////////////////////////// //
// EXTRA CODE
// //////////////////////////// //////////////////////////// //////////////////////////// //


class DContainer extends PIXI.Container {
  addChildZ(container, zOrder) {
    container.zOrder = zOrder || 0;
    container.arrivalOrder = this.children.length;
    this.addChild(container);
    this.sortChildren();
  }
 
  sortChildren() {
    const _children = this.children;
    let len = _children.length, i, j, tmp;
    for (i = 1; i < len; i++) {
      tmp = _children[i];
      j = i - 1;
      while (j >= 0) {
        if (tmp.zOrder < _children[j].zOrder) {
          _children[j + 1] = _children[j];
        } else if (tmp.zOrder === _children[j].zOrder && tmp.arrivalOrder < _children[j].arrivalOrder) {
          _children[j + 1] = _children[j];
 
        } else {
          break;
        }
        j--;
      }
      _children[j + 1] = tmp;
    }
  };
}
