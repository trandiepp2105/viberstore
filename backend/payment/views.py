from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .services import PaymentService
from .serializers import PaymentStatusSerializer, PaymentMethodSerializer, PaymentSerializer
import logging

logger = logging.getLogger(__name__)

class PaymentStatusListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="List Payment Statuses",
        operation_description="Retrieve a list of all available payment statuses.",
        responses={
            200: openapi.Response('List of payment statuses.', PaymentStatusSerializer(many=True)),
            401: openapi.Response('Unauthorized - User not authenticated.'),
        },
        tags=['Payment']
    )
    def get(self, request, format=None):
        try:
            statuses = PaymentService.list_payment_statuses()
            serializer = PaymentStatusSerializer(statuses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error listing payment statuses: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentMethodListAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_summary="List Payment Methods",
        operation_description="Retrieve a list of all active payment methods.",
        responses={
            200: openapi.Response('List of payment methods.', PaymentMethodSerializer(many=True)),
            500: openapi.Response('Internal server error'),
        },
        tags=['Payment Methods']
    )
    def get(self, request, format=None):
        try:
            methods = PaymentService.list_payment_methods()
            serializer = PaymentMethodSerializer(methods, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error listing payment methods: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="List Payments for an Order",
        operation_description="Retrieve a list of all payments associated with a specific order.",
        manual_parameters=[
            openapi.Parameter(
                'order_id', openapi.IN_QUERY, description="ID of the order", type=openapi.TYPE_INTEGER
            )
        ],
        responses={
            200: openapi.Response('List of payments.', PaymentSerializer(many=True)),
            400: openapi.Response('Bad Request - Missing or invalid order_id'),
            500: openapi.Response('Internal server error'),
        },
        tags=['Payments']
    )
    def get(self, request, format=None):
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response({"error": "order_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            payments = PaymentService.list_payments(order_id)
            serializer = PaymentSerializer(payments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error listing payments for order {order_id}: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Create a Payment",
        operation_description="Create a new payment for a specific order.",
        request_body=PaymentSerializer,
        responses={
            201: openapi.Response('Payment created successfully.', PaymentSerializer),
            400: openapi.Response('Bad Request - Invalid input data'),
            500: openapi.Response('Internal server error'),
        },
        tags=['Payments']
    )
    def post(self, request, format=None):
        serializer = PaymentSerializer(data=request.data)
        if serializer.is_valid():
            try:
                payment = PaymentService.create_payment(**serializer.validated_data)
                response_serializer = PaymentSerializer(payment)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Error creating payment: {e}", exc_info=True)
                return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProcessPaymentAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_summary="Process VNPAY Payment Response",
        operation_description="Process the payment response from VNPAY and update the payment status.",
        responses={
            200: openapi.Response('Payment processed successfully.'),
            400: openapi.Response('Bad Request - Invalid or missing data'),
            404: openapi.Response('Not Found - Payment not found'),
            500: openapi.Response('Internal server error'),
        },
        tags=['Payments']
    )
    def post(self, request, format=None):

        try:
            payment = PaymentService.process_vnpay_response(request)
            request_data_dict = request.data
            request_data_dict['paid_at'] = payment.paid_at
            request_data_dict['total_amount'] = payment.amount
            request_data_dict['description'] = payment.gateway_response
            print("Request data:", request_data_dict)
            return Response(request_data_dict, status=status.HTTP_200_OK)
        except ValueError as e:
            print("Error in process_vnpay_response:", e)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("Error in process_vnpay_response:", e)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
