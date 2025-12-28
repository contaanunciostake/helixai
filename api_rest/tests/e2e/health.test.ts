/**
 * ════════════════════════════════════════════════════════════════
 * HEALTH CHECK - E2E TESTS
 * ════════════════════════════════════════════════════════════════
 */

import request from 'supertest';
import app from '@/app';

describe('Health Check Endpoints', () => {
  describe('GET /health', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('docs');
      expect(response.body).toHaveProperty('health');
    });
  });

  describe('GET /api', () => {
    it('should return API endpoints information', async () => {
      const response = await request(app).get('/api');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('GET /invalid-route', () => {
    it('should return 404 for invalid routes', async () => {
      const response = await request(app).get('/invalid-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});
