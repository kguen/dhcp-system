import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { ALERT_TYPE } from '../../constants';
import { UserContext, AlertContext } from '../../contexts';

export const PrivateRoute = ({ component: Component, ...rest }) => {
  const { user } = useContext(UserContext);
  const { setAlert } = useContext(AlertContext);

  return (
    <Route
      {...rest}
      render={props => {
        if (user.token) {
          return <Component {...props} />;
        }
        setAlert({
          message: 'Bạn cần phải đăng nhập để truy cập hệ thống!',
          type: ALERT_TYPE.warning,
        });
        return <Redirect to="/login" />;
      }}
    />
  );
};
