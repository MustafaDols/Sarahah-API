import { Router } from "express";
import * as messageServices from "./Services/message.service.js";
const router = Router();


router.post("/send/:receiverId", messageServices.sendMessageService) 
router.get("/get/:receiverId", messageServices.getMessagesService)





export default router;