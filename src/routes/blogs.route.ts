import { Router } from "express";
import { getBlogPostsHandler } from "../controllers/blogs/get-blog-posts.handler.js";
import { createBlogPostHandler } from "../controllers/blogs/create-blog-post.handler.js";
import { deleteBlogPostHandler } from "../controllers/blogs/delete-blog-post.handler.js";
import { updateBlogPostHandler } from "../controllers/blogs/update-blog-post.handler.js";
import { getBlogPostHandler } from "../controllers/blogs/get-blog-post.handler.js";

const blogsRouter = Router();

blogsRouter.get("/", getBlogPostsHandler);
blogsRouter.post("/", createBlogPostHandler);
blogsRouter.delete("/:blogPostId", deleteBlogPostHandler);
blogsRouter.put("/:blogPostId", updateBlogPostHandler);
blogsRouter.get("/:blogPostId", getBlogPostHandler);

export default blogsRouter;
