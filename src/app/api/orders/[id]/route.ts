import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const order = await prisma.order.findUnique({
      where: {
        id: resolvedParams.id
      },
      include: {
        orderDetails: {
          include: {
            material: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const formattedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.projectName,
      customerAddress: order.personInCharge || '',
      deliveryDate: order.deliveryDate || order.orderDate,
      shippingAddress: order.notes || '',
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
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}