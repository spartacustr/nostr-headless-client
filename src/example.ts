import {connect} from "./clients/rxClient.js";
import { createFollowListMessage, createMetadataMessage, createNotesByAuthorsMessage } from "./nostr-api/createNostrMessage.js";
import { npubToHex } from "./utils/npub.js";

// const testAuthor = npubToHex('npub1qny3tkh0acurzla8x3zy4nhrjz5zd8l9sy9jys09umwng00manysew95gx') // ODELL
const testAuthor = npubToHex('npub1klnd450j7j6wf4u5jyclamhtq74dsucj525m97nj2k5j9nw462pq0q6xyr'); // JonNpub

const filters = {
    since: +new Date('2025-05-03') / 1000,
    until: +new Date('2025-05-04') / 1000,
    author: testAuthor
}

const Connection = connect(['wss://relay.damus.io', 'wss://relay.primal.net'])

Connection.ConnectionObservable.subscribe({
    next: (data) => console.log('ConResult:', data),
    complete: () => {
        Connection.sendMessage(createFollowListMessage([testAuthor]))
        Connection.sendMessage(createMetadataMessage([testAuthor]))
    }
})

Connection.Metadata.subscribe({next: (data) => console.log(JSON.stringify(data, null, 2))})

const Follows: string[] = []
Connection.FollowListObservable.subscribe({
    next: (data) => {
        Follows.push(...data)
        Connection.sendMessage(createNotesByAuthorsMessage(data, filters.since, filters.until, 10));
    },
    complete: () => console.log('follow list complete'),
    error: (err) => console.error(err)
})

const Notes: unknown[] = []

Connection.K1Observable.subscribe({
    next: (data) => {
        Notes.push(data)
        console.log('Notes len', Notes.length)
        console.log(JSON.stringify(Notes, null, 2))
    },
    complete: () => console.log('Completed K1Obs'),
    error: (err) => console.error(err)
})
