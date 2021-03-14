import React, { useState, useMemo, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { Header } from '../Header';
import { Login } from '../Login';
import { PrivateRoute } from '../PrivateRoute';
import { Organizations } from '../Organizations';
import { Users } from '../Users';
import { Addresses } from '../Addresses';
import { Profile } from '../Profile';
import { UserContext, AlertContext } from '../../contexts';
import { dhcpApi, tokenConfig } from '../../utils';
import { ALERT_TYPE } from '../../constants';
import './styles.scss';

export const App = () => {
  const [user, setUser] = useState({
    token: localStorage.getItem('token'),
    data: null,
  });
  const [alert, setAlert] = useState({
    message: null,
    type: ALERT_TYPE.success,
  });
  const [loading, setLoading] = useState(true);
  const [timerId, setTimerId] = useState(null);

  const providerUserValue = useMemo(() => ({ user, setUser }), [user, setUser]);
  const providerAlertValue = useMemo(() => ({ alert, setAlert }), [
    alert,
    setAlert,
  ]);

  useEffect(() => {
    if (user.token) {
      setLoading(true);
      dhcpApi
        .get('/auth/me', tokenConfig(user))
        .then(({ data }) => {
          setUser({ ...user, data });
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser({
            ...user,
            token: null,
          });
          setAlert({
            message: 'Đã xảy ra lỗi máy chủ!',
            type: ALERT_TYPE.error,
          });
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user.token]);

  useEffect(() => {
    if (alert.message) {
      clearTimeout(timerId);
      const newTimerId = setTimeout(() => {
        setAlert({ message: null });
      }, 2000);
      setTimerId(newTimerId);
    }
  }, [alert]);

  return (
    !loading && (
      <UserContext.Provider value={providerUserValue}>
        <AlertContext.Provider value={providerAlertValue}>
          <div className="app-container d-flex flex-column">
            <Alert
              show={!!alert.message}
              className="my-alert align-self-center"
              variant={alert.type}
              onClick={() => {
                setAlert({ message: null });
                clearTimeout(timerId);
              }}
            >
              {alert.message}
            </Alert>
            <Router>
              <Header />
              <Switch>
                <Route exact path="/login">
                  <Login />
                </Route>
                <PrivateRoute
                  exact
                  path="/orgs"
                  component={Organizations}
                  adminRoute
                />
                <PrivateRoute
                  exact
                  path="/users"
                  component={Users}
                  adminRoute
                />
                <PrivateRoute
                  exact
                  path="/addresses"
                  component={Addresses}
                  adminRoute
                />
                <PrivateRoute exact path="/profile" component={Profile} />
                <Route path="*">
                  <Redirect to={user.data?.isAdmin ? '/orgs' : '/profile'} />
                </Route>
              </Switch>
            </Router>
          </div>
        </AlertContext.Provider>
      </UserContext.Provider>
    )
  );
};
