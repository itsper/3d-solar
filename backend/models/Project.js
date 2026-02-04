const mongoose = require("mongoose");

const wireSchema = new mongoose.Schema(
  {
    id: String,
    fromComponentId: {
      type: String,
      required: true,
    },
    toComponentId: {
      type: String,
      required: true,
    },
    wireType: {
      type: String,
      enum: ["dc", "ac"],
      default: "dc",
    },
  },
  { _id: false },
);

const calculationResultSchema = new mongoose.Schema(
  {
    totalPanelWattage: Number,
    totalPanelCount: Number,
    inverterCapacity: Number,
    batteryCapacity: Number,
    systemVoltage: Number,
    estimatedDailyProduction: Number,
    monthlyProduction: [Number],
    warnings: [String],
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    // Scene data for 3D objects
    sceneData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Component metadata
    components: [
      {
        id: String,
        type: {
          type: String,
          enum: ["solarPanel", "inverter", "battery", "roof", "wall", "wire"],
        },
        name: String,
        position: [Number],
        rotation: [Number],
        scale: [Number],
        properties: mongoose.Schema.Types.Mixed,
      },
    ],
    // Wiring connections
    wires: [wireSchema],
    // Solar calculation results
    calculations: calculationResultSchema,
    // Project settings
    settings: {
      gridSize: {
        type: Number,
        default: 0.5,
      },
      snapEnabled: {
        type: Boolean,
        default: true,
      },
      voltage: {
        type: Number,
        default: 48,
      },
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
projectSchema.index({ userId: 1, createdAt: -1 });
projectSchema.index({ userId: 1, name: "text" });

module.exports = mongoose.model("Project", projectSchema);
