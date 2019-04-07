
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