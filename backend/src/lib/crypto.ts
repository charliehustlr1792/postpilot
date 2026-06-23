import crypto from "crypto";

// App-level encryption for secrets at rest (OAuth access/refresh tokens).
// AES-256-GCM gives us confidentiality plus an auth tag that detects tampering.
// The key comes from TOKEN_ENCRYPTION_KEY: 32 bytes, hex-encoded (64 chars).
// Generate one with:  openssl rand -hex 32

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
    const key = process.env.TOKEN_ENCRYPTION_KEY;
    if (!key) {
        throw new Error("TOKEN_ENCRYPTION_KEY is not set");
    }
    const buf = Buffer.from(key, "hex");
    if (buf.length !== 32) {
        throw new Error("TOKEN_ENCRYPTION_KEY must be 32 bytes (64 hex chars)");
    }
    return buf;
}

// Returns "iv:authTag:ciphertext", each part hex-encoded.
export function encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    const ciphertext = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return [
        iv.toString("hex"),
        authTag.toString("hex"),
        ciphertext.toString("hex"),
    ].join(":");
}

export function decrypt(payload: string): string {
    const [ivHex, tagHex, dataHex] = payload.split(":");
    if (!ivHex || !tagHex || !dataHex) {
        throw new Error("Invalid encrypted payload format");
    }
    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        getKey(),
        Buffer.from(ivHex, "hex")
    );
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    const plaintext = Buffer.concat([
        decipher.update(Buffer.from(dataHex, "hex")),
        decipher.final(),
    ]);
    return plaintext.toString("utf8");
}
