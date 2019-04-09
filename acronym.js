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

	_OldAwesomepleteEvaluate.call(this);
}