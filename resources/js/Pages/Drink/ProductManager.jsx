import React, { useEffect, useState } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { motion } from "framer-motion";

const CATEGORIES = [
    {
        id: "all",
        name: "ทั้งหมด"
    },
    {
        id: "1",
        name: "เครื่องดื่ม",
        subCategories: [
            { id: "1", name: "ไม่มีแอลกอฮอล์" },
            { id: "10", name: "มีแอลกอฮอล์" },
        ],
    },
    {
        id: "2",
        name: "อาหาร",
        subCategories: [
            { id: "2", name: "อาหารจานเดียว" },
            { id: "20", name: "กับข้าว" },
        ],
    },
    {
        id: "3",
        name: "ขนม",
        subCategories: [
            { id: "3", name: "ขนมขบเคี้ยว" },
            { id: "30", name: "เบเกอรี่" },
        ],
    },
];

const ProductForm = ({ product, onSubmit, onCancel, title, submitText }) => {
    const [formData, setFormData] = useState(product);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.category_id) {
            alert("กรุณากรอกข้อมูลให้ครบ");
            return;
        }
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-stone-50 rounded-lg shadow-lg w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-6 text-stone-800">{title}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">ชื่อสินค้า</label>
                        <input
                            name="name"
                            placeholder="กรอกชื่อสินค้า"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">ราคา</label>
                        <input
                            name="price"
                            type="number"
                            placeholder="กรอกราคา"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">หมวดหมู่</label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-white"
                        >
                            <option value="">เลือกหมวดหมู่</option>
                            {CATEGORIES.map(category =>
                                category.subCategories?.map(sub => (
                                    <option key={sub.id} value={sub.id}>
                                        {category.name} - {sub.name}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">URL รูปภาพ</label>
                        <input
                            name="image_url"
                            placeholder="ใส่ URL รูปภาพ"
                            value={formData.image_url}
                            onChange={handleChange}
                            className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-white"
                        />
                    </div>
                    {formData.image_url && (
                        <div className="mt-2 border border-stone-200 rounded-lg p-2">
                            <img
                                src={formData.image_url}
                                alt="Preview"
                                className="w-full h-40 object-contain"
                            />
                        </div>
                    )}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800 transition-colors"
                        >
                            {submitText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CategorySidebar = ({ selectedCategory, onCategorySelect }) => {
    const [expandedCategory, setExpandedCategory] = useState(null);

    return (
        <div className="bg-stone-50 rounded-lg shadow p-4 h-fit lg:sticky lg:top-4">
            <h2 className="text-xl font-bold text-stone-800 mb-4">หมวดหมู่</h2>
            <ul className="space-y-1">
                {CATEGORIES.map((category) => (
                    <li key={category.id}>
                        <button
                            className={`w-full text-left py-2 px-3 rounded-md transition-colors ${category.id === 'all' ? 'bg-stone-700 text-white' : 'hover:bg-stone-200'
                                }`}
                            onClick={() => {
                                if (category.id === "all") {
                                    onCategorySelect("all");
                                } else {
                                    setExpandedCategory(prev => prev === category.id ? null : category.id);
                                }
                            }}
                        >
                            {category.name}
                        </button>
                        {expandedCategory === category.id && category.subCategories && (
                            <ul className="ml-4 mt-1 space-y-1">
                                {category.subCategories.map((sub) => (
                                    <motion.li
                                        key={sub.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <button
                                            className={`w-full text-left py-2 px-3 rounded-md transition-colors ${selectedCategory === sub.id
                                                    ? "bg-stone-200 text-stone-800 font-medium"
                                                    : "hover:bg-stone-100"
                                                }`}
                                            onClick={() => onCategorySelect(sub.id)}
                                        >
                                            {sub.name}
                                        </button>
                                    </motion.li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ProductManager = () => {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get("/api/products");
            setProducts(response.data);
            setError(null);
        } catch (err) {
            setError(err.message || "โหลดสินค้าไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (productData) => {
        try {
            const formData = new FormData();
            Object.entries(productData).forEach(([key, value]) => {
                if (value) formData.append(key, value);
            });

            await axios.post("/api/products", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("เพิ่มสินค้าสำเร็จ!");
            fetchProducts();
            setShowAddModal(false);
        } catch (error) {
            console.error("Error:", error);
            alert("เพิ่มสินค้าไม่สำเร็จ!");
        }
    };

    const handleUpdateProduct = async (productData) => {
        try {
            const formData = new FormData();
            Object.entries(productData).forEach(([key, value]) => {
                if (value) formData.append(key, value);
            });

            await axios.post(`/api/products/${productData.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("แก้ไขสินค้าสำเร็จ!");
            fetchProducts();
            setEditingProduct(null);
        } catch (error) {
            console.error("Error:", error);
            alert("แก้ไขสินค้าไม่สำเร็จ!");
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("คุณต้องการลบรายการสินค้านี้ใช่หรือไม่?")) return;

        try {
            await axios.delete(`/api/products/${id}`);
            alert("ลบสินค้าเรียบร้อย!");
            fetchProducts();
        } catch {
            alert("ลบสินค้าไม่สำเร็จ!");
        }
    };

    const filteredProducts = selectedCategory === "all"
        ? products
        : products.filter(product => product.category_id.toString() === selectedCategory);

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-stone-50">
            <div className="text-xl text-stone-600">กำลังโหลดสินค้า...</div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center h-screen bg-stone-50">
            <div className="text-xl text-red-600">{error}</div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-stone-100 p-4 lg:p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex items-center justify-between mb-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 bg-stone-700 text-white rounded-lg"
                        >
                            {isSidebarOpen ? '✕' : '☰'}
                        </button>
                        <h1 className="text-xl font-bold text-stone-800">จัดการสินค้า</h1>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar - Mobile */}
                        {isSidebarOpen && (
                            <div className="lg:hidden fixed inset-0 bg-white z-40 p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-stone-800">หมวดหมู่</h2>
                                    <button
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="p-2 text-stone-600"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <CategorySidebar
                                    selectedCategory={selectedCategory}
                                    onCategorySelect={(category) => {
                                        setSelectedCategory(category);
                                        setIsSidebarOpen(false);
                                    }}
                                />
                            </div>
                        )}

                        {/* Sidebar - Desktop */}
                        <div className="hidden lg:block w-64">
                            <CategorySidebar
                                selectedCategory={selectedCategory}
                                onCategorySelect={setSelectedCategory}
                            />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="hidden lg:block text-2xl font-bold text-stone-800">จัดการสินค้า</h1>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="w-full lg:w-auto px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span>+</span>
                                    เพิ่มสินค้า
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredProducts.map((product) => (
                                    <motion.div
                                        key={product.id}
                                        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                        whileHover={{ y: -2 }}
                                    >
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="p-4">
                                            <h3 className="font-medium text-stone-800 truncate">
                                                {product.name}
                                            </h3>
                                            <p className="text-stone-600 font-medium mt-1">
                                                ฿{Number(product.price).toLocaleString()}
                                            </p>
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => setEditingProduct(product)}
                                                    className="flex-1 py-2 bg-stone-100 text-stone-700 rounded-md hover:bg-stone-200 transition-colors"
                                                >
                                                    แก้ไข
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="flex-1 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                                >
                                                    ลบ
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showAddModal && (
                <ProductForm
                    product={{ name: "", price: "", category_id: "", image_url: "" }}
                    onSubmit={handleAddProduct}
                    onCancel={() => setShowAddModal(false)}
                    title="เพิ่มสินค้า"
                    submitText="เพิ่มสินค้า"
                />
            )}
            {editingProduct && (
                <ProductForm
                    product={editingProduct}
                    onSubmit={handleUpdateProduct}
                    onCancel={() => setEditingProduct(null)}
                    title="แก้ไขสินค้า"
                    submitText="บันทึก"
                />
            )}
        </AuthenticatedLayout>
    );
};

export default ProductManager;
