
import React from 'react';
import Link from 'next/link';

export default function PostTable({
  posts,
  loading,
  error,
  onDelete,
  deletingId,
}) {
  if (loading) {
    return (
      <div className="admin-post-table-message">
        Đang tải danh sách bài viết...
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-post-table-message admin-post-table-error">
        {error}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="admin-post-table-message">
        Chưa có bài viết nào.
      </div>
    );
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'hienthi':
        return 'Hiển thị';
      case 'bannhap':
        return 'Bản nháp';
      case 'an':
        return 'Đã ẩn';
      default:
        return status || 'Không xác định';
    }
  };

  return (
    <div className="admin-post-table-container">
      <table className="admin-post-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Hình ảnh</th>
            <th>Tiêu đề</th>
            <th>Chủ đề</th>
            <th>Tác giả</th>
            <th>Ngày đăng</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {posts.map((item) => {
            const imagePath = item.hinhanh;

            const imageUrl = imagePath
              ? imagePath.startsWith('http')
                ? imagePath
                : `http://localhost:8000/storage/${imagePath}`
              : '/placeholder.png';

            return (
              <tr key={item.id}>
                <td>#{item.id}</td>

                <td>
                  <img
                    src={imageUrl}
                    alt={item.tieude || 'Ảnh bài viết'}
                    className="admin-post-table-image"
                  />
                </td>

                <td>
                  <strong className="admin-post-table-title">
                    {item.tieude}
                  </strong>
                </td>

                <td>
                  {item.chu_de_bai_viet?.ten ||
                    item.chude?.ten ||
                    '-'}
                </td>

                <td>
                  {item.nguoi_dung?.hoten ||
                    item.nguoidung?.hoten ||
                    '-'}
                </td>

                <td>
                  {item.ngaydang
                    ? new Date(item.ngaydang).toLocaleDateString('vi-VN')
                    : '-'}
                </td>

                <td>
                  <span
                    className={`admin-post-table-status admin-post-table-status-${item.trangthai}`}
                  >
                    {getStatusLabel(item.trangthai)}
                  </span>
                </td>

                <td>
                  <div className="admin-post-table-actions">
                    <Link
                      href={`/admin/posts/edit/${item.id}`}
                      className="admin-post-table-edit"
                    >
                      Sửa
                    </Link>

                    <button
                      type="button"
                      className="admin-post-table-delete"
                      onClick={() =>
                        onDelete && onDelete(item.id, item.tieude)
                      }
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? 'Đang xóa...' : 'Xóa'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
