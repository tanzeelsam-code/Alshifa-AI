
/**
 * Safely opens a data URL (base64) in a new browser tab.
 * Modern browsers block direct top-level navigation to data: URLs for security.
 * This function converts the data URL to a Blob URL which is allowed.
 */
export const openFileInNewTab = (dataUrl: string) => {
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) {
      console.warn("Invalid data URL");
      return;
    }
    const header = parts[0];
    let base64 = parts[1];

    // Add missing padding if necessary
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    const mimeMatch = header.match(/:(.*?);/);
    if (!mimeMatch) return;

    const mime = mimeMatch[1];
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);

    const newWindow = window.open(url, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      alert('Pop-up blocked! Please allow pop-ups to view the report.');
    }
  } catch (e) {
    console.error("Failed to open file in new tab:", e);
    // Fallback attempt
    window.open(dataUrl, '_blank');
  }
}
