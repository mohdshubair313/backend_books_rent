"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// All Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.listen(8080, () => {
    console.log("server is running ...");
});
