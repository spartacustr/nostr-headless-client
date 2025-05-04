import { NostrMessage } from "../clients/rxClient.js"

const createNostrMessage = (name: string, data: NostrMessage['data']): NostrMessage => ({ name, data }) 

export const createMetadataMessage = (authors: string[]) => createNostrMessage('Metadata', { authors, kinds: [0] })

export const createFollowListMessage = (authors: string[]) => createNostrMessage('FollowList', { authors, kinds: [3] })

export const createNotesByAuthorsMessage = (authors: string[], since: number, until?: number, limit = 25) => createNostrMessage('Kind1Notes', { authors, kinds: [1], since, until, limit })
