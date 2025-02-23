import React, { useEffect, useState } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

// ฟังก์ชันจัดรูปแบบวันที่และเวลา
const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear() + 543;
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const Orders = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBill, setSelectedBill] = useState(null);
    const [updatedItems, setUpdatedItems] = useState([]); // ✅ รายการสินค้าที่อัปเดต
    const [updatedTotal, setUpdatedTotal] = useState(0);  // ✅ เก็บราคาทั้งหมด

    // โหลดข้อมูลบิล
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

    // ✅ กดที่บิลเพื่อเปิด Modal
    const handleSelectBill = (bill) => {
        setSelectedBill(bill);

        const itemsWithProduct = bill.items.map(item => ({
            ...item,
            product: item.product || { name: "ไม่พบสินค้า" }
        }));

        setUpdatedItems(itemsWithProduct);
        setUpdatedTotal(itemsWithProduct.reduce((sum, item) => sum + (item.quantity * item.price), 0));
    };

    // ✅ ปิด Modal กลับมาหน้าเดิม
    const closeModal = () => {
        setSelectedBill(null);
        setUpdatedItems([]);
    };

    // ✅ ลบออเดอร์จากบิล
    const handleRemoveItem = (itemId) => {
        setUpdatedItems((prevItems) => {
            const newItems = prevItems.filter(item => item.id !== itemId);
            setUpdatedTotal(newItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)); // ✅ คำนวณราคารวมใหม่
            return newItems;
        });
    };

    // ✅บันทึกการแก้ไขออเดอร์
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
            fetchBills(); // โหลดข้อมูลใหม่
            closeModal(); // ปิด Modal
        } catch (err) {
            alert("เกิดข้อผิดพลาด: " + (err.response?.data?.error || err.message));
            console.error("Error updating bill:", err.response);
        }
    };
    // ✅ ทำรายการสำเร็จ
    const handleCompleteBill = async (billId) => {
        const isConfirmed = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการทำรายการนี้ให้สำเร็จ?");

        if (isConfirmed) {
            try {
                await axios.patch(`/api/bills/${billId}/complete`);
                alert("ทำรายการสำเร็จเรียบร้อย!");
                fetchBills(); // โหลดข้อมูลใหม่
            } catch (err) {
                alert("เกิดข้อผิดพลาด: " + (err.response?.data?.error || err.message));
                console.error("Error completing bill:", err.response);
            }
        }
    };
    const handleUpdateQuantity = (itemId, change) => {
        setUpdatedItems((prevItems) => {
            return prevItems.map((item) => {
                if (item.id === itemId) {
                    const newQuantity = item.quantity + change;

                    if (newQuantity <= 0) {
                        return null; // ✅ ถ้าจำนวนเป็น 0 ให้ลบออก
                    }

                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(Boolean); // ✅ กรองรายการที่เป็น null ออก

        });
    };
    const handleDeleteBill = async (e, billId) => {
        e.stopPropagation(); // ป้องกันไม่ให้เปิด Modal

        const isConfirmed = window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบิล #${billId} นี้?`);

        if (isConfirmed) {
            try {
                await axios.delete(`/api/bills/${billId}`);
                alert(`ลบบิล #${billId} เรียบร้อยแล้ว!`);
                fetchBills(); // โหลดข้อมูลใหม่
            } catch (err) {
                alert("เกิดข้อผิดพลาด: " + (err.response?.data?.error || err.message));
                console.error("Error deleting bill:", err.response);
            }
        }
    };
    if (loading) return <h2 style={{ textAlign: "center" }}>กำลังโหลดข้อมูลบิล...</h2>;
    if (error) return <h2 style={{ textAlign: "center", color: "red" }}>{error}</h2>;

    return (
        <AuthenticatedLayout>
            <div style={{ padding: "20px" }}>
                <ul style={{ listStyleType: "none", padding: 0 }}>
                    {bills.map((bill) => (
                        <li
                            key={bill.id}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                padding: "10px",
                                marginBottom: "10px",
                                backgroundColor: "#f9f9f9",
                                cursor: "pointer",
                                position: "relative" // ✅ ทำให้ปุ่มลอยอยู่มุมขวา
                            }}
                            onClick={() => handleSelectBill(bill)}
                        >
                            {/* ✅ ปุ่มลบบิล */}
                            <button
                                onClick={(e) => handleDeleteBill(e, bill.id)}
                                style={{
                                    position: "absolute",
                                    top: "10px",
                                    right: "10px",
                                    backgroundColor: "red",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    padding: "5px 10px"
                                }}
                            >
                                ✕
                            </button>

                            <strong>บิล #{bill.id}</strong>
                            <br />
                            <span>โต๊ะ: {bill.table_number}</span>
                            <br />
                            {bill.items && bill.items.length > 0 ? (
                                <ul>
                                    {bill.items.map((item) => (
                                        <li key={item.id}>
                                            {item.product?.name || "ไม่มีข้อมูลสินค้า"}
                                            - จำนวน: {item.quantity}
                                            - ราคา: ${item.price}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ color: "red", textAlign: "center" }}>ไม่มีออเดอร์ในบิลนี้</p>
                            )}
                            <span>รวม: ${bill.total}</span>
                            <br />
                            <span>เวลา : {formatDateTime(bill.updated_at)}</span>
                            <br />
                            <button
                                style={{
                                    marginTop: "10px",
                                    padding: "8px 16px",
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                                onClick={(e) => {
                                    e.stopPropagation(); // ป้องกันไม่ให้เปิด Modal
                                    handleCompleteBill(bill.id);
                                }}
                            >
                                ทำรายการสำเร็จ
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {selectedBill && (
                <>
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            zIndex: 999,
                        }}
                        onClick={closeModal}
                    ></div>
                    <div
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            backgroundColor: "#fff",
                            padding: "20px",
                            borderRadius: "8px",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                            zIndex: 1000,
                            width: "400px",
                            maxHeight: "80vh",
                            overflowY: "auto",
                        }}
                    >
                        <button
                            style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                background: "none",
                                border: "none",
                                fontSize: "18px",
                                cursor: "pointer",
                            }}
                            onClick={closeModal}
                        >
                            ✕
                        </button>
                        <h2 style={{ textAlign: "center" }}>บิล - โต๊ะ {selectedBill.table_number}</h2>
                        <ul>
                            {updatedItems.length > 0 ? (
                                updatedItems.map((item) => (
                                    <li key={item.id}>
                                        {item.product?.name || "ไม่มีข้อมูลสินค้า"}
                                        - จำนวน: {item.quantity}
                                        - ราคา: ${item.price}
                                        <button onClick={() => handleUpdateQuantity(item.id, -1)}>➖</button>
                                        <button onClick={() => handleUpdateQuantity(item.id, 1)}>➕</button>
                                        <button onClick={() => handleRemoveItem(item.id)} style={{ color: 'red' }}>ลบ</button>
                                    </li>
                                ))
                            ) : (
                                <p style={{ color: "red", textAlign: "center" }}>ไม่มีออเดอร์ในบิลนี้</p>
                            )}
                        </ul>
                        <button
                            style={{
                                marginTop: "20px",
                                padding: "10px 20px",
                                backgroundColor: "#3498db",
                                color: "#fff",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                width: "100%",
                            }}
                            onClick={handleSaveBill}
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
