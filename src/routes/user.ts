import { Router } from "express";
import {  z } from "zod";
import fs from "fs";
import path from "path";

const router = Router();

// User Type
type User = {
  name: string;
  email: string;
  password: string;
  mobile: string;
  role: "owner" | "seeker";
};

// 👇 Correctly define USERS_FILE outside any try block
const USERS_FILE = path.join(__dirname, "..", "data", "users.json");
// ✅ Ensure directory exists
const dir = path.dirname(USERS_FILE);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// ✅ Ensure file is not empty
if (!fs.existsSync(USERS_FILE) || fs.readFileSync(USERS_FILE, "utf-8").trim() === "") {
  fs.writeFileSync(USERS_FILE, "[]", "utf-8");
}


// Zod schema
const signupSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  mobile: z.string(),
  role: z.enum(["owner", "seeker"]),
});

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
})

// Infer type
type SignupRequestBody = z.infer<typeof signupSchema>;

// Route
router.post("/signup", (req, res):any => {
  const parseResult = signupSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
  }

  const { name, email, password, mobile, role } = parseResult.data;

  try {
    // ✅ Ensure folder exists
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // ✅ Ensure file exists
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, "[]", "utf-8");
    }

    // ✅ Read users
    const userData = fs.readFileSync(USERS_FILE, "utf-8");
    const users: User[] = JSON.parse(userData);

    // Check if user already exists
    const userExists = users.find((user) => user.email === email);
    if (userExists) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Add new user
    const newUser: User = { name, email, password, mobile, role };
    users.push(newUser);

    // Save to file
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("🔥 ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/login", (req, res):any => {
    const validateData = loginSchema.safeParse(req.body);

    if(!validateData.success) {
      return res.status(400).json({message: "Your data is not validate so please check validation", error: validateData.error.errors});
    }

    const {email, password} = validateData.data;

    try {
      // read the user.json flle
      const userData = fs.readFileSync(USERS_FILE, "utf-8");
      const parsedData: User[] = userData.trim().length > 0 ? JSON.parse(userData) : [];

      //find the user
      const user = parsedData.find((u) => u.email === email);
      
      if(!user) {
        return res.status(404).json({message: "User is not found"});
      }

      // checking password is correct or not! 
      if(user.password !== password) {
        return res.status(404).json({message: "User password is not matching .."});
      }

      return res.status(200).json({
        message: "Login successfully",
        user: {
          name: user.name,
          password: user.password,
          role: user.role,
        },
      });
    } catch (error) {
        console.error("Error in the login backend", error);
        return res.status(500).json({message: "Error in your login logic. please check .."});    
    }
})

export default router;
