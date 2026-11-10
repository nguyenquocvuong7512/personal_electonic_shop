import { normalizeText, removeVietnameseAccents } from './textNormalizer.js';

// Từ điển thương hiệu phổ biến trong ngành điện tử & alias
export const BRAND_DICTIONARY = [
  { name: 'Apple', keywords: ['apple', 'iphone', 'ipad', 'macbook', 'mac', 'airpods', 'apple watch', 'ios'] },
  { name: 'Samsung', keywords: ['samsung', 'galaxy', 'z fold', 'z flip'] },
  { name: 'Asus', keywords: ['asus', 'rog', 'tuf', 'zenbook', 'vivobook'] },
  { name: 'Dell', keywords: ['dell', 'inspiron', 'xps', 'vostro', 'alienware', 'latitude'] },
  { name: 'HP', keywords: ['hp', 'pavilion', 'envy', 'omen', 'victus', 'probook'] },
  { name: 'Lenovo', keywords: ['lenovo', 'thinkpad', 'legion', 'ideapad', 'yoga'] },
  { name: 'Acer', keywords: ['acer', 'nitro', 'predator', 'aspire', 'swift'] },
  { name: 'Xiaomi', keywords: ['xiaomi', 'redmi', 'poco', 'mi'] },
  { name: 'Oppo', keywords: ['oppo', 'reno', 'find'] },
  { name: 'Sony', keywords: ['sony', 'playstation', 'ps5', 'bravia', 'wh-1000xm'] },
  { name: 'Logitech', keywords: ['logitech', 'g pro', 'mx master'] },
  { name: 'MSI', keywords: ['msi', 'katana', 'cyborg'] },
];

// Từ điển danh mục thiết bị điện tử
export const CATEGORY_DICTIONARY = [
  { name: 'Điện thoại', keywords: ['dien thoai', 'smartphone', 'phone', 'mobile', 'iphone', 'dế'] },
  { name: 'Laptop', keywords: ['laptop', 'may tinh xach tay', 'notebook', 'macbook'] },
  { name: 'Máy tính bảng', keywords: ['may tinh bang', 'tablet', 'ipad'] },
  { name: 'Tai nghe', keywords: ['tai nghe', 'headphone', 'earphone', 'airpods', 'headset'] },
  { name: 'Bàn phím', keywords: ['ban phim', 'keyboard', 'ban phim co'] },
  { name: 'Chuột', keywords: ['chuot', 'mouse'] },
  { name: 'Màn hình', keywords: ['man hinh', 'monitor', 'display'] },
  { name: 'Loa', keywords: ['loa', 'speaker', 'soundbar'] },
  { name: 'Phụ kiện', keywords: ['phu kien', 'sac', 'cap', 'op lung', 'pin du phong', 'hub'] },
  { name: 'Đồng hồ', keywords: ['dong ho', 'smartwatch', 'apple watch'] },
];

// Từ điển nhu cầu sử dụng
export const PURPOSE_DICTIONARY = [
  {
    type: 'study_office',
    label: 'Học tập & Văn phòng',
    keywords: ['hoc tap', 'sinh vien', 'van phong', 'hoc online', 'word', 'excel', 'nhe nhang', 'hoc sinh', 'ke toan'],
    suggestBudget: { min: 7000000, max: 18000000 },
  },
  {
    type: 'gaming',
    label: 'Chơi game (Gaming)',
    keywords: ['choi game', 'gaming', 'game', 'chien game', 'fo4', 'lol', 'lien minh', 'genshin', 'valorant', 'csgo', 'steam'],
    suggestBudget: { min: 15000000, max: 50000000 },
  },
  {
    type: 'graphics_editing',
    label: 'Đồ họa & Dựng phim',
    keywords: ['do hoa', 'thiet ke', 'photoshop', 'illustrator', 'premiere', 'render', 'dung video', 'edit video', '3d', 'autocad'],
    suggestBudget: { min: 18000000, max: 60000000 },
  },
  {
    type: 'camera_photo',
    label: 'Chụp ảnh & Quay video đẹp',
    keywords: ['chup anh', 'chup hinh', 'camera dep', 'quay phim', 'song ao', 'selfie'],
  },
  {
    type: 'battery',
    label: 'Pin trâu & Sử dụng lâu',
    keywords: ['pin trau', 'pin khoe', 'dung lau', 'pin khung', 'pin tot'],
  },
  {
    type: 'portable_slim',
    label: 'Mỏng nhẹ & Dễ di chuyển',
    keywords: ['mong nhe', 'gon nhe', 'mang di lam', 'tien loi', 'nhe nhang'],
  },
  {
    type: 'cheap',
    label: 'Giá rẻ & Tiết kiệm',
    keywords: ['gia re', 're nhat', 'tiet kiem', 'bình dan', 're'],
  },
];

/**
 * Trích xuất mức giá (VND) từ chuỗi văn bản
 * Hỗ trợ các định dạng:
 * - "dưới 5 triệu", "dưới 5tr", "dưới 5 củ", "dưới 500k", "< 10 triệu"
 * - "trên 15 triệu", "> 15tr", "từ 15 triệu trở lên"
 * - "từ 2 đến 5 triệu", "từ 2tr - 5tr", "2 đến 5 triệu", "2-5tr"
 * - "tầm 10 triệu", "khoảng 10tr"
 */
export function extractPriceRange(text = '') {
  if (!text) return null;
  const raw = normalizeText(text);
  const unsigned = removeVietnameseAccents(raw);

  // Helper chuyển đổi chuỗi số + đơn vị sang số VND
  const parseAmount = (numStr, unitStr = '') => {
    let num = parseFloat(numStr.replace(',', '.'));
    if (isNaN(num)) return null;

    const unit = removeVietnameseAccents(unitStr.toLowerCase().trim());
    if (unit.includes('trieu') || unit === 'tr' || unit === 'm' || unit === 'cu') {
      return num * 1000000;
    } else if (unit === 'k' || unit.includes('ngan') || unit.includes('nghin')) {
      return num * 1000;
    } else if (num < 100) {
      // Mặc định số nhỏ như 5, 10, 15 thường là triệu trong ngữ cảnh điện tử
      return num * 1000000;
    } else if (num < 10000) {
      return num * 1000;
    }
    return num;
  };

  // 1. Dạng khoảng: "từ 2 đến 5 triệu", "2 - 5 triệu", "2 đến 5tr", "từ 2tr đến 5tr"
  const rangeRegex = /(?:tu\s+)?(\d+(?:[.,]\d+)?)\s*(?:tr|trieu|cu|k|ngan|nghin)?\s*(?:den|-|toi|\.\.)\s*(\d+(?:[.,]\d+)?)\s*(tr|trieu|cu|k|ngan|nghin|m)?/i;
  const rangeMatch = unsigned.match(rangeRegex);
  if (rangeMatch) {
    const unit = rangeMatch[3] || 'trieu';
    const min = parseAmount(rangeMatch[1], unit);
    const max = parseAmount(rangeMatch[2], unit);
    if (min !== null && max !== null) {
      return { min_price: Math.min(min, max), max_price: Math.max(min, max) };
    }
  }

  // 2. Dạng dưới/nhỏ hơn: "dưới 5 triệu", "< 5tr", "thấp hơn 10 củ", "không quá 15 triệu"
  const underRegex = /(?:duoi|<|thap hon|nho hon|tam duoi|khong qua|it hon)\s*(\d+(?:[.,]\d+)?)\s*(tr|trieu|cu|k|ngan|nghin|m)?/i;
  const underMatch = unsigned.match(underRegex);
  if (underMatch) {
    const max = parseAmount(underMatch[1], underMatch[2] || 'trieu');
    if (max !== null) {
      return { min_price: 0, max_price: max };
    }
  }

  // 3. Dạng trên/lớn hơn: "trên 10 triệu", "> 10tr", "cao hơn 5 củ", "từ 10 triệu trở lên"
  const overRegex = /(?:tren|>|cao hon|lon hon|tu)\s*(\d+(?:[.,]\d+)?)\s*(tr|trieu|cu|k|ngan|nghin|m)?(?:\s*tro len)?/i;
  const overMatch = unsigned.match(overRegex);
  if (overMatch) {
    const min = parseAmount(overMatch[1], overMatch[2] || 'trieu');
    if (min !== null) {
      return { min_price: min, max_price: null };
    }
  }

  // 4. Dạng khoảng/tầm xấp xỉ: "tầm 15 triệu", "khoảng 10tr", "ngân sách 20 triệu"
  const approxRegex = /(?:tam|khoang|xap xi|ngan sach|co|gia)\s*(\d+(?:[.,]\d+)?)\s*(tr|trieu|cu|k|ngan|nghin|m)?/i;
  const approxMatch = unsigned.match(approxRegex);
  if (approxMatch) {
    const center = parseAmount(approxMatch[1], approxMatch[2] || 'trieu');
    if (center !== null) {
      return {
        min_price: Math.max(0, Math.round(center * 0.8)),
        max_price: Math.round(center * 1.2),
      };
    }
  }

  return null;
}

/**
 * Trích xuất thương hiệu được nhắc đến
 */
export function extractBrand(text = '', knownBrands = []) {
  if (!text) return null;
  const unsigned = removeVietnameseAccents(text.toLowerCase());

  // Ưu tiên kiểm tra danh sách thương hiệu từ database nếu có truyền vào
  if (knownBrands && knownBrands.length > 0) {
    for (const b of knownBrands) {
      const bUnsigned = removeVietnameseAccents((b.ten || b.name || '').toLowerCase());
      if (bUnsigned && unsigned.includes(bUnsigned)) {
        return { id: b.id, name: b.ten || b.name };
      }
    }
  }

  // Kiểm tra qua từ điển mẫu
  for (const item of BRAND_DICTIONARY) {
    for (const kw of item.keywords) {
      const kwUnsigned = removeVietnameseAccents(kw);
      const regex = new RegExp(`\\b${kwUnsigned}\\b`, 'i');
      if (regex.test(unsigned)) {
        return { name: item.name };
      }
    }
  }

  return null;
}

/**
 * Trích xuất danh mục sản phẩm
 */
export function extractCategory(text = '', knownCategories = []) {
  if (!text) return null;
  const unsigned = removeVietnameseAccents(text.toLowerCase());

  // Kiểm tra danh mục từ database nếu có
  if (knownCategories && knownCategories.length > 0) {
    for (const c of knownCategories) {
      const cUnsigned = removeVietnameseAccents((c.ten || c.name || '').toLowerCase());
      if (cUnsigned && unsigned.includes(cUnsigned)) {
        return { id: c.id, name: c.ten || c.name };
      }
    }
  }

  for (const item of CATEGORY_DICTIONARY) {
    for (const kw of item.keywords) {
      const kwUnsigned = removeVietnameseAccents(kw);
      const regex = new RegExp(`\\b${kwUnsigned}\\b`, 'i');
      if (regex.test(unsigned)) {
        return { name: item.name };
      }
    }
  }

  return null;
}

/**
 * Trích xuất nhu cầu sử dụng
 */
export function extractPurpose(text = '') {
  if (!text) return null;
  const unsigned = removeVietnameseAccents(text.toLowerCase());

  for (const item of PURPOSE_DICTIONARY) {
    for (const kw of item.keywords) {
      if (unsigned.includes(kw)) {
        return item;
      }
    }
  }
  return null;
}

/**
 * Trích xuất mã đơn hàng: dạng #DH123, DH123, #1234 hoặc sau từ 'mã đơn'
 */
export function extractOrderCode(text = '') {
  if (!text) return null;
  const raw = text.trim();

  // 1. Dạng có tiền tố mã đơn rõ ràng: #DH123, DH12345, ORD123, #123456
  const prefixMatch = raw.match(/(?:#DH|DH|ORD|#)\s*([0-9]{1,10})/i);
  if (prefixMatch) {
    return prefixMatch[1];
  }

  // 2. Dạng đứng sau từ khóa: "mã đơn 12", "đơn hàng số 15"
  const keywordMatch = raw.match(/(?:ma don hang|mã đơn hàng|ma don|mã đơn|don hang so|đơn hàng số|don so|đơn số)\s*[:=]?\s*([0-9]{1,10})/i);
  if (keywordMatch) {
    return keywordMatch[1];
  }

  return null;
}

/**
 * Trích xuất 2 sản phẩm cần so sánh từ các cấu trúc như:
 * - "so sánh iPhone 15 và Samsung S24"
 * - "so sánh giữa tai nghe sony với tai nghe airpods"
 * - "iPhone 15 hay iPhone 14 tốt hơn"
 */
export function extractComparisonTargets(text = '') {
  if (!text) return null;
  const raw = text.trim();

  // Pattern 1: "so sánh [A] và / với [B]"
  const pattern1 = /(?:so sanh|so sánh)(?:\s+giua|\s+giữa)?\s+(.+?)\s+(?:va|và|voi|với|cung|cùng)\s+(.+)/i;
  const m1 = raw.match(pattern1);
  if (m1) {
    return [m1[1].trim(), m1[2].trim()];
  }

  // Pattern 2: "[A] hay [B] (tốt hơn / nên mua cái nào)"
  const pattern2 = /(.+?)\s+hay\s+(.+?)(?:\s+tot hon|\s+tốt hơn|\s+nen mua|\s+nên mua|$)/i;
  const m2 = raw.match(pattern2);
  if (m2) {
    const left = m2[1].replace(/^(so sanh|so sánh|cho minh hoi|cho mình hỏi)\s*/i, '').trim();
    return [left, m2[2].trim()];
  }

  return null;
}

/**
 * Trích xuất mã khuyến mãi (thường là từ in hoa hoặc sau từ 'mã')
 */
export function extractCouponCode(text = '') {
  if (!text) return null;
  const match = text.match(/(?:ma|mã|code|voucher)\s*[:=]?\s*([A-Za-z0-9_-]{3,15})/i);
  if (match) {
    return match[1].toUpperCase();
  }
  return null;
}

