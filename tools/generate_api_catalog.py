#!/usr/bin/env python3
"""Generate the API catalogue workbook from routes/views/serializers currently in backend."""
from pathlib import Path
from html import escape
from zipfile import ZipFile, ZIP_DEFLATED

OUT = Path("docs")
BASE = "/api/v1"

# Columns: domain, method, route, auth, input, output, status, description
R = []
def add(domain, method, route, auth, input_, output, status, description):
    R.append([domain, method, BASE + route, auth, input_, output, status, description])
def crud(domain, route, auth, resource, fields, query=""):
    add(domain,"GET",route,auth,query or "—",f"200: {resource}[]","200, 401/403",f"Liệt kê {resource}.")
    add(domain,"POST",route,auth,fields,f"201: {resource}","201, 400, 401/403",f"Tạo {resource}.")
    add(domain,"GET",route+"{id}/",auth,"Path: id:int",f"200: {resource}","200, 404, 401/403",f"Lấy chi tiết {resource}.")
    add(domain,"PUT",route+"{id}/",auth,"Path: id:int; Body: "+fields,f"200: {resource}","200, 400, 404, 401/403",f"Cập nhật toàn bộ {resource}.")
    add(domain,"PATCH",route+"{id}/",auth,"Path: id:int; Body: các trường cần đổi trong "+fields,f"200: {resource}","200, 400, 404, 401/403",f"Cập nhật một phần {resource}.")
    add(domain,"DELETE",route+"{id}/",auth,"Path: id:int","204: empty","204, 404, 401/403",f"Xóa {resource}.")

# Authentication
add("Xác thực","POST","/auth/register/","Không","JSON: name, email, phone_number, password","201: User {id,name,email,phone_number}; hoặc 200 {detail} khi email chưa xác thực đã tồn tại","201, 200, 400","Đăng ký; gửi OTP email. password chỉ ghi, không trả về.")
add("Xác thực","POST","/auth/verify-email/","Không","JSON: email, otp (6 ký tự)","200: {message}","200, 400","Kiểm tra OTP trong cache và đánh dấu tài khoản is_verify=true.")
add("Xác thực","POST","/auth/login/","Không","JSON: email, password","200: {access, refresh}; đồng thời Set-Cookie access/refresh","200, 401, 404","Đăng nhập JWT. Token chứa claim email; cookies hiện không HttpOnly/Secure.")
add("Xác thực","POST","/auth/refresh-token/","Không (cần cookie refresh)","Cookie: refresh","200: {message}; Set-Cookie access mới","200, 400, 401, 500","Làm mới access token từ cookie refresh; không đọc refresh token từ body.")
add("Xác thực","POST","/auth/logout/","Bearer JWT","Header: Authorization; Cookie: refresh","200: {message}; cookies access/refresh rỗng","200, 400, 401","Đặt refresh token hết hạn và xóa cookies phía client.")
add("Xác thực","POST","/auth/reset-password/?step=1","Không","JSON: email","200: {message}","200, 400, 404","Gửi OTP đặt lại mật khẩu.")
add("Xác thực","POST","/auth/reset-password/?step=2","Không","JSON: email, otp","200: {message}","200, 400","Xác nhận OTP trước khi đổi mật khẩu.")
add("Xác thực","POST","/auth/reset-password/?step=3","Không","JSON: email, new_password","200: {message}","200, 400","Đổi mật khẩu. Lưu ý: view không ràng buộc OTP step 2 với step 3.")

# Product/catalogue
supplier="company_name, contact_person, email, phone_number, address, tax_id, status, website, started_at (slug/id chỉ đọc)"
crud("Nhà cung cấp","/suppliers/","Bearer JWT + admin", "Supplier", supplier, "Query tùy chọn: status, search")
category="name, description?, image_url? (multipart/form-data hoặc JSON), parent?; id/slug chỉ đọc"
crud("Danh mục","/categories/","GET công khai; ghi Bearer JWT + admin", "Category", category, "Query tùy chọn: parent_id (null/0 hoặc ID)")
product="supplier, name, description?, cost_price, price, sale_price, publish_at?, image_url?, category_id?; slug/is_published/stock chỉ đọc"
crud("Sản phẩm","/products/","GET công khai (khách chỉ thấy published); ghi Bearer JWT + admin", "Product", product, "Query: category_id, supplier_id, is_published, search, ordering, page/page_size (nếu service hỗ trợ)")
add("Sản phẩm","GET","/products/{slug}/","Không","Path: slug:string","200: Product","200, 404","Lấy sản phẩm published theo slug.")
variant="size?, color?, sku, stock, image_url?, weight_grams?, is_active?; product lấy từ URL khi tạo"
add("Biến thể","GET","/products/{product_id}/variants/","GET công khai; POST Bearer JWT + admin","Path: product_id:int","200: ProductVariant[]","200, 404, 401/403","Liệt kê biến thể theo product ID; khách chỉ nhận biến thể khả dụng.")
add("Biến thể","POST","/products/{product_id}/variants/","Bearer JWT + admin","Path: product_id:int; Body: "+variant,"201: ProductVariant","201, 400, 404, 401/403","Tạo biến thể; cặp product/size/color phải duy nhất.")
add("Biến thể","GET","/products/{slug}/variants/","Không","Path: slug:string","200: ProductVariant[]","200, 404","Liệt kê biến thể sản phẩm published theo slug.")
add("Biến thể","GET","/variants/{id}/","GET công khai; ghi Bearer JWT + admin","Path: id:int","200: ProductVariant","200, 404, 401/403","Lấy biến thể.")
add("Biến thể","PUT","/variants/{id}/","Bearer JWT + admin","Path: id:int; Body: product, size?, color?, sku, stock, image_url?, weight_grams?, is_active?","200: ProductVariant","200, 400, 404, 401/403","Cập nhật toàn bộ biến thể.")
add("Biến thể","PATCH","/variants/{id}/","Bearer JWT + admin","Path: id:int; Body: các trường ProductVariant cần đổi","200: ProductVariant","200, 400, 404, 401/403","Cập nhật một phần biến thể.")
add("Biến thể","DELETE","/variants/{id}/","Bearer JWT + admin","Path: id:int","204: empty","204, 404, 401/403","Xóa biến thể.")
add("Danh mục SP","GET","/products/{product_id}/categories/","Không","Path: product_id:int","200: Category[]","200, 404","Danh mục của sản phẩm theo ID.")
add("Danh mục SP","GET","/products/{slug}/categories/","Không","Path: slug:string","200: Category[]","200, 404","Danh mục của sản phẩm theo slug.")

# Address/cart
add("Địa chỉ","GET","/provinces/","Không","—","200: Province[] {id,name,code}","200","Danh sách tỉnh/thành.")
add("Địa chỉ","GET","/provinces/{province_id}/districts/","Không","Path: province_id:int","200: District[] {id,name,code}","200","Danh sách quận/huyện.")
add("Địa chỉ","GET","/districts/{district_id}/wards/","Không","Path: district_id:int","200: Ward[] {id,name,code}","200","Danh sách phường/xã.")
address="recipient_name, is_default?, name, province_city, district, ward_commune, specific_address, phone_number (user/id/timestamps chỉ đọc)"
add("Địa chỉ giao hàng","GET","/delivery-addresses/","Bearer JWT","—","200: DeliveryAddress[]","200, 401","Địa chỉ của chính người đăng nhập.")
add("Địa chỉ giao hàng","POST","/delivery-addresses/","Bearer JWT","JSON: "+address,"201: DeliveryAddress","201, 400, 401","Tạo địa chỉ cho người đăng nhập.")
add("Địa chỉ giao hàng","PUT","/delivery-addresses/{address_id}/","Bearer JWT","Path: address_id:int; JSON: "+address,"200: DeliveryAddress","200, 400, 404, 401","Cập nhật địa chỉ thuộc người dùng.")
add("Địa chỉ giao hàng","DELETE","/delivery-addresses/{address_id}/","Bearer JWT","Path: address_id:int","204: empty","204, 404, 401","Xóa địa chỉ thuộc người dùng.")
add("Địa chỉ giao hàng","POST","/delivery-addresses/{address_id}/set-default/","Bearer JWT","Path: address_id:int","200: DeliveryAddress","200, 404, 401","Đặt địa chỉ mặc định.")
add("Giỏ hàng","GET","/cart/","Bearer JWT","—","200: CartItem[]","200, 401","Lấy giỏ của người dùng. CartItem có variant_details, available_variants, item_total_price.")
add("Giỏ hàng","POST","/cart/","Bearer JWT","JSON: variant:int, quantity:int >=0","200: CartItem hoặc 204 khi quantity=0","200, 204, 400, 401","Thêm/cập nhật số lượng cuối cùng; chỉ variant active/published và kiểm tra tồn kho.")
add("Giỏ hàng","DELETE","/cart/","Bearer JWT","—","204: empty","204, 401","Xóa toàn bộ giỏ.")
add("Giỏ hàng","PUT","/cart/{id}/","Bearer JWT","Path: id:int; JSON: quantity:int >=0","200: CartItem hoặc 204","200, 204, 400, 404, 401","Đổi số lượng item; 0 sẽ xóa.")
add("Giỏ hàng","PATCH","/cart/{id}/","Bearer JWT","Path: id:int; JSON: new_variant_id:int","200: {message}","200, 400, 401","Thay biến thể của item và điều chỉnh số lượng nếu cần.")
add("Giỏ hàng","DELETE","/cart/{id}/","Bearer JWT","Path: id:int","204: empty","204, 404, 401","Xóa một item.")
add("Giỏ hàng","DELETE","/cart/bulk-delete/","Bearer JWT","JSON: cart_item_ids:int[] (không rỗng)","200: {message}","200, 400, 404, 401","Xóa nhiều item thuộc người dùng.")

# Marketing/reviews
promotion="name, description?, type, value, start_date, end_date, max_discount_amount?, min_order_amount?, usage_limit?, priority?, is_active"
crud("Khuyến mãi","/promotions/","Bearer JWT + admin","Promotion",promotion,"Query: is_active:boolean, type, active_now:boolean")
add("Gán khuyến mãi","POST","/promotions/assign/","Bearer JWT + admin","JSON: promotion_id:int, product_ids?:int[], category_ids?:int[]","200: {message}","200, 400, 404, 401/403","Gán promotion vào sản phẩm và/hoặc danh mục.")
add("Gán khuyến mãi","DELETE","/promotions/remove/","Bearer JWT + admin","JSON: promotion_id:int, product_ids?:int[], category_ids?:int[]","200: {message}","200, 400, 404, 401/403","Gỡ gán promotion khỏi sản phẩm/danh mục.")
coupon="code, description?, type, value, min_order_amount?, max_discount_amount?, start_date, end_date, usage_limit_per_user?, usage_limit_per_coupon?, is_active"
add("Mã giảm giá","GET","/coupons/","Không","Query tùy chọn: is_active, active_now, search","200: Coupon[]","200","Liệt kê coupon công khai theo filter.")
add("Mã giảm giá","POST","/coupons/","Bearer JWT + admin","JSON: "+coupon,"201: Coupon","201, 400, 401/403","Tạo coupon; code được chuẩn hóa uppercase.")
for m, inp, out, sts, desc in [("GET","Path: id:int","200: Coupon","200, 404, 401/403","Lấy coupon (admin)."),("PUT","Path: id:int; JSON: "+coupon,"200: Coupon","200, 400, 404, 401/403","Cập nhật toàn bộ coupon."),("PATCH","Path: id:int; JSON: các trường coupon cần đổi","200: Coupon","200, 400, 404, 401/403","Cập nhật một phần coupon."),("DELETE","Path: id:int","204: empty","204, 404, 401/403","Xóa coupon.")]: add("Mã giảm giá",m,"/coupons/{id}/","Bearer JWT + admin",inp,out,sts,desc)
add("Mã giảm giá","POST","/coupons/validate/","Bearer JWT","JSON: code:string","200: {is_valid,message,discount_amount?,coupon_id?,final_amount?}","200, 400, 401","Kiểm tra coupon cho người dùng hiện tại.")
add("Lịch sử coupon","GET","/coupons/usage/","Bearer JWT + admin","Query tùy chọn: coupon_id, user_id, order_id","200: CouponUsage[]","200, 401/403","Xem lịch sử dùng coupon.")
add("Đánh giá","GET","/reviews/","Không hoặc Bearer JWT + admin","Query: product_id?, status? (status chỉ admin)","200: Review[]","200, 401/403","Danh sách review public; admin có thể lọc trạng thái.")
add("Đánh giá","POST","/reviews/","Bearer JWT","JSON: product:int, order:int, rating?:1..5, comment? (cần rating hoặc comment)","201: Review","201, 400, 401","Tạo review; service kiểm tra quyền sở hữu order và sản phẩm trong order.")
add("Đánh giá","GET","/reviews/{id}/","Công khai; owner/admin xem được","Path: id:int","200: Review","200, 404, 401/403","Xem chi tiết review.")
add("Đánh giá","PUT","/reviews/{id}/","Bearer JWT (owner hoặc admin)","Path: id:int; JSON: rating?, comment?","200: Review","200, 400, 404, 401/403","Cập nhật nội dung review.")
add("Đánh giá","PATCH","/reviews/{id}/","Bearer JWT (owner hoặc admin)","Path: id:int; JSON: rating?, comment?","200: Review","200, 400, 404, 401/403","Cập nhật một phần review.")
add("Đánh giá","DELETE","/reviews/{id}/","Bearer JWT (owner hoặc admin)","Path: id:int","204: empty","204, 404, 401/403","Xóa review.")
add("Đánh giá","PATCH","/admin/reviews/{id}/status/","Bearer JWT + admin","Path: id:int; JSON: status (ReviewStatus)","200: Review","200, 400, 404, 401/403","Đổi trạng thái duyệt/ẩn review.")

# Orders/payments
order="delivery_address?, shipping_method?, payment_method?, customer_note?, selected_coupons?; user/tổng tiền/status/items do service tính"
add("Đơn hàng","GET","/orders/","Bearer JWT","Query tùy chọn (admin): user_id, status; user thường chỉ thấy đơn của mình","200: Order[]","200, 401, 403","Liệt kê đơn; admin thấy tất cả, khách thấy đơn của mình.")
add("Đơn hàng","POST","/orders/","Bearer JWT","JSON: "+order,"201: Order (có thể có vnpay_payment_url)","201, 400, 401","Tạo đơn từ giỏ hàng; xử lý shipping/coupon/payment.")
add("Đơn hàng","GET","/orders/{id}/","Bearer JWT (owner/admin)","Path: id:int","200: Order","200, 404, 401/403","Chi tiết đơn và order_items.")
add("Đơn hàng","PATCH","/orders/{id}/","Bearer JWT (admin; owner tùy logic)","Path: id:int; JSON: current_status?, admin_note?, customer_note?","200: Order","200, 400, 404, 401/403","Cập nhật một phần đơn/trạng thái theo service.")
add("Đơn hàng","POST","/orders/{id}/","Bearer JWT","Path: id:int; JSON theo OrderSerializer","200: Order","200, 400, 404, 401","Endpoint POST detail được triển khai; dùng cập nhật theo logic view.")
add("Đơn hàng","DELETE","/orders/{id}/","Bearer JWT","Path: id:int","204: empty","204, 404, 401","Xóa/hủy đơn theo logic view.")
add("Đơn hàng","POST","/orders/temporary/","Bearer JWT","JSON: cart_items:[{id,quantity,price}], delivery_address?, shipping_method?, coupon_code?","200: dữ liệu báo giá/tạm tính","200, 400, 401","Tính thông tin đơn tạm trước checkout; không tạo order chính thức.")
add("Đơn hàng","POST","/orders/{id}/cancel/","Bearer JWT (owner/admin)","Path: id:int; JSON: reason?","200: Order/CancelledOrder","200, 400, 404, 401/403","Hủy đơn nếu trạng thái cho phép.")
add("Đơn hàng","POST","/orders/{id}/process/","Bearer JWT (admin)","Path: id:int; JSON: status_code?, note?","200: Order","200, 400, 404, 401/403","Xử lý/chuyển trạng thái đơn.")
add("Đơn hàng","GET","/orders/{id}/history/","Bearer JWT (owner/admin)","Path: id:int","200: OrderHistory[]","200, 404, 401/403","Lịch sử thay đổi trạng thái.")
status_fields="status_code, status_name, description"
crud("Trạng thái đơn","/order-statuses/","GET công khai; ghi Bearer JWT + admin","OrderStatus",status_fields)
shipping="method_code, method_name, base_cost?, description, is_active?"
add("Vận chuyển","GET","/shipping-methods/","Bearer JWT","—","200: ShippingMethod[]","200, 401","Liệt kê phương thức vận chuyển; implementation hiện yêu cầu đăng nhập.")
add("Vận chuyển","POST","/shipping-methods/","Bearer JWT","JSON: "+shipping,"201: ShippingMethod","201, 400, 401","Tạo shipping method (implementation không kiểm tra admin).")
for m, inp, out, sts, desc in [("GET","Path: id:int","200: ShippingMethod","200, 404, 401/403","Lấy shipping method (admin)."),("PUT","Path: id:int; JSON: "+shipping,"200: ShippingMethod","200, 400, 404, 401/403","Cập nhật shipping method."),("DELETE","Path: id:int","204: empty","204, 404, 401/403","Xóa shipping method.")]: add("Vận chuyển",m,"/shipping-methods/{id}/","Bearer JWT + admin",inp,out,sts,desc)
add("Giao hàng","GET","/delivery-methods/","Không","—","200: DeliveryMethod[] {id,name,description,code}","200","Danh sách phương thức giao hàng.")
add("Thanh toán","GET","/payment-methods/","Không","—","200: PaymentMethod[]","200, 500","Danh sách payment method active.")
add("Thanh toán","GET","/payments/","Bearer JWT","Query bắt buộc: order_id:int","200: Payment[]","200, 400, 401, 500","Danh sách payment theo order_id; view không kiểm tra rõ quyền sở hữu order.")
add("Thanh toán","POST","/payments/","Bearer JWT","JSON: order, status, method, transaction_id?, gateway_response?, amount, paid_at?","201: Payment","201, 400, 401, 500","Tạo payment cho order.")
add("Thanh toán","POST","/process-payment/","Không (callback VNPAY)","Payload/query callback VNPAY (vnp_*); xác thực chữ ký do service","200: payload bổ sung paid_at,total_amount,description","200, 400, 404, 500","Xử lý phản hồi VNPAY và cập nhật payment.")

SCHEMAS = [
 ["User", "id (RO), name, email, phone_number, password (write-only)"],
 ["Supplier", "id/slug (RO); company_name, contact_person, email, phone_number, address, tax_id, status, website, started_at"],
 ["Category", "id/slug (RO); name, description, image_url, parent, subcategories (RO)"],
 ["Product", "id/slug/supplier_details/stock (RO); supplier, name, description, cost_price, price, sale_price, is_published (RO), publish_at, image_url, category_id (write-only)"],
 ["ProductVariant", "id/details/timestamps (RO); product, size?, color?, sku, stock, image_url?, weight_grams, is_active"],
 ["DeliveryAddress", "id/user/timestamps (RO); recipient_name, is_default, name, province_city, district, ward_commune, specific_address, phone_number; *_details (RO)"],
 ["CartItem", "id/variant_details/item_total_price/available_variants/timestamps (RO); variant (write-only), quantity"],
 ["Promotion", "id/current_usage/applied_*_ids/timestamps (RO); name, description, type, value, start_date, end_date, max_discount_amount, min_order_amount, usage_limit, priority, is_active"],
 ["Coupon", "id/current_usage (RO); code, description, type, value, min_order_amount, max_discount_amount, start_date, end_date, usage_limit_per_user, usage_limit_per_coupon, is_active"],
 ["Review", "id/user/details/status/timestamps (RO); product (write-only), order (write-only), rating?, comment?"],
 ["Order", "id/order_code/user/details/totals/timestamps/promotion/discount/selected_coupons/vnpay_payment_url/order_items (RO); delivery_address?, shipping_method?, payment_method?, current_status?, customer_note?, admin_note?"],
 ["Payment", "id/timestamps/status_details/method_details (RO); order, status, method, transaction_id?, gateway_response?, amount, paid_at?"],
]

def col(n):
    name = ""
    while n:
        n, rem = divmod(n - 1, 26)
        name = chr(65 + rem) + name
    return name

def xlsx_sheet(rows):
    data = []
    for r, row in enumerate(rows, 1):
        cells = []
        for c, value in enumerate(row, 1):
            text = escape(str(value)).replace("\n", "&#10;")
            style = ' s="1"' if r == 1 else ' s="2"'
            cells.append(f'<c r="{col(c)}{r}" t="inlineStr"{style}><is><t xml:space="preserve">{text}</t></is></c>')
        data.append(f'<row r="{r}">' + ''.join(cells) + '</row>')
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="18"/><cols><col min="1" max="20" width="34" customWidth="1"/></cols><sheetData>' + ''.join(data) + '</sheetData><autoFilter ref="A1:H1"/></worksheet>'

def create_xlsx(path, sheets):
    workbook_sheets = ''.join(f'<sheet name="{escape(name)}" sheetId="{i}" r:id="rId{i}"/>' for i, (name, _) in enumerate(sheets, 1))
    rels = ''.join(f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>' for i in range(1, len(sheets) + 1))
    types = ''.join(f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' for i in range(1, len(sheets) + 1))
    styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="10"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="10"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1F4E78"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="3"><xf xfId="0"/><xf fontId="1" fillId="2" xfId="0" applyFont="1" applyFill="1"/><xf xfId="0" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf></cellXfs></styleSheet>'
    with ZipFile(path, 'w', ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' + types + '</Types>')
        z.writestr('_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
        z.writestr('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + workbook_sheets + '</sheets></workbook>')
        z.writestr('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + rels + f'<Relationship Id="rId{len(sheets)+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>')
        z.writestr('xl/styles.xml', styles)
        for i, (_, rows) in enumerate(sheets, 1): z.writestr(f'xl/worksheets/sheet{i}.xml', xlsx_sheet(rows))

def main():
    OUT.mkdir(exist_ok=True)
    headers=["Nhóm","Method","Endpoint","Xác thực / quyền","Đầu vào (path/query/body)","Đầu ra thành công","HTTP status chính","Mô tả / lưu ý"]
    notes=[["Nội dung", "Giá trị"], ["Nguồn", "Đọc trực tiếp các URL, views và serializers trong backend/; không suy đoán từ frontend."], ["Base URL", BASE], ["JWT", "Các endpoint yêu cầu đăng nhập dùng IsAuthenticated; gửi Authorization: Bearer <access_token>. Login/refresh còn dùng cookies access/refresh."], ["RO", "Read-only: trường chỉ có trong response hoặc do server tự gán."], ["Upload ảnh", "Category/Product khai báo MultiPartParser, FormParser và JSONParser; gửi multipart/form-data khi image_url là file."], ["Phạm vi", f"{len(R)} operation được expose trong urlpatterns. PaymentStatusListAPIView và OrderDeleteAPIView có code nhưng không có URL, nên không đưa vào endpoints."], ["Swagger", BASE + "/swagger/schema (giao diện Swagger UI theo core/urls.py)."]]
    create_xlsx(OUT / "viberstore_api_catalog.xlsx", [("Danh sách API", [headers] + R), ("Schema", [["Schema", "Fields / quy ước"]] + SCHEMAS), ("Ghi chú", notes)])
    print(f"Created {OUT / 'viberstore_api_catalog.xlsx'} with {len(R)} API operations")

if __name__ == "__main__": main()
