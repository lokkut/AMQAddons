let customOptions = [{ id: "showBoth", popupText: "Shows both the romanji and english name if availible", labelText: "Show both names", type: "tickbox" }, 
{ id: "AutoReadySettings", popupText: "Auto Readys when lobby settings change", labelText: "Auto-Ready on setting change", type: "tickbox" }];

function DoAutoReady() {
	if (options.AutoReady && !lobby.isHost()) {
		lobby.fireMainButtonEvent();
	}
}

var QuizOverListener = new Listener("quiz over", DoAutoReady);
var RoomSettingListener = new Listener("Room Settings Changed", function () {
	if (options.AutoReadySettings) {
		DoAutoReady();
	}
});

$("#aaSetDefaultButton").on('click', () => {
	let Settings = hostModal.getSettings();
	if( Settings ) {
		SetOption( "DefaultSettings", Settings );
	}
});

GetOption("DefaultSettings", function (result) {
	if (result) {
		hostModal.DEFUALT_SETTINGS = result;
	}
});

$("#smAutoReady").on('click', () => {
    options.AutoReady = !options.AutoReady;
	SetOption("AutoReady", options.AutoReady);
});

function DefaultCheckBox(SettingName, CheckBoxId, OptionsName) {
	if (!OptionsName) {
		OptionsName = SettingName;
	}
	GetOption(SettingName, function (result) {
		if (result) {
			options[OptionsName] = true;
			$(CheckBoxId).prop('checked', true);
		}
	});
}

function ReloadBackground() {
	GetOption("BackgroundPath", function(result) {
		let val = '';
		if( result ) {
			val = 'url(' + result + ')';			
		} 
		SetBackgroundImage( '#gameContainer', val );
		SetBackgroundImage( '#startPage', val );
		SetBackgroundImage( '#gameChatPage > .col-xs-9', val );
		SetBackgroundImage( '#loadingScreen', val );
		SetBackgroundImage( '#awMainView', val );
	});
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
			newElement = createTickBox(setting.id, setting.popupText, setting.labelText);
		}
		currentRow.appendChild(newElement.element);
		length += newElement.size;
	}
	return settings;
}

function toggleSetting(setting) {
    let val = !options[setting];
    options[setting] = val;
    SetOption( setting, val );
}

function createTickBox(id, popupText, labelText) {
	var tickObj = { element: null, size: 4, type: "tickbox" };

	var element = document.createElement("div");
	element.className = "col-xs-4 text-center";
	element.id = "show" + id;

	var label = `<div><label data-toggle="popover"
	data-content="`+ popupText + `"
	data-trigger="hover" data-html="true" data-placement="top" data-container="#settingModal"
	data-original-title="" title="">`+ labelText + `</label></div>`;

	var tickbox = `<div class="customCheckbox">
	<input type="checkbox" id="sm` + id + `" onclick="toggleSetting('`+ id + `')">
	<label for="sm` + id + `">✔</label>
	</div>`

	element.innerHTML += label + tickbox;
    tickObj.element = element;
    DefaultCheckBox( id, '#sm' + id );
	return tickObj;
}
