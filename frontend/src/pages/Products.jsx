import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import AuthBottomSheet from "../components/AuthBottomSheet";
import NetworkError from "../components/NetworkError";
import NamePromptModal from "../components/NamePromptModal";

const DEFAULT_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF' class='w-8 h-8'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'/></svg>";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [cartSummary, setCartSummary] = useState({ items: 0, total: 0 });
  const [showToast, setShowToast] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);

  useEffect(() => {
    fetchInitialData();
    checkAndPromptName();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchCartSummary(),
        fetchCart(),
      ]);
      setNetworkError(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.log("Failed to fetch categories", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products/active/all");
      setProducts(res.data);
    } catch (error) {
      if (!navigator.onLine || !error.response) {
        setNetworkError(true);
        throw error;
      }
      toast.error("Failed to fetch products");
    }
  };

  const checkAndPromptName = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const timer = setTimeout(() => {
      let user = {};
      try {
        user = JSON.parse(localStorage.getItem("user")) || {};
      } catch (e) {
        user = {};
      }

      if (!user.name || user.name.trim() === "") {
        setShowNameModal(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  };

  const handleSaveName = async (enteredName) => {
    const token = localStorage.getItem("token");
    try {
      await api.put(
        "/user/profile",
        { name: enteredName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let user = {};
      try {
        user = JSON.parse(localStorage.getItem("user")) || {};
      } catch (e) {
        user = {};
      }

      const updatedUser = { ...user, name: enteredName };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setShowNameModal(false);
      toast.success(`Welcome, ${enteredName}!`);
    } catch (error) {
      console.log("Failed to update name:", error);
      toast.error("Could not save name");
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/cart/${cartItemId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
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
      if (!token) return;
      const res = await api.get("/cart/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartSummary(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
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
      if (!token) {
        setShowLogin(true);
        return;
      }

      await api.post(
        "/cart/add",
        { product_id: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Added to cart");
      fetchCartSummary();
      fetchCart();
      setShowToast(true);

      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.log(error);
      toast.error("Failed to add product");
    }
  };

  if (networkError) return <NetworkError onRetry={fetchInitialData} />;

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
        product.category_name?.toLowerCase() === selectedCategory.toLowerCase();

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

  return (
    <>
      <div className="w-full min-h-screen bg-[#F4F6FB] pb-32 text-[#0f172a] antialiased font-sans selection:bg-purple-600 selection:text-white">
        <Navbar />

        {/* Promo Header Banner */}
        <div className="w-full max-w-full overflow-hidden bg-gradient-to-r from-[#7A22FD] via-[#D119A5] to-[#FF4E6B] text-white text-[11px] font-bold py-2.5 px-4 text-center tracking-wide flex items-center justify-center gap-3 shadow-sm">
          <span className="bg-[#FFD424] text-black text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider">
            FREE DELIVERY
          </span>
          <span className="opacity-95">
            Get your order in 10 minutes • Min. basket ₹99
          </span>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 pt-6 pb-32 md:pb-20 min-h-screen">
          
          {/* Search & Filter Header */}
          <div className="sticky top-16 z-30 bg-[#F4F6FB]/95 backdrop-blur-md py-3 mb-6">
            <div className="flex flex-row items-center gap-2 sm:gap-3 w-full">
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

              <div className="relative shrink-0 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-purple-300 transition-colors">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
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
                <div className="h-10 sm:h-[46px] w-10 sm:w-[46px] flex items-center justify-center relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  {sortBy && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-purple-600 ring-2 ring-white"></span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Instamart Categories Grid Header */}
          {/* Instamart Categories Grid Header */}
{/* Instamart Categories Grid Header */}
<div className="mb-8 w-full">
  <div className="flex items-center justify-between mb-4 px-1">
    <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#0f172a]">
      Explore Categories
    </h2>
    {selectedCategory !== "All" && (
      <button
        onClick={() => setSelectedCategory("All")}
        className="text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 transition-all"
      >
        Clear Filter ✕
      </button>
    )}
  </div>

  {/* Combine "All" option with dynamic categories */}
  {(() => {
    const allCategoriesList = [
      { id: "all-deals", name: "All Deals", isAll: true },
      ...categories,
    ];

    {/* Chunk category list into rows of maximum 6 items */}
    return Array.from({ length: Math.ceil(allCategoriesList.length / 6) }).map(
      (_, rowIndex) => {
        const rowCategories = allCategoriesList.slice(
          rowIndex * 6,
          rowIndex * 6 + 6
        );

        return (
          <div
            key={rowIndex}
            className="flex overflow-x-auto gap-3.5 pb-3 pt-1 scrollbar-none snap-x snap-mandatory mb-3"
          >
            {rowCategories.map((cat) => {
              if (cat.isAll) {
                const isSelected = selectedCategory === "All";
                return (
                  <div
                    key="all-deals"
                    onClick={() => setSelectedCategory("All")}
                    className={`shrink-0 w-24 sm:w-28 snap-start cursor-pointer group flex flex-col items-center text-center p-2.5 rounded-2xl border transition-all duration-200 ${
                      isSelected
                        ? "bg-purple-600 border-purple-600 text-white shadow-md scale-105"
                        : "bg-white border-slate-200/80 hover:border-purple-300 text-slate-800 shadow-sm"
                    }`}
                  >
                    <div
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center p-2 mb-2 transition-colors ${
                        isSelected ? "bg-white/20" : "bg-purple-50"
                      }`}
                    >
                      <span className="text-3xl">✨</span>
                    </div>
                    <span className="text-xs font-extrabold leading-snug break-words w-full px-0.5">
                      All Deals
                    </span>
                  </div>
                );
              }

              const isSelected =
                selectedCategory.toLowerCase() === cat.name?.toLowerCase();

              return (
                <div
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory(isSelected ? "All" : cat.name)
                  }
                  className={`shrink-0 w-24 sm:w-28 snap-start cursor-pointer group flex flex-col items-center text-center p-2.5 rounded-2xl border transition-all duration-200 ${
                    isSelected
                      ? "bg-purple-600 border-purple-600 text-white shadow-md scale-105"
                      : "bg-white border-slate-200/80 hover:border-purple-300 text-slate-800 shadow-sm"
                  }`}
                >
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center p-2 mb-2 overflow-hidden transition-colors ${
                      isSelected ? "bg-white/20" : "bg-slate-50"
                    }`}
                  >
                    <img
                      src={cat.image || DEFAULT_IMAGE}
                      alt={cat.name}
                      onError={(e) => {
                        e.target.src = DEFAULT_IMAGE;
                      }}
                      className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-110 transition-transform duration-200"
                    />
                  </div>

                  <span className="text-xs font-extrabold leading-snug break-words w-full px-0.5">
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        );
      }
    );
  })()}
</div>
          {/* Products List Viewport */}
        {/* Products Horizontal Carousel Section */}
{/* Products Grid Section */}
{/* Products Grid Section */}
{/* Products Horizontal Carousel Section */}
{/* Products Horizontal Carousel Section */}
{/* Products Grid & Multi-Row Section */}
<div className="w-full">
  <div className="mb-5 flex items-center justify-between px-1">
    <h2 className="text-xl font-extrabold tracking-tight text-[#0f172a]">
      {selectedCategory === "All" ? "Buy Fresh Essentials" : `${selectedCategory}`}
    </h2>
    <span className="text-xs font-black text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
      {filteredProducts.length} Items
    </span>
  </div>

  {/* Chunk array into rows of 6 items max */}
  {Array.from({ length: Math.ceil(filteredProducts.length / 6) }).map((_, rowIndex) => {
    const rowProducts = filteredProducts.slice(rowIndex * 6, rowIndex * 6 + 6);

    return (
      <div key={rowIndex} className="mb-6">
        {/* Horizontal scrollable row: exactly 2 cards visible on mobile (~w-[calc(50%-7px)]), 5-6 cards on larger screens */}
        <div className="flex overflow-x-auto gap-3.5 pb-2 pt-1 scrollbar-none snap-x snap-mandatory max-w-full">
          {rowProducts.map((product) => (
            <div
              key={product.id}
              className="shrink-0 w-[calc(50%-7px)] sm:w-[170px] md:w-[185px] lg:w-[200px] snap-start bg-white rounded-3xl border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between p-3.5 relative group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <div>
                <div className="aspect-square bg-[#F8FAFC] rounded-2xl flex items-center justify-center p-2.5 sm:p-3 mb-2.5 relative overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="max-h-20 sm:max-h-28 max-w-full object-contain mix-blend-multiply transform group-hover:scale-105 transition-transform duration-200"
                  />
                  
                  {Number(product.price) >= 150 && Number(product.price) < 200 && (
                    <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-[#a855f7] text-white font-black text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-sm">
                      5% OFF
                    </div>
                  )}

                  {Number(product.price) >= 200 && (
                    <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-[#a855f7] text-white font-black text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-sm">
                      10% OFF
                    </div>
                  )}

                  {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                    <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 bg-[#fc3b67] text-white font-black text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-sm">
                      {product.stock_quantity} LEFT
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 bg-white/90 backdrop-blur-sm border border-slate-100 px-1.5 sm:px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                    <span className="text-amber-500 text-[9px] sm:text-[10px]">⚡</span>
                    <span className="text-[8px] sm:text-[9px] font-black text-slate-700 uppercase tracking-wider">10 MIN</span>
                  </div>
                </div>

                <div className="inline-flex items-center text-[9px] sm:text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mb-1 uppercase tracking-wide">
                  {product.unit || "1 pc"}
                </div>

                <h3 className="text-xs sm:text-sm font-extrabold text-[#0f172a] line-clamp-2 min-h-[32px] sm:min-h-[36px] leading-snug">
                  {product.name}
                </h3>

                <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-medium">
                  {product.description || "Premium quality grocery store item."}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-50 flex items-center justify-between gap-1">
                <div className="flex items-baseline gap-0.5 sm:gap-1">
                  <span className="text-xs sm:text-base font-black text-[#0f172a]">
                    ₹{product.price}
                  </span>
                  {product.price > 100 && (
                    <span className="text-[9px] sm:text-xs text-slate-400 line-through font-bold">
                      ₹{Math.round(product.price * 1.15)}
                    </span>
                  )}
                </div>

                <div className="w-[60px] sm:w-[84px]">
                  {getCartItem(product.id) ? (
                    <div className="flex items-center justify-between bg-white border-2 border-[#a855f7] text-[#a855f7] rounded-xl h-7 sm:h-9 overflow-hidden font-black text-xs shadow-sm">
                      <button
                        onClick={() => {
                          const item = getCartItem(product.id);
                          if (item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1);
                          } else {
                            removeFromCart(item.id);
                          }
                        }}
                        className="w-1/3 h-full flex items-center justify-center hover:bg-purple-50 transition-all duration-200 active:scale-90 font-black"
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
                        className="w-1/3 h-full flex items-center justify-center hover:bg-purple-50 transition-all duration-200 active:scale-90 font-black"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-full h-7 sm:h-9 text-[9px] sm:text-xs bg-white border border-[#a855f7] text-[#a855f7] hover:bg-purple-600 hover:text-white font-black rounded-xl uppercase tracking-wider transition-all active:scale-95 text-center shadow-sm"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  })}

  {filteredProducts.length === 0 && (
    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 max-w-sm mx-auto mt-6 shadow-sm">
      <h2 className="text-sm font-bold text-slate-700">No items match filters</h2>
      <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 px-4 font-medium">
        Try selecting another category or typing another search term.
      </p>
    </div>
  )}
</div>
        </div>

        {/* Sync Toast Notification */}
        {showToast && (
          <div className="fixed bottom-36 md:bottom-24 left-1/2 transform -translate-x-1/2 bg-[#0f172a] text-white text-[11px] font-bold px-5 py-2.5 rounded-full shadow-xl z-50 animate-fade-in tracking-wide pointer-events-none">
            🛒 Shopping basket synchronized!
          </div>
        )}

        {/* Floating Checkout Drawer Anchor */}
        {cartSummary.items > 0 && (
          <div className="fixed bottom-16 md:bottom-4 left-0 right-0 px-4 z-40 transition-all duration-300">
            <div className="max-w-xl mx-auto bg-gradient-to-r from-[#7A22FD] via-[#D119A5] to-[#FF4E6B] text-white rounded-2xl p-3 flex justify-between items-center shadow-xl shadow-purple-500/20">
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

      <NamePromptModal
        show={showNameModal}
        onSubmit={handleSaveName}
        onClose={() => setShowNameModal(false)}
      />

      <AuthBottomSheet
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => { setShowLogin(false); }}
      />
    </>
  );
}

export default Products;