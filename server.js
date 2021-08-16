const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config');

const { MONGO_URI } = config;

const app = express();

// Init middleware
app.use(express.json({ extended: false }));

// DB Config
const db = MONGO_URI;

// Connect to Mongo
const connectDB = async () => {
	try {
		await mongoose.connect(db, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		});

		console.log('MongoDB connected...');
	} catch (err) {
		console.log(err.message);
		process.exit(1);
	}
};

connectDB();

// Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
	// Set static folder
	app.use(express.static('client/build'));

	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
