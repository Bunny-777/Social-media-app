const express=require('express');
const app=express();
const path=require('path');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const userModel=require('./models/user');
const postModel=require('./models/post');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());

app.set('view engine','ejs');

app.get('/',function(req,res){
    res.render('index');
})

app.get('/index',function(req,res){
    res.render('index');
})

app.post('/register', async function(req,res){
    let{username,name,email,age,password}=req.body;
    let user=await userModel.findOne({email});
    if(user){
        return res.status(500).send("User already exists");
    }

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, async function(err, hash) {
            let user= await userModel.create({
                username,
                name,
                password:hash,
                email,
                age
            })

            let token=jwt.sign({email:email,userid:user._id},"secret");
            res.cookie('token',token);
            let allPosts=await postModel.find().populate('user');
            res.render('home',{user,allPosts});

        });
    });
})

app.get('/login',function(req,res){
    res.render('login');
})


app.post('/login', async function(req,res){
    let{email,password}=req.body;
    let user=await userModel.findOne({email});
    if(!user){
        return res.status(500).send("Either email or password is wrong");
    }
    bcrypt.compare(password,user.password, function(err, result) {
        if(result){
            let token=jwt.sign({email:email,userid:user._id},"secret");
            res.cookie('token',token);
            res.status(200).redirect("home");
        } 
        else{
            res.redirect('/login');
        }
    });
})


app.get('/home',isLoggedIn, async function(req,res){ 
    let user=await userModel.findOne({email:req.user.email}).populate('posts');
    let allPosts=await postModel.find().populate('user');
    res.render('home',{user,allPosts});
})

app.get('/profile',isLoggedIn, async function(req,res){ 
    let user=await userModel.findOne({email:req.user.email}).populate('posts');
    console.log(user);
    res.render('profile',{user});
})

app.post('/post',isLoggedIn,async function(req,res){
    let user= await userModel.findOne({email:req.user.email});
    let {content}=req.body;
    let post= await postModel.create({
        user:user._id,
        content
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect('/profile');

})

app.get('/logout',function(req,res){
    res.cookie('token','');
    res.redirect('login');
})


function isLoggedIn(req,res,next){
    if(req.cookies.token==='') return res.redirect('login')
    else{
        let data=jwt.verify(req.cookies.token,'secret');
        req.user=data;
    }
    next();
}

app.listen(3001);