const browser = require('./core');
const $ = browser.element;
const $$ = browser.elements;

class Element {
	constructor(selector, index) {
		this.selector = selector;
		this.index = index;
	}
	click() {
		if (this.index === undefined) {
			$(this.selector);
			browser.click();
		} else {
			$$(this.selector, this.index);
			browser.click();
		}
	}
	setValue(value) {
		if (this.index === undefined) {
			$(this.selector);
			browser.sendKeys(value);
		} else {
			$$(this.selector);
			browser.sendKeys(value, this.index);
		}
	}
	keys(value) {
		browser.keys(value);
	}
	waitForVisible(timeout = 60000, expected = true) {
		$(this.selector, timeout);
		browser.isVisble(timeout, expected);
	}
	getText(expected) {
		$(this.selector);
		browser.getText();
	}
	getAttribute(attribute, expected) {
	}
	waitForExist(timeout, expected) {
		$(this.selector, timeout);
	}
	waitAndClick(timeout) {
		$(this.selector, timeout);
		browser.click();
	}
	validateElementsState(state, expectedTrueOrFalse) {
	}
	validateElementsString(exactOrContain, textToCompare) {
	}
	validateElementsInputValue(valueToCompare, equalOrLessOrGreater) {
	}
	validateElementsNumberValue(valueToCompare, equalOrLessOrGreater) {
	}
}

exports.Element = Element;
