import { Layout, Menu, Button } from "antd";
import {
  HomeOutlined,
  SettingOutlined,
  LogoutOutlined,
  BookOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { Modal } from "antd";
import { useState } from "react";

const { Sider } = Layout;

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const handleLogout = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
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
    if (path.includes("/dashboard")) return "home";
    if (path.includes("/settingscreen")) return "profile";
    if (path.includes("/study-material")) return "StudyMaterial";
    return "home";
  };

  return (
    <Sider
      width={200}
      collapsedWidth={60}
      collapsible
      collapsed={collapsed}
      trigger={null}
      style={{
        background: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "120vh",
        position: "relative",
        borderRight: "1px solid #f0f0f0",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div style={{ width: "100%" }}>
        {/* Collapse Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "16px 16px 8px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </div>

        {/* Menu Items with bottom padding */}
        <div style={{ paddingBottom: "20px" }}>
          <Menu
            mode="inline"
            theme="light"
            inlineCollapsed={collapsed}
            selectedKeys={[getSelectedKey()]} // Set the active menu item
            items={[
              {
                key: "home",
                icon: <HomeOutlined style={{ fontSize: "20px" }} />,
                label: "Dashboard",
                onClick: () => navigate("/dashboard"),
                style: {
                  backgroundColor: location.pathname.includes("/dashboard")
                    ? "rgba(102, 51, 153, 0.1)"
                    : "transparent",
                  borderLeft: location.pathname.includes("/dashboard")
                    ? "purple"
                    : "none",
                },
              },
              {
                key: "profile",
                icon: <SettingOutlined style={{ fontSize: "20px" }} />,
                label: "Settings",
                onClick: () => navigate("/settingscreen"),
                style: {
                  backgroundColor: location.pathname.includes("/settingscreen")
                    ? "rgba(102, 51, 153, 0.1)"
                    : "transparent",
                  borderLeft: location.pathname.includes("/settingscreen")
                    ? "purple"
                    : "none",
                },
              },
              {
                key: "StudyMaterial",
                icon: <BookOutlined style={{ fontSize: "20px" }} />,
                label: "Study Material",
                onClick: () => navigate("/study-material"),
                style: {
                  backgroundColor: location.pathname.includes("/study-material")
                    ? "rgba(102, 51, 153, 0.1)"
                    : "transparent",
                  borderLeft: location.pathname.includes("/study-material")
                    ? "purple"
                    : "none",
                },
              },
            ]}
          />
        </div>
      </div>
      <div
        style={{
          padding: "16px",
          textAlign: "center",
          marginTop: "auto",
          paddingBottom: "24px",
        }}
      >
        <Button
          type="text"
          icon={<LogoutOutlined style={{ fontSize: "16px" }} />}
          onClick={handleLogout}
          style={{
            width: "100%",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "8px",
            padding: collapsed ? "0" : "0 16px",
          }}
        >
          {!collapsed && "Logout"}
        </Button>
        <Modal
          title="Confirm Logout"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <p>Are you sure you want to logout?</p>
        </Modal>
      </div>
    </Sider>
  );
};

export default AppSidebar;
