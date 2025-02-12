const mongoose=require('mongoose');
require('dotenv').config();
const mongo_uri=`${process.env.mongo_uri}/chat_app`;
console.log(mongo_uri);
mongoose.connect(mongo_uri);
const userSchema=mongoose.Schema({
    username:String,
    name:String,
    age:Number,
    email:String,
    password:String,
    profilepic:{
        type:String,
        default:"avatar.jpg"
    },      
    posts :[
        {type:mongoose.Schema.Types.ObjectId,ref:"post"}],
});

module.exports=mongoose.model('user',userSchema)