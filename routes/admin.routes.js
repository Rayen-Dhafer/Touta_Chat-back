const router = require("express").Router();
const admin_controller = require("../controllers/admin.controller")

router.post("/create_test",admin_controller.create_test)
router.post("/create_question",admin_controller.create_question)
router.post("/get_users",admin_controller.get_users)
router.post("/all_tests",admin_controller.all_tests)
router.post("/get_messages",admin_controller.get_messages)
router.post("/get_top_6_country",admin_controller.get_top_6_country)

module.exports = router;