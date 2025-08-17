// customer.jsx - Customer routes (Laravel-inspired)
import { Hono } from "hono";
import AuthMiddleware from "../middleware/AuthMiddleware.jsx";

const customerRoutes = new Hono();

// Apply authentication middleware to all customer routes
customerRoutes.use("*", AuthMiddleware.authenticate.bind(AuthMiddleware));
customerRoutes.use("*", AuthMiddleware.can(["customer"]).bind(AuthMiddleware));

// Customer dashboard
customerRoutes.get("/dashboard", (c) => {
  const user = c.get("user");
  return c.json({
    success: true,
    data: {
      message: `Welcome ${user.fullName}!`,
      user: {
        name: user.fullName,
        email: user.email,
        role: user.role,
      },
      stats: {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalSpent: 0,
      },
    },
  });
});

// Menu routes
customerRoutes.get("/menu", (c) => {
  // TODO: Implement menu fetching
  return c.json({
    success: true,
    data: {
      message: "Menu endpoint - Coming soon",
      categories: [],
    },
  });
});

customerRoutes.get("/menu/categories", (c) => {
  // TODO: Implement category fetching
  return c.json({
    success: true,
    data: [],
  });
});

customerRoutes.get("/menu/items/:categoryId", (c) => {
  const categoryId = c.req.param("categoryId");
  // TODO: Implement menu items fetching
  return c.json({
    success: true,
    data: {
      categoryId,
      items: [],
    },
  });
});

// Order routes
customerRoutes.get("/orders", (c) => {
  const user = c.get("user");
  // TODO: Implement order history fetching
  return c.json({
    success: true,
    data: {
      orders: [],
    },
  });
});

customerRoutes.post("/orders", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  // TODO: Implement order creation
  return c.json(
    {
      success: true,
      data: {
        message: "Order created successfully",
        orderId: `order_${Date.now()}`,
      },
    },
    201
  );
});

customerRoutes.get("/orders/:orderId", (c) => {
  const orderId = c.req.param("orderId");
  // TODO: Implement specific order fetching
  return c.json({
    success: true,
    data: {
      orderId,
      status: "pending",
    },
  });
});

// Table reservation routes
customerRoutes.get("/reservations", (c) => {
  const user = c.get("user");
  // TODO: Implement reservation history
  return c.json({
    success: true,
    data: {
      reservations: [],
    },
  });
});

customerRoutes.post("/reservations", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  // TODO: Implement table reservation
  return c.json(
    {
      success: true,
      data: {
        message: "Table reserved successfully",
        reservationId: `res_${Date.now()}`,
      },
    },
    201
  );
});

// Customer profile routes
customerRoutes.get("/profile", (c) => {
  const user = c.get("user");
  const { password, ...userProfile } = user;

  return c.json({
    success: true,
    data: userProfile,
  });
});

customerRoutes.put("/profile", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  // TODO: Implement profile update
  return c.json({
    success: true,
    data: {
      message: "Profile updated successfully",
    },
  });
});

export default customerRoutes;
