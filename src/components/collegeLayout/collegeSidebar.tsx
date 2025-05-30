import { Layout, Menu, Button } from "antd";
import {
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { Modal } from "antd";
import { useState } from "react";

const { Sider } = Layout;

const CollegeSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const handleLogout = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    // Note: localStorage usage removed for Claude.ai compatibility
    // In your actual implementation, keep the localStorage calls
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/");
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Determine the selected key based on current route
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes("/college/dashboard")) return "home";
    if (path.includes("/college/students")) return "students"; // Fixed path
    if (path.includes("/college/test-results")) return "testResults"; // Fixed path
    return "home";
  };

  const menuItems = [
    {
      key: "home",
      icon: <HomeOutlined style={{ fontSize: "18px" }} />,
      label: "Dashboard",
      onClick: () => navigate("/college/dashboard"),
      style: {
        backgroundColor: location.pathname.includes("/college/dashboard")
          ? "#f0f5ff"
          : "transparent",
        color: location.pathname.includes("/college/dashboard")
          ? "#1890ff"
          : "inherit",
      },
    },
    {
      key: "students",
      icon: <TeamOutlined style={{ fontSize: "18px" }} />,
      label: "All Students",
      onClick: () => navigate("/college/students"), // Fixed navigation path
      style: {
        backgroundColor: location.pathname.includes("/college/students")
          ? "#f0f5ff"
          : "transparent",
        color: location.pathname.includes("/college/students")
          ? "#1890ff"
          : "inherit",
      },
    },
    {
      key: "testResults",
      icon: <FileTextOutlined style={{ fontSize: "18px" }} />,
      label: "Test Results",
      onClick: () => navigate("/college/test-results"), // Fixed navigation path
      style: {
        backgroundColor: location.pathname.includes("/college/test-results")
          ? "#f0f5ff"
          : "transparent",
        color: location.pathname.includes("/college/test-results")
          ? "#1890ff"
          : "inherit",
      },
    },
  ];

  return (
    <Sider
      width={220}
      collapsedWidth={80}
      collapsible
      collapsed={collapsed}
      trigger={null}
      style={{
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
        borderRight: "1px solid #e8e8e8",
        boxShadow: "2px 0 8px 0 rgba(29, 35, 41, 0.05)",
      }}
    >
      <div style={{ width: "100%" }}>
        {/* Collapse Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "16px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
            style={{
              fontSize: "16px",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </div>

        {/* Menu Items */}
        <Menu
          mode="inline"
          theme="light"
          inlineCollapsed={collapsed}
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{
            borderRight: "none",
            padding: "8px 0",
          }}
        />
      </div>

      {/* Logout Button */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <Button
          type="text"
          danger
          icon={<LogoutOutlined style={{ fontSize: "18px" }} />}
          onClick={handleLogout}
          style={{
            width: "100%",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "8px",
            padding: collapsed ? "0" : "0 16px",
            fontWeight: 500,
          }}
        >
          {!collapsed && "Logout"}
        </Button>
        <Modal
          title="Confirm Logout"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          okButtonProps={{ danger: true }}
          okText="Logout"
        >
          <p>Are you sure you want to logout?</p>
        </Modal>
      </div>
    </Sider>
  );
};

export default CollegeSidebar;