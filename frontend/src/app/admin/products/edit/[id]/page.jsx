"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { productService } from "@/services/productService";
import "@/styles/admin/products.css";
import { generateSlug } from "@/utils/slug";

export default function EditProductPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [formData, setFormData] = useState({
    ten: "",
    slug: "",
    gia: "",
    giakhuyenmai: "",
    soluong: "",
    mota: "",
    trangthai: "hienthi",
    danhmuc_id: "",
    thuonghieu_id: "",
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [resProduct, { categories: listCat, brands: listBrand }] =
          await Promise.all([
            productService.getById(id),
            productService.getFormOptions(),
          ]);

        const data = resProduct?.data || resProduct;
        setFormData({
          ten: data.ten || "",
          slug: data.slug || generateSlug(data.ten || ""),
          gia: data.gia || "",
          giakhuyenmai: data.giakhuyenmai || "",
          soluong: data.soluong || "",
          mota: data.mota || "",
          trangthai: data.trangthai || "hienthi",
          danhmuc_id: data.danhmuc_id || "",
          thuonghieu_id: data.thuonghieu_id || "",
        });

        // SỬA: Lấy dữ liệu từ trường sanpham_hinhanh
        setCurrentImage(data.sanpham_hinhanh || "");

        setCategories(listCat);
        setBrands(listBrand);
      } catch (err) {
        console.error("Lỗi tải dữ liệu sản phẩm:", err);
        setError("Không thể lấy thông tin sản phẩm!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });

      if (imageFile) {
        data.append("hinhanh", imageFile);
      }

      // Laravel nhận phương thức PUT thông qua POST và _method.
      data.append("_method", "PUT");

      await productService.update(id, data);

      // Chỉ chuyển trang khi cập nhật thành công.
      router.push("/admin/products");
    } catch (err) {
      console.error("Lỗi cập nhật sản phẩm:", err);

      // Ưu tiên hiển thị lỗi cụ thể của từng trường từ Laravel.
      const validationErrors = err.response?.data?.errors;
      const firstFieldError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;

      const message =
        firstFieldError ||
        err.response?.data?.message ||
        "Có lỗi xảy ra khi cập nhật sản phẩm. Vui lòng thử lại.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="admin-status-message">Đang tải thông tin sản phẩm...</div>
    );

  return (
    <div className="product-form-container">
      <div className="admin-header">
        <h1>Chỉnh sửa sản phẩm #{id}</h1>
        <Link href="/admin/products" className="btn-back">
          ← Quay lại
        </Link>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-row">
          <div className="form-group">
            <label>Tên sản phẩm (*)</label>
            <input
              type="text"
              name="ten"
              value={formData.ten}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Slug (Đường dẫn SEO) (*)</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Danh mục (*)</label>
            <select
              name="danhmuc_id"
              value={formData.danhmuc_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.ten || cat.tendanhmuc || `Danh mục #${cat.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Thương hiệu</label>
            <select
              name="thuonghieu_id"
              value={formData.thuonghieu_id}
              onChange={handleChange}
            >
              <option value="">-- Chọn thương hiệu --</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.ten ||
                    brand.tenthuonghieu ||
                    `Thương hiệu #${brand.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Giá bán (*)</label>
            <input
              type="number"
              name="gia"
              value={formData.gia}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Giá khuyến mãi</label>
            <input
              type="number"
              name="giakhuyenmai"
              value={formData.giakhuyenmai}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Số lượng tồn kho (*)</label>
            <input
              type="number"
              name="soluong"
              value={formData.soluong}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select
              name="trangthai"
              value={formData.trangthai}
              onChange={handleChange}
            >
              <option value="hienthi">Hiển thị</option>
              <option value="an">Ẩn</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Mô tả sản phẩm</label>
          <textarea
            name="mota"
            rows="4"
            value={formData.mota}
            onChange={handleChange}
            placeholder="Nhập mô tả sản phẩm..."
          ></textarea>
        </div>

        <div className="form-group">
          <label>Hình ảnh hiện tại</label>
          {currentImage ? (
            <div
              className="current-image-preview"
              style={{ marginBottom: "10px" }}
            >
              <img
                src={
                  currentImage.startsWith("http")
                    ? currentImage
                    : `http://localhost:8000/storage/${currentImage}`
                }
                alt="Ảnh sản phẩm hiện tại"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
            </div>
          ) : (
            <p style={{ color: "#888", fontSize: "14px" }}>Chưa có ảnh</p>
          )}

          <label>Thay đổi hình ảnh (nếu có)</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {imagePreview && (
            <div className="image-preview" style={{ marginTop: "10px" }}>
              <p style={{ fontSize: "13px", color: "#666" }}>Ảnh mới chọn:</p>
              <img
                src={imagePreview}
                alt="Preview ảnh mới"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? "Đang lưu..." : "Cập nhật sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  );
}
