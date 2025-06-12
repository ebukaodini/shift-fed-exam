import type { HttpContext } from '@adonisjs/core/http'
import Ticket from '#models/ticket'
import { parse } from 'date-fns'

export default class TicketsController {
  async index({ request, inertia }: HttpContext) {
    const page = request.input('page', 1)
    const pageSize = 20
    const search = request.input('search', '') as string
    let searchBeforeDate: number | undefined
    let searchAfterDate: number | undefined
    let reporterEmail: string | undefined
    let searchValue: string | undefined

    if (
      search.startsWith('before:') ||
      search.startsWith('after:') ||
      search.startsWith('reporter:')
    ) {
      const [filter, ...searchValues] = search.split(' ')
      searchValue = searchValues.join(' ').trim().toLowerCase()
      const [key, value] = filter.split(':')

      switch (key) {
        case 'before': {
          const beforeDate = parse(value, 'dd/MM/yyyy', new Date())
          beforeDate.setHours(0, 0, 0, 0)
          searchBeforeDate = beforeDate.getTime()
          if (Number.isNaN(searchBeforeDate)) searchBeforeDate = undefined
          break
        }
        case 'after': {
          const afterDate = parse(value, 'dd/MM/yyyy', new Date())
          afterDate.setHours(23, 59, 59, 999)
          searchAfterDate = afterDate.getTime()
          if (Number.isNaN(searchAfterDate)) searchAfterDate = undefined
          break
        }
        case 'reporter':
          reporterEmail = value.trim().toLowerCase()
          break
      }
    } else {
      searchValue = search.trim().toLowerCase()
    }

    let query = Ticket.query()

    if (searchValue) {
      query = query.where((builder) => {
        builder
          .whereRaw('LOWER(title) LIKE ?', [`%${searchValue}%`])
          .orWhereRaw('LOWER(content) LIKE ?', [`%${searchValue}%`])
      })
    }

    if (searchBeforeDate) {
      query = query.where('creation_time', '<', searchBeforeDate)
    }
    if (searchAfterDate) {
      query = query.where('creation_time', '>', searchAfterDate)
    }

    if (reporterEmail) {
      query = query.whereRaw('LOWER(user_email) = ?', [reporterEmail])
    }

    const tickets = await query.orderBy('creation_time', 'desc').paginate(page, pageSize)

    return inertia.render('index', {
      tickets: tickets.toJSON(),
    })
  }
}
