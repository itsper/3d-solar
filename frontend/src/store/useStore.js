import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

// Helper to create component with defaults
const createComponent = (type, position = [0, 0, 0]) => {
  const defaults = {
    solarPanel: {
      name: "Solar Panel",
      wattage: 400,
      voltage: 48,
      efficiency: 0.22,
      width: 2,
      height: 0.05,
      depth: 1,
    },
    inverter: {
      name: "Inverter",
      capacity: 5000,
      inputVoltage: 48,
      outputVoltage: 230,
      efficiency: 0.96,
      width: 0.5,
      height: 0.8,
      depth: 0.3,
    },
    battery: {
      name: "Battery",
      capacity: 5000,
      voltage: 48,
      type: "LiFePO4",
      width: 0.6,
      height: 1.2,
      depth: 0.25,
    },
    roof: {
      name: "Roof",
      color: "#8b4513",
      width: 10,
      height: 0.2,
      depth: 10,
    },
    wall: {
      name: "Wall",
      color: "#f5f5f5",
      width: 4,
      height: 3,
      depth: 0.2,
    },
    wire: {
      name: "Wire",
      color: "#ff6600",
      wireType: "dc",
    },
  };

  return {
    id: uuidv4(),
    type,
    name: defaults[type]?.name || type,
    position,
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    properties: defaults[type] || {},
  };
};

export const useStore = create((set, get) => ({
  // Scene state
  scene: {
    objects: [],
    wires: [],
    selectedObjectId: null,
    mode: "select",
    wireStartComponent: null,
    transformMode: "translate",
  },

  // Project state
  project: {
    id: null,
    name: "Untitled Project",
    description: "",
    isDirty: false,
  },

  // User state
  user: {
    token: localStorage.getItem("token") || null,
    user: null,
    isAuthenticated: !!localStorage.getItem("token"),
  },

  // Settings
  settings: {
    gridSize: 0.5,
    snapEnabled: true,
    showGrid: true,
    showWires: true,
    voltage: 48,
  },

  // Calculation results
  calculations: {
    totalPanelWattage: 0,
    totalPanelCount: 0,
    inverterCapacity: 0,
    batteryCapacity: 0,
    systemVoltage: 48,
    estimatedDailyProduction: 0,
    monthlyProduction: [],
    warnings: [],
  },

  // Object actions
  addObject: (type, position) => {
    const component = createComponent(type, position);
    set((state) => ({
      scene: {
        ...state.scene,
        objects: [...state.scene.objects, component],
      },
      project: {
        ...state.project,
        isDirty: true,
      },
    }));
    get().calculateSystem();
    return component;
  },

  removeObject: (id) => {
    set((state) => ({
      scene: {
        ...state.scene,
        objects: state.scene.objects.filter((obj) => obj.id !== id),
        wires: state.scene.wires.filter(
          (wire) => wire.fromComponentId !== id && wire.toComponentId !== id,
        ),
        selectedObjectId:
          state.scene.selectedObjectId === id
            ? null
            : state.scene.selectedObjectId,
      },
      project: {
        ...state.project,
        isDirty: true,
      },
    }));
    get().calculateSystem();
  },

  updateObject: (id, updates) => {
    set((state) => ({
      scene: {
        ...state.scene,
        objects: state.scene.objects.map((obj) =>
          obj.id === id ? { ...obj, ...updates } : obj,
        ),
      },
      project: {
        ...state.project,
        isDirty: true,
      },
    }));
    get().calculateSystem();
  },

  selectObject: (id) => {
    set((state) => ({
      scene: {
        ...state.scene,
        selectedObjectId: id,
      },
    }));
  },

  clearSelection: () => {
    set((state) => ({
      scene: {
        ...state.scene,
        selectedObjectId: null,
      },
    }));
  },

  // Transform actions
  setObjectPosition: (id, position) => {
    get().updateObject(id, { position });
  },

  setObjectRotation: (id, rotation) => {
    get().updateObject(id, { rotation });
  },

  setObjectScale: (id, scale) => {
    get().updateObject(id, { scale });
  },

  setTransformMode: (mode) => {
    set((state) => ({
      scene: {
        ...state.scene,
        transformMode: mode,
      },
    }));
  },

  // Wire actions
  setMode: (mode) => {
    set((state) => ({
      scene: {
        ...state.scene,
        mode,
        wireStartComponent: mode === "wire" ? null : null,
      },
    }));
  },

  startWireConnection: (componentId) => {
    set((state) => ({
      scene: {
        ...state.scene,
        wireStartComponent: componentId,
      },
    }));
  },

  completeWireConnection: (componentId) => {
    const { scene } = get();
    if (!scene.wireStartComponent || scene.wireStartComponent === componentId) {
      set((state) => ({
        scene: {
          ...state.scene,
          wireStartComponent: null,
        },
      }));
      return null;
    }

    const existingWire = scene.wires.find(
      (wire) =>
        (wire.fromComponentId === scene.wireStartComponent &&
          wire.toComponentId === componentId) ||
        (wire.fromComponentId === componentId &&
          wire.toComponentId === scene.wireStartComponent),
    );

    if (existingWire) {
      set((state) => ({
        scene: {
          ...state.scene,
          wireStartComponent: null,
        },
      }));
      return null;
    }

    const newWire = {
      id: uuidv4(),
      fromComponentId: scene.wireStartComponent,
      toComponentId: componentId,
      wireType: "dc",
    };

    set((state) => ({
      scene: {
        ...state.scene,
        wires: [...state.scene.wires, newWire],
        wireStartComponent: null,
      },
      project: {
        ...state.project,
        isDirty: true,
      },
    }));

    get().calculateSystem();
    return newWire;
  },

  removeWire: (wireId) => {
    set((state) => ({
      scene: {
        ...state.scene,
        wires: state.scene.wires.filter((wire) => wire.id !== wireId),
      },
      project: {
        ...state.project,
        isDirty: true,
      },
    }));
    get().calculateSystem();
  },

  // Calculation engine
  calculateSystem: () => {
    const { scene, settings } = get();
    const panels = scene.objects.filter((obj) => obj.type === "solarPanel");
    const inverters = scene.objects.filter((obj) => obj.type === "inverter");
    const batteries = scene.objects.filter((obj) => obj.type === "battery");

    const totalPanelWattage = panels.reduce(
      (sum, panel) => sum + (panel.properties?.wattage || 400),
      0,
    );
    const totalPanelCount = panels.length;

    const inverterCapacity = inverters.reduce(
      (sum, inv) => sum + (inv.properties?.capacity || 5000),
      0,
    );

    const batteryCapacity = batteries.reduce(
      (sum, bat) => sum + (bat.properties?.capacity || 5000),
      0,
    );

    const estimatedDailyProduction = (totalPanelWattage * 5) / 1000;

    const monthlyProduction = Array(12)
      .fill(0)
      .map((_, i) => {
        const seasonalFactor = 0.7 + Math.sin(((i - 3) * Math.PI) / 6) * 0.3;
        return estimatedDailyProduction * 30 * seasonalFactor;
      });

    const warnings = [];

    if (totalPanelCount > 0 && inverterCapacity > 0) {
      if (totalPanelWattage > inverterCapacity * 1.2) {
        warnings.push(
          "Total panel wattage exceeds inverter capacity by more than 20%",
        );
      }
    }

    if (totalPanelCount > 0 && inverterCapacity === 0) {
      warnings.push("No inverter connected to the system");
    }

    if (batteryCapacity === 0) {
      warnings.push("No battery storage in the system");
    }

    set({
      calculations: {
        totalPanelWattage,
        totalPanelCount,
        inverterCapacity,
        batteryCapacity,
        systemVoltage: settings.voltage,
        estimatedDailyProduction:
          Math.round(estimatedDailyProduction * 100) / 100,
        monthlyProduction: monthlyProduction.map(
          (v) => Math.round(v * 100) / 100,
        ),
        warnings,
      },
    });
  },

  // Project actions
  loadProject: (projectData) => {
    set({
      scene: {
        objects: projectData.components || [],
        wires: projectData.wires || [],
        selectedObjectId: null,
        mode: "select",
        wireStartComponent: null,
      },
      project: {
        id: projectData._id || projectData.id,
        name: projectData.name,
        description: projectData.description || "",
        isDirty: false,
      },
      calculations: projectData.calculations || get().calculations,
    });
    get().calculateSystem();
  },

  saveProject: async () => {
    const { scene, project, user } = get();
    if (!user.isAuthenticated) {
      throw new Error("User not authenticated");
    }

    const projectData = {
      name: project.name,
      description: project.description,
      components: scene.objects,
      wires: scene.wires,
      calculations: get().calculations,
    };

    const method = project.id ? "PUT" : "POST";
    const url = project.id ? `/api/projects/${project.id}` : "/api/projects";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      throw new Error("Failed to save project");
    }

    const savedProject = await response.json();

    set({
      project: {
        ...project,
        id: savedProject._id || savedProject.id,
        isDirty: false,
      },
    });

    return savedProject;
  },

  newProject: () => {
    set({
      scene: {
        objects: [],
        wires: [],
        selectedObjectId: null,
        mode: "select",
        wireStartComponent: null,
      },
      project: {
        id: null,
        name: "Untitled Project",
        description: "",
        isDirty: false,
      },
      calculations: {
        totalPanelWattage: 0,
        totalPanelCount: 0,
        inverterCapacity: 0,
        batteryCapacity: 0,
        systemVoltage: 48,
        estimatedDailyProduction: 0,
        monthlyProduction: [],
        warnings: [],
      },
    });
  },

  // Auth actions
  setUser: (userData, token) => {
    localStorage.setItem("token", token);
    set({
      user: {
        token,
        user: userData,
        isAuthenticated: true,
      },
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({
      user: {
        token: null,
        user: null,
        isAuthenticated: false,
      },
    });
    get().newProject();
  },

  // Settings actions
  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  // Export scene data
  exportScene: () => {
    const { scene, project, calculations } = get();
    return {
      name: project.name,
      description: project.description,
      components: scene.objects,
      wires: scene.wires,
      calculations,
      exportedAt: new Date().toISOString(),
    };
  },
}));

export default useStore;
