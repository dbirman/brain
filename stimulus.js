/*
	Stimulus code

	The stimulus code tracks the stimuli that have been generated, renders them on 
	the screen, and deals with calculating the overlap and spike rates for the electrode
	code. This is the main client-side code. 
*/
let stimulus = []; 

function initStimulus(container) {

	let x = 10, y = MENU_SCALEV*app.renderer.height+20,
		swidth=VIS_SCALEH*app.renderer.width, sheight=BRAIN_SCALEV*app.renderer.height-30;

	container.position.set(x,y);

	// Draw the stimulus stage -- a large box on the left (visual field) and then 
	// a box on the right for the stimulus buttons
	// and a third box for the parameters

	// Because the stimulus region has its own graphics objects for each of tehse we'll draw
	// them all at once
	g = new PIXI.Graphics();

	g.lineStyle(1,0x000000,1);
	g.beginFill(0x808080,1);
	g.drawRect(0,0,swidth,sheight);

	g.moveTo()

	container.addChild(g);
}

//// stimulus drawings

// function 

//// parameter controls

function stimScroll(event) {
	if (!ui_stim_container.visible) {return;}
	console.log(event.wheelDelta);
	console.log(event);
	// event.preventDefault();
}