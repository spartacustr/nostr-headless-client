import WebSocket from 'ws';
import {Observable, filter, map, of, take, combineLatest, mergeMap, from, mergeAll, distinctUntilKeyChanged } from "rxjs";

const MySubId = 'One'

type RelayMsgSubscriptionId = string
type RelayMsgType = 'EVENT' | 'REQ' | 'CLOSE'
type RelayMsgData = {
    id: string;
    created_at: number;
    kind: number;
    pubkey: string;
    sig: string
    tags: Array<['p' | 'e', string, string]>
}

type RelayMessage = { msgType: RelayMsgType, msgSubId: RelayMsgSubscriptionId, msgContent: RelayMsgData }

const createRelayObservable = (ws: WebSocket) => new Observable<RelayMessage>((subscriber) => {
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

export type NostrMessage = { name: string; data: Record<string, unknown> }
type ConnectionResult = { connected: boolean; relayEndpoint: string; error?: unknown }

export const createRelayConnection = (relayEndpoint: string) => {
    const ws = new WebSocket(relayEndpoint);

    const ConnectionObservable = new Observable<ConnectionResult>((subscriber) => {
        ws.on('open', () => {
            subscriber.next({ connected: true, relayEndpoint })
            subscriber.complete()
        })

        ws.on('error', (error) =>  {
            subscriber.next({ connected: false, error, relayEndpoint })
            subscriber.complete()
        })
    })

   const RelayObservable = createRelayObservable(ws);

   const MetadataObservable = RelayObservable.pipe(filter(message => message.msgContent?.kind === 0))

   const FollowListObservable = RelayObservable.pipe(
       filter(message => message.msgContent?.kind === 3),
       map(message => message.msgContent.tags.filter(t => t[0] === 'p').flatMap(tag => tag[1])),
       take(1),
   );

   const K1Observable = RelayObservable.pipe(
       filter(message => message.msgContent?.kind === 1 && !message.msgContent.tags.map(([t]) => t).includes('e')),
       map(message => ({ ...message.msgContent, date: new Date(message.msgContent.created_at * 1000) })),
   );

   const sendMessage = (message: NostrMessage) => ws.send(JSON.stringify(["REQ", `${MySubId}_${message.name}`, message.data]));

   return {
       ConnectionObservable,
       RelayObservable,
       FollowListObservable,
       K1Observable,
       MetadataObservable,
       sendMessage,
       close: () => { 
        ws.close() 
},
   }
}


export const connect = (relays: string[]) => {
    const connections = relays.map(r => createRelayConnection(r));

    return {
        close: () => connections.forEach(c => c.close()),
        sendMessage: (msg: NostrMessage) => connections.map(c => c.sendMessage(msg)),
        ConnectionObservable: combineLatest(connections.map(c => c.ConnectionObservable)).pipe(mergeAll()),
        FollowListObservable: combineLatest(
                connections.map(c => c.FollowListObservable)
            ).pipe(
                mergeMap(followLists => of([... new Set(followLists.flat())])),
                take(1),
            ),
        K1Observable: from(connections.map(c => c.K1Observable)).pipe(
            mergeAll(),
            distinctUntilKeyChanged('id')
        ),
        Metadata: from(connections.map(c => c.MetadataObservable)).pipe(
            mergeAll(),
            map(msg => msg.msgContent),
            distinctUntilKeyChanged('pubkey')
        )
    }
}