const express = require("express");
const Project = require("../models/Project");
const { auth } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/projects - Get all projects for user
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = "-createdAt" } = req.query;

    const projects = await Project.find({ userId: req.user._id })
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select("name description createdAt updatedAt");

    const total = await Project.countDocuments({ userId: req.user._id });

    res.json({
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// POST /api/projects - Create new project
router.post("/", async (req, res) => {
  try {
    const { name, description, sceneData, components, wires, settings } =
      req.body;

    if (!name) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const project = new Project({
      userId: req.user._id,
      name,
      description,
      sceneData: sceneData || {},
      components: components || [],
      wires: wires || [],
      settings: settings || {},
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create project" });
  }
});

// GET /api/projects/:id - Get single project
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// PUT /api/projects/:id - Update project
router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      description,
      sceneData,
      components,
      wires,
      calculations,
      settings,
      isPublic,
      tags,
    } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Update fields if provided
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (sceneData) project.sceneData = sceneData;
    if (components) project.components = components;
    if (wires) project.wires = wires;
    if (calculations) project.calculations = calculations;
    if (settings) project.settings = settings;
    if (isPublic !== undefined) project.isPublic = isPublic;
    if (tags) project.tags = tags;

    await project.save();
    res.json(project);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update project" });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// GET /api/projects/search/:query - Search projects
router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params;

    const projects = await Project.find({
      userId: req.user._id,
      $text: { $search: query },
    }).select("name description createdAt");

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;
