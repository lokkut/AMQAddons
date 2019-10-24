// awesomeplete
let CustomAwesomepleteAcronyms = {

};

function UpdateAcronyms() {
	chrome.runtime.sendMessage(AMQAddonExtensionId, MakeMessage("GetAcronyms"), function (result) {
		if (!result) { return; }

		for (let i in result) {
			CustomAwesomepleteAcronyms[result[i].name.toLowerCase()] = result[i].full_name;
		}
	});
}

var UpdateAcronymsListener = new Listener("play next song", function () {
	UpdateAcronyms();
});

_OldAmqAwesomeplete = AmqAwesomeplete;
_OldAwesomepleteEvaluate = AmqAwesomeplete.prototype.evaluate;

AmqAwesomeplete = function (input, o, scrollable) {
	_OldAmqAwesomeplete.call(this, input, o, scrollable);
	let o_f = o.filter;
	o.filter = (text, input) => {
		return o_f(text, input) ||
			(this.acronym && RegExp(input.trim(), "i").test(this.acronym) && CustomAwesomepleteAcronyms[this.acronym] == text.label);
	};

	this.filter = o.filter;
}

AmqAwesomeplete.prototype = _OldAmqAwesomeplete.prototype;

AmqAwesomeplete.prototype.evaluate = function () {
	let Acronym = this.input.value.toLowerCase();
	if (CustomAwesomepleteAcronyms[Acronym]) {
		if (!this.currentSubList.includes(CustomAwesomepleteAcronyms[Acronym])) {
			this.currentSubList.unshift(CustomAwesomepleteAcronyms[Acronym]);
		}
		this.acronym = Acronym;
	}
	else {
		this.acronym = null;
	}

	//_OldAwesomepleteEvaluate.call(this);

	let me = this;
	let unescapedValue = this.input.value;
	let value = createAnimeSearchRegexQuery(unescapedValue);
	let inputList;

	if (this.currentQuery && new RegExp(this.currentQuery, 'i').test(unescapedValue) && this.currentSubList) {
		inputList = this.currentSubList;
	} else if (unescapedValue.length > 0) {
		let letterList = this.letterLists[unescapedValue[0].toLowerCase()];
		if (letterList) {
			inputList = letterList;
		} else {
			inputList = [];
		}
		this.currentSubList = inputList;
	} else {
		inputList = this._list;
		this.currentSubList = null;
	}

	this.currentQuery = value;

	if (value.length >= this.minChars && inputList.length > 0) {
		this.searchId++;
		let currentSearchId = this.searchId;
		$("#qpAnswerInputLoadingContainer").removeClass("hide");
		this.index = -1;
		// Populate list with options that match
		this.$ul.children('li').remove();

		let suggestions = [];
		let selectedItems = [];

		let handlePassedSuggestions = function (me) {
			if (this.sort !== false) {
				this.suggestions = this.suggestions.sort(this.sort);
			}
			this.currentSubList = selectedItems;
			this.suggestions = this.suggestions.slice(0, this.maxItems);

			for (let i = this.suggestions.length - 1; i >= 0; i--) {
				let text = this.suggestions[i];
				me.ul.insertBefore(me.item(text, value, i), me.ul.firstChild);
			}

			if (this.ul.children.length === 0) {

				this.status.textContent = "No results found";

				this.close({ reason: "nomatches" });

			} else {
				this.open();
				this.status.textContent = this.ul.children.length + " results found";
			}
			$("#qpAnswerInputLoadingContainer").addClass("hide");
		}.bind(this);

		let timeoutLoop = function (index, me, handlePassedSuggestions, currentSearchId) {
			if (currentSearchId !== this.searchId) {
				return;
			}

			if (index < inputList.length) {
				for (let i = index; i < inputList.length && i < index + 1000; i++) {
					let item = inputList[i];
					let suggestion = new Suggestion(me.data(item, value));
					if (me.filter(suggestion, value)) {
						selectedItems.push(item);
						suggestions.push(suggestion);
					}
				}
				setTimeout(function () {
					timeoutLoop(index + 1000, me, handlePassedSuggestions, currentSearchId);
				}.bind(this), 0);
			} else {
				this.suggestions = suggestions;
				handlePassedSuggestions(me);
			}
		}.bind(this);

		timeoutLoop(0, me, handlePassedSuggestions, currentSearchId);
	}
	else {
		this.close({ reason: "nomatches" });

		this.status.textContent = "No results found";
	}
}