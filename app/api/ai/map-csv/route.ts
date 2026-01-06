import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { headers, sampleData, targetFields } = await request.json();

    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      return NextResponse.json(
        { error: 'Headers are required' },
        { status: 400 }
      );
    }

    // Use Gemini to map CSV columns to target fields
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a data mapping assistant. Given the following CSV column headers and sample data, map each CSV column to the most appropriate target field.

CSV Headers: ${headers.join(', ')}

Sample Data (first 3 rows):
${JSON.stringify(sampleData, null, 2)}

Target Fields: ${targetFields.join(', ')}

Return ONLY a JSON object with the mapping. Format: { "CSV_Column_Name": "target_field_name" }
Only include mappings where you're confident. Use null or empty string for columns that don't match any target field.

Example response:
{
  "Prénom": "first_name",
  "Nom": "last_name",
  "Email": "email",
  "Téléphone": "phone",
  "Entreprise": "company"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    const mapping = JSON.parse(jsonMatch[0]);

    // Filter out null/empty mappings
    const filteredMapping: Record<string, string> = {};
    Object.entries(mapping).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        filteredMapping[key] = value;
      }
    });

    return NextResponse.json({ mapping: filteredMapping });
  } catch (error) {
    console.error('Error in AI CSV mapping:', error);
    return NextResponse.json(
      { error: 'Failed to map CSV columns' },
      { status: 500 }
    );
  }
}
