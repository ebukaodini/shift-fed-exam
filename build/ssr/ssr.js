import { _ as __vite_glob_0_0 } from "./not_found-Djv2od_e.js";
import { _ as __vite_glob_0_1 } from "./server_error-Cgc8nwHe.js";
import { _ as __vite_glob_0_2 } from "./index-Dui7Gh32.js";
import { jsx } from "react/jsx-runtime";
import ReactDOMServer from "react-dom/server";
import { createInertiaApp } from "@inertiajs/react";
import "react";
function render(page) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      const pages = /* @__PURE__ */ Object.assign({ "../pages/errors/not_found.tsx": __vite_glob_0_0, "../pages/errors/server_error.tsx": __vite_glob_0_1, "../pages/index.tsx": __vite_glob_0_2 });
      return pages[`../pages/${name}.tsx`];
    },
    setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props })
  });
}
export {
  render as default
};
