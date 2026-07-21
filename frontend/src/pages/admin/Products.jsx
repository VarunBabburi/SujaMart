import { useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editableProducts, setEditableProducts] =
    useState({});

  const [formData, setFormData] =
    useState({
      name: "",
      description: "",
      category_id: "",
      price: "",
      stock_quantity: "",
      unit: "",
      image: null,
    });

  const [categories, setCategories] =
    useState([]);
    const [search, setSearch] =
  useState("");

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
    }
  };

  const fetchCategories = async () => {
    try {
      const res =
        await api.get("/categories");

      setCategories(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFieldChange = (
    id,
    field,
    value
  ) => {
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
      data.append(
        "category_id",
        formData.category_id
      );
      data.append(
        "description",
        formData.description
      );

      data.append(
        "unit",
        formData.unit
      );
      data.append("price", formData.price);
      data.append(
        "stock_quantity",
        formData.stock_quantity
      );

      data.append(
        "image",
        formData.image
      );

      await api.post(
        "/products",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      toast.success("Product Added Successfully");

      fetchProducts();
    } catch (error) {
      console.log(error);
      toast.error("Failed");
    }
  };

  const updateProduct = async (
    product
  ) => {
    try {
      const token =
        localStorage.getItem("token");

      const edited =
        editableProducts[
        product.id
        ] || {};

      const data =
        new FormData();

      data.append(
        "name",
        edited.name ||
        product.name
      );

      data.append(
        "description",
        edited.description ||
        product.description ||
        ""
      );

      data.append(
        "category_id",
        edited.category_id ||
        product.category_id ||
        ""
      );

      data.append(
        "unit",
        edited.unit ||
        product.unit ||
        ""
      );

      data.append(
        "price",
        edited.price ||
        product.price
      );

      data.append(
        "stock_quantity",
        edited.stock_quantity ||
        product.stock_quantity
      );

      if (edited.image) {
        data.append(
          "image",
          edited.image
        );
      }

      await api.put(
        `/products/${product.id}`,
        data,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      toast.success("Product updated Successfully");

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
    confirmButtonColor: "#16a34a",
    cancelButtonColor: "#d33",
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
    confirmButtonColor: "#d33",
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
      text: "Unable to delete product.",
    });
  }
};

const filteredProducts =
products.filter(product =>

product.name
.toLowerCase()
.includes(search.toLowerCase())

||

product.description
?.toLowerCase()
.includes(search.toLowerCase())

||

product.category_name
?.toLowerCase()
.includes(search.toLowerCase())

||

product.unit
?.toLowerCase()
.includes(search.toLowerCase())

);


  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Insta<span className="text-emerald-600">Inventory</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your quick-commerce catalog, pricing, and stock levels in real time.
            </p>
          </div>
        </div>

        {/* Add Product Card Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-5 bg-emerald-500 rounded-full inline-block"></span>
            Add New Product
          </h2>
          
          <form onSubmit={addProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Product Name (e.g., Fresh Alphonso Mango)"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
              />

              <input
                type="text"
                placeholder="Short Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
              />

              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unit: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all text-slate-600"
              >
                <option value="">Select Unit</option>
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
                  setFormData({
                    ...formData,
                    price: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
              />

              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category_id: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all text-slate-600"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Initial Stock Quantity"
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock_quantity: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div className="flex-1 max-w-md">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Product Image
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      image: e.target.files[0],
                    })
                  }
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm hover:shadow transition-all text-sm self-end sm:self-center"
              >
                Add Product
              </button>
            </div>
          </form>
        </div>

{/* Search Bar */}

<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
  <input
    type="text"
    placeholder="🔍 Search by name, description, category or unit..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
  />
</div>


        {/* Section Divider */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Live Storefront Items ({filteredProducts.length})
          </h2>
        </div>

        

        {/* Products Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between group transition-all duration-200 hover:shadow-md hover:border-slate-300"
            >
              {/* Image & Status Badge Layer */}
              <div className="relative bg-slate-50 p-4 pt-6 flex items-center justify-center border-b border-slate-100 min-h-[160px]">
                <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs ${
                  product.is_active 
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                    : "bg-rose-100 text-rose-800 border border-rose-200"
                }`}>
                  {product.is_active ? "Active" : "Hidden"}
                </span>
                
                <img
                  src={
                    product.image_url ||
                    "https://via.placeholder.com/120"
                  }
                  alt={product.name}
                  className="w-28 h-28 object-contain mix-blend-multiply drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
                />
              </div>

              {/* Dynamic Information Block */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold tracking-wide text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase inline-block mb-1.5">
                    {product.unit || 'pc'}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2 min-h-[40px] mb-3">
                    {product.name}
                  </h3>

                  {/* Inline Stats */}
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div>
                      Price: <span className="font-extrabold text-slate-900">₹{product.price}</span>
                    </div>
                    <div className="w-px h-3 bg-slate-200"></div>
                    <div>
                      Stock: <span className={`font-extrabold ${product.stock_quantity <= 5 ? "text-rose-600 animate-pulse" : "text-slate-900"}`}>{product.stock_quantity}</span>
                    </div>
                  </div>
                </div>

                {/* Micro-form Editing Fields */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Edit Name"
                      onChange={(e) =>
                        handleFieldChange(
                          product.id,
                          "name",
                          "name",
                          e.target.value
                        )
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                    />

                    <input
                      type="number"
                      placeholder="Edit Price"
                      onChange={(e) =>
                        handleFieldChange(
                          product.id,
                          "price",
                          e.target.value
                        )
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <textarea
                      placeholder="Edit Desc"
                      rows={1}
                      onChange={(e) =>
                        handleFieldChange(
                          product.id,
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none resize-none"
                    />

                    <select
                      onChange={(e) =>
                        handleFieldChange(
                          product.id,
                          "category_id",
                          e.target.value
                        )
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none text-slate-500"
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
                      placeholder="Edit Unit"
                      onChange={(e) =>
                        handleFieldChange(
                          product.id,
                          "unit",
                          e.target.value
                        )
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                    />

                    <input
                      type="number"
                      placeholder="Edit Stock"
                      onChange={(e) =>
                        handleFieldChange(
                          product.id,
                          "stock_quantity",
                          e.target.value
                        )
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-1">
                    <input
                      type="file"
                      onChange={(e) =>
                        handleFieldChange(
                          product.id,
                          "image",
                          e.target.files[0]
                        )
                      }
                      className="w-full text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateProduct(product)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs shadow-xs hover:shadow-sm transition-all"
                >
                  Update Info
                </button>

                <button
                  onClick={() => toggleStatus(product.id)}
                  className={`w-full font-bold py-2 rounded-xl text-xs border transition-all ${
                    product.is_active
                      ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  {product.is_active ? "Deactivate" : "Activate"}
                </button>
              </div>
              
            </div>
          ))}
        </div>
      </div>
        
    </div>
        
  );
}

export default AdminProducts;