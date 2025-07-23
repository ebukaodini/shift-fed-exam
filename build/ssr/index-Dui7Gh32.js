import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { router, Head } from "@inertiajs/react";
function TicketContent({ content }) {
  const [expanded, setExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const contentRef = useRef(null);
  useLayoutEffect(() => {
    function updateShowButton() {
      const el = contentRef.current;
      if (el) {
        const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
        const maxHeight = lineHeight * 3;
        setShowButton(el.scrollHeight > maxHeight + 1);
      }
    }
    updateShowButton();
    window.addEventListener("resize", updateShowButton);
    return () => window.removeEventListener("resize", updateShowButton);
  }, [content]);
  const toggleExpand = () => setExpanded((prev) => !prev);
  return /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
    /* @__PURE__ */ jsx(
      "p",
      {
        ref: contentRef,
        className: `text-sand-11 text-base transition-all ${expanded ? "" : "line-clamp-3"}`,
        children: content
      }
    ),
    showButton && /* @__PURE__ */ jsx("button", { onClick: toggleExpand, className: "text-sm text-blue-600", children: expanded ? "See less" : "See more" })
  ] });
}
function TicketLabels({ labels }) {
  return /* @__PURE__ */ jsx(Fragment, { children: labels.length > 0 && /* @__PURE__ */ jsx("div", { className: "w-full sm:w-fit overflow-auto flex space-x-2", children: labels.map((label) => /* @__PURE__ */ jsx(
    "div",
    {
      className: "border border-blue-200 rounded-md bg-blue-100 text-sand-11 text-xs px-2 py-1 font-medium whitespace-nowrap",
      children: label
    },
    label
  )) }) });
}
function TicketsList({
  tickets,
  hiddenTickets,
  onHide
}) {
  const filteredTickets = tickets.filter((t) => !hiddenTickets.includes(t.id));
  return /* @__PURE__ */ jsx("ul", { className: "space-y-4", children: filteredTickets.length > 0 ? filteredTickets.map((ticket) => /* @__PURE__ */ jsxs(
    "li",
    {
      className: "bg-white border border-sand-7 rounded-lg p-6 hover:border-sand-8 hover:shadow-sm transition duration-200 relative group",
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "absolute top-2 right-3 text-sm text-sand-11 hover:text-sand-12 hidden group-hover:block",
            onClick: () => onHide(ticket.id),
            children: "Hide"
          }
        ),
        /* @__PURE__ */ jsx("h5", { className: "text-lg font-semibold text-sand-12 mb-2", children: ticket.title }),
        /* @__PURE__ */ jsx(TicketContent, { content: ticket.content }),
        /* @__PURE__ */ jsxs("footer", { className: "w-full flex flex-col sm:flex-row gap-y-2 sm:gap-0 justify-start items-start sm:justify-between sm:items-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-sm text-sand-10", children: [
            "By ",
            ticket.userEmail,
            " | ",
            formatDate(ticket.creationTime)
          ] }),
          /* @__PURE__ */ jsx(TicketLabels, { labels: ticket.labels })
        ] })
      ]
    },
    ticket.id
  )) : /* @__PURE__ */ jsx(EmptyState, { hasHiddenTickets: hiddenTickets.length > 0 }) });
}
function EmptyState({
  hasSearch,
  hasHiddenTickets
}) {
  return /* @__PURE__ */ jsx("div", { className: "text-center py-12", children: /* @__PURE__ */ jsx("div", { className: "text-lg text-sand-11", children: hasSearch ? "No issues found matching your search." : hasHiddenTickets ? "All issues are hidden." : "No security issues found." }) });
}
function Pagination({
  currentPage,
  lastPage,
  onPageChange
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center sm:justify-center sm:items-center gap-4 mt-8", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        disabled: currentPage <= 1,
        onClick: () => onPageChange(currentPage - 1),
        className: "px-3 py-1 text-sm bg-sand-3 hover:bg-sand-4 text-sand-12 rounded-md disabled:opacity-50",
        children: "Previous"
      }
    ),
    /* @__PURE__ */ jsxs("span", { className: "text-sand-11 text-sm", children: [
      "Page ",
      currentPage,
      " of ",
      lastPage
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        disabled: currentPage >= lastPage,
        onClick: () => onPageChange(currentPage + 1),
        className: "px-3 py-1 text-sm bg-sand-3 hover:bg-sand-4 text-sand-12 rounded-md disabled:opacity-50",
        children: "Next"
      }
    )
  ] });
}
function Search({
  search,
  handleSearch
}) {
  const [showHint, toggleHint] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col", onBlur: () => toggleHint(false), children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "search",
        placeholder: "Search issues...",
        className: "w-full max-w-md px-4 py-2 border border-sand-7 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
        onChange: (e) => handleSearch(e.target.value),
        onFocus: () => toggleHint(true),
        value: search
      }
    ),
    showHint && /* @__PURE__ */ jsxs("div", { className: "absolute top-full mt-0.5 px-4 py-2 flex flex-col gap-1 text-xs text-sand-9 w-full max-w-md z-20 bg-white rounded-lg ring-2 ring-primary", children: [
      /* @__PURE__ */ jsx("span", { children: "Search Filters:" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-start sm:justify-between sm:items-center", children: [
        /* @__PURE__ */ jsx("code", { className: "w-fit border border-blue-200 rounded-sm bg-blue-100 text-sand-11 text-xs", children: "after:27/09/2019 xss" }),
        /* @__PURE__ */ jsx("span", { children: "Issues created after date" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-start sm:justify-between sm:items-center", children: [
        /* @__PURE__ */ jsx("code", { className: "w-fit border border-blue-200 rounded-sm bg-blue-100 text-sand-11 text-xs", children: "before:27/09/2019 xss" }),
        /* @__PURE__ */ jsx("span", { children: "Issues created before date" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-start sm:justify-between sm:items-center", children: [
        /* @__PURE__ */ jsx("code", { className: "w-fit border border-blue-200 rounded-sm bg-blue-100 text-sand-11 text-xs", children: "reporter:sec@test.com xss" }),
        /* @__PURE__ */ jsx("span", { children: "Issues created by reporter" })
      ] })
    ] })
  ] });
}
function App({ tickets }) {
  const [search, setSearch] = useState("");
  const [hiddenTickets, setHiddenTickets] = useState([]);
  const handleHideTicket = useCallback((ticketId) => {
    setHiddenTickets((prev) => [...prev, ticketId]);
  }, []);
  const handleRestoreTickets = useCallback(() => {
    setHiddenTickets([]);
  }, []);
  useEffect(() => {
    handleRestoreTickets();
  }, [search]);
  useLayoutEffect(() => {
    const searchParam = new URLSearchParams(window.location.search).get("search") || "";
    setSearch(searchParam.trim());
  }, []);
  const handleSearch = useCallback(function handleSearch2(value) {
    setSearch(value);
    router.get("/", value ? { search: value.trim() } : {}, { preserveState: true, replace: true });
  }, []);
  const goToPage = (page) => {
    router.get(
      "/",
      { ...search && { search: search.trim() }, page },
      { preserveState: true, replace: true }
    );
  };
  const handleExport = () => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (hiddenTickets) params.append("hidden", hiddenTickets.join(","));
    window.open(`/tickets/export/csv?${params.toString()}`, "_blank");
  };
  const ticketData = (tickets == null ? void 0 : tickets.data) || [];
  const paginationInfo = calculatePagination(tickets.meta);
  const hiddenTicketsInfo = `${hiddenTickets.length} hidden ${hiddenTickets.length > 1 ? "tickets" : "ticket"} - `;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Security Issues" }),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-sand-1", children: /* @__PURE__ */ jsx("div", { className: "max-w-6xl mx-auto px-6 py-8", children: /* @__PURE__ */ jsxs("main", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-sand-12 mb-8", children: "Security Issues List" }),
      /* @__PURE__ */ jsx("header", { className: "mb-6 space-y-2", children: /* @__PURE__ */ jsx(Search, { search, handleSearch }) }),
      tickets && /* @__PURE__ */ jsxs("div", { className: "mb-4 w-full flex flex-col sm:flex-row justify-start items-start sm:justify-between sm:items-center space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-sand-11", children: [
          paginationInfo,
          hiddenTickets.length > 0 && /* @__PURE__ */ jsxs("span", { className: "ml-1 italic", children: [
            "(",
            hiddenTicketsInfo,
            /* @__PURE__ */ jsx("button", { onClick: handleRestoreTickets, className: "italic !text-blue-600", children: "restore" }),
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            disabled: tickets.meta.total == 0,
            onClick: () => handleExport(),
            className: "px-3 py-1 text-sm bg-sand-3 hover:bg-sand-4 text-sand-12 rounded-md disabled:opacity-50",
            children: "Export CSV"
          }
        )
      ] }),
      ticketData.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx(
          TicketsList,
          {
            tickets: ticketData,
            onHide: handleHideTicket,
            hiddenTickets
          }
        ),
        tickets.meta.total > tickets.meta.perPage && /* @__PURE__ */ jsx(
          Pagination,
          {
            currentPage: tickets.meta.currentPage,
            lastPage: tickets.meta.lastPage,
            onPageChange: goToPage
          }
        )
      ] }) : /* @__PURE__ */ jsx(EmptyState, { hasSearch: Boolean(search) })
    ] }) }) })
  ] });
}
function formatDate(unixTimestemp) {
  return new Date(unixTimestemp).toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "");
}
function calculatePagination({ currentPage, perPage, total }) {
  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, total);
  return total < 20 ? `Showing ${total} ${total > 1 ? "issues" : "issue"}` : `Showing ${startItem} - ${endItem} of ${total} issues`;
}
const __vite_glob_0_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App
}, Symbol.toStringTag, { value: "Module" }));
export {
  __vite_glob_0_2 as _
};
