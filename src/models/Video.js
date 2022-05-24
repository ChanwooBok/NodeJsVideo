import mongoose from "mongoose";

// mongoose 로 하여금 비디오 스키마 형식을 알려줘서 해당 모델이 해당 형식으로만 저장되게끔 도와주도록 한다.
// mongoose가 잘못된 정보를 저장하면 데이터 타입의 유효성을 검사해서 알맞지 않으면 저장하지 않도록 도와준다.
// 예 : meta의 views, rating은 숫자인데 "sdfjasdljfkq" 적으면 meta는 저장되지 않은채 생성된다.  

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxLength: 80 },
    fileUrl: { type: String, required: true },
    description: { type: String, required: true, trim: true, minLength: 20 },
    createdAt : {type : Date , required : true , default : Date.now},
    hashtags: [{ type: String, trim: true }],
    meta:{
        views: { type : Number , default : 0 , required : true},
        rating: { type : Number , default : 0 , required : true },
    },
    owner:{type:mongoose.Schema.Types.ObjectId , required : true, ref:"User"}, 
    // ref를 꼭 써주어야 한다. 그래야 ,_id가 User에서 온 것이란것을 mongoose에게 알려 줄 수 있다.
});


 /* pre.save 미들웨어를 이용한 방법 */
// videoSchema.pre("save" , async function(){
//     this.hashtags = this.hashtags[0]
//             .split(",")
//             .map( (word) => (word.startsWith("#") ? word : `#${word}`));
//   });

// 
  
/* static을 이용하여 video function을 만드는 방법  */
videoSchema.static("formatHashtags", function( hashtags ){
    return hashtags
            .split(",")
            .map( (word) => (word.startsWith("#") ? word : `#${word}`));
});


const Video = mongoose.model("Video",videoSchema);

export default Video;
