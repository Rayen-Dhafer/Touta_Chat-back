const router = require("express").Router();
const user_controller = require("../controllers/user.controller")

router.post("/create_user",user_controller.create_user)
router.post("/login",user_controller.login)
router.post("/send_recovery_code",user_controller.send_recovery_code)
router.post("/reset",user_controller.reset)
router.post("/get_user",user_controller.get_user)
router.post("/get_tests",user_controller.get_tests)
router.post("/get_questions",user_controller.get_questions)
router.post("/valide_test",user_controller.valide_test)
router.post("/get_career",user_controller.get_career)
router.post("/get_certif",user_controller.get_certif)
router.post("/details_certification",user_controller.details_certification)
router.post("/send_message",user_controller.send_message)

module.exports = router;
