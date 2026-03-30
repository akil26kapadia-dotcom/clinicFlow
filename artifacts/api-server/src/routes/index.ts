import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import patientsRouter from "./patients";
import appointmentsRouter from "./appointments";
import treatmentsRouter from "./treatments";
import invoicesRouter from "./invoices";
import staffRouter from "./staff";
import dashboardRouter from "./dashboard";
import reportsRouter from "./reports";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(patientsRouter);
router.use(appointmentsRouter);
router.use(treatmentsRouter);
router.use(invoicesRouter);
router.use(staffRouter);
router.use(dashboardRouter);
router.use(reportsRouter);
router.use(settingsRouter);

export default router;
