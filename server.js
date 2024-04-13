const http = require("http");
const mongoose = require('mongoose');

// 連接資料庫
// 如果localhost連接失敗，請改成127.0.0.1，此問題可能為 node / npm 版本造成
mongoose
  .connect('mongodb://127.0.0.1:27017/nodejs_homework2')
  .then(() => console.log('資料庫連線成功'))
  .catch(error => console.log(error));

//設定Schema
const postSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '名稱 未填寫']
    },
    image: {
      type: String,
      default: ""
    },
    content: {
      type: String,
      required: [true, '內容 未填寫']
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      required: [true, '類別 未填寫']
    },
    tags: {
      type: [String],
      default: []
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    }
  },
  {
    versionKey: false
  }
);

const Post = mongoose.model('post', postSchema);

const reqListen = async (req, res) => {
  if (req.url === "/favicon.ico") return;
  let body = "";
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
  }

  req.on('data', chunk => body += chunk)

  if (req.url == "/posts" && req.method == "GET") {
    const data = await Post.find();
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      "status": "success",
      data
    }));
    res.end();
  }
  else if (req.url == "/posts" && req.method == "POST") {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        console.log(data);
        const { name, content, type } = data;

        if (name !== undefined && content !== undefined && type !== undefined) {
          const newPost = await Post.create(
            {
              name: data.name,
              content: data.content,
              type: data.type,
              image: data.image,
              likes: data.likes,
              comments: data.comments,
              tags:data.tags
            }
          );

          res.writeHead(200, headers);
          res.write(JSON.stringify({
            "status": "success",
            "data": newPost,
          }));
          res.end();
        }
        else {
          res.writeHead(400, headers);
          res.write(JSON.stringify({
            "status": "false",
            "message": "資料屬性值缺少",
          }));
          res.end();
        }
      } catch (error) {
        res.writeHead(400, headers);
        res.write(JSON.stringify({
          "status": "false",
          "message": "資料格式有誤",
        }));
        res.end();
      }
    })
  }
  // else if (req.url.startsWith("/posts/") && req.method == "DELETE") {
  //   const id = req.url.split('/').pop();
  //   await Post.findByIdAndDelete(id);
  //   res.writeHead(200, headers);
  //   res.write(JSON.stringify({
  //     "status": "success",
  //     "data": null,
  //   }));
  //   res.end();
  // } 
  // else if (req.method == "OPTIONS") {
  //   res.writeHead(200, headers);
  //   res.end();
  // } 
  // else {
  //   res.writeHead(404, headers);
  //   res.write(JSON.stringify({
  //     "status": "false",
  //     "message": "無此網站路由"
  //   }));
  //   res.end();
  // }
}

const server = http.createServer(reqListen);
server.listen(3005, () => {
  console.log('listen port 3005');
})

