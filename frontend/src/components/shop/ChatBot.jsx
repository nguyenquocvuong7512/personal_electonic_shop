'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  X,
  Send,
  RotateCcw,
  Sparkles,
  Bot,
  ExternalLink,
  Copy,
  Check,
  Search,
  Sliders,
  Package,
  Gift,
  Truck,
  FileText,
} from 'lucide-react';
import { conversationEngine, formatVND } from '../../utils/chatbot/conversationManager';
import { getAssetUrl } from '../../services/api';
import '../../styles/shop/chatbot.css';

// 6 câu hỏi gợi ý chuẩn theo yêu cầu nghiệp vụ
const INITIAL_SUGGESTIONS = [
  { id: 1, text: 'Tìm sản phẩm', prompt: 'Tôi muốn tìm sản phẩm', icon: Search },
  { id: 2, text: 'Tư vấn chọn sản phẩm', prompt: 'Tư vấn giúp tôi chọn sản phẩm phù hợp', icon: Sliders },
  { id: 3, text: 'Kiểm tra giá và tồn kho', prompt: 'Kiểm tra giá và tồn kho sản phẩm', icon: Package },
  { id: 4, text: 'Tìm hiểu chương trình khuyến mãi', prompt: 'Cửa hàng có chương trình khuyến mãi hay mã giảm giá nào không?', icon: Gift },
  { id: 5, text: 'Chính sách giao hàng và đổi trả', prompt: 'Chính sách giao hàng và đổi trả của cửa hàng như thế nào?', icon: Truck },
  { id: 6, text: 'Hỗ trợ đơn hàng', prompt: 'Tra cứu tình trạng đơn hàng của tôi', icon: FileText },
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Khởi tạo tin nhắn chào mừng ban đầu
  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome',
      type: 'bot',
      text: 'Xin chào quý khách! 👋 Em là **Trợ lý tư vấn bán hàng** của cửa hàng.\n\nEm có thể hỗ trợ quý khách tìm sản phẩm, tư vấn chọn máy theo nhu cầu, kiểm tra tồn kho, cập nhật khuyến mãi và tra cứu đơn hàng.',
      timestamp: new Date(),
      showSuggestions: true,
    };
    setMessages([welcomeMessage]);
  }, []);

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Tự động focus ô nhập liệu khi mở khung chat trên desktop
      if (typeof window !== 'undefined' && window.innerWidth > 640) {
        inputRef.current?.focus();
      }
    }
  }, [isOpen, messages, isTyping]);

  // Xử lý gửi tin nhắn
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    // Giới hạn độ dài tin nhắn
    if (text.length > 300) {
      alert('Nội dung tin nhắn không được vượt quá 300 ký tự.');
      return;
    }

    const userMsg = {
      id: Date.now() + '-user',
      type: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Giả lập độ trễ phản hồi tự nhiên (300ms - 500ms)
      const startTime = Date.now();
      const botResponse = await conversationEngine.processMessage(text);
      const elapsed = Date.now() - startTime;
      if (elapsed < 350) {
        await new Promise((r) => setTimeout(r, 350 - elapsed));
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + '-bot',
          ...botResponse,
        },
      ]);
    } catch (error) {
      console.error('Lỗi phản hồi chatbot:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + '-error',
          type: 'bot',
          text: 'Dạ hiện tại máy chủ đang bận hoặc có sự gián đoạn kết nối. Quý khách vui lòng thử lại sau giây lát nhé!',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Làm mới cuộc hội thoại
  const handleResetChat = () => {
    conversationEngine.resetContext();
    const freshWelcome = {
      id: Date.now() + '-fresh',
      type: 'bot',
      text: 'Cuộc trò chuyện đã được làm mới. Quý khách cần em tư vấn hoặc giải đáp thông tin gì ạ?',
      timestamp: new Date(),
      showSuggestions: true,
    };
    setMessages([freshWelcome]);
  };

  // Sao chép mã voucher
  const handleCopyCode = (code) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  // Định dạng thời gian
  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Format đơn giản Markdown (in đậm, in nghiêng, link)
  const renderFormattedText = (text = '') => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Thay thế link [text](url)
      const linkRegex = /\[(.*?)\]\((.*?)\)/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(
          <Link
            key={match.index}
            href={match[2]}
            className="text-blue-600 underline font-semibold hover:text-blue-800"
            onClick={() => {
              if (window.innerWidth <= 640) setIsOpen(false);
            }}
          >
            {match[1]}
          </Link>
        );
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      // Xử lý in đậm **text**
      const renderedParts = parts.map((part, pIdx) => {
        if (typeof part !== 'string') return part;
        const boldSplit = part.split(/\*\*(.*?)\*\*/g);
        return boldSplit.map((chunk, cIdx) => {
          if (cIdx % 2 === 1) {
            return <strong key={cIdx}>{chunk}</strong>;
          }
          // Xử lý code block `code`
          const codeSplit = chunk.split(/`(.*?)`/g);
          return codeSplit.map((cChunk, kIdx) => {
            if (kIdx % 2 === 1) {
              return (
                <code
                  key={kIdx}
                  className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono text-xs font-semibold cursor-pointer"
                  onClick={() => handleCopyCode(cChunk)}
                  title="Nhấn để sao chép mã"
                >
                  {cChunk}
                </code>
              );
            }
            return cChunk;
          });
        });
      });

      return (
        <React.Fragment key={idx}>
          {renderedParts}
          {idx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="chatbot-wrapper">
      {/* 1. Nút nổi mở khung chat (Khi đang đóng) */}
      {!isOpen && (
        <button
          type="button"
          className="chatbot-trigger-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Mở trợ lý tư vấn bán hàng"
        >
          <div className="chatbot-trigger-icon">
            <Bot size={24} />
            <span className="chatbot-pulse-dot" />
          </div>
          <div className="chatbot-trigger-text">
            <span className="chatbot-trigger-title">Tư vấn bán hàng</span>
            <span className="chatbot-trigger-sub">Trực tuyến 24/7 • Hỏi ngay</span>
          </div>
        </button>
      )}

      {/* 2. Cửa sổ chat chính */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-header-avatar">
                <Bot size={22} />
              </div>
              <div className="chatbot-header-titles">
                <h3 className="chatbot-title">Tư vấn bán hàng</h3>
                <span className="chatbot-status">
                  <span className="chatbot-status-indicator" />
                  Đang hoạt động • Phản hồi tức thì
                </span>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                type="button"
                className="chatbot-header-btn"
                onClick={handleResetChat}
                title="Làm mới cuộc trò chuyện"
                aria-label="Làm mới"
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                className="chatbot-header-btn"
                onClick={() => setIsOpen(false)}
                title="Đóng khung chat"
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Danh sách tin nhắn */}
          <div className="chatbot-messages-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`chatbot-message-row ${msg.type}`}>
                <div className="chatbot-bubble">
                  {renderFormattedText(msg.text)}

                  {/* 6 câu hỏi gợi ý khi mở lần đầu */}
                  {msg.showSuggestions && (
                    <div className="chatbot-initial-suggestions">
                      {INITIAL_SUGGESTIONS.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className="chatbot-suggestion-pill"
                            onClick={() => handleSendMessage(item.prompt)}
                          >
                            <IconComponent size={15} className="chatbot-suggestion-icon" />
                            <span>{item.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Danh sách thẻ sản phẩm thực tế */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="chatbot-products-container">
                      {msg.products.map((p) => {
                        const imagePath = p.sanpham_hinhanh || p.hinhanh;
                        const imageUrl = getAssetUrl(imagePath);
                        const price = Number(p.gia) || 0;
                        const salePrice = Number(p.giakhuyenmai) || 0;
                        const hasSale = salePrice > 0 && salePrice < price;
                        const isAvailable = (p.soluong || 0) > 0;

                        return (
                          <Link
                            key={p.id}
                            href={`/productdetail/${p.id}`}
                            className="chatbot-product-card"
                            onClick={() => {
                              if (window.innerWidth <= 640) setIsOpen(false);
                            }}
                          >
                            <img
                              src={imageUrl}
                              alt={p.ten}
                              className="chatbot-product-img"
                              onError={(e) => {
                                e.target.src = '/placeholder.svg';
                              }}
                            />
                            <div className="chatbot-product-details">
                              <span className="chatbot-product-title" title={p.ten}>
                                {p.ten}
                              </span>
                              <div className="chatbot-product-prices">
                                <span className="chatbot-price-current">
                                  {formatVND(hasSale ? salePrice : price)}
                                </span>
                                {hasSale && (
                                  <span className="chatbot-price-original">
                                    {formatVND(price)}
                                  </span>
                                )}
                              </div>
                              <span
                                className={`chatbot-stock-badge ${
                                  isAvailable ? 'in-stock' : 'out-stock'
                                }`}
                              >
                                {isAvailable ? `Còn hàng (${p.soluong})` : 'Tạm hết hàng'}
                              </span>
                            </div>
                            <ExternalLink size={14} className="text-gray-400 self-center ml-1" />
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Bảng so sánh sản phẩm */}
                  {msg.comparisonData && msg.comparisonData.length >= 2 && (
                    <div className="chatbot-compare-card">
                      <table className="chatbot-compare-table">
                        <thead>
                          <tr>
                            <th>Tiêu chí</th>
                            {msg.comparisonData.map((item) => (
                              <th key={item.id}>
                                <Link
                                  href={`/productdetail/${item.id}`}
                                  className="text-blue-600 font-semibold"
                                >
                                  {item.ten.slice(0, 24)}...
                                </Link>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>Giá bán</strong></td>
                            {msg.comparisonData.map((item) => (
                              <td key={item.id} className="text-rose-600 font-bold">
                                {formatVND(item.gia_ban)}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td><strong>Thương hiệu</strong></td>
                            {msg.comparisonData.map((item) => (
                              <td key={item.id}>{item.thuonghieu}</td>
                            ))}
                          </tr>
                          <tr>
                            <td><strong>Danh mục</strong></td>
                            {msg.comparisonData.map((item) => (
                              <td key={item.id}>{item.danhmuc}</td>
                            ))}
                          </tr>
                          <tr>
                            <td><strong>Tồn kho</strong></td>
                            {msg.comparisonData.map((item) => (
                              <td key={item.id}>
                                <span
                                  className={
                                    item.tonkho > 0 ? 'text-green-600 font-semibold' : 'text-red-500'
                                  }
                                >
                                  {item.tinh_trang} ({item.tonkho})
                                </span>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Danh sách voucher có nút sao chép */}
                  {msg.promotions && msg.promotions.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.promotions.map((km) => (
                        <div key={km.id} className="chatbot-voucher-card">
                          <div>
                            <span className="chatbot-voucher-code">{km.ma}</span>
                            <span className="text-xs text-gray-600 ml-2">
                              {km.loaigiam === 'phantram'
                                ? `Giảm ${km.giatri}%`
                                : `Giảm ${formatVND(km.giatri)}`}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="chatbot-copy-btn"
                            onClick={() => handleCopyCode(km.ma)}
                          >
                            {copiedCode === km.ma ? (
                              <span className="flex items-center gap-1">
                                <Check size={12} /> Đã chép
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Copy size={12} /> Sao chép
                              </span>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Nút gợi ý nhanh tiếp theo (Quick replies) */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="chatbot-quick-replies">
                      {msg.quickReplies.map((replyText, rIdx) => (
                        <button
                          key={rIdx}
                          type="button"
                          className="chatbot-chip-btn"
                          onClick={() => handleSendMessage(replyText)}
                        >
                          {replyText}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="chatbot-message-time">{formatTime(msg.timestamp)}</span>
              </div>
            ))}

            {/* Hiệu ứng đang gõ tin nhắn */}
            {isTyping && (
              <div className="chatbot-message-row bot">
                <div className="chatbot-typing-bubble">
                  <span className="chatbot-typing-dot" />
                  <span className="chatbot-typing-dot" />
                  <span className="chatbot-typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Khung nhập nội dung */}
          <div className="chatbot-footer-input">
            <form
              className="chatbot-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                className="chatbot-input-field"
                placeholder="Nhập câu hỏi cần tư vấn... (Enter để gửi)"
                value={inputText}
                maxLength={300}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                type="submit"
                className="chatbot-send-btn"
                disabled={!inputText.trim() || isTyping}
                title="Gửi tin nhắn"
                aria-label="Gửi"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

