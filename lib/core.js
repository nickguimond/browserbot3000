const request = require('request'), fs = require('fs'), assert = require('assert');
const Queue = require('better-queue');
let currentElement = '';
let path = './repl_session.txt';
const baseUrl = `http://${process.env.IP}:${process.env.PORT}/wd/hub/`;
let sessionId = 'null';
let sessionUrl = `null`;
if (!fs.existsSync(path)) { // make it if you cant find it
	fs.writeFileSync('./repl_session.txt', sessionId, 'utf8');
} else { //read it if it's there AND not a null value
	sessionId = fs.readFileSync(path, 'utf8');
	if (sessionId != 'null') {
		console.log(`Using existing chrome session: ${sessionId}`);
		sessionUrl = `${baseUrl}session/${sessionId}/`;
	}
}
console.time('TotalRunTime');
var q = new Queue(async function(options, cb) {
	console.time(options.description);
	switch (options.body.uri) {
		case 'status': options.body.uri = `${baseUrl}status`;
			break;
		case 'newSession': options.body.uri = `${baseUrl}session`;
			break;
		case 'session/status': options.body.uri = `${sessionUrl}`;
			break;
		case 'sendKeys': options.body.uri = `${sessionUrl}element/${currentElement}/value`;
			break;
		case 'clear': options.body.uri = `${sessionUrl}element/${currentElement}/clear`;
			break;
		case 'click': options.body.uri = `${sessionUrl}element/${currentElement}/click`;
			break;
		case 'isVisible': options.body.uri = `${sessionUrl}element/${currentElement}/css/display`;
			break;
		case 'isEnabled': options.body.uri = `${sessionUrl}element/${currentElement}/enabled`;
			break;
		case 'isSelected': options.body.uri = `${sessionUrl}element/${currentElement}/selected`;
			break;
		case 'getText': options.body.uri = `${sessionUrl}element/${currentElement}/text`;
			break;
		case 'elementScreenshot': options.body.uri = `${sessionUrl}element/${currentElement}/screenshot`;
			break;
		default:
			let cmd = options.body.uri;
			options.body.uri = `${sessionUrl}` + cmd;
			break;
	}
	if (options.body.uri == `${sessionUrl}sleep`) {
		await sleep(options.timeout);
		cb('yeap', 'passed');
	} else if (options.expected == false) {
		let attempts = 0;
		let repeater = async function() {
			let returnedData = await createPromiseCall(options).catch((e) => { console.log(e) });
			//console.log(returnedData);
			// /console.log(returnedData.value);
			if (returnedData.state == 'stale element reference') { console.log('Stale element refrence') } else { console.log(returnedData.value) }
			if (returnedData.state == 'unknown command') { console.log(`Unknown Command: ${returnedData.value.localizedMessage}`) }
			if (returnedData.state == 'no such element' || returnedData.state == 'stale element reference') {
				console.timeEnd(options.description);
				cb(returnedData, 'passed');
			} else {
				if (attempts < (options.timeout / 300)) {
					await sleep(300);
					repeater();
				}
				attempts++;
			}
		}
		repeater();
	} else if (options.index) {
		console.log('Getting array of elements');
		let attempts = 0;
		let repeater = async function() {
			let returnedData = await createPromiseCall(options).catch((e) => { console.log(e) });
			if (returnedData.state == 'no such element') { console.log(`No Such Element`) } // option to save the screenshot at this point as is default behaviour to provide one
			if (returnedData.state == 'unknown command') { console.log(`Unknown Command: ${returnedData.value.localizedMessage}`) }
			//console.log(returnedData);
			if (returnedData.value[options.index]) {
				console.timeEnd(options.description);
				cb(returnedData, 'passed');
			} else {
				if (attempts < (options.timeout / 300)) {
					await sleep(300);
					repeater();
				}
				attempts++;
			}
		}
		repeater();
	} else {
		let attempts = 0;
		let repeater = async function() {
			let returnedData = await createPromiseCall(options).catch((e) => { console.log(e) });
			if (returnedData.state == 'no such element') { console.log(`No Such Element`) } // option to save the screenshot at this point as is default behaviour to provide one
			if (returnedData.state == 'unknown command') { console.log(`Unknown Command: ${returnedData.value.localizedMessage}`) }
			//console.log(returnedData);
			if (returnedData.state == 'success' || returnedData.status == 0) {
				console.timeEnd(options.description);
				cb(returnedData, 'passed');
			} else {
				if (attempts < (options.timeout / 300)) {
					await sleep(300);
					repeater();
				}
				attempts++;
			}
		}
		repeater();
	}
});
q.on('empty', function() { console.timeEnd('TotalRunTime') })
let createPromiseCall = function(options) {
	return new Promise(function(resolve, reject) {
		request(options.body, function(error, response, body) {
			if (error) reject(error);
			//console.log(body);
			resolve(body);
		});
	});
}
let sleep = function(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}
class Action {
	constructor(url, method, json, desc, expect, time = 60000, index) {
		this.body = {
			uri: `${url}`,
			method: method,
			json: json,
			followAllRedirects: true,
			headers: {
				'Connection': 'keep-alive',
				'Accept': 'application/json',
				'User-Agent': 'webdriver'
			},
			timeout: 60000
		};
		this.description = desc;
		this.expected = expect;
		this.timeout = time;
		this.index = index;
	}
}
initSessionCheck = function() {
	q.push(new Action('status', 'GET', true, 'Validate webdriver host is running'), (result) => {
		if (result.state != 'success') {
			throw new Error(`Webdriver host not currently running at ${baseUrl}`);
		}
	});
	if (sessionId != 'null') {
		q.push(new Action('session/status', 'GET', true, 'Validate saved session is available'), (result) => {
			if (result.state == 'invalid session id') {
				console.log('Saved session is no longer valid');
			}
		});
	}

}
// initSessionCheck();
module.exports = {
	newChromeSession: function(options) {
		let chromeOptions;
		if (options) {
			chromeOptions = options;
		} else {
			chromeOptions = {
				'desiredCapabilities': {
					'javascriptEnabled': true,
					'locationContextEnabled': true,
					'handlesAlerts': true,
					'rotatable': true,
					'browserName': 'chrome',
					'chromeOptions': {
						'prefs': { 'profile.managed_default_content_settings.media_stream': 1, 'credentials_enable_service': false, 'profile.password_manager_enabled': false },
						'args': ['use-fake-device-for-media-stream', 'use-fake-ui-for-media-stream', 'disable-infobars', 'start-maximized']
					},
					'loggingPrefs': {
						'browser': 'ALL',
						'driver': 'ALL'
					}, 'requestOrigins': { 'url': 'w/e', 'version': '0.0.1', 'name': 'webdriver' }
				}
			};
		}
		q.push(new Action('newSession', 'POST', chromeOptions, 'Create a new chrome session'), (result) => {
			console.log(`Chrome session id: ${result.sessionId}`);
			fs.writeFileSync('./repl_session.txt', result.sessionId, 'utf8');
			sessionId = result.sessionId;
			sessionUrl = `${baseUrl}session/${sessionId}/`;
		});
	},
	deleteCurrentSession: function() {
		q.push(new Action(``, 'DELETE', true, 'Delete current session'), (result) => {
			// console.log(`Created new Chrome session: ${result.sessionId}`);
			fs.writeFileSync('./repl_session.txt', 'null', 'utf8');
		});
	},
	close: function() {
		q.push(new Action(`window`, 'DELETE', true, 'Close current window'), (result) => {
			// console.log(`Created new Chrome session: ${result.sessionId}`);
			fs.writeFileSync('./repl_session.txt', 'null', 'utf8');
		});
	},
	element: function(selector, timeout = 60000) {
		if (selector.indexOf('*') > -1) {
			let selectorArray = selector.split('=');
			let finalBuild = `//${selectorArray[0].slice(0, -1)}[contains(., \"${selectorArray[1]}\")]`;
			q.push(new Action('element', 'POST', { using: 'xpath', value: finalBuild }, `Get single element locator using xPath`, true, timeout), (result) => {
				currentElement = result.value.ELEMENT;
			});
		} else {
			q.push(new Action(`element`, 'POST', { using: 'css selector', value: selector }, `Get single element locator using css`, true, timeout), function(result) {
				currentElement = result.value.ELEMENT;
			});
		}
	},
	elements: function(selector, index, timeout = 60000) {
		q.push(new Action(`elements`, 'POST', { using: 'css selector', value: selector }, `Get single element locator from a list`, true, timeout, index), (result) => {
			console.log(result);
			currentElement = result.value[index].ELEMENT;
		});
	},
	click: function() {
		q.push(new Action(`click`, 'POST', true, `Click element`), (result) => {
		});
	},
	sendKeys: function(value) {
		let valueArray = value.split('');
		q.push(new Action(`sendKeys`, 'POST', { value: valueArray }, `Send keys "${value}" to current element`), (result) => {
		});
	},
	clear: function(value) {
		q.push(new Action(`clear`, 'POST', true, `Clear element`), (result) => {
		});
	},
	isVisble: function(timeout, expected) {
		q.push(new Action(`isVisible`, 'GET', true, `Check if element is visible`, expected, timeout), (result) => {
			//if (expected) { assert.equal(expected, result.value, `Expected ${result.value} to equal ${expected}`); }
		});
	},
	isEnabled: function(expected) {
		q.push(new Action(`isEnabled`, 'GET', true, `Check if element is enabled`), (result) => {
			if (expected) { assert.equal(expected, result.value, `Expected ${result.value} to equal ${expected}`); }
		});
	},
	isSelected: function(expected) {
		q.push(new Action(`isSelected`, 'GET', true, `Check if element is selected`), (result) => {
			if (expected) { assert.equal(expected, result.value, `Expected ${result.value} to equal ${expected}`); }
		});
	},
	url: function(url) {
		q.push(new Action('url', 'POST', { url: url }, `Navigate to ${url}`), (result) => {
			assert.equal(0, result.status, `${result.status}`);
		});
	},
	getUrl: function() {
		q.push(new Action(`url`, 'GET', true, `Get current windows url `), (result) => { });
	},
	getTitle: function() {
		q.push(new Action(`title`, 'GET', true, `Get current windows title `), (result) => { });
	},
	getWindow: function() {
		q.push(new Action(`window`, 'GET', true, `Get current windows id `), (result) => { });
	},
	getActive: function() {
		q.push(new Action(`element/active`, 'GET', true, `Get current active element `), (result) => { });
	},
	getText: function(expected) {
		q.push(new Action(`getText`, 'GET', true, `Get current element text `), (result) => {
			if (expected) { assert.equal(expected, result.value, `Expected ${result.value} to equal ${expected}`); }
			return result.value;
		});
	},
	setTimeouts: function(timeoutVal) {
		q.push(new Action(`timeouts`, 'POST', { "type": "implicit", "ms": timeoutVal }, `Set browser implicit timeouts to ${timeoutVal} `), (result) => {
			assert.equal('success', result.state, `${result.state}`);
		});
	},
	getAlertText: function() {
		q.push(new Action(`alert/text`, 'GET', true, `Get alert text`), (result) => { });
	},
	dismissAlert: function() {
		q.push(new Action(`alert/dismiss`, 'POST', true, `Dismiss alert`), (result) => { });
	},
	getText: function() {
		q.push(new Action(`text`, 'GET', true, `Get elements text`), (result) => { });
	},
	getScreenshot: function() {
		q.push(new Action(`screenshot`, 'GET', true, `Get a window screenshot`), (result) => {
			fs.writeFileSync('screenshot.png', result.value, { encoding: 'base64' });
		});
	},
	getElementScreenshot: function() {
		q.push(new Action(`elementScreenshot`, 'GET', true, `Get an element screenshot`), (result) => {
			fs.writeFileSync('elementScreenshot.png', result.value, { encoding: 'base64' });
		});
	},
	getWindowHandles: function() {
		q.push(new Action(`window/handles`, 'GET', true, `Get all window handles`), (result) => { });
	},
	setWindowSize: function() {
		q.push(new Action(`window/current/size`, 'POST', { width: 1920, height: 1080 }, 'Change window dimensions'), (result) => { });
	},
	maximize: function() {
		q.push(new Action(`window/current/maximize`, 'POST', true, 'Maximize window'), (result) => { });
	},
	switchToWindow: function() {
		q.push(new Action(`window`, 'POST', 'should be window frame here...', 'Switch to window'), (result) => { });
	},
	zoomLevel: function() {
		q.push(new Action(`execute`, 'POST', { "script": "return (function () {\r\n document.getElementsByTagName(\"BODY\")[0].style.zoom = '50%'; \r\n }).apply(null, arguments)", "args": [] }, 'Set page zoom level '), (result) => { });
	},
	execute: function(script) {
		q.push(new Action(`execute`, 'POST', { "script": JSON.stringify(script) }), (result) => { });
	},
	executeAsync: function(script) {
		q.push(new Action(`execute`, 'POST', { "script": JSON.stringify(script) }), (result) => { });
	},
	// inputText: function(id, text) {
	// 	q.push(new Action(`execute`, 'POST', { "script": `return (function () { document.getElementById('${id}').value= '${text}'}).apply(null, arguments)`, "args": [] }, 'Set input text value '), (result) => { });
	// },
	fullScreen: function() {
		q.push(new Action(`window/fullscreen`, 'POST', true, 'Fullscreen window'), (result) => { });
	},
	getWindowSize: function() {
		q.push(new Action(`window/rect`, 'GET', true, `Get current windows size `), (result) => { });
	},
	getSource: function() {
		q.push(new Action(`source`, 'GET', true, `Get current page source `), (result) => { });
	},
	getCookie: function() {
		q.push(new Action(`cookie`, 'GET', true, `Get browser cookie `), (result) => { });
	},
	pause: function(time) {
		q.push(new Action(`sleep`, 'GET', true, `Sleep for ${time} ms `, true, time), (result) => { });
	},
	sleep: function(time) {
		q.push(new Action(`sleep`, 'GET', true, `Sleep for ${time} ms `, true, time), (result) => { });
	}
}
