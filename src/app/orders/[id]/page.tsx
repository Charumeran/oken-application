"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Printer } from 'lucide-react';

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerAddress: string;
  deliveryDate: string;
  shippingAddress: string;
  totalWeight: number;
  status: string;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    weightPerUnit: number;
    totalWeight: number;
  }>;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrderDetail(params.id as string);
    }
  }, [params.id]);

  const fetchOrderDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!order) return;
    
    try {
      const response = await fetch(`/api/orders/${order.id}/download`);
      if (!response.ok) throw new Error('Failed to download');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-${order.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading order:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">発注書が見つかりません</p>
            <Button
              className="mt-4"
              onClick={() => router.push('/order-history')}
            >
              履歴に戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      pending: { label: '処理中', variant: 'secondary' },
      completed: { label: '完了', variant: 'default' },
      cancelled: { label: 'キャンセル', variant: 'destructive' },
    };
    
    const config = statusConfig[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant as "default" | "secondary" | "outline" | "destructive"}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{backgroundColor: '#f9fafb', color: '#111827'}}>
      <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => router.push('/order-history')}
          className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          履歴に戻る
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Printer className="h-4 w-4" />
            印刷
          </Button>
          <Button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            PDFダウンロード
          </Button>
        </div>
      </div>

        <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">発注書詳細</CardTitle>
              <CardDescription>
                発注番号: {order.orderNumber}
              </CardDescription>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">発注情報</h3>
              <div className="space-y-2">
                <p><span className="text-gray-600">現場名:</span> {order.customerName}</p>
                <p><span className="text-gray-600">担当者:</span> {order.customerAddress}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">配送情報</h3>
              <div className="space-y-2">
                <p>
                  <span className="text-gray-600">納品日:</span>{' '}
                  {format(new Date(order.deliveryDate), 'yyyy年M月d日', { locale: ja })}
                </p>
                <p><span className="text-gray-600">配送先:</span> {order.shippingAddress}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">注文商品</h3>
            <div className="rounded-md border">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4">商品名</th>
                    <th className="text-right p-4">数量</th>
                    <th className="text-right p-4">単位重量(kg)</th>
                    <th className="text-right p-4">合計重量(kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-4">{item.productName}</td>
                      <td className="text-right p-4">{item.quantity}</td>
                      <td className="text-right p-4">{item.weightPerUnit.toFixed(1)}</td>
                      <td className="text-right p-4">{item.totalWeight.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="text-right p-4 font-semibold">
                      合計重量:
                    </td>
                    <td className="text-right p-4 font-semibold text-lg">
                      {order.totalWeight.toFixed(1)}kg
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">
              作成日: {format(new Date(order.createdAt), 'yyyy年M月d日 HH:mm', { locale: ja })}
            </p>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}