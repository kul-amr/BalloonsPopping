const express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
require('./models/user')
require('./models/userscore')
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;

db.on('error',console.error.bind(console,'connection error: '));

db.once('open', function(){
    console.log('connected');
});

var User = mongoose.model('User');
var UserScore = mongoose.model('UserScore');
const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    key:'user_sid',
    secret:'mytestsecret',
    resave:false,
    saveUninitialized:false,
    cookie:{
        expires:600000
    }
}));

app.use((req,res,next)=>{
    if(req.cookies.user_sid && !req.session.user){
        res.clearCookie('user_sid');
    }
    next();
});

var sessionChecker = (req,res,next)=>{
    if(req.cookies.user_sid && req.session.user){
        res.redirect('/test');
    }else{
        next();
    }
}

var auth = function(req,res,next){
    if(req.session && req.session.admin){
        return next();
    }else{
        return res.sendStatus(401);
    }
};

app.get('/',sessionChecker,(req,res)=>{
    res.redirect('/login');
})

app.route('/login')
    .get(sessionChecker,(req,res)=>{
        res.sendFile(__dirname +'/public/login.html');
    })
    .post(async (req,res)=>{
        var user = await User.findOne({name:req.body.username});

        console.log('user is : ',user);

        if(user){
            var validPwd = await user.validPassword(req.body.password);
            if (validPwd){
                req.session.user = user.name;
                req.session.admin=true;
                res.redirect('/game');
            }else{
                res.redirect('/loginfail');
            }
        }else{
            res.redirect('/loginfail');
        }
})

app.get('/logout',(req,res)=>{
    if(req.session.user && req.cookies.user_sid){
        res.clearCookie('user_sid');
        res.redirect('/');
    }else{
        res.redirect('/login');
    }
})

app.route('/register')
    .get(sessionChecker, (req,res)=>{
        res.sendFile(__dirname +'/public/register.html');
    })
    .post(async (req,res)=>{
        var user = await User.findOne({name:req.body.username});
        
        if(user){
            res.status(400).send('User already exists');
        }else{
            var user = new User();
            user.name = req.body.username;
            user.setPassword(req.body.password);

            user.save((err)=>{
                req.session.user = req.body.username;
                req.session.admin = true;
                res.redirect('/test');
            })
        }
    })

app.get('/test',auth,(req,res)=>{
    console.log('came to test, yyoohooo login success!!');
    res.send('available only after login')
})

app.get('/game',auth, (req,res)=>{
    res.sendFile(__dirname + '/game.html');
    console.log('callig this : ');
    console.log(req.body);
})

app.get('/loginfail',(req,res)=>{
    res.sendFile(__dirname + '/public/loginfail.html');
})

app.route('/score')
    .post(async (req,res)=>{
        console.log('data as : ');
        console.log(req.body);
        var userscore = new UserScore();
        userscore.name = req.session.user;
        userscore.score = req.body.scoreval;
        userscore.scoredate = (new Date()).getTime();

        userscore.save((err)=>{
            if(err){
                console.log('its error!!');
            }else{
                console.log('data inserted');
            }
        })
    })

app.use('/scripts',express.static(__dirname + '/scripts'));

app.use((req,res,next)=>{
    console.log('its here');
    res.status(404).send('can not find that');
})



app.listen(3000,()=>console.log("pop-pop listening on port 3000"))