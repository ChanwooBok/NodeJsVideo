const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//css를 javascript파일과 분리시켜주는 기능 , css변화시마다 js로딩 기다리기 싫어서 설치
const path = require("path");

const BASE_JS = "./src/client/js/";

module.exports = {
  entry: {
    main:BASE_JS+"main.js",
    videoPlayer:BASE_JS+"videoPlayer.js",
    recorder:BASE_JS+"recorder.js",
    commentSection:BASE_JS+"commentSection.js",
    //밑에서 filename을 js/[name].js로 설정해서 name안에 각 항목이 들어간다.
  },
  // mode: development
  //watch: true, // 새로 저장 할 때 마다 새롭게 바로 업데이트 -> command로 package.json script에다가 추가해주었다. 개발모드시에만 사용하고싶은 설정이므로.
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/styles.css",
    })
  ],
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"), // __dirname은 현재 경로를 나타냄
    clean: true, // 업뎃시 기존 파일 지워주고 새로 만들어줌.
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader", 
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
};