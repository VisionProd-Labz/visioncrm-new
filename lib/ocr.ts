import vision from '@google-cloud/vision';

// Initialize the client
const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_VISION_KEY,
});

/**
 * Extract text from image using Google Cloud Vision
 */
export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  const [result] = await client.textDetection(imageBuffer);
  const detections = result.textAnnotations;

  if (!detections || detections.length === 0) {
    return '';
  }

  // First detection contains the entire text
  return detections[0].description || '';
}

/**
 * Extract vehicle data from French Carte Grise (vehicle registration)
 */
export async function extractCarteGrise(imageBuffer: Buffer) {
  const text = await extractTextFromImage(imageBuffer);

  // Parse the text to extract vehicle information
  // This is a simplified version - real implementation would need more robust parsing
  const data = {
    vin: extractField(text, /(?:VIN|E)[\s:]*([A-HJ-NPR-Z0-9]{17})/i),
    license_plate: extractField(text, /(?:Immatriculation|A)[\s:]*([A-Z]{2}[-\s]?\d{3}[-\s]?[A-Z]{2})/i),
    make: extractField(text, /(?:Marque|D\.1)[\s:]*([A-Z]+)/i),
    model: extractField(text, /(?:Type|D\.2)[\s:]*([A-Z0-9\s]+)/i),
    year: extractYear(text),
    owner_name: extractField(text, /(?:Titulaire|C\.1)[\s:]*([\w\s]+)/i),
    owner_address: extractAddress(text),
  };

  return data;
}

/**
 * Extract a field using regex
 */
function extractField(text: string, regex: RegExp): string | undefined {
  const match = text.match(regex);
  return match ? match[1].trim() : undefined;
}

/**
 * Extract year from text
 */
function extractYear(text: string): number | undefined {
  const match = text.match(/(?:Date|B)[\s:]*(\d{2})\/(\d{2})\/(\d{4})/i);
  if (match) {
    return parseInt(match[3]);
  }

  // Try to find a 4-digit year
  const yearMatch = text.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? parseInt(yearMatch[0]) : undefined;
}

/**
 * Extract address from text
 */
function extractAddress(text: string): string | undefined {
  const match = text.match(/(?:Adresse|C\.3)[\s:]*([\d\w\s,]+)/i);
  return match ? match[1].trim() : undefined;
}

/**
 * Extract invoice data from image
 */
export async function extractInvoiceData(imageBuffer: Buffer) {
  const text = await extractTextFromImage(imageBuffer);

  const data = {
    invoice_number: extractField(text, /(?:Facture|Invoice|N°)[\s:]*([A-Z0-9-]+)/i),
    date: extractField(text, /(?:Date)[\s:]*(\d{2}\/\d{2}\/\d{4})/i),
    total: extractTotal(text),
    vat_number: extractField(text, /(?:TVA|VAT)[\s:]*([A-Z]{2}\d+)/i),
    siret: extractField(text, /(?:SIRET)[\s:]*(\d{14})/i),
  };

  return data;
}

/**
 * Extract total amount from text
 */
function extractTotal(text: string): number | undefined {
  const match = text.match(/(?:Total|TTC)[\s:]*(\d+[.,]\d{2})\s*€?/i);
  if (match) {
    return parseFloat(match[1].replace(',', '.'));
  }
  return undefined;
}

export default client;
