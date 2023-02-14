
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
  if (f == false) return;
  if("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      if(isiOS()) {
        navigator.serviceWorker.register("../cache.ios.js").then(() => {
          console.log('Worker runned.');
        });
      } else {
      navigator.serviceWorker.register("../cache.js").then(() => {
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