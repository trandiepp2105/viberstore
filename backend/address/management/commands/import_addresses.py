import requests
from django.core.management.base import BaseCommand
from address.models import Province, District, Ward

class Command(BaseCommand):
    help = "Import Vietnam addresses from provinces.open-api.vn"

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting to import Vietnam addresses...")

        # Base URL of the API
        base_url = "https://provinces.open-api.vn/api/"

        # Fetch and save provinces
        try:
            provinces_response = requests.get(f"{base_url}p", timeout=10)
            provinces_response.raise_for_status()
            provinces_data = provinces_response.json()

            for province in provinces_data:
                province_obj, created = Province.objects.get_or_create(
                    code=province["code"],
                    defaults={
                        "name": province["name"],
                        "code_name": province["codename"]
                    },
                )
                self.stdout.write(
                    f"{'Created' if created else 'Skipped'} Province: {province['name']}"
                )

                # Fetch districts for each province
                districts_response = requests.get(
                    f"{base_url}p/{province['code']}?depth=2", timeout=10
                )
                districts_response.raise_for_status()
                districts_data = districts_response.json()["districts"]

                for district in districts_data:
                    district_obj, created = District.objects.get_or_create(
                        code=district["code"],
                        defaults={
                            "name": district["name"],
                            "code_name": district["codename"],
                            "province": province_obj,
                        },
                    )
                    self.stdout.write(
                        f"{'Created' if created else 'Skipped'} District: {district['name']}"
                    )

                    # Fetch wards for each district
                    wards_response = requests.get(
                        f"{base_url}d/{district['code']}?depth=2", timeout=10
                    )
                    wards_response.raise_for_status()
                    wards_data = wards_response.json()["wards"]

                    for ward in wards_data:
                        Ward.objects.get_or_create(
                            code=ward["code"],
                            defaults={
                                "name": ward["name"],
                                "code_name": ward["codename"],
                                "district": district_obj,
                            },
                        )
                        self.stdout.write(f"Added Ward: {ward['name']}")

        except requests.RequestException as e:
            self.stderr.write(f"Error fetching data: {e}")
            return

        self.stdout.write("Vietnam addresses imported successfully!")
