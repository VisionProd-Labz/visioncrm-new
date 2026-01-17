import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(req: Request) {
  const ip = 'test-ip-' + Date.now();

  try {
    const result = await checkRateLimit(ip, 'login');

    return NextResponse.json({
      success: true,
      rateLimit: result,
      message: 'Rate limit check successful',
      redis: 'connected',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      redis: 'error',
    }, { status: 500 });
  }
}
