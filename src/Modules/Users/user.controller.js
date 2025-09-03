import { Router } from "express";
import * as userServices from "./Services/user.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middleware.js";
import { autraizationMiddleware  } from "../../Middlewares/authorization.middleware.js";
import { RoleEnum } from "../../Common/enums/user.enum.js";
const router = Router();

//Authentication Routes
router.post("/signup", userServices.signUpService);
router.post("/signin", userServices.signinService);
router.put("/confirm", userServices.confirmEmailService)
router.post("/logout",authenticationMiddleware, userServices.LogoutService);
router.post("/refresh-token", userServices.RefreshTokenService);

//Account Routes
router.put("/update", authenticationMiddleware, userServices.updateAccountService);
router.delete("/delete/:userId",authenticationMiddleware, userServices.deleteAccountService);
router.put("/updatePassword", authenticationMiddleware, userServices.updatePasswordServices);

//Admin Routes
router.get("/list",authenticationMiddleware,autraizationMiddleware([RoleEnum.SUPER_ADMIN , RoleEnum.ADMIN]), userServices.listUsersService);

export default router;


