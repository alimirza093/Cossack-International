<?php

namespace App\Http\Controllers;

use App\Http\Requests\order\updateOrderStatusRequest;
use App\Http\Resources\order\orderOutResource;
use App\Models\Order;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function getAllOrders()
    {
        $orders = Order::with([
            'items.product.category',
            'items.product.staticConfigs',
            'items.product.configs.options',
            'items.product.variants.images',
            'items.variant',
        ])->latest()->get();

        return orderOutResource::collection($orders);
    }

    public function updateOrderStatus(
        updateOrderStatusRequest $request,
        string $orderId
    ) {
        $order = Order::with([
            'items.product',
            'items.variant',
        ])->find($orderId);

        if (!$order) {
            throw new HttpResponseException(
                response()->json([
                    'detail' => 'Order not found'
                ], 404)
            );
        }

        if ($order->status === 'delivered') {
            throw new HttpResponseException(
                response()->json([
                    'detail' => 'Delivered order cannot be modified'
                ], 400)
            );
        }

        if (
            $request->status === 'cancelled' &&
            $order->status !== 'cancelled'
        ) {
            foreach ($order->items as $item) {
                if ($item->variant) {
                    $item->variant->increment(
                        'stock',
                        $item->quantity
                    );
                }
            }
        }

        $order->update([
            'status' => $request->status
        ]);

        $order->load([
            'items.product.category',
            'items.product.staticConfigs',
            'items.product.configs.options',
            'items.product.variants.images',
            'items.variant',
        ]);

        return new orderOutResource($order);
    }
}
