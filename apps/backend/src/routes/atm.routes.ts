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

router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

// Endpoints específicos para ATMs
router.get(
  "/:id/maintenance-history",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

router.get(
  "/:id/status",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

export default router;
