from django.db import models

class Province(models.Model):
    """Model `Province` của domain `address`, biểu diễn tỉnh/thành phố trong cây địa giới hành chính.. Thành phần chính: code, code_name, name."""
    code = models.IntegerField()
    code_name = models.CharField(max_length=255)
    name = models.CharField(max_length=255)

    def __str__(self):
        """Trả về biểu diễn chuỗi dễ đọc của đối tượng."""
        return self.name
    
    class Meta:
        """Khai báo metadata cho `Province`, gồm: db_table."""
        db_table = 'province'

class District(models.Model):
    """Model `District` của domain `address`, biểu diễn quận/huyện thuộc tỉnh/thành phố.. Thành phần chính: code, code_name, name, province."""
    code = models.IntegerField()
    code_name = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    province = models.ForeignKey(Province, on_delete=models.CASCADE)

    def __str__(self):
        """Trả về biểu diễn chuỗi dễ đọc của đối tượng."""
        return self.name
    
    class Meta:
        """Khai báo metadata cho `District`, gồm: db_table."""
        db_table = 'district'
    
class Ward(models.Model):
    """Model `Ward` của domain `address`, biểu diễn xã/phường thuộc quận/huyện.. Thành phần chính: code, code_name, name, district."""
    code = models.IntegerField()
    code_name = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    district = models.ForeignKey(District, on_delete=models.CASCADE)

    def __str__(self):
        """Trả về biểu diễn chuỗi dễ đọc của đối tượng."""
        return self.name
    
    class Meta:
        """Khai báo metadata cho `Ward`, gồm: db_table."""
        db_table = 'ward'

class DeliveryAddress(models.Model):
    """Model `DeliveryAddress` của domain `address`, biểu diễn địa chỉ giao hàng của user gồm người nhận, số điện thoại và địa chỉ hành chính/chi tiết.. Thành phần chính: user, recipient_name, is_default, name, province_city, district, ward_commune, specific_address, phone_number, created_at, updated_at."""
    user = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name="delivery_addresses")
    recipient_name = models.CharField(max_length=255)
    is_default = models.BooleanField(default=False)
    name = models.CharField(max_length=255, null=True, blank=True)
    province_city = models.ForeignKey(Province, on_delete=models.CASCADE)
    district = models.ForeignKey(District, on_delete=models.CASCADE)
    ward_commune = models.ForeignKey(Ward, on_delete=models.CASCADE)
    specific_address = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        """Trả về biểu diễn chuỗi dễ đọc của đối tượng."""
        return self.province_city.name + " " + self.district.name + " " + self.ward_commune.name + " " + self.speciic_address + " " + self.phone_number
    
    class Meta:
        """Khai báo metadata cho `DeliveryAddress`, gồm: db_table."""
        db_table = 'delivery_address'
