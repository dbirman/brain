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

var browser;

function checkBrowser(){
    c = navigator.userAgent.search("Chrome");
    f = navigator.userAgent.search("Firefox");
    m8 = navigator.userAgent.search("MSIE 8.0");
    m9 = navigator.userAgent.search("MSIE 9.0");
    if (c > -1) {
        browser = "Chrome";
    } else if (f > -1) {
        browser = "Firefox";
    } else if (m9 > -1) {
        browser ="MSIE 9.0";
    } else if (m8 > -1) {
        browser ="MSIE 8.0";
    }
    return browser;
}
