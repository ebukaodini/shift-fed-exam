import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'tickets';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.string('id').primary();
            table.string('title').notNullable();
            table.text('content').notNullable();
            table.string('user_email').notNullable();
            table.bigInteger('creation_time').notNullable();
            table.text('labels').nullable();
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1749539793614_create_create_tickets_table.js.map