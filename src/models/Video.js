import mongoose from "mongoose";

// mongoose 로 하여금 비디오 스키마 형식을 알려줘서 해당 모델이 해당 형식으로만 저장되게끔 도와주도록 한다.
// mongoose가 잘못된 정보를 저장하면 데이터 타입의 유효성을 검사해서 알맞지 않으면 저장하지 않도록 도와준다.
// 예 : meta의 views, rating은 숫자인데 "sdfjasdljfkq" 적으면 meta는 저장되지 않은채 생성된다.  
// createdAt은 Date인데 문자를 쓰면 default값으로 저장된다. 

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxLength: 80 },
    fileUrl: { type: String, required: true },
    thumbUrl: { type: String, required: true },
    description: { type: String, required: true, trim: true, minLength: 2 },
    createdAt : {type : Date , required : true , default : Date.now},
    hashtags: [{ type: String, trim: true }],
    meta:{
        views: { type : Number , default : 0 , required : true},
        rating: { type : Number , default : 0 , required : true },
    },
    comments: [
        { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" },
      ],
    owner:{type:mongoose.Schema.Types.ObjectId , required : true, ref:"User"}, 
    // ref를 꼭 써주어야 한다. 그래야 ,_id가 User에서 온 것이란것을 mongoose에게 알려 줄 수 있다.
});


 /* 1번째 시도 : pre.save 미들웨어를 이용한 방법 */
 /* 비디오를 새롭게 업로드할때도(save), 업데이트할때에도(update) videoSchema.pre("save") , videoSchema("update") 일일이 반복하기 귀찮음 */
videoSchema.pre("save" , async function(){
    this.hashtags = this.hashtags[0]
            .split(",")
            .map( (word) => (word.startsWith("#") ? word : `#${word}`));
  });
// 

/* 2번째 시도 : function으로 만들어서 가져다 쓰는방법 */
/* postupload, postedit등 두가지 모두에 반복적으로 써야 해서 반복이 귀찮다. */
// export const formatHashtag = (hashtags) => {
//     hashtags
//         .split(",")
//         .map( (word) => (word.startsWith("#") ? word : `#${word}`));
// };


/* 최종 방법 : static을 이용하여 video function을 만드는 방법  */
videoSchema.static("formatHashtags", function(hashtags) {
    return hashtags
        .split(",")
        .map((word) => (word.startsWith("#") ? word : `#${word}`));
} )

//middleware는 mongoose모델이 만들어지기 전에 생성해야 한다.
const Video = mongoose.model("Video",videoSchema);

export default Video;
