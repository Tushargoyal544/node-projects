const staticRoute = require("express").Router();
const staticController = require("../controller/staticController");
staticRoute.get("/listStatic", staticController.listStatic);
staticRoute.put("/editStatic", staticController.editStatic);
staticRoute.get("/viewStatic/:type", staticController.viewStatic);
module.exports = staticRoute;