import { decodeRoutes } from 'rsocket-core';

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




}