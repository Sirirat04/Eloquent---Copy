import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { AlertCircle } from "lucide-react";

const BillHistories = () => {
    const [billHistories, setBillHistories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");

    useEffect(() => {
        fetchBillHistories();
    }, []);

    const fetchBillHistories = async () => {
        try {
            const response = await fetch("/api/billhistories");
            if (!response.ok) throw new Error("การดึงข้อมูลล้มเหลว");
            const data = await response.json();
            setBillHistories(data);
        } catch (err) {
            setError(err.message || "ไม่สามารถดึงข้อมูลประวัติการสั่งซื้อได้");
        } finally {
            setLoading(false);
        }
    };

    const filteredBills = billHistories
        .filter(
            (bill) =>
                bill.id.toString().includes(searchTerm) ||
                bill.table_number.toString().includes(searchTerm)
        )
        .sort((a, b) => (sortOrder === "desc" ? b.id - a.id : a.id - b.id));

    const calculateTotal = (items) => {
        return (
            items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ??
            0
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                <span className="ml-2 text-lg text-amber-800">
                    กำลังโหลดข้อมูล...
                </span>
            </div>
        );
    }

    return (
        <AuthenticatedLayout>
            <div className="container mx-auto p-4 max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        ประวัติการสั่งซื้อ
                    </h1>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="ค้นหาตามหมายเลขบิล"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 pr-8" // เพิ่ม pr-8 เพื่อขยับลูกศร
                        >
                            <option value="desc">ล่าสุด</option>
                            <option value="asc">เก่าสุด</option>
                        </select>
                    </div>
                </div>

                {error ? (
                    <div className="flex items-center gap-2 p-4 text-red-700 bg-red-100 rounded-lg">
                        <AlertCircle className="h-5 w-5" />
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBills.length === 0 ? (
                            <div className="text-center p-8 bg-gray-100 rounded-lg">
                                <p className="text-gray-800">
                                    ไม่พบรายการที่ค้นหา
                                </p>
                            </div>
                        ) : (
                            filteredBills.map((bill) => (
                                <div
                                    key={`${bill.table_number}-${bill.id}`}
                                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-medium text-gray-900">
                                                บิล #{bill.id}
                                            </h2>
                                            <p className="text-gray-700">
                                                โต๊ะ {bill.table_number}
                                            </p>
                                        </div>
                                        <span className="text-lg font-semibold text-gray-900">
                                            ฿
                                            {calculateTotal(
                                                bill.items
                                            ).toLocaleString()}
                                        </span>
                                    </div>

                                    {bill.items && bill.items.length > 0 ? (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <ul className="space-y-2">
                                                {bill.items.map(
                                                    (item, index) => (
                                                        <li
                                                            key={`${item.product.id}-${index}`}
                                                            className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
                                                        >
                                                            <div className="flex-1">
                                                                <span className="text-gray-900">
                                                                    {
                                                                        item
                                                                            .product
                                                                            .name
                                                                    }
                                                                </span>
                                                                <span className="text-gray-600 ml-2">
                                                                    x
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>
                                                            </div>
                                                            <span className="text-gray-800">
                                                                ฿
                                                                {(
                                                                    item.price *
                                                                    item.quantity
                                                                ).toLocaleString()}
                                                            </span>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between text-lg font-medium">
                                                <span className="text-gray-900">
                                                    รวมทั้งสิ้น
                                                </span>
                                                <span className="text-gray-900">
                                                    ฿
                                                    {calculateTotal(
                                                        bill.items
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-4 bg-gray-200 rounded-lg">
                                            <p className="text-gray-800">
                                                ไม่มีรายการในบิลนี้
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default BillHistories;
