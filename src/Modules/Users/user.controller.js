import { Router } from "express";
import * as userServices from "./Services/user.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middleware.js";
import { autraizationMiddleware } from "../../Middlewares/authorization.middleware.js";
import { RoleEnum } from "../../Common/enums/user.enum.js";
import { SignUpSchema } from "../../Validators/Schemas/user.schema.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { authLimiter } from "../../Middlewares/rate-limiter.middleware.js";
import { localUpload, hostUpload } from "../../Middlewares/multer.middleware.js";

const router = Router();



//Authentication Routes
router.post("/signup", authLimiter, validationMiddleware(SignUpSchema), userServices.signUpService); 
router.post("/signin", authLimiter, userServices.signinService); 
router.put("/confirm", userServices.confirmEmailService) 
router.post("/logout", authenticationMiddleware, userServices.LogoutService); 
router.post("/refresh-token", userServices.RefreshTokenService); 
router.delete("/deletExpiredTokens", userServices.deleteExpiredTokensService);
router.post("/auth-gmail", userServices.authServiceWithGemail);

//Account Routes
router.put("/update", authenticationMiddleware, userServices.updateAccountService); 
router.delete("/delete/:userId", authenticationMiddleware, userServices.deleteAccountService);
router.put("/updatePassword", authenticationMiddleware, userServices.updatePasswordService); 
router.put("/resetPassword", userServices.resetPasswordService); 
router.put("/forgotPassword", userServices.forgotPasswordService); 
router.post("/upload-profile", authenticationMiddleware, hostUpload({}).single("profile"), userServices.uploadProfileService); 
router.delete("/delete-profile", userServices.deleteFromCloudinaryService);
router.delete("/delete-profile-from-cloudinary", userServices.deleteFromCloudinaryService);

//Admin Routes
router.get("/list", authenticationMiddleware, autraizationMiddleware([RoleEnum.super_admin, RoleEnum.admin]), userServices.listUsersService);

export default router;


 