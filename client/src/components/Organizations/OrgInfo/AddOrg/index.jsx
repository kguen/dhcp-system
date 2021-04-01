import React, { useState } from 'react';
import { FormGroup, Button, Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PHONE_REGEX } from '../../../../constants';
import { sanitized } from '../../../../utils';

const schema = yup.object({
  abbreviation: yup.string().trim().required('Vui lòng nhập tên viết tắt.'),
  fullName: yup.string().trim().required('Vui lòng nhập tên đầy đủ.'),
  phone: yup.string().trim().matches(PHONE_REGEX, {
    message: 'Vui lòng nhập số điện thoại theo đúng format.',
    excludeEmptyString: true,
  }),
});

export const AddOrg = ({ doSubmit }) => {
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
      setError('abbreviation', {
        message: 'Tên viết tắt này đã tồn tại!',
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
        contentClassName="block block-rounded mb-0"
        centered
      >
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          <Modal.Header className="block-header bg-body px-3">
            <i className="far fa-fw fa-plus-square mr-2" />
            <Modal.Title className="block-title">Thêm đơn vị</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Row>
              <Form.Group className="col-4" controlId="formAbbreviation">
                <Form.Label className="required">Tên viết tắt</Form.Label>
                <Form.Control
                  type="text"
                  name="abbreviation"
                  placeholder="Nhập tên tắt"
                  ref={register}
                  isValid={touched.abbreviation && !errors.abbreviation}
                  isInvalid={!!errors.abbreviation}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.abbreviation?.message}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Ví dụ: khoa-cntt, khoa-cntt-ptn...
                </Form.Text>
              </Form.Group>
              <Form.Group className="col-8" controlId="formFullName">
                <Form.Label className="required">Tên đầy đủ</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  placeholder="Nhập tên đầy đủ"
                  ref={register}
                  isValid={touched.fullName && !errors.fullName}
                  isInvalid={!!errors.fullName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.fullName?.message}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Nhập đầy đủ tên phòng ban/bộ môn (nếu có).
                </Form.Text>
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group className="col-12" controlId="formPhone">
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
              <Form.Group className="col-12 mb-2" controlId="formAddress">
                <Form.Label>Địa chỉ</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  placeholder="Nhập địa chỉ"
                  ref={register}
                />
                <Form.Text className="text-muted">
                  Nhập địa chỉ phòng làm việc chính của đơn vị.
                </Form.Text>
              </Form.Group>
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
