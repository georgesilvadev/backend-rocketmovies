const { Router } = require("express");

const TagsControllers = require("../controllers/TagsControllers")

const tagsRoutes = Router();
const tagsControllers = new TagsControllers();

tagsRoutes.get("/:user_id", tagsControllers.index);

module.exports = tagsRoutes