import express from 'express';

const router = express.Router();

// Middleware example - logger
router.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Example route for GET request
router.get('/api/users', (req, res) => {
    // Logic to get users
    res.send('Get users');
});

// Example route for POST request
router.post('/api/users', (req, res) => {
    // Logic to create a new user
    res.send('User created');
});

// Example route for PUT request
router.put('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    // Logic to update the user with userId
    res.send(`User ${userId} updated`);
});

// Example route for DELETE request
router.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    // Logic to delete the user with userId
    res.send(`User ${userId} deleted`);
});

export default router;
