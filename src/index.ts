import {createRelayConnection} from "./clients/rxClient.js";
import {saveFollowList} from "./storage/followList.js";

const testAuthor = '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245'

const RelayConnection = createRelayConnection('wss://nos.lol', {
    since: +new Date() / 100,
    author: '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245'
});

RelayConnection.FollowListObservable.subscribe({
    next: (data) => {
        saveFollowList({ author: testAuthor, keys: data });
        console.log('follow list received, sending feed msg');
        RelayConnection.sendFeedMessage(data);
    },
    error: (err) => console.error(err),
    complete: () => console.log(),
});

RelayConnection.FeedObservable.subscribe({
    next: (data) => console.log(data),
})
