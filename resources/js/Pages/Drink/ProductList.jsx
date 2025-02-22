import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [billItems, setBillItems] = useState([]);
    const [tableNumber, setTableNumber] = useState('');

    useEffect(() => {
        axios.get('/api/products')
            .then((response) => {
                setProducts(response.data);
            })
            .catch((err) => {
                setError(err.message || 'Failed to fetch products');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const addToBill = (product) => {
        setBillItems((prevItems) => {
            const existingItemIndex = prevItems.findIndex((item) => item.id === product.id);
            if (existingItemIndex !== -1) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity += 1;
                return updatedItems;
            } else {
                return [...prevItems, { ...product, quantity: 1 }];
            }
        });
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            alert('จำนวนสินค้าต้องมากกว่าศูนย์');
            return;
        }
        setBillItems((prevItems) => {
            return prevItems.map(item =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            );
        });
    };

    const saveBill = () => {
        if (!tableNumber) {
            alert('กรุณากรอกหมายเลขโต๊ะ');
            return;
        }

        const billData = {
            table_number: tableNumber,
            total: calculateTotal(),
            items: billItems.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.price,
            })),
        };

        axios.post('/api/bills', billData)
            .then(response => {
                alert(`บันทึกบิลสำหรับโต๊ะ ${tableNumber} เรียบร้อย!`);
                console.log('Saved Bill:', response.data);
                setBillItems([]);
                setTableNumber('');
            })
            .catch(err => {
                alert('Failed to save bill');
                console.error(err);
            });
    };

    const calculateTotal = () => {
        return billItems
            .reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0)
            .toFixed(2); // คำนวณรวมและตั้งค่าเป็นทศนิยม 2 ตำแหน่ง
    };

    if (loading) return <h2 style={{ textAlign: 'center' }}>กำลังโหลดสินค้า...</h2>;
    if (error) return <h2 style={{ textAlign: 'center', color: 'red' }}>{error}</h2>;

    const containerStyle = {
        display: 'grid',
        gridTemplateColumns: '3fr 1fr',
        gap: '20px',
        padding: '20px',
    };

    const productGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '10px',
        listStyleType: 'none',
    };

    const itemStyle = {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '10px',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        cursor: 'pointer',
    };

    const imageStyle = {
        width: '100%',
        height: '100px',
        objectFit: 'cover',
        borderRadius: '4px',
        marginBottom: '10px',
    };

    const billStyle = {
        position: 'sticky',
        top: '0',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        height: '80vh',
    };

    const billItemStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        alignItems: 'center',
    };

    const billListStyle = {
        maxHeight: '50vh',
        overflowY: 'auto',
        listStyleType: 'none',
        padding: '0',
        margin: '0',
    };

    const buttonStyle = {
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    };

    const totalStyle = {
        fontWeight: 'bold',
        fontSize: '18px',
    };

    const inputStyle = {
        marginBottom: '10px',
        padding: '10px',
        fontSize: '16px',
        width: '100%',
        border: '1px solid #ddd',
        borderRadius: '5px',
    };

    const quantityControlStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
    };

    const quantityButtonStyle = {
        width: '25px',
        height: '25px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: '#f0f0f0',
        cursor: 'pointer',
    };

    const quantityInputStyle = {
        width: '40px',
        textAlign: 'center',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '2px',
    };

    const billFooterStyle = {
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };

    return (
        <AuthenticatedLayout>
            <div style={containerStyle}>
                {/* รายการสินค้า */}
                <div>
                    <h1 style={{ textAlign: 'center' }}>รายการสินค้า</h1>
                    <ul style={productGridStyle}>
                        {products.map((product) => (
                            <li
                                key={`${product.id}-${product.quantity}`} // ปรับ key เป็นเอกลักษณ์
                                style={itemStyle}
                                onClick={() => addToBill(product)}
                            >
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        style={imageStyle}
                                    />
                                ) : (
                                    <div style={{ ...imageStyle, backgroundColor: '#ddd' }}>
                                        ไม่มีรูปภาพ
                                    </div>
                                )}
                                <strong>{product.name}</strong>
                                <br />
                                <span>
                                    ${product.price && !isNaN(Number(product.price))
                                        ? Number(product.price).toFixed(2)
                                        : 'N/A'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* บิล */}
                <div style={billStyle}>
                    <div>
                        <h1 style={{ textAlign: 'center' }}>บิล</h1>
                        <input
                            type="text"
                            placeholder="กรอกหมายเลขโต๊ะ"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            style={inputStyle}
                        />
                        {billItems.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#999' }}>ยังไม่มีสินค้าในบิล</p>
                        ) : (
                            <ul style={billListStyle}>
                                {billItems.map((item) => (
                                    <li key={`${item.id}-${item.quantity}`} style={billItemStyle}>
                                        <span>{item.name}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={quantityControlStyle}>
                                                <button
                                                    style={quantityButtonStyle}
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        updateQuantity(item.id, Number(e.target.value) || 1)
                                                    }
                                                    style={quantityInputStyle}
                                                    min="1"
                                                />
                                                <button
                                                    style={quantityButtonStyle}
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span>
                                                ${item.price
                                                    ? (Number(item.price) * item.quantity).toFixed(2)
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div style={billFooterStyle}>
                        <div style={totalStyle}>รวม: ${calculateTotal()}</div>
                        <button style={buttonStyle} onClick={saveBill}>
                            บันทึกบิล
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ProductList;
