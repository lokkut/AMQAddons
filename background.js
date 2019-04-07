
var MessageHandlers = {};

var Listener = function( message, sender, sendresult )
{
    var Handler = MessageHandlers[message.Topic];
    if( Handler )
        {
        return Handler( message.Data, sendresult );
        }
}
chrome.runtime.onMessageExternal.addListener( Listener );
chrome.runtime.onMessage.addListener( Listener );

MessageHandlers.GetAcronyms = function( data, SendResult )
{   
    chrome.storage.sync.get(['AcronymList'],function(result)
    {
        if( !result.AcronymList )
            {
            SendResult( [] );
            }
        else  
            {
            SendResult( JSON.parse( result.AcronymList ) );
            }
    });
    return true;
}

MessageHandlers.SetAcronyms = function( data, SendResult )
{   

    let n = JSON.stringify(data);
    chrome.storage.sync.set({AcronymList: n},function()
    {
        // ? 
    });
}

var Options = {};

MessageHandlers.SetOption = function(data, SendResult )
{   
    Options[data.key] = data.value;
    let n = JSON.stringify(Options);
    chrome.storage.sync.set({Options: Options},function()
    {
        // ? 
    });
}

MessageHandlers.GetOption = function(data, SendResult )
{
    let key = data;
    chrome.storage.sync.get(['Options'],function(result)
    {
        if( !result.Options )
            {
            SendResult( null );
            }
        else  
            {
            SendResult( JSON.parse( result.Options )[key] );
            }
    });
    return true;
}

// load options to start
chrome.storage.sync.get(['Options'],function(result)
{
    Options = JSON.parse( result.Options );
    if( !Options )
        {
        Options = {};
        }
});