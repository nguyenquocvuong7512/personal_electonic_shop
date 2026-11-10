"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { topicService } from "@/services/topicService";
import "@/styles/admin/posts.css";

export default function TopicListPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Lấy danh sách danh mục từ API
  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await topicService.getAll();

      console.log("Danh sách danh mục:", response);

      const dataList = response?.data?.data || [];

      setTopics(Array.isArray(dataList) ? dataList : []);
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);

      setError(
        err?.response?.data?.message || "Không thể tải danh sách danh mục.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // Xóa danh mục
  const handleDelete = async (id, ten) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa danh mục "${ten}" không?`,
    );

    if (!confirmed) return;

    try {
      const response = await topicService.delete(id);

      if (response?.success === true) {
        setTopics((prev) => prev.filter((item) => item.id !== id));

        alert("Xóa danh mục thành công!");
      } else {
        alert(response?.message || "Không thể xóa danh mục.");
      }
    } catch (err) {
      console.error("Lỗi xóa danh mục:", err);

      alert(
        err?.response?.data?.message ||
          "Không thể xóa danh mục. Có thể danh mục vẫn đang chứa bài viết.",
      );
    }
  };

  if (loading) {
    return (
      <div className="admin-posts-loading">
        <div className="admin-posts-spinner"></div>
        <p>Đang tải danh sách danh mục...</p>
      </div>
    );
  }

  return (
    <div className="admin-post-page">
      <div className="admin-post-header">
        <h1>Quản lý danh mục bài viết</h1>

        <div className="admin-post-header-actions">
          <Link href="/admin/topics/trash" className="admin-post-back">
            🗑 Thùng rác
          </Link>

          <Link href="/admin/topics/create" className="admin-post-add">
            + Thêm danh mục
          </Link>
        </div>
      </div>

      {error ? (
        <div className="admin-post-table-message admin-post-table-error">
          {error}
        </div>
      ) : topics.length === 0 ? (
        <div className="admin-post-table-message">
          Chưa có danh mục bài viết nào.
        </div>
      ) : (
        <div className="admin-post-table-container">
          <table className="admin-post-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên danh mục</th>
                <th>Slug</th>
                <th>Số bài viết</th>
                <th>Trạng thái</th>
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
                    <span
                      className={`admin-post-table-status admin-post-table-status-${item.trangthai}`}
                    >
                      {item.trangthai === "hienthi" ? "Hiển thị" : "Đã ẩn"}
                    </span>
                  </td>

                  <td>
                    <div className="admin-post-table-actions">
                      <Link
                        href={`/admin/topics/edit/${item.id}`}
                        className="admin-post-table-edit"
                      >
                        Sửa
                      </Link>

                      <button
                        type="button"
                        className="admin-post-table-delete"
                        onClick={() => handleDelete(item.id, item.ten)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
