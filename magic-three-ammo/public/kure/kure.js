import {BIGLOG, byId, isMobile, QueryString} from "../magic/utility.js";
import * as THREE from "three";

var OV; var numVideos = 0; var sessionName; var token;
export var session;

export var MEDIASERVER = {
	config: {},
	domain: ''
};

export function joinSession(options) {

	if(typeof options === 'undefined') {
		options = {
			resolution: '320x240'
		};
	}

	byId("sessionName").value = MEDIASERVER.config.masterChannel;
	// console.log('-> ', MEDIASERVER)

	document.getElementById("join-btn").disabled = true;
	document.getElementById("join-btn").innerHTML = "Joining...";

	getToken(function() {
		OV = new OpenVidu();
		window.OV = OV
		session = OV.initSession();

		session.on('connectionCreated', event => {
			if(App.net.connection.session.connection.connectionId != event.connection.connectionId) {
				console.log(`connectionCreated ${event.connection.connectionId}`)
			} else {
				dispatchEvent(new CustomEvent('onSetTitle', {detail: event.connection.connectionId}))
			}
			dispatchEvent(new CustomEvent('onHudMsg', {detail: {msg: `[user-conn][${event.connection.connectionId}]`}}))
			App.net.READY = true;
			pushEvent(event)
		});

		session.on('connectionDestroyed', e => {
			console.log(`Connection destroyed ${e.connection.connectionId}`)
			dispatchEvent(new CustomEvent('onHudMsg', {detail: {msg: `[disconnected][${e.connection.connectionId}]`}}))
			dispatchEvent(new CustomEvent('destroyObject', {detail: e.connection.connectionId}))
			byId("pwa-container-2").style.display = "none";
			pushEvent(e);
		});

		// On every new Stream received...
		session.on('streamCreated', event => {
			pushEvent(event);
			if(event.stream.connection.connectionId != App.net.connection.session.connection.connectionId) {
				console.log(`%c REMOTE STREAM READY ${event.stream.streamId}`)
				setTimeout(() => {
					console.log(`%c REMOTE STREAM READY [] ${byId("remote-video-" + event.stream.streamId)}`, BIGLOG)
					var v = byId("remote-video-" + event.stream.streamId)
					v.play();
					const videoTexture01 = new THREE.VideoTexture(v);
					App.net.injector.init({
						userid: event.stream.connection.connectionId,
						videoTex: videoTexture01
					})
				}, 4000)
			} else {

			}
			// console.log("event.stream.streamId => ", event.stream.streamId)
			// console.log("event.connection.connectionId => ", event.stream.connection.connectionId)
			dispatchEvent(new CustomEvent('onHudMsg', {detail: {msg: `[connectionId][${event.stream.connection.connectionId}]`}}))
			// Subscribe to the Stream to receive it
			// HTML video will be appended to element with 'video-container' id
			var subscriber = session.subscribe(event.stream, 'video-container');
			// When the HTML video has been appended to DOM...
			subscriber.on('videoElementCreated', event => {
				pushEvent(event);
				// Add a new HTML element for the user's name and nickname over its video
				updateNumVideos(1);
			});

			// When the HTML video has been appended to DOM...
			subscriber.on('videoElementDestroyed', event => {
				pushEvent(event);
				// Add a new HTML element for the user's name and nickname over its video
				updateNumVideos(-1);
			});

			// When the subscriber stream has started playing media...
			subscriber.on('streamPlaying', event => {
				pushEvent(event);
			});
		});

		session.on('streamDestroyed', event => {
			// alert(event);
			pushEvent(event);
		});

		session.on('sessionDisconnected', event => {
			alert("Session Disconected");
			byId("pwa-container-2").style.display = "none";
			pushEvent(event);
			if(event.reason !== 'disconnect') {
				removeUser();
			}
			if(event.reason !== 'sessionClosedByServer') {
				session = null;
				numVideos = 0;
				// $('#join').show();
				byId('join').style.display = 'block';
				byId('session').style.display = 'none';
			}
		});

		session.on('recordingStarted', event => {
			pushEvent(event);
		});

		session.on('recordingStopped', event => {
			pushEvent(event);
		});

		// On every asynchronous exception...
		session.on('exception', (exception) => {
			console.warn(exception);
		});

		dispatchEvent(new CustomEvent(`setupSessionObject`, {detail: {session}}))

		// From config
		if(MEDIASERVER.config.mobilePublishVideo == false) {
			if(isMobile) MEDIASERVER.config.publishVideo = false;
		}
		if(MEDIASERVER.config.mobilePublishAudio == false) {
			if(isMobile) MEDIASERVER.config.publishAudio = false;
		}
		// Override from url params
		if (QueryString.video == "true") {MEDIASERVER.config.publishVideo = true}
		if (QueryString.audio == "true") {MEDIASERVER.config.publishAudio = true}

		session.connect(token)
			.then(() => {
				byId('session-title').innerText = sessionName;
				byId('join').style.display = 'none';
				byId('session').style.display = 'block';
				var publisher = OV.initPublisher('video-container', {
					audioSource: undefined, // The source of audio. If undefined default microphone
					videoSource: undefined, // The source of video. If undefined default webcam
					publishAudio: MEDIASERVER.config.publishAudio, // Whether you want to start publishing with your audio unmuted or not
					publishVideo: MEDIASERVER.config.publishVideo, // Whether you want to start publishing with your video enabled or not
					resolution: options.resolution, // The resolution of your video
					frameRate: 30, // The frame rate of your video
					insertMode: 'APPEND', // How the video is inserted in the target element 'video-container'
					mirror: false // Whether to mirror your local video or not
				});
				publisher.on('accessAllowed', event => {
					pushEvent({
						type: 'accessAllowed'
					});
				});

				publisher.on('accessDenied', event => {
					pushEvent(event);
				});

				publisher.on('accessDialogOpened', event => {
					pushEvent({
						type: 'accessDialogOpened'
					});
				});

				publisher.on('accessDialogClosed', event => {
					pushEvent({
						type: 'accessDialogClosed'
					});
				});

				// When the publisher stream has started playing media...
				publisher.on('streamCreated', event => {
					console.log(`%c LOCAL STREAM READY ${event.stream.connection.connectionId}`, BIGLOG)
					// if(document.getElementById("pwa-container-1").style.display != 'none') {
					// 	document.getElementById("pwa-container-1").style.display = 'none';
					// }
					pushEvent(event);
				});

				// When our HTML video has been added to DOM...
				publisher.on('videoElementCreated', event => {
					pushEvent(event);
					updateNumVideos(1);
					event.element.mute = true;
				});

				// When the HTML video has been appended to DOM...
				publisher.on('videoElementDestroyed', event => {
					pushEvent(event);
					updateNumVideos(-1);
				});

				// When the publisher stream has started playing media...
				publisher.on('streamPlaying', event => {
					// console.log("publisher.on streamPlaying");
					// if(document.getElementById("pwa-container-1").style.display != 'none') {
					// 	document.getElementById("pwa-container-1").style.display = 'none';
					// }
					pushEvent(event);
				});
				session.publish(publisher);
				// console.log('SESSION CREATE NOW ', session)
			}).catch(error => {
				console.warn('Error connecting to the session:', error.code, error.message);
				enableBtn();
			});

		return false;
	});
}

export function leaveSession() {
	session.disconnect();
	enableBtn();

}

/* OPENVIDU METHODS */

export function enableBtn() {
	document.getElementById("join-btn").disabled = false;
	document.getElementById("join-btn").innerHTML = "Join!";
}

/* APPLICATION REST METHODS */

export function getToken(callback) {
	sessionName = byId("sessionName").value;

	httpRequest('POST',
		MEDIASERVER.domain + '/api/get-token', {
		sessionName: sessionName
	},
		'Request of TOKEN gone WRONG:',
		res => {
			token = res[0];
			console.warn('Nice (TOKEN:' + token + ')');
			callback(token);
		}
	);
}

export function removeUser() {
	httpRequest(
		'POST',
		MEDIASERVER.domain + '/api/remove-user', {
		sessionName: sessionName,
		token: token
	},
		'User couldn\'t be removed from session',
		res => {
			console.warn("You have been removed from session " + sessionName);
		}
	);
}

export function closeSession() {
	httpRequest(
		'DELETE',
		MEDIASERVER.domain + '/api/close-session', {
		sessionName: sessionName
	},
		'Session couldn\'t be closed',
		res => {
			console.warn("Session " + sessionName + " has been closed");
		}
	);
}

export function fetchInfo() {
	httpRequest('POST',
		MEDIASERVER.domain + '/api/fetch-info', {
		sessionName: sessionName
	},
		'Session couldn\'t be fetched',
		res => {
			console.warn("Session fetched");
			byId('textarea-http').innerText = JSON.stringify(res, null, "\t");
		}
	);
}

export function fetchAll() {
	httpRequest(
		'GET',
		MEDIASERVER.domain + '/api/fetch-all', {},
		'All session info couldn\'t be fetched',
		res => {
			console.warn("All session fetched");
			byId('textarea-http').innerText = JSON.stringify(res, null, "\t");
		}
	);
}

export function forceDisconnect() {
	httpRequest(
		'DELETE',
		MEDIASERVER.domain + '/api/force-disconnect', {
		sessionName: sessionName,
		connectionId: document.getElementById('forceValue').value
	},
		'Connection couldn\'t be closed',
		res => {
			console.warn("Connection has been closed");
		}
	);
}

export function forceUnpublish() {
	httpRequest(
		'DELETE',
		MEDIASERVER.domain + '/api/force-unpublish', {
		sessionName: sessionName,
		streamId: document.getElementById('forceValue').value
	},
		'Stream couldn\'t be closed',
		res => {
			console.warn("Stream has been closed");
		}
	);
}

export function httpRequest(method, url, body, errorMsg, callback) {
	byId('textarea-http').innerText = '';
	var http = new XMLHttpRequest();
	http.open(method, url, true);
	http.setRequestHeader('Content-type', 'application/json');
	http.addEventListener('readystatechange', processRequest, false);
	http.send(JSON.stringify(body));

	function processRequest() {
		if(http.readyState == 4) {
			if(http.status == 200) {
				try {
					callback(JSON.parse(http.responseText));
				} catch(e) {
					callback(e);
				}
			} else {
				console.warn(errorMsg + ' (' + http.status + ')');
				console.warn(http.responseText);
				byId('textarea-http').innerText = errorMsg + ": HTTP " + http.status + " (" + http.responseText + ")";
			}
		}
	}
}

export function startRecording() {
	// not fixed 
	var outputMode = $('input[name=outputMode]:checked').val();
	var hasAudio = $('#has-audio-checkbox').prop('checked');
	var hasVideo = $('#has-video-checkbox').prop('checked');
	httpRequest('POST',
		'api/recording/start', {
		session: session.sessionId,
		outputMode: outputMode,
		hasAudio: hasAudio,
		hasVideo: hasVideo
	},
		'Start recording WRONG',
		res => {
			console.log(res);
			document.getElementById('forceRecordingId').value = res.id;
			checkBtnsRecordings();
			byId('textarea-http').innerText = JSON.stringify(res, null, "\t");
		}
	);
}

export function stopRecording() {
	var forceRecordingId = document.getElementById('forceRecordingId').value;
	httpRequest('POST',
		'api/recording/stop', {
		recording: forceRecordingId
	},
		'Stop recording WRONG',
		res => {
			console.log(res);
			$('#textarea-http').text(JSON.stringify(res, null, "\t"));
		}
	);
}

export function deleteRecording() {
	var forceRecordingId = document.getElementById('forceRecordingId').value;
	httpRequest(
		'DELETE',
		'api/recording/delete', {
		recording: forceRecordingId
	},
		'Delete recording WRONG',
		res => {
			console.log("DELETE ok");
			byId('textarea-http').innerText = "DELETE ok";
		}
	);
}

export function getRecording() {
	var forceRecordingId = document.getElementById('forceRecordingId').value;
	httpRequest(
		'GET',
		'api/recording/get/' + forceRecordingId, {},
		'Get recording WRONG',
		res => {
			console.log(res);
			byId('textarea-http').innerText = JSON.stringify(res, null, "\t");
		}
	);
}

export function listRecordings() {
	httpRequest(
		'GET',
		'api/recording/list', {},
		'List recordings WRONG',
		res => {
			console.log(res);
			byId('textarea-http').innerText = JSON.stringify(res, null, "\t");
		}
	);
}

/* APPLICATION REST METHODS */
/* APPLICATION BROWSER METHODS */
export var events = '';
window.onbeforeunload = function() {
	if(session) {
		removeUser();
		leaveSession();
	}
}

export function updateNumVideos(i) {
	numVideos += i;
	var coll = document.getElementsByTagName('video')
	for(var x = 0;x < coll.length;x++) {
		coll.classList = '';
	}

	for(var x = 0;x < coll.length;x++) {
		coll.classList = '';
		switch(numVideos) {
			case 1:
				coll[x].classList.add('two');
				break;
			case 2:
				coll[x].classList.add('two');
				break;
			case 3:
				coll[x].classList.add('three');
				break;
			case 4:
				coll[x].classList.add('four');
				break;
		}
	}
}

export function checkBtnsForce() {
	if(document.getElementById("forceValue").value === "") {
		document.getElementById('buttonForceUnpublish').disabled = true;
		document.getElementById('buttonForceDisconnect').disabled = true;
	} else {
		document.getElementById('buttonForceUnpublish').disabled = false;
		document.getElementById('buttonForceDisconnect').disabled = false;
	}
}

export function checkBtnsRecordings() {
	if(document.getElementById("forceRecordingId").value === "") {
		document.getElementById('buttonGetRecording').disaevents$bled = true;
		document.getElementById('buttonStopRecording').disabled = true;
		document.getElementById('buttonDeleteRecording').disabled = true;
	} else {
		document.getElementById('buttonGetRecording').disabled = false;
		document.getElementById('buttonStopRecording').disabled = false;
		document.getElementById('buttonDeleteRecording').disabled = false;
	}
}

export function pushEvent(event) {
	events += (!events ? '' : '\n') + event.type;
	byId('textarea-events').innerText = events;
	// console.info("EVENT: ", events)
}

export function clearHttpTextarea() {
	byId('textarea-http').innerText = '';
}

export function clearEventsTextarea() {
	byId('textarea-events').innerText = '';
	events = '';
}

/* APPLICATION BROWSER METHODS */