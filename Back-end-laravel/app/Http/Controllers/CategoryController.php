<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Http\Requests\StoreCategoryRequest;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // Helper function like _get_category_or_404
    private function getCategoryOr404($id)
    {
        $category = Category::where('id', $id)
            ->where('is_deleted', false)
            ->first();

        if (!$category) {
            // FastAPI jaisa 404 response
            abort(response()->json(['detail' => 'Category not found'], 404));
        }

        return $category;
    }

    // 1. GET ALL CATEGORIES
    public function get_categories()
    {
        $categories = Category::where('is_deleted', false)->get(['id', 'name']);
        return response()->json($categories, 200);
    }

    // 2. GET CATEGORY BY ID
    public function get_category_by_id($id)
    {
        $category = $this->getCategoryOr404($id);
        return response()->json([
            'id' => $category->id,
            'name' => $category->name
        ], 200);
    }

    // 3. CREATE CATEGORY (Admin Only)
    public function create_category(StoreCategoryRequest $request)
    {
        // Duplicate check karne k liye
        $existing = Category::where('name', $request->name)
            ->where('is_deleted', false)
            ->first();

        if ($existing) {
            return response()->json(['detail' => 'Category name already exists'], 400);
        }

        $category = Category::create([
            'name' => $request->name,
            'is_deleted' => false,
            'created_at' => now()
        ]);

        return response()->json([
            'message' => 'Category created successfully',
            'category' => [
                'created_at' => $category->created_at,
                'id' => $category->id,
                'name' => $category->name,
                'is_deleted' => $category->is_deleted
            ]
        ], 200);
    }

    // 4. UPDATE CATEGORY (Admin Only)
    public function update_category(StoreCategoryRequest $request, $id)
    {
        $category = $this->getCategoryOr404($id);

        $category->name = $request->name;
        $category->save();

        return response()->json([
            'message' => 'Category updated successfully',
            'category' => [
                'id' => $category->id,
                'name' => $category->name
            ]
        ], 200);
    }

    // 5. DELETE CATEGORY (Soft Delete - Admin Only)
    public function delete_category($id)
    {
        // Yahan query raw isliye rakhi takay manually check ho sakay if already soft deleted
        $category = Category::where('id', $id)->first();

        if (!$category || $category->is_deleted) {
            return response()->json(['detail' => 'Category not found'], 404);
        }

        $category->is_deleted = true;
        $category->save();

        return response()->json(['message' => 'Category deleted successfully'], 200);
    }
}
