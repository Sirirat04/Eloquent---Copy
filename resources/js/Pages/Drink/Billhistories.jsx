import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const BillHistories = () => {
    const [billHistories, setBillHistories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('/api/billhistories')
            .then((response) => {
                setBillHistories(response.data);
            })
            .catch((err) => {
                setError(err.message || 'Failed to fetch bill histories');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // ✅ แสดงข้อความโหลดข้อมูล
    if (loading) return <h2 style={{ textAlign: 'center' }}>กำลังโหลดข้อมูลประวัติการสั่งซื้อ...</h2>;
    if (error) return <h2 style={{ textAlign: 'center', color: 'red' }}>{error}</h2>;

    const containerStyle = {
        padding: '20px',
    };

    const billListStyle = {
        listStyleType: 'none',
        padding: 0,
    };

    const billItemStyle = {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '10px',
        marginBottom: '10px',
        backgroundColor: '#f9f9f9',
    };

    return (
        <AuthenticatedLayout>
            <div style={containerStyle}>
                <ul style={billListStyle}>
                    {billHistories.map((bill) => (
                        <li key={`${bill.table_number}-${bill.id}`} style={billItemStyle}>
                            <strong>บิล #{bill.id}</strong> {/* ✅ เพิ่มเลขบิล */}
                            <br />
                            <strong>โต๊ะ: {bill.table_number}</strong>
                            <br />

                            {/* ✅ ตรวจสอบว่าบิลมีรายการอาหารหรือไม่ */}
                            {bill.items && bill.items.length > 0 ? (
                                <ul>
                                    {bill.items.map((item, index) => (
                                        <li key={`${item.product.id}-${index}`}>
                                            {item.product.name} - จำนวน: {item.quantity} - ราคา: ${item.price}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ color: 'red' }}>ไม่มีออเดอร์ในบิลนี้</p> // ✅ แสดงถ้าไม่มีออเดอร์
                            )}

                            <span>รวม: ${bill.total}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </AuthenticatedLayout>
    );
};

export default BillHistories;
