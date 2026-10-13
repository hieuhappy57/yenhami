export function isPublicMediaKey(key: string): boolean {
  if (!key.startsWith("uploads/") || /[%\\?#]/.test(key)) return false;
  const parts=key.split("/");
  return parts.every((part)=>Boolean(part) && part!=="." && part!=="..") && /\.(png|jpe?g|webp|gif|avif)$/i.test(key);
}

export function isSafePublicMediaContentType(type: string): boolean {
  return ["image/png","image/jpeg","image/jpg","image/webp","image/gif","image/avif"].includes(type.split(";")[0].trim().toLowerCase());
}
