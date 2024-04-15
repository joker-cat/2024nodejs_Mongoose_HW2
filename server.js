const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { resSuccessWrite, resFaildWrite } = require("./fnModule/resModule");
const { validateKey } = require("./fnModule/validateModule");
const { schema, options } = require("./fnModule/schemaModule");

// 引用環境變數檔
dotenv.config({ path: "./config.env" });
const dbUrl = process.env.URL.replace("<password>", process.env.PASSWORD);

// 連接資料庫
// 如果localhost連接失敗，請改成127.0.0.1，此問題可能為 node / npm 版本造成
mongoose
  .connect(dbUrl)
  .then(() => console.log("資料庫連線成功"))
  .catch((error) => console.error("資料庫連線失敗"));

// 設定Schema
const postSchema = new mongoose.Schema(schema, options);

// 關聯
const Post = mongoose.model("post", postSchema);

const reqListen = async (req, res) => {
  if (req.url === "/favicon.ico") return;

  let body = "";
  req.on("data", (chunk) => (body += chunk));

  if (req.url === "/posts" && req.method === "GET") {
    const data = await Post.find();
    resSuccessWrite(res, 200, data);
  } else if (req.url === "/posts" && req.method === "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const { name, content, type } = data;

        if (name !== undefined && content !== undefined && type !== undefined) {
          const newPost = await Post.create(data);
          resSuccessWrite(res, 200, newPost);
        } else {
          resFaildWrite(res, 400, "資料屬性值缺少");
        }
      } catch (error) {
        resFaildWrite(res, 400, "資料格式有誤");
      }
    });
  } else if (req.url.startsWith("/posts/") && req.method === "DELETE") {
    const id = req.url.split("/").pop();
    try {
      const delStatus = await Post.findByIdAndDelete(id); //藉由 id 刪除
      if (delStatus !== null) {
        resSuccessWrite(res, 200, "刪除成功");
      } else {
        resFaildWrite(res, 400, "找無資料");
      }
    } catch (error) {
      resFaildWrite(res, 400, "刪除失敗");
    }
  } else if (req.url === "/posts" && req.method === "DELETE") {
    try {
      await Post.deleteMany({});
      resSuccessWrite(res, 200, "資料清空");
    } catch (error) {
      resFaildWrite(res, 400, "清空失敗");
    }
  } else if (req.url.startsWith("/posts/") && req.method === "PATCH") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        validateKey(Object.keys(data));
        const id = req.url.split("/").pop();
        const delStatus = await Post.findByIdAndUpdate(id, data); //藉由 id 更新
        if (delStatus !== null) {
          resSuccessWrite(res, 200, "成功更新");
        } else {
          throw new Error();
        }
      } catch (error) {
        resFaildWrite(res, 400, "更新失敗，請檢察路徑、欄位、值");
      }
    });
  } else if (req.method == "OPTIONS") {
    resSuccessWrite(res, 200);
  } else {
    resFaildWrite(res, 404, "無此網站路由");
  }
};

const server = http.createServer(reqListen);
server.listen(process.env.PORT, () => { //如果部屬在 render 的話，會直接拿該伺服器的PORT
  console.log("PORT開始監聽");
});
