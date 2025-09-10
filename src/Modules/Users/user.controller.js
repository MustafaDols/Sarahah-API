import { Router } from "express";
import * as userServices from "./Services/user.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middleware.js";
import { autraizationMiddleware } from "../../Middlewares/authorization.middleware.js";
import { RoleEnum } from "../../Common/enums/user.enum.js";
import { SignUpSchema } from "../../Validators/Schemas/user.schema.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { rateLimit } from "express-rate-limit";

const router = Router();

//limiter
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // limit each IP to 100 requests per windowMs 
    message: "Too many requests from this IP, please try again after 15 minutes",
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
})
router.use(generalLimiter)

//auth limiter
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // limit each IP to 5 requests per windowMs 
    message: "Too many requests from this IP, please try again after 15 minutes",
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
})


//Authentication Routes
router.post("/signup", authLimiter, validationMiddleware(SignUpSchema), userServices.signUpService);
router.post("/signin", authLimiter, userServices.signinService);
router.put("/confirm", userServices.confirmEmailService)
router.post("/logout", authenticationMiddleware, userServices.LogoutService);
router.post("/refresh-token", userServices.RefreshTokenService);
router.post("/auth-gmail", userServices.authServiceWithGemail);

//Account Routes
router.put("/update", authenticationMiddleware, userServices.updateAccountService);
router.delete("/delete/:userId", authenticationMiddleware, userServices.deleteAccountService);
router.put("/updatePassword", authenticationMiddleware, userServices.updatePasswordServices);

//Admin Routes
router.get("/list", authenticationMiddleware, autraizationMiddleware([RoleEnum.super_admin, RoleEnum.admin]), userServices.listUsersService);

export default router;


