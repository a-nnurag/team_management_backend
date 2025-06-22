import { Router } from "express";
import { joinWorkSpaceController } from "../controllers/member.controller.js";

const memberRoutes = Router();

memberRoutes.post("/workspace/:inviteCode/join", joinWorkSpaceController);

export default memberRoutes;
// e21117f0
