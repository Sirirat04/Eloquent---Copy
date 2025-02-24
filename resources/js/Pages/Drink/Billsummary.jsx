import React, { useEffect, useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const BillSummary = () => {
    const [billSummary, setBillSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);

    const fetchBillSummary = () => {
        setLoading(true);
        fetch('/api/bills/summary')
            .then((res) => res.json())
            .then((data) => {
                setBillSummary(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || 'ไม่สามารถโหลดข้อมูลบิลได้');
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchBillSummary();
    }, []);

    const handleHistoryClick = () => {
        Inertia.get('/billhistory');
        setIsMenuOpen(false);
    };

    const handlePayment = () => {
        if (!selectedBill) return;

        if (window.confirm(`คุณต้องการชำระเงินสำหรับโต๊ะ ${selectedBill.table_number} หรือไม่?`)) {
            fetch('/api/bills/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ table_number: selectedBill.table_number }),
            })
                .then(() => {
                    alert(`ชำระเงินสำหรับโต๊ะ ${selectedBill.table_number} เรียบร้อย!`);
                    fetchBillSummary();
                    setSelectedBill(null);
                })
                .catch((err) => {
                    alert('เกิดข้อผิดพลาดในการชำระเงิน: ' + (err.message || 'Unknown error'));
                });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                <span className="ml-2 text-lg text-amber-800">กำลังโหลดข้อมูล...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4 text-red-600 bg-red-50 rounded-lg">
                <p className="text-lg">{error}</p>
            </div>
        );
    }

    return (
        <AuthenticatedLayout>
            <div className="relative min-h-screen bg-gray-50">
                {/* Settings Button */}
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="fixed top-4 right-4 text-2xl p-2 hover:bg-gray-100 rounded-full transition-colors z-50"
                >
                    ⚙️
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                    <div className="fixed top-16 right-4 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                        <button 
                            onClick={handleHistoryClick}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                        >
                            ประวัติการสั่งซื้อ
                        </button>
                    </div>
                )}

                {/* Main Content */}
                <div className="container mx-auto p-4 max-w-4xl">
                    <h1 className="text-2xl font-semibold mb-6 text-amber-900">สรุปบิล</h1>
                    
                    <div className="space-y-4">
                        {billSummary.map((bill) => (
                            <div 
                                key={bill.id}
                                onClick={() => setSelectedBill(bill)}
                                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-xl font-medium text-gray-900">
                                            บิล #{bill.id}
                                        </h2>
                                        <p className="text-gray-600">
                                            โต๊ะ {bill.table_number}
                                        </p>
                                    </div>
                                    <span className="text-lg font-semibold text-gray-900">
                                        ฿{bill.total?.toLocaleString() ?? '0'}
                                    </span>
                                </div>

                                <ul className="space-y-2">
                                    {bill.items.map((item, index) => (
                                        <li 
                                            key={`${item.product.id}-${index}`}
                                            className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                                        >
                                            <div className="flex-1">
                                                <span className="text-gray-800">
                                                    {item.product.name}
                                                </span>
                                                <span className="text-gray-600 ml-2">
                                                    x{item.quantity}
                                                </span>
                                            </div>
                                            <span className="text-gray-800">
                                                ฿{item.price?.toLocaleString() ?? '0'}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modal */}
                {selectedBill && (
                    <>
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-50 z-40"
                            onClick={() => setSelectedBill(null)}
                        />
                        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50">
                            <button 
                                onClick={() => setSelectedBill(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>

                            <h2 className="text-xl font-semibold text-center mb-4">
                                รายละเอียดบิล - โต๊ะ {selectedBill.table_number}
                            </h2>

                            <div className="mt-4 space-y-3">
                                {selectedBill.items.map((item, index) => (
                                    <div 
                                        key={`${item.product.id}-${index}`}
                                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                                    >
                                        <div className="flex-1">
                                            <span className="text-gray-800">
                                                {item.product.name}
                                            </span>
                                            <span className="text-gray-600 ml-2">
                                                x{item.quantity}
                                            </span>
                                        </div>
                                        <span className="text-gray-800">
                                            ฿{item.price?.toLocaleString() ?? '0'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="text-right mt-4 text-xl font-semibold">
                                รวม: ฿{selectedBill.total?.toLocaleString() ?? '0'}
                            </div>

                            <button
                                onClick={handlePayment}
                                className="mt-6 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                ชำระเงิน
                            </button>
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default BillSummary;