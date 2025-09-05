import { Router } from "express";
import * as userServices from "./Services/user.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middleware.js";
import { autraizationMiddleware } from "../../Middlewares/authorization.middleware.js";
import { RoleEnum } from "../../Common/enums/user.enum.js";
import { SignUpSchema } from "../../Validators/Schemas/user.schema.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
const router = Router();

//Authentication Routes
router.post("/signup", validationMiddleware(SignUpSchema), userServices.signUpService);
router.post("/signin", userServices.signinService);
router.put("/confirm", userServices.confirmEmailService)
router.post("/logout", authenticationMiddleware, userServices.LogoutService);
router.post("/refresh-token", userServices.RefreshTokenService);

//Account Routes
router.put("/update", authenticationMiddleware, userServices.updateAccountService);
router.delete("/delete/:userId", authenticationMiddleware, userServices.deleteAccountService);
router.put("/updatePassword", authenticationMiddleware, userServices.updatePasswordServices);

//Admin Routes
router.get("/list", authenticationMiddleware, autraizationMiddleware([RoleEnum.super_admin, RoleEnum.admin]), userServices.listUsersService);

export default router;


