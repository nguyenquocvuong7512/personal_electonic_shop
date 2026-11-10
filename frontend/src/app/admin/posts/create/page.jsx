
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { postService } from "@/services/postService";
import { generateSlug } from "@/utils/slug";
import "@/styles/admin/posts.css";

export default function CreatePostPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    tieude: "",
    slug: "",
    chudebaiviet_id: "",
    noidung: "",
    trangthai: "bannhap",
  });

  const [topics, setTopics] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [error, setError] = useState(null);

  // Lấy danh sách chủ đề bài viết
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const { topics: topicList } =
          await postService.getFormOptions();

        setTopics(Array.isArray(topicList) ? topicList : []);
      } catch (err) {
        console.error("Lỗi lấy danh sách chủ đề:", err);
      } finally {
        setLoadingTopics(false);
      }
    };

    fetchTopics();
  }, []);

  // Xử lý thay đổi dữ liệu form
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "tieude") {
        updated.slug = generateSlug(value);
      }

      return updated;
    });
  };

  // Xử lý chọn hình ảnh
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setImageFile(file);

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Giải phóng URL ảnh xem trước khi component bị hủy
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Gửi dữ liệu lên Laravel
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "" && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      if (imageFile) {
        data.append("hinhanh", imageFile);
      }

      const res = await postService.create(data);

      console.log("Response từ create bài viết:", res);

      if (res?.success === true) {
        alert("Thêm bài viết thành công!");
        router.push("/admin/posts");
        return;
      }

      setError(res?.message || "Không thể thêm bài viết.");
    } catch (err) {
      console.error("Lỗi thêm bài viết:", err);

      const validationErrors = err?.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0];

        setError(
          Array.isArray(firstError)
            ? firstError[0]
            : "Dữ liệu không hợp lệ."
        );
      } else {
        setError(
          err?.response?.data?.message ||
            "Không thể thêm bài viết."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-post-create-container">
      <div className="admin-post-create-header">
        <h1>Thêm bài viết mới</h1>

        <Link
          href="/admin/posts"
          className="admin-post-create-back"
        >
          ← Quay lại
        </Link>
      </div>

      {error && (
        <div className="admin-post-create-error">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="admin-post-create-form"
      >
        {/* Tiêu đề và Slug */}
        <div className="admin-post-create-row">
          <div className="admin-post-create-group">
            <label className="admin-post-create-label">
              Tiêu đề bài viết (*)
            </label>

            <input
              className="admin-post-create-input"
              type="text"
              name="tieude"
              value={formData.tieude}
              onChange={handleChange}
              placeholder="Nhập tiêu đề bài viết..."
              required
            />
          </div>

          <div className="admin-post-create-group">
            <label className="admin-post-create-label">
              Slug (Đường dẫn SEO) (*)
            </label>

            <input
              className="admin-post-create-input"
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="duong-dan-bai-viet"
              required
            />
          </div>
        </div>

        {/* Chủ đề và trạng thái */}
        <div className="admin-post-create-row">
          <div className="admin-post-create-group">
            <label className="admin-post-create-label">
              Chủ đề bài viết (*)
            </label>

            <select
              className="admin-post-create-select"
              name="chudebaiviet_id"
              value={formData.chudebaiviet_id}
              onChange={handleChange}
              required
              disabled={loadingTopics}
            >
              <option value="">
                {loadingTopics
                  ? "Đang tải chủ đề..."
                  : "-- Chọn chủ đề --"}
              </option>

              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.ten || `Chủ đề #${topic.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-post-create-group">
            <label className="admin-post-create-label">
              Trạng thái
            </label>

            <select
              className="admin-post-create-select"
              name="trangthai"
              value={formData.trangthai}
              onChange={handleChange}
            >
              <option value="bannhap">Bản nháp</option>
              <option value="hienthi">Hiển thị</option>
              <option value="an">Ẩn</option>
            </select>
          </div>
        </div>

        {/* Nội dung */}
        <div className="admin-post-create-group">
          <label className="admin-post-create-label">
            Nội dung bài viết (*)
          </label>

          <textarea
            className="admin-post-create-textarea"
            name="noidung"
            rows="12"
            value={formData.noidung}
            onChange={handleChange}
            placeholder="Nhập nội dung bài viết..."
            required
          />
        </div>

        {/* Hình ảnh */}
        <div className="admin-post-create-group">
          <label className="admin-post-create-label">
            Hình ảnh đại diện
          </label>

          <input
            className="admin-post-create-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

          {imagePreview && (
            <div className="admin-post-create-preview">
              <img
                src={imagePreview}
                alt="Xem trước ảnh bài viết"
                className="admin-post-create-preview-img"
              />
            </div>
          )}
        </div>

        {/* Nút lưu */}
        <div className="admin-post-create-actions">
          <button
            type="submit"
            className="admin-post-create-submit"
            disabled={loading || loadingTopics}
          >
            {loading ? "Đang lưu..." : "Lưu bài viết"}
          </button>
        </div>
      </form>
    </div>
  );
}
