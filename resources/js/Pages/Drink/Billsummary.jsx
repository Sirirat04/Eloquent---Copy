import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Inertia } from '@inertiajs/inertia';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const BillSummary = () => {
    const [billSummary, setBillSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);

    // โหลดข้อมูลบิลสรุปจาก API
    const fetchBillSummary = () => {
        setLoading(true);
        axios.get('/api/bills/summary')
            .then((response) => {
                setBillSummary(response.data);
            })
            .catch((err) => {
                setError(err.message || 'Failed to fetch bill summary');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchBillSummary(); // เรียก API ตอนโหลดหน้า
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleHistoryClick = () => {
        Inertia.get(route('billhistory'));
        setIsMenuOpen(false);
    };

    const handleBillClick = (bill) => {
        setSelectedBill(bill);
    };

    const closeModal = () => {
        setSelectedBill(null);
    };

    const handlePayment = () => {
        if (!selectedBill) return;

        if (window.confirm(`คุณต้องการชำระเงินสำหรับโต๊ะ ${selectedBill.table_number} หรือไม่?`)) {
            axios.post('/api/bills/pay', { table_number: selectedBill.table_number })
                .then(() => {
                    alert(`ชำระเงินสำหรับโต๊ะ ${selectedBill.table_number} เรียบร้อย!`);

                    // 🔥 โหลดข้อมูลใหม่จาก API หลังจากชำระเงิน
                    fetchBillSummary();

                    // ล้างค่าบิลที่ถูกเลือก
                    setSelectedBill(null);
                })
                .catch((err) => {
                    alert('เกิดข้อผิดพลาดในการชำระเงิน: ' + (err.message || 'Unknown error'));
                });
        }
    };

    if (loading) return <h2 style={{ textAlign: 'center' }}>กำลังโหลดข้อมูลสรุปบิล...</h2>;
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
        cursor: 'pointer',
    };

    const gearButtonStyle = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        zIndex: 1001,
    };

    const dropdownStyle = {
        position: 'fixed',
        top: '50px',
        right: '20px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        display: isMenuOpen ? 'block' : 'none',
        zIndex: 1001,
    };

    const dropdownItemStyle = {
        padding: '8px 16px',
        cursor: 'pointer',
        borderBottom: '1px solid #ddd',
    };

    const modalStyle = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        zIndex: 1000,
        width: '400px',
        maxHeight: '80vh',
        overflowY: 'auto',
    };

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 999,
    };

    const closeButtonStyle = {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'none',
        border: 'none',
        fontSize: '18px',
        cursor: 'pointer',
    };

    const paymentButtonStyle = {
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        width: '100%',
    };

    return (
        <AuthenticatedLayout>
            <button style={gearButtonStyle} onClick={toggleMenu}>
                ⚙️
            </button>
            <div style={dropdownStyle}>
                <div style={dropdownItemStyle} onClick={handleHistoryClick}>
                    ประวัติการสั่งซื้อ
                </div>
            </div>

            <div style={containerStyle}>
                <ul style={billListStyle}>
                    {billSummary.map((bill) => (
                        <li
                            key={bill.id} // ✅ เปลี่ยนจาก table_number เป็น id
                            table={bill.table_number}
                            style={billItemStyle}
                            onClick={() => handleBillClick(bill)}
                        >
                            <strong>บิล #{bill.id}</strong> {/* ✅ เพิ่ม bill.id */}
                            <br />
                            <strong>โต๊ะ: {bill.table_number}</strong>
                            <br />
                            <ul>
                                {bill.items.map((item, index) => (
                                    <li key={`${item.product.id}-${index}`}>
                                        {item.product.name} - จำนวน: {item.quantity} - ราคา: ${item.price}
                                    </li>
                                ))}
                            </ul>
                            <span>รวม: ${bill.total}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {selectedBill && (
                <>
                    <div style={overlayStyle} onClick={closeModal}></div>
                    <div style={modalStyle}>
                        <button style={closeButtonStyle} onClick={closeModal}>
                            ✕
                        </button>
                        <h2 style={{ textAlign: 'center' }}>รายละเอียดบิล - โต๊ะ {selectedBill.table_number}</h2>
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                            {selectedBill.items.map((item, index) => (
                                <li key={`${item.product.id}-${index}`} style={{ marginBottom: '10px' }}>
                                    {item.product.name} - จำนวน: {item.quantity} - ราคา: ${item.price}
                                </li>
                            ))}
                        </ul>
                        <div style={{ fontWeight: 'bold', fontSize: '18px', textAlign: 'right' }}>
                            รวม: ${selectedBill.total}
                        </div>
                        <button style={paymentButtonStyle} onClick={handlePayment}>
                            ชำระเงิน
                        </button>
                    </div>
                </>
            )}
        </AuthenticatedLayout>
    );
};

export default BillSummary;
