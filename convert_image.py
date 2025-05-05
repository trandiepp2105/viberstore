import os
from pathlib import Path
from PIL import Image
from PIL import UnidentifiedImageError
# --- Cấu hình ---
# !!! THAY ĐỔI ĐƯỜNG DẪN NÀY cho phù hợp với máy của bạn !!!
INPUT_FOLDER = Path("D:\WEB-PROJECT\Picture_OOP")
OUTPUT_FOLDER = Path("D:\WEB-PROJECT\Picture_OOP_FIX")


import pillow_avif

def convert_avif_to_png(input_dir, output_dir):
    """
    Chuyển đổi tất cả các file có đuôi .jpg (thực chất là AVIF) trong thư mục input_dir
    thành file .png và lưu vào thư mục output_dir.
    """
    # Tạo thư mục output nếu chưa tồn tại
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"Thư mục output: {output_dir}")

    count_success = 0
    count_error = 0

    # Lấy danh sách các file có đuôi .jpg trong thư mục input
    # Sử dụng glob('*.[jJ][pP][gG]') để bắt cả .jpg và .JPG
    files_to_process = list(input_dir.glob('*.[jJ][pP][gG]'))

    if not files_to_process:
        print(f"\nKhông tìm thấy file '.jpg' nào trong thư mục: {input_dir}")
        return

    print(f"\nTìm thấy {len(files_to_process)} file '.jpg' để xử lý...")

    for input_file_path in files_to_process:
        # Tạo tên file output bằng cách thay đuôi .jpg thành .png
        output_file_name = input_file_path.stem + ".png"
        output_file_path = output_dir / output_file_name

        print(f"\nĐang xử lý: {input_file_path.name}")

        try:
            # Mở file ảnh (Pillow sẽ tự động nhận diện định dạng AVIF nếu có hỗ trợ)
            # Sử dụng 'with' để đảm bảo file được đóng đúng cách
            with Image.open(input_file_path) as img:
                print(f"  -> Đã mở file thành công. Định dạng nhận diện: {img.format}")

                # Kiểm tra xem Pillow có thực sự nhận dạng nó là AVIF không (tùy chọn)
                if img.format != 'AVIF':
                     print(f"  -> CẢNH BÁO: File {input_file_path.name} có thể không phải là AVIF (Pillow nhận diện là {img.format}). Vẫn thử chuyển đổi...")

                # Lưu ảnh dưới dạng PNG
                img.save(output_file_path, "PNG")
                print(f"  -> Đã lưu thành công thành: {output_file_path.name}")
                count_success += 1

        except FileNotFoundError:
            print(f"  -> LỖI: Không tìm thấy file: {input_file_path}")
            count_error += 1
        except UnidentifiedImageError:
             print(f"  -> LỖI: Không thể nhận diện định dạng ảnh cho file: {input_file_path.name}. Có thể file bị hỏng hoặc không phải AVIF.")
             print(f"  ->       Hoặc thư viện hỗ trợ AVIF (libavif/libheif) chưa được cài đặt đúng cách hoặc thiếu plugin.")
             count_error += 1
        except Exception as e:
            print(f"  -> LỖI không xác định khi xử lý file {input_file_path.name}: {e}")
            # In thêm chi tiết lỗi nếu cần gỡ rối
            # import traceback
            # traceback.print_exc()
            count_error += 1

    print("\n--- Hoàn tất quá trình ---")
    print(f"Số file chuyển đổi thành công: {count_success}")
    print(f"Số file gặp lỗi: {count_error}")

# Chạy hàm chính
if __name__ == "__main__":
    # Kiểm tra xem đường dẫn INPUT_FOLDER có tồn tại không
    if not INPUT_FOLDER.is_dir():
        print(f"LỖI: Thư mục đầu vào '{INPUT_FOLDER}' không tồn tại hoặc không phải là thư mục.")
        print("Vui lòng kiểm tra lại cấu hình INPUT_FOLDER trong code.")
    else:
        convert_avif_to_png(INPUT_FOLDER, OUTPUT_FOLDER)