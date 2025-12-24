"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./lib/db"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const socialAccountsRoutes_1 = __importDefault(require("./routes/socialAccountsRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const scheduleRoutes_1 = __importDefault(require("./routes/scheduleRoutes"));
const express_2 = require("@clerk/express");
require("./workers");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, express_2.clerkMiddleware)());
app.get('/', (req, res) => {
    res.send('PostPilot API running...');
});
app.use('/api', userRoutes_1.default);
app.use('/api', socialAccountsRoutes_1.default);
app.use('/api', postRoutes_1.default);
app.use('/api', analyticsRoutes_1.default);
app.use('/api', scheduleRoutes_1.default);
// Use requireAuth() to protect this route
// If user isn't authenticated, requireAuth() will redirect back to the homepage
app.get('/protected', (0, express_2.requireAuth)(), async (req, res) => {
    // Use `getAuth()` to get the user's `userId`
    const { userId } = (0, express_2.getAuth)(req);
    if (!userId) {
        return res.status(401).json({ error: 'User ID not found' });
    }
    // Use Clerk's JavaScript Backend SDK to get the user's User object
    const user = await express_2.clerkClient.users.getUser(userId);
    return res.json({ user });
});
process.on('SIGTERM', async () => {
    console.log('Shutting down workers...');
    // Workers will be cleaned up automatically
    process.exit(0);
});
//test route to check if database is working or not
app.get('/api/test-db', async (req, res) => {
    try {
        const countUser = await db_1.default.user.count();
        res.json({ count: countUser });
    }
    catch (error) {
        console.error('Error connecting to the database:', error);
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
