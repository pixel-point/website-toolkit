import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const files = {
  "/": ["index.html", "text/html"],
  "/index.html": ["index.html", "text/html"],
  "/style.css": ["style.css", "text/css"],
  "/app.js": ["app.js", "text/javascript"],
};
const server = http.createServer(async (req, res) => {
  const entry = files[new URL(req.url, "http://localhost").pathname];
  if (!entry) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  const data = await readFile(
    path.join(import.meta.dirname, "..", "docs", entry[0]),
  );
  res.writeHead(200, {
    "Content-Type": `${entry[1]}; charset=utf-8`,
    "X-Content-Type-Options": "nosniff",
  });
  res.end(data);
});
server.listen(
  Number(process.env.WEBSITE_TOOLKIT_DOCS_PORT || 0),
  "127.0.0.1",
  () => console.log(`Client guide: http://127.0.0.1:${server.address().port}`),
);
