import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import AuthBottomSheet from "../components/AuthBottomSheet";
import NetworkError from "../components/NetworkError";
import NamePromptModal from "../components/NamePromptModal";

const DEFAULT_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'/></svg>";

/* ---------- small presentational helpers ---------- */

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
  </svg>
);

const SortIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h12M3 12h8m-8 5h4m9-9v10m0 0l-3-3m3 3l3-3" />
  </svg>
);

const SectionTitle = ({ title, right }) => (
  <div className="flex items-center justify-between mb-4 px-0.5">
    <h2 className="text-[17px] sm:text-xl font-extrabold tracking-tight text-slate-900">
      {title}
    </h2>
    {right}
  </div>
);

const ProductSkeleton = () => (
  <div className="bg-white rounded-3xl p-3 border border-slate-100 animate-pulse">
    <div className="aspect-square rounded-2xl bg-slate-100 mb-3" />
    <div className="h-3 w-12 rounded bg-slate-100 mb-2" />
    <div className="h-3.5 w-full rounded bg-slate-100 mb-1.5" />
    <div className="h-3.5 w-2/3 rounded bg-slate-100 mb-4" />
    <div className="h-5 w-16 rounded bg-slate-100" />
  </div>
);

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
  const [showTopBtn, setShowTopBtn] = useState(false);
  const productsSectionRef = useRef(null);

  // Ad slider
  const TOTAL_SLIDES = 3;
  const [activeSlide, setActiveSlide] = useState(0);
  const [sliderPaused, setSliderPaused] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => {
    fetchInitialData();
    checkAndPromptName();
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-advance ad slides every 4 seconds (pauses on hover / touch)
  useEffect(() => {
    if (sliderPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % TOTAL_SLIDES);
    }, 4000);
    return () => clearInterval(timer);
  }, [sliderPaused]);

  const handleSlideTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      setActiveSlide((prev) =>
        diff < 0 ? (prev + 1) % TOTAL_SLIDES : (prev - 1 + TOTAL_SLIDES) % TOTAL_SLIDES
      );
    }
    touchStartX.current = null;
    setSliderPaused(false);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearch(query);

    // Smooth scroll to product grid when user types
    if (query.trim().length > 0 && productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);

    // Smooth scroll to the products section
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
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
      <div className="min-h-screen bg-[#F5F3FF] font-sans">
        <Navbar />
        <div className="max-w-[1440px] mx-auto px-4 pt-5">
          <div className="h-36 sm:h-44 rounded-3xl bg-gradient-to-r from-[#7A22FD]/30 to-[#FF4E6B]/30 animate-pulse mb-5" />
          <div className="h-12 rounded-2xl bg-white animate-pulse mb-6" />
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 mb-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </div>
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

  const allCategoriesList = [{ id: "all-deals", name: "All", isAll: true }, ...categories];

  return (
    <>
      <div className="w-full min-h-screen bg-[#F5F3FF] pb-32 text-slate-900 antialiased font-sans selection:bg-purple-600 selection:text-white">
        <Navbar />

        <div className="max-w-[1440px] mx-auto px-4 pt-4 sm:pt-5">
          {/* ---------- Hero banner ---------- */}
          <div>
          <div
            className="relative overflow-hidden rounded-3xl shadow-xl shadow-purple-500/20"
            onMouseEnter={() => setSliderPaused(true)}
            onMouseLeave={() => setSliderPaused(false)}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
              setSliderPaused(true);
            }}
            onTouchEnd={handleSlideTouchEnd}
          >
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
          {/* Slide 1 */}
          <div className="relative w-full shrink-0 overflow-hidden bg-gradient-to-br from-[#6D1BEA] via-[#B318B0] to-[#FF4E6B] text-white p-5 sm:p-8">
            <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10" />

            <div className="relative flex items-center justify-between gap-4">
              <div className="max-w-[60%] sm:max-w-md">
                <span className="inline-flex items-center gap-1.5 bg-[#FFD424] text-slate-900 text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  ⚡ Free delivery
                </span>
                <h1 className="mt-3 text-2xl sm:text-4xl font-black leading-tight tracking-tight">
                  Groceries in
                  <br />
                  10 minutes
                </h1>
                <p className="mt-2 text-[11px] sm:text-sm font-semibold text-white/85">
                  Fresh essentials, delivered to your door. Min. basket ₹99.
                </p>
              </div>

              <div className="relative shrink-0 grid grid-cols-2 gap-2 sm:gap-3 rotate-6">
                {["🥦", "🥛", "🍎", "🍞"].map((emoji, i) => (
                  <div
                    key={i}
                    className="h-14 w-14 sm:h-20 sm:w-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/25 flex items-center justify-center text-2xl sm:text-4xl shadow-lg"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-5 flex flex-wrap gap-2">
              {["10 min delivery", "Best prices", "Fresh quality"].map((t) => (
                <span
                  key={t}
                  className="text-[10px] sm:text-xs font-bold bg-white/15 border border-white/20 px-3 py-1 rounded-full backdrop-blur-sm"
                >
                  ✓ {t}
                </span>
              ))}
            </div>
          </div>

          {/* Slide 2 - Fresh produce */}
          <div className="relative w-full shrink-0 overflow-hidden bg-gradient-to-br from-[#047857] via-[#10B981] to-[#A3E635] text-white p-5 sm:p-8">
            <div className="absolute -top-10 -left-10 h-44 w-44 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 right-20 h-40 w-40 rounded-full bg-white/10" />

            <div className="relative flex items-center justify-between gap-4">
              <div className="max-w-[60%] sm:max-w-md">
                <span className="inline-flex items-center gap-1.5 bg-white text-emerald-700 text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  🌿 Farm fresh
                </span>
                <h2 className="mt-3 text-2xl sm:text-4xl font-black leading-tight tracking-tight">
                  Fresh fruits
                  <br />
                  &amp; veggies
                </h2>
                <p className="mt-2 text-[11px] sm:text-sm font-semibold text-white/90">
                  Handpicked every morning and delivered crisp to your door.
                </p>
                <button
                  onClick={() => handleCategoryClick("All")}
                  className="mt-4 bg-white text-emerald-700 hover:bg-emerald-50 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition"
                >
                  Shop now
                </button>
              </div>

              <div className="relative shrink-0 grid grid-cols-2 gap-2 sm:gap-3 -rotate-6">
                {["🍅", "🥕", "🍇", "🥭"].map((emoji, i) => (
                  <div
                    key={i}
                    className="h-14 w-14 sm:h-20 sm:w-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/25 flex items-center justify-center text-2xl sm:text-4xl shadow-lg"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Slide 3 - Snacks & drinks */}
          <div className="relative w-full shrink-0 overflow-hidden bg-gradient-to-br from-[#F97316] via-[#FB923C] to-[#FACC15] text-white p-5 sm:p-8">
            <div className="absolute -top-12 right-10 h-44 w-44 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10" />

            <div className="relative flex items-center justify-between gap-4">
              <div className="max-w-[60%] sm:max-w-md">
                <span className="inline-flex items-center gap-1.5 bg-slate-900 text-yellow-300 text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  🔥 Snack time
                </span>
                <h2 className="mt-3 text-2xl sm:text-4xl font-black leading-tight tracking-tight">
                  Snacks, chips
                  <br />
                  &amp; cold drinks
                </h2>
                <p className="mt-2 text-[11px] sm:text-sm font-semibold text-white/95">
                  Cravings sorted in minutes. Min. basket ₹99.
                </p>
                <button
                  onClick={() => handleCategoryClick("All")}
                  className="mt-4 bg-slate-900 text-white hover:bg-slate-800 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition"
                >
                  Order now
                </button>
              </div>

              <div className="relative shrink-0 grid grid-cols-2 gap-2 sm:gap-3 rotate-3">
                {["🍟", "🥤", "🍫", "🍪"].map((emoji, i) => (
                  <div
                    key={i}
                    className="h-14 w-14 sm:h-20 sm:w-20 rounded-2xl bg-white/25 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl sm:text-4xl shadow-lg"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
          </div>

          {/* Slider dots */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === i ? "w-6 bg-purple-600" : "w-1.5 bg-purple-200 hover:bg-purple-300"
                }`}
              />
            ))}
          </div>
          </div>

          {/* ---------- Search & sort ---------- */}
          <div className="sticky top-16 z-30 -mx-4 px-4 bg-[#F5F3FF]/90 backdrop-blur-md py-3 mt-3">
            <div className="flex items-center gap-2.5 w-full">
              <div className="relative flex-1 min-w-0 rounded-2xl bg-white border border-slate-200 shadow-sm focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder='Search "chips", "cooking oil", "atta"...'
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full bg-transparent py-3.5 pl-12 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-semibold"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-black flex items-center justify-center"
                  >
                    ✕
                  </button>
                )}
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
                <div className="h-[46px] w-[46px] flex items-center justify-center relative text-slate-600">
                  <SortIcon />
                  {sortBy && (
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-purple-600 ring-2 ring-white" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ---------- Categories ---------- */}
          <div className="mt-2 mb-8 w-full">
            <SectionTitle
              title="Shop by category"
              right={
                selectedCategory !== "All" && (
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className="text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-full transition-all"
                  >
                    Clear ✕
                  </button>
                )
              }
            />

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-2.5 gap-y-4 sm:gap-x-3">
              {allCategoriesList.map((cat) => {
                const isAll = cat.isAll;
                const isSelected = isAll
                  ? selectedCategory === "All"
                  : selectedCategory.toLowerCase() === cat.name?.toLowerCase();

                return (
                  <button
                    key={cat.id}
                    onClick={() =>
                      isAll
                        ? handleCategoryClick("All")
                        : handleCategoryClick(isSelected ? "All" : cat.name)
                    }
                    className="group flex flex-col items-center text-center focus:outline-none"
                  >
                    <div
                      className={`relative w-full aspect-square rounded-2xl flex items-center justify-center p-2.5 overflow-hidden transition-all duration-200 ${
                        isSelected
                          ? "bg-purple-100 ring-2 ring-purple-600 shadow-md shadow-purple-500/20"
                          : "bg-white border border-slate-200/80 shadow-sm group-hover:border-purple-300 group-hover:shadow-md"
                      }`}
                    >
                      {isAll && (
                        <span className="absolute top-0 left-0 bg-[#FFD424] text-slate-900 text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-br-lg uppercase tracking-wide z-10">
                          % Offers
                        </span>
                      )}
                      <img
                        src={
                          isAll
                            ? "https://cdn-icons-png.flaticon.com/512/3081/3081559.png"
                            : cat.image || DEFAULT_IMAGE
                        }
                        alt={cat.name}
                        onError={(e) => {
                          e.target.src = DEFAULT_IMAGE;
                        }}
                        className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-200"
                      />
                    </div>
                    <span
                      className={`mt-1.5 text-[11px] sm:text-xs leading-tight line-clamp-2 transition-colors ${
                        isSelected
                          ? "font-black text-purple-700"
                          : "font-bold text-slate-700"
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ---------- Products ---------- */}
          <div className="w-full scroll-mt-32" ref={productsSectionRef}>
            <SectionTitle
              title={selectedCategory === "All" ? "Buy fresh essentials" : selectedCategory}
              right={
                <span className="text-[11px] font-black text-purple-700 bg-white border border-purple-100 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {filteredProducts.length} items
                </span>
              }
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredProducts.map((product) => {
                const cartItem = getCartItem(product.id);
                const outOfStock = product.stock_quantity <= 0;
                const discountLabel =
                  Number(product.price) >= 200
                    ? "10% OFF"
                    : Number(product.price) >= 150
                    ? "5% OFF"
                    : null;

                return (
                  <div
                    key={product.id}
                    className="group relative bg-white rounded-3xl border border-slate-100 p-2.5 sm:p-3 flex flex-col shadow-[0_2px_14px_rgba(76,29,149,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10"
                  >
                    {/* Image */}
                    <div className="relative aspect-square rounded-2xl bg-gradient-to-b from-[#F8F7FF] to-[#F1EEFB] flex items-center justify-center p-3 overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = DEFAULT_IMAGE;
                        }}
                        className={`max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-200 group-hover:scale-105 ${
                          outOfStock ? "opacity-40 grayscale" : ""
                        }`}
                      />

                      {discountLabel && !outOfStock && (
                        <span className="absolute top-0 left-0 bg-purple-600 text-white font-black text-[8px] sm:text-[9px] px-2 py-1 rounded-br-xl uppercase tracking-wider">
                          {discountLabel}
                        </span>
                      )}

                      {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                        <span className="absolute top-2 right-2 bg-rose-500 text-white font-black text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                          {product.stock_quantity} left
                        </span>
                      )}

                      {outOfStock && (
                        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black uppercase tracking-wider text-slate-500">
                          Out of stock
                        </span>
                      )}

                      <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
                        <span className="text-amber-500 text-[9px]">⚡</span>
                        <span className="text-[8px] sm:text-[9px] font-black text-slate-700 uppercase tracking-wider">
                          10 min
                        </span>
                      </span>

                      {/* Add / stepper floating on the image */}
                      <div className="absolute bottom-2 right-2 z-10">
                        {cartItem ? (
                          <div className="flex items-center bg-purple-600 text-white rounded-xl h-8 sm:h-9 overflow-hidden font-black shadow-lg shadow-purple-600/30">
                            <button
                              onClick={() => {
                                if (cartItem.quantity > 1) {
                                  updateQuantity(cartItem.id, cartItem.quantity - 1);
                                } else {
                                  removeFromCart(cartItem.id);
                                }
                              }}
                              className="w-7 sm:w-8 h-full flex items-center justify-center text-base hover:bg-purple-700 active:scale-90 transition"
                            >
                              −
                            </button>
                            <span className="w-5 text-center text-xs">{cartItem.quantity}</span>
                            <button
                              onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                              className="w-7 sm:w-8 h-full flex items-center justify-center text-base hover:bg-purple-700 active:scale-90 transition"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product.id)}
                            disabled={outOfStock}
                            className="h-8 sm:h-9 px-4 sm:px-5 text-[11px] sm:text-xs bg-white border-[1.5px] border-purple-600 text-purple-700 hover:bg-purple-600 hover:text-white disabled:opacity-40 disabled:pointer-events-none font-black rounded-xl uppercase tracking-wider transition-all active:scale-95 shadow-md"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="pt-2.5 px-0.5 flex flex-col flex-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-black text-slate-900">
                          ₹{product.price}
                        </span>
                        {product.price > 100 && (
                          <span className="text-[10px] sm:text-xs text-slate-400 line-through font-bold">
                            ₹{Math.round(product.price * 1.15)}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-0.5 text-xs sm:text-[13px] font-bold text-slate-800 line-clamp-2 min-h-[32px] sm:min-h-[36px] leading-snug">
                        {product.name}
                      </h3>

                      <div className="mt-1.5 inline-flex self-start items-center text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {product.unit || "1 pc"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-14 bg-white rounded-3xl border border-dashed border-purple-200 max-w-sm mx-auto mt-6 shadow-sm">
                <div className="text-4xl mb-2">🛒</div>
                <h2 className="text-sm font-extrabold text-slate-700">No items match your filters</h2>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 px-4 font-medium">
                  Try another category or a different search term.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sync Toast Notification */}
        {showToast && (
          <div className="fixed bottom-40 md:bottom-28 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-xl z-50 animate-fade-in tracking-wide pointer-events-none">
            🛒 Added to your basket
          </div>
        )}

        {/* Floating cart bar */}
        {cartSummary.items > 0 && (
          <div className="fixed bottom-[68px] md:bottom-4 left-0 right-0 px-4 z-40 transition-all duration-300">
            <div className="max-w-xl mx-auto bg-gradient-to-r from-[#6D1BEA] via-[#B318B0] to-[#FF4E6B] text-white rounded-2xl p-2.5 pl-3 flex justify-between items-center shadow-2xl shadow-purple-600/30">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-xl h-10 w-10 flex items-center justify-center text-lg">
                  🛍️
                </div>
                <div className="leading-tight">
                  <div className="text-[10px] font-black text-white/80 tracking-wider uppercase">
                    {cartSummary.items} {cartSummary.items === 1 ? "item" : "items"}
                  </div>
                  <div className="text-lg font-black tracking-tight">₹{cartSummary.total}</div>
                </div>
              </div>

              <button
                onClick={() => (window.location.href = "/cart")}
                className="bg-white text-purple-700 hover:bg-purple-50 px-5 py-2.5 rounded-xl font-black text-xs shadow transition-all active:scale-95 flex items-center gap-1 uppercase tracking-wider"
              >
                View cart
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Back-to-top */}
        {showTopBtn && (
          <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className={`fixed ${
              cartSummary.items > 0 ? "bottom-40 md:bottom-24" : "bottom-24 md:bottom-6"
            } right-4 z-50 h-10 w-10 bg-white text-purple-700 rounded-full shadow-lg shadow-purple-500/20 border border-purple-100 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
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
        onSuccess={() => {
          setShowLogin(false);
        }}
      />
    </>
  );
}

export default Products;