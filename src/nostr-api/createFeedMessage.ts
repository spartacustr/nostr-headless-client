
export const createFeedMessage = (subscriptionId: string, authors: string[]) => JSON.stringify([
    "REQ",
    subscriptionId,
    { authors, kinds: [1], limit: 10 }
])