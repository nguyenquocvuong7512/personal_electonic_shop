import Header from "../../components/shop/Header";
import Footer from "../../components/shop/Footer";
import ChatBot from "../../components/shop/ChatBot";
import "../../styles/shop/shop.css";
import "../../styles/shop/header.css";
// Layout chung cho khu vực khách hàng
export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="shop-layout">
      {/* Thanh điều hướng */}
      <Header />

      {/* Nội dung từng trang */}
      <main className="shop-content">
        {children}
      </main>

      {/* Chân trang */}
      <Footer />

      {/* Chatbot tư vấn bán hàng */}
      <ChatBot />
    </div>
  );
}