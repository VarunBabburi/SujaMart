import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import AuthBottomSheet from "../components/AuthBottomSheet";
import NetworkError from "../components/NetworkError";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [cartSummary, setCartSummary] = useState({
    items: 0,
    total: 0,
  });
  const [showToast, setShowToast] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [showLogin,setShowLogin] =useState(false);
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCartSummary();
    fetchCart();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products/active/all");
      setProducts(res.data);
      setNetworkError(false);
    } catch (error) {
      console.log(error);
      if (!navigator.onLine || !error.response) {
      setNetworkError(true);
      return;
    }
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/cart/${cartItemId}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchCart();
      fetchCartSummary();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCartSummary = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/cart/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCartSummary(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCartItems(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(`/cart/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchCart();
      fetchCartSummary();
    } catch (error) {
      console.log(error);
    }
  };

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if(!token){
        setShowLogin(true);
        return;
      }

      await api.post(
        "/cart/add",
        {
          product_id: productId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Added to cart");

      fetchCartSummary();
      fetchCart();

      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    } catch (error) {
      console.log(error);
      toast.error("Failed to add product");
    }
  };

  if (networkError) {
  return <NetworkError onRetry={fetchProducts} />;
}

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex flex-col items-center justify-center font-sans">
        <Navbar />
        <div className="relative flex items-center justify-center">
          <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-purple-400 opacity-75"></div>
          <div className="relative rounded-full h-14 w-14 border-4 border-t-purple-600 border-r-slate-200 border-b-slate-200 border-l-slate-200 animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-bold text-slate-500 tracking-wide">
          Loading items...
        </p>
      </div>
    );
  }

  const getCartItem = (productId) => {
    return cartItems.find((item) => item.product_id === productId);
  };

  const filteredProducts = products
    .filter((product) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        product.name?.toLowerCase().includes(keyword) ||
        product.description?.toLowerCase().includes(keyword) ||
        product.category_name?.toLowerCase().includes(keyword) ||
        product.unit?.toLowerCase().includes(keyword);

      const matchesCategory =
        selectedCategory === "All" ||
        product.category_name === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "nameAsc":
          return a.name.localeCompare(b.name);
        case "nameDesc":
          return b.name.localeCompare(a.name);
        case "priceLow":
          return Number(a.price) - Number(b.price);
        case "priceHigh":
          return Number(b.price) - Number(a.price);
        case "stockLow":
          return a.stock_quantity - b.stock_quantity;
        case "stockHigh":
          return b.stock_quantity - a.stock_quantity;
        default:
          return 0;
      }
    });

  const categoryMeta = {
    All: { label: " All Deals", icon: "✨" },
    Snacks: { label: " Snacks & Munchies", icon: "🍿" },
    Masala: { label: " Spices & Masalas", icon: "🌶️" },
    Oils: { label: " Oils & Ghee", icon: "🧴" },
    Rice: { label: " Atta & Rice", icon: "🌾" },
    Chocolate: { label: " Sweet Cravings", icon: "🍫" },
    vegetables: { label: " Fresh Veggies", icon: "🍅" },
  };

  return (
    <>
    {/* Soft off-white canvas framework */}
   
    <div className="w-full min-h-screen bg-[#F4F6FB] pb-32 text-[#0f172a] antialiased font-sans selection:bg-purple-600 selection:text-white">
      
      <Navbar />

      {/* FIXED: Absolute edge-to-edge full width Pink Promo Container block */}
      <div className="w-full max-w-full overflow-hidden bg-gradient-to-r from-[#7A22FD] via-[#D119A5] to-[#FF4E6B] text-white text-[11px] font-bold py-2.5 px-4 text-center tracking-wide flex items-center justify-center gap-3 shadow-sm">
  <span className="bg-[#FFD424] text-black text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider">
    FREE DELIVERY
  </span>
  <span className="opacity-95">
    Get your order in 10 minutes • Min. basket ₹99
  </span>
</div>


      {/* Main Grid viewport container bounded inside fluid screen margins */}
      <div className="max-w-[1440px] mx-auto px-4 pt-6 pb-32 md:pb-20 min-h-screen">
        
        {/* Crisp Search & Filter Row */}
        <div className="sticky top-16 z-30 bg-[#F4F6FB]/95 backdrop-blur-md py-3 mb-6 ">

        <div className="flex flex-row items-center gap-2 sm:gap-3 w-full">
          
          {/* Main White Border-Rounded Search Bar */}
          <div className="relative flex-1 min-w-0 rounded-2xl bg-white border border-slate-200 shadow-sm focus-within:border-purple-400 transition-all duration-200">
            <input
              type="text"
              placeholder='Search "chips", "cooking oil", "atta"...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent py-3.5 pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
            />
            <div className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Clean Dropdown matching screenshot */}
          <div className="relative shrink-0 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-purple-300 transition-colors">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              //className="w-full bg-transparent py-3.5 pl-10 pr-10 text-sm font-bold text-slate-600 focus:outline-none appearance-none cursor-pointer"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        title="Sort Products"
            >
              <option value="">Sort by</option>
              <option value="nameAsc">Name (A-Z)</option>
              <option value="nameDesc">Name (Z-A)</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="stockLow">Availability: Low Stock</option>
              <option value="stockHigh">Availability: High Stock</option>
            </select>
            {/* Visible Action Icon & Active Indicator */}
      <div className="h-10 sm:h-[46px] w-10 sm:w-[46px] flex items-center justify-center relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        {/* Active Sort Dot indicator */}
        {sortBy && (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-purple-600 ring-2 ring-white"></span>
        )}
      </div>
    </div>

  </div>
  </div>

        {/* Traditional 2-Column Responsive Blueprint */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* LEFT RAIL CATEGORY ITEMS */}
          <div className="w-full max-w-full overflow-x-auto lg:w-64 flex lg:flex-col gap-2 overflow-x-auto pb-3 lg:pb-0 scrollbar-none lg:sticky lg:top-40 z-20 shrink-0">
            {Object.keys(categoryMeta).map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-black tracking-wide border transition-all duration-200 hover:scale-[1.02] flex items-center gap-3 shadow-sm ${
                    isSelected
  ? "bg-gradient-to-br from-fuchsia-600 to-purple-600 border-transparent text-white"
  : "bg-white border-slate-100 text-[#1e293b] hover:bg-slate-50"

                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${isSelected ? "bg-amber-400" : "bg-slate-300"}`}></span>
                  <span className="text-sm">{categoryMeta[cat].icon}</span>
                  <span>{categoryMeta[cat].label}</span>
                </button>
              );
            })}
          </div>

          {/* MAIN PRODUCT VIEWPORT DECK */}
          <div className="flex-grow w-full">
            
            {/* Title Strip Info Badge */}
            <div className="mb-5 flex items-center justify-between px-1">
              <h2 className="text-xl font-extrabold tracking-tight text-[#0f172a]">
                Buy Fresh Essentials
              </h2>
              <span className="text-xs font-black text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {filteredProducts.length} Items
              </span>
            </div>

            {/* Custom High-Fidelity App Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between p-4 relative group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div>
                    {/* Centered product frame with subtle tint */}
                    <div className="aspect-square bg-[#F8FAFC] rounded-2xl flex items-center justify-center p-4 mb-3 relative overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="max-h-28 sm:max-h-36 max-w-full object-contain mix-blend-multiply transform group-hover:scale-105 transition-transform duration-200"
                      />
                      
                      {/* Top left 15% OFF badge style label */}
                      <div className="absolute top-3 left-3 bg-[#a855f7] text-white font-black text-[9px] px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-sm">
                        15% OFF
                      </div>

                      {/* Top right custom limited quantity counter */}
                      {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                        <div className="absolute top-3 right-3 bg-[#fc3b67] text-white font-black text-[9px] px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-sm">
                          {product.stock_quantity} LEFT
                        </div>
                      )}

                      {/* Lower left 10 MIN delivery badge */}
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm border border-slate-100 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                        <span className="text-amber-500 text-[10px]">⚡</span>
                        <span className="text-[9px] font-black text-slate-700 uppercase tracking-wider">10 MIN</span>
                      </div>
                    </div>

                    {/* Weight Metric Pack */}
                    <div className="inline-flex items-center text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mb-1.5 uppercase tracking-wide">
                      {product.unit || "1 pc"}
                    </div>

                    {/* Product Main Header Title */}
                    <h3 className="text-sm font-extrabold text-[#0f172a] line-clamp-2 min-h-[40px] leading-snug">
                      {product.name}
                    </h3>

                    {/* Faded short secondary text */}
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 font-medium">
                      {product.description || "Premium quality grocery store item."}
                    </p>
                  </div>

                  {/* Operational Footer Row Interface */}
                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-1">
                    
                    {/* Prices with strike-through text */}
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-black text-[#0f172a]">
                        ₹{product.price}
                      </span>
                      {product.price > 100 && (
                        <span className="text-xs text-slate-400 line-through font-bold">
                          ₹{Math.round(product.price * 1.15)}
                        </span>
                      )}
                    </div>

                    {/* Elegant Purple App ADD Action Box Component */}
                    <div className="w-[80px] sm:w-24">
                      {getCartItem(product.id) ? (
                        <div className="flex items-center justify-between bg-white border-2 border-[#a855f7] text-[#a855f7] rounded-xl h-9 overflow-hidden font-black text-sm shadow-sm">
                          <button
                            onClick={() => {
                              const item = getCartItem(product.id);
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              } else {
                                removeFromCart(item.id);
                              }
                            }}
                            className="w-1/3 h-full flex items-center justify-center hover:bg-purple-50 transition-all duration-200 active:scale-90 font-black text-base"
                          >
                            -
                          </button>
                          <span className="w-1/3 text-center font-black text-xs">
                            {getCartItem(product.id).quantity}
                          </span>
                          <button
                            onClick={() => {
                              const item = getCartItem(product.id);
                              updateQuantity(item.id, item.quantity + 1);
                            }}
                            className="w-1/3 h-full flex items-center justify-center hover:bg-purple-50 transition-all duration-200 active:scale-90 font-black text-base"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product.id)}
                          className="w-full h-9 text-[11px] sm:text-xs bg-white border border-[#a855f7] text-[#a855f7] hover:bg-purple-600 hover:text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all active:scale-95 text-center shadow-sm"
                        >
                          Add
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Zero State Fallback Module */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 max-w-sm mx-auto mt-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-700">No items match filters</h2>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 px-4 font-medium">
                  Try typing another combination or checking alternative categories.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Floating System Sync Toast Notifications */}
      {showToast && (
        <div className="fixed bottom-36 md:bottom-24 left-1/2 transform -translate-x-1/2 bg-[#0f172a] text-white text-[11px] font-bold px-5 py-2.5 rounded-full shadow-xl z-50 animate-fade-in tracking-wide pointer-events-none">
          🛒 Shopping basket synchronized!
        </div>
      )}

      {/* High Conversion Floating Checkout Drawer Anchor */}
      {cartSummary.items > 0 && (
        <div className="fixed bottom-16 md:bottom-4 left-0 right-0 px-4 z-40 transition-all duration-300">
          <div className="max-w-xl mx-auto bg-gradient-to-r from-[#7A22FD] via-[#D119A5] to-[#FF4E6B]
 text-white rounded-2xl p-3 flex justify-between items-center shadow-xl shadow-purple-500/20">
            <div className="flex items-center gap-3 pl-1">
              <div className="bg-white/20 rounded-xl h-9 w-9 flex items-center justify-center text-base shadow-inner">
                🛍️
              </div>
              <div>
                <div className="text-[10px] font-black text-purple-100 tracking-wider uppercase">
                  {cartSummary.items} {cartSummary.items === 1 ? "Item" : "Items"} Chosen
                </div>
                <div className="text-base font-black text-white tracking-tight">
                  ₹{cartSummary.total}
                </div>
              </div>
            </div>

            <button
              onClick={() => (window.location.href = "/cart")}
              className="bg-slate-950 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow transition-all duration-200 active:scale-95 flex items-center gap-1"
            >
              View Cart
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
    

    <AuthBottomSheet
      show={showLogin}
      onClose={()=> setShowLogin(false)}
      onSuccess={()=>{ setShowLogin(false); }}
    />
    </>
  );
}

export default Products;