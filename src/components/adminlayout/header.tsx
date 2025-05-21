import {
  Layout,
  Typography,
  Avatar,
  Dropdown,
  MenuProps,
  Space,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import {
  UserOutlined,
  CheckOutlined,
  EditOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;
const { Title, Text } = Typography;

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  metaInfo?: string;
}

interface UserProfile {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  countrycode: string;
  mobileno: string;
  status: string;
  role: string;
  change_password: boolean;
}

const AppHeader = ({ title, subtitle = "INSTITUTION" }: AppHeaderProps) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://13.233.33.133:3001/api/users/myprofile",
          {
            headers: { token: token || "" },
          }
        );
        setUserProfile(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    switch (e.key) {
      case "edit-profile":
        // Optional: Implement edit profile navigation
        break;
      case "change-password":
        setPasswordModalVisible(true);
        break;
      case "logout":
        localStorage.removeItem("token");
        navigate("/login");
        break;
      default:
        break;
    }
    setDropdownVisible(false);
  };

  const handlePasswordChange = async (values: any) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://13.233.33.133:3001/api/users/changePassword",
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        {
          headers: { token: token || "" },
        }
      );
      message.success("Password changed successfully. Please log in again.");
      setPasswordModalVisible(false);
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Password change error:", error);
      message.error(
        "Failed to change password. Please check the current password."
      );
    }
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "user-info",
      label: (
        <Space direction="vertical" size={0} style={{ padding: "12px 16px" }}>
          <Text strong style={{ fontSize: 16 }}>
            {userProfile
              ? `${userProfile.firstname.charAt(
                  0
                )}${userProfile.lastname.charAt(0)}`
              : "UU"}
          </Text>
          <Text strong>
            {userProfile
              ? `${userProfile.firstname} ${userProfile.lastname}`
              : "User Name"}
          </Text>
          <Text type="secondary">
            {userProfile?.email || "user@example.com"}
          </Text>
        </Space>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "edit-profile",
      icon: <CheckOutlined />,
      label: "Edit Profile",
    },
    ...(userProfile?.change_password === true
      ? [
          {
            key: "change-password",
            icon: <EditOutlined />,
            label: "Change Password",
          },
        ]
      : []),
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  return (
    <>
      <Header
        style={{
          background: "white",
          padding: "0 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "64px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Title level={4} style={{ color: "black", margin: 0 }}>
            {title}
          </Title>
          <Title
            level={5}
            style={{ color: "black", margin: 0, fontWeight: "normal" }}
          >
            {subtitle}
          </Title>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {!loading && (
            <Dropdown
              menu={{ items: menuItems, onClick: handleMenuClick }}
              placement="bottomRight"
              trigger={["click"]}
              open={dropdownVisible}
              onOpenChange={setDropdownVisible}
              overlayStyle={{ minWidth: 220 }}
            >
              <Space style={{ cursor: "pointer", padding: "8px" }}>
                <Avatar
                  size="large"
                  style={{
                    backgroundColor: "grey",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                  }}
                >
                  {userProfile ? (
                    `${userProfile.firstname.charAt(
                      0
                    )}${userProfile.lastname.charAt(0)}`
                  ) : (
                    <UserOutlined />
                  )}
                </Avatar>
              </Space>
            </Dropdown>
          )}
        </div>
      </Header>

      {/* Change Password Modal */}
      <Modal
        title="Change Password"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        onOk={() => form.submit()}
        okText="Change Password"
      >
        <p style={{ color: "red" }}>
          <strong>Note:</strong> Current Password has been sent to your mailbox.
        </p>
        <Form form={form} layout="vertical" onFinish={handlePasswordChange}>
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[
              { required: true, message: "Please enter current password" },
            ]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please enter new password" },
              { min: 6, message: "Password should be at least 6 characters" },
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AppHeader;
