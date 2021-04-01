import React, { useContext } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { dhcpApi, tokenConfig } from '../../../../utils';
import { AlertContext } from '../../../../contexts';

const schema = yup.object({
  oldPassword: yup.string().trim().required('Vui lòng nhập mật khẩu cũ.'),
  newPassword: yup.string().trim().required('Vui lòng nhập mật khẩu mới.'),
  confirmPassword: yup
    .string()
    .trim()
    .required('Vui lòng nhập lại mật khẩu mới.')
    .oneOf(
      [yup.ref('newPassword'), null],
      'Vui lòng nhập lại mật khẩu khớp với mật khẩu mới bạn đã nhập ở trên.'
    ),
});

export const PasswordEdit = () => {
  const { setAlert } = useContext(AlertContext);
  const {
    register,
    handleSubmit,
    setError,
    errors,
    formState: { touched },
  } = useForm({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  });

  const onSubmit = data => {
    console.log(data);
  };

  return (
    <div className="info-edit-container">
      <div className="block-header">
        <h3 className="block-title">Thay đổi mật khẩu</h3>
      </div>
      <div className="block-content">
        <Form className="row push" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="col-4">
            <p className="font-size-sm text-muted">
              Thay đổi mật khẩu là một trong những cách đơn giản để giữ an toàn
              cho tài khoản của bạn.
            </p>
          </div>
          <div className="col-8">
            <Form.Group controlId="formOldPassword">
              <Form.Label className="required">Mật khẩu cũ</Form.Label>
              <Form.Control
                type="password"
                name="oldPassword"
                placeholder="Nhập mật khẩu cũ"
                ref={register}
                isValid={touched.oldPassword && !errors.oldPassword}
                isInvalid={!!errors.oldPassword}
              />
              <Form.Control.Feedback type="invalid">
                {errors.oldPassword?.message}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formNewPassword">
              <Form.Label className="required">Mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                placeholder="Nhập mật khẩu mới"
                ref={register}
                isValid={touched.newPassword && !errors.newPassword}
                isInvalid={!!errors.newPassword}
              />
              <Form.Control.Feedback type="invalid">
                {errors.newPassword?.message}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formConfirmPassword">
              <Form.Label className="required">
                Xác nhận mật khẩu mới
              </Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu mới"
                ref={register}
                isValid={touched.confirmPassword && !errors.confirmPassword}
                isInvalid={!!errors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword?.message}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Button variant="alt-primary" type="submit">
                Thay đổi
              </Button>
            </Form.Group>
          </div>
        </Form>
      </div>
    </div>
  );
};
