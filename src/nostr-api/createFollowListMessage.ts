
export const createFollowListMessage = (subscriptionId: string, author: string) =>        JSON.stringify([
    "REQ",
    subscriptionId,
    { authors: [author], kinds: [3] }
])