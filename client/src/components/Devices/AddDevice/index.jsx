import React, { useState } from 'react';
import { FormGroup, Button, Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MAC_REGEX } from '../../../constants';
import { sanitized } from '../../../utils';
import './styles.scss';

const schema = yup.object({
  userId: yup
    .number()
    .required()
    .positive('Vui lòng chọn người sử dụng thiết bị.')
    .integer(),
  macAddress: yup
    .string()
    .trim()
    .required('Vui lòng nhập địa chỉ MAC của thiết bị.')
    .matches(MAC_REGEX, 'Vui lòng nhập địa chỉ MAC theo đúng format.'),
});

export const AddDevice = ({ doSubmit, orgList, userList }) => {
  const [modal, setModal] = useState(false);
  const [orgId, setOrgId] = useState(0);
  const {
    register,
    handleSubmit,
    errors,
    setError,
    reset,
    formState: { touched },
  } = useForm({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  });

  const showModal = () => {
    reset();
    setOrgId(0);
    setModal(true);
  };
  const hideModal = () => setModal(false);

  const onSubmit = async data => {
    try {
      await doSubmit(sanitized(data));
      hideModal();
    } catch (err) {
      if (err.message === 'AddressError') {
        setError('userId', {
          message:
            'Subnet đơn vị của người dùng này đã hết địa chỉ để cấp phát!',
        });
      } else {
        setError('macAddress', {
          message: 'Địa chỉ MAC này đã tồn tại!',
          shouldFocus: true,
        });
      }
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
            <Modal.Title className="block-title">Thêm thiết bị</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Row>
              <Form.Group className="col-5" controlId="formOrgId">
                <Form.Label>Đơn vị</Form.Label>
                <Form.Control
                  as="select"
                  className="custom-select"
                  value={orgId}
                  onChange={event => setOrgId(+event.target.value)}
                >
                  <option value="0">Chọn đơn vị</option>
                  {orgList.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.fullName}
                    </option>
                  ))}
                </Form.Control>
                <Form.Text className="text-muted">
                  Lựa chọn đơn vị để lọc người dùng.
                </Form.Text>
              </Form.Group>
              <Form.Group className="col-7" controlId="formUserId">
                <Form.Label className="required">Người dùng</Form.Label>
                <Form.Control
                  as="select"
                  className="custom-select"
                  name="userId"
                  ref={register({
                    valueAsNumber: true,
                  })}
                  isValid={touched.userId && !errors.userId}
                  isInvalid={!!errors.userId}
                >
                  <option value="0">Chọn người dùng</option>
                  {userList
                    .filter(item => !orgId || item.organizationId === orgId)
                    .map(item => (
                      <option key={item.id} value={item.id}>
                        {item.fullName}
                      </option>
                    ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.userId?.message}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Một địa chỉ IP mới từ subnet đơn vị của người dùng sẽ được cấp
                  phát cho thiết bị.
                </Form.Text>
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group className="col-12" controlId="formMacAddress">
                <Form.Label className="required">
                  Địa chỉ MAC của thiết bị
                </Form.Label>
                <Form.Control
                  type="text"
                  name="macAddress"
                  placeholder="Nhập địa chỉ"
                  ref={register}
                  isValid={touched.macAddress && !errors.macAddress}
                  isInvalid={!!errors.macAddress}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.macAddress?.message}
                </Form.Control.Feedback>
                <Form.Text className="text-muted long-desc">
                  ・Sử dụng lệnh <code>ipconfig /all</code> (Windows) hoặc{' '}
                  <code>ip link show</code> (Linux) để lấy địa chỉ MAC của thiết
                  bị. <br /> ・Đối với máy tính, lưu ý lựa chọn địa chỉ MAC
                  tương ứng với card mạng (Wifi / Ethernet) sử dụng để truy cập
                  hệ thống. <br />
                  <div className="mt-1">
                    Ví dụ địa chỉ MAC hợp lệ:{' '}
                    <span className="font-w500">00:05:A0:A5:AA:B0</span> hoặc{' '}
                    <span className="font-w500">00-05-A0-A5-AA-B0</span>.
                  </div>
                </Form.Text>
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group className="col-12" controlId="formType">
                <Form.Label>Loại thiết bị</Form.Label>
                <Form.Control
                  type="text"
                  name="type"
                  placeholder="Nhập loại thiết bị"
                  ref={register}
                />
                <Form.Text className="text-muted">
                  Ví dụ: Máy tính để bàn, Máy tính xách tay, Điện thoại, ...
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
