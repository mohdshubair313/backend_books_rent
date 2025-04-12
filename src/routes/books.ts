import Router from "express";
import fs from 'fs';
import path from "path";
import z from 'zod'

const router = Router();

type Book = {
    id: number;
    title: string;
    description: string;
    author: string;
    city: string;
    ownerEmail: string;
    status: "Rented" | "available"
}

const BOOKS_FILE = path.join(__dirname, "..", "data", "books.json");
const USERS_FILE = path.join(__dirname, "..", "data", "users.json"); 


const bookSchema = z.object({
    title: z.string(),
    author: z.string(),
    city: z.string(),
    description: z.string(),
    ownerEmail: z.string().email(),
    status: z.enum(["available", "Rented"]).optional(),
});

type BookRequestBody = z.infer<typeof bookSchema>;


router.post("/Publish_books", (req,res):any => {
    const parsed = bookSchema.safeParse(req.body);

    if(!parsed.success) {
        return res.status(404).json({error: parsed.error.errors});
    }

    const {title, description, author, city, ownerEmail, status = "available"} = parsed.data;

    try {
        //check user is owner or not?
        const usersData = fs.readFileSync(USERS_FILE, "utf-8");
        const users = JSON.parse(usersData);
        const user = users.find((u: any) => u.email === ownerEmail);

        if (!user) {
        return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== "owner") {
        return res.status(403).json({ message: "Access denied. Only owners can publish books." });
        }

        const data = fs.readFileSync(BOOKS_FILE, "utf-8");
        const books: Book[] = data.trim().length > 0 ? JSON.parse(data) : [];

        const newBook: Book = {
            id: books.length + 1,
            title,
            description,
            author,
            city,
            ownerEmail,
            status,
        };

        books.push(newBook);

        fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2), "utf-8");

        return res.status(201).json({message: "books added successfully", books: newBook});

    } catch (error) {
        console.error("Error is something related to adding books", error);
        return res.status(500).json({message: "Internal server me kuch hai gadbad"});
    }
});

router.get("/getAllbooks", (req, res): any => {
    try {
        const fileData = fs.readFileSync(BOOKS_FILE, "utf-8");

        const books: Book[] = fileData.trim().length > 0 ? JSON.parse(fileData): [];

        return res.status(200).json({
            message: "Books fetched sucesssfully",
            books,
        });
    } catch (error) {
        console.error("Error fetching books", error);
        return res.status(500).json({message: "Get books me kuch error hai"});
    }
})

router.put("/getAllbooks/:id", (req,res):any => {
    const {id} = req.params;
    const {title, description, author, city, status, email} = req.body;

    try {
        const userData = fs.readFileSync(USERS_FILE, "utf-8");
        const users = JSON.parse(userData);
        const user = users.find((u:any) => u.email === email);

        if(!user) {
            return res.status(401).json({message: "user not found"});
        }

        if(user.role !== "owner") {
            return res.status(403).json({message: "only owner can update books"});
        }

        // Get books
        const booksData = fs.readFileSync(BOOKS_FILE, "utf-8");
        const books: Book[] = JSON.parse(booksData);

        const bookIndex = books.findIndex((b) => b.id === Number(id));

        if(bookIndex === -1) {
            return res.status(404).json({message: "books not found"});
        }

        // only owner of the book can update his listing

        if (books[bookIndex].ownerEmail !== email) {
            const owner = users.find((u: any) => u.email === books[bookIndex].ownerEmail);
            return res.status(403).json({
              message: `Only ${owner?.name || "the owner"} can update this book`
            });
          }

        // now you can update this books
        books[bookIndex] = {
            ... books[bookIndex],
            title: title || books[bookIndex].title,
            description: description || books[bookIndex].description,
            author: author || books[bookIndex].author,
            city: city || books[bookIndex].city,
            status: status || books[bookIndex].status,
        }

        fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2), "utf-8");
        return res.status(200).json({ message: "Book updated successfully", book: books[bookIndex] });
    } catch (error) {
        console.error("update of book error is coming somewhere", error);
        return res.status(500).json({message: "Internal error in updation of books"});
    }}
)

export default router;

