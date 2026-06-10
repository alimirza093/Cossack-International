<?php

namespace App\Http\Controllers;

use App\Http\Requests\cart\createRequest;
use App\Http\Requests\cart\updateQuantityRequest;
use App\Http\Resources\cart\cartResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductConfig;
use App\Models\ProductConfigOption;
use App\Models\ProductVariant;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function getCart()
    {
        $user = auth()->user();

        $cart = Cart::with([
            'items.product.category',
            'items.product.staticConfigs',
            'items.product.configs.options',
            'items.product.variants.images',
            'items.variant',
        ])->where('user_id', $user->id)->first();

        if (!$cart) {
            return response()->json([
                'user_id' => $user->id,
                'grand_total' => 0,
                'items' => []
            ]);
        }

        return new cartResource($cart);

    }

    public function addToCart(createRequest $request)
    {
        $user = auth()->user();

        return DB::transaction(function () use ($request, $user) {
            $product = Product::where('id', $request->product_id)->where('is_deleted', false)->first();

            if (!$product) {
                throw new HttpResponseException(
                    response()->json([
                        'detail' => 'Not such product stored'
                    ], 404)
                );
            }

            $variant = ProductVariant::where('id', $request->variant_id)->where('product_id', $product->id)->first();

            if (!$variant) {
                throw new HttpResponseException(
                    response()->json([
                        'detail' => 'No such product variant exists'
                    ], 404)
                );
            }

            $selectedOptionsJson = [];
            $largestConfigModifier = 0.00;

            foreach (($request->selected_options ?? []) as $selOpt) {
                $config = ProductConfig::where('id', $selOpt['config_id'])->where('product_id', $product->id)->first();

                if (!$config) {
                    throw new HttpResponseException(
                        response()->json([
                            'detail' => 'Not such configuration exist'
                        ], 404)
                    );
                }

                $option = ProductConfigOption::where('id', $selOpt['option_id'])->where('config_id', $config->id)->first();

                if (!$option) {
                    throw new HttpResponseException(
                        response()->json([
                            'detail' => 'Not such option exist'
                        ], 404)
                    );
                }

                $selectedOptionsJson[] = [
                    'config_id' => (string) $config->id,
                    'config_name' => $config->name,
                    'option_id' => (string) $option->id,
                    'option_value' => $option->value,
                    'price_modifier' => $option->price_modifier,
                ];

                if ($option->price_modifier > $largestConfigModifier) {
                    $largestConfigModifier = $option->price_modifier;
                }
            }

            usort($selectedOptionsJson, function ($a, $b) {
                return [$a['config_id'], $a['option_id']]
                    <=>
                    [$b['config_id'], $b['option_id']];
            });

            $cart = Cart::firstOrCreate(
                ['user_id' => $user->id],
                ['grand_total' => 0]
            );

            $existingItems = CartItem::where('cart_id', $cart->id)
                ->where('product_id', $product->id)
                ->where('variant_id', $variant->id)
                ->get();

            $matchingItem = null;

            foreach ($existingItems as $item) {

                $existingOptions = $item->selected_options ?? [];

                usort($existingOptions, function ($a, $b) {
                    return [$a['config_id'], $a['option_id']]
                        <=>
                        [$b['config_id'], $b['option_id']];
                });

                if ($existingOptions == $selectedOptionsJson) {
                    $matchingItem = $item;
                    break;
                }
            }

            $variantModifier = $variant->price_modifier ?? 0.00;

            $finalPrice = $product->base_price +
                max($variantModifier, $largestConfigModifier);

            if ($matchingItem) {

                $newQuantity = $matchingItem->quantity + $request->quantity;

                if ($newQuantity > $variant->stock) {
                    throw new HttpResponseException(
                        response()->json([
                            'detail' => "Only {$variant->stock} units available"
                        ], 400)
                    );
                }

                $matchingItem->update([
                    'quantity' => $newQuantity,
                    'final_price' => $finalPrice,
                    'item_total' => $finalPrice * $newQuantity,
                ]);

            } else {

                if ($request->quantity > $variant->stock) {
                    throw new HttpResponseException(
                        response()->json([
                            'detail' => "Only {$variant->stock} units available"
                        ], 400)
                    );
                }

                CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $product->id,
                    'variant_id' => $variant->id,
                    'selected_options' => $selectedOptionsJson,
                    'quantity' => $request->quantity,
                    'final_price' => $finalPrice,
                    'item_total' => $finalPrice * $request->quantity,
                ]);
            }

            $cart->update([
                'grand_total' => $cart->items()->sum('item_total')
            ]);

            return response()->json([
                'message' => 'Product added to cart',
                'grand_total' => $cart->fresh()->grand_total,
                'cart_id' => $cart->id,
            ], 201);

        });

    }

    public function delCart(string $cartItemId)
    {
        $user = auth()->user();

        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            return response()->json([
                'detail' => 'Cart not found for this user'
            ], 404);
        }

        $cartItem = CartItem::where('id', $cartItemId)
            ->where('cart_id', $cart->id)
            ->first();

        if (!$cartItem) {
            return response()->json([
                'detail' => 'Cart item not found'
            ], 404);
        }

        $cartItem->delete();

        $cart->update([
            'grand_total' => $cart->items()->sum('item_total')
        ]);

        return response()->json([
            'message' => 'Item removed successfully',
            'grand_total' => $cart->fresh()->grand_total,
        ]);
    }

    public function clearCart()
    {
        $user = auth()->user();

        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            return response()->json([
                'detail' => 'Cart not found for this user'
            ], 404);
        }

        $cart->items()->delete();

        $cart->update([
            'grand_total' => 0.00
        ]);

        return response()->json([
            'message' => 'Cart cleared successfully',
            'grand_total' => $cart->fresh()->grand_total,
        ]);

    }

    public function updateQuantity(updateQuantityRequest $request, string $cartItemId)
    {
        $user = auth()->user();

        $cart = Cart::where('user_id', $user->id)->first();
        if (!$cart) {
            return response()->json([
                'detail' => 'Cart not found'
            ], 404);
        }

        $cartItem = CartItem::with('variant')
            ->where('id', $cartItemId)
            ->where('cart_id', $cart->id)
            ->first();
        if (!$cartItem) {
            return response()->json([
                'detail' => 'Cart item not found'
            ], 404);
        }

        if (!$cartItem->variant) {
            return response()->json([
                'detail' => 'Variant not found'
            ], 404);
        }

        if ($request->quantity > $cartItem->variant->stock) {
            return response()->json([
                'detail' => "Only {$cartItem->variant->stock} units available"
            ], 400);
        }

        $cartItem->update([
            'quantity' => $request->quantity,
            'item_total' => $cartItem->final_price * $request->quantity,
        ]);

        $cart->update([
            'grand_total' => $cart->items()->sum('item_total')
        ]);

        return response()->json([
            'message' => 'Quantity updated successfully',
            'cart_item_id' => $cartItem->id,
            'quantity' => $cartItem->fresh()->quantity,
            'item_total' => $cartItem->fresh()->item_total,
            'grand_total' => $cart->fresh()->grand_total,
        ]);
    }

}
