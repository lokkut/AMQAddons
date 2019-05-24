
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

$(function() {
	AddOnListeners.ReloadBackground = ReloadBackground;

	DefaultCheckBox("AutoReady", "#smAutoReady");
	//DefaultCheckBox("BothNames", "#smShowBoth", "showBothNames");
	addSettings();
	ReloadBackground();

	RoomSettingListener.bindListener();
	// QuizOverListener.bindListener();
	let n = quiz._quizOverListner.callback;
	quiz._quizOverListner.callback = function(x,y) {
		n(x,y);
		DoAutoReady();
	}

	UpdateAcronymsListener.bindListener();

	HistorySpectateGameListener.bindListener();
	HistoryQuizStartListener.bindListener();
	HistoryQuizAnswerListener.bindListener();
	
	
});