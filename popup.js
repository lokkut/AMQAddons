function ToggleList()
{
    chrome.runtime.sendMessage(null, { topic: "ToggleList" });
}

function MakeMessage( Topic, Data )
{
    return { Topic: Topic, Data: Data };
}

var AcronymTable = new Tabulator("#AcronymTable", {
    height:"300px",
    columns:[
        {title:"Acronym", field:"name", width:120, editor:"input"},
        {title:"Name", field:"full_name", width:200, editor:"input"},
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

$("#SaveAcronymButton").on('click', SetAcronyms );
$("#NewAcronymButton").on('click', NewAcronym );

window.onbeforeunload = function(){
    SetAcronyms();
}