
let GameCount = 0;
let HistoryAnswers;

var CurrentGameHistory;
var HistoryTables = [];

let NewHistoryTable = function (players) {
	GameCount++;
	let HistoryId = "aaHistoryTable" + GameCount;
	let SongNameHover = $("#aaHistoryFloatSongName");
	let AnimeNameHover = $("#aaHistoryFloatAnimeName");
	let SongNameHoverInner = $("#aaHistoryFloatSongNameInner");
	let AnimeNameHoverInner = $("#aaHistoryFloatAnimeNameInner");
	let ResultsHover = $("#aaHistoryFloater")[0];
	let ResultsListHover = $("#aaHistoryFloatContainer");
	let Players = Object.assign({}, players);
	let HistoryContainer = $("#gcHistoryContainer");
	let atBottom = HistoryContainer.scrollTop() + HistoryContainer.innerHeight() >= HistoryContainer.scrollHeight - 10;

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

			let newrows = {};

			if (!data.answers) {
				return;
			}

			SongNameHoverInner.text(data.song_name + " - " + data.artist);
			AnimeNameHoverInner.html(GetAnimeNameHtml({ romaji: data.romaji, english: data.english }));
			fitTextToContainer(SongNameHoverInner, SongNameHover, 15, 11);
			fitTextToContainer(AnimeNameHoverInner, AnimeNameHover, 15, 11);


			data.answers.answers.forEach((answer) => {
				let player = Players[answer.roomSlot];
				if (player) {
					newrows[player.name] = { answer: answer.answer };

				}
			});

			data.results.players.forEach((playerResult) => {
				let player = Players[playerResult.roomSlot];
				if (player && newrows[player.name]) {
					newrows[player.name].correct = playerResult.correct;
					newrows[player.name].inMal = playerResult.inMal;
				}
			});

			for (let i in newrows) {
				let answer = newrows[i];
				let li = document.createElement("li");
				li.className = answer.correct ? 'CorrectAnswer' : 'IncorrectAnswer';
				let textAnswer = '...';
				if (answer.answer) {
					textAnswer = answer.answer;
				}
				let userhtml = '';
				if( answer.inMal ) {
					userhtml = '<div class="InMal"></div>';
				}
				li.innerHTML = userhtml + '<div>' + i + "</div><div class=\"historyanswer\">" + textAnswer + "</div>";
				ResultsListHover.append(li);
			}
			let rect2 = ResultsListHover[0].getBoundingClientRect();
			if (rect2.bottom > window.innerHeight - 100) {
				ResultsHover.style.top = (rect.top - (rect2.bottom - window.innerHeight + 100)) + "px";
			}
		},
		rowMouseOut: function (e, row) {
			//e - the event object
			//row - row component
			ResultsHover.style.visibility = "hidden";
		},
		tableBuilt: function () {
			if (atBottom) {
				HistoryContainer.scrollTop(HistoryContainer.prop("scrollHeight"));
			}
			if( CurrentGameHistory ) {
				CurrentGameHistory.redraw();
			}
		}
	});
	HistoryTables.push(CurrentGameHistory);
};

let HistorySpectateGameListener = new Listener("Spectate Game", function(payload) {
	let Players = {};
	if( payload ) {
		for( let i in payload.quizState.players ) {
			Players[Number(payload.quizState.players[i].roomSlot)] = { name : payload.quizState.players[i].name };
		}
		NewHistoryTable( Players );
	}
});
let HistoryQuizStartListener = new Listener("quiz ready", function()
{
	NewHistoryTable( lobby.players );
} );

let HistoryQuizAnswerListener = new Listener("player answers", function (data) {
	HistoryAnswers = data;
});

function FakeHistory() {
	HistoryQuizStartListener.callback();
	for (let i = 1; i <= 30; i++) {
		CurrentGameHistory.addRow({ index: i, type: 'fake' });
	}
}
