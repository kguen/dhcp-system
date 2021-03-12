import React, { useEffect, useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { ALERT_TYPE } from '../../constants';
import { UserContext, AlertContext } from '../../contexts';

export const PrivateRoute = ({ component: Component, adminRoute, ...rest }) => {
  const { user } = useContext(UserContext);
  const { setAlert } = useContext(AlertContext);

  useEffect(() => {
    if (user.token) {
      if (adminRoute && !user.data?.isAdmin) {
        setAlert({
          message: 'Bạn không được cấp quyền truy cập vào đường dẫn này!',
          type: ALERT_TYPE.error,
        });
      }
    } else {
      setAlert({
        message: 'Bạn cần phải đăng nhập để truy cập hệ thống!',
        type: ALERT_TYPE.warning,
      });
    }
  }, [user.token, user.data]);

  return (
    <Route
      {...rest}
      render={props => {
        if (user.token) {
          if (adminRoute && !user.data?.isAdmin) {
            return <Redirect to="/profile" />;
          }
          return <Component {...props} />;
        }
        return <Redirect to="/login" />;
      }}
    />
  );
};
