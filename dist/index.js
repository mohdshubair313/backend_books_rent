"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_1 = __importDefault(require("./routes/user"));
const books_1 = __importDefault(require("./routes/books"));
const app = (0, express_1.default)();
// All Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
//Routes defined
app.use('/api/auth', user_1.default);
app.use('/api/', books_1.default);
app.get("/", (req, res) => {
    res.send("🚀 BookRent Backend Live!");
});
app.listen(8080, () => {
    console.log("server is running ...");
});
