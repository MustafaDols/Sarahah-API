import { Router } from "express";
import * as userServices from "./Services/user.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middleware.js";
const router = Router();


router.post("/signup", userServices.signUpService);
router.post("/signin", userServices.signinService);
router.post("/logout",authenticationMiddleware, userServices.LogoutService);
router.put("/update", authenticationMiddleware , userServices.updateAccountService);
router.post("/refresh-token", userServices.RefreshTokenService);

router.delete("/delete/:userId",authenticationMiddleware, userServices.deleteAccountService);
router.get("/list", userServices.listUsersService);
router.put("/confirm", userServices.confirmEmailService)

export default router;


