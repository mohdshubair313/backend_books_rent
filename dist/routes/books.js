"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const zod_1 = __importDefault(require("zod"));
const router = (0, express_1.default)();
const BOOKS_FILE = path_1.default.join(__dirname, "..", "data", "books.json");
const USERS_FILE = path_1.default.join(__dirname, "..", "data", "users.json");
const bookSchema = zod_1.default.object({
    title: zod_1.default.string(),
    author: zod_1.default.string(),
    city: zod_1.default.string(),
    description: zod_1.default.string(),
    ownerEmail: zod_1.default.string().email(),
    status: zod_1.default.enum(["available", "Rented"]).optional(),
});
router.post("/Publish_books", (req, res) => {
    const parsed = bookSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(404).json({ error: parsed.error.errors });
    }
    const { title, description, author, city, ownerEmail, status = "available" } = parsed.data;
    try {
        //check user is owner or not?
        const usersData = fs_1.default.readFileSync(USERS_FILE, "utf-8");
        const users = JSON.parse(usersData);
        const user = users.find((u) => u.email === ownerEmail);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.role !== "owner") {
            return res.status(403).json({ message: "Access denied. Only owners can publish books." });
        }
        const data = fs_1.default.readFileSync(BOOKS_FILE, "utf-8");
        const books = data.trim().length > 0 ? JSON.parse(data) : [];
        const newBook = {
            id: books.length + 1,
            title,
            description,
            author,
            city,
            ownerEmail,
            status,
        };
        books.push(newBook);
        fs_1.default.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2), "utf-8");
        return res.status(201).json({ message: "books added successfully", books: newBook });
    }
    catch (error) {
        console.error("Error is something related to adding books", error);
        return res.status(500).json({ message: "Internal server me kuch hai gadbad" });
    }
});
router.get("/getAllbooks", (req, res) => {
    try {
        const fileData = fs_1.default.readFileSync(BOOKS_FILE, "utf-8");
        const books = fileData.trim().length > 0 ? JSON.parse(fileData) : [];
        return res.status(200).json({
            message: "Books fetched sucesssfully",
            books,
        });
    }
    catch (error) {
        console.error("Error fetching books", error);
        return res.status(500).json({ message: "Get books me kuch error hai" });
    }
});
router.put("/getAllbooks/:id", (req, res) => {
    const { id } = req.params;
    const { title, description, author, city, status, email } = req.body;
    try {
        const userData = fs_1.default.readFileSync(USERS_FILE, "utf-8");
        const users = JSON.parse(userData);
        const user = users.find((u) => u.email === email);
        if (!user) {
            return res.status(401).json({ message: "user not found" });
        }
        if (user.role !== "owner") {
            return res.status(403).json({ message: "only owner can update books" });
        }
        // Get books
        const booksData = fs_1.default.readFileSync(BOOKS_FILE, "utf-8");
        const books = JSON.parse(booksData);
        const bookIndex = books.findIndex((b) => b.id === Number(id));
        if (bookIndex === -1) {
            return res.status(404).json({ message: "books not found" });
        }
        // only owner of the book can update his listing
        if (books[bookIndex].ownerEmail !== email) {
            const owner = users.find((u) => u.email === books[bookIndex].ownerEmail);
            return res.status(403).json({
                message: `Only ${(owner === null || owner === void 0 ? void 0 : owner.name) || "the owner"} can update this book`
            });
        }
        // now you can update this books
        books[bookIndex] = Object.assign(Object.assign({}, books[bookIndex]), { title: title || books[bookIndex].title, description: description || books[bookIndex].description, author: author || books[bookIndex].author, city: city || books[bookIndex].city, status: status || books[bookIndex].status });
        fs_1.default.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2), "utf-8");
        return res.status(200).json({ message: "Book updated successfully", book: books[bookIndex] });
    }
    catch (error) {
        console.error("update of book error is coming somewhere", error);
        return res.status(500).json({ message: "Internal error in updation of books" });
    }
});
exports.default = router;
