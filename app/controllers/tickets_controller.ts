import type { HttpContext } from '@adonisjs/core/http'
import Ticket from '#models/ticket'

export default class TicketsController {
  async index({ request, inertia }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '').trim().toLowerCase()
    const pageSize = 20

    let query = Ticket.query()
    if (search) {
      query = query.where((builder) => {
        builder
          .whereRaw('LOWER(title) LIKE ?', [`%${search}%`])
          .orWhereRaw('LOWER(content) LIKE ?', [`%${search}%`])
      })
    }

    const tickets = await query.orderBy('creation_time', 'desc').paginate(page, pageSize)

    return inertia.render('index', {
      tickets: tickets.toJSON(),
    })
  }
}
