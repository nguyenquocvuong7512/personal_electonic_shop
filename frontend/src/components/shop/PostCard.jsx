
import Link from "next/link";

export default function PostCard({ post }) {
  if (!post) return null;

  // Xử lý đường dẫn hình ảnh bài viết
  const imagePath = post.hinhanh;

  const imageUrl = imagePath
    ? imagePath.startsWith("http")
      ? imagePath
      : `http://localhost:8000/storage/${imagePath}`
    : "/placeholder.svg";

  // Định dạng ngày đăng
  const formattedDate = post.ngaydang
    ? new Date(post.ngaydang).toLocaleDateString("vi-VN")
    : "";

  // Tạo nội dung giới thiệu ngắn từ nội dung bài viết
  const excerpt = (post.noidung || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim()
    .slice(0, 180);

  return (
    <article className="post-card">
      <Link
        href={`/posts/${post.slug}`}
        className="post-card-image-link"
      >
        <img
          src={imageUrl}
          alt={post.tieude || "Bài viết"}
          className="post-card-image"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/placeholder.svg";
          }}
        />
      </Link>

      <div className="post-card-content">
        <div className="post-card-meta">
          {post.chudebaiviet?.ten && (
            <span className="post-card-topic">
              {post.chudebaiviet.ten}
            </span>
          )}

          {formattedDate && (
            <span className="post-card-date">
              {formattedDate}
            </span>
          )}
        </div>

        <h2 className="post-card-title">
          <Link href={`/posts/${post.slug}`}>
            {post.tieude}
          </Link>
        </h2>

        <p className="post-card-excerpt">
          {excerpt}
          {post.noidung && post.noidung.length > 180 ? "..." : ""}
        </p>

        <Link
          href={`/posts/${post.slug}`}
          className="post-card-read-more"
        >
          Đọc tiếp →
        </Link>
      </div>
    </article>
  );
}
