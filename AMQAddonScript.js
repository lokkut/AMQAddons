
// afk stuff
afkKicker._AFK_TIMEOUT_TIME = 300 * 60 * 1000; // 5 hours : )
afkKicker._HOST_AFK_TIMEOUT_TIME = 300 * 60 * 1000; // 5 hours : ) 


// GameChat stuff
let _OldStuff = {};

_OldStuff.GameChat = GameChat;
GameChat = function () {
	_OldStuff.GameChat.call(this);
	this.$historyView = $("#gcHistoryContent");
	this.$historyButton = $("#gcHistoryButton");
	this.$historyContainer = $("#gcHistoryContainer");

	this._TABS = {
		CHAT: 1,
		SPECTATORS: 2,
		QUEUE: 3,
		HISTORY: 4
	};

	this.correctAnswerTemplate = $("#gcCorrectAnswerTemplate").html();
	this.incorrectAnswerTemplate = $("#gcIncorrectAnswerTemplate").html();

	this.$historyContainer.html("");
}

GameChat.prototype = _OldStuff.GameChat.prototype;

GameChat.prototype.convertTypeToText = function (type, typeNumber) {
	switch (type) {
		case 1: return "op" + typeNumber;
		case 2: return "ed" + typeNumber;
		case 3: return "ins";
	}
};


GameChat.prototype.addHistory = function (currentcount, totalcount, animeNames, songName, artist, type, typeNumber, weRight, allResults) {
	if (!CurrentGameHistory) { return; }
	let atBottom = this.$historyContainer.scrollTop() + this.$historyContainer.innerHeight() >= this.$historyContainer[0].scrollHeight - 10;

	CurrentGameHistory.addRow({
		index: currentcount,
		type: this.convertTypeToText(type, typeNumber),
		romaji: animeNames.romaji,
		english: animeNames.english,
		song_name: songName,
		artist: artist,
		correct: weRight,
		results: allResults,
		answers: HistoryAnswers
	}).then((function (row) {

		if (atBottom) {
			this.$historyContainer.scrollTop(this.$historyContainer.prop("scrollHeight"));
		}
		this.$SCROLLABLE_CONTAINERS.perfectScrollbar('update')
	}).bind(this)).then((function () {
		
		if( this.$historyButton.hasClass('selected') ) {
			CurrentGameHistory.redraw(); 
		}
	}).bind(this));
};

GameChat.prototype.viewHistory = function () {
	this.resetView();

	this.$historyView.removeClass("hidden");
	this.$historyButton.addClass('selected');
	this.$SCROLLABLE_CONTAINERS.perfectScrollbar('update');
	this.$historyContainer.scrollTop(this.$historyContainer.prop("scrollHeight"));
	this.currentTab = this._TABS.HISTORY;

	HistoryTables.forEach(function(a){a.redraw();})
};

_OldStuff.resetView = GameChat.prototype.resetView;
GameChat.prototype.resetView = function () {
	_OldStuff.resetView.call(this);
	this.$historyView.addClass("hidden");
	this.$historyButton.removeClass('selected');
};

gameChat = new GameChat();

// QuizInfoContainer stuff

function GetAnimeNameHtml(animeNames) {
	let animeName;

	if (options.showBothNames) {
		animeName = '<span class="Japanese">' + animeNames.romaji + '</span><br><span class="English">' + animeNames.english + "</span>";
		if (animeNames.romaji == animeNames.english) {
			animeName = animeNames.romaji;
		}
	} else {
		animeName = options.useRomajiNames === 1 ? animeNames.romaji : animeNames.english;
	}

	return animeName;
}

// _OldStuff.showInfo = QuizInfoContainer.prototype.showInfo;
QuizInfoContainer.prototype.showInfo = function (animeNames, songName, artist, type, typeNumber, urls) {

	let animeName = GetAnimeNameHtml(animeNames);

	this.$name.html(animeName);
	fitTextToContainer(this.$name, this.$nameContainer, 25, 11);
	this.$songName.text(songName);
	this.$songArtist.text(artist);
	this.$songType.text(this.convertTypeToText(type, typeNumber));

	this.$songVideoLink.attr('href', urls[quizVideoController.getCurrentHost()][quizVideoController.getCurrentResolution()]);
	this.showContent();
};


QuizInfoContainer.prototype.setCurrentSongCount = function (count) {
	this.$currentSongCount.text(count);
	this.currentSongCount = count;
};

QuizInfoContainer.prototype.setTotalSongCount = function (count) {
	this.$totalSongCount.text(count);
	this.totalSongCount = count;
};


// Quiz stuff
let _OldQuiz = Quiz;

Quiz = function () {
	_OldQuiz.call(this);

	this.QUIZ_STATES = {
		LOADING: 0,
		WAITING_FOR_READY: 1,
		GUESS_PHASE: 3,
		ANSWER_PHASE: 4,
		SHOW_ANSWER_PHASE: 5,
		END_PHASE: 6,
		WAITING_BUFFERING: 7,
		WAITING_ANSWERS_PHASE: 8
	};

	/*let OldQuizOver = this._quizOverListner.callback;
	this._quizOverListner.callback = function (roomSettings) {
		OldQuizOver.call(this, roomSettings);
		
	}.bind(this);*/

	this.totalSongCount = '?';
	this.currentSongCount = '?';

	let _OldResultListener = this._resultListner.callback;
	this._resultListner.callback = function (result) {
		_OldResultListener.call(this, result);
		let weRight = false;
		result.players.forEach((playerResult) => {
			let player = this.players[playerResult.roomSlot];
			if (player) {
				if (player.isSelf() && playerResult.correct) {
					weRight = true;
				}
			}
		});
		let songInfo = result.songInfo;
		gameChat.addHistory(this.infoContainer.currentSongCount, this.infoContainer.totalSongCount, songInfo.animeNames, songInfo.songName, songInfo.artist, songInfo.type, songInfo.typeNumber, weRight, result);
	}.bind(this);

	this.setup();
}

Quiz.prototype = _OldQuiz.prototype;
_OldStuff.SendAnswer = Quiz.prototype.sendAnswer;
Quiz.prototype.sendAnswer = function (showState) {
	if (!this.inQuiz) { return; }
	return _OldStuff.SendAnswer.call(this, showState);
};

var quiz = new Quiz();



function LogSocket() {
	socket._socket.on("command", function(payload) {
		console.log( payload.command );
	});
}

let AddOnListeners = {};

function SetBackgroundImage( j, i ) {
	j = $(j);
	if( j.length ) {
		j[0].style.backgroundImage = i;
		if( i.length ) {
			j[0].style.backgroundStyle = 'cover';
			j[0].style.backgroundPosition = 'center';
		} else {
			j[0].style.backgroundStyle = '';
			j[0].style.backgroundPosition = '';
		}
	}
}

	function addSettings() {
		console.log("test");
		let tabs = $('#settingModal > .modal-dialog > .modal-content > .tabContainer')[0];
		let modalBody = $('#settingModal > .modal-dialog > .modal-content > .modal-body')[0];
		let addOnSettings = document.createElement("div");
		addOnSettings.className = "tab leftRightButtonTop clickAble";
		addOnSettings.onclick = function () {
			options.selectTab('settingsAmqAddon', this);
		};
		addOnSettings.innerHTML = "<h5>Add-on</h5>";
		tabs.appendChild(addOnSettings);

		var addOnSettingsModalBody = createSettings();
		addOnSettingsModalBody.id = "settingsAmqAddon";
		addOnSettingsModalBody.className = "settingContentContainer hide";
		modalBody.appendChild(addOnSettingsModalBody);

		options.$SETTING_TABS.push(addOnSettings);
		options.$SETTING_CONTAINERS.push(addOnSettingsModalBody);

	}


	let customOptions = [{ id: "showBoth", popupText: "Shows both the romanji and english name if availible", labelText: "Show both names", type: "tickbox" }, 
	{ id: "autoReadySettings", popupText: "Auto Readys when lobby settings change", labelText: "Auto-Ready on setting change", type: "tickbox" }];

	function createSettings() {
		var settings = document.createElement("div");
		var row = document.createElement("div");
		settings.appendChild(row);
		row.className = "row";
		var currentRow = row;
		var length = 0;
		for (var i = 0; i < customOptions.length; i++) {
			var setting = customOptions[i];
			if (length == 12) {
				settings.appendChild(row);
				currentRow = document.createElement("div");
				currentRow.className = "row";
				length = 0;
			} else {
				length += setting.divSize;
			}
			var newElement;
			if (setting.type === "tickbox") {
				newElement = createTickBox(setting.id, setting.popupText, setting.labelText, setting.settingsMethod);
			}
			currentRow.appendChild(newElement.element);
			length += newElement.size;
		}
		return settings;
	}

	function createTickBox(id, popupText, labelText, settingsMethod) {
		var tickObj = { element: null, size: 4, type: "tickbox" };

		var element = document.createElement("div");
		element.className = "col-xs-4 text-center";
		element.id = "show" + id;

		var label = `<div><label data-toggle="popover"
		data-content="`+ popupText + `"
		data-trigger="hover" data-html="true" data-placement="top" data-container="#settingModal"
		data-original-title="" title="">`+ labelText + `</label></div>`;

		var tickbox = `<div class="customCheckbox">
		<input type="checkbox" id="sm` + id + `" onclick="toggleSetting(`+ id + `)">
		<label for="sm` + id + `">✔</label>
		</div>`

		element.innerHTML += label + tickbox;
		tickObj.element = element;
		return tickObj;
	}

	addSettings();

	toggleBothNames = function () {
		if (options.showBothNames) {
			options.showBothNames = !options.showBothNames;
		} else {
			options.showBothNames = true;
		}
		SetOption("BothNames", options.showBothNames);
	}

