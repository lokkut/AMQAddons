
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

	if (options.showBoth) {
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
QuizInfoContainer.prototype.fitAnimeNameToContainer = function()
{
	fitTextToContainer(this.$name, this.$nameContainer, 25, 11);
}

QuizInfoContainer.prototype.showInfo = function (animeNames, songName, artist, type, typeNumber, urls) {

	let animeName = GetAnimeNameHtml(animeNames);

	this.$name.html(animeName);
	this.fitAnimeNameToContainer();
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
_OldStuff.Quiz = Quiz;

class NewQuiz extends Quiz {
	constructor() {
		super()
		//_OldStuff.Quiz.call(this);

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
				let player = this.players[playerResult.gamePlayerId];
				if (player) {
					if (player.isSelf && playerResult.correct) {
						weRight = true;
					}
				}
			});
			let songInfo = result.songInfo;
			gameChat.addHistory(this.infoContainer.currentSongCount, this.infoContainer.totalSongCount, songInfo.animeNames, songInfo.songName, songInfo.artist, songInfo.type, songInfo.typeNumber, weRight, result);
		}.bind(this);

		this.setup();

		this.$inputContainer.off("click");
	}

	sendAnswer(showState) {
		if (!this.inQuiz) { return; }
		return super.sendAnswer(showState);
	};
}

// Quiz.prototype = _OldStuff.Quiz.prototype;
// _OldStuff.SendAnswer = Quiz.prototype.sendAnswer;
// Quiz.prototype.

quiz = new NewQuiz();



function LogSocket( ) {
	socket._socket.on("command", function(payload) {
		console.log( payload );
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


let AMQAddonPort = chrome.runtime.connect( AMQAddonExtensionId );
AMQAddonPort.onMessage.addListener(function(message, port) {
	let Handler = AddOnListeners[message.Topic];
	if( Handler ) {
		Handler( message.Data );
	}
});

function StartAddOn() {
	AddOnListeners.ReloadBackground = ReloadBackground;

	DefaultCheckBox("AutoReady", "#smAutoReady");
	//DefaultCheckBox("BothNames", "#smShowBoth", "showBothNames");
	addSettings();
	ReloadBackground();

    hostModal.$prepareButton = $('#mhPrepareButton');

    let changeSettings = false;
	let settingChanges = {};
    hostModal.$prepareButton.on('click', () => {
		hostModal.hide();
		let settings = hostModal.getSettings();
		if (!settings) {
			return;
		}
		
		let changed = false;
		for (let key in settings) {
			if (settings.hasOwnProperty(key)) {
				if (JSON.stringify(lobby.settings[key]) !== JSON.stringify(settings[key])) { //Use stringfy to compare multivalue fields
					settingChanges[key] = settings[key];
					changed = true;
				}
			}
		}

		if( changed ) {
			changeSettings = true;
		}
	});
	
	// QuizOverListener.bindListener();
	let n = quiz._quizOverListner.callback;
	quiz._quizOverListner.callback = function(x,y) {
		n(x,y);
		DoAutoReady();

		hostModal.$prepareButton.addClass("hidden");
		if( changeSettings ) {
			socket.sendCommand({
				type: "lobby",
				command: "change game settings",
				data: settingChanges
			});
			settingChanges = {};
			changeSettings = false;
		}		
	};

	Quiz.prototype.viewSettings = function () {
		hostModal.setModeGameSettings(lobby.isHost);
		hostModal.showSettings();
		hostModal.$changeButton.addClass("hidden");
		$("#mhHostModal").modal('show');		
	};

	(new Listener("quiz ready", function()
	{
		if( lobby.isHost ) {			
			hostModal.$prepareButton.removeClass("hidden");
		}
	})).bindListener();

	UpdateAcronymsListener.bindListener();

	HistorySpectateGameListener.bindListener();
	HistoryQuizStartListener.bindListener();
	HistoryQuizAnswerListener.bindListener();
	
	
}

$(StartAddOn);