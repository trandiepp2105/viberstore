from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
import sys

def convert_image_to_jpeg(image_file):
    try:
        image_file.seek(0)  # 👈 reset trước khi đọc
        img = Image.open(image_file)

        if img.mode != 'RGB':
            img = img.convert('RGB')

        output_io = BytesIO()
        img.save(output_io, format='JPEG')
        output_io.seek(0)

        new_file = InMemoryUploadedFile(
            output_io,
            'ImageField',
            f"{image_file.name.split('.')[0]}.jpg",
            'image/jpeg',
            output_io.getbuffer().nbytes,
            None
        )
        return new_file
    except Exception as e:
        print("Lỗi khi convert ảnh:", e)
        return image_file
