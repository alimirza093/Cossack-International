<?php

namespace App\Http\Controllers;

use App\Http\Requests\order\createOrderRequest;
use App\Http\Resources\order\orderOutResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{

    public function createOrder(createOrderRequest $request)
    {
        $user = auth()->user();

        return DB::transaction(function () use ($request, $user) {

            $cart = Cart::with('items.variant')
                ->where('user_id', $user->id)
                ->first();

            if (!$cart) {
                throw new HttpResponseException(
                    response()->json([
                        'detail' => 'Cart not found'
                    ], 404)
                );
            }

            $selectedItems = CartItem::with([
                'product.category',
                'variant'
            ])
                ->where('cart_id', $cart->id)
                ->whereIn('id', $request->cart_item_ids)
                ->get();

            if (
                $selectedItems->count() !==
                count(array_unique($request->cart_item_ids))
            ) {
                throw new HttpResponseException(
                    response()->json([
                        'detail' => 'One or more cart items not found'
                    ], 404)
                );
            }

            $orderTotal = 0;

            foreach ($selectedItems as $item) {

                if (!$item->product) {
                    throw new HttpResponseException(
                        response()->json([
                            'detail' => 'Product no longer exists'
                        ], 400)
                    );
                }

                if (!$item->variant) {
                    throw new HttpResponseException(
                        response()->json([
                            'detail' => 'Variant no longer exists'
                        ], 400)
                    );
                }

                if ($item->quantity > $item->variant->stock) {
                    throw new HttpResponseException(
                        response()->json([
                            'detail' => "Only {$item->variant->stock} units available for {$item->variant->color}"
                        ], 400)
                    );
                }

                $orderTotal += $item->item_total;
            }

            $order = Order::create([
                'user_id' => $user->id,
                'total_price' => $orderTotal,
                'delivery_address' => trim($request->delivery_address),
                'payment_method' => 'cash_on_delivery',
                'status' => 'pending',
            ]);

            foreach ($selectedItems as $item) {

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'selected_options' => $item->selected_options,
                    'quantity' => $item->quantity,
                    'final_price' => $item->final_price,
                    'item_total' => $item->item_total,
                ]);

                $item->variant->decrement(
                    'stock',
                    $item->quantity
                );
            }

            CartItem::whereIn(
                'id',
                $request->cart_item_ids
            )->delete();

            $cart->update([
                'grand_total' => $cart->items()->sum('item_total')
            ]);

            $order->load([
                'items.product.category',
                'items.product.staticConfigs',
                'items.product.configs.options',
                'items.product.variants.images',
                'items.variant',
            ]);

            return new orderOutResource($order);
        });
    }

    public function getMyOrders()
    {
        $orders = Order::with([
            'items.product.category',
            'items.product.staticConfigs',
            'items.product.configs.options',
            'items.product.variants.images',
            'items.variant',
        ])
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        return orderOutResource::collection($orders);
    }

    public function getOrder(string $orderId)
    {
        $order = Order::with([
            'items.product.category',
            'items.product.staticConfigs',
            'items.product.configs.options',
            'items.product.variants.images',
            'items.variant',
        ])
            ->where('id', $orderId)
            ->where('user_id', auth()->id())
            ->first();

        if (!$order) {
            throw new HttpResponseException(
                response()->json([
                    'detail' => 'Order not found'
                ], 404)
            );
        }

        return new orderOutResource($order);
    }
}
