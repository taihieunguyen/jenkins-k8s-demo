const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('<h1>CI/CD Hoàn Toàn Tự Động Với Jenkins & Kubernetes trên Docker Desktop! 🚀</h1>');
});

// Xuất app ra để file test có thể gọi được
module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => console.log(`Ứng dụng đang chạy tại port ${PORT}`));
}