import "regenerator-runtime";
import "dotenv/config";
import "./db";
import "./models/Video";
import "./models/User";
import "./models/Comment";
import app from "./server";

// server.js 에서 init.js 로 분리시킨 이유 : server.js는 server의 configuration , express 관련된것들만 쓰려고.
// init.js 에는 database model 등 / 서버를 초기화 하는 코드를  다룬다. 
// server.js에서 서버를 초기화하지 않기떄문에 package.json에서 init.js를 지켜보도록 설정을 바꿔야한다.


const PORT = 4000;

const handleListening =  () => 
console.log(`✅✨Server Listening on port http://localhost:${PORT}🚀`);


app.listen(PORT , handleListening);