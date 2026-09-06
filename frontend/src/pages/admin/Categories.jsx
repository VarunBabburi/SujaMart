import { useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import { toast } from "react-toastify";

// Modern SVG fallback icon for missing images
const DEFAULT_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF' class='w-8 h-8'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'/></svg>";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Edit modal state
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // const fetchCategories = async () => {
  //   try {
  //     const res = await api.get("/categories");
  //     setCategories(res.data);
  //   } catch (error) {
  //     toast.error("Failed to fetch categories");
  //   }
  // };
  const fetchCategories = async () => {
  try {
    const res = await api.get("/categories");
    // Sort in descending order by ID so the highest/newest ID appears first
    const sorted = [...res.data].sort((a, b) => b.id - a.id);
    setCategories(sorted);
  } catch (error) {
    toast.error("Failed to fetch categories");
  }
};

  const handleImageChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      if (isEdit) {
        setEditImage(file);
        setEditImagePreview(URL.createObjectURL(file));
      } else {
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.info("Please enter a category name");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", name);
      if (image) formData.append("image", image);

      await api.post("/categories", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setName("");
      setImage(null);
      setImagePreview(null);
      fetchCategories();
      toast.success("Category added successfully!");
    } catch (error) {
      toast.error("Failed to add category");
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditImagePreview(category.image);
    setEditImage(null);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return toast.info("Category name required");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", editName);
      if (editImage) formData.append("image", editImage);

      await api.put(`/categories/${editingCategory.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setEditingCategory(null);
      fetchCategories();
      toast.success("Category updated successfully!");
    } catch (error) {
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async (id, catName) => {
    if (!window.confirm(`Are you sure you want to delete "${catName}"?`)) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchCategories();
      toast.success("Category deleted");
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Title */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Category Manager</h1>
            <p className="text-xs text-gray-500 mt-1">Organize and publish product categories for SujaMart</p>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
            {categories.length} Total Categories
          </span>
        </div>

        {/* Add Category Section */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm mb-10">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Add New Category
          </h2>

          <form onSubmit={addCategory} className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Category Name Input */}
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Category Name (e.g. Snacks & Drinks)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Custom Image Upload Button */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold px-4 py-3 rounded-xl border border-gray-200 transition-all active:scale-95">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {image ? "Change Photo" : "Upload Image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, false)}
                  className="hidden"
                />
              </label>

              {/* Image Preview Thumbnail */}
              {imagePreview && (
                <div className="relative w-11 h-11 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all ml-auto md:ml-0"
              >
                + Add Category
              </button>
            </div>
          </form>
        </div>

        {/* Instamart Grid Display */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group bg-white border border-gray-200/80 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              {/* Image Container with Soft Background */}
              <div className="w-24 h-24 bg-slate-50 group-hover:bg-emerald-50/50 rounded-2xl flex items-center justify-center p-2 mb-3 border border-slate-100 transition-colors">
                <img
                  src={cat.image || DEFAULT_IMAGE}
                  alt={cat.name}
                  onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </div>

              {/* Category Name */}
              <h3 className="text-xs font-extrabold text-gray-800 line-clamp-1 tracking-tight mb-3">
                {cat.name}
              </h3>

              {/* Edit / Delete Buttons */}
              <div className="flex gap-2 w-full pt-2 border-t border-gray-100 mt-auto">
                <button
                  onClick={() => openEditModal(cat)}
                  className="flex-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 font-bold text-[11px] py-1.5 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  className="flex-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-gray-600 font-bold text-[11px] py-1.5 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Edit Modal Overlay */}
      {editingCategory && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-black text-gray-800">Edit Category</h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Category Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Category Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-xl border border-gray-200 flex items-center justify-center p-1">
                    <img
                      src={editImagePreview || DEFAULT_IMAGE}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-gray-200 transition-colors">
                    Upload New Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold text-xs py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-sm transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;