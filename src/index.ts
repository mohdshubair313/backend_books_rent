import express, { Application } from "express";
import cors from "cors"
import userRoutes from './routes/user';
import booksRoutes from './routes/books';

const app:Application = express();

// All Middlewares

app.use(cors({
  origin: '*', 
}));

app.use(express.json());

//Routes defined
app.use('/api/auth', userRoutes);
app.use('/api/', booksRoutes)

app.get("/", (req, res) => {
    res.send("🚀 BookRent Backend Live!");
  });

app.listen(8080, () => {
    console.log("server is running ...");
})

