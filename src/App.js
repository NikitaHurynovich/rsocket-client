import React, { useState } from 'react';
import './App.css';
import RsocketClient from "./RsocketClient";

function App() {
  const [rsocketClient, setRsocketClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [url, setUrl] = useState('ws://localhost:7000');
  const [sessionId, setSessionId] = useState('userId');
  const [connectionId, setConnectionId] = useState(null);
  const [conceptIds, setConceptIds] = useState('1,2,3');
  const [libraryIds, setLibraryIds] = useState('1,2,3');
  const [connected, setConnected] = useState(false);

  const connect = () => {
      const onUpdateEvents = (payload) => {
          const data = JSON.parse(payload.data.toString('utf8'));
          console.log(data);
          messages.push(data)
          setMessages([...messages]);
      }

      const onUpdateConnection = (payload) => {
          const connectionId = payload.data.toString('utf8');
          console.log(connectionId);
          setConnectionId(connectionId);
      }

      const service = new RsocketClient(
          url,
          sessionId,
          (error) => setConnected(!error),
          onUpdateEvents,
          onUpdateConnection,
      );
      service.connect();
      setRsocketClient(service);
  }



  const items = messages.map(item => <p>Libraries: {item.libraryIds}, Concepts: {item.conceptIds}</p>)
  return (
    <div className="App">
        <div>
            <h5>Connection websocket Url:</h5>
                <input type="text"
                       value={url}
                       onChange={event => setUrl(event.target.value)} />
                <button onClick={connect}>Connect</button>
                <button onClick={() => rsocketClient.disconnect()}>Disconnect</button>
        </div>
        <div>
            <h5>SessionId:</h5>
            <input type="text"
                   value={sessionId}
                   onChange={event => setSessionId(event.target.value)} />
        </div>
        <div>
            <h5>Concept Ids array::</h5>
            <input type="text"
                   value={conceptIds}
                   onChange={event => setConceptIds(event.target.value)} />
        </div>
        <div>
            <h5>Library Ids array::</h5>
            <input type="text"
                   value={libraryIds}
                   onChange={event => setLibraryIds(event.target.value)} />
        </div>
        <div>
            <h5>Subscribe:</h5>
            <button disabled={!connected}
                    onClick={() => rsocketClient.sendStream({
                        sessionId: connectionId || sessionId,
                        conceptIds: conceptIds.split(','),
                        libraryIds: libraryIds.split(',')
                    })}>
                Subscribe
            </button>
        </div>
        <h3>Update events:</h3>
      <ul>
          {items}
      </ul>
    </div>
  );
}

export default App;
