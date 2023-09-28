const { exampleMiddleware } = require("../middleware");
const exampleController = require("../controllers/exampleController");

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  const router = require("express").Router();

  router.get("/rf1", exampleController.refactoreMe1);
  router.post("/rf2", exampleController.refactoreMe2);
  
  router.post(
    "/getdata",
    [exampleMiddleware.verifyJWT, exampleMiddleware.checkUserRole("aksesGetData")],
    exampleController.getData
  );

  router.get(
    "/callmewss",
    [exampleMiddleware.verifyJWT, exampleMiddleware.checkUserRole("aksesCallMeWss")],
    exampleController.callmeWebSocket
  );


  app.use("/api/data", router);
};
