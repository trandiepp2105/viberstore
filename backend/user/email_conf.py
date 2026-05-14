from django.core.mail import send_mail
from django.conf import settings
import hashlib
import pyotp
from django.core.cache import cache

# Hàm để hash email
def hash_email(email: str) -> str:
    return hashlib.sha256(email.encode()).hexdigest()

def generate_otp(email: str, expiration_time: int = 300) -> str:
    """
    Tạo mã OTP cho email được truyền vào.
    """
    expiration_time = 300  # 5 phút
    secret = pyotp.random_base32()
    otp = pyotp.TOTP(secret, interval=expiration_time).now()
    cache.set(hash_email(email), otp, expiration_time)
    return otp

def generate_otp_email_body(otp: str, description: str = "Thank you for choosing viperphone. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes") -> str:
    """
    Tạo nội dung HTML cho email với mã OTP được truyền vào.
    """
    return f"""
    <html>
    <body>
        <div style="font-family: Helvetica,Arial,sans-serif;min-width:730px;overflow:auto;line-height:2">
            <div style="margin-top:10px;width:100%;">
                <div style="border-bottom:1px solid #eee">
                <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Viperphone</a>
                </div>
                <p style="font-size:1.1em">Hi,</p>
                <p>{description}</p>
                <div style="display: flex; gap: 10px; height: 25px;">
                <span style="margin-right: 10px; text-align: center; color: red;     display: inline-block; text-align: center; border-radius: 4px; border: 1px solid #000;  width: 25px;
            height: 25px;
            box-sizing: border-box;">{otp[0]}</span>
                <span style="margin-right: 10px; color: red; text-align: center;     display: inline-block; text-align: center; border-radius: 4px; border: 1px solid #000;  width: 25px;
            height: 25px;
            box-sizing: border-box;">{otp[1]}</span>
                <span style="margin-right: 10px; color: red; text-align: center;     display: inline-block; text-align: center; border-radius: 4px; border: 1px solid #000;  width: 25px;
            height: 25px;
            box-sizing: border-box;">{otp[2]}</span>
                <span style="margin-right: 10px; color: red; text-align: center;     display: inline-block; text-align: center; border-radius: 4px; border: 1px solid #000;  width: 25px;
            height: 25px;
            box-sizing: border-box;">{otp[3]}</span>
                <span style="margin-right: 10px; color: red; text-align: center;     display: inline-block; text-align: center; border-radius: 4px; border: 1px solid #000;  width: 25px;
            height: 25px;
            box-sizing: border-box;">{otp[4]}</span>
                <span style="margin-right: 10px; color: red; text-align: center;     display: inline-block; text-align: center; border-radius: 4px; border: 1px solid #000;  width: 25px;
            height: 25px;
            box-sizing: border-box;">{otp[5]}</span>
                </div>
                <p style="font-size:0.9em;">Regards,<br />viperphone</p>
                <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                <p>KTX khu B</p>
                <p>Mạc Đĩnh Chi</p>
                <p>Bình Dương</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

def send_html_email(email: str, expiration_time: int = 300, subject: str = '[IMPORTANT] Please enter this OTP to authenticate your account!', description: str = ""):
    otp = generate_otp(email, expiration_time)
    html_message = generate_otp_email_body(otp)
    subject = f'[IMPORTANT] Please enter this OTP to authenticate your account!'

    message = 'This is a plain text message.'
    # from_email = settings.DEFAULT_FROM_EMAIL
    from_email = 'viperphone'
    recipient_list = [email]

    send_mail(subject, message, from_email, recipient_list, html_message=html_message)