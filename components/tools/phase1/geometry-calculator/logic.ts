export type ShapeType =
  | "circle"
  | "rectangle"
  | "triangle"
  | "trapezoid"
  | "ellipse"
  | "regular-polygon"
  | "sphere"
  | "cylinder"
  | "cone"
  | "rectangular-prism"
  | "pyramid";

export interface GeometryParam {
  key: string;
  label: string;
  defaultValue: number;
  unit: string;
}

export interface GeometryResult {
  shape: ShapeType;
  category: "2D" | "3D";
  title: string;
  metrics: {
    label: string;
    value: number;
    unit: string;
    formula: string;
  }[];
}

export function calculateGeometry(
  shape: ShapeType,
  params: Record<string, number>
): GeometryResult {
  const round = (val: number) => Math.round(val * 10000) / 10000;

  switch (shape) {
    case "circle": {
      const r = Math.max(0, params["radius"] ?? 5);
      const area = Math.PI * r * r;
      const perimeter = 2 * Math.PI * r;
      const diameter = 2 * r;
      return {
        shape,
        category: "2D",
        title: "Circle",
        metrics: [
          { label: "Area", value: round(area), unit: "sq units", formula: "A = π × r²" },
          { label: "Circumference", value: round(perimeter), unit: "units", formula: "C = 2 × π × r" },
          { label: "Diameter", value: round(diameter), unit: "units", formula: "d = 2 × r" },
        ],
      };
    }

    case "rectangle": {
      const w = Math.max(0, params["width"] ?? 8);
      const h = Math.max(0, params["height"] ?? 5);
      const area = w * h;
      const perimeter = 2 * (w + h);
      const diagonal = Math.sqrt(w * w + h * h);
      return {
        shape,
        category: "2D",
        title: "Rectangle",
        metrics: [
          { label: "Area", value: round(area), unit: "sq units", formula: "A = w × h" },
          { label: "Perimeter", value: round(perimeter), unit: "units", formula: "P = 2 × (w + h)" },
          { label: "Diagonal", value: round(diagonal), unit: "units", formula: "d = √(w² + h²)" },
        ],
      };
    }

    case "triangle": {
      const b = Math.max(0, params["base"] ?? 6);
      const h = Math.max(0, params["height"] ?? 4);
      const s1 = Math.max(0, params["sideA"] ?? 5);
      const s2 = Math.max(0, params["sideB"] ?? 5);
      const area = 0.5 * b * h;
      const perimeter = b + s1 + s2;
      return {
        shape,
        category: "2D",
        title: "Triangle",
        metrics: [
          { label: "Area", value: round(area), unit: "sq units", formula: "A = ½ × b × h" },
          { label: "Perimeter", value: round(perimeter), unit: "units", formula: "P = a + b + c" },
        ],
      };
    }

    case "trapezoid": {
      const a = Math.max(0, params["baseA"] ?? 10);
      const b = Math.max(0, params["baseB"] ?? 6);
      const h = Math.max(0, params["height"] ?? 4);
      const leg1 = Math.max(0, params["leg1"] ?? 5);
      const leg2 = Math.max(0, params["leg2"] ?? 5);
      const area = 0.5 * (a + b) * h;
      const perimeter = a + b + leg1 + leg2;
      return {
        shape,
        category: "2D",
        title: "Trapezoid",
        metrics: [
          { label: "Area", value: round(area), unit: "sq units", formula: "A = ½ × (a + b) × h" },
          { label: "Perimeter", value: round(perimeter), unit: "units", formula: "P = a + b + leg₁ + leg₂" },
        ],
      };
    }

    case "ellipse": {
      const a = Math.max(0, params["semiMajorA"] ?? 6);
      const b = Math.max(0, params["semiMinorB"] ?? 4);
      const area = Math.PI * a * b;
      // Ramanujan approximation for perimeter
      const hTerm = Math.pow(a - b, 2) / Math.pow(a + b, 2);
      const perimeter = Math.PI * (a + b) * (1 + (3 * hTerm) / (10 + Math.sqrt(4 - 3 * hTerm)));
      return {
        shape,
        category: "2D",
        title: "Ellipse",
        metrics: [
          { label: "Area", value: round(area), unit: "sq units", formula: "A = π × a × b" },
          { label: "Perimeter (approx)", value: round(perimeter), unit: "units", formula: "P ≈ π(a+b)(1 + 3h/(10+√(4-3h)))" },
        ],
      };
    }

    case "regular-polygon": {
      const n = Math.max(3, Math.round(params["sides"] ?? 6));
      const s = Math.max(0, params["sideLength"] ?? 4);
      const perimeter = n * s;
      const area = (n * s * s) / (4 * Math.tan(Math.PI / n));
      const interiorAngle = ((n - 2) * 180) / n;
      return {
        shape,
        category: "2D",
        title: `${n}-Sided Regular Polygon`,
        metrics: [
          { label: "Area", value: round(area), unit: "sq units", formula: "A = (n × s²) / (4 × tan(π/n))" },
          { label: "Perimeter", value: round(perimeter), unit: "units", formula: "P = n × s" },
          { label: "Interior Angle", value: round(interiorAngle), unit: "degrees", formula: "θ = (n - 2) × 180° / n" },
        ],
      };
    }

    case "sphere": {
      const r = Math.max(0, params["radius"] ?? 5);
      const volume = (4 / 3) * Math.PI * Math.pow(r, 3);
      const surfaceArea = 4 * Math.PI * r * r;
      return {
        shape,
        category: "3D",
        title: "Sphere",
        metrics: [
          { label: "Volume", value: round(volume), unit: "cubic units", formula: "V = ⁴⁄₃ × π × r³" },
          { label: "Surface Area", value: round(surfaceArea), unit: "sq units", formula: "A = 4 × π × r²" },
        ],
      };
    }

    case "cylinder": {
      const r = Math.max(0, params["radius"] ?? 4);
      const h = Math.max(0, params["height"] ?? 8);
      const volume = Math.PI * r * r * h;
      const lateralArea = 2 * Math.PI * r * h;
      const surfaceArea = 2 * Math.PI * r * (r + h);
      return {
        shape,
        category: "3D",
        title: "Cylinder",
        metrics: [
          { label: "Volume", value: round(volume), unit: "cubic units", formula: "V = π × r² × h" },
          { label: "Total Surface Area", value: round(surfaceArea), unit: "sq units", formula: "A = 2πr(r + h)" },
          { label: "Lateral Surface Area", value: round(lateralArea), unit: "sq units", formula: "A_lat = 2πrh" },
        ],
      };
    }

    case "cone": {
      const r = Math.max(0, params["radius"] ?? 3);
      const h = Math.max(0, params["height"] ?? 6);
      const slantHeight = Math.sqrt(r * r + h * h);
      const volume = (1 / 3) * Math.PI * r * r * h;
      const surfaceArea = Math.PI * r * (r + slantHeight);
      const lateralArea = Math.PI * r * slantHeight;
      return {
        shape,
        category: "3D",
        title: "Cone",
        metrics: [
          { label: "Volume", value: round(volume), unit: "cubic units", formula: "V = ⅓ × π × r² × h" },
          { label: "Total Surface Area", value: round(surfaceArea), unit: "sq units", formula: "A = πr(r + s)" },
          { label: "Slant Height (s)", value: round(slantHeight), unit: "units", formula: "s = √(r² + h²)" },
          { label: "Lateral Area", value: round(lateralArea), unit: "sq units", formula: "A_lat = π × r × s" },
        ],
      };
    }

    case "rectangular-prism": {
      const l = Math.max(0, params["length"] ?? 6);
      const w = Math.max(0, params["width"] ?? 4);
      const h = Math.max(0, params["height"] ?? 5);
      const volume = l * w * h;
      const surfaceArea = 2 * (l * w + l * h + w * h);
      const spaceDiagonal = Math.sqrt(l * l + w * w + h * h);
      return {
        shape,
        category: "3D",
        title: "Rectangular Prism (Box)",
        metrics: [
          { label: "Volume", value: round(volume), unit: "cubic units", formula: "V = l × w × h" },
          { label: "Total Surface Area", value: round(surfaceArea), unit: "sq units", formula: "A = 2(lw + lh + wh)" },
          { label: "Space Diagonal", value: round(spaceDiagonal), unit: "units", formula: "d = √(l² + w² + h²)" },
        ],
      };
    }

    case "pyramid": {
      const s = Math.max(0, params["baseSide"] ?? 6);
      const h = Math.max(0, params["height"] ?? 8);
      const slantHeight = Math.sqrt(h * h + Math.pow(s / 2, 2));
      const volume = (1 / 3) * s * s * h;
      const surfaceArea = s * s + 2 * s * slantHeight;
      return {
        shape,
        category: "3D",
        title: "Square Pyramid",
        metrics: [
          { label: "Volume", value: round(volume), unit: "cubic units", formula: "V = ⅓ × s² × h" },
          { label: "Total Surface Area", value: round(surfaceArea), unit: "sq units", formula: "A = s² + 2s × slant" },
          { label: "Slant Height", value: round(slantHeight), unit: "units", formula: "s_h = √(h² + (s/2)²)" },
        ],
      };
    }
  }
}
