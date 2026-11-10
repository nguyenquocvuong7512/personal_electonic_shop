
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { topicService } from "@/services/topicService";
import "@/styles/admin/posts.css";

// Chuyển tên danh mục thành slug
const generateSlug = (text) => {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

export default function CreateTopicPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        ten: "",
        slug: "",
        mota: "",
        trangthai: "hienthi",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Xử lý khi nhập dữ liệu
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Tự tạo slug khi nhập tên danh mục
        if (name === "ten") {
            setFormData((prev) => ({
                ...prev,
                ten: value,
                slug: generateSlug(value),
            }));
        }
    };

    // Gửi dữ liệu lên API
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.ten.trim()) {
            setError("Vui lòng nhập tên danh mục.");
            return;
        }

        try {
            setLoading(true);

            const data = {
                ...formData,
                ten: formData.ten.trim(),
                slug: formData.slug.trim() || generateSlug(formData.ten),
            };

            const response = await topicService.create(data);

            if (response?.success === true) {
                alert("Thêm danh mục thành công!");
                router.push("/admin/topics");
            } else {
                setError(response?.message || "Không thể thêm danh mục.");
            }
        } catch (err) {
            console.error("Lỗi thêm danh mục:", err);

            const validationErrors = err?.response?.data?.errors;

            if (validationErrors) {
                const firstError = Object.values(validationErrors)[0];
                setError(Array.isArray(firstError) ? firstError[0] : "Dữ liệu không hợp lệ.");
            } else {
                setError(
                    err?.response?.data?.message ||
                    "Có lỗi xảy ra khi thêm danh mục."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-post-create-container">
            <div className="admin-post-create-header">
                <h1>Thêm danh mục bài viết</h1>

                <Link
                    href="/admin/topics"
                    className="admin-post-create-back"
                >
                    ← Quay lại
                </Link>
            </div>

            <form
                className="admin-post-create-form"
                onSubmit={handleSubmit}
            >
                <div className="admin-post-create-group">
                    <label className="admin-post-create-label">
                        Tên danh mục <span>*</span>
                    </label>

                    <input
                        type="text"
                        name="ten"
                        className="admin-post-create-input"
                        placeholder="Nhập tên danh mục"
                        value={formData.ten}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="admin-post-create-group">
                    <label className="admin-post-create-label">
                        Slug
                    </label>

                    <input
                        type="text"
                        name="slug"
                        className="admin-post-create-input"
                        placeholder="duong-dan-danh-muc"
                        value={formData.slug}
                        onChange={handleChange}
                    />

                    <small>
                        Slug được tự động tạo từ tên danh mục. Bạn có thể chỉnh sửa.
                    </small>
                </div>

                <div className="admin-post-create-group">
                    <label className="admin-post-create-label">
                        Mô tả
                    </label>

                    <textarea
                        name="mota"
                        className="admin-post-create-textarea"
                        placeholder="Nhập mô tả danh mục..."
                        rows={5}
                        value={formData.mota}
                        onChange={handleChange}
                    />
                </div>

                <div className="admin-post-create-group">
                    <label className="admin-post-create-label">
                        Trạng thái
                    </label>

                    <select
                        name="trangthai"
                        className="admin-post-create-select"
                        value={formData.trangthai}
                        onChange={handleChange}
                    >
                        <option value="hienthi">Hiển thị</option>
                        <option value="an">Ẩn</option>
                    </select>
                </div>

                {error && (
                    <div className="admin-post-create-error">
                        {error}
                    </div>
                )}

                <div className="admin-post-create-actions">
                    <button
                        type="submit"
                        className="admin-post-create-submit"
                        disabled={loading}
                    >
                        {loading ? "Đang lưu..." : "Thêm danh mục"}
                    </button>

                    <Link
                        href="/admin/topics"
                        className="admin-post-create-back"
                    >
                        Hủy
                    </Link>
                </div>
            </form>
        </div>
    );
}
