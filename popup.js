function ToggleList()
{
    chrome.runtime.sendMessage(null, { topic: "ToggleList" });
}

function MakeMessage(Topic, Data) {
    return { Topic: Topic, Data: Data };
}

function SendMessage(Topic, Data, Callback) {
    chrome.runtime.sendMessage( MakeMessage(Topic, Data), function (result) {
        if( Callback ) {
            Callback(result);
        }
    });
}

function GetOption(Key, Callback) {
    SendMessage("GetOption", Key, Callback);
}

function SetOption(Key, Value) {
    SendMessage("SetOption", { Key: Key, Value: Value });
}

var AcronymTable = new Tabulator("#AcronymTable", {
    height:"300px",
    columns:[
        {title:"Acronym", field:"name", width:120, editor:"input"},
        {title:"Name", field:"full_name", width:200, editor:"input"},
        {formatter:"buttonCross", width:40, align:"center", cellClick:function(e, cell){
            cell.getRow().delete();
        }}
    ],
});

function UpdateAcronyms()
{
    chrome.runtime.sendMessage( MakeMessage( "GetAcronyms" ), function(result)
    {   
        if(!result){return;}

        AcronymTable.setData( result );
    });
}

function SetAcronyms()
{
    chrome.runtime.sendMessage( MakeMessage( "SetAcronyms", AcronymTable.getData() ) );
}

UpdateAcronyms();

function NewAcronym()
{
    AcronymTable.addData([{name:"Short",full_name:"Full Name"}]);
}

function ResetBackground()
{
    SetOption( 'BackgroundPath', null );
    chrome.runtime.sendMessage( MakeMessage( "SetBackground" ) );  
}

function ChooseBackground()
{         
    let Path = $('#BackgroundPathInput').val();
    if( Path.length == 0 ) { return; }
    SetOption( 'BackgroundPath', Path );
    chrome.runtime.sendMessage( MakeMessage( "SetBackground" ) );  
}
       

$("#SaveAcronymButton").on('click', SetAcronyms );
$("#NewAcronymButton").on('click', NewAcronym );
$("#CustomBackgroundButton").on('click', ChooseBackground );
$("#ResetBackgroundButton").on('click', ResetBackground );

window.onbeforeunload = function(){
    SetAcronyms();
}