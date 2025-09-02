import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      where: {
        isActive: true
      },
      include: {
        category: true
      },
      orderBy: [
        {
          category: {
            displayOrder: 'asc'
          }
        },
        {
          materialCode: 'asc'
        }
      ]
    });
    
    return NextResponse.json(materials);
  } catch (error) {
    console.error('資材取得エラー:', error);
    return NextResponse.json(
      { error: '資材の取得に失敗しました' },
      { status: 500 }
    );
  }
}