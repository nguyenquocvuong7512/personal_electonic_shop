import { normalizeText, removeVietnameseAccents, containsAny } from './textNormalizer.js';
import {
  extractPriceRange,
  extractBrand,
  extractCategory,
  extractPurpose,
  extractComparisonTargets,
  extractOrderCode,
  extractCouponCode,
} from './entityExtractor.js';

export const INTENTS = {
  GREETING: 'GREETING',
  THANKS: 'THANKS',
  GOODBYE: 'GOODBYE',
  BOT_IDENTITY: 'BOT_IDENTITY',
  BOT_CAPABILITIES: 'BOT_CAPABILITIES',
  STORE_POLICY: 'STORE_POLICY',
  PROMOTION_QUERY: 'PROMOTION_QUERY',
  CHECK_STOCK: 'CHECK_STOCK',
  COMPARE: 'COMPARE',
  ORDER_LOOKUP: 'ORDER_LOOKUP',
  CONSULT_PRODUCT: 'CONSULT_PRODUCT',
  SEARCH_PRODUCT: 'SEARCH_PRODUCT',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Phân loại ý định từ nội dung tin nhắn và ngữ cảnh hiện tại
 */
export function classifyIntent(text = '', _context = {}, metadata = {}) {
  const raw = normalizeText(text);
  const unsigned = removeVietnameseAccents(raw);

  // 1. Trích xuất các thực thể trước để hỗ trợ nhận diện ngữ nghĩa chính xác
  const priceRange = extractPriceRange(text);
  const brand = extractBrand(text, metadata.brands);
  const category = extractCategory(text, metadata.categories);
  const purpose = extractPurpose(text);
  const comparisonTargets = extractComparisonTargets(text);
  const orderCode = extractOrderCode(text);
  const couponCode = extractCouponCode(text);

  const entities = {
    priceRange,
    brand,
    category,
    purpose,
    comparisonTargets,
    orderCode,
    couponCode,
    rawText: text,
  };

  // 2. Kiểm tra nếu có yêu cầu SO SÁNH sản phẩm
  if (
    comparisonTargets ||
    containsAny(unsigned, ['so sanh', 'sanh giua', 'hay hon', 'nen chon cai nao', 'tot hon'])
  ) {
    return {
      intent: INTENTS.COMPARE,
      confidence: 0.95,
      entities,
    };
  }

  // 3. Kiểm tra nếu có yêu cầu TRA CỨU ĐƠN HÀNG
  if (
    orderCode ||
    containsAny(unsigned, [
      'don hang',
      'tra cuu don',
      'kiem tra don',
      'tinh trang don',
      'don hang cua toi',
      'hang cua toi den dau',
      'ma don',
      'xem don hang',
      'lich su don',
    ])
  ) {
    return {
      intent: INTENTS.ORDER_LOOKUP,
      confidence: 0.9,
      entities,
    };
  }

  // 4. Kiểm tra KIỂM TRA TỒN KHO / CÒN HÀNG
  if (
    containsAny(unsigned, [
      'con hang khong',
      'con hang k',
      'het hang chua',
      'ton kho',
      'con may cai',
      'kiem tra ton kho',
      'san pham nay con khong',
      'shop con hang khong',
      'con hang k shop',
    ])
  ) {
    return {
      intent: INTENTS.CHECK_STOCK,
      confidence: 0.9,
      entities,
    };
  }

  // 5. Kiểm tra MÃ GIẢM GIÁ / KHUYẾN MÃI
  if (
    couponCode ||
    containsAny(unsigned, [
      'ma giam gia',
      'khuyen mai',
      'voucher',
      'coupon',
      'giam gia',
      'uu dai',
      'sale',
      'co giam gia khong',
      'co ma giam khong',
      'chiet khau',
    ])
  ) {
    return {
      intent: INTENTS.PROMOTION_QUERY,
      confidence: 0.9,
      entities,
    };
  }

  // 6. Kiểm tra CHÍNH SÁCH CỬA HÀNG
  if (
    containsAny(unsigned, [
      'chinh sach',
      'giao hang',
      'van chuyen',
      'phi ship',
      'bao hanh',
      'doi tra',
      'thanh toan',
      'dia chi shop',
      'hotline',
      'so dien thoai',
      'cua hang o dau',
      'phuong thuc thanh toan',
      'thoi gian giao hang',
      'ship cod',
      'co duoc kiem tra hang khong',
      'dong kiem',
    ])
  ) {
    let policyType = 'general';
    if (containsAny(unsigned, ['giao hang', 'van chuyen', 'phi ship', 'thoi gian giao', 'dong kiem'])) {
      policyType = 'shipping';
    } else if (containsAny(unsigned, ['doi tra', 'doi moi', 'tra hang', 'hoan tien'])) {
      policyType = 'return';
    } else if (containsAny(unsigned, ['bao hanh', 'sua chua', 'bao hanh dien tu'])) {
      policyType = 'warranty';
    } else if (containsAny(unsigned, ['thanh toan', 'cod', 'chuyen khoan', 'vnpay'])) {
      policyType = 'payment';
    } else if (containsAny(unsigned, ['hotline', 'dia chi', 'lien he', 'showroom', 'o dau'])) {
      policyType = 'contact';
    }

    return {
      intent: INTENTS.STORE_POLICY,
      confidence: 0.9,
      policyType,
      entities,
    };
  }

  // 7. Kiểm tra TƯ VẤN SẢN PHẨM theo nhu cầu sử dụng
  if (
    purpose ||
    containsAny(unsigned, [
      'tu van',
      'tu van giup',
      'nen mua',
      'can mua',
      'muon mua',
      'goi y',
      'de hoc tap',
      'de lam viec',
      'cho sinh vien',
      'choi game',
      'do hoa',
      'chup anh dep',
      'pin trau',
    ])
  ) {
    return {
      intent: INTENTS.CONSULT_PRODUCT,
      confidence: 0.85,
      entities,
    };
  }

  // 8. Kiểm tra TÌM KIẾM SẢN PHẨM (theo thương hiệu, danh mục, khoảng giá, hoặc từ khóa tìm kiếm)
  if (
    priceRange ||
    brand ||
    category ||
    containsAny(unsigned, [
      'tim san pham',
      'tim kiem',
      'co san pham nao',
      'co dien thoai nao',
      'co laptop nao',
      'muon tim',
      'xem san pham',
      'san pham nao duoi',
      'gia tu',
      'muc gia',
    ])
  ) {
    return {
      intent: INTENTS.SEARCH_PRODUCT,
      confidence: 0.85,
      entities,
    };
  }

  // 9. Kiểm tra HỘI THOẠI CƠ BẢN
  // 9.1. Giới thiệu bản thân: Bạn là ai?
  if (
    containsAny(unsigned, [
      'ban la ai',
      'may la ai',
      'bot la gi',
      'ten ban la gi',
      'gioi thieu ve ban',
      'who are you',
    ])
  ) {
    return { intent: INTENTS.BOT_IDENTITY, confidence: 0.95, entities };
  }

  // 9.2. Hướng dẫn / Khả năng: Bạn có thể giúp gì?
  if (
    containsAny(unsigned, [
      'ban giup duoc gi',
      'ban lam duoc gi',
      'co the giup gi',
      'huong dan',
      'chuc nang',
      'tro giup',
      'help',
      'lam duoc gi',
    ])
  ) {
    return { intent: INTENTS.BOT_CAPABILITIES, confidence: 0.95, entities };
  }

  // 9.3. Lời chào
  if (
    containsAny(unsigned, [
      'xin chao',
      'chao ban',
      'chao shop',
      'hi',
      'hello',
      'alo',
      'hi bot',
      'chao e',
      'chao em',
      'ad oi',
      'shop oi',
    ])
  ) {
    return { intent: INTENTS.GREETING, confidence: 0.9, entities };
  }

  // 9.4. Cảm ơn
  if (
    containsAny(unsigned, [
      'cam on',
      'cam on shop',
      'thank',
      'thanks',
      'tks',
      'da cam on',
    ])
  ) {
    return { intent: INTENTS.THANKS, confidence: 0.95, entities };
  }

  // 9.5. Tạm biệt
  if (
    containsAny(unsigned, [
      'tam biet',
      'bye',
      'goodbye',
      'hen gap lai',
      'chao tam biet',
    ])
  ) {
    return { intent: INTENTS.GOODBYE, confidence: 0.95, entities };
  }

  // 10. Fallback tìm kiếm: Nếu người dùng nhập tên sản phẩm ngắn (ví dụ: "iPhone 15", "chuột logitech", "macbook air")
  // Chỉ nhận diện khi có chứa thực thể (brand, category) hoặc từ khóa công nghệ cơ bản
  const techKeywords = [
    'may', 'dien thoai', 'laptop', 'chuot', 'ban phim', 'tai nghe', 'loa',
    'man hinh', 'ram', 'ssd', 'sac', 'cap', 'hub', 'case', 'gear', 'sound',
    'pro', 'max', 'plus', 'ultra', 'gaming', 'pc', 'tablet', 'pad', 'watch',
    'airpods', 'buds', 'macbook', 'rog', 'tuf', 'thinkpad', 'legion', 'galaxy',
  ];

  if (raw.length >= 2 && raw.split(' ').length <= 6) {
    const hasTechKw = techKeywords.some((k) => unsigned.includes(k));
    if (brand || category || hasTechKw) {
      return {
        intent: INTENTS.SEARCH_PRODUCT,
        confidence: 0.75,
        entities: {
          ...entities,
          keywordFallback: raw,
        },
      };
    }
  }

  // Mặc định: Không hiểu hoặc ngoài kịch bản
  return {
    intent: INTENTS.UNKNOWN,
    confidence: 0.2,
    entities,
  };
}

