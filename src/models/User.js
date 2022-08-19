import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const userSchema  =  new mongoose.Schema( { 
    email : {type : String , required : true, unique : true},
    avatarUrl: String,
    socialOnly: { type: Boolean, default: false },
    password : {type : String },
    username : {type : String , required : true},
    name :  {type : String , required : true} , 
    location: String ,
    videos : [{type:mongoose.Schema.Types.ObjectId , ref:"Video"}], 
    comments: [ { type : mongoose.Schema.Types.ObjectId, ref: "Comment"}],
});



userSchema.pre("save",async function(){
    if(this.isModified("password")){
        //기존에 save만 한다고 해서 비밀번호를 전부 hash 하면 video를 업로드 할 때 마다 비밀번호가 hash처리되는 버그 발생.
        // 따라서 password가 modified 일때만 hash처리 하도록 한다. 
        this.password = await bcrypt.hash(this.password, 5 );
    }
});


const User = mongoose.model("User",userSchema);


export default User;