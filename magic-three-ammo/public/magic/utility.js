import * as THREE from "three";

export function isiOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

export function runCache(f) {
  if(f == false) return;
  if("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      if(isiOS()) {
        navigator.serviceWorker.register("cache.ios.js").then(() => {
          console.log('Worker runned.');
        });
      } else {
        navigator.serviceWorker.register("cache.js").then(() => {
          console.log('Worker runned.');
        });
      }
    });
  } else {
    console.warn("MagicThree: No support for web workers in this browser.");
  }
}

export function createAppEvent(name, myDetails) {
  return new CustomEvent(name, {
    detail: {
      eventName: name,
      data: myDetails,
    },
    bubbles: true,
  });
}

export const HeaderTypes = {
  textPlan: "text/plain",
  html: "text/html",
  jpeg: "image/jpeg",
  png: "image/png",
  mpeg: "audio/mpeg",
  ogg: "audio/ogg",
  audio: "audio/*",
  mp4: "video/mp4",
  app: "application/*",
  appJson: "application/json",
  appJS: "application/javascript",
  appECMA: "application/ecmascript",
  appOctetSteam: "application/octet-stream",
};

export const jsonHeaders = new Headers({
  "Content-Type": "application/json",
  "Accept": "application/json",
});

export const htmlHeader = new Headers({
  "Content-Type": "text/html",
  "Accept": "text/plain",
});

export function byId(d) {
  return document.getElementById(d)
};

export function getProtocolFromAddressBar() {
  return (location.protocol === "https:" ? "https://" : "http://");
}

export function getDomain() {return window.location.hostname}

export var QueryString = (function() {
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for(var i = 0;i < vars.length;i++) {
    var pair = vars[i].split('=');
    // If first entry with this name
    if(typeof query_string[pair[0]] === 'undefined') {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
      // If second entry with this name
    } else if(typeof query_string[pair[0]] === 'string') {
      var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
      query_string[pair[0]] = arr;
      // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return query_string;
})();

export function urlFlag(name) {
  let results = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.href);
  if(results == null) {
    return null;
  } else {
    return decodeURI(results[1]) || 0;
  }
}

export function save(name, obj) {
  localStorage.setItem(name, JSON.stringify(obj));
}

export function load(name) {
  if(localStorage.getItem(name) == 'undefined' ||
    localStorage.getItem(name) == null ||
    localStorage.getItem(name) == "") {
    return false;
  }
  else {
    return JSON.parse(localStorage.getItem(name));
  }
}

// TEST THIS
export function getAxisAndAngelFromQuaternion(q) {
  const angle = 2 * Math.acos(q.w);
  var s;
  if(1 - q.w * q.w < 0.000001) {
    // test to avoid divide by zero, s is always positive due to sqrt
    // if s close to zero then direction of axis not important
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/
    s = 1;
  } else {
    s = Math.sqrt(1 - q.w * q.w);
  }
  return {axis: new THREE.Vector3(q.x / s, q.y / s, q.z / s), angle};
}

export var isSafari = function() {return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)},
  isMozilla = navigator.userAgent.toLowerCase().indexOf('mozilla') > -1,
  isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
  isUbuntu = navigator.userAgent.toLowerCase().indexOf('ubuntu') > -1,
  isLinux = navigator.userAgent.toLowerCase().indexOf('linux') > -1,
  isGecko = navigator.userAgent.toLowerCase().indexOf('gecko') > -1,
  isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1,
  isMacintosh = navigator.userAgent.toLowerCase().indexOf('macintosh') > -1,
  isAppleWebKit = navigator.userAgent.toLowerCase().indexOf('applewebkit') > -1,
  isAndroid = navigator.userAgent.toLowerCase().indexOf('android') > -1,
  isMobile = navigator.userAgent.toLowerCase().indexOf('mobile') > -1,
  getChromeVersion = function() {
    var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return raw ? parseInt(raw[2], 10) : false;
  };

export var isTouchableDevice = function() {
  if(('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0) || (navigator.maxTouchPoints > 0)) {
    return true;
  } else {
    return false;
  }
}
// linear interpolation function
export function lerp(a, b, t) {return a + (b - a) * t}

export var BIGLOG = "color: #55fd53;font-size:25px;text-shadow: 0px 0px 5px #f4fd63, -1px -1px 5px orange";
export var REDLOG = "color: lime;font-size:15px;text-shadow: 0px 0px 5px red, -2px -2px 5px orangered";
export var NETLOG = "color: lime;font-size:15px;text-shadow: 0px 2px 2px green, 0px 1px 5px lime";
export var ANYLOG = "color: yellow;font-size:15px;text-shadow: 1px 1px 4px red, 0px 0px 2px orangered";

var cssVars = document.querySelector(':root');
export function getCssVar(propsName) {
  var rs = getComputedStyle(cssVars);
  return rs.getPropertyValue(propsName)
}

export function setCssVar(name, val) {
  cssVars.style.setProperty(name, val);
}

// Alert style text interest code from:
// https://stackoverflow.com/questions/5620516/how-to-get-text-bold-in-alert-or-confirm-box
export function toUnicodeVariant(str, variant, flags) {
  const offsets = {
    m: [0x1d670, 0x1d7f6],
    b: [0x1d400, 0x1d7ce],
    i: [0x1d434, 0x00030],
    bi: [0x1d468, 0x00030],
    c: [0x1d49c, 0x00030],
    bc: [0x1d4d0, 0x00030],
    g: [0x1d504, 0x00030],
    d: [0x1d538, 0x1d7d8],
    bg: [0x1d56c, 0x00030],
    s: [0x1d5a0, 0x1d7e2],
    bs: [0x1d5d4, 0x1d7ec],
    is: [0x1d608, 0x00030],
    bis: [0x1d63c, 0x00030],
    o: [0x24B6, 0x2460],
    p: [0x249C, 0x2474],
    w: [0xff21, 0xff10],
    u: [0x2090, 0xff10]
  }

  const variantOffsets = {
    'monospace': 'm',
    'bold': 'b',
    'italic': 'i',
    'bold italic': 'bi',
    'script': 'c',
    'bold script': 'bc',
    'gothic': 'g',
    'gothic bold': 'bg',
    'doublestruck': 'd',
    'sans': 's',
    'bold sans': 'bs',
    'italic sans': 'is',
    'bold italic sans': 'bis',
    'parenthesis': 'p',
    'circled': 'o',
    'fullwidth': 'w'
  }

  // special characters (absolute values)
  var special = {
    m: {
      ' ': 0x2000,
      '-': 0x2013
    },
    i: {
      'h': 0x210e
    },
    g: {
      'C': 0x212d,
      'H': 0x210c,
      'I': 0x2111,
      'R': 0x211c,
      'Z': 0x2128
    },
    o: {
      '0': 0x24EA,
      '1': 0x2460,
      '2': 0x2461,
      '3': 0x2462,
      '4': 0x2463,
      '5': 0x2464,
      '6': 0x2465,
      '7': 0x2466,
      '8': 0x2467,
      '9': 0x2468,
    },
    p: {},
    w: {}
  }
  //support for parenthesized latin letters small cases 
  for(var i = 97;i <= 122;i++) {
    special.p[String.fromCharCode(i)] = 0x249C + (i - 97)
  }
  //support for full width latin letters small cases 
  for(var i = 97;i <= 122;i++) {
    special.w[String.fromCharCode(i)] = 0xff41 + (i - 97)
  }

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';

  var getType = function(variant) {
    if(variantOffsets[variant]) return variantOffsets[variant]
    if(offsets[variant]) return variant;
    return 'm'; //monospace as default
  }
  var getFlag = function(flag, flags) {
    if(!flags) return false
    return flags.split(',').indexOf(flag) > -1
  }

  var type = getType(variant);
  var underline = getFlag('underline', flags);
  var strike = getFlag('strike', flags);
  var result = '';

  for(var k of str) {
    let index
    let c = k
    if(special[type] && special[type][c]) c = String.fromCodePoint(special[type][c])
    if(type && (index = chars.indexOf(c)) > -1) {
      result += String.fromCodePoint(index + offsets[type][0])
    } else if(type && (index = numbers.indexOf(c)) > -1) {
      result += String.fromCodePoint(index + offsets[type][1])
    } else {
      result += c
    }
    if(underline) result += '\u0332' // add combining underline
    if(strike) result += '\u0336' // add combining strike
  }
  return result
}

export function ORBIT(cx, cy, angle, p) {
  var s = Math.sin(angle);
  var c = Math.cos(angle);
  p.x -= cx;
  p.y -= cy;
  var xnew = p.x * c - p.y * s;
  var ynew = p.x * s + p.y * c;
  p.x = xnew + cx;
  p.y = ynew + cy;
  return p;
}

export function SWITCHER() {
  var ROOT = this;
  ROOT.VALUE = 1;
  ROOT.GET = function() {
    ROOT.VALUE = ROOT.VALUE * -1;
    return ROOT.VALUE;
  };
}

export function OSCILLATOR(min, max, step) {
  if((typeof min === 'string' || typeof min === 'number') && (typeof max === 'string' || typeof max === 'number') && (typeof step === 'string' || typeof step === 'number')) {
    var ROOT = this;
    this.min = parseFloat(min);
    this.max = parseFloat(max);
    this.step = parseFloat(step);
    this.value_ = parseFloat(min);
    this.status = 0;
    this.on_maximum_value = function() {};
    this.on_minimum_value = function() {};
    this.UPDATE = function(STATUS_) {
      if(STATUS_ === undefined) {
        if(this.status == 0 && this.value_ < this.max) {
          this.value_ = this.value_ + this.step;
          if(this.value_ >= this.max) {
            this.value_ = this.max;
            this.status = 1;
            ROOT.on_maximum_value();
          }
          return this.value_;
        } else if(this.status == 1 && this.value_ > this.min) {
          this.value_ = this.value_ - this.step;
          if(this.value_ <= this.min) {
            this.value_ = this.min;
            this.status = 0;
            ROOT.on_minimum_value();
          }
          return this.value_;
        }
      } else {
        return this.value_;
      }
    };
  } else {
    SYS.DEBUG.WARNING(
      "SYS : warning for procedure 'SYS.MATH.OSCILLATOR' Desciption : Replace object with string or number, min >> " +
      typeof min +
      ' and max >>' +
      typeof max +
      ' and step >>' +
      typeof step +
      ' << must be string or number.'
    );
  }
}


// DOM Notifi msg
export let notify = {
  root: () => byId('msgBox'),
  pContent: () => byId('not-content'),
  copy: function() {
    navigator.clipboard.writeText(notify.root().children[0].innerText);
  },
  c: 0, ic: 0, t: {},
  setContent: function(content, t) {
    var iMsg = document.createElement('div');
    iMsg.innerHTML = content;
    iMsg.id = `msgbox-loc-${notify.c}`;
    notify.root().appendChild(iMsg);
    iMsg.classList.add('animate1')
    if(t == 'ok') {
      iMsg.style = 'font-family: stormfaze;color:white;padding:7px;margin:2px';
    } else {
      iMsg.style = 'font-family: stormfaze;color:red;padding:7px;margin:2px; border : solid 1px red;';
    }
  },
  kill: function() {
    notify.root().remove();
  },
  show: function(content, t) {
    notify.setContent(content, t);
    notify.root().style.display = "block";
    var loc2 = notify.c;
    setTimeout(function() {
      byId(`msgbox-loc-${loc2}`).classList.remove("fadeInDown");
      byId(`msgbox-loc-${loc2}`).classList.add("fadeOut");
      setTimeout(function() {
        byId(`msgbox-loc-${loc2}`).style.display = "none";
        byId(`msgbox-loc-${loc2}`).classList.remove("fadeOut");

        byId(`msgbox-loc-${loc2}`).remove();
        notify.ic++;
        if(notify.c == notify.ic) {
          notify.root().style.display = 'none';
        }
      }, 1000)
    }, 3000);
    notify.c++;
  },
  error: function(content) {
    notify.root().classList.remove("success")
    notify.root().classList.add("error")
    notify.root().classList.add("fadeInDown");
    notify.show(content, 'err');
  },
  success: function(content) {
    notify.root().classList.remove("error")
    notify.root().classList.add("success")
    notify.root().classList.add("fadeInDown");
    notify.show(content, 'ok');
  }
}

export function FS() {
  if(!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if(document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
  byId('blocker').removeEventListener('click', FS)
}

export function FS_MOB() {
  if(!document.fullscreenElement) {
    document.documentElement.webkitRequestFullscreen();
  } else {
    if(document.exitFullscreen) {
      document.webkitExitFullscreen()
    }
  }
  byId('blocker').removeEventListener('touchstart', FS_MOB)
}

export function fullScreen() {
  // Just one time force
  if(!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if(document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

export function toggleFullScreeniOS() {
  if(!document.fullscreenElement) {
    document.documentElement.webkitRequestFullScreen();
  } else {
    if(document.exitFullscreen) {
      document.webkitCancelFullScreen();
    }
  }
}

export function attachFirstClick() {
  if(isTouchableDevice() == true) {
    byId('blocker').addEventListener('touchstart', FS_MOB)
  } else {
    byId('blocker').addEventListener('click', FS)
  }
}