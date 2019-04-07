"use strict";

// add the history button and container
$(`<div id="gcHistoryButton" class="col-xs-4 text-center clickAble" onclick="gameChat.viewHistory();">
    <h5>
        History
    </h5>
</div>`).insertAfter( "#gcSpectateListButton" );

$(`<div id="gcHistoryContent" class="">
    <ul id="gcHistoryContainer" style="overflow-y:scroll;height:100%;" class="gcList">
    </ul>
    <div id="aaHistoryFloater" class="floatingContainer" style="visibility:hidden">
        <div id="aaHistoryFloatSongName" class="row">
            Song Name
        </div>
        <ul id="aaHistoryFloatContainer">
        </ul>
    </div>
</div>`).insertAfter( "#gcQueueListContent" );

let CssPath = chrome.runtime.getURL( "AMQAddonStyle.css" );
let TabulatorCssPath = chrome.runtime.getURL( "thirdParty/tabulator.css" );
$("head").append( `<!--AMQ Addons-->
<link rel="stylesheet" type="text/css" href="` + CssPath + `"></link>
<link rel="stylesheet" type="text/css" href="` + TabulatorCssPath + `"></link>` );

// add the new templates
$(`<script id="gcIncorrectAnswerTemplate" type="text/template">
    <li class="gcIncorrectAnswer">
        <span class="gcUserName">{0}</span>
        <span >{1}</span>
        <br>
    </li>
</script>
<script id="gcCorrectAnswerTemplate" type="text/template">
    <li class="gcCorrectAnswer">
        <span class="gcUserName">{0}</span>
        <span >{1}</span><br>
    </li>
</script>`).insertAfter("#gcPlayerMsgTemplate");

$(`<div id="customSettings" class="rightLeftButtonBottom">
    <p id="customSettingsP">
        Auto-Ready
    </p>
    <div class="customCheckbox" id="AutoReadyCheck">
        <input type="checkbox" id="smAutoReady">
        <label for="smAutoReady">✔</label>
    </div>
</div>`).insertAfter("#avatarUserImgContainer");

let Main = $("#mainContainer");
let ScriptPath = chrome.runtime.getURL("AMQAddonScript.js");
Main.append("<!--AMQ Addons-->");
let AMQScriptAddon = document.createElement( "script" );
AMQScriptAddon.type = "text/javascript";
AMQScriptAddon.src = ScriptPath;
Main.append( AMQScriptAddon );

let Head = $("Head");
let TabulatorScriptPath = chrome.runtime.getURL("thirdParty/tabulator.js");
let TabulatorScript = document.createElement( "script" );
TabulatorScript.type = "text/javascript";
TabulatorScript.src = TabulatorScriptPath;
Head.append( TabulatorScript );