import { createRoot } from "react-dom/client";

const addComponent = (component) => {
  // Tạo một element để chứa component
  const tempDiv = document.createElement("div");
  document.body.appendChild(tempDiv); // Thêm vào body

  // Render component vào tempDiv
  const root = createRoot(tempDiv);
  root.render(component);

  // Trả về cả root và tempDiv để dễ dàng xử lý sau
  return { root, tempDiv };
};

const removeComponent = ({ root, tempDiv }) => {
  if (root && tempDiv) {
    root.unmount(); // Unmount root
    document.body.removeChild(tempDiv); // Xóa element khỏi DOM
  }
};

export { addComponent, removeComponent };
