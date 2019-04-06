// amq is magic
if( typeof afkKicker !== 'undefined' ){

// afk stuff
afkKicker._AFK_TIMEOUT_TIME = 300 * 60 * 1000; // 5 hours : )
afkKicker._HOST_AFK_TIMEOUT_TIME = 300 * 60 * 1000; // 5 hours : ) 

// GameChat stuff
let _OldStuff = {};

_OldStuff.GameChat = GameChat;
GameChat = function()
{
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

GameChat.prototype.addHistory = function (currentcount, totalcount, animeNames, songName, artist, type, typeNumber, weRight ) {
	let animeName = animeNames.romaji + " | " + animeNames.english;
	if( animeNames.romaji == animeNames.english )
	{
		animeName = animeNames.romaji;
	}
	this.insertHistory( "" + currentcount + "/" + totalcount, this.convertTypeToText(type, typeNumber) + " 「" + animeName + "」 [" + songName + "] - " + artist, weRight );
};

GameChat.prototype.GameOver = function () {
	this.insertHistory( "------------------------------", "", 2);
};

GameChat.prototype.insertHistory = function (count, msg, correct) {
	let formattype = this.serverMsgTemplate;
	if( correct == true )	{
		formattype = this.correctAnswerTemplate;
	}
	else if( correct == false ){
		formattype = this.incorrectAnswerTemplate;
	}
	let realmsg = format(formattype, count, msg);

	let atBottom = this.$historyContainer.scrollTop() + this.$historyContainer.innerHeight() >= this.$historyContainer[0].scrollHeight - 10;
	this.$historyContainer.append(realmsg);
	if (atBottom) {
		this.$historyContainer.scrollTop(this.$historyContainer.prop("scrollHeight"));
	}
	this.$SCROLLABLE_CONTAINERS.perfectScrollbar('update');
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
	let animeName = animeNames.romaji + " | " + animeNames.english;
	if( animeNames.romaji == animeNames.english )
	{
		animeName = animeNames.romaji;
	}

	this.$name.text(animeName);
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

Quiz = function()
{
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
    this._quizOverListner.callback = function(roomSettings)
    {
        OldQuizOver.call(this,roomSettings);
		if( options.AutoReady && !lobby.isHost() ){
			lobby.fireMainButtonEvent();
		}
		gameChat.GameOver();
    }.bind(this);

	this.totalSongCount = '?';
	this.currentSongCount = '?';
    
    let _OldResultListener = this._resultListner.callback; 
    this._resultListner.callback = function( result )
    {
        _OldResultListener.call( this, result );
        let weRight = false;
        result.players.forEach((playerResult) => {
			let player = this.players[playerResult.roomSlot];
			if (player) {
				if( player.isSelf() && playerResult.correct ){
					weRight = true;
				}
            }
        });
        let songInfo = result.songInfo;
        gameChat.addHistory( this.infoContainer.currentSongCount, this.infoContainer.totalSongCount, songInfo.animeNames, songInfo.songName, songInfo.artist, songInfo.type, songInfo.typeNumber, weRight );
    }.bind(this);

    this.setup();
}

Quiz.prototype = _OldQuiz.prototype;
_OldStuff.SendAnswer = Quiz.prototype.sendAnswer;
Quiz.prototype.sendAnswer = function (showState) {
    if( !this.inQuiz ) { return; }
    return _OldStuff.SendAnswer.call(this,showState);
};

var quiz = new Quiz();

$("#smAutoReady").on('click', () => {
    if( options.AutoReady ) {
        options.AutoReady = true;
    } else {
        options.AutoReady = false;
    }
});



// awesomeplete
let DefaultCustomAwesomepleteAcronyms = { ubw: 'Fate/stay night: Unlimited Blade Works' };

_OldStuff.AmqAwesomeplete = AmqAwesomeplete;
_OldStuff.AwesomepleteEvaluate = AmqAwesomeplete.prototype.evaluate;

AmqAwesomeplete = function( input, o, scrollable )
{
	_OldStuff.AmqAwesomeplete.call( this, input, o, scrollable );
	let o_f = o.filter;
	o.filter = ( text, input ) => 
	{
		return o_f(text, input) || 
			( this.acronym && RegExp(input.trim(), "i").test(this.acronym) && DefaultCustomAwesomepleteAcronyms[this.acronym] == text.label );
	};

	this.filter = o.filter;
}

AmqAwesomeplete.prototype = _OldStuff.AmqAwesomeplete.prototype;

AmqAwesomeplete.prototype.evaluate = function()
{
	if( DefaultCustomAwesomepleteAcronyms[this.input.value] )
		{
		if( !this.currentSubList.includes( DefaultCustomAwesomepleteAcronyms[this.input.value] ) )
			{
			this.currentSubList.unshift( DefaultCustomAwesomepleteAcronyms[this.input.value] );
			}
		this.acronym = this.input.value;
		}
	else	
		{
		this.acronym = null;
		}

	_OldStuff.AwesomepleteEvaluate.call( this );	
}

}