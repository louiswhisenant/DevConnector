import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import { likePost, unlikePost, deletePost } from '../../redux/actions/post';
import { Fragment } from 'react';

const PostItem = ({
	post: {
		_id,
		text,
		name,
		avatar,
		user,
		interactions: { likes, unlikes },
		comments,
		date,
	},
	showActions,
	auth,
	likePost,
	unlikePost,
	deletePost,
}) => {
	const [interacted, setInteracted] = useState({
		liked: false,
		unliked: false,
	});

	useEffect(() => {
		if (!auth.loading) {
			const hasLiked = likes.filter(
				(like) => like.user.toString() === auth.user._id
			);
			const hasUnliked = unlikes.filter(
				(unlike) => unlike.user.toString() === auth.user._id
			);

			if (hasLiked.length > 0) {
				setInteracted({ liked: true, unliked: false });
			} else if (hasUnliked.length > 0) {
				setInteracted({ liked: false, unliked: true });
			} else {
				setInteracted({ liked: false, unliked: false });
			}
		}
	}, [auth, likes, unlikes]);

	return (
		<div className='post bg-white p-1 my-1'>
			<div>
				<Link to={`/profile/${user}`}>
					<img className='round-img' src={avatar} alt='' />
					<h4>{name}</h4>
				</Link>
			</div>
			<div>
				<p className='my-1'>{text}</p>
				<p className='post-date'>
					Posted on <Moment format='MM/DD/YYYY'>{date}</Moment>
				</p>

				{showActions && (
					<Fragment>
						<button
							type='button'
							className='btn btn-light'
							onClick={() => {
								likePost(_id);
							}}>
							<i
								className={`fas fa-thumbs-up ${
									interacted.liked ? 'text-success' : ''
								}`}></i>
						</button>
						<span>{likes.length - unlikes.length}</span>
						<button
							type='button'
							className='btn btn-light'
							onClick={() => {
								unlikePost(_id);
							}}>
							<i
								className={`fas fa-thumbs-down ${
									interacted.unliked ? 'text-danger' : ''
								}`}></i>
						</button>
						<Link to={`/posts/${_id}`} className='btn btn-primary'>
							Discussion{' '}
							<span className='comment-count'>
								{comments.length}
							</span>
						</Link>
						{!auth.loading && user === auth.user._id && (
							<button
								type='button'
								className='btn btn-danger'
								onClick={() => {
									deletePost(_id);
								}}>
								<i className='fas fa-times'></i>
							</button>
						)}
					</Fragment>
				)}
			</div>
		</div>
	);
};

PostItem.defaultProps = {
	showActions: true,
};

PostItem.propTypes = {
	post: PropTypes.object.isRequired,
	auth: PropTypes.object.isRequired,
	likePost: PropTypes.func.isRequired,
	unlikePost: PropTypes.func.isRequired,
	deletePost: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
	auth: state.auth,
});

export default connect(mapStateToProps, { likePost, unlikePost, deletePost })(
	PostItem
);
