const express = require('express');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());

app.use('/patients', require('./routes/patientRoutes'));
app.use('/doctors', require('./routes/doctorRoutes'));
app.use('/appointments', require('./routes/appointmentRoutes'));
app.use('/waitlist', require('./routes/waitlistRoutes'));
app.use('/reports', require('./routes/reportRoutes'));
app.use('/feedback', require('./routes/feedbackRoutes'));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler); // must be last

module.exports = app;