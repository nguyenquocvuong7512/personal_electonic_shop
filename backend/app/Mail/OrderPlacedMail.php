<?php

namespace App\Mail;

use App\Models\DonHang;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderPlacedMail extends Mailable
{
    use Queueable, SerializesModels;

    public DonHang $order;

    public function __construct(DonHang $order)
    {
        $this->order = $order;
    }

    public function build()
    {
        return $this->subject('Xác nhận đặt hàng thành công - VuongTrong Shop')
                    ->view('emails.orders.placed');
    }
}
