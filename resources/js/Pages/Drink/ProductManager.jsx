import React, { useEffect, useState } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { motion } from "framer-motion";

const categories = [
    { id: "1", name: "ไม่มีแอลกอฮอล์" },
    { id: "10", name: "มีแอลกอฮอล์" },
    { id: "2", name: "อาหารจานเดียว" },
    { id: "20", name: "กับข้าว" },
    { id: "3", name: "ขนมขบเคี้ยว" },
    { id: "30", name: "เบเกอรี่" },
];

const ProductManager = () => {
    const [selectedCategory, setSelectedCategory] = useState("all"); // ✅ กำหนดค่าเริ่มต้นเป็น "all"
    const [expandedCategory, setExpandedCategory] = useState(null); // ✅ เพิ่ม state สำหรับหมวดหมู่ที่ถูกขยาย

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newProduct, setNewProduct] = useState({
        name: "",
        price: "",
        category_id: "",
        image: null,
        image_url: "",
    });
    const [editingProduct, setEditingProduct] = useState(null);
    const [originalProduct, setOriginalProduct] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        axios
            .get("/api/products")
            .then((response) => setProducts(response.data))
            .catch((err) => setError(err.message || "โหลดสินค้าไม่สำเร็จ"))
            .finally(() => setLoading(false));
    };

    const categories = [
        { id: "all", name: "ทั้งหมด" },
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

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
        setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
    };

    const handleSubCategoryClick = (subCategoryId) => {
        setSelectedCategory(subCategoryId);
    };

    const isExpanded = (categoryId) => expandedCategory === categoryId;

    const filteredProducts =
        selectedCategory === "all"
            ? products
            : products.filter(
                (product) =>
                    product.category_id.toString() === selectedCategory
            );

    const handleDeleteProduct = (id) => {
        if (!window.confirm("คุณต้องการลบรายการสินค้านี้ใช่หรือไม่?")) {
            return; // ถ้ากด "ยกเลิก" จะไม่ทำอะไร
        }

        axios
            .delete(`/api/products/${id}`)
            .then(() => {
                alert("ลบสินค้าเรียบร้อย!");
                fetchProducts(); // 🔄 โหลดข้อมูลใหม่หลังลบ
            })
            .catch(() => alert("ลบสินค้าไม่สำเร็จ!"));
    };

    const handleUpdateProduct = () => {
        if (
            !editingProduct.name ||
            !editingProduct.price ||
            !editingProduct.category_id
        ) {
            alert("กรุณากรอกข้อมูลให้ครบ");
            return;
        }

        const formData = new FormData();

        // ✅ เพิ่มเฉพาะค่าที่มีการเปลี่ยนแปลงเท่านั้น
        if (editingProduct.name !== originalProduct.name) {
            formData.append("name", editingProduct.name);
        }
        if (editingProduct.price !== originalProduct.price) {
            formData.append("price", editingProduct.price);
        }
        if (editingProduct.category_id !== originalProduct.category_id) {
            formData.append("category_id", editingProduct.category_id);
        }

        // ✅ ถ้ามีไฟล์ใหม่ให้ใช้ไฟล์
        if (editingProduct.image) {
            formData.append("image", editingProduct.image);
        }
        // ✅ ถ้าไม่มีไฟล์ใหม่ ให้ใช้ URL เดิม (ถ้าเปลี่ยน URL)
        else if (editingProduct.image_url !== originalProduct.image_url) {
            formData.append("image_url", editingProduct.image_url);
        }

        axios
            .post(`/api/products/${editingProduct.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then(() => {
                alert("แก้ไขสินค้าสำเร็จ!");
                fetchProducts();
                setEditingProduct(null); // ปิดป๊อปอัป
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("แก้ไขสินค้าไม่สำเร็จ!");
            });
    };

    const handleAddProduct = () => {
        if (!newProduct.name || !newProduct.price || !newProduct.category_id) {
            alert("กรุณากรอกข้อมูลให้ครบ");
            return;
        }

        console.log("📸 Image URL:", newProduct.image_url); // ✅ ใช้ newProduct แทน product

        const formData = new FormData();
        formData.append("name", newProduct.name);
        formData.append("price", newProduct.price);
        formData.append("category_id", newProduct.category_id);

        // ✅ ถ้ามีไฟล์รูป ให้ใช้ไฟล์
        if (newProduct.image) {
            formData.append("image", newProduct.image);
        }
        // ✅ ถ้ามี URL ให้ใช้ URL
        else if (newProduct.image_url) {
            formData.append("image_url", newProduct.image_url);
        } else {
            alert("กรุณาเลือกไฟล์รูปหรือใส่ URL รูปภาพ");
            return;
        }

        axios
            .post("/api/products", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then(() => {
                alert("เพิ่มสินค้าสำเร็จ!");
                fetchProducts();
                setNewProduct({
                    name: "",
                    price: "",
                    image: null,
                    image_url: "",
                    category_id: "",
                });
                setShowAddModal(false);
            })
            .catch((error) => {
                console.error("❌ Error:", error);
                alert("เพิ่มสินค้าไม่สำเร็จ!");
            });
    };


    if (loading) return <h2 className="text-center">กำลังโหลดสินค้า...</h2>;
    if (error) return <h2 className="text-center text-red-500">{error}</h2>;

    return (
        <AuthenticatedLayout>
            <div className="flex gap-6 p-6">
                {/* Sidebar หมวดหมู่ */}
                <div className="w-[230px] bg-white shadow-lg rounded-xl p-4 h-screen overflow-y-auto">
                    <h2 className="text-2xl font-bold text-orange-500 mb-3">
                        หมวดหมู่
                    </h2>
                    <ul className="space-y-2">
                        {categories.map((category) => (
                            <li
                                key={category.id}
                                className="py-2 px-3 hover:bg-orange-100 cursor-pointer"
                                onClick={() => handleCategoryClick(category.id)}
                            >
                                {category.name}
                                {/* แสดงหมวดหมู่ย่อยถ้าเป็นหมวดหมู่ที่ถูกเลือก */}
                                {isExpanded(category.id) &&
                                    category.subCategories && (
                                        <ul className="ml-4 mt-1 space-y-1">
                                            {category.subCategories.map(
                                                (sub) => (
                                                    <motion.li
                                                        key={sub.id}
                                                        onClick={() =>
                                                            handleSubCategoryClick(
                                                                sub.id
                                                            )
                                                        } // ✅ ใช้ฟังก์ชันใหม่
                                                        className={`py-1 px-3 rounded-md text-md cursor-pointer transition-all duration-300 ${selectedCategory ===
                                                            sub.id
                                                            ? "bg-orange-200 text-orange-800 font-bold"
                                                            : "hover:bg-orange-100"
                                                            }`}
                                                        whileHover={{
                                                            scale: 1.05,
                                                        }}
                                                        whileTap={{
                                                            scale: 0.95,
                                                        }}
                                                    >
                                                        {sub.name}
                                                    </motion.li>
                                                )
                                            )}
                                        </ul>
                                    )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Content Panel */}
                <div className="flex-1 overflow-y-auto h-screen">
                    <h1 className="text-center text-2xl font-bold mb-4">
                        จัดการสินค้า
                    </h1>
                    <div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-green-500 text-white rounded"
                        >
                            เพิ่มสินค้า
                        </button>

                        {showAddModal && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                <div className="bg-white p-6 rounded shadow-lg w-96">
                                    <h2 className="text-lg font-bold mb-4">
                                        เพิ่มสินค้าใหม่
                                    </h2>

                                    <input
                                        type="text"
                                        placeholder="ชื่อสินค้า"
                                        value={newProduct.name}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                name: e.target.value,
                                            })
                                        }
                                        className="w-full p-2 border rounded mb-2"
                                    />

                                    <input
                                        type="number"
                                        placeholder="ราคา"
                                        value={newProduct.price}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                price: e.target.value,
                                            })
                                        }
                                        className="w-full p-2 border rounded mb-2"
                                    />

                                    <select
                                        value={newProduct.category_id}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                category_id: e.target.value,
                                            })
                                        }
                                        className="w-full p-2 border rounded mb-2"
                                    >
                                        <option value="">เลือกหมวดหมู่</option>
                                        {categories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="mb-2">
                                        <label className="block">
                                            เลือกรูปภาพ (URL)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="ใส่ URL รูปภาพ"
                                            value={newProduct.image_url}
                                            onChange={(e) =>
                                                setNewProduct({
                                                    ...newProduct,
                                                    image_url: e.target.value, // ✅ อัปเดต URL
                                                    image: null, // ✅ เคลียร์ค่า image ถ้ามี URL
                                                })
                                            }
                                            className="border rounded"
                                        />
                                    </div>

                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={handleAddProduct}
                                            className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
                                        >
                                            บันทึก
                                        </button>
                                        <button
                                            onClick={() =>
                                                setShowAddModal(false)
                                            }
                                            className="px-4 py-2 bg-gray-400 text-white rounded"
                                        >
                                            ยกเลิก
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* รายการสินค้า */}
                    <div className="grid grid-cols-5 gap-4">
                        {filteredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                className="border rounded-lg shadow-md p-4 bg-white flex flex-col items-center"
                            >
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-32 object-contain mb-2"
                                />
                                <h3 className="text-lg font-semibold">
                                    {product.name}
                                </h3>
                                <p className="text-orange-500 font-bold mb-2">
                                    ${product.price}
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingProduct(product);
                                            setOriginalProduct(product);
                                        }}
                                        className="px-3 py-1 bg-yellow-500 text-white rounded"
                                    >
                                        แก้ไข
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDeleteProduct(product.id)
                                        }
                                        className="px-3 py-1 bg-red-500 text-white rounded"
                                    >
                                        ลบ
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    {/* ฟอร์มแก้ไขสินค้า */}
                    {editingProduct && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white p-6 rounded shadow-lg w-96">
                                <h2 className="text-lg font-bold mb-3">
                                    แก้ไขสินค้า
                                </h2>
                                <input
                                    type="text"
                                    placeholder="ชื่อสินค้า"
                                    value={editingProduct.name}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            name: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded w-full mb-2"
                                />
                                <input
                                    type="number"
                                    placeholder="ราคา"
                                    value={editingProduct.price}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            price: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded w-full mb-2"
                                />
                                <select
                                    className="border p-2 rounded w-full mb-2"
                                    value={editingProduct.category_id}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            category_id: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">เลือกหมวดหมู่</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>

                                {/* แสดงรูปเดิม */}
                                {editingProduct.image_url && (
                                    <img
                                        src={editingProduct.image_url}
                                        alt="รูปเก่า"
                                        className="w-full h-32 object-contain mb-2"
                                    />
                                )}

                                {/* อัปโหลดรูปใหม่ (ไม่จำเป็นต้องอัปโหลดก็ได้) */}
                                <input
                                    type="text"
                                    placeholder="ใส่ URL รูปภาพ"
                                    value={newProduct.image_url}
                                    onChange={(e) =>
                                        setNewProduct({
                                            ...newProduct,
                                            image_url: e.target.value, // ✅ อัปเดต URL
                                            image: null, // ✅ เคลียร์ค่า image ถ้ามี URL
                                        })
                                    }
                                    className="border rounded"
                                />

                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={handleUpdateProduct}
                                        className="bg-blue-500 text-white px-4 py-2 rounded"
                                    >
                                        บันทึก
                                    </button>
                                    <button
                                        onClick={() => setEditingProduct(null)}
                                        className="bg-gray-400 text-white px-4 py-2 rounded"
                                    >
                                        ยกเลิก
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ProductManager;
