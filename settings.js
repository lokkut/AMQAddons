
function DoAutoReady() {
	if (options.AutoReady && !lobby.isHost()) {
		lobby.fireMainButtonEvent();
	}
}

let QuizOverListener = new Listener("quiz over", DoAutoReady);
let RoomSettingListener = new Listener("Room Settings Changed", function () {
	if (options.AutoReadyOnSettingChange) {
		DoAutoReady();
	}
});

RoomSettingListener.bindListener();
QuizOverListener.bindListener();


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
	if (options.AutoReady) {
		options.AutoReady = false;
	} else {
		options.AutoReady = true;
	}
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

DefaultCheckBox("AutoReady", "#smAutoReady");
DefaultCheckBox("BothNames", "#smShowBoth", "showBothNames");

toggleBothNames = function () {
	if (options.showBothNames) {
		options.showBothNames = !options.showBothNames;
	} else {
		options.showBothNames = true;
	}
	SetOption("BothNames", options.showBothNames);
}

function addSettings() {
	let tabs = $('#settingModal > .modal-dialog > .modal-content > .tabContainer')[0];
	let modalBody = $('#settingModal > .modal-dialog > .modal-content > .modal-body')[0];
	let addOnSettings = document.createElement("div");
	addOnSettings.className = "tab leftRightButtonTop clickAble";
	addOnSettings.onclick = function () {
		options.selectTab('settingsAmqAddon', this);
	};
	addOnSettings.innerHTML = "<h5>Add-on</h5>";
	tabs.appendChild(addOnSettings);
	let addOnSettingsModalBody = document.createElement("div");
	addOnSettingsModalBody.id = "settingsAmqAddon";
	addOnSettingsModalBody.className = "settingContentContainer hide";

	addOnSettingsModalBody.innerHTML = `
		<div> 
			<div class="row">
				<div class="col-xs-4 text-center" id="showBothDiv">
					<div>
						<label data-toggle="popover"
							data-content="Shows both the romanji and english name if availible"
							data-trigger="hover" data-html="true" data-placement="top" data-container="#settingModal"
							data-original-title="" title="">Show both names
						</label>
					</div>
					<div class="customCheckbox">
						<input type="checkbox" id="smShowBoth" onclick="toggleBothNames()">
						<label for="smShowBoth">✔</label>
					</div>
				</div>
				<div class="col-xs-4 text-center" id="newOption">
					<div> 
					
					</div>
				</div>
			</div> 
		</div>`;

	modalBody.appendChild(addOnSettingsModalBody);

	options.$SETTING_TABS.push(addOnSettings);
	options.$SETTING_CONTAINERS.push(addOnSettingsModalBody);

}

addSettings();

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


ReloadBackground();