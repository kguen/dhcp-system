import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PHONE_REGEX } from '../../../constants';
import { sanitized } from '../../../utils';

const schema = yup.object({
  fullName: yup.string().trim().required('Vui lòng nhập họ và tên.'),
  email: yup.string().trim().email('Vui lòng nhập email theo đúng format.'),
  phone: yup.string().trim().matches(PHONE_REGEX, {
    message: 'Vui lòng nhập số điện thoại theo đúng format.',
    excludeEmptyString: true,
  }),
});

export const EditUser = ({ doSubmit, initialData, orgList }) => {
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
    defaultValues: initialData,
    resolver: yupResolver(schema),
  });

  const showModal = () => {
    reset(initialData);
    setModal(true);
  };
  const hideModal = () => setModal(false);

  const onSubmit = async data => {
    try {
      await doSubmit(sanitized(data), initialData.id);
      hideModal();
    } catch {
      setError('username', {
        message: 'Tên đăng nhập này đã tồn tại!',
        shouldFocus: true,
      });
    }
  };

  return (
    <>
      <Button className="btn-sm btn-alt-light" onClick={showModal}>
        <i className="fa fa-fw fa-pencil-alt" />
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
            <i className="far fa-fw fa-edit mr-2" />
            <Modal.Title className="block-title">
              Cập nhật người dùng
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Row>
              <Form.Group className="col-4" controlId="formFullName">
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
              <Form.Group className="col-4 mb-2" controlId="formEmail">
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
              <Form.Group className="col-4 mb-2" controlId="formPhone">
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
                  Nhập theo format SIM 10 số.
                </Form.Text>
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group className="col-4 mb-2" controlId="formPosition">
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
              <div className="col-8 d-flex">
                <Form.Group
                  className="form-org-id mb-2 mr-1"
                  controlId="formOrgId"
                >
                  <Form.Label>Đơn vị</Form.Label>
                  <Form.Control
                    as="select"
                    name="organizationId"
                    ref={register({
                      valueAsNumber: true,
                    })}
                  >
                    <option value="0">Chọn đơn vị</option>
                    {orgList.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.fullName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group className="pl-2 mb-2" controlId="formIsAdmin">
                  <Form.Check
                    type="checkbox"
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
    </>
  );
};
