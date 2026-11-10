
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { postService } from "@/services/postService";
import "@/styles/admin/posts.css";

export default function PostTrashPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Lấy danh sách bài viết trong thùng rác
  const fetchTrash = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await postService.getTrash();

      console.log("Dữ liệu thùng rác:", response);

      const dataList =
        response?.data?.data ||
        response?.data ||
        response ||
        [];

      setPosts(Array.isArray(dataList) ? dataList : []);
    } catch (err) {
      console.error("Lỗi lấy thùng rác:", err);

      setError(
        err?.response?.data?.message ||
          "Không thể tải danh sách bài viết trong thùng rác."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  // Khôi phục bài viết
  const handleRestore = async (id, tieude) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn khôi phục bài viết "${tieude}"?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(id);

      const response = await postService.restore(id);

      if (response?.success === true) {
        setPosts((prev) => prev.filter((item) => item.id !== id));
        alert("Khôi phục bài viết thành công!");
      } else {
        alert(response?.message || "Không thể khôi phục bài viết.");
      }
    } catch (err) {
      console.error("Lỗi khôi phục bài viết:", err);

      alert(
        err?.response?.data?.message ||
          "Có lỗi xảy ra khi khôi phục bài viết."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Xóa vĩnh viễn bài viết
  const handleForceDelete = async (id, tieude) => {
    const confirmed = window.confirm(
      `CẢNH BÁO: Bạn có chắc muốn xóa vĩnh viễn bài viết "${tieude}"? Hành động này không thể hoàn tác!`
    );

    if (!confirmed) return;

    try {
      setProcessingId(id);

      const response = await postService.forceDelete(id);

      if (response?.success === true) {
        setPosts((prev) => prev.filter((item) => item.id !== id));
        alert("Đã xóa vĩnh viễn bài viết!");
      } else {
        alert(response?.message || "Không thể xóa bài viết.");
      }
    } catch (err) {
      console.error("Lỗi xóa vĩnh viễn:", err);

      alert(
        err?.response?.data?.message ||
          "Có lỗi xảy ra khi xóa vĩnh viễn bài viết."
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-posts-loading">
        <div className="admin-posts-spinner"></div>
        <p>Đang tải thùng rác...</p>
      </div>
    );
  }

  return (
    <div className="admin-post-page">
      <div className="admin-post-header">
        <h1>Thùng rác bài viết</h1>

        <div className="admin-post-header-actions">
          <Link href="/admin/posts" className="admin-post-back">
            ← Quay lại bài viết
          </Link>
        </div>
      </div>

      {error && (
        <div className="admin-post-table-message admin-post-table-error">
          {error}
        </div>
      )}

      {!error && posts.length === 0 ? (
        <div className="admin-post-table-message">
          Thùng rác hiện chưa có bài viết nào.
        </div>
      ) : (
        <div className="admin-post-table-container">
          <table className="admin-post-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Chủ đề</th>
                <th>Ngày xóa</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {posts.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>

                  <td>
                    <strong className="admin-post-table-title">
                      {item.tieude}
                    </strong>
                  </td>

                  <td>
                    {item.chudebaiviet?.ten || "-"}
                  </td>

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
                          handleRestore(item.id, item.tieude)
                        }
                        disabled={processingId === item.id}
                      >
                        Khôi phục
                      </button>

                      <button
                        type="button"
                        className="admin-post-force-delete"
                        onClick={() =>
                          handleForceDelete(item.id, item.tieude)
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
      )}
    </div>
  );
}
