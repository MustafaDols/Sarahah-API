import { Router } from "express";
import * as userServices from "./Services/user.service.js";
const router = Router();


router.post("/signup", userServices.signUpService);
router.post("/signin", userServices.signinService);
router.put("/update/:userId", userServices.updateAccountService);
router.delete("/delete/:userId", userServices.deleteAccountService);
router.get("/list", userServices.listUsersService);
router.put("/confirm",userServices.confirmEmailService) 
 
export default router;


