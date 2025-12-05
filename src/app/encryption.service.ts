import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private keyPair: CryptoKeyPair | null = null;
  private sharedSecrets: Map<string, CryptoKey> = new Map();

  constructor() {}

  async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    try {
      this.keyPair = await window.crypto.subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveKey', 'deriveBits']
      );

      const publicKeyExported = await window.crypto.subtle.exportKey('spki', this.keyPair.publicKey);
      const privateKeyExported = await window.crypto.subtle.exportKey('pkcs8', this.keyPair.privateKey);

      return {
        publicKey: this.arrayBufferToBase64(publicKeyExported),
        privateKey: this.arrayBufferToBase64(privateKeyExported)
      };
    } catch (error) {
      console.error('Key generation failed:', error);
      throw error;
    }
  }

  async loadKeys(privateKeyBase64: string): Promise<void> {
    try {
      const privateKeyBuffer = this.base64ToArrayBuffer(privateKeyBase64);
      const privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveKey', 'deriveBits']
      );
      this.keyPair = { privateKey } as CryptoKeyPair;
    } catch (error) {
      console.error('Key loading failed:', error);
      throw error;
    }
  }

  async generateSharedSecret(otherUserPublicKeyBase64: string, otherUsername: string): Promise<void> {
    try {
      if (!this.keyPair?.privateKey) throw new Error('Private key not loaded');

      const otherPublicKeyBuffer = this.base64ToArrayBuffer(otherUserPublicKeyBase64);
      const otherPublicKey = await window.crypto.subtle.importKey(
        'spki',
        otherPublicKeyBuffer,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        []
      );

      const sharedSecret = await window.crypto.subtle.deriveKey(
        { name: 'ECDH', public: otherPublicKey },
        this.keyPair.privateKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
      this.sharedSecrets.set(otherUsername, sharedSecret);
    } catch (error) {
      console.error('Shared secret generation failed:', error);
      throw error;
    }
  }

  async encryptMessage(message: string, recipientUsername: string): Promise<{ encryptedMessage: string; iv: string }> {
    try {
      const sharedSecret = this.sharedSecrets.get(recipientUsername);
      if (!sharedSecret) throw new Error('Shared secret not found for user: ' + recipientUsername);

      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      const encryptedData = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        sharedSecret,
        data
      );

      return {
        encryptedMessage: this.arrayBufferToBase64(encryptedData),
        iv: this.arrayBufferToBase64(iv)
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  }

  async decryptMessage(encryptedMessage: string, iv: string, senderUsername: string): Promise<string> {
    try {
      const sharedSecret = this.sharedSecrets.get(senderUsername);
      if (!sharedSecret) return '[Encrypted Message - Key not available]';

      const encryptedData = this.base64ToArrayBuffer(encryptedMessage);
      const ivBuffer = this.base64ToArrayBuffer(iv);

      const decryptedData = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuffer },
        sharedSecret,
        encryptedData
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '[Decryption failed]';
    }
  }

  hasSharedSecret(username: string): boolean {
    return this.sharedSecrets.has(username);
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}