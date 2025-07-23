import { jsx, Fragment, jsxs } from "react/jsx-runtime";
function NotFound() {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
    /* @__PURE__ */ jsx("div", { className: "title", children: "Page not found" }),
    /* @__PURE__ */ jsx("span", { children: "This page does not exist." })
  ] }) });
}
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: NotFound
}, Symbol.toStringTag, { value: "Module" }));
export {
  __vite_glob_0_0 as _
};
