
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { topicService } from "@/services/topicService";
import "@/styles/admin/posts.css";

export default function TopicTrashPage() {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState(null);

    // Lấy danh sách danh mục trong thùng rác
    const fetchTrash = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await topicService.getTrash();

            console.log("Dữ liệu thùng rác danh mục:", response);

            const dataList =
                response?.data?.data ||
                response?.data ||
                response ||
                [];

            setTopics(Array.isArray(dataList) ? dataList : []);
        } catch (err) {
            console.error("Lỗi lấy thùng rác danh mục:", err);

            setError(
                err?.response?.data?.message ||
                "Không thể tải danh sách danh mục trong thùng rác."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    // Khôi phục danh mục
    const handleRestore = async (id, ten) => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn khôi phục danh mục "${ten}"?`
        );

        if (!confirmed) return;

        try {
            setProcessingId(id);

            const response = await topicService.restore(id);

            if (response?.success === true) {
                setTopics((prev) =>
                    prev.filter((item) => item.id !== id)
                );

                alert("Khôi phục danh mục thành công!");
            } else {
                alert(response?.message || "Không thể khôi phục danh mục.");
            }
        } catch (err) {
            console.error("Lỗi khôi phục danh mục:", err);

            alert(
                err?.response?.data?.message ||
                "Có lỗi xảy ra khi khôi phục danh mục."
            );
        } finally {
            setProcessingId(null);
        }
    };

    // Xóa vĩnh viễn danh mục
    const handleForceDelete = async (id, ten) => {
        const confirmed = window.confirm(
            `CẢNH BÁO: Bạn có chắc muốn xóa vĩnh viễn danh mục "${ten}"? Hành động này không thể hoàn tác!`
        );

        if (!confirmed) return;

        try {
            setProcessingId(id);

            const response = await topicService.forceDelete(id);

            if (response?.success === true) {
                setTopics((prev) =>
                    prev.filter((item) => item.id !== id)
                );

                alert("Đã xóa vĩnh viễn danh mục!");
            } else {
                alert(response?.message || "Không thể xóa danh mục.");
            }
        } catch (err) {
            console.error("Lỗi xóa vĩnh viễn danh mục:", err);

            alert(
                err?.response?.data?.message ||
                "Không thể xóa vĩnh viễn danh mục. Có thể vẫn còn bài viết liên kết."
            );
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="admin-posts-loading">
                <div className="admin-posts-spinner"></div>
                <p>Đang tải thùng rác danh mục...</p>
            </div>
        );
    }

    return (
        <div className="admin-post-page">
            <div className="admin-post-header">
                <h1>Thùng rác danh mục bài viết</h1>

                <div className="admin-post-header-actions">
                    <Link
                        href="/admin/topics"
                        className="admin-post-back"
                    >
                        ← Quay lại danh mục
                    </Link>
                </div>
            </div>

            {error && (
                <div className="admin-post-table-message admin-post-table-error">
                    {error}
                </div>
            )}

            {!error && topics.length === 0 ? (
                <div className="admin-post-table-message">
                    Thùng rác hiện chưa có danh mục nào.
                </div>
            ) : (
                !error && (
                    <div className="admin-post-table-container">
                        <table className="admin-post-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên danh mục</th>
                                    <th>Slug</th>
                                    <th>Số bài viết</th>
                                    <th>Ngày xóa</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>

                            <tbody>
                                {topics.map((item) => (
                                    <tr key={item.id}>
                                        <td>#{item.id}</td>

                                        <td>
                                            <strong className="admin-post-table-title">
                                                {item.ten}
                                            </strong>
                                        </td>

                                        <td>{item.slug}</td>

                                        <td>{item.baiviets_count ?? 0}</td>

                                        <td>
                                            {item.deleted_at
                                                ? new Date(item.deleted_at).toLocaleString("vi-VN")
                                                : "-"}
                                        </td>

                                        <td>
                                            <div className="admin-post-table-actions">
                                                <button
                                                    type="button"
                                                    className="admin-post-restore"
                                                    onClick={() =>
                                                        handleRestore(item.id, item.ten)
                                                    }
                                                    disabled={processingId === item.id}
                                                >
                                                    Khôi phục
                                                </button>

                                                <button
                                                    type="button"
                                                    className="admin-post-force-delete"
                                                    onClick={() =>
                                                        handleForceDelete(item.id, item.ten)
                                                    }
                                                    disabled={processingId === item.id}
                                                >
                                                    Xóa vĩnh viễn
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
}
