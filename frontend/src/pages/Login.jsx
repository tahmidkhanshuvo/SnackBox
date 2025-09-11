import React, { useState, useEffect } from 'react';

// --- STYLES COMPONENT ---
// All styles from styled-components have been converted to regular CSS
// and are injected via this component. This removes the external dependency.
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
    }
    .form-panel {
      width: 40%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f0f2f5;
      padding: 2rem;
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
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background-color: #ffffff;
      padding: 30px;
      width: 450px;
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
    }
    .inputForm {
      border: 1.5px solid #ecedec;
      border-radius: 10px;
      height: 50px;
      display: flex;
      align-items: center;
      padding: 0 15px 0 10px; /* Adjusted padding */
      transition: 0.2s ease-in-out;
      background-color: #fff;
    }
    .inputForm svg {
        color: #8a8a8a;
        flex-shrink: 0; /* Prevent icons from shrinking */
    }
    .input {
      margin-left: 10px;
      border-radius: 10px;
      border: none;
      width: 100%;
      height: 100%;
      background: transparent;
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
      margin: 20px 0 10px 0;
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
      transition: transform 0.4s ease-out;
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
      transition: transform 0.5s ease;
    }
    .product-image:hover {
      transform: scale(1.1);
    }
  `}</style>
);


// --- COMPONENT: HeroParallax ---
const products = [
    { title: "Gourmet Burgers", link: "#", thumbnail: "https://images.unsplash.com/photo-1568901346375-23c9450c58sl?q=80&w=1998" },
    { title: "Artisanal Pizza", link: "#", thumbnail: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=1928" },
    { title: "Fresh Salads", link: "#", thumbnail: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1974" },
    { title: "Decadent Desserts", link: "#", thumbnail: "https://images.unsplash.com/photo-1567684014761-b65e2e596b63?q=80&w=1974" },
    { title: "Craft Coffee", link: "#", thumbnail: "https://images.unsplash.com/photo-1511920183353-30a5d4d202d5?q=80&w=1974" },
    { title: "Sushi Platters", link: "#", thumbnail: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070" },
    { title: "Breakfast Bowls", link: "#", thumbnail: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=1964" },
    { title: "Hearty Soups", link: "#", thumbnail: "https://images.unsplash.com/photo-1547592180-85f1d35a80f5?q=80&w=2070" },
    { title: "Pasta Creations", link: "#", thumbnail: "https://images.unsplash.com/photo-1598866594240-a3b5a950de65?q=80&w=1974" },
    { title: "Taco Fiesta", link: "#", thumbnail: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?q=80&w=1974" },
    { title: "Fresh Juices", link: "#", thumbnail: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=1974" },
    { title: "Seafood Delights", link: "#", thumbnail: "https://images.unsplash.com/photo-1580462261025-a1c27a96431f?q=80&w=1974" },
    { title: "Vegan Wonders", link: "#", thumbnail: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070" },
    { title: "Cheese Boards", link: "#", thumbnail: "https://images.unsplash.com/photo-1627998634947-a417462a7c4f?q=80&w=1965" },
    { title: "Steakhouse Classics", link: "#", thumbnail: "https://images.unsplash.com/photo-1546964124-6cce460f3854?q=80&w=2070" },
];

const HeroParallax = () => {
    const [translate, setTranslate] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTranslate(prev => (prev > 50 ? -50 : prev + 0.5));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const firstRow = products.slice(0, 5);
    const secondRow = products.slice(5, 10);
    const thirdRow = products.slice(10, 15);

    return (
        <div className="parallax-container">
            <div className="parallax-header">
                <h1 className="parallax-title">Discover Delicious</h1>
                <p className="parallax-subtitle">A curated collection of culinary delights, just for you.</p>
            </div>
            <div className="parallax-row" style={{ transform: `translateX(-${translate}px)` }}>
                {firstRow.map(product => (
                    <div className="product-card" key={product.title}>
                        <img src={product.thumbnail} alt={product.title} className="product-image" />
                    </div>
                ))}
            </div>
            <div className="parallax-row" style={{ transform: `translateX(${translate}px)` }}>
                {secondRow.map(product => (
                    <div className="product-card" key={product.title}>
                        <img src={product.thumbnail} alt={product.title} className="product-image" />
                    </div>
                ))}
            </div>
             <div className="parallax-row" style={{ transform: `translateX(-${translate}px)` }}>
                {thirdRow.map(product => (
                    <div className="product-card" key={product.title}>
                        <img src={product.thumbnail} alt={product.title} className="product-image" />
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- COMPONENT: LoginPage form ---
const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
  }

  return (
    <div className="styled-wrapper">
      <div className="title-container">
            <svg className="food-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M16 5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm4-4H4C2.9 1 2 1.9 2 3v11c0 1.1.9 2 2 2h3c0 3.31 2.69 6 6 6s6-2.69 6-6h3c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm-8 17c-2.21 0-4-1.79-4-4h8c0 2.21-1.79 4-4 4zm4-11H8V8h8v3zm0-5H8V4h8v3z"/>
            </svg>
            <h1 className="form-title">SnackBox</h1>
        </div>
      <form className="form">
        <div className="flex-column">
          <label>Email </label></div>
        <div className="inputForm">
          <svg fill="currentColor" height={20} viewBox="0 0 32 32" width={20} xmlns="http://www.w3.org/2000/svg"><g id="Layer_3" data-name="Layer 3"><path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" /></g></svg>
          <input type="text" className="input" placeholder="Enter your Email" />
        </div>
        <div className="flex-column">
          <label>Password </label></div>
        <div className="inputForm">
          <svg fill="currentColor" height={20} viewBox="-64 0 512 512" width={20} xmlns="http://www.w3.org/2000/svg"><path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" /><path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" /></svg>
          <input type={showPassword ? "text" : "password"} className="input" placeholder="Enter your Password" />
          <div onClick={togglePasswordVisibility} className="password-viewer-icon">
            {showPassword ? (
                 <svg fill="currentColor" viewBox="0 0 576 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" /></svg>
            ) : (
                <svg fill="currentColor" viewBox="0 0 640 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM288 192a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zm-96 64c0-35.3 28.7-64 64-64c11.3 0 21.9 3 31.2 8.4l-84.4 84.4c-5.4-9.3-8.4-19.9-8.4-31.2zm128 128c-35.3 0-64-28.7-64-64c0-11.3 3-21.9 8.4-31.2L303.6 304c9.3 5.4 19.9 8.4 31.2 8.4c35.3 0 64-28.7 64-64zM320 480c-80.8 0-145.5-36.8-192.6-80.6C81.9 344.3 50.2 293.1 35.5 259.1l81.6-64.2c22.7 36.1 52.3 64.8 86.2 79.4L320 480z"/></svg>
            )}
          </div>
        </div>
        <div className="flex-row">
          <div>
            <input type="checkbox" id="remember-me" />
            <label htmlFor="remember-me">Remember me </label>
          </div>
          <span className="span">Forgot password?</span>
        </div>
        <button className="button-submit">Sign In</button>
        <p className="p">Don't have an account? <span className="span">Sign Up</span>
        </p><p className="p line">Or With</p>
        <div className="flex-row">
          <button className="btn google">
            <svg version="1.1" width={20} id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style={{enableBackground: 'new 0 0 512 512'}} xmlSpace="preserve">
              <path style={{fill: '#FBBB00'}} d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256 c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456 C103.821,274.792,107.225,292.797,113.47,309.408z" />
              <path style={{fill: '#518EF8'}} d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451 c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535 c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z" />
              <path style={{fill: '#28B446'}} d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512 c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771 c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z" />
              <path style={{fill: '#F14336'}} d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012 c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0 C318.115,0,375.068,22.126,419.404,58.936z" />
            </svg>
            Google
          </button><button className="btn apple">
            <svg fill="currentColor" version="1.1" height={20} width={20} id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 22.773 22.773" style={{enableBackground: 'new 0 0 22.773 22.773'}} xmlSpace="preserve"> <g> <g> <path d="M15.769,0c0.053,0,0.106,0,0.162,0c0.13,1.606-0.483,2.806-1.228,3.675c-0.731,0.863-1.732,1.7-3.351,1.573 c-0.108-1.583,0.506-2.694,1.25-3.561C13.292,0.879,14.557,0.16,15.769,0z" /> <path d="M20.67,16.716c0,0.016,0,0.03,0,0.045c-0.455,1.378-1.104,2.559-1.896,3.655c-0.723,0.995-1.609,2.334-3.191,2.334 c-1.367,0-2.275-0.879-3.676-0.903c-1.482-0.024-2.297,0.735-3.652,0.926c-0.155,0-0.31,0-0.462,0 c-0.995-0.144-1.798-0.932-2.383-1.642c-1.725-2.098-3.058-4.808-3.306-8.276c0-0.34,0-0.679,0-1.019 c0.105-2.482,1.311-4.5,2.914-5.478c0.846-0.52,2.009-0.963,3.304-0.765c0.555,0.086,1.122,0.276,1.619,0.464 c0.471,0.181,1.06,0.502,1.618,0.485c0.378-0.011,0.754-0.208,1.135-0.347c1.116-0.403,2.21-0.865,3.652-0.648 c1.733,0.262,2.963,1.032,3.723,2.22c-1.466,0.933-2.625,2.339-2.427,4.74C17.818,14.688,19.086,15.964,20.67,16.716z" /> </g></g></svg>
            Apple
          </button></div></form>
    </div>
  );
}


// --- Main App Component ---
const EnhancedLoginPage = () => {
  return (
    // React.Fragment is used to return multiple elements
    <>
      <AppStyles />
      <div className="page-container">
        <div className="form-panel">
          <LoginPage />
        </div>
        <div className="slider-panel">
          <HeroParallax />
        </div>
      </div>
    </>
  );
};

export default EnhancedLoginPage;

