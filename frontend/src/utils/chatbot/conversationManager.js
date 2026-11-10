import { chatbotService } from '../../services/chatbotService';
import { authService } from '../../services/authService';
import { classifyIntent, INTENTS } from './intentClassifier.js';

// Định dạng tiền tệ VND
export function formatVND(amount) {
  if (amount === undefined || amount === null) return '0 đ';
  return Number(amount).toLocaleString('vi-VN') + ' đ';
}

/**
 * Trình quản lý hội thoại và điều phối xử lý nghiệp vụ Rule-Based
 */
export class ConversationManager {
  constructor() {
    this.context = {
      history: [],
      lastIntent: null,
      waitingFor: null,
      savedEntities: {},
    };
    this.metadata = {
      categories: [],
      brands: [],
      isLoaded: false,
    };
  }

  // Tải trước danh mục & thương hiệu để hỗ trợ nhận diện entity chính xác
  async initMetadata() {
    if (this.metadata.isLoaded) return;
    try {
      const { categories, brands } = await chatbotService.getMetadata();
      this.metadata.categories = categories;
      this.metadata.brands = brands;
      this.metadata.isLoaded = true;
    } catch (e) {
      console.warn('Lỗi khởi tạo metadata chatbot:', e);
    }
  }

  // Làm mới trạng thái hội thoại
  resetContext() {
    this.context = {
      history: [],
      lastIntent: null,
      waitingFor: null,
      savedEntities: {},
    };
  }

  /**
   * Xử lý tin nhắn của người dùng và trả về phản hồi của bot
   */
  async processMessage(userMessage = '') {
    await this.initMetadata();

    const trimmed = userMessage.trim();
    if (!trimmed) {
      return {
        type: 'bot',
        text: 'Dạ, bạn có thể nhập câu hỏi để em hỗ trợ bạn nhé!',
        timestamp: new Date(),
      };
    }

    // 1. Kiểm tra xử lý ngữ cảnh câu hỏi nối tiếp (Follow-up Context)
    let processedIntent = null;
    let entities = {};

    if (this.context.waitingFor === 'BUDGET_INPUT') {
      // Người dùng vừa trả lời mức giá tiếp theo cho câu tư vấn trước đó
      const classified = classifyIntent(trimmed, this.context, this.metadata);
      if (classified.entities.priceRange) {
        processedIntent = INTENTS.CONSULT_PRODUCT;
        entities = {
          ...this.context.savedEntities,
          priceRange: classified.entities.priceRange,
        };
      }
    } else if (this.context.waitingFor === 'STOCK_TARGET') {
      // Người dùng vừa nhập tên sản phẩm cần kiểm tra tồn kho
      processedIntent = INTENTS.CHECK_STOCK;
      entities = { rawText: trimmed };
    } else if (this.context.waitingFor === 'ORDER_CODE') {
      // Người dùng vừa nhập mã đơn hàng
      processedIntent = INTENTS.ORDER_LOOKUP;
      entities = { orderCode: trimmed.replace(/[^0-9]/g, '') || trimmed };
    }

    // 2. Nếu không có follow-up phù hợp, phân loại ý định độc lập
    if (!processedIntent) {
      const classified = classifyIntent(trimmed, this.context, this.metadata);
      processedIntent = classified.intent;
      entities = classified.entities;
    }

    // Lưu vào lịch sử
    this.context.history.push({ role: 'user', message: trimmed, intent: processedIntent });

    // 3. Điều phối xử lý theo từng Intent
    let response;
    switch (processedIntent) {
      case INTENTS.GREETING:
        response = this.handleGreeting();
        break;

      case INTENTS.THANKS:
        response = this.handleThanks();
        break;

      case INTENTS.GOODBYE:
        response = this.handleGoodbye();
        break;

      case INTENTS.BOT_IDENTITY:
        response = this.handleBotIdentity();
        break;

      case INTENTS.BOT_CAPABILITIES:
        response = this.handleBotCapabilities();
        break;

      case INTENTS.STORE_POLICY:
        response = await this.handleStorePolicy(entities);
        break;

      case INTENTS.PROMOTION_QUERY:
        response = await this.handlePromotions(entities);
        break;

      case INTENTS.CHECK_STOCK:
        response = await this.handleCheckStock(entities);
        break;

      case INTENTS.COMPARE:
        response = await this.handleCompare(entities);
        break;

      case INTENTS.ORDER_LOOKUP:
        response = await this.handleOrderLookup(entities);
        break;

      case INTENTS.CONSULT_PRODUCT:
        response = await this.handleConsult(entities);
        break;

      case INTENTS.SEARCH_PRODUCT:
        response = await this.handleSearchProduct(entities);
        break;

      case INTENTS.UNKNOWN:
      default:
        response = this.handleFallback(trimmed);
        break;
    }

    // Cập nhật trạng thái ngữ cảnh sau khi xử lý
    this.context.lastIntent = processedIntent;
    response.timestamp = new Date();
    return response;
  }

  /* ==================== CÁC HÀM XỬ LÝ Ý ĐỊNH ==================== */

  // 1. Xin chào
  handleGreeting() {
    this.context.waitingFor = null;
    return {
      type: 'bot',
      text: `Xin chào quý khách! 👋 Em là **Trợ lý ảo tư vấn bán hàng** của cửa hàng.\n\nEm có thể hỗ trợ quý khách tìm kiếm sản phẩm, tư vấn cấu hình, kiểm tra giá & tồn kho, tra cứu mã giảm giá hoặc hỗ trợ kiểm tra đơn hàng. Quý khách đang quan tâm đến sản phẩm nào ạ?`,
      quickReplies: [
        'Tìm điện thoại Samsung',
        'Laptop học tập dưới 15 triệu',
        'Sản phẩm đang giảm giá',
        'Có mã giảm giá nào không?',
        'Chính sách bảo hành & đổi trả',
      ],
    };
  }

  // 2. Cảm ơn
  handleThanks() {
    this.context.waitingFor = null;
    return {
      type: 'bot',
      text: `Dạ không có chi ạ! Rất vui được hỗ trợ quý khách. Chúc quý khách có trải nghiệm mua sắm thật vui vẻ tại cửa hàng! ❤️\n\nNếu cần thêm thông tin gì, quý khách cứ nhắn cho em nhé.`,
      quickReplies: ['Xem sản phẩm mới', 'Mã giảm giá hôm nay', 'Chính sách giao hàng'],
    };
  }

  // 3. Tạm biệt
  handleGoodbye() {
    this.context.waitingFor = null;
    return {
      type: 'bot',
      text: `Tạm biệt quý khách! Hẹn gặp lại quý khách trong những lần mua sắm tiếp theo. Chúc quý khách một ngày thật nhiều niềm vui! ✨`,
      quickReplies: ['Tìm sản phẩm', 'Khuyến mãi đang có'],
    };
  }

  // 4. Bạn là ai?
  handleBotIdentity() {
    this.context.waitingFor = null;
    return {
      type: 'bot',
      text: `Dạ em là **Trợ lý bán hàng thông minh** của website bán hàng công nghệ! 🤖\n\nEm hoạt động 24/7 để đồng hành cùng quý khách:\n- 🔍 Tìm kiếm sản phẩm theo tên, khoảng giá, thương hiệu\n- 💡 Tư vấn thiết bị công nghệ chuẩn theo nhu cầu và ngân sách\n- ⚖️ So sánh chi tiết các mẫu sản phẩm trên hệ thống\n- 📦 Kiểm tra tình trạng còn hàng và số lượng tồn kho thực tế\n- 🎟️ Cung cấp mã giảm giá & ưu đãi mới nhất\n- 🚚 Hướng dẫn chính sách bảo hành, đổi trả, giao hàng`,
      quickReplies: ['Bạn có thể giúp gì?', 'Tư vấn chọn laptop', 'Mã giảm giá', 'Tra cứu đơn hàng'],
    };
  }

  // 5. Bạn có thể giúp gì?
  handleBotCapabilities() {
    this.context.waitingFor = null;
    return {
      type: 'bot',
      text: `Dạ em có thể hỗ trợ quý khách các tác vụ sau hoàn toàn nhanh chóng:\n\n1. **Tìm kiếm sản phẩm:** Ví dụ *"Tìm iPhone dưới 20 triệu"*, *"Có laptop Asus nào không"*.\n2. **Tư vấn theo nhu cầu:** Ví dụ *"Cần laptop học tập văn phòng dưới 15tr"*, *"Điện thoại pin trâu giá rẻ"*.\n3. **So sánh sản phẩm:** Ví dụ *"So sánh iPhone 15 và iPhone 14"*.\n4. **Kiểm tra tồn kho:** Ví dụ *"Tai nghe Sony còn hàng không?"*.\n5. **Khuyến mãi & Voucher:** Ví dụ *"Hôm nay có mã giảm giá nào?"*.\n6. **Chính sách cửa hàng:** Ví dụ *"Chính sách đổi trả trong bao lâu?"*, *"Phí ship bao nhiêu?"*.\n7. **Tra cứu đơn hàng:** Tra cứu tình trạng và lịch sử đơn hàng của tài khoản quý khách.`,
      quickReplies: [
        'Tư vấn laptop văn phòng',
        'Điện thoại dưới 10 triệu',
        'Mã giảm giá hot',
        'Kiểm tra đơn hàng của tôi',
      ],
    };
  }

  // 6. Chính sách cửa hàng
  async handleStorePolicy(entities = {}) {
    this.context.waitingFor = null;
    const policies = await chatbotService.getPolicies();
    const policyType = entities.policyType || 'general';

    // Dữ liệu fallback chuẩn đồng bộ Footer nếu backend tạm thời không phản hồi
    const p = policies || {
      store_info: { hotline: '1800 6868', address: '123 Đường Công Nghệ, Q.1, TP. HCM', email: 'lienhe@websitebanhang.vn' },
      shipping: {
        title: 'Chính sách Giao Hàng & Vận Chuyển',
        standard_fee: '30.000 đ toàn quốc',
        free_shipping_threshold: 'Miễn phí giao hàng cho đơn hàng từ 500.000 đ trở lên',
        delivery_time: 'Nội thành TP.HCM: 1 - 2 ngày; Tỉnh thành khác: 2 - 4 ngày làm việc',
        inspection: 'Khách hàng ĐƯỢC PHÉP đồng kiểm ngoại quan cùng bưu tá trước khi nhận',
      },
      return_policy: {
        title: 'Chính sách Đổi Trả Sản Phẩm',
        period: 'Đổi mới miễn phí trong 7 ngày đầu tiên nếu phát sinh lỗi kỹ thuật do NSX',
        conditions: ['Còn nguyên tem niêm phong, hộp và đầy đủ phụ kiện', 'Có hóa đơn hoặc số điện thoại mua hàng'],
      },
      warranty: {
        title: 'Chính sách Bảo Hành Chính Hãng',
        duration: '12 tháng chính hãng toàn quốc',
        type: 'Bảo hành điện tử tự động kích hoạt qua số điện thoại đặt hàng',
      },
      payment: {
        title: 'Phương Thức Thanh Toán Hỗ Trợ',
        methods: ['COD - Thanh toán tiền mặt khi nhận hàng', 'Chuyển khoản an toàn qua mã QR', 'Thanh toán trực tuyến VNPAY'],
      },
    };

    let replyText = '';
    if (policyType === 'shipping') {
      replyText = `🚚 **${p.shipping.title}**\n\n- **Phí giao hàng:** ${p.shipping.standard_fee}.\n- **Ưu đãi Freeship:** ${p.shipping.free_shipping_threshold}.\n- **Thời gian nhận hàng:** ${p.shipping.delivery_time}.\n- **Đồng kiểm:** ${p.shipping.inspection}.`;
    } else if (policyType === 'return') {
      replyText = `🔄 **${p.return_policy.title}**\n\n- **Thời gian áp dụng:** ${p.return_policy.period}.\n- **Điều kiện đổi trả:**\n  + ${p.return_policy.conditions.join('\n  + ')}\n- Đội ngũ kỹ thuật sẽ tiếp nhận và xử lý đổi sản phẩm mới trong 1 - 3 ngày làm việc.`;
    } else if (policyType === 'warranty') {
      replyText = `🛡️ **${p.warranty.title}**\n\n- **Thời gian bảo hành:** ${p.warranty.duration}.\n- **Hình thức:** ${p.warranty.type}.\n- Quý khách chỉ cần mang sản phẩm hoặc gửi bưu điện kèm số điện thoại mua hàng để được bảo hành chu đáo.`;
    } else if (policyType === 'payment') {
      replyText = `💳 **${p.payment.title}**\n\nCửa hàng hiện hỗ trợ các phương thức thanh toán linh hoạt:\n- ${p.payment.methods.join('\n- ')}\n\nQuý khách có thể thoải mái chọn phương thức thuận tiện nhất tại trang Thanh toán (Checkout).`;
    } else if (policyType === 'contact') {
      replyText = `📞 **Thông tin Liên Hệ & Showroom**\n\n- **Hotline hỗ trợ miễn phí:** ${p.store_info.hotline} (8:00 - 21:30 hàng ngày)\n- **Showroom trải nghiệm:** ${p.store_info.address}\n- **Email hỗ trợ:** ${p.store_info.email}`;
    } else {
      replyText = `📋 **Thông tin Chính Sách Cửa Hàng**\n\n- 🚚 **Giao hàng:** ${p.shipping.standard_fee} (${p.shipping.free_shipping_threshold}). Nhận sau 1-3 ngày.\n- 🔄 **Đổi trả:** ${p.return_policy.period}.\n- 🛡️ **Bảo hành:** ${p.warranty.duration}.\n- 💳 **Thanh toán:** COD, Chuyển khoản QR, VNPAY.\n- 📞 **Hotline CSKH:** ${p.store_info.hotline}.`;
    }

    return {
      type: 'bot',
      text: replyText,
      quickReplies: ['Chính sách bảo hành', 'Chính sách giao hàng', 'Chính sách đổi trả', 'Phương thức thanh toán'],
    };
  }

  // 7. Mã giảm giá & Khuyến mãi
  async handlePromotions(entities = {}) {
    this.context.waitingFor = null;

    // Nếu người dùng nhập kiểm tra một mã cụ thể
    if (entities.couponCode) {
      const checkRes = await chatbotService.checkPromotionCode(entities.couponCode);
      if (checkRes.success) {
        const d = checkRes.data;
        const discountText = d.loaigiam === 'phantram'
          ? `Giảm ${d.giatri}% (tối đa ${formatVND(d.giamtoida)})`
          : `Giảm ${formatVND(d.giatri)}`;
        return {
          type: 'bot',
          text: `🎉 **Mã ${entities.couponCode} HỢP LỆ VÀ CÒN HIỆU LỰC!**\n\n- **Tên chương trình:** ${d.ten || 'Ưu đãi mua sắm'}\n- **Mức giảm:** ${discountText}\n- **Áp dụng:** Đơn hàng từ ${formatVND(d.giatritoithieu)}\n- **Hạn dùng:** Đến hết ngày ${d.ngayketthuc ? new Date(d.ngayketthuc).toLocaleDateString('vi-VN') : 'khi có thông báo mới'}\n\n👉 Bạn có thể áp dụng mã này ngay tại trang Thanh toán nhé!`,
          quickReplies: ['Các mã giảm giá khác', 'Tìm sản phẩm để mua'],
        };
      } else {
        return {
          type: 'bot',
          text: `⚠️ **Thông báo về mã [${entities.couponCode}]:**\n\n${checkRes.message || 'Mã không tồn tại hoặc đã hết lượt sử dụng.'}\n\nBạn có thể tham khảo các mã khuyến mãi đang hoạt động bên dưới nhé!`,
          quickReplies: ['Xem mã giảm giá đang có', 'Sản phẩm đang sale'],
        };
      }
    }

    // Lấy danh sách khuyến mãi đang hoạt động từ database
    const promotions = await chatbotService.getPromotions();

    if (!promotions || promotions.length === 0) {
      return {
        type: 'bot',
        text: `Hiện tại cửa hàng chưa có voucher mới trên hệ thống. Tuy nhiên, rất nhiều sản phẩm đang được áp dụng **giá khuyến mãi trực tiếp** cực tốt! Bạn có muốn xem danh sách sản phẩm giảm giá không ạ?`,
        quickReplies: ['Sản phẩm đang giảm giá', 'Tìm điện thoại', 'Tìm laptop'],
      };
    }

    let reply = `🎁 **DANH SÁCH MÃ GIẢM GIÁ ĐANG ÁP DỤNG HÔM NAY:**\n\n`;
    promotions.slice(0, 5).forEach((item, idx) => {
      const discount = item.loaigiam === 'phantram'
        ? `giảm **${item.giatri}%** (tối đa ${formatVND(item.giamtoida)})`
        : `giảm thẳng **${formatVND(item.giatri)}**`;
      const minOrder = item.giatritoithieu ? `cho đơn từ ${formatVND(item.giatritoithieu)}` : 'mọi đơn hàng';
      reply += `${idx + 1}. **Mã: \`${item.ma}\`** - ${discount} ${minOrder}.\n   *${item.ten || item.mota || 'Chương trình ưu đãi'}*\n\n`;
    });

    reply += `💡 *Nhấn vào mã voucher để sao chép và nhập tại bước Thanh toán.*`;

    return {
      type: 'bot',
      text: reply,
      promotions: promotions.slice(0, 5),
      quickReplies: ['Sản phẩm đang giảm giá', 'Chính sách giao hàng', 'Tư vấn mua sắm'],
    };
  }

  // 8. Kiểm tra tồn kho
  async handleCheckStock(entities = {}) {
    let target = entities.rawText || '';
    // Loại bỏ các từ khóa thừa
    target = target
      .replace(/(?:con hang khong|con hang k|het hang chua|ton kho|kiem tra hang|san pham nay|kiem tra ton kho|shop oi|con k)/gi, '')
      .trim();

    if (!target) {
      this.context.waitingFor = 'STOCK_TARGET';
      return {
        type: 'bot',
        text: `Dạ bạn muốn kiểm tra tồn kho của sản phẩm nào ạ? Bạn hãy nhập tên hoặc mã sản phẩm giúp em nhé! (Ví dụ: *iPhone 15 128GB*, *Laptop Asus TUF*...)`,
        quickReplies: ['iPhone 15', 'Laptop Asus', 'Tai nghe Sony'],
      };
    }

    this.context.waitingFor = null;
    const stockRes = await chatbotService.checkStock(target);

    if (stockRes.success && stockRes.data) {
      const p = stockRes.data;
      const priceText = p.giakhuyenmai && p.giakhuyenmai > 0
        ? `**${formatVND(p.giakhuyenmai)}** (Giá gốc: ~~${formatVND(p.gia)}~~)`
        : `**${formatVND(p.gia)}**`;

      if (p.soluong > 0) {
        return {
          type: 'bot',
          text: `✅ **SẢN PHẨM HIỆN ĐANG CÒN HÀNG!**\n\n- **Sản phẩm:** [${p.ten}](/productdetail/${p.id})\n- **Giá bán hiện tại:** ${priceText}\n- **Tình trạng:** Sẵn hàng tại kho (Số lượng còn: **${p.soluong}** cái)\n\nQuý khách có thể đặt hàng ngay để được giao hàng sớm nhất nhé!`,
          products: [p],
          quickReplies: [`Xem chi tiết ${p.ten.slice(0, 20)}`, 'Chính sách giao hàng', 'Có mã giảm giá không?'],
        };
      } else {
        return {
          type: 'bot',
          text: `⚠️ **Rất tiếc, sản phẩm [${p.ten}](/productdetail/${p.id}) hiện ĐANG TẠM HẾT HÀNG.**\n\nCửa hàng đang tiến hành nhập thêm hàng về. Quý khách có thể tham khảo một số sản phẩm tương tự đang có sẵn nhé!`,
          products: [p],
          quickReplies: ['Tìm sản phẩm tương tự', 'Xem sản phẩm mới', 'Tư vấn mẫu khác'],
        };
      }
    } else {
      return {
        type: 'bot',
        text: `Dạ em chưa tìm thấy sản phẩm "${target}" trong dữ liệu kho hàng. Bạn có thể kiểm tra lại tên sản phẩm hoặc gõ từ khóa ngắn gọn hơn giúp em được không ạ?`,
        quickReplies: ['Danh sách điện thoại', 'Danh sách laptop', 'Tìm sản phẩm'],
      };
    }
  }

  // 9. So sánh sản phẩm
  async handleCompare(entities = {}) {
    this.context.waitingFor = null;
    const targets = entities.comparisonTargets;

    if (!targets || targets.length < 2) {
      return {
        type: 'bot',
        text: `Dạ để so sánh sản phẩm, bạn vui lòng nhập cú pháp ví dụ như:\n👉 *"So sánh iPhone 15 và Samsung S24"*\n👉 *"So sánh Laptop Asus TUF và Dell Inspiron"*\n\nEm sẽ đối chiếu giá, thông số và tồn kho thực tế từ cửa hàng cho bạn ạ!`,
        quickReplies: ['So sánh iPhone 15 và Samsung Galaxy', 'Tư vấn chọn sản phẩm'],
      };
    }

    const res = await chatbotService.compareProducts(targets);

    if (!res.success || !res.data || res.data.length < 2) {
      return {
        type: 'bot',
        text: `Dạ em đã tìm trong kho hàng nhưng ${res.message || 'chưa tìm thấy đủ ít nhất 2 sản phẩm tương ứng'}. Bạn vui lòng kiểm tra lại tên chính xác của 2 sản phẩm nhé!`,
        quickReplies: ['Tìm sản phẩm', 'Xem danh mục'],
      };
    }

    const p1 = res.data[0];
    const p2 = res.data[1];

    // Tạo nhận xét khách quan dựa trên dữ liệu thật
    let review = '';
    if (p1.gia_ban < p2.gia_ban) {
      const diff = p2.gia_ban - p1.gia_ban;
      review = `💡 **Nhận xét:** **${p1.ten}** có mức giá mềm hơn **${formatVND(diff)}** so với **${p2.ten}**, là lựa chọn tối ưu chi phí hơn. Trong khi đó, **${p2.ten}** thuộc phân khúc cao cấp hơn.`;
    } else if (p1.gia_ban > p2.gia_ban) {
      const diff = p1.gia_ban - p2.gia_ban;
      review = `💡 **Nhận xét:** **${p2.ten}** có mức giá tiết kiệm hơn **${formatVND(diff)}** so với **${p1.ten}**. Quý khách có thể cân nhắc tùy theo ngân sách và nhu cầu thực tế.`;
    } else {
      review = `💡 **Nhận xét:** Cả hai sản phẩm đều có mức giá ngang nhau. Quý khách có thể chọn theo thương hiệu hoặc kiểu dáng yêu thích.`;
    }

    return {
      type: 'bot',
      text: `⚖️ **BẢNG SO SÁNH SẢN PHẨM THỰC TẾ:**\n\n${review}`,
      comparisonData: res.data,
      quickReplies: ['Kiểm tra khuyến mãi', 'Chính sách bảo hành', 'Tư vấn thêm'],
    };
  }

  // 10. Tra cứu đơn hàng (bảo mật tuyệt đối)
  async handleOrderLookup(entities = {}) {
    this.context.waitingFor = null;

    // 1. Kiểm tra trạng thái đăng nhập
    const user = authService.getUser();
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (!token || !user) {
      return {
        type: 'bot',
        text: `🔒 **Yêu cầu bảo mật tra cứu:**\n\nĐể đảm bảo an toàn và bảo mật thông tin đơn hàng cá nhân, quý khách vui lòng **đăng nhập vào tài khoản** để xem tình trạng đơn hàng của mình nhé!\n\n👉 [**Nhấn vào đây để Đăng Nhập**](/login)`,
        quickReplies: ['Đăng nhập ngay', 'Tìm sản phẩm khác', 'Chính sách giao hàng'],
      };
    }

    try {
      const orders = await chatbotService.getUserOrders();

      if (!orders || orders.length === 0) {
        return {
          type: 'bot',
          text: `Chào **${user.ten || user.name || 'quý khách'}**, tài khoản của bạn hiện **chưa có đơn hàng nào** trên hệ thống.\n\nBạn có thể tham quan các sản phẩm nổi bật đang giảm giá để chọn món đồ công nghệ yêu thích nhé!`,
          quickReplies: ['Sản phẩm đang giảm giá', 'Điện thoại mới', 'Laptop bán chạy'],
        };
      }

      // Nếu người dùng nhập mã đơn cụ thể
      if (entities.orderCode) {
        const orderCodeClean = String(entities.orderCode).toLowerCase();
        const found = orders.find(
          (o) =>
            String(o.id) === orderCodeClean ||
            String(o.madon || '').toLowerCase().includes(orderCodeClean)
        );

        if (found) {
          return {
            type: 'bot',
            text: `📦 **THÔNG TIN ĐƠN HÀNG #${found.madon || found.id} CỦA BẠN:**\n\n- **Ngày đặt:** ${new Date(found.created_at).toLocaleDateString('vi-VN')}\n- **Trạng thái:** **${this.getOrderStatusLabel(found.trangthai)}**\n- **Tổng thanh toán:** **${formatVND(found.tongtien)}**\n- **Phương thức:** ${found.phuongthucthanhtoan || 'COD'}\n- **Người nhận:** ${found.tennguoinhan || user.ten} (${found.sodienthoai || ''})\n- **Địa chỉ nhận:** ${found.diachigiaohang || 'Theo thông tin tài khoản'}\n\n👉 [Xem chi tiết đơn hàng](/orders/${found.id})`,
            orders: [found],
            quickReplies: ['Xem tất cả đơn hàng của tôi', 'Chính sách đổi trả', 'Hỗ trợ khác'],
          };
        } else {
          return {
            type: 'bot',
            text: `Dạ em không tìm thấy mã đơn hàng **#${entities.orderCode}** trong danh sách các đơn đã đặt của tài khoản **${user.email || user.ten}**.\n\nBạn có thể xem danh sách các đơn hàng gần nhất bên dưới nhé!`,
            orders: orders.slice(0, 3),
            quickReplies: ['Xem tất cả đơn hàng', 'Chính sách giao hàng'],
          };
        }
      }

      // Hiển thị danh sách 3 đơn hàng mới nhất
      const recentOrders = orders.slice(0, 3);
      let reply = `📦 **DANH SÁCH ĐƠN HÀNG GẦN ĐÂY CỦA BẠN (${user.ten || user.email}):**\n\n`;
      recentOrders.forEach((o, idx) => {
        reply += `${idx + 1}. **Đơn #${o.madon || o.id}** (${new Date(o.created_at).toLocaleDateString('vi-VN')})\n   - Trạng thái: **${this.getOrderStatusLabel(o.trangthai)}**\n   - Tổng tiền: **${formatVND(o.tongtien)}**\n\n`;
      });
      reply += `👉 [**Xem toàn bộ lịch sử đơn hàng tại đây**](/orders)`;

      return {
        type: 'bot',
        text: reply,
        orders: recentOrders,
        quickReplies: ['Chính sách đổi trả', 'Chính sách bảo hành', 'Tìm sản phẩm'],
      };
    } catch (err) {
      console.error('Lỗi tra cứu đơn hàng:', err);
      return {
        type: 'bot',
        text: `Dạ hiện tại hệ thống tra cứu đơn hàng đang bảo trì hoặc phiên đăng nhập của bạn đã hết hạn. Bạn vui lòng thử [đăng nhập lại](/login) giúp em nhé!`,
        quickReplies: ['Đăng nhập lại', 'Chính sách giao hàng'],
      };
    }
  }

  // Chuyển đổi mã trạng thái đơn hàng sang tiếng Việt dễ hiểu
  getOrderStatusLabel(status) {
    const map = {
      choxacnhan: 'Chờ xác nhận',
      daxacnhan: 'Đã xác nhận',
      dangchuanbi: 'Đang đóng gói',
      danggiao: 'Đang giao hàng 🚚',
      dagiao: 'Giao hàng thành công ✅',
      dahuy: 'Đã hủy ❌',
    };
    return map[status] || status || 'Đang xử lý';
  }

  // 11. Tư vấn sản phẩm theo nhu cầu & ngân sách
  async handleConsult(entities = {}) {
    const purpose = entities.purpose;
    const priceRange = entities.priceRange;
    const brand = entities.brand;
    const category = entities.category;

    // Nếu người dùng chưa cho biết mức ngân sách, chủ động hỏi ngân sách để tư vấn chuẩn
    if (!priceRange && purpose && !this.context.savedEntities.priceRange) {
      this.context.waitingFor = 'BUDGET_INPUT';
      this.context.savedEntities = { purpose, brand, category };

      let budgetHint = 'Ví dụ: *Dưới 15 triệu*, *Từ 10 đến 20 triệu*...';
      if (purpose.suggestBudget) {
        budgetHint = `Thông thường phân khúc **${purpose.label}** phù hợp ở khoảng **${formatVND(purpose.suggestBudget.min)} - ${formatVND(purpose.suggestBudget.max)}**.`;
      }

      return {
        type: 'bot',
        text: `Dạ với nhu cầu **${purpose.label}**, bạn dự định đầu tư trong khoảng **ngân sách bao nhiêu** ạ?\n\n💡 ${budgetHint}`,
        quickReplies: ['Dưới 10 triệu', 'Từ 10 - 15 triệu', 'Từ 15 - 25 triệu', 'Trên 25 triệu'],
      };
    }

    this.context.waitingFor = null;
    this.context.savedEntities = {};

    // Truy vấn sản phẩm thật từ API Laravel
    const queryParams = {
      budget_min: priceRange?.min_price || undefined,
      budget_max: priceRange?.max_price || undefined,
      category: category?.name || undefined,
      brand: brand?.name || undefined,
      keyword: purpose?.keywords ? purpose.keywords[0] : undefined,
    };

    const products = await chatbotService.consult(queryParams);

    if (!products || products.length === 0) {
      // Fallback: Tìm các sản phẩm cùng danh mục hoặc cùng tầm giá
      const fallbackProducts = await chatbotService.searchProducts({
        min_price: priceRange?.min_price,
        max_price: priceRange?.max_price,
        per_page: 4,
      });

      if (fallbackProducts.length > 0) {
        return {
          type: 'bot',
          text: `Dạ trong tầm giá này hiện chưa có mẫu khớp 100% từ khóa "${purpose?.label || 'nhu cầu'}", nhưng em xin gợi ý một số sản phẩm công nghệ đang bán rất chạy trong phân khúc giá này ạ:`,
          products: fallbackProducts,
          quickReplies: ['Tư vấn mức giá khác', 'Xem tất cả sản phẩm', 'Khuyến mãi hôm nay'],
        };
      }

      return {
        type: 'bot',
        text: `Dạ em rất tiếc hiện tại chưa có sản phẩm nào khớp hoàn toàn với tiêu chí này trong kho hàng. Bạn có thể mở rộng khoảng giá hoặc chọn thương hiệu khác để em tìm lại nhé!`,
        quickReplies: ['Dưới 20 triệu', 'Laptop sinh viên', 'Điện thoại giá rẻ'],
      };
    }

    // Đưa ra giải thích phù hợp dựa trên dữ liệu thật của sản phẩm
    let explanation = `💡 **Gợi ý từ dữ liệu thực tế cửa hàng:**\n`;
    products.slice(0, 3).forEach((item, idx) => {
      const realPrice = item.giakhuyenmai && item.giakhuyenmai > 0 ? item.giakhuyenmai : item.gia;
      const stockStatus = item.soluong > 0 ? `còn hàng (${item.soluong} máy)` : 'tạm hết hàng';
      explanation += `${idx + 1}. **${item.ten}** (${formatVND(realPrice)} - ${stockStatus}): Phù hợp cho nhu cầu ${purpose?.label || 'sử dụng'} nhờ mức giá hợp lý và cấu hình chuẩn.\n`;
    });

    return {
      type: 'bot',
      text: `Dạ em đã chọn lọc được các mẫu sản phẩm phù hợp nhất với nhu cầu của bạn từ hệ thống cửa hàng:\n\n${explanation}\nBạn có thể nhấn vào từng sản phẩm bên dưới để xem chi tiết thông số nhé!`,
      products: products.slice(0, 4),
      quickReplies: ['So sánh các mẫu này', 'Có mã giảm giá không?', 'Chính sách bảo hành'],
    };
  }

  // 12. Tìm kiếm sản phẩm
  async handleSearchProduct(entities = {}) {
    this.context.waitingFor = null;

    let searchKeyword = entities.keywordFallback || '';
    // Lọc bỏ từ khóa tìm kiếm chung chung
    if (searchKeyword) {
      searchKeyword = searchKeyword
        .replace(/^(tim|kiem|muon mua|co|xem|san pham|hang)\s+/gi, '')
        .trim();
    }

    const params = {
      search: searchKeyword || entities.brand?.name || entities.category?.name || undefined,
      danhmuc_id: entities.category?.id || undefined,
      thuonghieu_id: entities.brand?.id || undefined,
      min_price: entities.priceRange?.min_price || undefined,
      max_price: entities.priceRange?.max_price || undefined,
      on_sale: /giam gia|sale|khuyen mai/i.test(entities.rawText) ? 1 : undefined,
      per_page: 6,
    };

    const products = await chatbotService.searchProducts(params);

    if (!products || products.length === 0) {
      return {
        type: 'bot',
        text: `Dạ em không tìm thấy sản phẩm nào khớp với yêu cầu "${entities.rawText}" trong kho hàng hiện tại. Bạn có thể thử tìm theo tên thương hiệu khác hoặc mở rộng mức giá nhé!`,
        quickReplies: ['Điện thoại Samsung', 'iPhone mới', 'Laptop Asus', 'Sản phẩm đang sale'],
      };
    }

    const count = products.length;
    let title = `🔍 **Tìm thấy ${count} sản phẩm phù hợp trong hệ thống:**`;
    if (entities.priceRange) {
      const pMax = entities.priceRange.max_price ? `dưới ${formatVND(entities.priceRange.max_price)}` : '';
      const pMin = entities.priceRange.min_price ? `từ ${formatVND(entities.priceRange.min_price)}` : '';
      title = `🔍 **Sản phẩm mức giá ${pMin} ${pMax}:**`;
    }

    return {
      type: 'bot',
      text: `${title}\nQuý khách nhấn vào sản phẩm để xem hình ảnh và thông số chi tiết nhé!`,
      products,
      quickReplies: ['Kiểm tra khuyến mãi', 'Chính sách đổi trả & bảo hành', 'Tư vấn thêm'],
    };
  }

  // 13. Fallback khi không nhận diện được
  handleFallback(rawText) {
    this.context.waitingFor = null;
    return {
      type: 'bot',
      text: `Dạ em chưa hiểu rõ yêu cầu *"${rawText.slice(0, 60)}"*. Bạn có thể diễn đạt lại hoặc chọn các chủ đề gợi ý bên dưới để em hỗ trợ bạn nhanh nhất nhé! 👇`,
      quickReplies: [
        'Tìm sản phẩm',
        'Tư vấn chọn laptop / điện thoại',
        'Kiểm tra tồn kho',
        'Mã giảm giá hôm nay',
        'Chính sách giao hàng',
        'Tra cứu đơn hàng',
      ],
    };
  }
}

// Khởi tạo singleton instance cho ứng dụng
export const conversationEngine = new ConversationManager();

