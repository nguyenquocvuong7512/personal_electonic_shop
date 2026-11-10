"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PostTable from "@/components/admin/PostTable";
import { postService } from "@/services/postService";
import "@/styles/admin/posts.css";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Lấy danh sách bài viết từ Laravel API
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await postService.getAll();

      console.log("Dữ liệu API bài viết:", response);

      // Bóc tách danh sách bài viết từ phản hồi API
      const dataList = response?.data?.data || response?.data || response || [];

      setPosts(Array.isArray(dataList) ? dataList : []);
    } catch (err) {
      console.error("Lỗi khi gọi API bài viết:", err);

      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách bài viết. Hãy kiểm tra kết nối Laravel!",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Đưa bài viết vào thùng rác
  const handleDelete = async (id, tieude) => {
    const isConfirmed = window.confirm(
      `Bạn có chắc chắn muốn đưa bài viết "${tieude}" vào thùng rác?`,
    );

    if (!isConfirmed) return;

    try {
      setDeletingId(id);

      await postService.delete(id);

      setPosts((prev) => prev.filter((item) => item.id !== id));

      alert("Đã đưa bài viết vào thùng rác!");
    } catch (err) {
      console.error("Lỗi khi xóa bài viết:", err);

      alert(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi đưa bài viết vào thùng rác!",
      );
    } finally {
      setDeletingId(null);
    }
  };
  if (loading) {
    return (
      <div className="admin-posts-loading">
        <div className="admin-posts-spinner"></div>
        <p>Đang tải dữ liệu bài viết...</p>
      </div>
    );
  }
  return (
    <div className="admin-post-page">
      <div className="admin-post-header">
        <h1>Quản lý bài viết</h1>

        <div className="admin-post-header-actions">
          <Link href="/admin/posts/trash" className="admin-post-trash">
            🗑 Thùng rác
          </Link>

          <Link href="/admin/posts/create" className="admin-post-add">
            + Thêm bài viết
          </Link>
        </div>
      </div>

      <PostTable
        posts={posts}
        loading={loading}
        error={error}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
    </div>
  );
}
