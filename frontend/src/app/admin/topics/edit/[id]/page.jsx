
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { topicService } from "@/services/topicService";
import "@/styles/admin/posts.css";

const generateSlug = (text) => {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

export default function EditTopicPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;

    const [formData, setFormData] = useState({
        ten: "",
        slug: "",
        mota: "",
        trangthai: "hienthi",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Lấy thông tin danh mục cần sửa
    useEffect(() => {
        const fetchTopic = async () => {
            try {
                setLoading(true);

                const response = await topicService.getById(id);

                console.log("Chi tiết danh mục:", response);

                const topic = response?.data;

                if (!topic) {
                    setError("Không tìm thấy danh mục.");
                    return;
                }

                setFormData({
                    ten: topic.ten || "",
                    slug: topic.slug || "",
                    mota: topic.mota || "",
                    trangthai: topic.trangthai || "hienthi",
                });
            } catch (err) {
                console.error("Lỗi lấy danh mục:", err);

                setError(
                    err?.response?.data?.message ||
                    "Không thể tải thông tin danh mục."
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTopic();
        }
    }, [id]);

    // Xử lý thay đổi dữ liệu
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "ten") {
            setFormData((prev) => ({
                ...prev,
                ten: value,
                slug: generateSlug(value),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Cập nhật danh mục
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.ten.trim()) {
            setError("Vui lòng nhập tên danh mục.");
            return;
        }

        try {
            setSaving(true);

            const data = {
                ...formData,
                ten: formData.ten.trim(),
                slug: formData.slug.trim() || generateSlug(formData.ten),
            };

            const response = await topicService.update(id, data);

            if (response?.success === true) {
                alert("Cập nhật danh mục thành công!");
                router.push("/admin/topics");
            } else {
                setError(response?.message || "Không thể cập nhật danh mục.");
            }
        } catch (err) {
            console.error("Lỗi cập nhật danh mục:", err);

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
                    "Có lỗi xảy ra khi cập nhật danh mục."
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
                <p>Đang tải thông tin danh mục...</p>
            </div>
        );
    }

    if (error && !formData.ten) {
        return (
            <div className="admin-post-create-container">
                <div className="admin-post-create-error">{error}</div>
                <Link href="/admin/topics" className="admin-post-create-back">
                    ← Quay lại danh sách
                </Link>
            </div>
        );
    }

    return (
        <div className="admin-post-create-container">
            <div className="admin-post-create-header">
                <h1>Sửa danh mục bài viết</h1>

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
                        value={formData.ten}
                        onChange={handleChange}
                        placeholder="Nhập tên danh mục"
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
                        value={formData.slug}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                slug: e.target.value,
                            }))
                        }
                        placeholder="duong-dan-danh-muc"
                    />
                </div>

                <div className="admin-post-create-group">
                    <label className="admin-post-create-label">
                        Mô tả
                    </label>

                    <textarea
                        name="mota"
                        className="admin-post-create-textarea"
                        rows={5}
                        value={formData.mota}
                        onChange={handleChange}
                        placeholder="Nhập mô tả danh mục..."
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
                        disabled={saving}
                    >
                        {saving ? "Đang cập nhật..." : "Cập nhật danh mục"}
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
