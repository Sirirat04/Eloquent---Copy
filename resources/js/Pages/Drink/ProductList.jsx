import React, { useEffect, useState } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Menu } from "lucide-react";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [billItems, setBillItems] = useState([]);
    const [tableNumber, setTableNumber] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const itemsPerPage = 12;

    useEffect(() => {
        axios
            .get("/api/products")
            .then((response) => setProducts(response.data))
            .catch((err) => setError(err.message || "Failed to fetch products"))
            .finally(() => setLoading(false));
    }, []);

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
        setCurrentPage(1);
        setExpandedCategory((prev) => prev === categoryId ? null : categoryId);
        setSidebarOpen(false);
    };

    const filteredProducts = selectedCategory === "all"
        ? products
        : products.filter((product) => product.category_id.toString() === selectedCategory);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const addToBill = (product) => {
        setBillItems((prevItems) => {
            const existingItemIndex = prevItems.findIndex((item) => item.id === product.id);
            if (existingItemIndex !== -1) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity += 1;
                return updatedItems;
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId, newQuantity) => {
        setBillItems((prevItems) =>
            newQuantity > 0
                ? prevItems.map((item) =>
                    item.id === productId
                        ? { ...item, quantity: newQuantity }
                        : item
                )
                : prevItems.filter((item) => item.id !== productId)
        );
    };

    const calculateTotal = () => {
        return billItems
            .reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0)
            .toFixed(2);
    };

    const saveBill = () => {
        if (!tableNumber) {
            alert("กรุณากรอกหมายเลขโต๊ะ");
            return;
        }

        const billData = {
            table_number: tableNumber,
            total: calculateTotal(),
            items: billItems.map((item) => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.price,
            })),
        };

        axios
            .post("/api/bills", billData)
            .then(() => {
                alert(`บันทึกบิลสำหรับโต๊ะ ${tableNumber} เรียบร้อย!`);
                setBillItems([]);
                setTableNumber("");
            })
            .catch((err) => {
                alert("Failed to save bill");
                console.error(err);
            });
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="text-xl text-stone-600">กำลังโหลดสินค้า...</div></div>;
    if (error) return <div className="flex items-center justify-center h-screen"><div className="text-xl text-red-600">{error}</div></div>;

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-stone-100">
                {/* Mobile Header with Menu Button */}
                <div className="lg:hidden flex items-center justify-between p-4 bg-stone-800 text-white">
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-stone-700 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className="text-xl font-semibold">รายการสินค้า</h1>
                </div>

                <div className="flex flex-col lg:flex-row">
                    {/* Sidebar */}
                    <div className={`
                        ${isSidebarOpen ? 'block' : 'hidden'} 
                        lg:block
                        w-full lg:w-64 
                        bg-white shadow-lg
                        fixed lg:relative
                        z-50 lg:z-auto
                        h-screen
                        overflow-y-auto
                    `}>
                        <div className="p-4">
                            <h2 className="text-xl font-semibold text-stone-800 mb-4">หมวดหมู่</h2>
                            <nav>
                                {categories.map((category) => (
                                    <div key={category.id} className="mb-2">
                                        <button
                                            onClick={() => handleCategoryClick(category.id)}
                                            className={`
                                                w-full text-left px-4 py-2 rounded-lg
                                                transition-colors duration-200
                                                ${selectedCategory === category.id 
                                                    ? 'bg-stone-200 text-stone-800' 
                                                    : 'text-stone-600 hover:bg-stone-100'}
                                            `}
                                        >
                                            {category.name}
                                        </button>

                                        {expandedCategory === category.id && category.subCategories && (
                                            <div className="ml-4 mt-1 space-y-1">
                                                {category.subCategories.map((sub) => (
                                                    <button
                                                        key={sub.id}
                                                        onClick={() => handleCategoryClick(sub.id)}
                                                        className={`
                                                            w-full text-left px-4 py-2 rounded-lg
                                                            transition-colors duration-200
                                                            ${selectedCategory === sub.id 
                                                                ? 'bg-stone-200 text-stone-800' 
                                                                : 'text-stone-600 hover:bg-stone-100'}
                                                        `}
                                                    >
                                                        {sub.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-4 lg:p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {paginatedProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg"
                                >
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-40 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="text-lg font-medium text-stone-800 mb-2">
                                            {product.name}
                                        </h3>
                                        <p className="text-stone-600 font-semibold mb-3">
                                            ฿{Number(product.price).toLocaleString()}
                                        </p>
                                        <button
                                            onClick={() => addToBill(product)}
                                            className="w-full bg-stone-700 text-white py-2 px-4 rounded-lg
                                                hover:bg-stone-600 transition-colors duration-200"
                                        >
                                            เพิ่มลงบิล
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-6 flex items-center justify-center gap-4">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-stone-200 rounded-lg disabled:opacity-50 
                                    hover:bg-stone-300 transition-colors duration-200"
                            >
                                ก่อนหน้า
                            </button>
                            <span className="text-stone-600">
                                หน้า {currentPage} จาก {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-stone-200 rounded-lg disabled:opacity-50 
                                    hover:bg-stone-300 transition-colors duration-200"
                            >
                                ถัดไป
                            </button>
                        </div>
                    </div>

                    {/* Bill Section */}
                    <div className="w-full lg:w-80 bg-white shadow-lg p-4 lg:h-screen lg:overflow-y-auto">
                        <h2 className="text-xl font-semibold text-stone-800 mb-4">บิล</h2>
                        <input
                            type="text"
                            placeholder="กรอกหมายเลขโต๊ะ"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            className="w-full p-3 border border-stone-300 rounded-lg mb-4 
                                focus:outline-none focus:ring-2 focus:ring-stone-500"
                        />
                        
                        {billItems.length === 0 ? (
                            <p className="text-center text-stone-500 my-8">ยังไม่มีสินค้าในบิล</p>
                        ) : (
                            <div className="space-y-3 mb-4">
                                {billItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium text-stone-800">{item.name}</p>
                                            <p className="text-stone-600">฿{Number(item.price).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-stone-200 
                                                    rounded-lg hover:bg-stone-300 transition-colors duration-200"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-stone-200 
                                                    rounded-lg hover:bg-stone-300 transition-colors duration-200"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="border-t border-stone-200 pt-4 mb-4">
                            <div className="flex justify-between items-center text-lg font-semibold text-stone-800">
                                <span>รวมทั้งหมด</span>
                                <span>฿{calculateTotal()}</span>
                            </div>
                        </div>

                        <button
                            onClick={saveBill}
                            disabled={billItems.length === 0}
                            className="w-full bg-stone-700 text-white py-3 px-4 rounded-lg
                                hover:bg-stone-600 transition-colors duration-200
                                disabled:bg-stone-300 disabled:cursor-not-allowed"
                        >
                            บันทึกบิล
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ProductList;