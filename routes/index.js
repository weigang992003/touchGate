var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    //  res.render('index', { title: 'Express' });
    res.render('home');
});
router.get('/home', function(req, res) {
    res.render('home');
});

router.get('/login', function(req, res) {
    res.render('login');
});

router.get('/signin', function(req, res) {
    res.render('signin');
});

router.get('/about', function(req, res) {
    res.render('about');
});

router.get('/ledger', function(req, res) {
    res.render('ledger');
});
module.exports = router;
