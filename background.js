
var MessageHandlers = {};

var Listener = function( message, sender, sendresult ) {
    var Handler = MessageHandlers[message.Topic];
    if( Handler ) {
        let Res = Handler( message.Data, sendresult );
        if( !Res ) {
            sendresult();        
        } else {
            return true;
        }
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

MessageHandlers.SetOption = function(data, SendResult )
{   
    let key = data.Key;
    let val = data.Value;
    let option = {};
    option[key] = val;
    chrome.storage.sync.set(option,function()
    {
        // ? 
    });
}

MessageHandlers.GetOption = function(data, SendResult )
{
    let key = data;
    chrome.storage.sync.get([key],function(result)
    {
        if( !result[key] )
            {
            SendResult( null );
            }
        else  
            {
            SendResult( result[key] );
            }
    });
    return true;
}

let Ports = [];

MessageHandlers.SetBackground = function(data, n) {
    for( let i in Ports ) {
        Ports[i].postMessage( { Topic: 'ReloadBackground' } );
    }
}

function DisconnectExternal( port ) {
    for( let i in Ports ) {
        if( Ports[i] == port ) {
            Ports.splice( i, 1 );
        }
    }
}

function ConnectExternal( port ) {
    port.onDisconnect.addListener(DisconnectExternal);
    Ports.push(port);
}

chrome.runtime.onConnectExternal.addListener( ConnectExternal );