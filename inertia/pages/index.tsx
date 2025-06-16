import { useState, useCallback, useRef, useLayoutEffect, useEffect } from 'react'
import { Head, router } from '@inertiajs/react'

export type Ticket = {
  id: string
  title: string
  content: string
  creationTime: number
  userEmail: string
  labels?: string[]
}

interface AppProps {
  tickets: {
    data: Ticket[]
    meta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
    }
  }
}

function TicketContent({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const contentRef = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    function updateShowButton() {
      const el = contentRef.current
      if (el) {
        const lineHeight = parseFloat(getComputedStyle(el).lineHeight)
        const maxHeight = lineHeight * 3
        setShowButton(el.scrollHeight > maxHeight + 1)
      }
    }

    updateShowButton()
    window.addEventListener('resize', updateShowButton)
    return () => window.removeEventListener('resize', updateShowButton)
  }, [content])

  const toggleExpand = () => setExpanded((prev) => !prev)

  return (
    <div className="mb-4">
      <p
        ref={contentRef}
        className={`text-sand-11 text-base transition-all ${expanded ? '' : 'line-clamp-3'}`}
      >
        {content}
      </p>
      {showButton && (
        <button onClick={toggleExpand} className="text-sm text-blue-600">
          {expanded ? 'See less' : 'See more'}
        </button>
      )}
    </div>
  )
}

function TicketLabels({ labels }: { labels: string[] }) {
  return (
    <>
      {labels.length > 0 && (
        <div className="w-full sm:w-fit overflow-auto flex space-x-2">
          {labels.map((label) => (
            <div
              key={label}
              className="border border-blue-200 rounded-md bg-blue-100 text-sand-11 text-xs px-2 py-1 font-medium whitespace-nowrap"
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function TicketsList({
  tickets,
  hiddenTickets,
  onHide,
}: {
  tickets: Ticket[]
  hiddenTickets: string[]
  onHide: (ticketId: string) => void
}) {
  const filteredTickets = tickets.filter((t) => !hiddenTickets.includes(t.id))

  return (
    <ul className="space-y-4">
      {filteredTickets.length > 0 ? (
        filteredTickets.map((ticket) => (
          <li
            key={ticket.id}
            className="bg-white border border-sand-7 rounded-lg p-6 hover:border-sand-8 hover:shadow-sm transition duration-200 relative group"
          >
            <button
              className="absolute top-2 right-3 text-sm text-sand-11 hover:text-sand-12 hidden group-hover:block"
              onClick={() => onHide(ticket.id)}
            >
              Hide
            </button>
            <h5 className="text-lg font-semibold text-sand-12 mb-2">{ticket.title}</h5>
            <TicketContent content={ticket.content} />
            <footer className="w-full flex flex-col sm:flex-row gap-y-2 sm:gap-0 justify-start items-start sm:justify-between sm:items-center">
              <div className="text-sm text-sand-10">
                By {ticket.userEmail} | {formatDate(ticket.creationTime)}
              </div>

              <TicketLabels labels={ticket.labels!} />
            </footer>
          </li>
        ))
      ) : (
        <EmptyState hasHiddenTickets={hiddenTickets.length > 0} />
      )}
    </ul>
  )
}

function EmptyState({
  hasSearch,
  hasHiddenTickets,
}: {
  hasSearch?: boolean
  hasHiddenTickets?: boolean
}) {
  return (
    <div className="text-center py-12">
      <div className="text-lg text-sand-11">
        {hasSearch
          ? 'No issues found matching your search.'
          : hasHiddenTickets
            ? 'All issues are hidden.'
            : 'No security issues found.'}
      </div>
    </div>
  )
}

function Pagination({
  currentPage,
  lastPage,
  onPageChange,
}: {
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="flex justify-between items-center sm:justify-center sm:items-center gap-4 mt-8">
      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1 text-sm bg-sand-3 hover:bg-sand-4 text-sand-12 rounded-md disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sand-11 text-sm">
        Page {currentPage} of {lastPage}
      </span>
      <button
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1 text-sm bg-sand-3 hover:bg-sand-4 text-sand-12 rounded-md disabled:opacity-50"
      >
        Next
      </button>
    </div>
  )
}

export default function App({ tickets }: AppProps) {
  const [search, setSearch] = useState('')
  const [hiddenTickets, setHiddenTickets] = useState<string[]>([])

  const handleHideTicket = useCallback((ticketId: string) => {
    setHiddenTickets((prev) => [...prev, ticketId])
  }, [])

  const handleRestoreTickets = useCallback(() => {
    setHiddenTickets([])
  }, [])

  useEffect(() => {
    // Reset hidden tickets when search changes
    handleRestoreTickets()
  }, [search])

  useLayoutEffect(() => {
    const searchParam = new URLSearchParams(window.location.search).get('search') || ''
    setSearch(searchParam.trim())
  }, [])

  const handleSearch = useCallback(function handleSearch(value: string) {
    setSearch(value)
    router.get('/', value ? { search: value.trim() } : {}, { preserveState: true, replace: true })
  }, [])

  const goToPage = (page: number) => {
    router.get(
      '/',
      { ...(search && { search: search.trim() }), page },
      { preserveState: true, replace: true }
    )
  }

  const handleExport = () => {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (hiddenTickets) params.append('hidden', hiddenTickets.join(','))
    window.open(`/tickets/export/csv?${params.toString()}`, '_blank')
  }

  const ticketData = tickets?.data || []
  const paginationInfo = calculatePagination(tickets.meta)
  const hiddenTicketsInfo = `${hiddenTickets.length} hidden ${hiddenTickets.length > 1 ? 'tickets' : 'ticket'} - `

  return (
    <>
      <Head title="Security Issues" />

      <div className="min-h-screen bg-sand-1">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <main>
            <h1 className="text-3xl font-bold text-sand-12 mb-8">Security Issues List</h1>

            <header className="mb-6">
              <input
                type="search"
                placeholder="Search issues..."
                className="w-full max-w-md px-4 py-2 border border-sand-7 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                onChange={(e) => handleSearch(e.target.value)}
                value={search}
              />
            </header>

            {tickets && (
              <div className="mb-4 w-full flex flex-col sm:flex-row justify-start items-start sm:justify-between sm:items-center space-y-2">
                <div className="text-sm text-sand-11">
                  {paginationInfo}
                  {hiddenTickets.length > 0 && (
                    <span className="ml-1 italic">
                      ({hiddenTicketsInfo}
                      <button onClick={handleRestoreTickets} className="italic !text-blue-600">
                        restore
                      </button>
                      )
                    </span>
                  )}
                </div>
                <button
                  disabled={tickets.meta.total == 0}
                  onClick={() => handleExport()}
                  className="px-3 py-1 text-sm bg-sand-3 hover:bg-sand-4 text-sand-12 rounded-md disabled:opacity-50"
                >
                  Export CSV
                </button>
              </div>
            )}

            {ticketData.length > 0 ? (
              <div className="space-y-6">
                <TicketsList
                  tickets={ticketData}
                  onHide={handleHideTicket}
                  hiddenTickets={hiddenTickets}
                />

                {tickets.meta.total > tickets.meta.perPage && (
                  <Pagination
                    currentPage={tickets.meta.currentPage}
                    lastPage={tickets.meta.lastPage}
                    onPageChange={goToPage}
                  />
                )}
              </div>
            ) : (
              <EmptyState hasSearch={Boolean(search)} />
            )}
          </main>
        </div>
      </div>
    </>
  )
}

function formatDate(unixTimestemp: number) {
  return new Date(unixTimestemp)
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, '')
}

function calculatePagination({ currentPage, perPage, total }: AppProps['tickets']['meta']) {
  const startItem = (currentPage - 1) * perPage + 1
  const endItem = Math.min(currentPage * perPage, total)

  return total < 20
    ? `Showing ${total} ${total > 1 ? 'issues' : 'issue'}`
    : `Showing ${startItem} - ${endItem} of ${total} issues`
}
