<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductStaticConfig;
use App\Models\ProductConfig;
use App\Models\ProductConfigOption;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use App\Http\Requests\StoreProductFullRequest;
use App\Http\Requests\ProductUpdateRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Cloudinary\Configuration\Configuration;
use Cloudinary\Api\Upload\UploadApi;

class ProductController extends Controller
{
    // --- PRIVATE HELPERS (FastAPI Helping Funcs Alternative) ---

    private function uploadImage($file)
    {
        if (!$file || !$file->isValid()) {
            return null;
        }

        try {
            // Fetching via central configuration falling back to runtime environment definitions
            $cloudName = config('cloudinary.cloud_name') ?? env('CLOUD_NAME');
            $apiKey    = config('cloudinary.api_key') ?? env('API_KEY');
            $apiSecret = config('cloudinary.api_secret') ?? env('CLOUDINARY_SECRET_KEY');

            Configuration::instance([
                'cloud' => [
                    'cloud_name' => $cloudName,
                    'api_key'    => $apiKey,
                    'api_secret' => $apiSecret,
                ],
                'url' => [
                    'secure' => true
                ]
            ]);

            $uploadApi = new UploadApi();
            
            $response = $uploadApi->upload($file->getRealPath(), [
                'folder' => 'cossack_products'
            ]);

            return $response['secure_url'];
            
        } catch (\Exception $e) {
            Log::error('Cloudinary Upload Utility Failed: ' . $e->getMessage());
            return null;
        }
    }

    private function loadProduct($productId, $isDel = false)
    {
        return Product::with([
            'category',
            'staticConfigs',
            'configs.options',
            'variants.images'
        ])->where('id', $productId)->where('is_deleted', $isDel)->first();
    }

    private function getActiveCategory($categoryId)
    {
        return Category::where('id', $categoryId)->where('is_deleted', false)->first();
    }

    // --- CORE ROUTES METHODS ---

    // GET / (List Admin Products)
    public function list_admin_products(Request $request)
    {
        $isDeleted = $request->query('is_deleted', false);
        $isDeleted = filter_var($isDeleted, FILTER_VALIDATE_BOOLEAN);

        $products = Product::with([
            'category',
            'staticConfigs',
            'configs.options',
            'variants.images'
        ])->where('is_deleted', $isDeleted)->get();

        return response()->json($products);
    }

    // POST /full (Create Full Product with Nested Tree)
    public function create_product_full(StoreProductFullRequest $request)
    {
        $validatedData = $request->validated();

        DB::beginTransaction();
        try {
            // 1. Handle base image upload if exists
            $baseImageUrl = null;
            if ($request->hasFile('base_image')) {
                $baseImageUrl = $this->uploadImage($request->file('base_image'));
            }

            // 2. Create main product record
            $product = Product::create([
                'name'        => $validatedData['name'],
                'description' => $validatedData['description'],
                'base_price'  => $validatedData['base_price'],
                'category_id' => $validatedData['category_id'],
                'base_image'  => $baseImageUrl,
            ]);

            // 3. Handle Static Configs
            if (isset($validatedData['static_configs'])) {
                foreach ($validatedData['static_configs'] as $sConfig) {
                    ProductStaticConfig::create([
                        'product_id' => $product->id,
                        'key'        => $sConfig['key'],
                        'value'      => $sConfig['value']
                    ]);
                }
            }

            // 4. Handle Dynamic Configs & Options
            if (isset($validatedData['dynamic_configs'])) {
                foreach ($validatedData['dynamic_configs'] as $dConfig) {
                    $configRecord = ProductConfig::create([
                        'product_id' => $product->id,
                        'name'       => $dConfig['name'],
                        'type'       => $dConfig['type'] ?? 'custom'
                    ]);

                    if (isset($dConfig['options'])) {
                        foreach ($dConfig['options'] as $option) {
                            ProductConfigOption::create([
                                'config_id'        => $configRecord->id,
                                'value'             => $option['value'],
                                'price_modifier'    => $option['price_modifier'] ?? 0.00
                            ]);
                        }
                    }
                }
            }

            // 5. Handle Variants and Variant Images (Sequential File Pointer Matrix Fix)
            $variantFiles = $request->file('variant_images') ?? [];
            if (!is_array($variantFiles)) {
                $variantFiles = [$variantFiles];
            }

            $fileIteratorIndex = 0;

            foreach ($validatedData['variants'] as $vData) {
                $variant = ProductVariant::create([
                    'product_id'     => $product->id,
                    'color'          => $vData['color'],
                    'stock'          => $vData['stock'],
                    'price_modifier' => $vData['price_modifier'] ?? 0.00
                ]);

                if (isset($vData['images']) && is_array($vData['images'])) {
                    foreach ($vData['images'] as $imgData) {
                        if (isset($variantFiles[$fileIteratorIndex])) {
                            $currentFile = $variantFiles[$fileIteratorIndex];
                            
                            $uploadedUrl = $this->uploadImage($currentFile);

                            if ($uploadedUrl) {
                                ProductImage::create([
                                    'variant_id'  => $variant->id,
                                    'image_url'   => $uploadedUrl,
                                    'is_primary'  => $imgData['is_primary'] ?? false
                                ]);
                            }
                            $fileIteratorIndex++;
                        }
                    }
                }
            }

            DB::commit();

            $fullProduct = $this->loadProduct($product->id);
            return response()->json($fullProduct, 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['detail' => 'Failed to create product: ' . $e->getMessage()], 500);
        }
    }

    // PUT /{product_id} (Update Product Ecosystem)
    public function update_product(Request $request, $productId)
{
    // Load existing database mapping tree
    $product = $this->loadProduct($productId);
    if (!$product) {
        return response()->json(['detail' => 'Product not found'], 404);
    }

    // --- CRITICAL POSTMAN FORM-DATA PARSING FIX ---
    // Agar Postman se stringified JSON 'data' field me aa raha hai, to use decode karein
    if ($request->has('data')) {
        $data = json_decode($request->input('data'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return response()->json(['detail' => 'Invalid JSON structure provided in data field.'], 400);
        }
    } else {
        // Fallback agar direct JSON payload aa raha ho
        $data = $request->all();
    }

    $variantFiles = $request->file('variant_images') ?? [];
    if (!is_array($variantFiles)) {
        $variantFiles = [$variantFiles];
    }
    $fileIteratorIndex = 0;

    DB::beginTransaction();
    try {
        // 1. Base Product Base Level Updates
        if (isset($data['name'])) $product->name = $data['name'];
        if (isset($data['description'])) $product->description = $data['description'];
        if (isset($data['base_price'])) $product->base_price = $data['base_price'];
        
        if ($request->hasFile('base_image')) {
            $product->base_image = $this->uploadImage($request->file('base_image'));
        }

        if (!empty($data['category_id'])) {
            if (!$this->getActiveCategory($data['category_id'])) {
                return response()->json(['detail' => 'Category not found or inactive'], 400);
            }
            $product->category_id = $data['category_id'];
        }
        $product->save();

        // 2. Upsert Static Configurations
        if (isset($data['static_configs']) && is_array($data['static_configs'])) {
            foreach ($data['static_configs'] as $cfg) {
                $existing = null;
                if (!empty($cfg['id'])) {
                    $existing = ProductStaticConfig::where('id', $cfg['id'])->where('product_id', $productId)->first();
                } elseif (!empty($cfg['key'])) {
                    $existing = ProductStaticConfig::where('product_id', $productId)->where('key', $cfg['key'])->first();
                }

                if ($existing) {
                    if (isset($cfg['key'])) $existing->key = $cfg['key'];
                    if (isset($cfg['value'])) $existing->value = $cfg['value'];
                    $existing->save();
                } else {
                    if (!empty($cfg['key']) && isset($cfg['value'])) {
                        ProductStaticConfig::create([
                            'product_id' => $productId, 
                            'key'        => $cfg['key'], 
                            'value'      => $cfg['value']
                        ]);
                    }
                }
            }
        }

        // 3. Upsert Dynamic Configs & Options
        if (isset($data['dynamic_configs']) && is_array($data['dynamic_configs'])) {
            foreach ($data['dynamic_configs'] as $cfg) {
                $config = null;
                if (!empty($cfg['id'])) {
                    $config = ProductConfig::where('id', $cfg['id'])->where('product_id', $productId)->first();
                } elseif (!empty($cfg['name'])) {
                    $config = ProductConfig::where('product_id', $productId)->where('name', $cfg['name'])->first();
                }

                if (!$config) {
                    if (empty($cfg['name'])) continue;
                    $config = ProductConfig::create([
                        'product_id' => $productId, 
                        'name'       => $cfg['name'], 
                        'type'       => $cfg['type'] ?? 'custom'
                    ]);
                } else {
                    if (isset($cfg['name'])) $config->name = $cfg['name'];
                    if (isset($cfg['type'])) $config->type = $cfg['type'];
                    $config->save();
                }

                if (!empty($cfg['options']) && is_array($cfg['options'])) {
                    foreach ($cfg['options'] as $opt) {
                        $option = null;
                        if (!empty($opt['id'])) {
                            $option = ProductConfigOption::where('id', $opt['id'])->where('config_id', $config->id)->first();
                        } elseif (!empty($opt['value'])) {
                            $option = ProductConfigOption::where('config_id', $config->id)->where('value', $opt['value'])->first();
                        }

                        if (!$option) {
                            if (empty($opt['value'])) continue;
                            ProductConfigOption::create([
                                'config_id'      => $config->id, 
                                'value'          => $opt['value'], 
                                'price_modifier' => $opt['price_modifier'] ?? 0
                            ]);
                        } else {
                            if (isset($opt['value'])) $option->value = $opt['value'];
                            if (isset($opt['price_modifier'])) $option->price_modifier = $opt['price_modifier'];
                            $option->save();
                        }
                    }
                }
            }
        }

        // 4. Upsert Variants & Images Replacement Matrix
        if (isset($data['variants']) && is_array($data['variants'])) {
            foreach ($data['variants'] as $var) {
                $variant = null;
                if (!empty($var['id'])) {
                    $variant = ProductVariant::where('id', $var['id'])->where('product_id', $productId)->first();
                } elseif (!empty($var['color'])) {
                    $variant = ProductVariant::where('product_id', $productId)->where('color', $var['color'])->first();
                }

                if (!$variant) {
                    if (empty($var['color']) || !isset($var['stock'])) continue;
                    $variant = ProductVariant::create([
                        'product_id'     => $productId, 
                        'color'          => $var['color'], 
                        'stock'          => $var['stock'], 
                        'price_modifier' => $var['price_modifier'] ?? 0
                    ]);
                } else {
                    if (isset($var['color'])) $variant->color = $var['color'];
                    if (isset($var['stock'])) $variant->stock = $var['stock'];
                    if (isset($var['price_modifier'])) $variant->price_modifier = $var['price_modifier'];
                    $variant->save();
                }

                // Strict Image sync if structure is provided
                if (array_key_exists('images', $var) && is_array($var['images'])) {
                    // Syncing process: Delete previous image mapping first
                    ProductImage::where('variant_id', $variant->id)->delete();
                    $imagesArray = $var['images'];
                    $hasPrimary = collect($imagesArray)->contains('is_primary', true);

                    foreach ($imagesArray as $idx => $img) {
                        $imageUrl = $img['image_url'] ?? null;
                        
                        // Sequential lookup in Postman files matrix
                        if (!$imageUrl && isset($variantFiles[$fileIteratorIndex])) {
                            $imageUrl = $this->uploadImage($variantFiles[$fileIteratorIndex]);
                            $fileIteratorIndex++;
                        }

                        if (!$imageUrl) continue;

                        ProductImage::create([
                            'variant_id' => $variant->id,
                            'image_url'  => $imageUrl,
                            'is_primary' => $hasPrimary ? ($img['is_primary'] ?? false) : ($idx === 0)
                        ]);
                    }
                }
            }
        }

        DB::commit();
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['detail' => 'Update execution failed: ' . $e->getMessage()], 500);
    }

    // Clear cache and reload the fresh data from database
    return response()->json($this->loadProduct($productId));
}

    // DELETE /{product_id} (Soft Delete)
    public function delete_product($productId)
    {
        $product = $this->loadProduct($productId);
        if (!$product) {
            return response()->json(['detail' => 'Product not found'], 404);
        }

        $product->is_deleted = true;
        $product->save();

        return response()->json(['detail' => 'Product soft-deleted successfully']);
    }

    // POST /{product_id}/restore (Restore Product)
    public function restore_product($productId)
    {
        $product = $this->loadProduct($productId, true);
        if (!$product) {
            return response()->json(['detail' => 'Deleted product not found'], 404);
        }

        $product->is_deleted = false;
        $product->save();

        return response()->json($product);
    }

    public function list_user_products()
    {
        $products = Product::with([
            'category',
            'staticConfigs',
            'configs.options',
            'variants.images'
        ])
        ->where('is_deleted', false)
        ->whereHas('category', function ($query) {
            $query->where('is_deleted', false);
        })
        ->get();

        return response()->json($products);
    }

    public function get_public_product($productId)
    {
        $product = Product::with([
            'category',
            'staticConfigs',
            'configs.options',
            'variants.images'
        ])
        ->where('id', $productId)
        ->where('is_deleted', false)
        ->whereHas('category', function ($query) {
            $query->where('is_deleted', false);
        })
        ->first();

        if (!$product) {
            return response()->json(['detail' => 'Product not found'], 404);
        }

        return response()->json($product);
    }
}