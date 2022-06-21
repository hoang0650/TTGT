const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const settingRouter = require('./routes/setting');
const cameraRouter = require('./routes/cameras');
const cameraGroupRouter = require('./routes/cameras.groups');
const cameraSnapshotRouter = require('./routes/cameras.snapshot');
const configurationRouter = require('./routes/configuration');
const eventRouter = require('./routes/event');
const commentRouter = require('./routes/comment');
const config = require('./config/configure');
const parkingRouter = require('./routes/parking');
const departmentRouter = require('./routes/department');
const extraRouter = require('./routes/extra');
const feedbackRouter = require('./routes/feedback');
const feedbacktypeRouter = require('./routes/feedback.type');
const monitorsRouter = require('./routes/monitors');
const newsRouter = require('./routes/news');
const roadeventRouter = require('./routes/roadevent');
const roadworkRouter = require('./routes/roadwork');
const staticRouter = require('./routes/static');
const staticmapRouter = require('./routes/staticmap');
const statsRouter = require('./routes/stats');
const groupRouter = require('./routes/userGroups');
const {getPermissions} = require('./controllers/permissions');
const roleAccessApi = require('./config/roleApi.json');
const cors = require('cors');
const jwt = require('express-jwt');
const dotenv = require('dotenv');
const {getSnapShot} = require('./controllers/cammeras.snapshots')
const {getImageError} = require('./controllers/setting.js');
dotenv.config();


//set up mongoose
const mongoose = require('mongoose');

function mongooseSetup() {
  mongoose.connect(process.env.MDB_CONNECT,{
      useNewUrlParser: true,
      useUnifiedTopology: true,
  })

  mongoose.connection.on('connected', function(){
    console.info('Connected to database at ' + process.env.MDB_CONNECT);
  })

  mongoose.connection.on('error',function(err){
    console.error('Mongoose default connection has occured ' + err + ' error');
  })

  mongoose.connection.on('disconnected', function(){
    console.warn('Database connection is disconnected');
  })

  process.on('SIGINT', function(){
    mongoose.connection.close(function(){
        console.log(termination('Database connection is disconnected due to application termination'));
        process.exit(0);
    })
  })
}

mongooseSetup();


//
const checkJwt = jwt({
  secret: Buffer.from(config.secretKey, 'base64'),
  algorithms: ['RS256'],
  audience: config.audience,
  issuer: 'https://dev-0gy0vn9g.us.auth0.com/',
  getToken: function fromHeaderOrQuerystring(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  }
});



//Midleware for check Auth
function checkAuth(req, res, next) {
  const isUnless = true;
  config.listApiNotAuthenticate.forEach(function (api) {
  if (req.originalUrl.match(api)) {
      isUnless = true;
  }
  });
  if (isUnless) {
    req.notNeedAuth = true;
    return next();
  }
  const roles = req.user['https://hoang0650.com/roles'];
  console.log('req.body',req.body);
  req.user.app_metadata = {
    roles: roles
  };
  console.log(roles);

  if (roles && roles.length > 0) {
    const apiAccess = roleAccessApi[roles];

    if (apiAccess && apiAccess.length > 0) {
      const containInList = true;
      apiAccess.forEach(function (api) {
        if (req.method === api.method) {
          if (req.originalUrl.match(new RegExp(api.url))) {
            containInList = true;
          }
        }
      });
      if (!containInList) {
        return res.status(401).end();
      } else {
        return next();
      }
    } else {
      res.status(401).end();
    }
  } else {
    return res.status(401).end();
  }
}
const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/setting/getimageerror', getImageError);
app.use(checkJwt);
// app.use('/api', indexRouter);
// mở ra khi check valid token
app.use('/api',checkJwt.unless({
  path: config.listApiNotAuthenticate
}), checkAuth, getPermissions);
app.use('/api/admin', adminRouter);
app.use('/api/static', staticRouter);
app.use('/api/parking', parkingRouter);
app.use('/api/cameras/groups', cameraGroupRouter);
app.use('/api/cameras', cameraRouter);
app.use('/api/snapshot', cameraSnapshotRouter);
app.use('/api/event', eventRouter);
app.use('/api/extras', extraRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/department', departmentRouter);
app.use('/api/comment', commentRouter);
app.use('/api/fbtype', feedbacktypeRouter);
app.use('/api/user', usersRouter);
app.use('/api/roadevent', roadeventRouter);
app.use('/api/staticmap', staticmapRouter);
app.use('/api/setting', settingRouter);
app.use('/api/configuration', configurationRouter);
app.use('/api/groups', groupRouter);
app.use('/api/news', newsRouter);
app.use('/api/roadwork', roadworkRouter);
app.use('/api/monitors', monitorsRouter);
app.use('/api/stats', statsRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
