import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
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
          hasAlert: true,
          message: 'Bạn cần phải đăng nhập để truy cập hệ thống',
          error: true,
        });
        return <Redirect to="/login" />;
      }}
    />
  );
};
