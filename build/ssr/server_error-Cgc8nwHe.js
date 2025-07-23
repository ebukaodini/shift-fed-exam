import { jsx, Fragment, jsxs } from "react/jsx-runtime";
function ServerError(props) {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
    /* @__PURE__ */ jsx("div", { className: "title", children: "Server Error" }),
    /* @__PURE__ */ jsx("span", { children: props.error.message })
  ] }) });
}
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ServerError
}, Symbol.toStringTag, { value: "Module" }));
export {
  __vite_glob_0_1 as _
};
