import {decodeRoutes, MAX_STREAM_ID} from 'rsocket-core';
import {Flowable, Single} from 'rsocket-flowable';


export class EchoResponder {
    constructor(responseCallback, metadataCallback) {
        this.responseCallback = responseCallback;
        this.metadataCallback = metadataCallback;
    }
    fireAndForget(payload) {
        if (payload.metadata) {
           let route = decodeRoutes(payload.metadata);
           route = route.next();
           if (route.value === 'connection') {
               this.metadataCallback(payload);
           }
        } else {
            this.responseCallback(payload);
        }
    }

    requestChannel(payload) {
        return payload;
    }
}