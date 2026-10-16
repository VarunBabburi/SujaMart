import { useEffect, useRef } from "react";

const DEFAULT_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'/></svg>";

const Icon = ({ d, className = "h-5 w-5", sw = 2.2 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const ICONS = {
  close: "M6 18L18 6M6 6l12 12",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
  leaf: "M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19c2-4 5-7 9-9",
  tag: "M3 12V4h8l10 10-8 8L3 12zM7.5 8.5h.01",
  box: "M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8",
};
let pendingBack = null;
/**
 * Product details bottom sheet (mobile) / centred modal (desktop).
 * All cart logic stays in the parent page; this component only calls the
 * callbacks it is given.
 */
function ProductDetailSheet({
  product,
  products,
  cartItem,
  getCartItem,
  onClose,
  onSelect,
  onAdd,
  onIncrease,
  onDecrease,
}) {
  const scrollRef = useRef(null);

  /* close on Escape + lock background scroll while open */
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  /* jump back to the top when switching to another product */
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [product?.id]);
  
  const onCloseRef = useRef(onClose);
onCloseRef.current = onClose;

useEffect(() => {
  if (pendingBack) {
    clearTimeout(pendingBack);
    pendingBack = null;
  } else {
    window.history.pushState({ ...window.history.state, productSheet: true }, "");
  }

  let closedByBackButton = false;
  const onPop = () => {
    closedByBackButton = true;
    onCloseRef.current();
  };
  window.addEventListener("popstate", onPop);

  return () => {
    window.removeEventListener("popstate", onPop);
    if (!closedByBackButton) {
      pendingBack = setTimeout(() => {
        pendingBack = null;
        if (window.history.state?.productSheet) window.history.back();
      }, 0);
    }
  };
}, []);

  if (!product) return null;

  const outOfStock = Number(product.stock_quantity) <= 0;
  const lowStock = !outOfStock && Number(product.stock_quantity) <= 5;
  const price = Number(product.price);
  const mrp = price > 100 ? Math.round(price * 1.15) : null;
  const description = product.description && product.description.trim();

  const similar = products
    .filter(
      (p) =>
        p.id !== product.id &&
        product.category_name &&
        p.category_name === product.category_name &&
        Number(p.stock_quantity) > 0
    )
    .slice(0, 10);

  const renderAction = (big = false) =>
    cartItem ? (
      <div
        className={`flex items-center bg-purple-600 text-white rounded-xl overflow-hidden font-black shadow-lg shadow-purple-600/30 ${
          big ? "h-12" : "h-9"
        }`}
      >
        <button
          onClick={onDecrease}
          aria-label="Decrease quantity"
          className={`${big ? "w-12 text-xl" : "w-8 text-base"} h-full flex items-center justify-center hover:bg-purple-700 active:scale-90 transition`}
        >
          −
        </button>
        <span className={`${big ? "w-8 text-sm" : "w-6 text-xs"} text-center`}>
          {cartItem.quantity}
        </span>
        <button
          onClick={onIncrease}
          aria-label="Increase quantity"
          className={`${big ? "w-12 text-xl" : "w-8 text-base"} h-full flex items-center justify-center hover:bg-purple-700 active:scale-90 transition`}
        >
          +
        </button>
      </div>
    ) : (
      <button
        onClick={onAdd}
        disabled={outOfStock}
        className={`${
          big ? "h-12 px-8 text-sm" : "h-9 px-4 text-xs"
        } bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:pointer-events-none text-white font-black rounded-xl uppercase tracking-wider shadow-lg shadow-purple-600/30 transition active:scale-95`}
      >
        {outOfStock ? "Out of stock" : "Add to cart"}
      </button>
    );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      {/* backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] cursor-default"
      />

      {/* sheet */}
      <div className="relative w-full md:max-w-3xl max-h-[92vh] md:max-h-[86vh] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* grab handle (mobile) */}
        <div className="md:hidden flex justify-center pt-2.5">
          <span className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-white/90 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm flex items-center justify-center"
        >
          <Icon d={ICONS.close} className="h-4 w-4" sw={2.6} />
        </button>

        <div ref={scrollRef} className="overflow-y-auto flex-1">
          <div className="md:grid md:grid-cols-2">
            {/* image */}
            <div className="relative bg-gradient-to-b from-[#F8F7FF] to-[#EFEBFB] flex items-center justify-center p-8 md:p-10 min-h-[240px] md:min-h-[420px]">
              <img
                src={product.image_url || DEFAULT_IMAGE}
                alt={product.name}
                onError={(e) => {
                  e.target.src = DEFAULT_IMAGE;
                }}
                className={`max-h-56 md:max-h-80 w-full object-contain mix-blend-multiply ${
                  outOfStock ? "opacity-40 grayscale" : ""
                }`}
              />
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-white/90 px-2 py-1 rounded-lg shadow-sm text-[10px] font-black uppercase tracking-wider text-slate-700">
                <Icon d={ICONS.bolt} className="h-3 w-3 text-amber-500" sw={2.4} />
                10 min
              </span>
              {lowStock && (
                <span className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md">
                  Only {product.stock_quantity} left
                </span>
              )}
            </div>

            {/* info */}
            <div className="p-5 md:p-7">
              {product.category_name && (
                <span className="inline-block text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                  {product.category_name}
                </span>
              )}

              <h2 className="mt-2.5 text-xl md:text-2xl font-black tracking-tight text-slate-900 leading-snug">
                {product.name}
              </h2>

              <p className="mt-1 text-sm font-bold text-slate-500">
                {product.unit || "1 pc"}
              </p>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">₹{product.price}</span>
                {mrp && (
                  <span className="text-sm text-slate-400 line-through font-bold">₹{mrp}</span>
                )}
                <span className="text-[11px] font-bold text-slate-400">
                  (inclusive of all taxes)
                </span>
              </div>

              {/* highlights */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { icon: ICONS.bolt, label: "10 min delivery" },
                  { icon: ICONS.leaf, label: "Fresh quality" },
                  { icon: ICONS.tag, label: "Best price" },
                ].map((h) => (
                  <div
                    key={h.label}
                    className="flex flex-col items-center gap-1.5 text-center bg-purple-50/70 border border-purple-100 rounded-2xl py-3 px-1"
                  >
                    <Icon d={h.icon} className="h-4 w-4 text-purple-600" />
                    <span className="text-[10px] font-bold text-slate-600 leading-tight">
                      {h.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* description */}
              <div className="mt-5">
                <h3 className="text-[13px] font-black uppercase tracking-wider text-slate-400">
                  About this product
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed whitespace-pre-line ${
                    description ? "text-slate-700" : "text-slate-400 italic"
                  }`}
                >
                  {description || "No description has been added for this product yet."}
                </p>
              </div>

              {/* quick facts */}
              <dl className="mt-5 divide-y divide-slate-100 border border-slate-100 rounded-2xl text-sm">
                <div className="flex justify-between px-4 py-2.5">
                  <dt className="text-slate-500 font-medium">Unit</dt>
                  <dd className="font-bold text-slate-800">{product.unit || "1 pc"}</dd>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <dt className="text-slate-500 font-medium">Category</dt>
                  <dd className="font-bold text-slate-800">
                    {product.category_name || "General"}
                  </dd>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <dt className="text-slate-500 font-medium">Availability</dt>
                  <dd
                    className={`font-bold ${
                      outOfStock
                        ? "text-rose-600"
                        : lowStock
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {outOfStock ? "Out of stock" : lowStock ? "Few left" : "In stock"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* similar products */}
          {similar.length > 0 && (
            <div className="px-5 md:px-7 pb-6 pt-2">
              <h3 className="text-[15px] font-black tracking-tight text-slate-900 mb-3">
                More in {product.category_name}
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
                {similar.map((p) => {
                  const inCart = getCartItem(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelect(p.id)}
                      className="snap-start shrink-0 w-32 text-left bg-white border border-slate-100 rounded-2xl p-2 hover:border-purple-300 hover:shadow-md transition"
                    >
                      <div className="aspect-square rounded-xl bg-gradient-to-b from-[#F8F7FF] to-[#F1EEFB] flex items-center justify-center p-2">
                        <img
                          src={p.image_url || DEFAULT_IMAGE}
                          alt={p.name}
                          onError={(e) => {
                            e.target.src = DEFAULT_IMAGE;
                          }}
                          className="max-h-full max-w-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <p className="mt-2 text-xs font-bold text-slate-800 line-clamp-2 leading-snug min-h-[32px]">
                        {p.name}
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-sm font-black text-slate-900">₹{p.price}</span>
                        {inCart && (
                          <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                            {inCart.quantity} in cart
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* sticky action bar */}
        <div className="border-t border-slate-100 bg-white px-5 md:px-7 py-3.5 flex items-center justify-between gap-4 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          <div className="leading-tight">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {cartItem ? "In your cart" : "Price"}
            </p>
            <p className="text-xl font-black text-slate-900">
              ₹{cartItem ? price * cartItem.quantity : product.price}
            </p>
          </div>
          {renderAction(true)}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailSheet;