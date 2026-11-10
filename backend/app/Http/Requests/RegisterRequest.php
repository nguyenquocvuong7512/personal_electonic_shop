<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Cho phép thực hiện request
    }
   
    /** * Các rule kiểm tra dữ liệu đăng ký. */


    public function rules(): array
    {
        return [
            'ten'       => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'unique:nguoidung,email'], // Khớp với bảng nguoidung
            'matkhau'   => ['required', 'min:6'],
            'sodienthoai' => ['nullable', 'string', 'max:20'],
            'diachi'    => ['nullable', 'string'],
        ];
    }
    /** * Thông báo lỗi. */

    public function messages(): array
    {
        return [
            'ten.required'     => 'Họ và tên không được để trống.',
            'email.required'   => 'Email không được để trống.',
            'email.unique'     => 'Email này đã tồn tại trên hệ thống.',
            'matkhau.required' => 'Mật khẩu không được để trống.',
            'matkhau.min'      => 'Mật khẩu phải chứa ít nhất 6 ký tự.',
        ];
    }
}
