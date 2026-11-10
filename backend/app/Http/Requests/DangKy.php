<?php namespace App\Http\Requests\Dan;
 use Illuminate\Foundation\Http\FormRequest; 
 class DangKyRequest extends FormRequest 
 { /** * Xác định người dùng có được phép gửi request hay không. */ 
 public function authorize(): bool { return true; }
  /** * Các rule kiểm tra dữ liệu đăng ký. */
   public function rules(): array { 
    return 
    [
         'ten' => [ 'required', 'string', 'max:255', ],
     'email' => [ 'required', 'email', 'max:255', 'unique:nguoidung,email', ],
      'matkhau' => [ 'required', 'string', 'min:6', 'max:255', 'confirmed', ],
       'sodienthoai' => [ 'nullable', 'string', 'max:20', ],
        'diachi' => [ 'nullable', 'string', ],
    ];
    }
    /** * Thông báo lỗi. */ 
    public function messages(): array { 
        return 
        [ 'ten.required' => 'Vui lòng nhập họ tên.',
         'ten.string' => 'Họ tên phải là chuỗi.',
          'ten.max' => 'Họ tên không được vượt quá 255 ký tự.',
           'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Email không đúng định dạng.',
             'email.max' => 'Email không được vượt quá 255 ký tự.',
              'email.unique' => 'Email này đã được đăng ký.',
               'matkhau.required' => 'Vui lòng nhập mật khẩu.',
                'matkhau.string' => 'Mật khẩu phải là chuỗi.',
                 'matkhau.min' => 'Mật khẩu phải có ít nhất 6 ký tự.',
                  'matkhau.max' => 'Mật khẩu không được vượt quá 255 ký tự.',
                   'matkhau.confirmed' => 'Xác nhận mật khẩu không khớp.',
                    'sodienthoai.string' => 'Số điện thoại không hợp lệ.',
                     'sodienthoai.max' => 'Số điện thoại không được vượt quá 20 ký tự.',
                      'diachi.string' => 'Địa chỉ không hợp lệ.', 
        ]; 
    }
}