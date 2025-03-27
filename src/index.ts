console.log("Script starting...");

import { sign, verify } from "nostringer";
import { ProjectivePoint } from "@noble/secp256k1";
import { bytesToHex } from "@noble/hashes/utils";
import { generateSecretKey as nostrGenerateSecretKey } from "nostr-tools";

interface KeyPair {
  privateKeyHex: string;
  publicKeyHex: string;
}

const NostrTools = {
  generateKeyPair(): KeyPair {
    const privKey = nostrGenerateSecretKey();
    const privateKeyHex = bytesToHex(privKey);

    const pubKey = ProjectivePoint.fromPrivateKey(privKey);
    const publicKeyHex = pubKey.x.toString(16).padStart(64, "0");

    return { privateKeyHex, publicKeyHex };
  },

  generateKeyPairs(count: number = 3): KeyPair[] {
    return Array.from({ length: count }, () => this.generateKeyPair());
  },

  getPublicKeys(keyPairs: KeyPair[]): string[] {
    return keyPairs.map((kp) => kp.publicKeyHex);
  },
};

function runRingSignatureDemo() {
  console.log("Ring Signature Demo using nostringer with nostr-tools keys");
  console.log("------------------------------------------------------");

  // Generate two Nostr keypairs
  const keyPairs = NostrTools.generateKeyPairs(2);
  console.log(`Generated ${keyPairs.length} key pairs`);

  // Create a ring with public keys
  const ring = NostrTools.getPublicKeys(keyPairs);
  console.log("Ring of public keys:", ring);

  const message = "Hello, this is a ring signature example!";
  console.log(`Message to sign: "${message}"`);

  // Sign with the first private key
  console.log("\nSigning with the first private key...");
  const signature = sign(message, keyPairs[0].privateKeyHex, ring);
  console.log("Signature created:", {
    c0: signature.c0,
    s: signature.s.map((s: string) => s.substring(0, 10) + "..."),
  });

  // Verify the signature
  console.log("\nVerifying signature...");
  const isValid = verify(signature, message, ring);
  console.log("Signature valid:", isValid);

  // Try with a tampered message
  const tamperedMessage = "Tampered message";
  console.log("\nVerifying with tampered message...");
  const isTamperedValid = verify(signature, tamperedMessage, ring);
  console.log("Signature valid with tampered message:", isTamperedValid);
}

runRingSignatureDemo();
