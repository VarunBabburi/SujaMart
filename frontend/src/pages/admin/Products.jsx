import { useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

/* ---------- small pieces ---------- */
const Icon = ({ d, className = "h-4 w-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const P = {
  search: "M21 21l-4.3-4.3M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z",
  plus: "M12 5v14M5 12h14",
  edit: "M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3",
  close: "M6 6l12 12M18 6L6 18",
  box: "M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8",
  refresh: "M20 11a8 8 0 10-2.3 5.7M20 4v7h-7",
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "hidden", label: "Hidden" },
  { id: "low", label: "Low stock" },
];

const LOW_STOCK = 5;

const inr = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const inputCls =
  "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition";

const smallInputCls =
  "w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition";

const Thumb = ({ src, name }) => {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className="h-28 w-28 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-3xl font-bold">
        {(name || "?").charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setBroken(true)}
      className="h-28 w-28 object-contain mix-blend-multiply"
    />
  );
};

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editableProducts, setEditableProducts] = useState({});

  const initialFormState = {
    name: "",
    category_id: "",
    description: "",
    unit: "",
    price: "",
    stock_quantity: "",
    image: null,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  /* UI-only state */
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState("all");
  const [openEdit, setOpenEdit] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFieldChange = (id, field, value) => {
    setEditableProducts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const addProduct = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const data = new FormData();

      data.append("name", formData.name);
      data.append("category_id", formData.category_id);
      data.append("description", formData.description || "");
      data.append("unit", formData.unit);
      data.append("price", formData.price.toString());
      data.append("stock_quantity", formData.stock_quantity.toString());

      if (formData.image) {
        data.append("image", formData.image);
      }

      await api.post("/products", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Product Added Successfully");

      setFormData(initialFormState);

      await fetchProducts();
    } catch (error) {
      console.log(error);
      toast.error("Failed");
    }
  };

  const updateProduct = async (product) => {
    try {
      const token = localStorage.getItem("token");

      const edited = editableProducts[product.id] || {};

      const data = new FormData();

      data.append("name", edited.name || product.name);

      data.append(
        "description",
        edited.description || product.description || ""
      );

      data.append(
        "category_id",
        edited.category_id || product.category_id || ""
      );

      data.append("unit", edited.unit || product.unit || "");

      data.append("price", edited.price || product.price);

      data.append(
        "stock_quantity",
        edited.stock_quantity || product.stock_quantity
      );

      if (edited.image) {
        data.append("image", edited.image);
      }

      await api.put(`/products/${product.id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Product updated Successfully");

      // Clear edits for this item
      setEditableProducts((prev) => {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      });
      setOpenEdit((prev) => ({ ...prev, [product.id]: false }));

      fetchProducts();
    } catch (error) {
      console.log(error);
      toast.error("Failed to Update Product");
    }
  };

  const toggleStatus = async (id) => {
    const result = await Swal.fire({
      title: "Change Product Status?",
      text: "Do you want to activate/deactivate this product?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/products/status/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Product status updated.",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchProducts();
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Unable to update product.",
      });
    }
  };

  const deleteProduct = async (id) => {
    const result = await Swal.fire({
      title: "Delete Product?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#94a3b8",
      cancelButtonText: "Cancel",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Product deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchProducts();
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: "Unable to delete product Becasue it has Orders",
      });
    }
  };

  /* ---------- derived (UI only) ---------- */
  const q = search.toLowerCase();

  const matchesSearch = (product) =>
    product.name.toLowerCase().includes(q) ||
    product.description?.toLowerCase().includes(q) ||
    product.category_name?.toLowerCase().includes(q) ||
    product.unit?.toLowerCase().includes(q);

  const isLow = (p) => Number(p.stock_quantity) <= LOW_STOCK;

  const filteredProducts = products.filter((product) => {
    if (!matchesSearch(product)) return false;
    if (filter === "active") return !!product.is_active;
    if (filter === "hidden") return !product.is_active;
    if (filter === "low") return isLow(product);
    return true;
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.is_active).length,
    hidden: products.filter((p) => !p.is_active).length,
    low: products.filter(isLow).length,
  };

  const countFor = (id) =>
    id === "all"
      ? stats.total
      : id === "active"
      ? stats.active
      : id === "hidden"
      ? stats.hidden
      : stats.low;

  const toggleEdit = (id) =>
    setOpenEdit((prev) => ({ ...prev, [id]: !prev[id] }));

  const cancelEdit = (id) => {
    setEditableProducts((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setOpenEdit((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] font-sans antialiased text-slate-800">
      <Navbar />

      {/* Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute right-40 -bottom-28 h-56 w-56 rounded-full bg-white/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Products
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Manage your catalog, pricing and stock levels.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchProducts}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition"
              >
                <Icon d={P.refresh} /> Refresh
              </button>
              <button
                onClick={() => setShowAdd((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition"
              >
                <Icon d={showAdd ? P.close : P.plus} />
                {showAdd ? "Close" : "Add product"}
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { l: "Total products", v: stats.total },
              { l: "Active", v: stats.active },
              { l: "Hidden", v: stats.hidden },
              { l: "Low stock", v: stats.low },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <p className="text-xs text-slate-400">{s.l}</p>
                <p className="mt-0.5 text-xl font-semibold text-white">
                  {loading ? "–" : s.v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Add Product */}
        {showAdd && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-8">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              Add new product
            </h2>

            <form onSubmit={addProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Product name (e.g., Fresh Alphonso Mango)"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={inputCls}
                />

                <input
                  type="text"
                  placeholder="Short description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={inputCls}
                />

                <select
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  className={inputCls + " text-slate-600"}
                >
                  <option value="">Select unit</option>
                  <option value="kg">KG</option>
                  <option value="gram">Gram</option>
                  <option value="litre">Litre</option>
                  <option value="packet">Packet</option>
                  <option value="piece">Piece</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className={inputCls}
                />

                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className={inputCls + " text-slate-600"}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Initial stock quantity"
                  value={formData.stock_quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stock_quantity: e.target.value })
                  }
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="flex-1 max-w-md">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    Product image
                  </label>
                  <input
                    type="file"
                    key={formData.image ? formData.image.name : "empty"}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.files[0] })
                    }
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition"
                >
                  <Icon d={P.plus} /> Add product
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search + filters */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 mb-6 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon d={P.search} />
            </span>
            <input
              type="text"
              placeholder="Search by name, description, category or unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputCls + " pl-10"}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  filter === f.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
                <span
                  className={`rounded-full px-1.5 text-[10px] ${
                    filter === f.id
                      ? "bg-white/20 text-white"
                      : "bg-white text-slate-500"
                  }`}
                >
                  {loading ? 0 : countFor(f.id)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {filteredProducts.length}
          </span>{" "}
          of {products.length} products
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 animate-pulse"
              >
                <div className="h-36 rounded-xl bg-slate-100" />
                <div className="mt-4 h-3 w-1/3 rounded bg-slate-100" />
                <div className="mt-3 h-4 w-3/4 rounded bg-slate-100" />
                <div className="mt-4 h-9 rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Icon d={P.box} className="h-6 w-6" />
            </div>
            <p className="font-medium text-slate-800">No products found</p>
            <p className="text-sm text-slate-500 mt-1">
              Try a different search or filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const currentEdits = editableProducts[product.id] || {};
              const editing = !!openEdit[product.id];
              const low = isLow(product);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col transition hover:shadow-md"
                >
                  {/* Image */}
                  <div className="relative bg-slate-50 flex items-center justify-center border-b border-slate-100 min-h-[170px] p-4">
                    <span
                      className={`absolute top-3 left-3 text-[11px] font-medium px-2.5 py-0.5 rounded-full ring-1 ring-inset ${
                        product.is_active
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-slate-100 text-slate-600 ring-slate-200"
                      }`}
                    >
                      {product.is_active ? "Active" : "Hidden"}
                    </span>

                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="absolute top-2.5 right-2.5 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete product"
                    >
                      <Icon d={P.trash} />
                    </button>

                    <Thumb src={product.image_url} name={product.name} />
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-medium text-slate-500 truncate">
                        {product.category_name || "Uncategorised"}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                        {product.unit || "pc"}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[40px]">
                      {product.name}
                    </h3>

                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-[11px] text-slate-400">Price</p>
                        <p className="text-lg font-bold text-slate-900">
                          {inr(product.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-slate-400">Stock</p>
                        <p
                          className={`text-sm font-semibold ${
                            low ? "text-rose-600" : "text-slate-900"
                          }`}
                        >
                          {product.stock_quantity}
                          {low && (
                            <span className="ml-1.5 text-[10px] font-medium bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 rounded-full px-1.5 py-0.5">
                              Low
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Edit fields */}
                    {editing && (
                      <div className="mt-4 space-y-2 pt-4 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Edit name"
                            value={currentEdits.name ?? ""}
                            onChange={(e) =>
                              handleFieldChange(product.id, "name", e.target.value)
                            }
                            className={smallInputCls}
                          />
                          <input
                            type="number"
                            placeholder="Edit price"
                            value={currentEdits.price ?? ""}
                            onChange={(e) =>
                              handleFieldChange(product.id, "price", e.target.value)
                            }
                            className={smallInputCls}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <textarea
                            placeholder="Edit desc"
                            rows={1}
                            value={currentEdits.description ?? ""}
                            onChange={(e) =>
                              handleFieldChange(
                                product.id,
                                "description",
                                e.target.value
                              )
                            }
                            className={smallInputCls + " resize-none"}
                          />
                          <select
                            value={currentEdits.category_id ?? ""}
                            onChange={(e) =>
                              handleFieldChange(
                                product.id,
                                "category_id",
                                e.target.value
                              )
                            }
                            className={smallInputCls + " text-slate-500"}
                          >
                            <option value="">Category</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Edit unit"
                            value={currentEdits.unit ?? ""}
                            onChange={(e) =>
                              handleFieldChange(product.id, "unit", e.target.value)
                            }
                            className={smallInputCls}
                          />
                          <input
                            type="number"
                            placeholder="Edit stock"
                            value={currentEdits.stock_quantity ?? ""}
                            onChange={(e) =>
                              handleFieldChange(
                                product.id,
                                "stock_quantity",
                                e.target.value
                              )
                            }
                            className={smallInputCls}
                          />
                        </div>

                        <input
                          type="file"
                          onChange={(e) =>
                            handleFieldChange(product.id, "image", e.target.files[0])
                          }
                          className="w-full text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 cursor-pointer"
                        />
                        <p className="text-[11px] text-slate-400">
                          Leave a field empty to keep its current value.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="bg-slate-50/70 px-4 py-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                    {editing ? (
                      <>
                        <button
                          onClick={() => updateProduct(product)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-xl text-xs transition"
                        >
                          Save changes
                        </button>
                        <button
                          onClick={() => cancelEdit(product.id)}
                          className="w-full bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2 rounded-xl text-xs border border-slate-200 transition"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleEdit(product.id)}
                          className="inline-flex items-center justify-center gap-1.5 w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-xl text-xs transition"
                        >
                          <Icon d={P.edit} className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => toggleStatus(product.id)}
                          className={`w-full font-semibold py-2 rounded-xl text-xs border transition ${
                            product.is_active
                              ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                              : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                          }`}
                        >
                          {product.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProducts;