import React, { useContext } from 'react';
import { Link, Redirect, useHistory } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { UserContext, AlertContext } from '../../contexts';
import Logo from '../../assets/images/logo.png';

export const Login = () => {
  const history = useHistory();
  const { user, setUser } = useContext(UserContext);
  const { setAlert } = useContext(AlertContext);

  return user.token ? (
    <Redirect to="/" />
  ) : (
    <div className="vh-100 d-flex flex-column align-items-center justify-content-center container">
      <Link className="mb-3" to="/">
        <img width="60" height="60" src={Logo} alt="uet logo" />
      </Link>
      <h2>Sign In</h2>
      <span className="lead mb-4">Đăng nhập bằng tài khoản được cấp</span>
      <div className="w-50 d-flex flex-column align-items-center">
        <div className="w-75">
          <Form noValidate className="mb-2">
            <Form.Group controlId="formUser">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Enter your username"
              />
              <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter a password"
              />
              <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
            </Form.Group>
            <Button className="w-100" variant="primary" type="submit">
              Sign in
            </Button>
          </Form>
          <div className="text-right">
            <small className="text-muted">
              Chưa có tài khoản?{' '}
              <a href="mailto:nanhkhoa460@gmail.com">Liên hệ admin</a>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};
