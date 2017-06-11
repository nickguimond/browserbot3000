process.env.IP = '127.0.0.1';  // Set the location of you running selenium server or chromedriver instance.
process.env.PORT = '4444';  // Set the port your server is listening on. 
// process.env.EDGE = 'true'; // Set this if you want to use EDGE browser
const { browser } = require('browserbot3000'); // You can include the browser here or only include it in your page objects reusable methods

let Google = require('./page');  // Add your page object

// let firefox = {
// 	'desiredCapabilities': {
// 		'browserName': 'firefox',
// 		"moz:firefoxOptions": {
// 			"args": ["--no-remote"],
// 			"prefs": {
// 				"dom.ipc.processCount": 8
// 			},
// 			"log": {
// 				"level": "trace"
// 			}
// 		}
// 	}
// };
// let edge = {
// 	'desiredCapabilities': {
// 		'browserName': 'edge'
// 	}
// };


browser.newBrowserSession(); //or using the above objects...   browser.newBrowserSession(edge);   browser.newBrowserSession(firefox);
browser.url('http://google.com');
Google.searchBox.setValue('first search term' + '\uE007'); // use a page element directly 
Google.googleSearch('SeleniumHQ'); // or construct reusable methods for repeatable actions

browser.close();
browser.deleteCurrentSession();
