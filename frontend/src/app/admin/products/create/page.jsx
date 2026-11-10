"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { productService } from "@/services/productService";
import "@/styles/admin/products.css";
import { generateSlug } from "@/utils/slug";

export default function CreateProductPage() {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const { categories: listCat, brands: listBrand } =
          await productService.getFormOptions();

        setCategories(listCat || []);
        setBrands(listBrand || []);
      } catch (err) {
        console.error("Lỗi lấy danh sách danh mục/thương hiệu:", err);
      }
    };

    fetchSelectData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "ten") {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
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
    setLoading(true);
    setError(null);

    try {
      // Kiểm tra giá khuyến mãi trước khi gửi lên server
      if (
        formData.giakhuyenmai !== "" &&
        Number(formData.giakhuyenmai) > Number(formData.gia)
      ) {
        setError("Giá khuyến mãi không được lớn hơn giá bán.");
        setLoading(false);
        return;
      }

      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "" && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      if (imageFile) {
        data.append("hinhanh", imageFile);
      }

      // Gọi API thêm sản phẩm
      const res = await productService.create(data);

      console.log("Response từ create:", res);

      // Chỉ chuyển trang khi thêm thành công
      if (res?.success === true) {
        router.push("/admin/products");
        return;
      }

      // Trường hợp server trả về thông báo lỗi
      setError(res?.message || "Không thể thêm sản phẩm.");
    } catch (err) {
      console.error("Lỗi thêm sản phẩm:", err);

      // Lấy lỗi validation từ Laravel
      const validationErrors = err?.response?.data?.errors;

      // Hiển thị thông báo khi tên sản phẩm đã tồn tại
      if (validationErrors?.ten) {
        setError("Tên sản phẩm đã tồn tại. Vui lòng nhập tên khác.");
      } else if (validationErrors) {
        // Hiển thị lỗi validation đầu tiên
        const firstError = Object.values(validationErrors)[0];

        setError(
          Array.isArray(firstError) ? firstError[0] : "Dữ liệu không hợp lệ.",
        );
      } else {
        // Hiển thị lỗi chung từ server
        setError(err?.response?.data?.message || "Không thể thêm sản phẩm.");
      }
    } finally {
      setLoading(false);
    } 
  };
  return (
    <div className="product-form-container">
      <div className="admin-header">
        <h1>Thêm sản phẩm mới</h1>
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
          <label>Hình ảnh sản phẩm</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {imagePreview && (
            <div className="image-preview" style={{ marginTop: "10px" }}>
              <img
                src={imagePreview}
                alt="Preview"
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
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  );
}
