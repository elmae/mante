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

// Endpoints específicos para SLAs
router.get(
  "/zone/:zoneId",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

router.get(
  "/client/:clientId",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

router.get(
  "/:id/compliance",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

router.post(
  "/:id/exceptions",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: "No implementado" });
  })
);

export default router;
