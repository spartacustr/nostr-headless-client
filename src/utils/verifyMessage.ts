import { sha256 } from "@noble/hashes/sha2";
import { RelayMsgData } from "../clients/rxClient.js";
import { bytesToHex } from "@noble/hashes/utils";
import { schnorr } from "@noble/curves/secp256k1";

function utf8ToBytes(str: string) {
  return new TextEncoder().encode(str);
}

export function serializeEvent(evt: RelayMsgData): string {
  return JSON.stringify([
    0,
    evt.pubkey,
    evt.created_at,
    evt.kind,
    evt.tags,
    evt.content,
  ]);
}

const getEventHash = (event: RelayMsgData): string => {
  const eventHash = sha256(utf8ToBytes(serializeEvent(event)));
  return bytesToHex(eventHash);
};

export const verifyMessage = (event: RelayMsgData): boolean => {
  const hash = getEventHash(event);
  return hash === event.id && schnorr.verify(event.sig, hash, event.pubkey);
};
