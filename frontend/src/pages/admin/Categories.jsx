import { useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import { toast } from "react-toastify";

function Categories() {
  const [categories, setCategories] =
    useState([]);

  const [name, setName] =
    useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories =
    async () => {
      try {
        const res =
          await api.get(
            "/categories"
          );

        setCategories(
          res.data
        );
      } catch (error) {
        console.log(error);
      }
    };

  const addCategory =
    async () => {
      if (!name) {
        toast.info(
          "Enter Category Name"
        );
        return;
      }

      try {
        const token =
          localStorage.getItem(
            "token"
          );

        await api.post(
          "/categories",
          { name },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setName("");

        fetchCategories();

        toast.success(
          "Category Added"
        );
      } catch (error) {
        console.log(error);
      }
    };

  return (
    <>
      <Navbar />

      <div
        style={{
          padding: "20px",
        }}
      >
        <h1>
          Categories
        </h1>

        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) =>
            setName(
              e.target.value
            )
          }
        />

        <button
          onClick={
            addCategory
          }
          style={{
            marginLeft:
              "10px",
          }}
        >
          Add Category
        </button>

        <hr />

        {categories.map(
          (cat) => (
            <div
              key={
                cat.id
              }
              style={{
                padding:
                  "10px",
              }}
            >
              {
                cat.name
              }
            </div>
          )
        )}
      </div>
    </>
  );
}

export default Categories;