import Link from "../models/link";

exports.postLink = async (req, res) => {
	try {
		const link = await new Link({
			...req.body,
			postedBy: req.user._id,
		}).save();
		//console.log("saved link =>", link);
		res.json(link);
	} catch (err) {
		console.log(err);
	}
};

exports.links = async (req, res) => {
	const perPage = 2;
	const page = req.params.page ? req.params.page : 1;
	try {
		const allLinks = await Link.find()
			.skip((page - 1) * perPage)
			.populate("postedBy", "_id name")
			.sort({ createdAt: -1 })
			.limit(perPage);
		//console.log(allLinks[0]);
		res.json(allLinks);
	} catch (err) {
		console.log(err);
	}
};

exports.viewCount = async (req, res) => {
	try {
		const link = await Link.findByIdAndUpdate(
			req.params.linkId,
			{ $inc: { views: 1 } },
			{ new: true }
		);
		//console.log("Link views=>", link.views);
		res.json({ ok: true });
	} catch (err) {
		console.log(err);
	}
};

exports.like = async (req, res) => {
	try {
		const link = await Link.findByIdAndUpdate(
			req.body.linkId,
			{ $addToSet: { likes: req.user._id } },
			{ new: true }
		).populate("postedBy", "_id name");
		res.json(link);
	} catch (err) {
		console.log(err);
	}
};
exports.unlike = async (req, res) => {
	try {
		const link = await Link.findByIdAndUpdate(
			req.body.linkId,
			{ $pull: { likes: req.user._id } },
			{ new: true }
		).populate("postedBy", "_id name");
		res.json(link);
	} catch (err) {
		console.log(err);
	}
};

exports.linkDelete = async (req, res) => {
	try {
		const link = await Link.findById(req.params.linkId);
		if (link.postedBy.toString() === req.user._id.toString()) {
			const deleted = await Link.findByIdAndRemove(req.params.linkId);
			res.json(deleted);
		} else {
			return res.json({ error: "Unauthorized Access!!" });
		}
	} catch (err) {
		console.log(err);
	}
};

exports.linksCount = async (req, res) => {
	try {
		const count = await Link.countDocuments();
		res.json(count);
	} catch (err) {
		console.log(err);
	}
};
