// auth.jsx - Authentication routes (Hono.js style)
import { Hono } from "hono";
import AuthController from "../controllers/AuthController.jsx";
import AuthMiddleware from "../middleware/AuthMiddleware.jsx";

const authRoutes = new Hono();

// Public authentication routes
authRoutes.post(
  "/register",
  AuthMiddleware.guest,
  AuthController.register.bind(AuthController)
);

authRoutes.post(
  "/login",
  AuthMiddleware.guest,
  AuthController.login.bind(AuthController)
);

// Protected authentication routes
authRoutes.use(
  "/me",
  AuthMiddleware.authenticate.bind(AuthMiddleware)
);
authRoutes.use(
  "/logout",
  AuthMiddleware.authenticate.bind(AuthMiddleware)
);
authRoutes.use(
  "/refresh",
  AuthMiddleware.authenticate.bind(AuthMiddleware)
);

authRoutes.get(
  "/me",
  AuthMiddleware.refreshSession.bind(AuthMiddleware),
  AuthController.me.bind(AuthController)
);

authRoutes.post(
  "/logout",
  AuthController.logout.bind(AuthController)
);

// Health check for auth routes
authRoutes.get("/health", (c) => {
  return c.json({
    success: true,
    message: "Auth routes are working",
    timestamp: new Date().toISOString(),
  });
});

export default authRoutes;
