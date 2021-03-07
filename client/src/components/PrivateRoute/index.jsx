import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { ALERT_TYPE } from '../../constants';
import { UserContext, AlertContext } from '../../contexts';

export const PrivateRoute = ({ component: Component, adminRoute, ...rest }) => {
  const { user } = useContext(UserContext);
  const { setAlert } = useContext(AlertContext);

  return (
    <Route
      {...rest}
      render={props => {
        if (user.token) {
          if (adminRoute && !user.data?.isAdmin) {
            setAlert({
              message: 'Bạn không được cấp quyền truy cập vào đường dẫn này!',
              type: ALERT_TYPE.warning,
            });
            return <Redirect to="/profile" />;
          }
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
