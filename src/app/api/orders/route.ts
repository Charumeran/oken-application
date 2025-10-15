import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { randomBytes } from 'crypto';

export async function GET() {
  try {
    const currentUser = await requireAuth();
    
    const orders = await prisma.order.findMany({
      where: {
        userId: currentUser.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        orderDetails: {
          include: {
            material: true
          }
        }
      }
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.projectName,
      customerAddress: order.personInCharge || '',
      loadingDate: order.loadingDate,
      deliveryDate: order.deliveryDate || order.orderDate,
      totalWeight: order.orderDetails.reduce((sum, detail) => 
        sum + (detail.totalWeightKg || (detail.quantity * detail.material.weightKg)), 0
      ),
      status: order.status,
      createdAt: order.createdAt,
      items: order.orderDetails.map((detail) => ({
        productName: detail.material.name,
        quantity: detail.quantity,
        weightPerUnit: detail.material.weightKg,
        totalWeight: detail.totalWeightKg || (detail.quantity * detail.material.weightKg)
      }))
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    
    if (error instanceof Error && error.message === '認証が必要です') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();
    const data = await request.json();

    console.log('Received order data:', JSON.stringify(data, null, 2));

    // ユーザー名 + ランダムなユニークIDで注文番号を生成
    const uniqueId = randomBytes(4).toString('hex').toUpperCase();
    const orderNumber = `${currentUser.username.toUpperCase()}-${uniqueId}`;

    const order = await prisma.order.create({
        data: {
          orderNumber: orderNumber,
          userId: currentUser.id,
          projectName: data.projectName || 'プロジェクト',
          personInCharge: data.personInCharge,
          contactInfo: data.contactInfo || null,
          loadingDate: data.loadingDate ? new Date(data.loadingDate) : null,
          orderDate: new Date(data.orderDate || new Date()),
          deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
          status: data.status || 'draft',
          notes: data.notes || null,
          orderDetails: {
            create: data.items?.map((item: { materialId: string; quantity: number; totalWeightKg: number; notes: string | null }) => ({
              materialId: item.materialId,
              quantity: item.quantity,
              totalWeightKg: item.totalWeightKg,
              notes: item.notes
            })) || []
          }
        },
        include: {
          orderDetails: {
            include: {
              material: true
            }
          }
        }
      });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    
    if (error instanceof Error && error.message === '認証が必要です') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await requireAuth();
    const data = await request.json();
    const { orderId, ...updateData } = data;
    
    console.log('Updating order:', orderId, JSON.stringify(updateData, null, 2));
    
    // ユーザーがこの注文の所有者であることを確認
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });
    
    if (!existingOrder || existingOrder.userId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Order not found or access denied' },
        { status: 404 }
      );
    }
    
    // 既存の注文詳細を削除
    await prisma.orderDetail.deleteMany({
      where: { orderId: orderId }
    });
    
    // 注文を更新
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        projectName: updateData.projectName || 'プロジェクト',
        personInCharge: updateData.personInCharge,
        contactInfo: updateData.contactInfo || null,
        loadingDate: updateData.loadingDate ? new Date(updateData.loadingDate) : null,
        orderDate: new Date(updateData.orderDate || new Date()),
        deliveryDate: updateData.deliveryDate ? new Date(updateData.deliveryDate) : null,
        status: updateData.status || 'draft',
        notes: updateData.notes || null,
        orderDetails: {
          create: updateData.items?.map((item: { materialId: string; quantity: number; totalWeightKg: number; notes: string | null }) => ({
            materialId: item.materialId,
            quantity: item.quantity,
            totalWeightKg: item.totalWeightKg,
            notes: item.notes
          })) || []
        }
      },
      include: {
        orderDetails: {
          include: {
            material: true
          }
        }
      }
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error updating order:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    
    if (error instanceof Error && error.message === '認証が必要です') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}