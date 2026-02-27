export async function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  if (!signature || !secret) return false;

  const encoder = new TextEncoder();

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(rawBody),
  );

  const computedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  if (computedSignature.length !== signature.length) {
    return false;
  }

  const computedBytes = encoder.encode(computedSignature);
  const receivedBytes = encoder.encode(signature);

  let difference = 0;
  for (let i = 0; i < computedBytes.length; i++) {
    difference |= computedBytes[i] ^ receivedBytes[i];
  }

  return difference === 0;
}
