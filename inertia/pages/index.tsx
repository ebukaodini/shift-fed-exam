import { useState, useCallback, useRef, useLayoutEffect } from 'react'
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

function TicketsList({
  tickets,
  hiddenTickets,
  onHide,
}: {
  tickets: Ticket[]
  hiddenTickets: string[]
  onHide: (ticketId: string) => void
}) {
  return (
    <ul className="space-y-4">
      {tickets
        .filter((t) => !hiddenTickets.includes(t.id))
        .map((ticket) => (
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
              {ticket.labels && ticket.labels.length > 0 && (
                <div className="w-full sm:w-fit overflow-auto flex space-x-2">
                  {ticket.labels.map((label) => (
                    <div
                      key={label}
                      className="border border-blue-200 rounded-md bg-blue-100 text-sand-11 text-xs px-2 py-1 font-medium whitespace-nowrap"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </footer>
          </li>
        ))}
    </ul>
  )
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="text-center py-12">
      <div className="text-lg text-sand-11">
        {hasSearch ? 'No issues found matching your search.' : 'No security issues found.'}
      </div>
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

  useLayoutEffect(() => {
    const searchParam = new URLSearchParams(window.location.search).get('search') || ''
    setSearch(searchParam.trim())
  }, [])

  const handleSearch = useCallback(function handleSearch(value: string) {
    setSearch(value)
    router.get('/', value ? { search: value.trim() } : {}, { preserveState: true, replace: true })
  }, [])

  const ticketData = tickets?.data || []

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
              <div className="text-sm text-sand-11 mb-4">
                Showing {ticketData.length} of {tickets.meta.total} issues
                {hiddenTickets.length > 0 && (
                  <span className="ml-1 italic">
                    ({hiddenTickets.length} hidden {hiddenTickets.length > 1 ? 'tickets' : 'ticket'}{' '}
                    -{' '}
                    <button onClick={handleRestoreTickets} className="italic !text-blue-600">
                      restore
                    </button>
                    )
                  </span>
                )}
              </div>
            )}

            {ticketData.length > 0 ? (
              <TicketsList
                tickets={ticketData}
                onHide={handleHideTicket}
                hiddenTickets={hiddenTickets}
              />
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
