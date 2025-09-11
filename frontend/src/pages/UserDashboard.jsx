import React, { useState, useEffect } from 'react';
import apiClient from '../api/api';

// --- STYLES for this component ---
const UserDashboardStyles = () => (
    <style>{`
        .menu-container {
            display: flex;
            flex-direction: row;
            gap: 2rem;
            padding: 2rem;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        .menu-list {
            flex: 3;
        }
        .cart-summary {
            flex: 1;
            padding: 1.5rem;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            align-self: flex-start; /* Stick to the top */
        }
        .menu-list h2, .cart-summary h2 {
            margin-top: 0;
            color: #333;
        }
        .menu-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1.5rem;
        }
        .menu-item-card {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            padding: 1rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .menu-item-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .menu-item-card h3 {
            margin: 0 0 0.5rem 0;
            color: #1a1a1a;
        }
        .menu-item-card p {
            margin: 0 0 1rem 0;
            color: #666;
            font-size: 0.9rem;
        }
        .menu-item-card .price {
            font-weight: 600;
            color: #007aff;
            margin-bottom: 1rem;
        }
        .add-to-cart-btn {
            background-color: #007aff;
            color: white;
            border: none;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: background-color 0.2s ease;
        }
        .add-to-cart-btn:hover {
            background-color: #0056b3;
        }
        .cart-items {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .cart-items li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .cart-items li:last-child {
            border-bottom: none;
        }
        .cart-total {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 2px solid #333;
            font-weight: bold;
            font-size: 1.2rem;
            display: flex;
            justify-content: space-between;
        }
        .place-order-btn {
            width: 100%;
            padding: 1rem;
            margin-top: 1rem;
            font-size: 1.1rem;
        }
        .message-box {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            text-align: center;
        }
        .message-box.success { background-color: #d4edda; color: #155724; }
        .message-box.error { background-color: #f8d7da; color: #721c24; }
    `}</style>
);

const UserDashboard = ({ user, onLogout }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderStatus, setOrderStatus] = useState(null);

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await apiClient.get('/api/menu-items');
                setMenuItems(response.data.data || []);
            } catch (err) {
                setError('Could not load the menu. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchMenuItems();
    }, []);

    const addToCart = (item) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
            } else {
                return [...prevCart, { ...item, quantity: 1 }];
            }
        });
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0).toFixed(2);
    };

    const placeOrder = async () => {
        setError(null);
        setOrderStatus(null);
        if (cart.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        const orderData = {
            items: cart.map(item => ({
                menu_item_id: item.id,
                quantity: item.quantity,
            })),
        };

        try {
            await apiClient.post('/api/orders', orderData);
            setOrderStatus('Order placed successfully!');
            setCart([]);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to place order.';
            setOrderStatus(null);
            setError(errorMsg);
        }
    };

    if (loading) return <div>Loading menu...</div>;
    
    return (
        <>
            <UserDashboardStyles />
            <div className="menu-container">
                <div className="menu-list">
                    <h2>Menu</h2>
                    {error && <div className="message-box error">{error}</div>}
                    {orderStatus && <div className="message-box success">{orderStatus}</div>}
                    
                    {menuItems.length === 0 && !error && 
                        <p>No menu items available at the moment. Please add some from the staff dashboard!</p>
                    }

                    <div className="menu-grid">
                        {menuItems.map(item => (
                            <div key={item.id} className="menu-item-card">
                                <div>
                                    <h3>{item.item_name}</h3>
                                    <p>{item.description || 'No description available.'}</p>
                                </div>
                                <div>
                                    <p className="price">${parseFloat(item.price || 0).toFixed(2)}</p>
                                    <button className="add-to-cart-btn" onClick={() => addToCart(item)}>
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="cart-summary">
                    <h2>Your Order</h2>
                    {cart.length === 0 ? (
                        <p>Your cart is empty.</p>
                    ) : (
                        <ul className="cart-items">
                            {cart.map(item => (
                                <li key={item.id}>
                                    <span>{item.quantity}x {item.item_name}</span>
                                    <span>${((item.price || 0) * item.quantity).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="cart-total">
                        <span>Total:</span>
                        <span>${calculateTotal()}</span>
                    </div>
                    <button className="button-submit place-order-btn" onClick={placeOrder} disabled={cart.length === 0}>
                        Place Order
                    </button>
                    <button className="button-submit" onClick={onLogout} style={{backgroundColor: '#6c757d', marginTop: '10px'}}>Logout</button>
                </div>
            </div>
        </>
    );
};

export default UserDashboard;

