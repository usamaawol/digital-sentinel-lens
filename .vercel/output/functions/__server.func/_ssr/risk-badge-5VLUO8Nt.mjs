import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { c as cn } from "./button-DjOZMqFS.mjs";
const styles = {
  safe: "bg-success/15 text-success border-success/30",
  low: "bg-primary/15 text-primary border-primary/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  high: "bg-destructive/15 text-destructive border-destructive/30"
};
const labels = {
  safe: "Safe",
  low: "Low Risk",
  medium: "Medium Risk",
  high: "High Risk"
};
function RiskBadge({ risk, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[risk],
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-current" }),
        labels[risk]
      ]
    }
  );
}
export {
  RiskBadge as R
};
