const router = require("express").Router();
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// TODO: Implement the dish routes needed


router
	.route("/:dishId")
	.get(controller.read)
	.put(controller.update)
	.all(methodNotAllowed);
router
	.route("/")
	.post(controller.create)
	.get(controller.list)
	.all(methodNotAllowed);

module.exports = router;
