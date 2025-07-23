import { BaseSeeder } from '@adonisjs/lucid/seeders';
import Ticket from '#models/ticket';
import tempData from '../temp-data.json' with { type: 'json' };
export default class extends BaseSeeder {
    async run() {
        await Ticket.query().delete();
        await Ticket.createMany(tempData);
    }
}
//# sourceMappingURL=ticket_seeder.js.map