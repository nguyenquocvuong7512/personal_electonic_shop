/**
 * Chuyển đổi chuỗi tiếng Việt có dấu thành chuỗi Slug chuẩn SEO
 * Ví dụ: "Áo Thun Nam 100%" -> "ao-thun-nam-100"
 */
export const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Tách dấu ra khỏi ký tự
    .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu vừa tách
    .replace(/[đĐ]/g, 'd') // Chuyển đ -> d
    .replace(/([^0-9a-z-\s])/g, '') // Xóa toàn bộ ký tự đặc biệt
    .replace(/(\s+)/g, '-') // Thay khoảng trắng bằng dấu -
    .replace(/-+/g, '-') // Xóa các dấu - trùng lặp
    .replace(/^-+|-+$/g, ''); // Xóa dấu - ở đầu và cuối
};