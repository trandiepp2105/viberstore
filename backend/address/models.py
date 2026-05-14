from django.db import models

# Create your models here.
class Province(models.Model):
    code = models.IntegerField()
    code_name = models.CharField(max_length=255)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'province'

class District(models.Model):
    code = models.IntegerField()
    code_name = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    province = models.ForeignKey(Province, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'district'
    
class Ward(models.Model):
    code = models.IntegerField()
    code_name = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    district = models.ForeignKey(District, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'ward'

class DeliveryAddress(models.Model):
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
        return self.province_city.name + " " + self.district.name + " " + self.ward_commune.name + " " + self.speciic_address + " " + self.phone_number
    
    class Meta:
        db_table = 'delivery_address'