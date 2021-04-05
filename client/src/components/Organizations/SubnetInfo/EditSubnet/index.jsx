import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { v4 } from 'is-cidr';

const schema = yup.object({
  vlan: yup.string().trim().required('Vui lòng nhập tên VLAN.'),
  subnet: yup
    .string()
    .trim()
    .required('Vui lòng nhập địa chỉ subnet.')
    .test('isCIDR', 'Vui lòng nhập địa chỉ subnet theo đúng format.', value =>
      v4(value)
    ),
});

export const EditSubnet = ({ doSubmit, initialData, orgList }) => {
  const [modal, setModal] = useState(false);
  const {
    register,
    handleSubmit,
    errors,
    setError,
    setValue,
    reset,
    formState: { touched, isDirty },
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
      await doSubmit(data, initialData.id);
      hideModal();
    } catch (err) {
      if (err.message === 'SubnetSizeError') {
        setError('subnet', {
          message:
            'Subnet mới không có đủ địa chỉ IP để cấp phát cho toàn bộ thiết bị hiện có của đơn vị!',
        });
      } else if (err.message === 'VlanNameError') {
        setError('vlan', {
          message: 'Tên VLAN này đã tồn tại!',
          shouldFocus: true,
        });
      }
    }
  };

  const autoFillVLAN = event =>
    setValue(
      'vlan',
      !+event.target.value
        ? ''
        : `VLAN-${
            orgList.find(item => item.id === +event.target.value).abbreviation
          }`,
      { shouldValidate: true }
    );

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
        contentClassName="block block-rounded mb-0"
        centered
      >
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          <Modal.Header className="block-header bg-body px-3">
            <i className="far fa-fw fa-edit mr-2" />
            <Modal.Title className="block-title">Cập nhật subnet</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Row>
              <Form.Group className="col-4" controlId="formVlan">
                <Form.Label className="required">Tên VLAN</Form.Label>
                <Form.Control
                  type="text"
                  name="vlan"
                  placeholder="Nhập tên VLAN"
                  ref={register}
                  isValid={touched.vlan && !errors.vlan}
                  isInvalid={!!errors.vlan}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.vlan?.message}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Ví dụ: VLAN-bgh, VLAN-khoa-cntt ...
                </Form.Text>
              </Form.Group>
              <Form.Group className="col-8" controlId="formOrgId">
                <Form.Label>Đơn vị</Form.Label>
                <Form.Control
                  as="select"
                  className="custom-select"
                  name="organizationId"
                  onChange={autoFillVLAN}
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
            </Form.Row>
            <Form.Row>
              <Form.Group className="col-12" controlId="formSubnet">
                <Form.Label className="required">Địa chỉ subnet</Form.Label>
                <Form.Control
                  type="text"
                  name="subnet"
                  placeholder="Nhập địa chỉ subnet"
                  ref={register}
                  isValid={touched.subnet && !errors.subnet}
                  isInvalid={!!errors.subnet}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.subnet?.message}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Nhập theo format CIDR, ví dụ:{' '}
                  <span className="font-w500">10.10.224.0/26</span>,{' '}
                  <span className="font-w500">10.10.224.192/26</span>...
                </Form.Text>
              </Form.Group>
            </Form.Row>
          </Modal.Body>
          <Modal.Footer className="bg-body-light">
            <Button variant="alt-secondary" onClick={hideModal}>
              Hủy
            </Button>
            <Button variant="alt-primary" type="submit" disabled={!isDirty}>
              Lưu thay đổi
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};
