import {Router} from 'express';
import { createPod } from "../kubernetes/pod.js";
import { createService } from "../kubernetes/service.js";
import {v7 as uuid} from "uuid";
import { createSandboxKey } from "../config/redis.js";
import { authMiddleware } from '../middlewares/auth.middleware.js';
import projectModel from '../models/project.model.js';

const sandboxRouter = Router();


sandboxRouter.get("/health", (req, res) => {
    res.status(200).json({
        message: "Sandbox API is healthy",
        status: "OK"
    })
});

sandboxRouter.post("/start", authMiddleware, async (req, res) => {
    console.log("SANDBOX START ROUTE HIT");

    const projectId = req.body.projectId;

    const project = await projectModel.findOne({_id: projectId, user: req.user.id});

    if(!project) {
        return res.status(404).json({
            message: "Project not found or access denied"
        });
    }

    const sandboxId = uuid();

    await Promise.all([
        createPod(sandboxId),
        createService(sandboxId),
        createSandboxKey(sandboxId)
    ]);

    return res.status(201).json({
        message: "Sandbox environment created successfully.",
        sandboxId,
        previewUrl: `http://${sandboxId}.preview.localhost`
    })
});

sandboxRouter.post("/project", authMiddleware, async (req, res) => {
    const {title} = req.body;

    const newProject = new projectModel({
        user: req.user.id,
        title
    });

    await newProject.save();

    return res.status(201).json({
        message: "Project created successfully.",
        project: newProject
    });
});

sandboxRouter.get("/projects", authMiddleware, async (req, res) => {
    const projects = await projectModel.find({user: req.user.id});

    return res.status(200).json({
        message: "Projects retrived successfully.",
        projects
    });
});

export default sandboxRouter;