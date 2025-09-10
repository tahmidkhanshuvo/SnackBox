import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Input,
  Button,
  Select,
  Divider,
  Segmented,
  message,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
} from "@ant-design/icons";

const { Option } = Select;

export default function LoginAndSignUp() {
  // toggle: "login" | "signup"
  const [mode, setMode] = useState("login");

  // Login fields
  const [loginName, setLoginName] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRole, setLoginRole] = useState("customer");

  // Sign up fields
  const [role, setRole] = useState("customer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const users = useMemo(
    () => JSON.parse(localStorage.getItem("users") || "[]"),
    []
  );

  // --- LOGIN ---
  const onLogin = () => {
    if (!loginName || !loginEmail || !loginPhone || !loginPassword) {
      message.error("Please fill in name, email, phone, and password.");
      return;
    }

    const list = JSON.parse(localStorage.getItem("users") || "[]");
    const found = list.find(
      (u) =>
        (u.name || "").trim().toLowerCase() ===
          loginName.trim().toLowerCase() &&
        (u.email || "").trim().toLowerCase() ===
          loginEmail.trim().toLowerCase() &&
        (u.phone || "").trim() === loginPhone.trim() &&
        u.password === loginPassword &&
        u.role === loginRole
    );

    if (!found) {
      message.error("No account found with these details or wrong role.");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(found));
    message.success(`Welcome back, ${found.firstName || found.name || "User"}!`);

    if (loginRole === "admin") navigate("/admin", { replace: true });
    else if (loginRole === "staff") navigate("/staff", { replace: true });
    else navigate("/customer", { replace: true });
  };

  // --- SIGN UP ---
  const onCreate = () => {
    if (!firstName || !lastName || !email || !phone || !password) {
      message.error("Please fill in all fields.");
      return;
    }

    const list = JSON.parse(localStorage.getItem("users") || "[]");
    const emailExists =
      list.findIndex(
        (u) => (u.email || "").toLowerCase() === email.trim().toLowerCase()
      ) !== -1;

    if (emailExists) {
      message.error("Email already registered. Please login instead.");
      return;
    }

    // Persist with both split + combined names (keeps compatibility with your earlier code)
    const newUser = {
      role,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: `${firstName.trim()} ${lastName.trim()}`,
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password,
      createdAt: new Date().toISOString(),
    };

    list.push(newUser);
    localStorage.setItem("users", JSON.stringify(list));
    message.success("Account created successfully! Please sign in.");

    // Prefill login from signup
    setMode("login");
    setLoginName(newUser.name);
    setLoginEmail(newUser.email);
    setLoginPhone(newUser.phone);
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#FFF8EE] px-4">
      <Card className="w-full max-w-[560px] shadow-xl rounded-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl">
            🍽️
          </div>
          <h1 className="text-3xl font-semibold mt-3">SNACKBOX</h1>
          <p className="text-gray-500">AI-Powered Canteen Management System</p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-6">
          <Segmented
            size="large"
            options={[
              { label: "Login", value: "login" },
              { label: "Sign Up", value: "signup" },
            ]}
            value={mode}
            onChange={setMode}
          />
        </div>

        {/* CONTENT */}
        {mode === "login" ? (
          <>
            <div className="grid gap-3">
              <Input
                size="large"
                prefix={<UserOutlined />}
                placeholder="Full Name"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
              />
              <Input
                size="large"
                prefix={<MailOutlined />}
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <Input
                size="large"
                prefix={<PhoneOutlined />}
                placeholder="Phone Number"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
              />
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <Select
                size="large"
                value={loginRole}
                onChange={setLoginRole}
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
              <Button type="link" onClick={() => setMode("signup")}>
                Create an account
              </Button>
            </div>
          </>
        ) : (
          <>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  size="large"
                  prefix={<UserOutlined />}
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                  size="large"
                  prefix={<UserOutlined />}
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

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
              <Button type="link" onClick={() => setMode("login")}>
                Go to Login
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
