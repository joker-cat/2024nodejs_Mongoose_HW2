const headers = {
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Length, X-Requested-With",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
  "Content-Type": "application/json",
};

function resSuccessWrite(res, status, stringInfo) {
  res.writeHead(status, headers);
  res.write(
    JSON.stringify({
      status: "success",
      data: stringInfo,
    })
  );
  res.end();
}

function resFaildWrite(res, status, stringInfo) {
  res.writeHead(status, headers);
  res.write(
    JSON.stringify({
      status: "faild",
      data: stringInfo,
    })
  );
  res.end();
}

module.exports = { resSuccessWrite, resFaildWrite };
