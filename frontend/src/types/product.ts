// Kiểu dữ liệu sản phẩm
export interface Product {
  id: number;
  danhmuc_id: number;
  thuonghieu_id: number;
  ten: string;
  gia: string;
  giakhuyenmai: string | null;
  soluong: number;
}