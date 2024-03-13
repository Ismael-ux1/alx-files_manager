const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

const expect = chai.expect;

chai.use(chaiHttp);

// Tests for GET /status endpoint
describe('GET /status', () => {
  it('responds with status code 200', async () => {
    const res = await chai.request(app).get('/status');
    expect(res).to.have.status(200);
  });
});

// Tests for GET /stats endpoint
describe('GET /stats', () => {
  it('responds with status code 200', async () => {
    const res = await chai.request(app).get('/stats');
    expect(res).to.have.status(200);
  });
});

// Tests for POST /users endpoint
describe('POST /users', () => {
  it('responds with status code 201', async () => {
    const userData = { email: 'bob@dylan.com', password: 'toto1234!' };
    const res = await chai.request(app).post('/users').send(userData);
    expect(res).to.have.status(201);
  });
});

// Tests for GET /connect endpoint
describe('GET /connect', () => {
  it('responds with status code 200', async () => {
    const res = await chai.request(app).get('/connect');
    expect(res).to.have.status(200);
  });
});

// Tests for GET /disconnect endpoint
describe('GET /disconnect', () => {
  it('responds with status code 200', async () => {
    const res = await chai.request(app).get('/disconnect');
    expect(res).to.have.status(200);
  });
});

// Tests for GET /users/me endpoint
describe('GET /users/me', () => {
  it('responds with status code 200', async () => {
    const res = await chai.request(app).get('/users/me');
    expect(res).to.have.status(200);
  });
});

// Tests for POST /files endpoint
describe('POST /files', () => {
  it('responds with status code 201', async () => {
    const fileData = { name: 'image.png', content: 'This is a test file.' };
    const res = await chai.request(app).post('/files').send(fileData);
    expect(res).to.have.status(201);
  });
});

// Tests for GET /files/:id endpoint
describe('GET /files/:id', () => {
  it('responds with status code 200', async () => {
    const fileId = '65f20b93158a263be3021d7a';
    const res = await chai.request(app).get(`/files/${fileId}`);
    expect(res).to.have.status(200);
  });
});

// Tests for GET /files endpoint with pagination
describe('GET /files (pagination)', () => {
  it('responds with status code 200', async () => {
    const page = 1;
    const limit = 10;
    const res = await chai.request(app).get(`/files?page=${page}&limit=${limit}`);
    expect(res).to.have.status(200);
  });
});

// Tests for PUT /files/:id/publish endpoint
describe('PUT /files/:id/publish', () => {
  it('responds with status code 200', async () => {
    const fileId = '65f20b93158a263be3021d7a';
    const res = await chai.request(app).put(`/files/${fileId}/publish`);
    expect(res).to.have.status(200);
  });
});

// Tests for PUT /files/:id/unpublish endpoint
describe('PUT /files/:id/unpublish', () => {
  it('responds with status code 200', async () => {
    const fileId = '65f20b93158a263be3021d7a';
    const res = await chai.request(app).put(`/files/${fileId}/unpublish`);
    expect(res).to.have.status(200);
  });
});

// Tests for GET /files/:id/data endpoint
describe('GET /files/:id/data', () => {
  it('responds with status code 200', async () => {
    const fileId = '65f20b93158a263be3021d7a';
    const res = await chai.request(app).get(`/files/${fileId}/data`);
    expect(res).to.have.status(200);
  });
});

