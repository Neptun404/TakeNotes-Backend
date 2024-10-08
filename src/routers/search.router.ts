import { Router } from "express";
import routeErrorHandler from "../errors/route.error.handler";
import jwtAuth from "../middlewares/auth.jwt";
import { searchByTitle, searchByTags } from "../controllers/search.controller";

const router = Router()

export default router
    .use(jwtAuth)
    .get('/title', searchByTitle)
    .get('/tags', searchByTags)
    .use(routeErrorHandler)


/**
 * Search By Name
 * /search/name?name={searchTerm}
 * 
 * Search By Tag
 * /search/tags?tags={searchTerm}
 */