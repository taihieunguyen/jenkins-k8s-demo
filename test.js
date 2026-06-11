const request = require('supertest');
const app = require('./app');

describe('Kiểm thử tự động ứng dụng Web', () => {
    it('Trang chủ phải trả về mã HTTP 200', (done) => {
        request(app)
            .get('/')
            .expect(200, done);
    });
});