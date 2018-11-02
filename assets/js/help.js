function initHelp() {
  views.brainSprite = views.container.addChild(new PIXI.Sprite.fromImage('./assets/brain_opener.png'));
  views.brainSprite.scale.set(Math.min(ORIGIN_W*0.3/views.brainSprite.width,ORIGIN_H*0.1/views.brainSprite.height));
  views.brainSprite.x = views.buffer;
  views.brainSprite.y = views.buffer;
  views.brainSprite.interactive = true;
  views.brainSprite
    .on('pointertap',showHelp);

  // add text for help
  // let style = new PIXI.TextStyle({
  //   fill: "black",
  //   fontSize: views.static.TEXT_HEIGHT*3,
  //   fontFamily: views.static.FAMILY
  // });
  // views.brainSprite.text = views.brainSprite.addChild(new PIXI.Text('Click for help',style));
  // views.brainSprite.text.anchor.set(0.5,0);
  // views.brainSprite.text.x = views.brainSprite.width/views.brainSprite.scale._x/2;
  // views.brainSprite.text.y = views.brainSprite.height/views.brainSprite.scale._x;

  document.body.onkeydown = function(e){checkHelpKey(e);};
}

function showHelp() {
  document.getElementById('help').style.display='block';
  document.getElementById("canvas").className = "blur";
}

function hideHelp() {
  document.getElementById('help').style.display='none';
  document.getElementById("canvas").className = ""; 
}

function checkHelpKey(e) {
  if (any(equals([69,68,81,65,87,83,72,77,84],e.keyCode))) {e.preventDefault();}

  // if (e.keyCode==77) {
  // 	stimulus.push(createMotionStimulus());
  // 	drawMotionStimulus(stimulus.length-1);
  // }

  if (e.keyCode==72) {
  	if (document.getElementById('help').style.display=='none') {
      showHelp();
  	} else {
      hideHelp();
  	}
  }

  // if (e.keyCode==84) {
  // 	sensTest = !sensTest;
  // 	if (!sensTest) {
  // 		tg.destroy();
  // 		tg = undefined;
  // 	}
  // }

  // // PARAM WINDOW STUFF
  // for (let si=0;si<stimulus.length;si++) {
  // 	if (stimulus[si].paramWindow.visible) {
		//   switch (e.keyCode) {
		//   	case 81:
		//   		stimulus[si].setTheta(stimulus[si].getTheta()+Math.PI/4);
		//   		break;
		//   	case 65:
		//   		stimulus[si].setTheta(stimulus[si].getTheta()-Math.PI/4);
		//   		break;
		//   	case 87:
		//   		stimulus[si].setContrast(stimulus[si].getContrast()+0.1);
		//   		break;
		//   	case 83:
		//   		stimulus[si].setContrast(stimulus[si].getContrast()-0.1);
		//   		break;
		//   	case 69:
		//   		stimulus[si].setCoherence(stimulus[si].getCoherence()+0.1);
		//   		break;
		//   	case 68:
		//   		stimulus[si].setCoherence(stimulus[si].getCoherence()-0.1);
		//   		break;
		//   }
		//   updateMotionParams(stimulus[si],stimulus[si].paramWindow.visible);
		//   computePartialSensitivity();
  // 	}
  // }
}