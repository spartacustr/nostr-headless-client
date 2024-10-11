import WebSocket from 'ws';
import {Observable, filter, map } from "rxjs";
import {createFollowListMessage} from "../nostr-api/createFollowListMessage.js";
import {createFeedMessage} from "../nostr-api/createFeedMessage.js";

const MySubId = 'One'

type RelayMsgSubscriptionId = string
type RelayMsgType = 'EVENT' | 'REQ' | 'CLOSE'
type RelayMsgData = {
    created_at: number;
    kind: number;
    pubkey: string;
    sig: string
    tags: Array<['p' | 'e', string, string]>
}

type RelayMessage = { msgType: RelayMsgType, msgSubId: RelayMsgSubscriptionId, msgContent: RelayMsgData }

const createRelayObservable = (ws: WebSocket) => new Observable<RelayMessage>((subscriber) => {
    ws.on('error', (error) => {
        subscriber.error(error)
    });

    ws.on('close', function close() {
       subscriber.complete()
    });

    ws.on('message', function message(data) {
        const [msgType, msgSubId, msgContent] = JSON.parse(data.toString());
        subscriber.next({
            msgType,
            msgSubId,
            msgContent
        })
    })
});

type FeedSettings = {
    since: number;
    author: string;
}

export const createRelayConnection = (relayEndpoint: string, feedSettings: FeedSettings) => {
    const ws = new WebSocket(relayEndpoint);

    ws.on('open', function open() {
        console.log('Connection Opened')
        ws.send(createFollowListMessage(MySubId, feedSettings.author))
    });

   const RelayObservable = createRelayObservable(ws);

   const FollowListObservable = RelayObservable.pipe(
       filter(message => message.msgContent?.kind === 3),
       map(message => message.msgContent.tags.flatMap(tag => tag[1])),
   );

   const FeedObservable = RelayObservable.pipe(
       filter(message => message.msgContent?.kind === 1),
       map(message => message.msgContent)
   );

   const sendFeedMessage = (authors: string[]) => {
       ws.send(createFeedMessage(MySubId, authors.slice(0,50)))
   }

   return {
       RelayObservable,
       FollowListObservable,
       FeedObservable,
       sendFeedMessage,
   }
}