const  express = require('express');
const  router = express.Router();
const  Feedback = require('../models/feedback');
const  {uploadImage} = require('../controllers/util.js');
const  {getByBbox,getByTile,all,getAllByDate,getAllByDateToManage,sortByLocationWithDistance,
    createUserId,getFeedbackByUserId,reviewFeedback,assignFeedback,doneFeedback,closeFeedback,
    create,findAll,displayImage,findById} = require('../controllers/feedback.js');
const  multer = require('multer');
const  jwt = require('express-jwt');
const config = require('../config/configure')
// const  jwtCheck = jwt({
//   secret: new Buffer.from('erymg2LEtnB8A0grwqLJlj-Je3M_9MsGJzFPk-ToNXFQ341e4R1p5cEMk2IKusYD', 'base64'),
//   audience: 'WX0fySfhhSe9mRR5xAkELIJKnYnLczBQ'
// });

const checkJwt = jwt({
    secret: Buffer.from(config.secretKey, 'base64'),
    algorithms: ['RS256'],
    audience: config.audience,
    // issuer: 'https://dev-0gy0vn9g.us.auth0.com/',
    // getToken: function fromHeaderOrQuerystring(req) {
    //   if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    //     return req.headers.authorization.split(' ')[1];
    //   } else if (req.query && req.query.token) {
    //     return req.query.token;
    //   }
    //   return null;
    // }
  });

router.get('/:bbox/geojson', getByBbox);
router.get('/:z/:x/:y/geojson', getByTile);
router.get('/geojson', all);

router.get('/getallbydate', getAllByDate); //get all feedback before request time
router.get('/getallbydatetomanage', getAllByDateToManage);
router.get('/sortbylocationdistance', sortByLocationWithDistance);
router.post('/createuserid', createUserId);
router.get('/getfeedbackbyuserid', checkJwt, getFeedbackByUserId);
router.post('/review', multer().array(), reviewFeedback);
router.post('/assign', multer().array(), assignFeedback);
router.post('/done', uploadImage.array('images', 18), doneFeedback);
router.delete('/:id/reject', closeFeedback);
router.post('/', uploadImage.array('images', 18), create);
router.get('/', findAll);
router.get('/uploads/:imageName', displayImage);
router.get('/:id', findById);

router.param('id', function (req, res, next, id) {
    Feedback.load(id, function (id, f) {
        req.feedback = f;
        next();
    });
});

module.exports = router;