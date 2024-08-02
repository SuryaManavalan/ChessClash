//@ts-nocheck

import * as React from 'react';
import * as ReactDom from 'react-dom';
import PeerJs from 'peerjs';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

let peer: PeerJs;
let connection: PeerJs.DataConnection;

interface ChatMessage {
  id: number;
  self: boolean;
  user: string;
  message: string;
  time: string;
}

const NameInput: React.FC = () => {
  const navigate = useNavigate();
  const [availablePeer, setAvailablePeer] = React.useState(peer);

  const submit = React.useCallback<React.FormEventHandler<HTMLFormElement>>((ev) => {
    const input = ev.currentTarget.elements.namedItem('name') as HTMLInputElement;
    const user = input.value;
    ev.preventDefault();
    setAvailablePeer(new PeerJs(user));
  }, []);

  React.useEffect(() => {
    peer = availablePeer;

    if (availablePeer) {
      navigate('/overview');
    }
  }, [availablePeer, navigate]);

  return (
    <form onSubmit={submit}>
      <label>Your name:</label>
      <input name="name" />
      <button>Save</button>
    </form>
  );
};

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const [availablePeer] = React.useState(peer);
  const [availableConnection, setAvailableConnection] = React.useState(connection);

  const submit = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    (ev) => {
      const input = ev.currentTarget.elements.namedItem('name') as HTMLInputElement;
      const otherUser = input.value;
      const connection = availablePeer.connect(otherUser);
      connection['caller'] = availablePeer.id;
      ev.preventDefault();
      setAvailableConnection(connection);
    },
    [availablePeer],
  );

  React.useEffect(() => {
    connection = availableConnection;

    if (!availablePeer) {
      navigate('/');
    } else if (availableConnection) {
      navigate('/call');
    } else {
      const handler = (connection: PeerJs.DataConnection) => {
        connection['caller'] = connection.peer;
        setAvailableConnection(connection);
      };
      peer.on('connection', handler);
      return () => peer.off('connection', handler);
    }
  }, [availablePeer, availableConnection, navigate]);

  return (
    <div>
      <h1>Hi, {availablePeer?.id}</h1>
      <form onSubmit={submit}>
        <label>Name to call:</label>
        <input name="name" />
        <button>Call</button>
      </form>
    </div>
  );
};

const Call: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = React.useState<Array<ChatMessage>>([]);
  const [availablePeer] = React.useState(peer);
  const [availableConnection, setAvailableConnection] = React.useState(connection);

  const appendMessage = React.useCallback(
    (message: string, self: boolean) =>
      setMessages((msgs) => [
        ...msgs,
        {
          id: Date.now(),
          message,
          self,
          time: new Date().toLocaleTimeString(),
          user: self ? availablePeer.id : availableConnection.peer,
        },
      ]),
    [availablePeer, availableConnection],
  );

  React.useEffect(() => {
    connection = availableConnection;

    if (!availableConnection) {
      navigate('/overview');
    } else {
      const dataHandler = (data: string) => {
        appendMessage(data, false);
      };
      const closeHandler = () => {
        setAvailableConnection(undefined);
      };
      availableConnection.on('data', dataHandler);
      availableConnection.on('close', closeHandler);
      return () => {
        availableConnection.off('data', dataHandler);
        availableConnection.off('close', closeHandler);
      };
    }
  }, [availableConnection, navigate]);

  const submit = React.useCallback(
    (ev) => {
      const input = ev.currentTarget.elements.namedItem('message') as HTMLInputElement;
      const message = input.value;
      ev.preventDefault();
      availableConnection.send(message);
      input.value = '';
      appendMessage(message, true);
    },
    [availableConnection, appendMessage],
  );

  const disconnect = React.useCallback(() => {
    availableConnection.close();
    setAvailableConnection(undefined);
  }, [availableConnection]);

  return (
    <div>
      <h1>
        {availablePeer?.id} ⬄ {availableConnection?.peer} <button onClick={disconnect}>Hang up</button>
      </h1>
      <div>
        {messages.map((msg) => (
          <p key={msg.id} style={{ color: msg.self ? '#999' : '#222' }}>
            <b>{msg.user}</b> ({msg.time}): {msg.message}
          </p>
        ))}
      </div>
      <form onSubmit={submit}>
        <input name="message" />
        <button>Send</button>
      </form>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NameInput />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/call" element={<Call />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;