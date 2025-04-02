import { Router, Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware";

const router = Router();

// Las implementaciones de los controladores se añadirán más adelante
router.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

router.post(
  "/register",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

router.post(
  "/refresh-token",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

router.post(
  "/logout",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

export default router;
