/* ------------------------------------------------------------------ */
/*  Office Table configurator — configuration state, pricing, parts    */
/* ------------------------------------------------------------------ */

export type LegStyle = "post" | "panel" | "uframe"
export type FinishId = "oak" | "walnut" | "white" | "graphite"
export type DrawerSide = "none" | "left" | "right"

export interface TableConfig {
  /** cm, 120–200 */
  width: number
  /** cm, 60–90 */
  depth: number
  /** cm, floor to top surface, 70–76 */
  height: number
  legStyle: LegStyle
  finish: FinishId
  drawer: DrawerSide
  cableTray: boolean
}

/** Default = the original model's size and finish (180 × 90 × 73 cm, walnut, 4-post). */
export const DEFAULT_CONFIG: TableConfig = {
  width: 180,
  depth: 90,
  height: 73,
  legStyle: "post",
  finish: "walnut",
  drawer: "none",
  cableTray: false,
}

export const LIMITS = {
  width: { min: 120, max: 200, step: 1 },
  depth: { min: 60, max: 90, step: 1 },
  height: { min: 70, max: 76, step: 1 },
} as const

/* ------------------------------ finishes ------------------------------ */

export interface Finish {
  id: FinishId
  name: string
  /** top surface colour */
  color: string
  /** darker companion shade (aprons, drawer carcass, panels) */
  dark: string
  /** MAD per m² of table top — demo pricing */
  ratePerM2: number
  roughness: number
}

export const FINISHES: Record<FinishId, Finish> = {
  oak: {
    id: "oak",
    name: "Natural Oak",
    color: "#b0824f",
    dark: "#8a6136",
    ratePerM2: 2400,
    roughness: 0.45,
  },
  walnut: {
    id: "walnut",
    name: "Walnut",
    color: "#5c3a1e",
    dark: "#422812",
    ratePerM2: 2900,
    roughness: 0.35,
  },
  white: {
    id: "white",
    name: "Nordic White",
    color: "#ece7de",
    dark: "#c9c2b2",
    ratePerM2: 2100,
    roughness: 0.5,
  },
  graphite: {
    id: "graphite",
    name: "Graphite",
    color: "#3a3d42",
    dark: "#232529",
    ratePerM2: 2300,
    roughness: 0.4,
  },
}

export const FINISH_ORDER: FinishId[] = ["oak", "walnut", "white", "graphite"]

/* ------------------------------ leg styles ----------------------------- */

export interface LegStyleInfo {
  id: LegStyle
  name: string
  detail: string
  /** flat price in MAD — demo pricing */
  price: number
}

export const LEG_STYLES: Record<LegStyle, LegStyleInfo> = {
  post: { id: "post", name: "4-Post", detail: "Steel posts · matte black", price: 450 },
  panel: { id: "panel", name: "Panel", detail: "Solid side panels · matching finish", price: 700 },
  uframe: { id: "uframe", name: "U-Frame", detail: "Steel sled frames · matte black", price: 850 },
}

export const LEG_ORDER: LegStyle[] = ["post", "panel", "uframe"]

/* ------------------------------- add-ons ------------------------------- */

/** All add-on rates live here — demo pricing, MAD. */
export const PRICING = {
  drawerUnit: 650,
  cableTray: 180,
} as const

/* ------------------------------- pricing ------------------------------- */

export interface PartLine {
  name: string
  detail: string
  /** MAD, 0 = included */
  price: number
}

const round10 = (n: number) => Math.round(n / 10) * 10

export function computeParts(cfg: TableConfig): PartLine[] {
  const finish = FINISHES[cfg.finish]
  const legs = LEG_STYLES[cfg.legStyle]
  const areaM2 = (cfg.width / 100) * (cfg.depth / 100)

  const parts: PartLine[] = [
    {
      name: "Table top",
      detail: `${cfg.width} × ${cfg.depth} cm · ${finish.name} · ${areaM2.toFixed(2)} m²`,
      price: round10(areaM2 * finish.ratePerM2),
    },
    {
      name: `${legs.name} legs`,
      detail: legs.detail,
      price: legs.price,
    },
    {
      name: "Cable grommet",
      detail: "Ø 160 mm · rear right",
      price: 0,
    },
  ]

  if (cfg.drawer !== "none") {
    parts.push({
      name: "Drawer unit",
      detail: `2 drawers · ${cfg.drawer} side · soft-close`,
      price: PRICING.drawerUnit,
    })
  }

  if (cfg.cableTray) {
    parts.push({
      name: "Cable tray",
      detail: "Under-desk · steel · matte black",
      price: PRICING.cableTray,
    })
  }

  return parts
}

export function computePrice(cfg: TableConfig): number {
  return computeParts(cfg).reduce((sum, p) => sum + p.price, 0)
}

/** 2450 -> "2 450" */
export function formatMAD(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}
