import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
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
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // 注文番号を生成
    const count = await prisma.order.count();
    const orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`;
    
    const order = await prisma.order.create({
      data: {
        orderNumber: orderNumber,
        projectName: data.projectName || 'プロジェクト',
        personInCharge: data.personInCharge,
        orderDate: new Date(data.orderDate || new Date()),
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        status: data.status || 'draft',
        notes: data.notes,
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
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}