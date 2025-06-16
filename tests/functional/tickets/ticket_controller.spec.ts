import { test } from '@japa/runner'
import sinon from 'sinon'
import TicketsController from '../../../app/controllers/tickets_controller.js'
import Ticket from '#models/ticket'

// Helper to create a fake query builder with spies
function createFakeQueryBuilder() {
  const qb: any = {
    where: sinon.stub().returnsThis(),
    whereRaw: sinon.stub().returnsThis(),
    orderBy: sinon.stub().returnsThis(),
    paginate: sinon.stub().resolves({ toJSON: () => ({ data: [], meta: {} }) }),
    filter: sinon.stub().returnsThis(),
  }
  qb.where.callsFake(() => qb)
  qb.whereRaw.callsFake(() => qb)
  qb.orderBy.callsFake(() => qb)
  return qb
}

// Helper to create a fake HttpContext
function fakeCtx(overrides: { request?: any; inertia?: any; response?: any } = {}) {
  return {
    request: {
      input: sinon.stub().returns(''),
      ...overrides.request,
    },
    inertia: {
      render: sinon.stub(),
      ...overrides.inertia,
    },
    response: {
      header: sinon.stub(),
      send: sinon.stub(),
      ...overrides.response,
    },
  }
}

test.group('TicketsController.applyFilter', (group) => {
  let controller: TicketsController
  let qb: any
  let ticketQueryStub: sinon.SinonStub

  group.each.setup(() => {
    controller = new TicketsController()
    qb = createFakeQueryBuilder()
    ticketQueryStub = sinon.stub(Ticket, 'query').returns(qb)
  })

  group.each.teardown(() => {
    ticketQueryStub.restore()
    sinon.restore()
  })

  test('filters by search text (title/content)', ({ assert }) => {
    const query = controller['applyFilter']('sql injection', qb)
    assert.isTrue(qb.where.calledOnce)
    const whereFn = qb.where.firstCall.args[0]
    const builder = { whereRaw: sinon.stub().returnsThis(), orWhereRaw: sinon.stub().returnsThis() }
    whereFn(builder)
    assert.isTrue(builder.whereRaw.calledWith('LOWER(title) LIKE ?', ['%sql injection%']))
    assert.isTrue(builder.orWhereRaw.calledWith('LOWER(content) LIKE ?', ['%sql injection%']))
    assert.strictEqual(query, qb)
  })

  test('filters by before date', ({ assert }) => {
    const before = 'before:01/01/2023'
    controller['applyFilter'](before, qb)
    assert.isTrue(qb.where.calledWithMatch('creation_time', '<', sinon.match.number))
  })

  test('filters by after date', ({ assert }) => {
    const after = 'after:01/01/2023'
    controller['applyFilter'](after, qb)
    assert.isTrue(qb.where.calledWithMatch('creation_time', '>', sinon.match.number))
  })

  test('filters by reporter', ({ assert }) => {
    const reporter = 'reporter:someone@example.com'
    controller['applyFilter'](reporter, qb)
    assert.isTrue(qb.whereRaw.calledWith('LOWER(user_email) = ?', ['someone@example.com']))
  })

  test('handles invalid before/after date gracefully', ({ assert }) => {
    const before = 'before:notadate'
    const after = 'after:notadate'
    controller['applyFilter'](before, qb)
    controller['applyFilter'](after, qb)
    assert.isFalse(qb.where.calledWith('creation_time', '<', Number.NaN))
    assert.isFalse(qb.where.calledWith('creation_time', '>', Number.NaN))
  })

  test('handles empty search', ({ assert }) => {
    controller['applyFilter']('', qb)
    assert.isFalse(qb.where.called)
    assert.isFalse(qb.whereRaw.called)
  })

  test('throws if query builder fails', ({ assert }) => {
    const badQb = {
      where: () => {
        throw new Error('DB error')
      },
      whereRaw: () => badQb,
      orderBy: () => badQb,
    }
    assert.throws(() => controller['applyFilter']('test', badQb as any), 'DB error')
  })
})

test.group('TicketsController.index', (group) => {
  let controller: TicketsController
  let qb: any
  let ticketQueryStub: sinon.SinonStub

  group.each.setup(() => {
    controller = new TicketsController()
    qb = createFakeQueryBuilder()
    ticketQueryStub = sinon.stub(Ticket, 'query').returns(qb)
  })

  group.each.teardown(() => {
    ticketQueryStub.restore()
    sinon.restore()
  })

  test('index returns paginated tickets', async ({ assert }) => {
    const ctx = fakeCtx({
      request: {
        input: sinon.stub().withArgs('page', 1).returns(1).withArgs('search', '').returns(''),
      },
      inertia: { render: sinon.stub() },
    })
    qb.paginate.resolves({ toJSON: () => ({ data: [{ id: '1' }], meta: {} }) })
    await controller.index(ctx as any)
    assert.isTrue(ctx.inertia.render.calledOnce)
    assert.equal(ctx.inertia.render.firstCall.args[0], 'index')
    assert.equal(ctx.inertia.render.firstCall.args[1].tickets.data[0].id, '1')
  })

  test('index handles DB errors', async ({ assert }) => {
    const ctx = fakeCtx({
      request: { input: sinon.stub().returns('') },
      inertia: { render: sinon.stub() },
    })
    qb.paginate.rejects(new Error('DB failure'))
    await assert.rejects(async () => {
      await controller.index(ctx as any)
    }, /DB failure/)
  })
})
