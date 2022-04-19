import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL , {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db =  mongoose.connection;

const handleOpen = () => console.log("✅ Connected to DB");
const handleError = (error) => console.log("❌ DB Error", error);

db.on("error",handleError); // on ->여러번 실행 가능
db.once("open",handleOpen); // once -> 한번만 실행 가능
