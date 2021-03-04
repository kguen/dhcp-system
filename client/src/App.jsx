import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { Home } from './components/Home';
import { PrivateRoute } from './components/PrivateRoute';
import { Login } from './components/Login';
import { UserContext, AlertContext } from './contexts';
import './App.scss';

export const App = () => {
  const [user, setUser] = useState({
    token: localStorage.getItem('token'),
    data: null,
  });
  const [alert, setAlert] = useState({
    message: null,
    error: false,
  });

  const providerUserValue = useMemo(() => ({ user, setUser }), [user, setUser]);
  const providerAlertValue = useMemo(() => ({ alert, setAlert }), [
    alert,
    setAlert,
  ]);

  useEffect(() => {
    if (alert.message) {
      setTimeout(() => {
        setAlert({ message: null });
      }, 2000);
    }
  }, [alert]);

  return (
    <UserContext.Provider value={providerUserValue}>
      <AlertContext.Provider value={providerAlertValue}>
        <div className="app-container">
          <Alert
            show={alert.message}
            className="my-alert align-self-center"
            variant={alert.error ? 'danger' : 'success'}
            onClick={() => setAlert({ message: null })}
          >
            {alert.message}
          </Alert>
          <Router>
            <Switch>
              <Route exact path="/login">
                <Login />
              </Route>
              <PrivateRoute exact path="/" component={Home} />
            </Switch>
          </Router>
        </div>
      </AlertContext.Provider>
    </UserContext.Provider>
  );
};
