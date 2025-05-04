import { base16, bech32 } from "@scure/base";

export const npubToHex = (npub: string) => {
  const decoded = bech32.decode(`npub1${npub.slice(5, npub.length)}`);
  const bytes = bech32.fromWords(decoded.words);

  return base16.encode(bytes).toLowerCase();
};
