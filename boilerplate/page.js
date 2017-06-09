const { browser, Page } = require('browserbot3000');
module.exports = {

	// Google Search
	searchBox: new Page.Element('input[id="lst-ib"]'),
	link: new Page.Element('a[class="l"]', 1),

	googleSearch: function(searchTerm) {
		browser.url('https://google.com');
		this.searchBox.setValue(searchTerm + '\uE007');
		this.link.click(); // should just click the  first link
	}

};