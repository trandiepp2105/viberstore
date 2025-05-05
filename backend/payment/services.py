from .models import Payment, PaymentStatus, PaymentMethod
from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings
from payment.vnpay import vnpay
from datetime import datetime

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class PaymentService:
    @staticmethod
    def list_payment_statuses():
        return PaymentStatus.objects.all()

    @staticmethod
    def list_payment_methods():
        return PaymentMethod.objects.filter(is_active=True)

    @staticmethod
    def get_payment_method_by_id(payment_method_id):
        try:
            return PaymentMethod.objects.get(id=payment_method_id, is_active=True)
        except ObjectDoesNotExist:
            raise ValueError("Payment method not found")

    @staticmethod
    def list_payments(order_id):
        return Payment.objects.filter(order_id=order_id)

    @staticmethod
    def paid_payment(payment_id):
        try:
            payment = Payment.objects.get(id=payment_id)
            payment.status = PaymentStatus.objects.get(code='COMPLETED')
            payment.save()
            return payment
        except ObjectDoesNotExist:
            raise ValueError("Payment not found")

    @staticmethod
    def vnpay_payment(request, order, payment_method, transaction_id, gateway_response, amount):
        ipaddr = get_client_ip(request)
        # Build URL Payment
        vnp = vnpay()
        vnp.requestData['vnp_Version'] = '2.1.0'
        vnp.requestData['vnp_Command'] = 'pay'
        vnp.requestData['vnp_TmnCode'] = settings.VNPAY_TMN_CODE
        vnp.requestData['vnp_Amount'] = amount * 100  # Convert to VND
        vnp.requestData['vnp_CurrCode'] = 'VND'
        vnp.requestData['vnp_TxnRef'] = order.id
        vnp.requestData['vnp_OrderInfo'] = order.order_code
        vnp.requestData['vnp_OrderType'] = "other"
        bank_code = "NCB"
        language = "vn"
        # Check language, default: vn
        if language and language != '':
            vnp.requestData['vnp_Locale'] = language
        else:
            vnp.requestData['vnp_Locale'] = 'vn'
            # Check bank_code, if bank_code is empty, customer will be selected bank on VNPAY
        if bank_code and bank_code != "":
            vnp.requestData['vnp_BankCode'] = bank_code

        vnp.requestData['vnp_CreateDate'] = datetime.now().strftime('%Y%m%d%H%M%S')  # 20150410063022
        vnp.requestData['vnp_IpAddr'] = ipaddr
        vnp.requestData['vnp_ReturnUrl'] = settings.VNPAY_RETURN_URL
        vnpay_payment_url = vnp.get_payment_url(settings.VNPAY_PAYMENT_URL, settings.VNPAY_HASH_SECRET_KEY)
        try:
            payment_status = PaymentStatus.objects.get(code="PENDING")
            payment = Payment.objects.create(
                order=order,
                status=payment_status,
                method=payment_method,
                transaction_id=transaction_id,
                gateway_response=gateway_response,
                amount=amount,
                paid_at=None,)
            return payment, vnpay_payment_url
        except ObjectDoesNotExist as e:
            raise ValueError(f"Invalid status or method: {str(e)}")

    @staticmethod
    def process_vnpay_response(request):
        from django.utils.timezone import now

        data = request.data
        response_code = data.get('vnp_ResponseCode')
        transaction_no = data.get('vnp_TransactionNo')
        txn_ref = data.get('vnp_TxnRef')
        pay_date = data.get('vnp_PayDate')
        secure_hash = data.get('vnp_SecureHash')

        # Error code descriptions
        error_codes = {
            "00": "Giao dịch thành công",
            "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
            "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
            "10": "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
            "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
            "12": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
            "13": "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.",
            "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
            "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
            "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
            "75": "Ngân hàng thanh toán đang bảo trì.",
            "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch",
            "99": "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)"
        }

        try:
            payment = Payment.objects.get(order_id=txn_ref)
        except ObjectDoesNotExist:
            raise ValueError("Payment not found for the given order ID")

        if response_code == "00":  # Successful transaction
            payment.status = PaymentStatus.objects.get(code="COMPLETED")
            payment.transaction_id = transaction_no
            payment.paid_at = now()
            payment.gateway_response = error_codes.get(response_code, "Unknown response code")
        else:  # Failed transaction
            payment.status = PaymentStatus.objects.get(code="FAILED")
            payment.paid_at = None
            payment.gateway_response = error_codes.get(response_code, "Unknown response code")

        payment.save()
        return payment

    @staticmethod
    def create_payment(order, status, method, transaction_id, gateway_response, amount, paid_at):
        try:
            payment_status = PaymentStatus.objects.get(code=status)
            payment_method = PaymentMethod.objects.get(code=method, is_active=True)
            payment = Payment.objects.create(
                order_id=order,
                status=payment_status,
                method=payment_method,
                transaction_id=transaction_id,
                gateway_response=gateway_response,
                amount=amount,
                paid_at=paid_at
            )
            return payment
        except ObjectDoesNotExist as e:
            raise ValueError(f"Invalid status or method: {str(e)}")
