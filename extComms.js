function MakeMessage(Topic, Data) {
    return { Topic: Topic, Data: Data };
}

function ChromeSendMessage( x, y )
{
    chrome.runtime.sendMessage( AMQAddonExtensionId, x, y );
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

function SetOption(Key, Value) {
    SendMessage("SetOption", { Key: Key, Value: Value });
}