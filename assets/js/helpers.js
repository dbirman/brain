
// //////////////////////////// //////////////////////////// //////////////////////////// //
// ANIMATION
// //////////////////////////// //////////////////////////// //////////////////////////// //

// // Interpolate between 
// function inOutSine(x,totalX) {
//   return Math.sin(x*Math.PI/totalX/2);
// }

// function easeOutExpo(x,totalX) {
//   return 1 - Math.exp(-x*5/totalX);
// }

// /**
// *
// * Time is in seconds
// */
// function animate(param,end,time) {
//   let temp = this;
//   animate_.call(this,param,1,time*200,this[param],end);
// }

// function animate_(param,x,totalX,start,end) {
//   if (num<=0) {this[param] = end; return;}
//   let temp = this;
//   this[param] = start + easeOutExpo(x,totalX)*(end-start);
//   setTimeout(function() {animate_.call(temp,param,++x,totalX,start,end)},5);
// }
// //////////////////////////// //////////////////////////// //////////////////////////// //
// HELPERS
// //////////////////////////// //////////////////////////// //////////////////////////// //

function zeros(z) {
  a=[]; for(let zi=0;zi<z;zi++) {a.push(0);}return a;
}

function randn() {
  var x1, x2, rad, y1;
  do {
    x1 = 2 * Math.random() - 1;
    x2 = 2 * Math.random() - 1;
    rad = x1 * x1 + x2 * x2;
  } while(rad >= 1 || rad == 0);
  var c = Math.sqrt(-2 * Math.log(rad) / rad);
  return x1 * c;
};


function any(array) {
  for (var i =0; i< array.length;i++) {
    if (array[i] != 0) {
      return true;
    }
  }
  return false;
}

function normpdf(x,mu,sd) {
  return 1 / Math.sqrt(2*Math.PI*Math.pow(sd,2)) * Math.exp(-Math.pow(x-mu,2)/(2*Math.pow(sd,2)));
}

function now() {
  return Date.now();
}

function equals(array, val) {
  var temp = zeros(array.length);
  for (var i = 0;i< array.length;i++) {
    if (array[i] === val) {
      temp[i] = 1;
    }
  }
  return temp;
}

function con2bin_gamma(con) {
  // Return a gamma corrected binary of the contrast, assumming gamma curve of 2.2
  return Number('0x'+rgb2hex_(Math.round(255*Math.exp(Math.log(con)/2.2))));
}

function log(base, val) {
  return Math.log(val) / Math.log(base);
}

function rgb2hex(r, g, b) {
  return '#'+rgb2hex_(r,g,b);
}

function rgb2hex_(r,g,b) {
  if (g==undefined) {
    let c = componentToHex(r);
    return c + c + c;
  } else {
    return componentToHex(r) + componentToHex(g) + componentToHex(b);
  }
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function circIntersect(x0, y0, r0, x1, y1, r1)
{
  var rr0 = r0 * r0;
  var rr1 = r1 * r1;
  var d = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));

  // Circles do not overlap
  if (d > r1 + r0)
  {
    return 0;
  }

  // Circle1 is completely inside circle0
  else if (d <= Math.abs(r0 - r1) && r0 >= r1)
  {
    // Return area of circle1
    return Math.PI * rr1;
  }

  // Circle0 is completely inside circle1
  else if (d <= Math.abs(r0 - r1) && r0 < r1)
  {
    // Return area of circle0
    return Math.PI * rr0;
  }

  // Circles partially overlap
  else
  {
    var phi = (Math.acos((rr0 + (d * d) - rr1) / (2 * r0 * d))) * 2;
    var theta = (Math.acos((rr1 + (d * d) - rr0) / (2 * r1 * d))) * 2;
    var area1 = 0.5 * theta * rr1 - 0.5 * rr1 * Math.sin(theta);
    var area2 = 0.5 * phi * rr0 - 0.5 * rr0 * Math.sin(phi);

    // Return area of intersection
    return area1 + area2;
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

let audioCtx;

var enableAudio = function (callback) {
  var bufferLength = 10
  let acFunc = window.AudioContext || window.webkitAudioContext;
  audioCtx = new acFunc();

  gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

  var myArrayBuffer = audioCtx.createBuffer(1, bufferLength, audioCtx.sampleRate);
  var source = audioCtx.createBufferSource();  

  var nowBuffering = myArrayBuffer.getChannelData(0);
  for (var i = 0; i < bufferLength; i++) {    
    nowBuffering[i] = Math.random() * 2 - 1;
  }

  source.buffer = myArrayBuffer;  
  source.connect(audioCtx.destination);

  var playFakeAudio = function (cb) {
    var done = false
    source.onended = function (a) {
      done = true
      cb(true)
    }
    source.start(0);
    setTimeout(function () {if (!done) cb(false)}, bufferLength + 5)
  }

  playFakeAudio(function (isAudioEnabled) {    
    if (isAudioEnabled == false) { 
      var onTouch = function () {             
        playFakeAudio(function(){
          document.removeEventListener('touchstart', onTouch)
          callback()
        })
      }
      document.addEventListener('touchstart', onTouch)
    } else {
      callback()
    }
  })
}