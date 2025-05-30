import request from 'supertest';
import app from '../server/src/app';

describe('API Endpoints', () => {
  test('GET /api/health should return health status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /api/info should return app info', async () => {
    const response = await request(app).get('/api/info');
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('全栈应用启动成功');
    expect(response.body).toHaveProperty('version');
  });

  test('GET /api/users should return users list', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(2);
    expect(response.body.users[0]).toHaveProperty('id');
    expect(response.body.users[0]).toHaveProperty('name');
    expect(response.body.users[0]).toHaveProperty('email');
  });

  test('POST /api/users should create new user', async () => {
    const newUser = {
      name: 'Test User',
      email: 'test@example.com'
    };

    const response = await request(app)
      .post('/api/users')
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.name).toBe(newUser.name);
    expect(response.body.email).toBe(newUser.email);
    expect(response.body).toHaveProperty('id');
  });

  test('POST /api/users should validate required fields', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Name and email are required');
  });
});
