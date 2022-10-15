const express = require("express");

const router = express.Router();

const {
	postLink,
	links,
	viewCount,
	like,
	unlike,
	linkDelete,
	linksCount,
} = require("../controllers/link");
const { signedIn } = require("../helpers/auth");

router.post("/post-link", signedIn, postLink); //for creating a post
router.get("/all-links/:page", links); //for getting links
router.put("/view-count/:linkId", viewCount); //for updating a link
router.put("/like", signedIn, like);
router.put("/unlike", signedIn, unlike);
router.delete("/link-delete/:linkId", signedIn, linkDelete);
router.get("/links-count", linksCount);

module.exports = router;
