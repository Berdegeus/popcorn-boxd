export function createPasswordHash(password: string): string {
  let hash = 0;

  for (let index = 0; index < password.length; index += 1) {
    const charCode = password.charCodeAt(index);
    hash = (hash << 5) - hash + charCode;
    hash |= 0; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(16);
}

export function isPasswordValid(password: string, hash: string): boolean {
  return createPasswordHash(password) === hash;
}
