
"use client";

import { useEffect, useState } from "react";
import PostCard from "../../../components/shop/PostCard";
import api from "../../../services/api";
import "../../../styles/shop/posts.css";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Chủ đề đang được chọn
  const [topicId, setTopicId] = useState("");

  // Lấy danh sách bài viết
  useEffect(() => {
    let cancelled = false;

    async function fetchPosts() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/bai-viet", {
          params: {
            page: currentPage,
            per_page: 6,
            chudebaiviet_id: topicId || undefined,
          },
        });

        if (cancelled) return;

        const pagination = response.data?.data;

        setPosts(
          Array.isArray(pagination?.data)
            ? pagination.data
            : []
        );

        setCurrentPage(pagination?.current_page || 1);
        setLastPage(pagination?.last_page || 1);
        setTotal(pagination?.total || 0);
      } catch (err) {
        if (cancelled) return;

        console.error("Lỗi tải danh sách bài viết:", err);
        setError("Không thể tải danh sách bài viết.");
        setPosts([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPosts();

    return () => {
      cancelled = true;
    };
  }, [currentPage, topicId]);

  // Lấy danh sách chủ đề
  useEffect(() => {
    let cancelled = false;

    async function fetchTopics() {
      try {
        const response = await api.get("/chu-de-bai-viet");

        if (cancelled) return;

        const data = response.data?.data;

        setTopics(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          console.error("Lỗi tải chủ đề bài viết:", err);
        }
      }
    }

    fetchTopics();

    return () => {
      cancelled = true;
    };
  }, []);

  // Chuyển trang
  function handlePageChange(page) {
    if (page < 1 || page > lastPage || page === currentPage) {
      return;
    }

    setCurrentPage(page);
  }

  return (
    <main className="shop-main posts-main">
      <h1 className="posts-title">Tin tức & Kiến thức công nghệ</h1>

      <p className="posts-description">
        Cập nhật tin tức, kiến thức và thông tin công nghệ mới nhất.
      </p>

      {/* Lọc theo chủ đề */}
      <div className="posts-filter">
        <label htmlFor="topic-filter">
          Lọc theo chủ đề:
        </label>

        <select
          id="topic-filter"
          value={topicId}
          onChange={(event) => {
            setCurrentPage(1);
            setTopicId(event.target.value);
          }}
        >
          <option value="">Tất cả chủ đề</option>

          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.ten}
            </option>
          ))}
        </select>
      </div>

      {!loading && !error && (
        <p className="posts-total">
          Tìm thấy {total} bài viết
        </p>
      )}

      {loading ? (
        <p>Đang tải bài viết...</p>
      ) : error ? (
        <p className="posts-message posts-error">{error}</p>
      ) : posts.length === 0 ? (
        <div className="posts-empty">
          <h2>Chưa có bài viết</h2>
          <p>
            Hiện tại chưa có bài viết nào được đăng trong mục này.
          </p>
        </div>
      ) : (
        <>
          <div className="posts-grid">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {lastPage > 1 && (
            <nav
              className="posts-pagination"
              aria-label="Phân trang bài viết"
            >
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trang trước
              </button>

              {Array.from(
                { length: lastPage },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  disabled={page === currentPage}
                  aria-current={
                    page === currentPage ? "page" : undefined
                  }
                  className={page === currentPage ? "active" : ""}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === lastPage}
              >
                Trang sau
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
