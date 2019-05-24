"use strict";

if( $("#gameContainer").length > 0 ) {

    /* Copy and pasting is bad */
    function MakeMessage(Topic, Data) {
        return { Topic: Topic, Data: Data };
    }
    
    function ChromeSendMessage( x, y )
    {
        chrome.runtime.sendMessage( chrome.runtime.id, x, y );
    }
    
    function SendMessage(Topic, Data, Callback) {
        ChromeSendMessage( MakeMessage( Topic, Data ), function (result) {
            if( Callback ) {
                Callback(result);
            }
        });
    }
    
    function GetOption(Key, Callback) {
        SendMessage("GetOption", Key, Callback);
    }
    

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
            <div id="aaAnimeNameHeader" class="diagonalheader"><h3>Anime Name</h3></div>
            <div id="aaHistoryFloatAnimeName" class="row">
                <span id="aaHistoryFloatAnimeNameInner">
                    Anime Name
                </span>
            </div>
            <div id="aaSongHeader" class="diagonalheader"><h3>Song Name</h3></div>
            <div id="aaHistoryFloatSongName" class="row">
                <span id="aaHistoryFloatSongNameInner">
                    Song Name
                </span>
            </div>
            <div id="aaGuessesHeader" class="diagonalheader"><h3>Guesses</h3></div>
            <ul id="aaHistoryFloatContainer">
            </ul>
        </div>
    </div>`).insertAfter( "#gcQueueListContent" );



    let CssPath = chrome.runtime.getURL( "AMQAddonStyle.css" );
    let TabulatorCssPath = chrome.runtime.getURL( "thirdParty/tabulator.css" );
    let AMQRestylePath = chrome.runtime.getURL( "AMQRestyle.css" );
    let CSSText = `<!--AMQ Addons-->
    <link rel="stylesheet" type="text/css" href="` + CssPath + `"></link>
    <link rel="stylesheet" type="text/css" href="` + TabulatorCssPath + `"></link>`;
    GetOption( "StyleChanger", function( Value ) {
        if( Value ) {
            CSSText += `<link rel="stylesheet" type="text/css" href="` + AMQRestylePath + `"></link>`;
        }        
        $("head").append( CSSText );
    });
    

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

    $('#mhHostSettingContainer > .modal-footer').prepend(`<button id="aaSetDefaultButton" type="button" class="btn btn-default">
        Set Default
    </button>`); 


    let Main = $("#mainContainer");
    Main.append("<!--AMQ Addons-->");
    Main.append(`<script type="text/javascript">var AMQAddonExtensionId = "` + chrome.runtime.id + `";</script>`);
    function InsertScript( Path )
    {
        let ScriptPath = chrome.runtime.getURL( Path );
        let Script = document.createElement( "script" );
        Script.type = "text/javascript";
        Script.src = ScriptPath;
        Main.append( Script );
    }

    InsertScript( "extComms.js" );
    InsertScript( "thirdParty/tabulator.js" );
    InsertScript( "settings.js" );
    InsertScript( "acronym.js" );
    InsertScript( "history.js" );
    InsertScript( "AMQAddonScript.js" );
    GetOption( "StyleChanger", function( Value ) {
        if( Value ) {
            InsertScript( "AMQRestyle.js" );
        }
    });
    
}