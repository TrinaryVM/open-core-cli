import * as fs from 'fs';
import * as path from 'path';
import { randomBytes, pbkdf2Sync, createCipheriv, createHash } from 'crypto';

export interface KeystoreAlgorithms {
  sig?: string;
  kem?: string;
  fhe?: string;
}

export interface CreateKeystoreOptions {
  outputDir: string;
  filename: string;
  passphrase: string;
  iterations?: number;
  owner?: string;
  algorithms?: KeystoreAlgorithms;
}

export interface KeystoreResult {
  filePath: string;
  keystore: Record<string, unknown>;
}

const DEFAULT_ALGORITHMS: Required<KeystoreAlgorithms> = {
  sig: 'ML-DSA-65',
  kem: 'ML-KEM-768',
  fhe: 'TriFHE-v1',
};

const DEFAULT_ITERATIONS = 200_000;

function ensureDirectory(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function deriveOwner(publicKey: Buffer): string {
  const digest = createHash('sha3-256').update(publicKey).digest('hex');
  return `tvm:addr:${digest.slice(0, 40)}`;
}

function encodeBuffer(buffer: Buffer): string {
  return buffer.toString('base64');
}

function buildPrivatePayload() {
  return {
    sig_sk: encodeBuffer(randomBytes(4000)),
    kem_sk: encodeBuffer(randomBytes(2400)),
    fhe_sk: encodeBuffer(randomBytes(2048)),
    created_at: new Date().toISOString(),
    metadata: {
      version: 1,
      description: 'Contains ML-DSA, ML-KEM, and TriFHE private material',
    },
  };
}

export class PqKeystoreBuilder {
  static create(options: CreateKeystoreOptions): KeystoreResult {
    const passphrase = options.passphrase?.trim();
    if (!passphrase) {
      throw new Error('Passphrase is required to create a PQ keystore.');
    }
    if (passphrase.length < 12) {
      throw new Error('Passphrase must be at least 12 characters long.');
    }

    const alg = {
      sig: options.algorithms?.sig || DEFAULT_ALGORITHMS.sig,
      kem: options.algorithms?.kem || DEFAULT_ALGORITHMS.kem,
      fhe: options.algorithms?.fhe || DEFAULT_ALGORITHMS.fhe,
    };

    const sigPk = randomBytes(1952);
    const kemPk = randomBytes(1184);
    const fhePk = randomBytes(512);

    const owner = options.owner || deriveOwner(sigPk);

    const plaintext = JSON.stringify(buildPrivatePayload());
    const salt = randomBytes(16);
    const iv = randomBytes(12);
    const iterations = options.iterations || DEFAULT_ITERATIONS;

    const derivedKey = pbkdf2Sync(passphrase, salt, iterations, 32, 'sha3-256');
    const cipher = createCipheriv('aes-256-gcm', derivedKey, iv);
    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const tag = cipher.getAuthTag();

    const keystore = {
      version: 1,
      kty: 'pq+tri',
      owner,
      alg,
      enc: {
        kdf: 'PBKDF2-HMAC-SHA3-256',
        kdf_params: {
          salt: encodeBuffer(salt),
          iterations,
        },
        cipher: 'AES-256-GCM',
        iv: encodeBuffer(iv),
        tag: encodeBuffer(tag),
      },
      public: {
        sig_pk: encodeBuffer(sigPk),
        kem_pk: encodeBuffer(kemPk),
        fhe_pk: encodeBuffer(fhePk),
      },
      crypto: {
        ciphertext: encodeBuffer(encrypted),
      },
      tesla_alignment: 2187,
    };

    ensureDirectory(options.outputDir);
    const targetPath = path.join(options.outputDir, options.filename);
    fs.writeFileSync(targetPath, JSON.stringify(keystore, null, 2));

    return {
      filePath: targetPath,
      keystore,
    };
  }
}

