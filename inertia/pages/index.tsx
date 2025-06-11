import { useState, useCallback } from 'react'
import { Head } from '@inertiajs/react'

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
            <p className="text-sand-11 mb-4">{ticket.content}</p>
            <footer>
              <div className="text-sm text-sand-10">
                By {ticket.userEmail} | {formatDate(ticket.creationTime)}
              </div>
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

  const handleSearch = useCallback(function handleSearch(value: string) {
    setSearch(value)
  }, [])

  const ticketData =
    tickets?.data.filter((t) =>
      (t.title.toLowerCase() + t.content.toLowerCase()).includes(search.toLowerCase())
    ) || []

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
