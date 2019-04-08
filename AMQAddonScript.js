// amq is magic
if (typeof afkKicker !== 'undefined') {
	function MakeMessage( Topic, Data )
	{
		return { Topic: Topic, Data: Data };
	}

	function SendMessage(Topic, Data, Callback) {
		chrome.runtime.sendMessage(ExtensionId, MakeMessage(Topic, Data), function (result) {
			if (!result) { return; }
			Callback(result);
		});
	}

	function GetOption(Key, Callback) {
		SendMessage("GetOption", Key, Callback);
	}

	function SetOption(Key, Value) {
		SendMessage("SetOption", { Key: Key, Value: Value });
	}



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

	let GameCount = 0;
	let CurrentGameHistory;
	let HistoryAnswers;

	let HistoryQuizStartListener = new Listener("quiz ready", function () {
		GameCount++;
		let HistoryId = "aaHistoryTable" + GameCount;
		let SongNameHover = $("#aaHistoryFloatSongName");
		let ResultsHover = $("#aaHistoryFloater")[0];
		let ResultsListHover = $("#aaHistoryFloatContainer");
		let Players = Object.assign({}, lobby.players);

		$("#gcHistoryContainer").append(`<div id="` + HistoryId + `"></div>`);
		CurrentGameHistory = new Tabulator("#" + HistoryId, {
			layout: "fitColumns",
			resizableColumns: false,
			columnMinWidth: 0,
			columns: [
				{ title: "", field: "index", width: 30, headerSort: false },
				{ title: "Type", field: "type", width: 45, headerSort: false },
				{ title: "Romaji", field: "romaji", widthGrow: 1, tooltips: true, headerSort: false },
				{ title: "English", field: "english", widthGrow: 1, tooltips: true, headerSort: false },
				{ title: "Song Name", field: "song_name", widthGrow: 1, tooltips: true, headerSort: false },
				{ title: "Artist", field: "artist", widthGrow: 1, tooltips: true, headerSort: false },
			],
			rowFormatter: function (row) {
				let data = row.getData(); //get data object for row

				if (data.romaji == data.english) {
					let Cells = row.getCells();
					let Cell3 = Cells[2].getElement(); // woops
					let Cell4 = Cells[3].getElement();
					let Cell3W = Cell3.style.width;
					let Cell4W = Cell4.style.width;
					Cell4.style.padding = "0px";
					let n = Number(Cell3W.substring(0, Cell3W.length - 2)) + Number(Cell4W.substring(0, Cell4W.length - 2));
					Cell3.style.width = (n - 1) + "px";
					Cell4.style.width = "0px";
				}

				let RowDiv = row.getElement(); //apply css change to row element
				RowDiv.style['background-color'] = data.correct ? "#114408" : "#440000";
				RowDiv.style.color = "#d9d9d9";
			},
			tooltips: function (cell) {
				return cell.getValue();
			},
			rowMouseOver: function (e, row) {
				//e - the event object
				//row - row component
				let rect = row.getElement().getBoundingClientRect();
				ResultsHover.style.top = rect.top + "px";
				ResultsHover.style.visibility = "visible";

				ResultsListHover.children('li').remove();

				let data = row.getData();

				SongNameHover.text(data.song_name + " - " + data.artist);

				let newrows = {};

				data.answers.answers.forEach((answer) => {
					let player = Players[answer.roomSlot];
					if (player) {
						newrows[player.name] = { answer: answer.answer };

					}
				});

				data.results.players.forEach((playerResult) => {
					let player = Players[playerResult.roomSlot];
					if (player) {
						newrows[player.name].correct = playerResult.correct;
					}
				});

				for (let i in newrows) {
					let answer = newrows[i];
					let li = document.createElement("li");
					li.className = answer.correct ? 'CorrectAnswer' : 'IncorrectAnswer';
					li.innerHTML = "<div>" + i + "</div><div class=\"historyanswer\">" + answer.answer + "</div>";
					ResultsListHover.append(li);
				}
			},
			rowMouseOut: function (e, row) {
				//e - the event object
				//row - row component
				ResultsHover.style.visibility = "hidden";
			},
		});
	});

	let HistoryQuizAnswerListener = new Listener("player answers", function (data) {
		HistoryAnswers = data;
	});

	HistoryQuizStartListener.bindListener();
	HistoryQuizAnswerListener.bindListener();

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
		}).bind(this));
	};

	GameChat.prototype.viewHistory = function () {
		this.resetView();

		this.$historyView.removeClass("hidden");
		this.$historyButton.addClass('selected');
		this.$SCROLLABLE_CONTAINERS.perfectScrollbar('update');
		this.$historyContainer.scrollTop(this.$historyContainer.prop("scrollHeight"));
		this.currentTab = this._TABS.HISTORY;
	};

	_OldStuff.resetView = GameChat.prototype.resetView;
	GameChat.prototype.resetView = function () {
		_OldStuff.resetView.call(this);
		this.$historyView.addClass("hidden");
		this.$historyButton.removeClass('selected');
	};

	gameChat = new GameChat();

	// QuizInfoContainer stuff

	// _OldStuff.showInfo = QuizInfoContainer.prototype.showInfo;
	QuizInfoContainer.prototype.showInfo = function (animeNames, songName, artist, type, typeNumber, urls) {

		let animeName

		if (options.showBothNames) {
			animeName = '<span class="Japanese">' + animeNames.romaji + '</span><br><span class="English">' + animeNames.english + "</span>";
			if (animeNames.romaji == animeNames.english) {
				animeName = animeNames.romaji;
			}
		} else {
			animeName = options.useRomajiNames === 1 ? animeNames.romaji : animeNames.english;
		}

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

		let OldQuizOver = this._quizOverListner.callback;
		this._quizOverListner.callback = function (roomSettings) {
			OldQuizOver.call(this, roomSettings);
			if (options.AutoReady && !lobby.isHost()) {
				lobby.fireMainButtonEvent();
			}
		}.bind(this);

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

$("#smAutoReady").on('click', () => {
    if( options.AutoReady ) {
        options.AutoReady = false;
    } else {
        options.AutoReady = true;
	}
	SetOption( "AutoReady", options.AutoReady );
});


	GetOption("AutoReady", function (result) {
		if (result) {
			options.AutoReady = true;
			$("#smAutoReady").prop('checked', true);
		}
	});

	GetOption("BothNames", function (result) {
		if (result) {
			options.AutoReady = true;
			$("#smShowBoth").prop('checked', true);
		}
	});


	// awesomeplete
	let CustomAwesomepleteAcronyms = {

	};



function UpdateAcronyms()
{
	chrome.runtime.sendMessage( ExtensionId, MakeMessage( "GetAcronyms" ), function(result)
	{
		if(!result){return;}

		for( let i in result )
			{
			CustomAwesomepleteAcronyms[result[i].name.toLowerCase()] = result[i].full_name;
			}
		});
	}

	var UpdateAcronymsListener = new Listener("play next song", function () {
		UpdateAcronyms();
	});

	UpdateAcronymsListener.bindListener();

	_OldStuff.AmqAwesomeplete = AmqAwesomeplete;
	_OldStuff.AwesomepleteEvaluate = AmqAwesomeplete.prototype.evaluate;

	AmqAwesomeplete = function (input, o, scrollable) {
		_OldStuff.AmqAwesomeplete.call(this, input, o, scrollable);
		let o_f = o.filter;
		o.filter = (text, input) => {
			return o_f(text, input) ||
				(this.acronym && RegExp(input.trim(), "i").test(this.acronym) && CustomAwesomepleteAcronyms[this.acronym] == text.label);
		};

		this.filter = o.filter;
	}

	AmqAwesomeplete.prototype = _OldStuff.AmqAwesomeplete.prototype;

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

		_OldStuff.AwesomepleteEvaluate.call(this);
	}



if (document.getElementById("settingModal")) {
	let optionsModal = document.getElementById("settingModal");
	let tabs = optionsModal.children[0].children[0].children[1];
	let modalBody = optionsModal.children[0].children[0].children[2];

	let addOnSettings = document.createElement("div");
	addOnSettings.className = "tab leftRightButtonTop clickAble";
	addOnSettings.onclick = function() {
		options.selectTab('settingsAmqAddon', this);
	};
	addOnSettings.innerHTML = "<h5>Add-on</h5>";

	tabs.appendChild(addOnSettings);

	let addOnSettingsModalBody = document.createElement("div");
	addOnSettingsModalBody.id = "settingsAmqAddon";
	addOnSettingsModalBody.className = "settingContentContainer hide";

		addOnSettingsModalBody.innerHTML = `<div class="row">
<div class="col-xs-4 text-center">
	<div>
		<label data-toggle="popover"
			data-content="Shows both the romanji and english name if availible"
			data-trigger="hover" data-html="true" data-placement="top" data-container="#settingModal"
			data-original-title="" title="">Show both names</label>
	</div>
	<div class="customCheckbox">
		<input type="checkbox" id="smShowBoth" onclick="toggleBothNames()">
		<label for="smShowBoth">✔</label>
	</div>
</div>
</div>`;

		modalBody.appendChild(addOnSettingsModalBody);

		options.$SETTING_TABS.push(addOnSettings);
		options.$SETTING_CONTAINERS.push(addOnSettingsModalBody);
	}

	toggleBothNames = function () {
		if (options.showBothNames) {
			options.showBothNames = !options.showBothNames;
		} else {
			options.showBothNames = true;
		}
		SetOption( "BothNames", options.showBothNames );
	}
}