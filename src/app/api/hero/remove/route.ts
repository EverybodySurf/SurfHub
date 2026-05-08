import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { HeroImage } from '@/lib/curate/hero-sources';

const HERO_POOL_PATH = path.join(process.cwd(), 'data', 'hero-pool.json');

interface HeroPoolData {
  images: HeroImage[];
  removedLog: HeroImage[];
  lastFetch: string | null;
  fetchStats: {
    totalAdded: number;
    totalRemoved: number;
    sources: { unsplash: number; pexels: number };
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageId, reason } = body;

    if (!imageId) {
      return NextResponse.json({ success: false, error: 'imageId required' }, { status: 400 });
    }

    const data = fs.readFileSync(HERO_POOL_PATH, 'utf-8');
    const pool: HeroPoolData = JSON.parse(data);

    const imageIndex = pool.images.findIndex((img) => img.id === imageId);
    if (imageIndex === -1) {
      return NextResponse.json({ success: false, error: 'Image not found' }, { status: 404 });
    }

    const image = pool.images[imageIndex];
    
    // Mark as removed and add to log
    image.status = 'removed';
    image.removedAt = new Date().toISOString();
    image.removedReason = reason || 'User removed';

    pool.removedLog.push(image);
    pool.images.splice(imageIndex, 1);
    pool.fetchStats.totalRemoved += 1;

    fs.writeFileSync(HERO_POOL_PATH, JSON.stringify(pool, null, 2));

    return NextResponse.json({
      success: true,
      message: `Removed ${imageId}`,
      removedImage: image,
    });
  } catch (error) {
    console.error('Hero remove error:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove image' }, { status: 500 });
  }
}