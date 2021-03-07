import React, { useContext } from 'react';
import { Link, Redirect, useHistory } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { UserContext, AlertContext } from '../../contexts';
import { ALERT_TYPE, SITE_TITLE } from '../../constants';
import { dhcpApi } from '../../utils';
import Logo from '../../assets/images/logo.png';

const schema = yup.object({
  username: yup.string().required('Vui lòng nhập tên đăng nhập.'),
  password: yup.string().required('Vui lòng nhập mật khẩu.'),
});

export const Login = () => {
  const history = useHistory();
  const { user, setUser } = useContext(UserContext);
  const { setAlert } = useContext(AlertContext);
  const { register, handleSubmit, errors } = useForm({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  });

  const onSubmit = loginData => {
    dhcpApi
      .post('/auth/login', loginData)
      .then(({ data }) => {
        localStorage.setItem('token', data.token);
        setUser({
          ...user,
          token: data.token,
          data: data.user,
        });
        setAlert({
          type: ALERT_TYPE.success,
          message: 'Đăng nhập thành công!',
        });
        history.push(data.user.isAdmin ? '/orgs' : '/profile');
      })
      .catch(err => {
        if (err.response.status === 401) {
          setUser({
            ...user,
            data: null,
            token: null,
          });
          setAlert({
            type: ALERT_TYPE.error,
            message: 'Tên đăng nhập hoặc mật khẩu không hợp lệ!',
          });
        }
      });
  };

  return user.token ? (
    <Redirect to="/" />
  ) : (
    <div className="vh-100 d-flex flex-column align-items-center justify-content-center container">
      <Helmet>
        <title>Đăng nhập | {SITE_TITLE}</title>
      </Helmet>
      <Link className="mb-3" to="/">
        <img
          width="100"
          height="100"
          className="rounded-circle"
          src={Logo}
          alt="uet logo"
        />
      </Link>
      <h2>Đăng nhập</h2>
      <h4 className="font-w300 mb-4">Đăng nhập bằng tài khoản được cấp</h4>
      <div className="w-50 d-flex flex-column align-items-center">
        <div className="w-75">
          <Form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="mt-2 mb-2"
          >
            <Form.Group controlId="formUser">
              <Form.Label>Tên đăng nhập</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Nhập tên đăng nhập"
                ref={register}
                isInvalid={!!errors.username}
              />
              <Form.Control.Feedback type="invalid">
                {errors.username?.message}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formPassword">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Nhập mật khẩu"
                ref={register}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password?.message}
              </Form.Control.Feedback>
            </Form.Group>
            <Button
              className="w-100"
              data-toggle="click-ripple"
              variant="primary"
              type="submit"
            >
              Đăng nhập
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
