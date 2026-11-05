export interface ClipboardWriter {
  writeText(text: string): Promise<void>;
}

export function getClipboard(): ClipboardWriter | null {
  if (typeof navigator === "undefined") return null;
  const clipboard = (navigator as Navigator & { clipboard?: ClipboardWriter })
    .clipboard;
  return clipboard && typeof clipboard.writeText === "function"
    ? clipboard
    : null;
}

export async function copyText(
  text: string,
  clipboard: ClipboardWriter | null = getClipboard()
): Promise<boolean> {
  if (!clipboard) return false;
  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
