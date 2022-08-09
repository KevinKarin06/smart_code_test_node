const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
// const auth = require("./middlewares/auth");


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

app.get("/", async (req, res, next) => {
    res.send({ message: "Awesome it works 🐻" });
});
// app.use(auth);
app.use("/public", express.static("public"));
app.use("/api", require("./routes/api.routes"));

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        status: err.status || 500,
        message: err.message,
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
