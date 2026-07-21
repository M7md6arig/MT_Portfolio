import { Router } from "express";
import { authRouter } from "./auth.routes";
import { contactRouter } from "./contact.routes";
import { contentRouter } from "./content.routes";
import { projectRouter } from "./project.routes";
import { settingsRouter } from "./settings.routes";

export const apiRouter = Router();

apiRouter.use("/projects", projectRouter);
apiRouter.use("/contact", contactRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/settings", settingsRouter);
apiRouter.use("/", contentRouter); // GET /services, GET /social-links
