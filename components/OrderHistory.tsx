"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, Search, Calendar } from 'lucide-react';

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  deliveryDate: string;
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

export default function OrderHistory() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = 
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const orderDate = new Date(order.createdAt);
        const today = new Date();
        if (dateFilter === 'today') {
          matchesDate = orderDate.toDateString() === today.toDateString();
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= monthAgo;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const handleView = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleDownload = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      pending: { label: '処理中', variant: 'secondary' },
      completed: { label: '完了', variant: 'default' },
      cancelled: { label: 'キャンセル', variant: 'destructive' },
    };
    
    const config = statusConfig[status] || { label: status, variant: 'outline' as const };
    return <Badge>{config.label}</Badge>;
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{backgroundColor: '#f9fafb', color: '#111827'}}>
      <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">発注書履歴</CardTitle>
          <CardDescription>
            過去の発注書を確認・ダウンロードできます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* 検索欄 */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    placeholder="現場名または発注番号で検索..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
                
                {/* フィルター */}
                <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[140px] h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white">
                      <SelectValue placeholder="ステータス" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 shadow-lg">
                      <SelectItem value="all" className="hover:bg-gray-50">すべて</SelectItem>
                      <SelectItem value="pending" className="hover:bg-gray-50">処理中</SelectItem>
                      <SelectItem value="completed" className="hover:bg-gray-50">完了</SelectItem>
                      <SelectItem value="cancelled" className="hover:bg-gray-50">キャンセル</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-full sm:w-[140px] h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                        <SelectValue placeholder="期間" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 shadow-lg">
                      <SelectItem value="all" className="hover:bg-gray-50">すべて</SelectItem>
                      <SelectItem value="today" className="hover:bg-gray-50">今日</SelectItem>
                      <SelectItem value="week" className="hover:bg-gray-50">過去7日間</SelectItem>
                      <SelectItem value="month" className="hover:bg-gray-50">過去30日間</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* 検索結果数表示 */}
              {searchTerm && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    「{searchTerm}」の検索結果: {filteredOrders.length}件
                  </p>
                </div>
              )}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">発注書が見つかりません</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200">
                    <TableHead className="font-semibold text-gray-900 py-4">発注番号</TableHead>
                    <TableHead className="font-semibold text-gray-900 py-4">現場名</TableHead>
                    <TableHead className="font-semibold text-gray-900 py-4">納品日</TableHead>
                    <TableHead className="text-right font-semibold text-gray-900 py-4">合計重量</TableHead>
                    <TableHead className="font-semibold text-gray-900 py-4">ステータス</TableHead>
                    <TableHead className="font-semibold text-gray-900 py-4">作成日</TableHead>
                    <TableHead className="text-right font-semibold text-gray-900 py-4">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0">
                      <TableCell className="font-medium text-gray-900 py-4">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="text-gray-700 py-4">{order.customerName}</TableCell>
                      <TableCell className="text-gray-700 py-4">
                        {format(new Date(order.deliveryDate), 'yyyy年M月d日', { locale: ja })}
                      </TableCell>
                      <TableCell className="text-right text-gray-700 py-4 font-medium">
                        {order.totalWeight.toFixed(1)}kg
                      </TableCell>
                      <TableCell className="py-4">{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-gray-700 py-4">
                        {format(new Date(order.createdAt), 'yyyy/MM/dd', { locale: ja })}
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(order.id)}
                            className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-100"
                          >
                            <Eye className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(order.id)}
                            className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-100"
                          >
                            <Download className="h-4 w-4 text-gray-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  );
}