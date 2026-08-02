import express, { Router } from "express"
import { getUser, loginUser, refreshToken, resetUserPassword, userForgotPassword, userRegisteration, verifyUser, verifyUserForgotPassword } from "../controller/auth.controller";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";

const router: Router = express.Router();

router.post("/user-registeration", userRegisteration);
router.post("/login-user", loginUser);

router.post("/verify-user", verifyUser);

router.post("/forgot-user-password", userForgotPassword);
router.post("/reset-password", resetUserPassword);
router.post("/verify-user-forgot-password", verifyUserForgotPassword);

router.post("/refesh-token-user", refreshToken);
router.get("/logged-in-user", isAuthenticated, getUser);

export default router;