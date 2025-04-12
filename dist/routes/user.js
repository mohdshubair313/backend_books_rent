"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// 👇 Correctly define USERS_FILE outside any try block
const USERS_FILE = path_1.default.join(__dirname, "..", "data", "users.json");
// ✅ Ensure directory exists
const dir = path_1.default.dirname(USERS_FILE);
if (!fs_1.default.existsSync(dir)) {
    fs_1.default.mkdirSync(dir, { recursive: true });
}
// ✅ Ensure file is not empty
if (!fs_1.default.existsSync(USERS_FILE) || fs_1.default.readFileSync(USERS_FILE, "utf-8").trim() === "") {
    fs_1.default.writeFileSync(USERS_FILE, "[]", "utf-8");
}
// Zod schema
const signupSchema = zod_1.z.object({
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
    mobile: zod_1.z.string(),
    role: zod_1.z.enum(["owner", "seeker"]),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string(),
    password: zod_1.z.string(),
});
// Route
router.post("/signup", (req, res) => {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.errors });
    }
    const { name, email, password, mobile, role } = parseResult.data;
    try {
        // ✅ Ensure folder exists
        const dir = path_1.default.dirname(USERS_FILE);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        // ✅ Ensure file exists
        if (!fs_1.default.existsSync(USERS_FILE)) {
            fs_1.default.writeFileSync(USERS_FILE, "[]", "utf-8");
        }
        // ✅ Read users
        const userData = fs_1.default.readFileSync(USERS_FILE, "utf-8");
        const users = JSON.parse(userData);
        // Check if user already exists
        const userExists = users.find((user) => user.email === email);
        if (userExists) {
            return res.status(409).json({ message: "User already exists" });
        }
        // Add new user
        const newUser = { name, email, password, mobile, role };
        users.push(newUser);
        // Save to file
        fs_1.default.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
        return res.status(201).json({ message: "User created successfully" });
    }
    catch (error) {
        console.error("🔥 ERROR:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
router.post("/login", (req, res) => {
    const validateData = loginSchema.safeParse(req.body);
    if (!validateData.success) {
        return res.status(400).json({ message: "Your data is not validate so please check validation", error: validateData.error.errors });
    }
    const { email, password } = validateData.data;
    try {
        // read the user.json flle
        const userData = fs_1.default.readFileSync(USERS_FILE, "utf-8");
        const parsedData = userData.trim().length > 0 ? JSON.parse(userData) : [];
        //find the user
        const user = parsedData.find((u) => u.email === email);
        if (!user) {
            return res.status(404).json({ message: "User is not found" });
        }
        // checking password is correct or not! 
        if (user.password !== password) {
            return res.status(404).json({ message: "User password is not matching .." });
        }
        return res.status(200).json({
            message: "Login successfully",
            user: {
                name: user.name,
                password: user.password,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Error in the login backend", error);
        return res.status(500).json({ message: "Error in your login logic. please check .." });
    }
});
exports.default = router;
