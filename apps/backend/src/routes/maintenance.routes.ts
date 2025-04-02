import { Router, Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

// Endpoints específicos para mantenimientos
router.post(
  "/:id/start",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

router.post(
  "/:id/complete",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

router.post(
  "/:id/parts-used",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

router.get(
  "/:id/diagnosis",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

router.post(
  "/:id/photos",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

export default router;
