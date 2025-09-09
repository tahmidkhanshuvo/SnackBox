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

export default function SignUp() {
  const [role, setRole] = useState("customer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onCreate = () => {
    if (!name || !email || !phone || !password) {
      message.error("Please fill in all fields.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const exists =
      users.findIndex(
        (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
      ) !== -1;

    if (exists) {
      message.error("Email already registered. Please login instead.");
      return;
    }

    const newUser = {
      role,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    message.success("Account created successfully! Please sign in.");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#FFF8EE] px-4">
      <Card className="w-full max-w-[480px] shadow-xl rounded-2xl">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold">
            🍽️
          </div>
          <h1 className="text-2xl font-semibold mt-3">Create Account</h1>
          <p className="text-gray-500">Join SnackBox to order smarter</p>
        </div>

        <div className="grid gap-3">
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

          <Input
            size="large"
            prefix={<UserOutlined />}
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            size="large"
            prefix={<PhoneOutlined />}
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            size="large"
            prefix={<MailOutlined />}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="primary" size="large" onClick={onCreate} block>
            Create Account
          </Button>
        </div>

        <Divider plain>Already have an account?</Divider>
        <div className="text-center">
          <Link to="/">Back to Login</Link>
        </div>
      </Card>
    </div>
  );
}
