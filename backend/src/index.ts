import "dotenv/config";
import app from "./app.js";

const port = 8000;

app.get("/", (req, res) => {
  res.json("Hello");
});

app.listen(port, () => {
  console.log("Listening at port:", port);
});
