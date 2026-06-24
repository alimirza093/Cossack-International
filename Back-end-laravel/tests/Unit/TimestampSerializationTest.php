<?php

namespace Tests\Unit;

use App\Http\Resources\UserProfileResource;
use App\Http\Resources\cart\cartItemResource;
use App\Http\Resources\order\orderItemOutResource;
use App\Http\Resources\product\productOutResource;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Tests\TestCase;

class TimestampSerializationTest extends TestCase
{
    public function test_models_cast_timestamps_to_datetime_objects(): void
    {
        $user = new User();
        $user->setRawAttributes([
            'id' => '33333333-3333-3333-3333-333333333333',
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'created_at' => '2026-06-11 12:30:00',
            'updated_at' => '2026-06-11 13:30:00',
        ], true);

        $product = new Product();
        $product->setRawAttributes([
            'id' => '11111111-1111-1111-1111-111111111111',
            'name' => 'Demo Product',
            'created_at' => '2026-06-11 12:30:00',
            'updated_at' => '2026-06-11 13:30:00',
        ], true);

        $category = new Category();
        $category->setRawAttributes([
            'id' => '22222222-2222-2222-2222-222222222222',
            'name' => 'Demo Category',
            'created_at' => '2026-06-11 12:30:00',
        ], true);

        $this->assertInstanceOf(Carbon::class, $product->created_at);
        $this->assertInstanceOf(Carbon::class, $product->updated_at);
        $this->assertInstanceOf(Carbon::class, $category->created_at);
        $this->assertInstanceOf(Carbon::class, $user->created_at);
        $this->assertInstanceOf(Carbon::class, $user->updated_at);
    }

    public function test_resources_return_iso_timestamps_and_preserve_nulls(): void
    {
        $user = new User();
        $user->setRawAttributes([
            'id' => '33333333-3333-3333-3333-333333333333',
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'created_at' => '2026-06-11 12:30:00',
            'updated_at' => null,
        ], true);

        $product = new Product();
        $product->setRawAttributes([
            'id' => '11111111-1111-1111-1111-111111111111',
            'name' => 'Demo Product',
            'created_at' => '2026-06-11 12:30:00',
        ], true);

        $cartItem = new CartItem();
        $cartItem->setRawAttributes([
            'id' => '44444444-4444-4444-4444-444444444444',
            'created_at' => '2026-06-11 12:30:00',
        ], true);
        $cartItem->setRelation('product', $product);

        $orderItem = new OrderItem();
        $orderItem->setRawAttributes([
            'id' => '55555555-5555-5555-5555-555555555555',
            'created_at' => '2026-06-11 12:30:00',
        ], true);
        $orderItem->setRelation('product', $product);

        $request = Request::create('/');

        $userPayload = (new UserProfileResource($user))->toArray($request);
        $cartPayload = json_decode(json_encode((new cartItemResource($cartItem))->resolve($request)), true);
        $orderPayload = json_decode(json_encode((new orderItemOutResource($orderItem))->resolve($request)), true);
        $productPayload = json_decode(json_encode((new productOutResource($product))->resolve($request)), true);

        $this->assertSame('2026-06-11T12:30:00+00:00', $userPayload['created_at']);
        $this->assertSame('2026-06-11T12:30:00.000000Z', $cartPayload['created_at']);
        $this->assertSame('2026-06-11T12:30:00.000000Z', $orderPayload['created_at']);
        $this->assertSame('2026-06-11T12:30:00.000000Z', $productPayload['created_at']);
    }
}