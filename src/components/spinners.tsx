// components/LoadingSpinner.tsx
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const LoadingSpinner = () => {
  const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        minHeight: "200px",
      }}
    >
      <Spin indicator={antIcon} tip="Loading..." />
    </div>
  );
};

export default LoadingSpinner;
