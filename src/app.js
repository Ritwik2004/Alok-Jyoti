import cookieParser from "cookie-parser";
import express from "express"
import userRoutes from "./routes/usere.route.js";
import roomsOperations from "./routes/Room.route.js"
import productOperation from "./routes/product.route.js"
import shopKeeper from "./routes/shopKeeper.route.js"
import houseWoner from "./routes/houseWoner.route.js"
import notes from "./routes/notes.route.js"
import order from "./routes/order.route.js"
import cors from "cors"
const app = express();

app.use(cors({
    origin : process.env.corsOrigin,
    Credential : true
}));

app.use(cookieParser());

app.use(express.static("public"));

app.use(express.urlencoded({extended : true, limit : "16kb"}));

app.use(express.json({limit : "16kb"}));


app.use("/api/v1/users",userRoutes);
app.use("/api/v1/notes",notes);
app.use("/api/v1/rooms",roomsOperations);
app.use("/api/v1/houseWoner",houseWoner);
app.use("/api/v1/product",productOperation);
app.use("/api/v1/shopKeeper",shopKeeper);
app.use("/api/v1/product",order);

export default app;