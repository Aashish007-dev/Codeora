import express from "express";
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import sandboxRouter from "./routes/sandbox.routes.js";

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use('/api/sandbox', sandboxRouter);


export default app;