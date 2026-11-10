import React from 'react';
import Link from 'next/link';

export default function ProductTable({ products, loading, error, onDelete, deletingId }) {
  if (loading) return <div className="admin-status-message">Đang tải danh sách...</div>;
  if (error) return <div className="admin-status-message error">{error}</div>;
  if (!products || products.length === 0) return <div className="admin-status-message">Chưa có sản phẩm nào.</div>;

  return (
    <div className="admin-table-container">
      <table className="admin-product-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Hình ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Giá bán</th>
            <th>Giá KM</th>
            <th>Tồn kho</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map((item) => {
            // Lấy đường dẫn ảnh từ cột sanpham_hinhanh (hoặc hinhanh làm fallback)
            const imagePath = item.sanpham_hinhanh || item.hinhanh;
            
            // Xử lý tạo URL hoàn chỉnh cho ảnh
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
                    alt={item.ten}
                    className="admin-product-img"
                  />
                </td>
                <td><strong>{item.ten}</strong></td>
                <td>{Number(item.gia || 0).toLocaleString('vi-VN')} đ</td>
                <td>
                  {item.giakhuyenmai ? `${Number(item.giakhuyenmai).toLocaleString('vi-VN')} đ` : '-'}
                </td>
                <td>{item.soluong}</td>
                <td>
                  <span className={`status-badge ${item.trangthai}`}>
                    {item.trangthai === 'hienthi' ? 'Hiển thị' : 'Ẩn'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <Link href={`/admin/products/edit/${item.id}`} className="btn-edit">
                      Sửa
                    </Link>
                    <button
                      className="btn-delete"
                      onClick={() => onDelete && onDelete(item.id, item.ten)}
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