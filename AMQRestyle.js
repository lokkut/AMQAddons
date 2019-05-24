Lobby.prototype.setAvatarHeight = function () {
    //	$('.lobbyAvatarImgContainer').width($('.lobbyAvatarImgContainer').height());
    };

let oldSetupAvatars = Lobby.prototype.setupAvatars;
Lobby.prototype.setupAvatars = function() {
    oldSetupAvatars.call(this);
    $('.lobbyAvatarContainer').appendTo( $('.row.lobbyAvatarRow')[0] );
}

function fitTextToContainerVH($text, $container, baseFontSize, minimumSize) {
	$text.addClass("invisible");
	$text.removeClass('oversize');
	let fontSize = baseFontSize;
	$text.css('font-size', fontSize+'vh');
	while ($text.height() > $container.height() && fontSize > 2) {
		fontSize -= 0.2;

		if (minimumSize > fontSize) {
			$text.addClass('oversize');
			break;
		}

		$text.css('font-size', fontSize+'vh');
	}
	$text.removeClass("invisible");
}

QuizInfoContainer.prototype.fitAnimeNameToContainer = function()
{
	fitTextToContainerVH(this.$name, this.$nameContainer, 5, 2.4);
}

XpBar.prototype.setXpPercent = function (newXpP) {
    this._xpPercent = newXpP;
    this.$xpHider.css("transform", "translateX(" + 240 * newXpP + "px)");
}

$(function(){
    // $("#qpCounter").text('');
    $('<br>').insertAfter('#qpCurrentSongCount');
    $('#qpAnimeNameHider').text('');
    $('#currencyContainer').insertAfter('#chatContainer');
    $('#xpBarCoverInner').remove();
    $('#xpBarCoverOuter').remove();
});

let oldHideAnswer = GamePlayer.prototype.hideAnswer;
GamePlayer.prototype.hideAnswer = function() {
    oldHideAnswer.call(this);
    this.$answerContainerText.text('...');
};

let oldFitAvatars = Quiz.prototype.fitAvatarsToScreen;
Quiz.prototype.fitAvatarsToScreen = function(){}

let newAvatarTemplate = `<div id="qpAvatar-{0}" class="qpAvatarContainer">
    <div class="qpAvatarCenterContainer">
        <div class="qpAvatarAnswerContainer hide">
            <div class="qpAvatarExtraInfoContainer">
                <div class="qpAvatarAnswerNumber hide">
                    <div class="unknownResult">
                        <h2>
                            5
                        </h2>
                    </div>
                    <div class="knownResult">
                        <h2>
                            5
                        </h2>
                    </div>
                </div>
                <div class="qpAvatarStatus hide">
                    <div class="qpAvatarListBar"></div>
                    <h4 class="qpAvatarListStatus"></h4>
                    <h4 class="qpAvatarShowScore"></h4>
                </div>
                <div class="qpAvatarInMal hide">
                    <!--img src='./img/ui/mal_watched_icon.png'></img-->
                </div>
            </div>
            <div class="qpAvatarAnswer">
                <div class="qpAvatarAnswerText">

                </div>
            </div>
        </div>
        <div class="qpAvatarInfoContainer">
            <div class="qpAvatarNameContainer">
                <div id="qpAvatarNameDiagonalThing1" class="diagonalthing"></div>
                <div id="qpAvatarNameDiagonalThing2" class="diagonalthing"></div>
                <div id="qpAvatarNameDiagonalThing3" class="diagonalthing"></div>
                <div class="qpAvatarLevelText">
                    {1}
                </div>
                <div class="qpAvatarPointText">
                    {2}
                </div>
                <p>{0}</p>
                <div class="avatarIsHostContainerOuter">
                    <div class="avatarIsHostContainer hide">
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`;

let oldSetupPlayerAvatar = GamePlayer.prototype.setupQuizAvatar;
GamePlayer.prototype.setupQuizAvatar = function () {
	let imageVh = this.avatar.avatar === 'Miyu' ? 20 : 15;
    $('#qpAvatarRow').append(format(newAvatarTemplate, this.name, this.level, 0, imageVh));

    this.$quizAvatar = $('#qpAvatar-' + this.name);
	this.$activeAvatar = this.$quizAvatar;
	this.$answerContainerText = this.$quizAvatar.find('.qpAvatarAnswerText');
	this.$answerContainerText.popover({
		trigger: 'hover',
		placement: 'top',
		content: '...',
		container: "#qpAvatarRow"
	});
    this.$answerContainer = this.$quizAvatar.find('.qpAvatarAnswerContainer');
    this.$statusContainer = this.$quizAvatar.find('.qpAvatarStatus');
    this.$inMal = this.$quizAvatar.find('.qpAvatarInMal');
    this.$listBar = this.$statusContainer.find('.qpAvatarListBar');
    this.$statusText = this.$statusContainer.find('.qpAvatarListStatus');
	this.$scoreText = this.$statusContainer.find('.qpAvatarShowScore');
	this.$scoreContainer = this.$quizAvatar.find('.qpAvatarPointText');
	this.$levelContainer = this.$quizAvatar.find('.qpAvatarLevelText');

	this.answerNumberController = new AnswerNumberController(this.$answerContainer);

	this.updateLobbyAvatarIsHost();
};

let oldUpdateQuizAvatarPose = GamePlayer.prototype.updateQuizAvatarPose;
GamePlayer.prototype.updateQuizAvatarPose = function () {};

GamePlayer.prototype.runParticleAnimation = function (xpPercent, level, credits) {
    xpBar.xpGain(xpPercent, level);
    xpBar.setCredits(credits);
};