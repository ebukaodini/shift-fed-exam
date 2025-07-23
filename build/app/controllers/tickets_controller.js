import Ticket from '#models/ticket';
import { parse } from 'date-fns';
import { stringify } from 'csv-stringify/sync';
export default class TicketsController {
    applyFilter(search, query) {
        let searchBeforeDate;
        let searchAfterDate;
        let reporterEmail;
        let searchValue;
        if (search.startsWith('before:') ||
            search.startsWith('after:') ||
            search.startsWith('reporter:')) {
            const [filter, ...searchValues] = search.split(' ');
            searchValue = searchValues.join(' ').trim().toLowerCase();
            const [key, value] = filter.split(':');
            switch (key) {
                case 'before': {
                    const beforeDate = parse(value, 'dd/MM/yyyy', new Date());
                    beforeDate.setHours(0, 0, 0, 0);
                    searchBeforeDate = beforeDate.getTime();
                    if (Number.isNaN(searchBeforeDate))
                        searchBeforeDate = undefined;
                    break;
                }
                case 'after': {
                    const afterDate = parse(value, 'dd/MM/yyyy', new Date());
                    afterDate.setHours(23, 59, 59, 999);
                    searchAfterDate = afterDate.getTime();
                    if (Number.isNaN(searchAfterDate))
                        searchAfterDate = undefined;
                    break;
                }
                case 'reporter':
                    reporterEmail = value.trim().toLowerCase();
                    break;
            }
        }
        else {
            searchValue = search.trim().toLowerCase();
        }
        if (searchValue) {
            query = query.where((builder) => {
                builder
                    .whereRaw('LOWER(title) LIKE ?', [`%${searchValue}%`])
                    .orWhereRaw('LOWER(content) LIKE ?', [`%${searchValue}%`]);
            });
        }
        if (searchBeforeDate) {
            query = query.where('creation_time', '<', searchBeforeDate);
        }
        if (searchAfterDate) {
            query = query.where('creation_time', '>', searchAfterDate);
        }
        if (reporterEmail) {
            query = query.whereRaw('LOWER(user_email) = ?', [reporterEmail]);
        }
        return query;
    }
    async index({ request, inertia }) {
        const page = request.input('page', 1);
        const pageSize = 20;
        const search = request.input('search', '');
        let query = Ticket.query();
        query = this.applyFilter(search, query);
        const tickets = await query.orderBy('creation_time', 'desc').paginate(page, pageSize);
        return inertia.render('index', {
            tickets: tickets.toJSON(),
        });
    }
    async exportCsv({ request, response }) {
        const search = request.input('search', '');
        const hidden = request.input('hidden', '');
        let query = Ticket.query();
        query = this.applyFilter(search, query);
        let tickets = await query.orderBy('creation_time', 'desc');
        if (hidden.length > 0) {
            const hiddenTicketIds = hidden.split(',');
            tickets = tickets.filter((t) => !hiddenTicketIds.includes(t.id));
        }
        const records = tickets.map((t) => ({
            id: t.id,
            title: t.title,
            content: t.content,
            userEmail: t.userEmail,
            labels: (t.labels || []).join(', '),
            creationTime: new Date(t.creationTime).toISOString(),
        }));
        const csv = stringify(records, { header: true });
        response.header('Content-Type', 'text/csv');
        response.header('Content-Disposition', `attachment; filename="security-issues${search && '-' + search.replaceAll(' ', '-')}.csv"`);
        return response.send(csv);
    }
}
//# sourceMappingURL=tickets_controller.js.map