"use client";

import { useEffect, useState } from "react";
import ProductCard from "../../../components/shop/ProductCard";
import api from "../../../services/api";
import "../../../styles/shop/products.css";
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Tìm kiếm
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  // Danh sách danh mục lấy từ API
  const [categories, setCategories] = useState([]);
  // ID danh mục đang được chọn
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/san-pham", {
          params: {
            page: currentPage,
            per_page: 8,
            search: search.trim() || undefined,
            danhmuc_id: categoryId || undefined,
          },
        });
        // Nếu component đã bị hủy hoặc yêu cầu đã bị thay thế
        // thì dừng xử lý để tránh cập nhật dữ liệu không cần thiết
        if (cancelled) return;

        const pagination = response.data?.data;

        setProducts(Array.isArray(pagination?.data) ? pagination.data : []);
        setCurrentPage(pagination?.current_page || 1);
        setLastPage(pagination?.last_page || 1);
        setTotal(pagination?.total || 0);
      } catch (err) {
        if (cancelled) return;

        console.error("Lỗi tải danh sách sản phẩm:", err);
        setError("Không thể tải danh sách sản phẩm.");
        setProducts([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProducts();
    // Hàm dọn dẹp được chạy khi component bị hủy
    return () => {
      // Đánh dấu yêu cầu cũ không còn được sử dụng
      cancelled = true;
    };
  }, [currentPage, search, categoryId]);

  // Gửi yêu cầu tìm kiếm
  function handleSearch(event) {
    event.preventDefault();
    setCurrentPage(1);
    setSearch(keyword);
  }

  // Chuyển trang
  function handlePageChange(page) {
    if (page < 1 || page > lastPage || page === currentPage) {
      return;
    }

    setCurrentPage(page);
  }
  // Lấy danh sách danh mục đang hiển thị
  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      try {
        const response = await api.get("/danh-muc", {
          params: {
            per_page: 100,
          },
        });

        if (cancelled) return;

        const pagination = response.data?.data;
        setCategories(Array.isArray(pagination?.data) ? pagination.data : []);
      } catch (err) {
        if (!cancelled) {
          console.error("Lỗi tải danh mục:", err);
        }
      }
    }

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <main className="shop-main">
      <h1 className="products-title">Danh sách sản phẩm</h1>

      <form className="products-search-form" onSubmit={handleSearch}>
        <input
          type="text"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          aria-label="Tìm kiếm sản phẩm"
        />

        <button type="submit">Tìm kiếm</button>
      </form>
      <div className="products-filter">
        <label htmlFor="category-filter">Lọc theo danh mục:</label>

        <select
          id="category-filter"
          value={categoryId}
          onChange={(event) => {
            setCurrentPage(1);
            setCategoryId(event.target.value);
          }}
        >
          <option value="">Tất cả danh mục</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.ten}
            </option>
          ))}
        </select>
      </div>
      {!loading && !error && (
        <p className="products-total">Tìm thấy {total} sản phẩm</p>
      )}

      {loading ? (
        <p>Đang tải sản phẩm...</p>
      ) : error ? (
        <p>{error}</p>
      ) : products.length === 0 ? (
        <p>Không tìm thấy sản phẩm phù hợp.</p>
      ) : (
        <>
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {lastPage > 1 && (
            <nav
              className="products-pagination"
              aria-label="Phân trang sản phẩm"
            >
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trang trước
              </button>

              {Array.from({ length: lastPage }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    disabled={page === currentPage}
                    aria-current={page === currentPage ? "page" : undefined}
                    className={page === currentPage ? "active" : ""}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === lastPage}
              >
                Trang sau
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
