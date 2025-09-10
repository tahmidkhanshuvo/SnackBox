import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Input, Button, Select, Divider, message } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
} from "@ant-design/icons";

const { Option } = Select;

export default function Login() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const navigate = useNavigate();

  const onLogin = () => {
    if (!name || !email || !phone || !password) {
      message.error("Please fill in name, email, phone, and password.");
      return;
    }
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const matchedUser = users.find(
      (u) =>
        u.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        u.email.trim().toLowerCase() === email.trim().toLowerCase() &&
        u.phone.trim() === phone.trim() &&
        u.password === password &&
        u.role === role
    );

    if (!matchedUser) {
      message.error("No account found with these details or wrong role.");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(matchedUser));
    message.success(`Welcome back, ${matchedUser.name.split(" ")[0]}!`);

    if (role === "admin") navigate("/admin", { replace: true });
    else if (role === "staff") navigate("/staff", { replace: true });
    else navigate("/customer", { replace: true });
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#FFF8EE] px-4">
      <Card className="w-full max-w-[440px] shadow-xl rounded-2xl">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold">
            🍽️
          </div>
          <h1 className="text-2xl font-semibold mt-3">SNACKBOX</h1>
          <p className="text-gray-500">AI-Powered Canteen Management System</p>
        </div>

        <div className="grid gap-3">
          <Input
            size="large"
            prefix={<UserOutlined />}
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            size="large"
            prefix={<MailOutlined />}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            size="large"
            prefix={<PhoneOutlined />}
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Select
            size="large"
            value={role}
            onChange={setRole}
            className="w-full"
          >
            <Option value="admin">Admin</Option>
            <Option value="staff">Staff</Option>
            <Option value="customer">Customer</Option>
          </Select>

          <Button type="primary" size="large" onClick={onLogin} block>
            Sign In
          </Button>
        </div>

        <Divider plain>New here?</Divider>
        <div className="text-center">
          <span className="text-gray-600">Create an account: </span>
          <Link to="/signup">Sign Up</Link>
        </div>
      </Card>
    </div>
  );
}
