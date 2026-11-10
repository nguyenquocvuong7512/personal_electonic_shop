
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Xác nhận đơn hàng</title>
</head>
<body>
    <h2>VuongTrong Shop xin chào {{ $order->hoten_nguoinhan }}!</h2>

    <p>Cảm ơn bạn đã đặt hàng tại cửa hàng chúng tôi.</p>

    <p>Đơn hàng của bạn đã được ghi nhận thành công.</p>

    <h3>Thông tin đơn hàng</h3>

    <p><strong>Mã đơn hàng:</strong> {{ $order->madon }}</p>
    <p><strong>Ngày đặt:</strong> {{ $order->created_at }}</p>
    <p><strong>Người nhận:</strong> {{ $order->hoten_nguoinhan }}</p>
    <p><strong>Số điện thoại:</strong> {{ $order->sodienthoai }}</p>
    <p><strong>Địa chỉ giao hàng:</strong> {{ $order->diachigiaohang }}</p>

    <h3>Chi tiết sản phẩm</h3>

    <table border="1" cellpadding="8" cellspacing="0">
        <thead>
            <tr>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($order->chitiet as $item)
                <tr>
                    <td>{{ $item->ten_sanpham }}</td>
                    <td>{{ $item->soluong }}</td>
                    <td>{{ number_format((float) $item->gia, 0, ',', '.') }} đ</td>
                    <td>{{ number_format((float) $item->thanhtien, 0, ',', '.') }} đ</td>
                </tr>
            @endforeach
        </tbody>    
    </table>

    <h3>Tổng thanh toán</h3>
    <p>
        <strong>
            {{ number_format((float) $order->thanhtien, 0, ',', '.') }} đ
        </strong>
    </p>

    <p>Chúng tôi sẽ thông báo cho bạn khi đơn hàng được xác nhận.</p>

    <p>Cảm ơn bạn đã mua sắm tại VuongTrong Shop!</p>
</body>
</html>
