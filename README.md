
# MagicThree

## Logo
<img src="https://github.com/zlatnaspirala/magic-three/blob/main/magic-three-ammo/public/assets/icons/icon.png" width="200" height="200">

Using power of Three.js, ammo.js. MagicThree is nice class sorted top level of threejs and ammo.js. Magic-three use the new version threejs 149.
[JS type of script `module` variant with last version of three.module.js]

## Extreme interest facts:
 - No spending times on build, magic-three use type module in browser.
 - Using themes without scss - also no build.
 - Combination Three.js vs ammo.js is last physics solution from three.js project.
 - Using webRTC for networking/multiplayer brings video chat/stream in same time.

## Description
  Magic-Three is First Person Oriented but can be used for any other case of app flow.
  - No build needed, just copy/paste for both dev and prod mode.It is the module type of script.
    Nice fit with npm modules also works direct in browser.
  - Custom magic Map loader. All 3d objects comes from map.
  - No package.json [if this repo become npm package then will be back]
    In folder ./backend we have package.json to import deps (npm i) for server part.
    Run in folder  `./backend` cmd: `npm i` and `npm run magic` for host and broadcaster.
  - Must be fully PWA [cache, server compression, image format webp etc...]
  - MultiLang support [async load JSON MultiLang file avoid loading all multiLangs]
  - Networking based on webRtc multiRTC3 library. Signaling server,
    video chat or stream to texture.
  - Basic example: FPS Player controller [bullet , collision]

### `Frontend -> Three.js, Ammo.js`
### `Backend  -> Node.js, MultiRTC3`

## Main gameplay template FPShoter: Hang3d Reborn
```js
import Application from './Application.js';
import config from './config.js';
import myGamePlayMagicMap from './public/assets/maps/free-for-all.js';

let App = new Application(config, myGamePlayMagicMap);
```



### Client Config

```js
const config = {
  cache: false,
  stats: false,
  camera: {
    fov: 60,
    near: 0.1,
    far: 2000,
    order: 'YXZ'
  },
  map: {
    sky: {
      enabled: true
    },
    background: 0xbfd1e5,
    floorWidth: 200,
    floorHeight: 200,
    gravityConstant: 17.5,
    directionLight: {
      color: 0xffffff,
      intensity: 5
    },
    ambientLight: {
      color:  "rgb(250,250,250)"
    },
    meshShadows: {
      castShadow: false,
      receiveShadow: false,
      computeVertexNormals: false
    },
    blockingVolumes: {
      visible: false
    }
  },
  playerController: {
    type: 'FPS', // FPS | orbit
    movementType: 'velocity', // velocity | kinematic
    cameraInitPosition: {x: 0, y: 0, z: -80},
    movementSpeed : {
      forward: 8, backward: 6,
      left: 8, right: 8,
      jump : 11, jumpLimitInterval: 2000
    },
    physicsBody : {
      visible: false,
      radius: 2,
      mass: 10
    },
    bullet: {
      mass: 2,
      radius: 0.1,
      power: 100,
      bulletLiveTime: 1000
    }
  },
  networking: {
    broadcasterPort: 9001,
    broadcasterInit: true,
    // domain: "maximumroulette.com",
    domain: "localhost",
    networkDeepLogs: true,
    /**
     * masterServerKey is channel access id used to connect
     * endpoint p2p. Multimedia server channel/multiRTC3 used.
     */
    masterServerKey: "magic.three.main.channel",
    runBroadcasterOnInt: true,
    broadcasterPort: 9001, // 9010,
    broadcastAutoConnect: true,
    broadcasterSessionDefaults: {
      sessionAudio: true,
      sessionVideo: false,
      sessionData: true,
      enableFileSharing: true,
    },
    stunList: [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
      "stun:stun.l.google.com:19302?transport=udp",
    ],
    getBroadcastSockRoute() {
      return getProtocolFromAddressBar() + getDomain() + ":" + this.broadcasterPort + "/";
    }
  }
}
```

Blocking Volumes implemented for map -  `map.objMtlsArray` :
<img src="https://github.com/zlatnaspirala/magic-three/blob/main/non-project-files/screen1.png" width="800" height="500">
Nice for walls and env staff. Forced simple cube physics body with mass = 0.


## Frontend 
Frontend done in script type "module" ant it's so powerfull.
No build time lost.

List of top level CustomEvents :
 - "config.map.blockingVolumes.visible"  - if QueryString.dev == "true" (URL param ?dev=true)
 - "onMyDamage"
 - "onDie"
 - "onFire"
 - "hide-blocker"
 - "multi-lang-ready"
 - "addToOnlyIntersects"
 
 Explanation in next update...

 - Initially video stream is deactivated. Manage this from config :
 ```js
     broadcasterSessionDefaults: {
      sessionAudio: false,     // IMPORTANT
      sessionVideo: false,     // IMPORTANT
      sessionData: true,       // IMPORTANT
      enableFileSharing: true,
 ```


## Backend part based on multiRTC3.
For now only signaling pricipe is implemented.
If you wanna start host server and broadcaster[webRtc] then:

```js
cd backend
npm i
npm run magic
```

Setup in backend/magic-three.server.js your own domain: 
If you put "*" in public server someone can use your web app cross domain.
This will be automated in future.
```js
    // res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader('Access-Control-Allow-Origin', 'https://localhost:9001');
    res.setHeader('Access-Control-Allow-Origin', 'https://maximumroulette:9001');
```

I force default browser port 443! To make all works fine (CORS problems).
For `localhost` cert also better https. For public server you need classic ssl setup.

Navigate (most simple way to fix localhost cert problem is to click advanced -> Proceed to localhost (unsafe))
https://localhost/public/module.html

If still networking not work then goto:
https://localhost:9001/
click advanced -> Proceed to localhost (unsafe)

Finally when you see html text:
```txt
********************************************************** 
* MatrixNet         version: 0.2.0                       * 
* Type of network - BROADCASTER                          * 
* Source: https://github.com/zlatnaspirala/matrix-engine * 
**********************************************************
```
Server is allowed for localhost.

After all goto https://localhost/public/module.html
Must work now.
You can easy manage paths. Default is `https` protocol and also recommended in multiplayer mode.


## Dev stage
   Easy running also on VPS:
 - https://maximumroulette.com/apps/magic/public/module.html


## Features
 - Dynamic Cache/Worker, add to home screen. [pwa]✅
 - Graphics/Physics scene ready.✅
 - Add 3d object loaders [fbx, collada].✅
 - Script compression bash script.✅
 - Basic FPS controller✅
 - Adding map pack principle.✅
 - Net Players.✅
 - Tested on android12 devices.✅
 - Real Day time - sky(shaders) done  + wip envelop shaders adaptaion lights.⏳
 - Add account options REST API [rocketCraftingServer].
   singin , leaderboard. Only client part no need backend i already have running
   rcs on maximumroulette.com. ⏳
 - Net Shared objects +.⏳
 - Neutral enemy [bots] +.⏳

# Map [] ⏳

Working example:
```js

let map = {
  breakable: [
    {
      name: "myBreakAbleBox1",
      mass: 100,
      scale: {x: 2, y: 5, z: 2},
      pos: {x: 3, y: 1, z: 1},
      quat: [0, 0, 0, 1],
      matFlag: 'Black' // new
    }
  ],
  boxs: [
    {
      name: "myMidBox1",
      net: true,
      mass: 10,
      scale: {x: 5, y: 5, z: 5},
      pos: {x: 0, y: 1, z: 20},
      quat: [0, 0, 0, 1],
      matFlag: 'Bronze'
    }
  ],
  tubes: [
    {
      name: "myTube1",
      mass: 1000,
      scale: [5, 5, 20, 32],
      pos: {x: -20, y: 1, z: -80},
      quat: [0, 0, 0, 1]
    },
    {
      name: "myTube2",
      mass: 1000,
      scale: [5, 5, 20, 32],
      pos: {x: 20, y: 1, z: -80},
      quat: [0, 0, 0, 1]
    }
  ],
  torus: [
    {
      name: "myTorus1",
      mass: 1000,
      scale: [10, 3, 16, 100],
      pos: {x: 30, y: 1, z: 1},
      quat: [0, 0, 0, 1]
    }
  ],
  pointLights: [
    {
      name: 'l1',
      color: 0xff0040,
      radius: 2,
      intensity: 150,
      pos: {x: 30, y: 12, z: 10},
      helper: true
    },
    {
      name: 'l2',
      color: 0xeeee40,
      radius: 2,
      intensity: 510,
      pos: {x: -30, y: 12, z: 10},
      helper: true
    }
  ],
  objMtls: [
    {
      path: 'assets/objects/env/wall1.obj',
      name: 'myWall_1',
      pos: {x:-100, y:-0.5, z:-42}
    }
  ],
  objMtlsArray: [
    {
      path: 'assets/objects/env/wall1.obj',
      name: 'myWall',
      instances: [
        {pos: {x: -100, y: -0.5, z: -62}},
        {
          pos: {x: 52.8, y: -0.5, z: 86.5},
          rot: {x: 0, y: 90, z: 0}
        }
      ]
    }
  ]
};

export default map;

```

## More info about PWA ⏳
I have performance stable at ~90% value. I load extra fbx animation 22Mb to test little more better.
Image formats like WebP and AVIF often provide better compression than PNG or JPEG, 
which means faster downloads and less data consumption. I use freeware GIMP he had a webp format support for exports.

Lighthouse screenshot:
<img src="https://github.com/zlatnaspirala/magic-three/blob/main/non-project-files/pwa.png" width="800" height="500">

No need for PWA at dev/localhost work.
In final time you can use .prod.js compressed files to make full optimised app with better preformance.


### MultiLang [strings]

Only on startup for now:
```js
    addEventListener('multi-lang-ready', () => {
      byId('header.title').innerHTML = t('title');
      byId('player.munition.label').innerHTML = t('munition');
      ...
    });
```

### Networking [WEBRTC/IOSOCKET] 💫

  - I use classic broadcester from matrix-engine-server/visual ts [multiRTC3]
  - Every player send own `net.connection.userid`.
  - Type of gameObject `boxs` map loader have support for net emit. ⏳

### Explanation of FPS used concept
 - Local Player have no any visual objs , only main three.js camera follow player position and look direction.
 - Net Player [remote player] have visualization with FBX animation. Net rotated only for Y axis for now.
 - Local Player have physics body ball who is moved from physics world
   on that way we got all collision problem fixed.
 - Net Player have no physics body also no any collision objs i use raycaster from three.js in net player case
   On that way i got optimised and precise situation with netplayer handling.

## Credits && Licence
 - https://threejs.org/
 - https://github.com/kripken/ammo.js/
 - In Assets i use great https://mixamo.com/
 - Mobile controller used from 
   https://github.com/KEY4d-LAB/crypto-art-town
 - Networking based on https://github.com/muaz-khan/RTCMultiConnection
 - Font wargames used from https://www.dafont.com/wargames.font
 - Audios , Great staff at https://gamesounds.xyz/?dir=OpenBundle
   https://gamesounds.xyz/OpenBundle/LICENSE.txt

## More

### Most effect dimanic thermes with native css and control from javascript

Using css vars from `vars.css`.

Script:
```
import {setCssVar} from "./utility.js"

export class MagicTheme {

	Light() {
		console.log('THEME LIGHT SET')
		setCssVar("--bg", "#6b6b6b33")
		setCssVar("--text", "hsl(1, 20%, 100%)")
		setCssVar("--text2", "rgb(0, 0, 0)")
		setCssVar("--err", "orangered")
		setCssVar("--bgBlocker", "rgba(150, 150, 150, 0.9)")
		setCssVar("--bgTransparent1", "rgba(0, 0, 0, 0.1)")
		setCssVar("--LG1", "linear-gradient(87deg,#ff6f00,#b5830f,#df494b,#fff,#fff,#e90b0f)")
		setCssVar("--mainFont", "Accuratist")
	}

	Dark() {
		setCssVar("--bg", "#0d2d4e")
		setCssVar("--text", "hsl(0, 0%, 100%)")
		setCssVar("--text2", "rgb(255, 253, 192)")
		setCssVar("--err", "red")
		setCssVar("--bgBlocker", "rgba(10, 10, 10, 0.9)")
		setCssVar("--bgTransparent1", "rgba(0, 0, 0, 0.1)")
		setCssVar("--LG1", "linear-gradient(87deg,#00b3ff,#510fb5,#49cbdf,#000000,#000000,#1d0be9)")
		setCssVar("--mainFont", "stormfaze")
	}

	Green() {
		setCssVar("--bg", "#000")
		setCssVar("--text", "hsl(107.39deg 82.83% 47.02%)")
		setCssVar("--text2", "rgb(42 199 49)")
		setCssVar("--err", "red")
		setCssVar("--bgBlocker", "rgba(10, 10, 10, 0.9)")
		setCssVar("--bgTransparent1", "rgba(0, 0, 0, 0.1)")
		setCssVar("--LG1", "linear-gradient(87deg,#10f30f,#fff,#10f30f,#000000,#10f30f,#000000)")
		setCssVar("--mainFont", "WARGAMES")
	}

	constructor() {
		addEventListener("theme", (e) => {
			this[e.detail]();
		})
	}

}
```


### Implementing account for GamePlay platform based on RocketCraaftingServer
```js
 fetch("http://maximumroulette.com/rocket/login", {
                  "headers": {
                    "accept": "application/json",
                    "accept-language": "en-US,en;q=0.9,ru;q=0.8",
                    "cache-control": "no-cache",
                    "content-type": "application/json",
                    "pragma": "no-cache"
                  },
                  "referrer": "http://maximumroulette.com/apps/my-admin/",
                  "referrerPolicy": "strict-origin-when-cross-origin",
                  "body": "{\"emailField\":\"zlatnaspirala@gmail.com\",\"passwordField\":\"123123123\"}",
                  "method": "POST",
                  "mode": "cors",
                  "credentials": "omit"
                });
```


### Problem with  > 100Mb file size upload on github use this link for fbx animations
(prepared in blender) you can open it in any 3d editor:
https://drive.google.com/drive/folders/194gsNMBvljJgK_2nyM4paA-veBZl8_Tf?usp=sharing


### Update deps
 - npm outdated 2024


### At separated branch you can find [old-arhive]:
- old [threejs version 75 , 68 etc...]
   Lot of crazzy staff but you need to make it running... [deplaced methodology] ☣

### Magic-three-cannonjs old but still good! [threejs version 75]
 - Very simple top level code! [Still developing at this base]
