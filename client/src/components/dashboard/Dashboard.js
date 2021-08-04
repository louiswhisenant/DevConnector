import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { deleteAccount, getCurrentProfile } from '../../redux/actions/profile';
import Spinner from '../layout/Spinner.js';
import { Fragment } from 'react';
import DashboardActions from './DashboardActions';
import Experience from './Experience';
import Education from './Education';

const Dashboard = ({
	deleteAccount,
	getCurrentProfile,
	auth: { user },
	profile: { profile, loading },
}) => {
	useEffect(() => {
		getCurrentProfile();
	}, [getCurrentProfile]);

	return loading && profile === null ? (
		<Spinner />
	) : (
		<Fragment>
			<h1 className='large text-primary'>Dashboard</h1>
			<p className='lead'>
				<i className='fas fa-user'></i> Welcome
				{user && `, ${user.name}`}
			</p>
			{profile !== null ? (
				<Fragment>
					<DashboardActions />
					<Experience />
					<Education />
					<div className='my-2'>
						<button
							className='btn btn-danger'
							onClick={() => deleteAccount()}>
							<i className='fas fa-user-minus'></i> Delete Account
						</button>
					</div>
				</Fragment>
			) : (
				<Fragment>
					<p>
						Click <Link to='/create-profile'>here</Link> to get
						started with a profile.
					</p>
					<Link to='/create-profile' className='btn btn-primary my-1'>
						Create Profile
					</Link>
				</Fragment>
			)}
		</Fragment>
	);
};

Dashboard.propTypes = {
	deleteAccount: PropTypes.func.isRequired,
	getCurrentProfile: PropTypes.func.isRequired,
	auth: PropTypes.object.isRequired,
	profile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
	auth: state.auth,
	profile: state.profile,
});

export default connect(mapStateToProps, { deleteAccount, getCurrentProfile })(
	Dashboard
);
