import {
  Injectable,
  signal,
  computed,
  effect,
  inject,
  PLATFORM_ID,
} from "@angular/core";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { $t, updatePreset, updateSurfacePalette } from "@primeng/themes";
import Aura from "@primeng/themes/aura";
import Lara from "@primeng/themes/lara";
import Material from "@primeng/themes/material";
import Nora from "@primeng/themes/nora";
import { PrimeNG } from "primeng/config";
import { ActivatedRoute } from "@angular/router";
import { environment } from "../../environments/environment";

// Create a typed presets object
interface Presets {
  [key: string]: any;
}

const presets: Presets = {
  Aura,
  Material,
  Lara,
  Nora,
};

export interface ThemeState {
  preset?: string;
  primary?: string;
  surface?: string;
  darkTheme?: boolean;
  colorScheme?: any;
}

export interface OfficeThemeConfig {
  name: string;
  theme: ThemeState;
  availableLanguages: string[];
  defaultLanguage: string;
  logo?: string;
}

// Define the type for officeConfigs
export interface OfficeConfigs {
  [key: string]: OfficeThemeConfig;
}

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private readonly STORAGE_KEY = "themeServiceState";

  document = inject(DOCUMENT);
  platformId = inject(PLATFORM_ID);
  config: PrimeNG = inject(PrimeNG);
  route = inject(ActivatedRoute);

  // Theme state management
  themeState = signal<ThemeState>({
    preset: "Aura",
    primary: "noir",
    surface: "slate",
    darkTheme: false,
  });
  currentOffice = signal<string | null>(null);

  // Office configurations from environment with proper typing
  officeConfigs: OfficeConfigs = environment.officeConfigs || {};

  // Computed values
  theme = computed(() => (this.themeState()?.darkTheme ? "dark" : "light"));
  selectedPreset = computed(() => this.themeState()?.preset || "Aura");
  selectedSurfaceColor = computed(() => this.themeState()?.surface || "slate");
  selectedPrimaryColor = computed(() => this.themeState()?.primary || "noir");

  constructor() {
    console.log("[ThemeService] Constructor initialized");
    console.log(
      "[ThemeService] Available offices:",
      Object.keys(this.officeConfigs)
    );

    // Initialize theme state
    const initialState = this.loadThemeState();
    if (initialState) {
      this.themeState.set(initialState);
    }
    console.log("[ThemeService] Initial theme state:", this.themeState());

    // Set up effect to handle theme changes
    effect(() => {
      const state = this.themeState();
      console.log("[ThemeService] Theme state changed:", state);
      this.saveThemeState(state);
      this.handleDarkModeTransition(state);
    });
  }

  // Initialize theme service by detecting office from URL
  initialize(): void {
    console.log("[ThemeService] Initialize called");

    if (isPlatformBrowser(this.platformId)) {
      // Get office from URL parameters
      const params = new URLSearchParams(window.location.search);
      const officeParam = params.get("office");

      console.log("[ThemeService] URL office parameter:", officeParam);

      if (officeParam && this.isValidOffice(officeParam)) {
        console.log("[ThemeService] Valid office found in URL:", officeParam);
        this.currentOffice.set(officeParam);
        this.applyOfficeTheme(officeParam);
      } else {
        console.log(
          "[ThemeService] No valid office found in URL, applying default theme"
        );
        // Apply default theme
        this.applyPreset(this.themeState()?.preset || "Aura");
        if (this.themeState()?.colorScheme) {
          this.applyCustomColorScheme(this.themeState().colorScheme);
        }
      }
    }
  }

  // Check if an office name is valid
  isValidOffice(officeName: string): boolean {
    const isValid = Object.keys(this.officeConfigs).includes(officeName);
    console.log("[ThemeService] Office validity check:", officeName, isValid);
    return isValid;
  }

  // Apply theme based on office configuration
  applyOfficeTheme(office: string): void {
    console.log("[ThemeService] Applying office theme for:", office);

    if (!this.isValidOffice(office)) {
      console.warn("[ThemeService] Invalid office name:", office);
      return;
    }

    const officeConfig = this.officeConfigs[office];
    console.log("[ThemeService] Office config:", officeConfig);

    const themeConfig = officeConfig.theme;

    this.themeState.update((state) => ({
      ...state,
      preset: themeConfig?.preset || state.preset,
      primary: themeConfig?.primary || state.primary,
      surface: themeConfig?.surface || state.surface,
      darkTheme: themeConfig?.darkTheme ?? state.darkTheme,
      colorScheme: themeConfig?.colorScheme || state.colorScheme,
    }));

    console.log("[ThemeService] Updated theme state:", this.themeState());

    // Apply preset theme - safely handle undefined
    this.applyPreset(themeConfig?.preset || "Aura");

    // Apply custom color scheme if available
    if (themeConfig?.colorScheme) {
      console.log("[ThemeService] Applying custom color scheme");
      this.applyCustomColorScheme(themeConfig.colorScheme);
    } else {
      console.log("[ThemeService] No custom color scheme found");
    }

    // Apply surface color
    if (themeConfig?.surface) {
      const surfaceColor = this.surfaces.find(
        (s) => s.name === themeConfig.surface
      );
      if (surfaceColor) {
        console.log(
          "[ThemeService] Applying surface color:",
          themeConfig.surface
        );
        updateSurfacePalette(surfaceColor.palette);
      }
    }
  }

  // Apply a custom color scheme
  applyCustomColorScheme(colorScheme: any): void {
    if (!colorScheme) {
      console.log("[ThemeService] No color scheme to apply");
      return;
    }

    console.log("[ThemeService] Applying color scheme:", colorScheme);
    try {
      updatePreset(colorScheme);
    } catch (error) {
      console.error("[ThemeService] Error applying color scheme:", error);
    }
  }

  // Apply a specific preset theme
  applyPreset(presetName: string): void {
    console.log("[ThemeService] Applying preset:", presetName);

    if (!presetName) {
      console.warn("[ThemeService] No preset name provided");
      presetName = "Aura"; // Default fallback
    }

    this.themeState.update((state) => ({ ...state, preset: presetName }));

    // Safely access preset
    const preset = presets[presetName] || Aura;

    const surfaceName = this.selectedSurfaceColor();
    const surfaceColor = this.surfaces.find((s) => s.name === surfaceName);
    const surfacePalette = surfaceColor?.palette;

    // Handle Material ripple effect
    if (presetName === "Material") {
      console.log("[ThemeService] Applying Material-specific settings");
      this.document.body.classList.add("material");
      this.config.ripple.set(true);
    } else {
      this.document.body.classList.remove("material");
      this.config.ripple.set(false);
    }

    // Apply theme with PrimeNG theme API
    try {
      console.log("[ThemeService] Applying PrimeNG theme");
      const themeBuilder = $t().preset(preset);

      if (surfacePalette) {
        themeBuilder.surfacePalette(surfacePalette);
      }

      themeBuilder.use({ useDefaultOptions: true });

      // Apply custom color scheme if available, otherwise use default preset extensions
      const colorScheme = this.themeState().colorScheme;
      if (colorScheme) {
        console.log("[ThemeService] Applying saved color scheme");
        this.applyCustomColorScheme(colorScheme);
      } else {
        console.log("[ThemeService] Applying default preset extensions");
        try {
          const presetExt = this.getPresetExt();
          if (presetExt) {
            updatePreset(presetExt);
          }
        } catch (error) {
          console.error(
            "[ThemeService] Error applying preset extensions:",
            error
          );
        }
      }

      console.log("[ThemeService] Theme applied successfully");
    } catch (error) {
      console.error("[ThemeService] Error applying theme:", error);
    }
  }

  // Toggle dark/light mode
  toggleDarkMode(): void {
    console.log("[ThemeService] Toggling dark mode");
    this.themeState.update((state) => ({
      ...state,
      darkTheme: !state.darkTheme,
    }));
  }

  // Handle dark mode transition with view transition API if available
  private handleDarkModeTransition(state: ThemeState): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log(
        "[ThemeService] Handling dark mode transition, darkTheme =",
        state.darkTheme
      );

      if ((document as any).startViewTransition) {
        console.log("[ThemeService] Using startViewTransition API");
        const transition = (document as any).startViewTransition(() => {
          this.toggleDarkModeClass(state);
        });
      } else {
        console.log("[ThemeService] Using standard class toggle");
        this.toggleDarkModeClass(state);
      }
    }
  }

  // Toggle dark mode class on document element
  private toggleDarkModeClass(state: ThemeState): void {
    if (state.darkTheme) {
      this.document.documentElement.classList.add("p-dark");
    } else {
      this.document.documentElement.classList.remove("p-dark");
    }
  }

  // Surface color palettes definition
  surfaces = [
    {
      name: "slate",
      palette: {
        0: "#ffffff",
        50: "#f8fafc",
        100: "#f1f5f9",
        200: "#e2e8f0",
        300: "#cbd5e1",
        400: "#94a3b8",
        500: "#64748b",
        600: "#475569",
        700: "#334155",
        800: "#1e293b",
        900: "#0f172a",
        950: "#020617",
      },
    },
    {
      name: "gray",
      palette: {
        0: "#ffffff",
        50: "#f9fafb",
        100: "#f3f4f6",
        200: "#e5e7eb",
        300: "#d1d5db",
        400: "#9ca3af",
        500: "#6b7280",
        600: "#4b5563",
        700: "#374151",
        800: "#1f2937",
        900: "#111827",
        950: "#030712",
      },
    },
    {
      name: "zinc",
      palette: {
        0: "#ffffff",
        50: "#fafafa",
        100: "#f4f4f5",
        200: "#e4e4e7",
        300: "#d4d4d8",
        400: "#a1a1aa",
        500: "#71717a",
        600: "#52525b",
        700: "#3f3f46",
        800: "#27272a",
        900: "#18181b",
        950: "#09090b",
      },
    },
    {
      name: "neutral",
      palette: {
        0: "#ffffff",
        50: "#fafafa",
        100: "#f5f5f5",
        200: "#e5e5e5",
        300: "#d4d4d4",
        400: "#a3a3a3",
        500: "#737373",
        600: "#525252",
        700: "#404040",
        800: "#262626",
        900: "#171717",
        950: "#0a0a0a",
      },
    },
    {
      name: "stone",
      palette: {
        0: "#ffffff",
        50: "#fafaf9",
        100: "#f5f5f4",
        200: "#e7e5e4",
        300: "#d6d3d1",
        400: "#a8a29e",
        500: "#78716c",
        600: "#57534e",
        700: "#44403c",
        800: "#292524",
        900: "#1c1917",
        950: "#0c0a09",
      },
    },
    {
      name: "soho",
      palette: {
        0: "#ffffff",
        50: "#ececec",
        100: "#dedfdf",
        200: "#c4c4c6",
        300: "#adaeb0",
        400: "#97979b",
        500: "#7f8084",
        600: "#6a6b70",
        700: "#55565b",
        800: "#3f4046",
        900: "#2c2c34",
        950: "#16161d",
      },
    },
    {
      name: "viva",
      palette: {
        0: "#ffffff",
        50: "#f3f3f3",
        100: "#e7e7e8",
        200: "#cfd0d0",
        300: "#b7b8b9",
        400: "#9fa1a1",
        500: "#87898a",
        600: "#6e7173",
        700: "#565a5b",
        800: "#3e4244",
        900: "#262b2c",
        950: "#0e1315",
      },
    },
    {
      name: "ocean",
      palette: {
        0: "#ffffff",
        50: "#fbfcfc",
        100: "#F7F9F8",
        200: "#EFF3F2",
        300: "#DADEDD",
        400: "#B1B7B6",
        500: "#828787",
        600: "#5F7274",
        700: "#415B61",
        800: "#29444E",
        900: "#183240",
        950: "#0c1920",
      },
    },
  ];

  // Get primary color palette for current preset
  getPrimaryColors() {
    const currentPreset = this.themeState()?.preset || "Aura";
    const presetObj = presets[currentPreset];

    if (!presetObj || !presetObj.primitive) {
      console.warn(
        "[ThemeService] Cannot get primary colors - invalid preset or missing primitive:",
        currentPreset
      );
      return [{ name: "noir", palette: {} }];
    }

    const presetPalette = presetObj.primitive;
    const colors = [
      "emerald",
      "green",
      "lime",
      "orange",
      "amber",
      "yellow",
      "teal",
      "cyan",
      "sky",
      "blue",
      "indigo",
      "violet",
      "purple",
      "fuchsia",
      "pink",
      "rose",
    ];

    const palettes = [{ name: "noir", palette: {} }];

    colors.forEach((color) => {
      if (presetPalette[color]) {
        palettes.push({
          name: color,
          palette: presetPalette[color],
        });
      }
    });

    return palettes;
  }

  // Get preset extension configuration
  getPresetExt() {
    const colorName = this.selectedPrimaryColor();
    const colors = this.getPrimaryColors();
    const color = colors.find((c) => c.name === colorName);

    if (!color) {
      console.warn("[ThemeService] Primary color not found:", colorName);
      // Return a default configuration to prevent errors
      return {
        semantic: {
          primary: {},
          colorScheme: {
            light: {
              primary: {
                color: "#3B82F6",
                contrastColor: "#ffffff",
                hoverColor: "#2563EB",
                activeColor: "#1D4ED8",
              },
              highlight: {
                background: "#EFF6FF",
                focusBackground: "#DBEAFE",
                color: "#1D4ED8",
                focusColor: "#1E40AF",
              },
            },
            dark: {
              primary: {
                color: "#60A5FA",
                contrastColor: "#0F172A",
                hoverColor: "#93C5FD",
                activeColor: "#BFDBFE",
              },
              highlight: {
                background: "rgba(96, 165, 250, 0.16)",
                focusBackground: "rgba(96, 165, 250, 0.24)",
                color: "rgba(255, 255, 255, 0.87)",
                focusColor: "rgba(255, 255, 255, 0.87)",
              },
            },
          },
        },
      };
    }

    if (color.name === "noir") {
      return {
        semantic: {
          primary: {
            50: "{surface.50}",
            100: "{surface.100}",
            200: "{surface.200}",
            300: "{surface.300}",
            400: "{surface.400}",
            500: "{surface.500}",
            600: "{surface.600}",
            700: "{surface.700}",
            800: "{surface.800}",
            900: "{surface.900}",
            950: "{surface.950}",
          },
          colorScheme: {
            light: {
              primary: {
                color: "{primary.950}",
                contrastColor: "#ffffff",
                hoverColor: "{primary.800}",
                activeColor: "{primary.700}",
              },
              highlight: {
                background: "{primary.950}",
                focusBackground: "{primary.700}",
                color: "#ffffff",
                focusColor: "#ffffff",
              },
            },
            dark: {
              primary: {
                color: "{primary.50}",
                contrastColor: "{primary.950}",
                hoverColor: "{primary.200}",
                activeColor: "{primary.300}",
              },
              highlight: {
                background: "{primary.50}",
                focusBackground: "{primary.300}",
                color: "{primary.950}",
                focusColor: "{primary.950}",
              },
            },
          },
        },
      };
    } else {
      // Different preset extensions for each theme
      const currentPreset = this.themeState()?.preset;

      if (currentPreset === "Nora") {
        return {
          semantic: {
            primary: color.palette,
            colorScheme: {
              light: {
                primary: {
                  color: "{primary.600}",
                  contrastColor: "#ffffff",
                  hoverColor: "{primary.700}",
                  activeColor: "{primary.800}",
                },
                highlight: {
                  background: "{primary.600}",
                  focusBackground: "{primary.700}",
                  color: "#ffffff",
                  focusColor: "#ffffff",
                },
              },
              dark: {
                primary: {
                  color: "{primary.500}",
                  contrastColor: "{surface.900}",
                  hoverColor: "{primary.400}",
                  activeColor: "{primary.300}",
                },
                highlight: {
                  background: "{primary.500}",
                  focusBackground: "{primary.400}",
                  color: "{surface.900}",
                  focusColor: "{surface.900}",
                },
              },
            },
          },
        };
      } else if (currentPreset === "Material") {
        return {
          semantic: {
            primary: color.palette,
            colorScheme: {
              light: {
                primary: {
                  color: "{primary.500}",
                  contrastColor: "#ffffff",
                  hoverColor: "{primary.400}",
                  activeColor: "{primary.300}",
                },
                highlight: {
                  background:
                    "color-mix(in srgb, {primary.color}, transparent 88%)",
                  focusBackground:
                    "color-mix(in srgb, {primary.color}, transparent 76%)",
                  color: "{primary.700}",
                  focusColor: "{primary.800}",
                },
              },
              dark: {
                primary: {
                  color: "{primary.400}",
                  contrastColor: "{surface.900}",
                  hoverColor: "{primary.300}",
                  activeColor: "{primary.200}",
                },
                highlight: {
                  background:
                    "color-mix(in srgb, {primary.400}, transparent 84%)",
                  focusBackground:
                    "color-mix(in srgb, {primary.400}, transparent 76%)",
                  color: "rgba(255,255,255,.87)",
                  focusColor: "rgba(255,255,255,.87)",
                },
              },
            },
          },
        };
      } else {
        return {
          semantic: {
            primary: color.palette,
            colorScheme: {
              light: {
                primary: {
                  color: "{primary.500}",
                  contrastColor: "#ffffff",
                  hoverColor: "{primary.600}",
                  activeColor: "{primary.700}",
                },
                highlight: {
                  background: "{primary.50}",
                  focusBackground: "{primary.100}",
                  color: "{primary.700}",
                  focusColor: "{primary.800}",
                },
              },
              dark: {
                primary: {
                  color: "{primary.400}",
                  contrastColor: "{surface.900}",
                  hoverColor: "{primary.300}",
                  activeColor: "{primary.200}",
                },
                highlight: {
                  background:
                    "color-mix(in srgb, {primary.400}, transparent 84%)",
                  focusBackground:
                    "color-mix(in srgb, {primary.400}, transparent 76%)",
                  color: "rgba(255,255,255,.87)",
                  focusColor: "rgba(255,255,255,.87)",
                },
              },
            },
          },
        };
      }
    }
  }

  // Load theme state from localStorage or from URL office param
  private loadThemeState(): ThemeState {
    console.log("[ThemeService] Loading theme state");

    if (isPlatformBrowser(this.platformId)) {
      // Try to get office from URL first
      const params = new URLSearchParams(window.location.search);
      const officeParam = params.get("office");

      console.log(
        "[ThemeService] URL office parameter for initial load:",
        officeParam
      );

      if (officeParam && this.isValidOffice(officeParam)) {
        console.log(
          "[ThemeService] Loading theme from office config:",
          officeParam
        );
        this.currentOffice.set(officeParam);
        return this.officeConfigs[officeParam].theme;
      }

      // Fall back to stored state if no valid office in URL
      const storedState = localStorage.getItem(this.STORAGE_KEY);
      if (storedState) {
        try {
          const parsedState = JSON.parse(storedState);
          console.log(
            "[ThemeService] Loaded theme state from localStorage:",
            parsedState
          );
          return parsedState;
        } catch (e) {
          console.error("[ThemeService] Error parsing stored theme state:", e);
        }
      }
    }

    // Default theme state
    console.log("[ThemeService] Using default theme state");
    return {
      preset: "Aura",
      primary: "noir",
      surface: "slate",
      darkTheme: false,
    };
  }

  // Save theme state to localStorage
  private saveThemeState(state: ThemeState): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log("[ThemeService] Saving theme state to localStorage");
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    }
  }
}
