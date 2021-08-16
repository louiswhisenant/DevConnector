import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import { deleteComment } from '../../redux/actions/post';

const CommentItem = ({
	comment: { _id, text, name, avatar, user, date },
	postId,
	auth,
	deleteComment,
}) => {
	const handleClick = () => {
		deleteComment(postId, _id);
		console.log(
			`comment [${typeof _id}] ${_id} from post [${typeof postId}] ${postId} removed`
		);
	};

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
				{!auth.loading && user === auth.user._id && (
					<button
						onClick={() => handleClick()}
						type='button'
						className='btn btn-danger'>
						<i className='fas fa-times'></i>
					</button>
				)}
			</div>
		</div>
	);
};

CommentItem.propTypes = {
	comment: PropTypes.object.isRequired,
	postId: PropTypes.string.isRequired,
	auth: PropTypes.object.isRequired,
	deleteComment: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
	auth: state.auth,
});

export default connect(mapStateToProps, { deleteComment })(CommentItem);
