import React, { useState, useEffect } from 'react';
import apiClient from '../api/api'; // Import the configured API client

// --- STYLES COMPONENT ---
const AppStyles = () => (
  <style>{`
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #f0f2f5;
      box-sizing: border-box;
    }
    *, *::before, *::after {
        box-sizing: border-box;
    }
    
    /* Page Layout */
    .page-container {
      display: flex;
      width: 100vw;
      height: 100vh;
      flex-direction: row; /* Default for larger screens */
      align-items: center;
      justify-content: center;
    }
    .form-panel {
      width: 40%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f0f2f5;
      padding: 2rem;
      overflow-y: auto; /* Allow scrolling on the panel if content overflows */
    }
    .slider-panel {
      width: 60%;
      height: 100%;
      background-color: #000;
    }

    /* Form Styles */
    .styled-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 450px;
      margin: auto 0; /* Center vertically within the scrollable panel */
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: 12px; /* Slightly reduced gap */
      background-color: #ffffff;
      padding: 30px;
      width: 100%;
      border-radius: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
    .form ::placeholder {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    .form button {
      align-self: flex-end;
    }
    .flex-column > label {
      color: #151717;
      font-weight: 600;
      margin-bottom: 5px;
      display: inline-block;
    }
    .inputForm {
      border: 1.5px solid #ecedec;
      border-radius: 10px;
      height: 50px;
      display: flex;
      align-items: center;
      padding: 0 15px 0 10px;
      transition: 0.2s ease-in-out;
      background-color: #fff;
    }
    .inputForm svg {
        color: #8a8a8a;
        flex-shrink: 0;
    }
    .input {
      margin-left: 10px;
      border-radius: 10px;
      border: none;
      width: 100%;
      height: 100%;
      background: transparent;
      font-size: 1rem;
    }
    /* THIS IS THE FIX for the white text fields on autofill */
    .input:-webkit-autofill,
    .input:-webkit-autofill:hover, 
    .input:-webkit-autofill:focus, 
    .input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 30px white inset !important;
        box-shadow: 0 0 0 30px white inset !important;
        -webkit-text-fill-color: #000 !important;
    }
    .input:focus {
      outline: none;
    }
    .inputForm:focus-within {
      border: 1.5px solid #2d79f3;
    }
    .inputForm:focus-within svg {
        color: #2d79f3;
    }
    .password-viewer-icon {
        cursor: pointer;
        margin-left: 10px;
    }
    .flex-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
      justify-content: space-between;
    }
    .flex-row > div {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .flex-row > div > label {
      font-size: 14px;
      color: black;
      font-weight: 400;
    }
    .span {
      font-size: 14px;
      margin-left: 5px;
      color: #2d79f3;
      font-weight: 500;
      cursor: pointer;
    }
    .button-submit {
      margin: 15px 0 10px 0; /* Reduced top margin */
      background-color: #151717;
      border: none;
      color: white;
      font-size: 15px;
      font-weight: 500;
      border-radius: 10px;
      height: 50px;
      width: 100%;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    .button-submit:hover {
      background-color: #2d79f3;
    }
    .p {
      text-align: center;
      color: black;
      font-size: 14px;
      margin: 5px 0;
    }
    .btn {
      margin-top: 10px;
      width: 100%;
      height: 50px;
      border-radius: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: 500;
      gap: 10px;
      border: 1px solid #ededef;
      background-color: white;
      cursor: pointer;
      transition: 0.2s ease-in-out;
    }
    .btn:hover {
      border: 1px solid #2d79f3;
    }

    /* Title Styles */
    .title-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      margin-bottom: 20px;
    }
    .food-icon {
      width: 48px;
      height: 48px;
      fill: #333;
    }
    .form-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      margin: 0;
    }

    /* Toggle Switch Styles */
    .toggle-container {
        display: flex;
        justify-content: center;
        margin-bottom: 25px;
        background-color: #e0e_e0;
        border-radius: 25px;
        padding: 5px;
        width: fit-content;
        align-self: center;
    }
    .toggle-button {
        padding: 10px 25px;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        background-color: transparent;
        color: #555;
        font-weight: 600;
        transition: all 0.3s ease;
        font-size: 1rem;
    }
    .toggle-button.active {
        background-color: #ffffff;
        color: #2d79f3;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    /* Error Message Styles */
    .error-message {
        color: #e53e3e;
        background-color: #fed7d7;
        border: 1px solid #f56565;
        border-radius: 8px;
        padding: 10px 15px;
        margin-bottom: 15px;
        font-size: 14px;
        text-align: center;
    }

    /* Parallax Slider Styles */
    .parallax-container {
      height: 100%;
      width: 100%;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 1rem;
    }
    .parallax-header {
      max-width: 40rem;
      margin: 0 auto;
      text-align: center;
      position: relative;
      z-index: 10;
      padding: 1rem;
      background: rgba(0,0,0,0.5);
      border-radius: 1rem;
      backdrop-filter: blur(10px);
    }
    .parallax-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #fff;
    }
    .parallax-subtitle {
      max-width: 30rem;
      margin: 0.5rem auto;
      color: #e0e0e0;
    }
    .parallax-row {
      display: flex;
      gap: 1rem;
      width: max-content;
      transition: transform 0.4s ease-in-out;
    }
    .product-card {
      width: 20rem;
      height: 20rem;
      overflow: hidden;
      border-radius: 1rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      flex-shrink: 0;
    }
    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      transition: transform 0.5s ease;
    }
    .product-image:hover {
      transform: scale(1.1);
    }
    
    /* Responsive Styles */
    @media (max-width: 1024px) {
        .form-panel { width: 100%; height: 65%; padding: 1rem; }
        .slider-panel { width: 100%; height: 35%; }
        .form-title { font-size: 2rem; }
        .product-card { width: 15rem; height: 15rem; }
        .parallax-header { display: none; }
    }
    @media (max-width: 768px) {
        .form { padding: 20px; }
        .form-panel { height: 100%; }
        .slider-panel { display: none; }
    }

    /* NEW STYLES for Role Selector */
    .role-selector {
        display: flex;
        gap: 15px;
        margin-bottom: 10px;
        padding: 5px;
        border-radius: 10px;
        background-color: #f0f2f5;
    }
    .role-selector label {
        flex: 1;
        text-align: center;
        padding: 10px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        font-weight: 500;
    }
    .role-selector input {
        display: none;
    }
    .role-selector input:checked + label {
        background-color: #fff;
        color: #2d79f3;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
  `}</style>
);


// --- COMPONENT: HeroParallax ---
const products = [
    { title: "Gourmet Burgers", thumbnail: "https://images.unsplash.com/photo-1568901346375-23c9450c58sl?q=80&w=1998" },
    { title: "Artisanal Pizza", thumbnail: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=1928" },
    { title: "Fresh Salads", thumbnail: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1974" },
    { title: "Decadent Desserts", thumbnail: "https://images.unsplash.com/photo-1567684014761-b65e2e596b63?q=80&w=1974" },
    { title: "Craft Coffee", thumbnail: "https://images.unsplash.com/photo-1511920183353-30a5d4d202d5?q=80&w=1974" },
    { title: "Sushi Platters", thumbnail: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070" },
    { title: "Breakfast Bowls", thumbnail: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=1964" },
];

const HeroParallax = () => {
    const [translate, setTranslate] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setTranslate(prev => (prev > 50 ? -50 : prev + 0.5)), 100);
        return () => clearInterval(interval);
    }, []);
    const duplicatedProducts = [...products, ...products]; // Duplicate for seamless loop effect
    return (
        <div className="parallax-container">
            <div className="parallax-header">
                <h1 className="parallax-title">Discover Delicious</h1>
                <p className="parallax-subtitle">A curated collection of culinary delights, just for you.</p>
            </div>
            <div className="parallax-row" style={{ transform: `translateX(-${translate * 2}px)` }}>
                {duplicatedProducts.map((p, i) => <div className="product-card" key={`${p.title}-${i}`}><img src={p.thumbnail} alt={p.title} className="product-image" /></div>)}
            </div>
            <div className="parallax-row" style={{ transform: `translateX(${translate}px)` }}>
                 {duplicatedProducts.map((p, i) => <div className="product-card" key={`${p.title}-${i}-2`}><img src={p.thumbnail} alt={p.title} className="product-image" /></div>)}
            </div>
        </div>
    );
};


// --- COMPONENT: LoginForm ---
const LoginForm = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    password_confirmation: '',
    account_type: 'customer', // NEW: Default account type for signup
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => setFormData({...formData, [e.target.name]: e.target.value });
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleFormSubmit = async (e) => {
      e.preventDefault();
      setError(null);
      setLoading(true);
      
      // CORRECTED: Endpoints now match your Laravel routes/api.php file
      const endpoint = isLogin ? `/api/auth/login` : `/api/auth/register`;
      
      try {
          // 1. Get a fresh CSRF cookie from Sanctum
          await apiClient.get('/sanctum/csrf-cookie');
          
          // 2. Send the login or register request
          await apiClient.post(endpoint, formData);
          
          // 3. If successful, fetch the user data to confirm session is active
          const { data: user } = await apiClient.get('/api/auth/me');
          
          // 4. Pass the user data up to the App component
          onLoginSuccess(user);
      } catch (err) {
          const errorMsg = err.response?.data?.message || err.message || 'An unknown error occurred.';
          const validationErrors = err.response?.data?.errors;
          if (validationErrors) {
              setError(Object.values(validationErrors).flat().join(' '));
          } else {
              setError(errorMsg);
          }
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="styled-wrapper">
      <div className="title-container">
        <svg className="food-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16 5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm4-4H4C2.9 1 2 1.9 2 3v11c0 1.1.9 2 2 2h3c0 3.31 2.69 6 6 6s6-2.69 6-6h3c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm-8 17c-2.21 0-4-1.79-4-4h8c0 2.21-1.79 4-4 4zm4-11H8V8h8v3zm0-5H8V4h8v3z"/></svg>
        <h1 className="form-title">SnackBox</h1>
      </div>
      <div className="toggle-container">
          <button onClick={() => setIsLogin(true)} className={`toggle-button ${isLogin ? 'active' : ''}`}>Sign In</button>
          <button onClick={() => setIsLogin(false)} className={`toggle-button ${!isLogin ? 'active' : ''}`}>Sign Up</button>
      </div>
      <form className="form" onSubmit={handleFormSubmit}>
        {error && <div className="error-message">{error}</div>}
        
        {!isLogin && (<div className="flex-column"><label>Name</label><div className="inputForm"><svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg><input type="text" name="name" className="input" placeholder="Enter your Name" value={formData.name} onChange={handleInputChange} required /></div></div>)}
        
        <div className="flex-column"><label>Email</label><div className="inputForm"><svg fill="currentColor" height={20} viewBox="0 0 32 32" width={20} xmlns="http://www.w3.org/2000/svg"><g id="Layer_3" data-name="Layer 3"><path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" /></g></svg><input type="email" name="email" className="input" placeholder="Enter your Email" value={formData.email} onChange={handleInputChange} required /></div></div>
        
        <div className="flex-column"><label>Password</label><div className="inputForm"><svg fill="currentColor" height={20} viewBox="-64 0 512 512" width={20} xmlns="http://www.w3.org/2000/svg"><path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" /><path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" /></svg><input type={showPassword ? "text" : "password"} name="password" className="input" placeholder="Enter your Password" value={formData.password} onChange={handleInputChange} required /><div onClick={togglePasswordVisibility} className="password-viewer-icon">{showPassword ? (<svg fill="currentColor" viewBox="0 0 576 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" /></svg>) : (<svg fill="currentColor" viewBox="0 0 640 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM288 192a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zm-96 64c0-35.3 28.7-64 64-64c11.3 0 21.9 3 31.2 8.4l-84.4 84.4c-5.4-9.3-8.4-19.9-8.4-31.2zm128 128c-35.3 0-64-28.7-64-64c0-11.3 3-21.9 8.4-31.2L303.6 304c9.3 5.4 19.9 8.4 31.2 8.4c35.3 0 64-28.7 64-64zM320 480c-80.8 0-145.5-36.8-192.6-80.6C81.9 344.3 50.2 293.1 35.5 259.1l81.6-64.2c22.7 36.1 52.3 64.8 86.2 79.4L320 480z"/></svg>)}</div></div></div>
        
        {!isLogin && (<div className="flex-column"><label>Confirm Password</label><div className="inputForm"><svg fill="currentColor" height={20} viewBox="-64 0 512 512" width={20} xmlns="http://www.w3.org/2000/svg"><path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" /><path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" /></svg><input type={showPassword ? "text" : "password"} name="password_confirmation" className="input" placeholder="Confirm Password" value={formData.password_confirmation} onChange={handleInputChange} required /></div></div>)}

        {!isLogin && (<div className="flex-column"><label>Account Type</label><div className="role-selector"><input type="radio" id="role-customer" name="account_type" value="customer" checked={formData.account_type === 'customer'} onChange={handleInputChange} /><label htmlFor="role-customer">Customer</label><input type="radio" id="role-staff" name="account_type" value="staff" checked={formData.account_type === 'staff'} onChange={handleInputChange} /><label htmlFor="role-staff">Staff</label></div></div>)}
        
        {isLogin && (<div className="flex-row"><div><input type="checkbox" id="remember-me" /><label htmlFor="remember-me">Remember me</label></div><span className="span">Forgot password?</span></div>)}
        
        <button className="button-submit" disabled={loading}>{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}</button>
      </form>
    </div>
  );
}


// --- MAIN EXPORTED COMPONENT for this file ---
const LoginPage = ({ onLoginSuccess }) => {
    return (
        <>
            <AppStyles />
            <div className="page-container">
                <div className="form-panel">
                    <LoginForm onLoginSuccess={onLoginSuccess} />
                </div>
                <div className="slider-panel">
                    <HeroParallax />
                </div>
            </div>
        </>
    );
};

export default LoginPage;


