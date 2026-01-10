import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDb } from "./db/db.js";

// ✅ Load env FIRST
dotenv.config({
  path: "./env"
});

(async () => {
  try {
    await connectDb();

    const server = app.listen(process.env.PORT || 8000, () => {
      console.log(`Server running at port : ${process.env.PORT || 8000}`);
    });

    // ✅ Correct place for server errors
    server.on("error", (error) => {
      console.error("Server error:", error);
      process.exit(1);
    });

  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
})();
