import React, { useState } from 'react';
import { FormGroup, Button, Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PHONE_REGEX, PASSWORD_REGEX } from '../../../constants';
import { sanitized } from '../../../utils';

const schema = yup.object({
  username: yup.string().trim().required('Vui lòng nhập tên đăng nhập.'),
  fullName: yup.string().trim().required('Vui lòng nhập họ và tên.'),
  email: yup.string().trim().email('Vui lòng nhập email theo đúng format.'),
  password: yup
    .string()
    .required('Vui lòng nhập mật khẩu.')
    .matches(PASSWORD_REGEX, 'Vui lòng nhập mật khẩu đủ mạnh.'),
  phone: yup.string().trim().matches(PHONE_REGEX, {
    message: 'Vui lòng nhập số điện thoại theo đúng format.',
    excludeEmptyString: true,
  }),
  organizationId: yup
    .number()
    .required()
    .positive('Vui lòng chọn đơn vị công tác.')
    .integer(),
});

export const AddUser = ({ doSubmit, orgList }) => {
  const [modal, setModal] = useState(false);
  const {
    register,
    handleSubmit,
    errors,
    setError,
    watch,
    reset,
    formState: { touched },
  } = useForm({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  });

  const showModal = () => {
    reset();
    setModal(true);
  };
  const hideModal = () => setModal(false);

  const onSubmit = async data => {
    try {
      await doSubmit(sanitized(data));
      hideModal();
    } catch {
      setError('username', {
        message: 'Tên đăng nhập này đã tồn tại!',
        shouldFocus: true,
      });
    }
  };

  return (
    <FormGroup>
      <Button
        className="d-flex align-items-center btn-alt-success"
        onClick={showModal}
      >
        <i className="fa fa-fw fa-plus mr-1" />
        Thêm
      </Button>
      <Modal
        show={modal}
        onHide={hideModal}
        size="lg"
        backdrop="static"
        keyboard={false}
        contentClassName="user-form-container block block-rounded mb-0"
        centered
      >
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          <Modal.Header className="block-header bg-body px-3">
            <i className="far fa-fw fa-plus-square mr-2" />
            <Modal.Title className="block-title">Thêm người dùng</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Row>
              <Form.Group className="col-12" controlId="formFullName">
                <Form.Label className="required">Họ và tên</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  placeholder="Nhập họ và tên"
                  ref={register}
                  isValid={touched.fullName && !errors.fullName}
                  isInvalid={!!errors.fullName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.fullName?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group className="col-6" controlId="formUsername">
                <Form.Label className="required">Tên đăng nhập</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Nhập tên đăng nhập"
                  ref={register}
                  isValid={touched.username && !errors.username}
                  isInvalid={!!errors.username}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.username?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="col-6" controlId="formPassword">
                <Form.Label className="required">Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Nhập mật khẩu"
                  ref={register}
                  isValid={touched.password && !errors.password}
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password?.message}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Độ dài từ 6 ký tự trở lên, có chứa cả chữ lẫn số.
                </Form.Text>
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group className="col-6 mb-2" controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Nhập email"
                  ref={register}
                  isValid={watch('email') && touched.email && !errors.email}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="col-6 mb-2" controlId="formPhone">
                <Form.Label>Điện thoại</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  placeholder="Nhập số điện thoại"
                  ref={register}
                  isValid={watch('phone') && touched.phone && !errors.phone}
                  isInvalid={!!errors.phone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone?.message}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Nhập số điện thoại theo format SIM 10 số.
                </Form.Text>
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group className="col-12" controlId="formOrgId">
                <Form.Label className="required">Đơn vị</Form.Label>
                <Form.Control
                  as="select"
                  className="custom-select"
                  name="organizationId"
                  ref={register({
                    valueAsNumber: true,
                  })}
                  isValid={touched.organizationId && !errors.organizationId}
                  isInvalid={!!errors.organizationId}
                >
                  <option value="0">Chọn đơn vị</option>
                  {orgList.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.fullName}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.organizationId?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group className="col-9 mb-2" controlId="formPosition">
                <Form.Label>Chức vụ</Form.Label>
                <Form.Control
                  type="text"
                  name="position"
                  placeholder="Nhập chức vụ"
                  ref={register}
                />
                <Form.Text className="text-muted">
                  Ví dụ: Giảng viên, quản trị viên...
                </Form.Text>
              </Form.Group>
              <div className="d-flex">
                <Form.Group
                  className="pl-2 d-flex align-items-center mb-0"
                  controlId="formIsAdmin"
                >
                  <Form.Check
                    type="switch"
                    className="custom-control-lg pb-2"
                    name="isAdmin"
                    label="Là quản trị viên"
                    ref={register}
                  />
                </Form.Group>
              </div>
            </Form.Row>
          </Modal.Body>
          <Modal.Footer className="bg-body-light">
            <Button variant="alt-secondary" onClick={hideModal}>
              Hủy
            </Button>
            <Button variant="alt-primary" type="submit">
              Lưu thay đổi
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </FormGroup>
  );
};
