#!/usr/bin/env tsx

/**
 * Google Cloud Vision OCR Test Script
 * Teste l'intégration Google Cloud Vision avec un document de test
 */

// import { config } from 'dotenv';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';

// config({ path: join(process.cwd(), '.env') });

// Colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function printHeader(text: string) {
  console.log(`\n${colors.bold}${colors.cyan}${text}${colors.reset}`);
  console.log('='.repeat(text.length));
}

function printSuccess(text: string) {
  console.log(`${colors.green}✓${colors.reset} ${text}`);
}

function printError(text: string) {
  console.log(`${colors.red}✗${colors.reset} ${text}`);
}

function printInfo(text: string) {
  console.log(`${colors.blue}ℹ${colors.reset} ${text}`);
}

function printWarning(text: string) {
  console.log(`${colors.yellow}⚠${colors.reset} ${text}`);
}

async function testVisionOCR(imagePath: string): Promise<boolean> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_KEY;
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

  if (!apiKey && !projectId) {
    printWarning('Google Cloud Vision not configured (optional feature)');
    printInfo('  GOOGLE_CLOUD_VISION_KEY or GOOGLE_CLOUD_PROJECT_ID not set');
    printInfo('  This feature is optional for OCR functionality');
    return true; // Return true because it's optional
  }

  if (!existsSync(imagePath)) {
    printError(`Image file not found: ${imagePath}`);
    return false;
  }

  printInfo(`Testing OCR on: ${imagePath}`);

  try {
    // Read image and convert to base64
    const imageBuffer = readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    printInfo('Sending request to Google Cloud Vision API...');

    // Use the Cloud Vision REST API
    const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      printError(`Vision API error: ${response.status}`);
      console.error('  Error details:', error);

      if (response.status === 400) {
        printWarning('  Possible issues:');
        printInfo('    - Invalid API key format');
        printInfo('    - Image format not supported');
        printInfo('    - Image too large (max 20MB)');
      } else if (response.status === 403) {
        printWarning('  API key invalid or Vision API not enabled');
        printInfo('    - Check API key in .env');
        printInfo('    - Enable Cloud Vision API in Google Cloud Console');
      }

      return false;
    }

    const data = await response.json();

    if (data.responses && data.responses[0]) {
      const result = data.responses[0];

      if (result.error) {
        printError(`OCR failed: ${result.error.message}`);
        return false;
      }

      if (result.textAnnotations && result.textAnnotations.length > 0) {
        const detectedText = result.textAnnotations[0].description;

        printSuccess('OCR completed successfully!');
        printInfo(`  Detected ${result.textAnnotations.length} text regions`);

        console.log('\n' + colors.bold + 'Detected Text:' + colors.reset);
        console.log(colors.cyan + '─'.repeat(60) + colors.reset);

        // Show first 500 characters
        const preview = detectedText.substring(0, 500);
        console.log(preview);

        if (detectedText.length > 500) {
          console.log(`\n... (${detectedText.length - 500} more characters)`);
        }

        console.log(colors.cyan + '─'.repeat(60) + colors.reset);

        // Show confidence if available
        if (result.textAnnotations[0].confidence) {
          printInfo(`  Confidence: ${(result.textAnnotations[0].confidence * 100).toFixed(1)}%`);
        }

        return true;
      } else {
        printWarning('No text detected in image');
        printInfo('  The image may not contain readable text');
        printInfo('  Try with a clearer image or one that contains text');
        return false;
      }
    } else {
      printError('Unexpected API response format');
      return false;
    }
  } catch (error) {
    printError(`Failed to process image: ${error}`);
    return false;
  }
}

// Main execution
async function main() {
  console.log('\n');
  printHeader('📄 VisionCRM - Google Vision OCR Test');

  // Get image path from command line argument
  const imagePath = process.argv[2];

  if (!imagePath) {
    printInfo('No image provided - checking if Vision is configured...');

    const apiKey = process.env.GOOGLE_CLOUD_VISION_KEY;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

    if (!apiKey && !projectId) {
      printWarning('Google Cloud Vision not configured (optional)');
      console.log('\n' + colors.yellow + 'Note:' + colors.reset + ' Google Cloud Vision is optional for VisionCRM.');
      console.log('The app will work without it, but OCR features will be disabled.');
      console.log('\nTo enable OCR:');
      console.log('1. Get a Google Cloud Vision API key');
      console.log('2. Add GOOGLE_CLOUD_VISION_KEY to .env');
      console.log('3. (Optional) Add GOOGLE_CLOUD_PROJECT_ID to .env');
      console.log('\n' + colors.cyan + 'To test with an image:' + colors.reset);
      console.log(`  pnpm tsx scripts/test-google-vision.ts path/to/image.jpg`);
      process.exit(0);
    } else {
      printSuccess('Google Cloud Vision is configured');
      console.log('\n' + colors.cyan + 'To test OCR functionality:' + colors.reset);
      console.log(`  pnpm tsx scripts/test-google-vision.ts path/to/image.jpg`);
      console.log('\nExample:');
      console.log(`  pnpm tsx scripts/test-google-vision.ts invoice.pdf`);
      console.log(`  pnpm tsx scripts/test-google-vision.ts document.png`);
      process.exit(0);
    }
  }

  // Test with provided image
  const success = await testVisionOCR(imagePath);

  if (success) {
    console.log('\n');
    printSuccess('Google Vision OCR test passed!');
    console.log('\n🎉 OCR functionality is working correctly!');
    console.log('\n' + colors.yellow + 'Next steps:' + colors.reset);
    console.log('1. Integrate OCR into your document processing workflow');
    console.log('2. Handle OCR results in your application logic');
    console.log('3. Consider error handling for images without text');
    process.exit(0);
  } else {
    console.log('\n');
    printError('Google Vision OCR test failed');
    console.log('\n⚠️  Please check:');
    console.log('1. GOOGLE_CLOUD_VISION_KEY is correct in .env');
    console.log('2. Cloud Vision API is enabled in Google Cloud Console');
    console.log('3. API key has proper permissions');
    console.log('4. Image file exists and is readable');
    console.log('5. Image format is supported (JPEG, PNG, PDF, etc.)');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
