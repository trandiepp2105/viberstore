import { createRoot } from "react-dom/client";
const addTemporaryComponent = (component, duration = 5000) => {
  // Tạo một element để chứa component
  const tempDiv = document.createElement("div");
  document.body.appendChild(tempDiv); // Thêm vào body

  // Render component vào tempDiv
  const root = createRoot(tempDiv);

  root.render(component);
  // Xóa component sau khoảng thời gian được chỉ định
  setTimeout(() => {
    root.unmount(); // Unmount root
    document.body.removeChild(tempDiv); // Xóa element khỏi DOM
  }, duration);
};

export default addTemporaryComponent;
