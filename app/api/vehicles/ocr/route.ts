import { NextResponse } from 'next/server';
import { getCurrentTenantId } from '@/lib/tenant';
import { extractCarteGrise } from '@/lib/ocr';

/**
 * POST /api/vehicles/ocr
 * Upload and extract data from carte grise (vehicle registration)
 */
export async function POST(req: Request) {
  try {
    await getCurrentTenantId(); // Verify authenticated

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format de fichier non supporté. Utilisez JPG, PNG ou PDF.' },
        { status: 400 }
      );
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Maximum 10MB.' },
        { status: 400 }
      );
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract data using Google Cloud Vision
    const extractedData = await extractCarteGrise(buffer);

    // Return extracted data
    return NextResponse.json({
      success: true,
      data: extractedData,
      message: 'Données extraites avec succès',
    });
  } catch (error: any) {
    console.error('OCR error:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de l\'extraction des données',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Configure body size limit for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
