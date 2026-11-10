/**
 * Tiện ích chuẩn hóa văn bản tiếng Việt cho Chatbot Rule-Based
 */

/**
 * Xóa dấu tiếng Việt (giữ nguyên chữ thường)
 */
export function removeVietnameseAccents(str = '') {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Chuẩn hóa chuỗi đầu vào: lowercase, trim, chuẩn hóa khoảng trắng thừa
 */
export function normalizeText(text = '') {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Kiểm tra xem chuỗi có chứa bất kỳ từ khóa nào trong danh sách không
 * Hỗ trợ cả kiểm tra có dấu lẫn không dấu
 */
export function containsAny(text = '', keywords = []) {
  if (!text || !keywords || keywords.length === 0) return false;
  const raw = normalizeText(text);
  const unsigned = removeVietnameseAccents(raw);

  for (const kw of keywords) {
    const kwRaw = normalizeText(kw);
    const kwUnsigned = removeVietnameseAccents(kwRaw);

    if (raw.includes(kwRaw) || unsigned.includes(kwUnsigned)) {
      return true;
    }
  }
  return false;
}

/**
 * Kiểm tra regex trên cả chuỗi gốc và chuỗi không dấu
 */
export function matchRegex(text = '', regex) {
  if (!text || !regex) return false;
  const raw = normalizeText(text);
  const unsigned = removeVietnameseAccents(raw);
  return regex.test(raw) || regex.test(unsigned);
}

