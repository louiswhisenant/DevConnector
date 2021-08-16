const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { body, validationResult } = require('express-validator');
const Post = require('../../models/Post');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post(
	'/',
	[auth, [body('text', 'Text is required').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findById(req.user.id).select('-password');

			const newPost = new Post({
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
				interactions: {
					likes: [{ user: req.user.id }],
				},
			});

			const post = await newPost.save();

			res.json(post);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
	try {
		const posts = await Post.find().sort({ date: -1 });
		res.json(posts);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Private
router.get('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.json(post);
	} catch (err) {
		console.error(err.message);
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.status(500).send('Server Error');
	}
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		// Validate user
		if (post.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorized' });
		}

		await post.remove();

		res.json({ msg: 'Post removed' });
	} catch (err) {
		console.error(err.message);
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.status(500).send('Server Error');
	}
});

// @route   PUT api/posts/likes/:id
// @desc    Like a post
// @access  Private
router.put('/likes/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		// user has already liked post
		if (
			post.interactions.likes.filter(
				(like) => like.user.toString() === req.user.id
			).length > 0
		) {
			// remove user like from likes array
			const likeToRemove = post.interactions.likes
				.map((like) => like.user.toString())
				.indexOf(req.user.id);

			post.interactions.likes.splice(likeToRemove, 1);
		} else {
			// user has already unliked post
			if (
				post.interactions.unlikes.filter(
					(unlike) => unlike.user.toString() === req.user.id
				).length > 0
			) {
				// remover user unlike from unlikes array
				const unlikeToRemove = post.interactions.unlikes
					.map((unlike) => unlike.user.toString())
					.indexOf(req.user.id);

				post.interactions.unlikes.splice(unlikeToRemove, 1);
			}

			// add user like to post
			post.interactions.likes.unshift({ user: req.user.id });
		}

		await post.save();

		return res.json(post.interactions);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   PUT api/posts/unlikes/:id
// @desc    Unlike a post
// @access  Private
router.put('/unlikes/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		// user has already unliked post
		if (
			post.interactions.unlikes.filter(
				(unlike) => unlike.user.toString() === req.user.id
			).length > 0
		) {
			// remove user unlike from unlikes array
			const unlikeToRemove = post.interactions.unlikes
				.map((unlike) => unlike.user.toString())
				.indexOf(req.user.id);

			post.interactions.unlikes.splice(unlikeToRemove, 1);
		} else {
			// user has already liked post
			if (
				post.interactions.likes.filter(
					(like) => like.user.toString() === req.user.id
				).length > 0
			) {
				// remover user like from likes array
				const likeToRemove = post.interactions.likes
					.map((like) => like.user.toString())
					.indexOf(req.user.id);

				post.interactions.likes.splice(likeToRemove, 1);
			}

			// add user unlike to post
			post.interactions.unlikes.unshift({ user: req.user.id });
		}

		await post.save();

		return res.json(post.interactions);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   POST api/posts/comments/:id
// @desc    Comment on a post
// @access  Private
router.post(
	'/comments/:id',
	[auth, [body('text', 'Text is required').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findById(req.user.id).select('-password');
			const post = await Post.findById(req.params.id);

			if (!post) {
				return res.status(404).json({ msg: 'Post not found' });
			}

			const newComment = {
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			};

			post.comments.unshift(newComment);

			await post.save();

			return res.json(post.comments);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route   DELETE api/posts/comments/:id/:comment_id
// @desc    Remove a post comment
// @access  Private
router.delete('/comments/:id/:comment_id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		const comment = post.comments.find(
			(comment) => comment.id === req.params.comment_id
		);

		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		if (!comment) {
			return res.status(404).json({ msg: 'Comment not found' });
		}

		if (comment.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorized' });
		}

		const commentToRemove = post.comments
			.map((comment) => comment.user.toString())
			.indexOf(req.user.id);

		post.comments.splice(commentToRemove, 1);

		await post.save();

		return res.json(post.comments);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
