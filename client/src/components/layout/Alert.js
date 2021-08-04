import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { removeAlert } from '../../redux/actions/alert';

const Alert = ({ alerts, removeAlert }) => {
	const closeAlert = (id) => {
		console.log('closeAlert');
		removeAlert(id);
	};

	return (
		alerts !== null &&
		alerts.length > 0 &&
		alerts.map((alert) => (
			<div key={alert.id} className={`alert alert-${alert.alertType}`}>
				<p className='alert-text'>{alert.msg}</p>
				<button
					className='close-alert'
					onClick={() => closeAlert(alert.id)}>
					&times;
				</button>
			</div>
		))
	);
};

Alert.propTypes = {
	alerts: PropTypes.array.isRequired,
	removeAlert: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
	alerts: state.alert,
});

export default connect(mapStateToProps, { removeAlert })(Alert);
