const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { body, validationResult } = require('express-validator');
const request = require('request');
const config = require('config');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id }).populate(
			'user',
			['name', 'avatar']
		);

		if (!profile) {
			return res
				.status(400)
				.json({ msg: 'There is no profile for this user' });
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   GET api/profile
// @desc    get all profiles
// @access  public
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', [
			'name',
			'avatar',
		]);
		res.json(profiles);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   GET api/profile/user/:user_id
// @desc    get profile by id
// @access  public
router.get('/user/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id,
		}).populate('user', ['name', 'avatar']);

		if (!profile)
			return res.status(400).json({ msg: 'Profile does not exist' });

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		if (err.kind == 'ObjectId') {
			return res.status(400).json({ msg: 'Profile does not exist' });
		}
		res.status(500).send('Server Error');
	}
});

// @route   POST api/profile
// @desc    Create or update a user profile
// @access  Private
router.post(
	'/',
	[
		auth,
		[
			body('status', 'Status is required').not().isEmpty(),
			body('skills', 'Skills required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			company,
			website,
			location,
			bio,
			status,
			githubusername,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin,
		} = req.body;

		// Build profile object
		const profileFields = {};
		profileFields.user = req.user.id;
		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (githubusername) profileFields.githubusername = githubusername;
		if (skills) {
			profileFields.skills = skills
				.split(',')
				.map((skill) => skill.trim());
		}

		// Build social object
		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (facebook) profileFields.social.facebook = facebook;
		if (twitter) profileFields.social.twitter = twitter;
		if (instagram) profileFields.social.instagram = instagram;
		if (linkedin) profileFields.social.linkedin = linkedin;

		try {
			let profile = await Profile.findOne({ user: req.user.id });

			if (profile) {
				// Update profile
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				);

				return res.json(profile);
			}

			// Else create profile
			profile = new Profile(profileFields);

			await profile.save();
			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route   DELETE api/profile/
// @desc    Delete profile, user, and posts
// @access  Private
router.delete('/', auth, async (req, res) => {
	try {
		// @todo - remove user posts
		// Remove profile
		await Profile.findOneAndRemove({ user: req.user.id });
		// Remove user
		await User.findOneAndRemove({ _id: req.user.id });

		res.json({ msg: 'User deleted' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put(
	'/experience',
	[
		auth,
		[
			body('title', 'Title is required').not().isEmpty(),
			body('company', 'Company is required').not().isEmpty(),
			body('from', 'Starting Date is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { title, company, location, from, to, current, description } =
			req.body;

		const newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			description,
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			profile.experience.unshift(newExp);

			await profile.save();

			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete profile experience
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		// Get exp to delete
		const expToDelete = profile.experience
			.map((item) => item._id)
			.indexOf(req.params.exp_id);

		profile.experience.splice(expToDelete, 1);

		await profile.save();

		res.json({ profile });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.put(
	'/education',
	[
		auth,
		[
			body('school', 'School is required').not().isEmpty(),
			body('degree', 'Degree is required').not().isEmpty(),
			body('fieldofstudy', 'Field of Study is required').not().isEmpty(),
			body('from', 'Starting Date is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { school, degree, fieldofstudy, from, to, current, description } =
			req.body;

		const newEdu = {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description,
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			profile.education.unshift(newEdu);

			await profile.save();

			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete profile education
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		// Get edu to delete
		const eduToDelete = profile.education
			.map((item) => item._id)
			.indexOf(req.params.edu_id);

		profile.education.splice(eduToDelete, 1);

		await profile.save();

		res.json({ profile });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   DELETE api/profile/github/:username
// @desc    Get user repos from Github
// @access  Public
router.get('/github/:username', async (req, res) => {
	try {
		const options = {
			uri: `https://api.github.com/users/${
				req.params.username
			}/repos?per_page=5&sort=created:asc&client_id=${config.get(
				'GITHUB_CLIENT_ID'
			)}&client_secret=${config.get('GITHUB_CLIENT_SECRET')}`,
			method: 'GET',
			headers: { 'user-agent': 'node.js' },
		};

		request(options, (error, response, body) => {
			if (error) console.error(error);

			if (response.statusCode !== 200) {
				return res.status(404).json({ msg: 'No Github profile found' });
			}

			res.json(JSON.parse(body));
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;