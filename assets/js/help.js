function initHelp() {

  document.body.onkeydown = function(e){checkHelpKey(e);};

}


function checkHelpKey(e) {
  if (any(equals([69,68,81,65,87,83,72,77,84],e.keyCode))) {e.preventDefault();}

  // if (e.keyCode==77) {
  // 	stimulus.push(createMotionStimulus());
  // 	drawMotionStimulus(stimulus.length-1);
  // }

  if (e.keyCode==72) {
  	if (document.getElementById('help').style.display=='none') {
  		document.getElementById('help').style.display='block';
      document.getElementById("canvas").className = "blur";
  	} else {
  		document.getElementById('help').style.display='none';
      document.getElementById("canvas").className = "";
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