
import Tesseract from 'tesseract.js';

export async function readPrescription(file: File): Promise<string> {
  try {
    const result = await Tesseract.recognize(file, 'eng+urd', {
      logger: m => console.debug(m)
    });
    return result.data.text;
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Failed to process prescription image.");
  }
}
