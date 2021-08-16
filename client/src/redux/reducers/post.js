import {
	GET_POST,
	ADD_POST,
	ADD_COMMENT,
	REMOVE_COMMENT,
	DELETE_POST,
	GET_POSTS,
	POST_ERROR,
	UPDATE_INTERACTIONS,
} from '../actions/types';

const initialState = {
	posts: [],
	post: null,
	loading: true,
	error: {},
};

// eslint-disable-next-line import/no-anonymous-default-export
export default (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case GET_POST:
			return {
				...state,
				post: payload,
				loading: false,
			};
		case GET_POSTS:
			return {
				...state,
				posts: payload,
				loading: false,
			};
		case ADD_POST:
			return {
				...state,
				posts: [payload, ...state.posts],
				loading: false,
			};
		case ADD_COMMENT:
			return {
				...state,
				post: { ...state.post, comments: payload },
				loading: false,
			};
		case REMOVE_COMMENT:
			return {
				...state,
				post: {
					...state.post,
					comments: state.post.comments.filter(
						(comment) => comment._id !== payload
					),
				},
				loading: false,
			};
		case UPDATE_INTERACTIONS:
			return {
				...state,
				posts: state.posts.map((post) =>
					post._id === payload.id
						? { ...post, interactions: payload.interactions }
						: post
				),
				loading: false,
			};
		case DELETE_POST:
			return {
				...state,
				posts: state.posts.filter((post) => post._id !== payload),
				loading: false,
			};
		case POST_ERROR:
			return {
				...state,
				loading: false,
				error: payload,
			};
		default:
			return state;
	}
};
