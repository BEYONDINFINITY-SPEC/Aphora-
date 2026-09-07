// Minimal RFC4122 v4-ish UUID generator using Math.random() - not
// cryptographically secure, but there's no real auth yet, so this is only
// ever used as a throwaway user_id placeholder. Avoids pulling in a package
// (crypto.randomUUID isn't reliably available across RN/Hermes versions).
export function generateUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
