from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from address.services import DeliveryAddressService
from address.models import DeliveryAddress
from address.serializers import DeliveryAddressSerializer
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from address.services import LocationService
class ProvinceListView(APIView):
    """View to list all provinces."""
    def get(self, request):
        provinces = LocationService.get_provinces()
        data = [{"id": p.id, "name": p.name, "code": p.code} for p in provinces]
        return Response(data)

class DistrictListView(APIView):
    """View to list districts by province."""
    def get(self, request, province_id):
        districts = LocationService.get_districts_by_province(province_id)
        data = [{"id": d.id, "name": d.name, "code": d.code} for d in districts]
        return Response(data)

class WardListView(APIView):
    """View to list wards by district."""
    def get(self, request, district_id):
        wards = LocationService.get_wards_by_district(district_id)
        data = [{"id": w.id, "name": w.name, "code": w.code} for w in wards]
        return Response(data)

class DeliveryAddressView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="List Delivery Addresses",
        operation_description="Retrieve all delivery addresses for the authenticated user.",
        responses={200: openapi.Response('OK', DeliveryAddressSerializer(many=True))},
        tags=['Delivery Addresses']
    )
    def get(self, request):
        """Retrieve all delivery addresses for the authenticated user."""
        addresses = DeliveryAddressService.get_user_addresses(request.user)
        serializer = DeliveryAddressSerializer(addresses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="Create Delivery Address",
        operation_description="Add a new delivery address for the authenticated user.",
        request_body=DeliveryAddressSerializer,
        responses={
            201: openapi.Response('Created', DeliveryAddressSerializer),
            400: openapi.Response('Bad Request')
        },
        tags=['Delivery Addresses']
    )
    def post(self, request):
        """Add a new delivery address for the authenticated user."""
        serializer = DeliveryAddressSerializer(data=request.data)
        if serializer.is_valid():
            address = DeliveryAddressService.add_address(request.user, serializer.validated_data)
            return Response(DeliveryAddressSerializer(address).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeliveryAddressDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Update Delivery Address",
        operation_description="Update an existing delivery address for the authenticated user.",
        request_body=DeliveryAddressSerializer,
        responses={
            200: openapi.Response('OK', DeliveryAddressSerializer),
            404: openapi.Response('Not Found'),
            400: openapi.Response('Bad Request')
        },
        tags=['Delivery Addresses']
    )
    def put(self, request, address_id):
        """Update an existing delivery address."""
        serializer = DeliveryAddressSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            address = DeliveryAddressService.update_address(address_id, request.user, serializer.validated_data)
            if address:
                return Response(DeliveryAddressSerializer(address).data, status=status.HTTP_200_OK)
            return Response({"detail": "Address not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="Delete Delivery Address",
        operation_description="Delete a specific delivery address for the authenticated user.",
        responses={
            204: openapi.Response('No Content'),
            404: openapi.Response('Not Found')
        },
        tags=['Delivery Addresses']
    )
    def delete(self, request, address_id):
        """Delete a specific delivery address."""
        success = DeliveryAddressService.delete_address(address_id, request.user)
        if success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": "Address not found."}, status=status.HTTP_404_NOT_FOUND)

class SetDefaultAddressView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Set Default Delivery Address",
        operation_description="Set a specific delivery address as the default for the authenticated user.",
        responses={
            200: openapi.Response('OK', DeliveryAddressSerializer),
            404: openapi.Response('Not Found')
        },
        tags=['Delivery Addresses']
    )
    def post(self, request, address_id):
        """Set a specific delivery address as default."""
        address = DeliveryAddressService.set_default_address(address_id, request.user)
        if address:
            return Response(DeliveryAddressSerializer(address).data, status=status.HTTP_200_OK)
        return Response({"detail": "Address not found."}, status=status.HTTP_404_NOT_FOUND)
