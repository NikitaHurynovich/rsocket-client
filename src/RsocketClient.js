import { RSocketClient, MAX_STREAM_ID } from 'rsocket-core';
import RSocketWebSocketClient from 'rsocket-websocket-client';
import {
  BufferEncoders,
  APPLICATION_JSON,
  MESSAGE_RSOCKET_ROUTING,
} from 'rsocket-core';
import { EchoResponder } from "./EchoResponder";

export default class RsocketClient {
  constructor(url, sessionId, connectCallback, responseCallback, metadataCallback) {
    const responder = new EchoResponder(responseCallback, metadataCallback);
    this._client = new RSocketClient({
      setup: {
        keepAlive: 30000000,
        lifetime: 30000000,
        dataMimeType: APPLICATION_JSON.string,
        metadataMimeType: MESSAGE_RSOCKET_ROUTING.string,
        payload: {
          data: Buffer.from(sessionId, 'utf8')
        },
      },
      responder,
      transport: new RSocketWebSocketClient({
        url,
      }, BufferEncoders),
    });
    this._connectCallback = connectCallback;
    this._responseCallback = responseCallback;
  }

  connect() {
    return this._client.connect().then(
      (socket) => {
        this._socket = socket;
        this._connectCallback(null);
      },
      (error) => this._connectCallback(error),
    );
  }

  disconnect() {
    this._client.close();
  }

  sendStream(data) {
    const routeMetadata = this.encodeRoute('subscription');
    this._socket.requestStream({
      data: Buffer.from(JSON.stringify(data), 'utf8'),
      metadata: routeMetadata,
    }).subscribe({
      onNext: (payload) => this._responseCallback(payload),
      onError: (error) => this._messageCallback(error),
      onSubscribe: (_subscription) => _subscription.request(MAX_STREAM_ID),
    });
  }

  encodeRoute(route) {
    const length = Buffer.byteLength(route, 'utf8');
    const buffer = Buffer.alloc(1);
    buffer.writeInt8(length);
    return Buffer.concat([buffer, Buffer.from(route, 'utf8')]);
  }
}
