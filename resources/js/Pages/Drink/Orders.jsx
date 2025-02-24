import React, { useEffect, useState } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Trash2, X, Plus, Minus, Check } from "lucide-react";

const Orders = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBill, setSelectedBill] = useState(null);
    const [updatedItems, setUpdatedItems] = useState([]);
    const [updatedTotal, setUpdatedTotal] = useState(0);

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear() + 543;
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const fetchBills = async () => {
        try {
            const response = await axios.get("/api/bills");
            setBills(response.data.filter((bill) => bill.status !== "completed"));
            setLoading(false);
        } catch (err) {
            setError(err.message || "Failed to fetch bills");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const handleSelectBill = (bill) => {
        setSelectedBill(bill);
        const itemsWithProduct = bill.items.map(item => ({
            ...item,
            product: item.product || { name: "ไม่พบสินค้า" }
        }));
        setUpdatedItems(itemsWithProduct);
        setUpdatedTotal(itemsWithProduct.reduce((sum, item) => sum + (item.quantity * item.price), 0));
    };

    const closeModal = () => {
        setSelectedBill(null);
        setUpdatedItems([]);
    };

    const handleRemoveItem = (itemId) => {
        setUpdatedItems((prevItems) => {
            const newItems = prevItems.filter(item => item.id !== itemId);
            setUpdatedTotal(newItems.reduce((sum, item) => sum + (item.quantity * item.price), 0));
            return newItems;
        });
    };

    const handleSaveBill = async () => {
        try {
            const updatedTotal = updatedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            await axios.patch(`/api/bills/${selectedBill.id}/update-items`, {
                items: updatedItems.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                })),
                total: updatedTotal
            });
            alert("บันทึกเรียบร้อย!");
            fetchBills();
            closeModal();
        } catch (err) {
            alert("เกิดข้อผิดพลาด: " + (err.response?.data?.error || err.message));
        }
    };

    const handleCompleteBill = async (billId) => {
        const isConfirmed = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการทำรายการนี้ให้สำเร็จ?");
        if (isConfirmed) {
            try {
                await axios.patch(`/api/bills/${billId}/complete`);
                alert("ทำรายการสำเร็จเรียบร้อย!");
                fetchBills();
            } catch (err) {
                alert("เกิดข้อผิดพลาด: " + (err.response?.data?.error || err.message));
            }
        }
    };

    const handleUpdateQuantity = (itemId, change) => {
        setUpdatedItems((prevItems) => {
            return prevItems.map((item) => {
                if (item.id === itemId) {
                    const newQuantity = item.quantity + change;
                    if (newQuantity <= 0) return null;
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(Boolean);
        });
    };

    const handleDeleteBill = async (e, billId) => {
        e.stopPropagation();
        const isConfirmed = window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบิล #${billId} นี้?`);
        if (isConfirmed) {
            try {
                await axios.delete(`/api/bills/${billId}`);
                alert(`ลบบิล #${billId} เรียบร้อยแล้ว!`);
                fetchBills();
            } catch (err) {
                alert("เกิดข้อผิดพลาด: " + (err.message || "Unknown error"));
            }
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl text-gray-600">กำลังโหลดข้อมูลบิล...</div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl text-red-600">{error}</div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <div className="max-w-4xl mx-auto p-4"> {/* เปลี่ยนจาก max-w-2xl เป็น max-w-4xl เพื่อขยายความกว้างของบิล */}
                <div className="space-y-4">
                    {bills.map((bill) => (
                        <div
                            key={bill.id}
                            className="bg-stone-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                            onClick={() => handleSelectBill(bill)}
                        >
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-stone-800">บิล #{bill.id}</h3>
                                    <button
                                        onClick={(e) => handleDeleteBill(e, bill.id)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                                
                                <div className="mb-3 text-stone-600">
                                    <strong>โต๊ะ:</strong> {bill.table_number}
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                    {bill.items && bill.items.length > 0 ? (
                                        bill.items.map((item) => (
                                            <div key={item.id} className="flex justify-between text-stone-600 border-b border-stone-200 pb-2">
                                                <span>{item.product?.name || "ไม่มีข้อมูลสินค้า"}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-stone-500">x{item.quantity}</span>
                                                    <span className="font-medium">${item.price * item.quantity}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-red-500 py-2">ไม่มีออเดอร์ในบิลนี้</p>
                                    )}
                                </div>
                                
                                <div className="flex justify-between items-center text-stone-700 mb-3 pt-2 border-t border-stone-200">
                                    <span className="font-medium">รวมทั้งหมด:</span>
                                    <span className="text-lg font-semibold">${bill.total}</span>
                                </div>
                                
                                <div className="text-sm text-stone-500 mb-4">
                                    อัพเดทล่าสุด: {formatDateTime(bill.updated_at)}
                                </div>
                                
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCompleteBill(bill.id);
                                    }}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    <Check size={18} />
                                    ทำรายการสำเร็จ
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedBill && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={closeModal}
                    />
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-md max-h-[80vh] overflow-y-auto p-6">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-xl font-semibold text-stone-800 mb-6 text-center">
                            บิล - โต๊ะ {selectedBill.table_number}
                        </h2>

                        <div className="space-y-4">
                            {updatedItems.length > 0 ? (
                                updatedItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                                        <div className="flex-1">
                                            <div className="font-medium text-stone-800">
                                                {item.product?.name || "ไม่มีข้อมูลสินค้า"}
                                            </div>
                                            <div className="text-stone-600">
                                                ${item.price}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.id, -1)}
                                                className="p-1 rounded-full hover:bg-stone-200 text-stone-600"
                                            >
                                                <Minus size={18} />
                                            </button>
                                            <span className="w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item.id, 1)}
                                                className="p-1 rounded-full hover:bg-stone-200 text-stone-600"
                                            >
                                                <Plus size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="ml-2 p-1 rounded-full hover:bg-red-100 text-red-500"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-red-500">ไม่มีออเดอร์ในบิลนี้</p>
                            )}
                        </div>

                        <button
                            onClick={handleSaveBill}
                            className="mt-6 w-full bg-stone-700 hover:bg-stone-800 text-white py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            บันทึก
                        </button>
                    </div>
                </>
            )}
        </AuthenticatedLayout>
    );
};

export default Orders;
