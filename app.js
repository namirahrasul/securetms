const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const { checkUser } = require('./middleware/authMiddleware');

const app = express();
app.use(express.static('public'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(authRoutes);
app.use(taskRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = 'mongodb+srv://nrsl136:7cumQIDeM5beCsxi@namirah.cyj7pgp.mongodb.net/securetms';
mongoose.connect(dbURI)
 .then((result) => app.listen(3020, () => console.log('listening on port 3020')))
 .catch((err) => console.log(err));

app.get('/', (req, res) => res.render('index'));