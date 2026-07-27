import express, { Router } from "express"
import { loginUser, resetUserPassword, userForgotPassword, userRegisteration, verifyUser, verifyUserForgotPassword } from "../controller/auth.controller";

const router: Router = express.Router();

router.post("/user-registeration", userRegisteration);
router.post("/login-user", loginUser);

router.post("/verify-user", verifyUser);

router.post("/forgot-user-password", userForgotPassword);
router.post("/reset-password", resetUserPassword);
router.post("/verify-user-forgot-password", verifyUserForgotPassword);

export default router;