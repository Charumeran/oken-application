import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, categoryId, size, type, weightKg, notes } = body;

    // バリデーション
    if (!name || !categoryId || !weightKg) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    // カテゴリの存在確認
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'カテゴリが見つかりません' },
        { status: 404 }
      );
    }

    // 次のマテリアルコードを生成
    let materialCode: string;
    if (category.name === 'その他') {
      // その他カテゴリの場合、OT-XXX形式
      const lastMaterial = await prisma.material.findFirst({
        where: {
          materialCode: { startsWith: 'OT-' }
        },
        orderBy: { materialCode: 'desc' }
      });
      
      let nextNumber = 1;
      if (lastMaterial) {
        const currentNumber = parseInt(lastMaterial.materialCode.split('-')[1]);
        nextNumber = currentNumber + 1;
      }
      materialCode = `OT-${String(nextNumber).padStart(3, '0')}`;
    } else if (category.name === 'シート') {
      // シートカテゴリの場合、SH-XXX形式
      const lastMaterial = await prisma.material.findFirst({
        where: {
          materialCode: { startsWith: 'SH-' }
        },
        orderBy: { materialCode: 'desc' }
      });
      
      let nextNumber = 1;
      if (lastMaterial) {
        const currentNumber = parseInt(lastMaterial.materialCode.split('-')[1]);
        nextNumber = currentNumber + 1;
      }
      materialCode = `SH-${String(nextNumber).padStart(3, '0')}`;
    } else if (category.name === '枠') {
      // 枠カテゴリの場合、WK-XXX形式
      const lastMaterial = await prisma.material.findFirst({
        where: {
          materialCode: { startsWith: 'WK-' }
        },
        orderBy: { materialCode: 'desc' }
      });
      
      let nextNumber = 1;
      if (lastMaterial) {
        const currentNumber = parseInt(lastMaterial.materialCode.split('-')[1]);
        nextNumber = currentNumber + 1;
      }
      materialCode = `WK-${String(nextNumber).padStart(3, '0')}`;
    } else {
      // その他のカテゴリはとりあえずOT-形式
      materialCode = `OT-001`;
    }

    const newMaterial = await prisma.material.create({
      data: {
        materialCode,
        name,
        categoryId,
        size: size || null,
        type: type || '標準',
        weightKg: parseFloat(weightKg),
        notes: notes || null,
        isActive: true
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(newMaterial, { status: 201 });
  } catch (error) {
    console.error('材料作成エラー:', error);
    return NextResponse.json(
      { error: '材料の作成に失敗しました' },
      { status: 500 }
    );
  }
}