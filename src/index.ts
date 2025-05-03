import {connect} from "./clients/rxClient.js";
import { createFollowListMessage, createMetadataMessage, createNotesByAuthorsMessage } from "./nostr-api/createNostrMessage.js";
import { npubToHex } from "./utils/npub.js";

// const testAuthor = npubToHex('npub1qny3tkh0acurzla8x3zy4nhrjz5zd8l9sy9jys09umwng00manysew95gx') // ODELL
const testAuthor = npubToHex('npub1klnd450j7j6wf4u5jyclamhtq74dsucj525m97nj2k5j9nw462pq0q6xyr'); // JonNpub

const filters = {
    since: +new Date('2025-01-25') / 1000,
    until: +new Date('2025-05-03') / 1000,
    author: testAuthor
}

const Connection = connect(['wss://relay.damus.io', 'wss://relay.primal.net', 'wss://xwsstupidrelay.net'])

Connection.ConnectionObservable.subscribe({
    next: (data) => console.log('ConResult:', data),
    complete: () => {
        Connection.sendMessage(createFollowListMessage([testAuthor]))
        Connection.sendMessage(createMetadataMessage([testAuthor]))
    }
})

Connection.Metadata.subscribe({next: (data) => console.log(JSON.stringify(data, null, 2))})

Connection.FollowListObservable.subscribe({
    next: (data) => {
        // console.log('Follow list', data)
        Connection.sendMessage(createNotesByAuthorsMessage(data, filters.since, filters.until));
    },
    complete: () => console.log('follow list complete'),
    error: (err) => console.error(err)
})

Connection.K1Observable.subscribe({
    next: (data) => console.log(data),
})
