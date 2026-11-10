<?php

namespace App\Mail;

use App\Models\DonHang;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    // Lưu thông tin đơn hàng để sử dụng trong email
    public DonHang $order;

    /**
     * Nhận thông tin đơn hàng từ DonHangController
     */
    public function __construct(DonHang $order)
    {
        $this->order = $order;
    }

    /**
     * Thiết lập tiêu đề email
     */
    public function build()
    {
        return $this->subject('Đơn hàng đã được xác nhận - VuongTrong Shop')
                    ->view('emails.orders.confirmed');
    }
}