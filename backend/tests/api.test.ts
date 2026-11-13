import request from 'supertest';
import { app } from '../src/app';

describe('HireFlow API Health & Public Endpoints', () => {
  it('GET /health should return 200 and operational status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ONLINE');
  });

  it('GET /api-docs should return redirect or HTML for Swagger docs', async () => {
    const res = await request(app).get('/api-docs/');
    expect([200, 301, 302]).toContain(res.status);
  });

  it('GET non-existent route should return 404', async () => {
    const res = await request(app).get('/api/v1/non-existent-route-404');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/register should fail with 400 if validation fails', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email' }); // Missing required fields and bad email

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/v1/auth/login should fail with 400 if missing password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

