const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const mongoose = require('mongoose')
const passport = require('passport')
const expressSession = require('express-session')
const MongoStore = require('connect-mongo')
const cors = require('cors')
const Staff = require('./models/Staff')
const Student = require('./models/Student')
require('dotenv').config()

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')

const app = express()
const corsOptions = {
  origin: '*',
  credentials: true,
  // accessControlAllowCredentials: true,
  optionSuccessStatus: 200
}
app.use(cors(corsOptions))

app.use(expressSession({
  secret: process.env.SECRET,
  store: MongoStore.create({
    mongoUrl: process.env.DB_URL,
    ttl: 14 * 24 * 60 * 60,
    autoRemove: 'native'
  }),
  saveUninitialized: false,
  cookie: { maxAge: 1 * 60 * 60 * 1000 },
  resave: true
}))

const studentRouter = require('./routes/studentRoute')
const staffRouter = require('./routes/staffRoute')
const adminRouter = require('./routes/AdminRoute')
const teacherRouter = require('./routes/teacherRoute')

// mongodb://localhost:27017/newsrms

// //connect to db
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
mongoose.Promise = global.Promise

// test DB connection
mongoose.connection
  .once('open', () => {
    console.log('mongodb started')
    // connect the server if DB is UP
    // http.listen(PORT, () => {
    //   console.log(`server started `)
    // })
  })
  .on('error', (error) => {
    console.log('error occured:', error)
  })

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// app.use(multipart());

// passport setup
app.use(passport.initialize())
app.use(passport.session())

passport.use('staff', Staff.createStrategy())
passport.use('student', Student.createStrategy())

passport.serializeUser(function (user, done) {
  const key = {
    id: user.id,
    type: user.userType
  }
  done(null, key)
})

passport.deserializeUser(function (key, done) {
  key.type === 'staff'
    ? Staff.findById(key.id, function (err, user) {
      done(err, user)
    })
    : Student.findById(key.id, function (err, user) {
      done(err, user)
    })
})

app.use('/staff', staffRouter)
app.use('/student', studentRouter)
app.use('/admin', adminRouter)
app.use('/teacher', teacherRouter)

app.use('/', indexRouter)
app.use('/users', usersRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
