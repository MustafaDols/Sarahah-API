import { Router } from "express";
import { signUpService } from './Services/user.service.js';
import { signinService } from './Services/user.service.js';
import { updateAccountService } from './Services/user.service.js';
import { deleteAccountService } from './Services/user.service.js';

const router = Router();


router.post("/signup", signUpService);
router.post("/signin", signinService);
router.put("/update/:userId", updateAccountService);
router.delete("/delete/:userId", deleteAccountService);

export default router;

