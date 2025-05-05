function formatCurrencyVN(input) {
  if (typeof input == "number") {
    // Sử dụng Intl.NumberFormat để định dạng số
    const formattedNumber = new Intl.NumberFormat("vi-VN").format(input);

    // Thêm hậu tố "đ" và trả về
    return `${formattedNumber} đ`;
  }

  // Chuyển input thành số
  const number = parseFloat(input);
  // Kiểm tra nếu không phải là số thì trả về chuỗi rỗng
  if (isNaN(number)) return "";
  // Chuyển số thành chuỗi và tách phần thập phân (nếu có)
  let [integerPart] = number.toFixed(0).split(".");
  // Thêm dấu chấm phân cách hàng nghìn
  let formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  // Thêm ký tự "đ" vào cuối chuỗi
  return `${formatted}đ`;
}
export default formatCurrencyVN;
