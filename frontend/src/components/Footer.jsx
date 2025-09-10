import React from "react";
import { Card, Typography } from "antd";

const { Text } = Typography;

const Footer = () => {
  return (
    <Card
      style={{
        backgroundColor: "rgb(178,34,34)",
        color: "#f5f5f0",
        textAlign: "center",
        borderRadius: 0,
      }}
    >
      <Text style={{ color: "#f5f5f0" }}>
        © 2025 SnackBox. All rights reserved.
      </Text>
    </Card>
  );
};

export default Footer;
