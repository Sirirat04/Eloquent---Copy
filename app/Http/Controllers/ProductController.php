<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index()
    {
        return Product::all();
    }
    public function manager()
    {
        return inertia('ProductManager'); // ใช้ Inertia.js ถ้าใช้ React/Vue
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'category_id' => 'required|integer',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'image_url' => 'nullable|string|url',
        ]);

        $product = new Product();
        $product->name = $request->name;
        $product->price = $request->price;
        $product->category_id = $request->category_id;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('images', 'public');
            $product->image_url = Storage::url($imagePath);
        } else {
            $product->image_url = $request->image_url;
        }

        $product->save();

        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric',
            'category_id' => 'sometimes|required|integer',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'image_url' => 'nullable|string|url',
        ]);

        $product = Product::findOrFail($id);

        // ✅ ถ้ามีการอัปโหลดไฟล์ใหม่ให้ใช้ไฟล์
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validatedData['image_url'] = asset("storage/$path");
        }

        // ✅ ถ้าไม่มีไฟล์ใหม่ ให้ใช้ URL เดิม
        if (!$request->hasFile('image') && !$request->filled('image_url')) {
            unset($validatedData['image_url']);
        }

        // ✅ บันทึกเฉพาะค่าที่ถูกส่งมา
        $product->update($validatedData);

        return response()->json(['message' => 'Product updated successfully!', 'product' => $product], 200);
    }


    public function destroy($id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found!'], 404);
        }

        $product->delete(); // ลบสินค้า
        return response()->json(['message' => 'Product deleted successfully!'], 200);
    }
}
