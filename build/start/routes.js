import router from '@adonisjs/core/services/router';
const TicketsController = () => import('#controllers/tickets_controller');
router.get('/', [TicketsController, 'index']);
router.get('/tickets/export/csv', [TicketsController, 'exportCsv']);
//# sourceMappingURL=routes.js.map