# nostr-headless-client

Welcome to the Nostr Headless Client project! This repository contains the core logic for managing connections to multiple relays and handling various WebSocket messages from these relays, specifically tailored for the nostr-headless-client project.

## Table of Contents
1. **Overview**
2. **Key Components**
3. **Usage**
4. **Installation**
5. **Contributing**
6. **License**

## Overview
The Nostr Headless Client is a crucial part of the nostr-headless-client project, designed to facilitate communication with multiple relays and handle WebSocket messages efficiently. It abstracts the complexity of managing multiple connections and provides high-level abstractions for interacting with relays.

## Key Components
### 1. `createRelayConnection`
This function initializes a connection to a specific relay endpoint using WebSocket, providing observables for handling different types of messages:
- **RelayObservable**: Emits all messages from the relay.
- **MetadataObservable**: Filters and emits only metadata messages.
- **FollowListObservable**: Extracts and filters follow list updates.
- **K1Observable**: Handles K1 events specific to nostr protocol.

### 2. `connect`
This function manages connections to multiple relays:
- **ConnectionObservable**: Provides an observable of connection statuses for each relay.
- **FollowListObservable**: Aggregates follow lists from all connected relays.
- **K1Observable**: Merges K1 observables, ensuring unique events based on message IDs.
- **Metadata**: Aggregates metadata updates across all connections.

## Usage
To use the Nostr Headless Client in your project, you need to import and initialize it as follows:
```typescript
import { connect } from 'nostr-headless-client';

const relays = ['wss://relay1.com', 'wss://relay2.com'];
const nostrClient = connect(relays);

// Subscribe to connection statuses
nostrClient.ConnectionObservable.subscribe({
    next: (data) => console.log(data),
    complete: () => console.log('Relay connection finished.')
});

// Send a message to the relays
nostrClient.sendMessage({ name: 'EVENT_NAME', data: { key: 'value' } });
```

