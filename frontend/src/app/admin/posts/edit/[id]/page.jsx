
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { postService } from "@/services/postService";
import { generateSlug } from "@/utils/slug";
import "@/styles/admin/posts.css";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [formData, setFormData] = useState({
    tieude: "",
    slug: "",
    chudebaiviet_id: "",
    noidung: "",
    trangthai: "bannhap",
  });

  const [topics, setTopics] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Lấy danh sách chủ đề và thông tin bài viết
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [topicResponse, postResponse] = await Promise.all([
          postService.getFormOptions(),
          postService.getById(id),
        ]);

        const topicList = topicResponse?.topics || [];
        setTopics(Array.isArray(topicList) ? topicList : []);

        console.log("Chi tiết bài viết:", postResponse);

        const post = postResponse?.data;

        if (!postResponse?.success || !post) {
          throw new Error("Không tìm thấy dữ liệu bài viết.");
        }

        setFormData({
          tieude: post.tieude || "",
          slug: post.slug || "",
          chudebaiviet_id: post.chudebaiviet_id || "",
          noidung: post.noidung || "",
          trangthai: post.trangthai || "bannhap",
        });

        setCurrentImage(post.hinhanh || null);
      } catch (err) {
        console.error("Lỗi lấy thông tin bài viết:", err);

        setError(
          err?.response?.data?.message ||
            err.message ||
            "Không thể tải thông tin bài viết."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

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

  // Chọn hình ảnh mới
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Giải phóng URL xem trước
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Tạo URL ảnh hiện tại
  const getCurrentImageUrl = () => {
    if (!currentImage) return null;

    if (currentImage.startsWith("http")) {
      return currentImage;
    }

    return `http://localhost:8000/storage/${currentImage}`;
  };

  // Cập nhật bài viết
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError(null);

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "" && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      // Chỉ gửi ảnh khi người dùng chọn ảnh mới
      if (imageFile) {
        data.append("hinhanh", imageFile);
      }

      const res = await postService.update(id, data);

      console.log("Response cập nhật bài viết:", res);

      if (res?.success === true) {
        alert("Cập nhật bài viết thành công!");
        router.push("/admin/posts");
        return;
      }

      setError(res?.message || "Không thể cập nhật bài viết.");
    } catch (err) {
      console.error("Lỗi cập nhật bài viết:", err);

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
            "Không thể cập nhật bài viết."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-posts-loading">
        <div className="admin-posts-spinner"></div>
        <p>Đang tải thông tin bài viết...</p>
      </div>
    );
  }

  if (error && !formData.tieude) {
    return (
      <div className="admin-post-create-container">
        <div className="admin-post-create-error">{error}</div>
        <Link href="/admin/posts" className="admin-post-create-back">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-post-create-container">
      <div className="admin-post-create-header">
        <h1>Sửa bài viết</h1>

        <Link
          href="/admin/posts"
          className="admin-post-create-back"
        >
          ← Quay lại
        </Link>
      </div>

      {error && (
        <div className="admin-post-create-error">{error}</div>
      )}

      <form
        onSubmit={handleSubmit}
        className="admin-post-create-form"
      >
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
              required
            />
          </div>
        </div>

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
            >
              <option value="">-- Chọn chủ đề --</option>

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
            required
          />
        </div>

        <div className="admin-post-create-group">
          <label className="admin-post-create-label">
            Hình ảnh đại diện
          </label>

          {imagePreview ? (
            <div className="admin-post-create-preview">
              <p>Ảnh mới đã chọn:</p>
              <img
                src={imagePreview}
                alt="Ảnh mới"
                className="admin-post-create-preview-img"
              />
            </div>
          ) : currentImage ? (
            <div className="admin-post-create-preview">
              <p>Ảnh hiện tại:</p>
              <img
                src={getCurrentImageUrl()}
                alt="Ảnh bài viết hiện tại"
                className="admin-post-create-preview-img"
              />
            </div>
          ) : null}

          <input
            className="admin-post-create-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <div className="admin-post-create-actions">
          <button
            type="submit"
            className="admin-post-create-submit"
            disabled={saving}
          >
            {saving ? "Đang cập nhật..." : "Cập nhật bài viết"}
          </button>
        </div>
      </form>
    </div>
  );
}
