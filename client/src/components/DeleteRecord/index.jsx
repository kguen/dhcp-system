import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import './styles.scss';

export const DeleteRecord = ({ doSubmit, recordId, message }) => {
  const [modal, setModal] = useState(false);

  const showModal = () => setModal(true);
  const hideModal = () => setModal(false);

  return (
    <>
      <Button className="btn-sm btn-alt-light" onClick={showModal}>
        <i className="fa fa-fw fa-trash-alt" />
      </Button>
      <Modal
        show={modal}
        onHide={hideModal}
        {...(message ? { size: 'lg', className: 'text-center' } : {})}
        contentClassName="block block-rounded mb-0"
        centered
      >
        <Modal.Body className="font-w500">
          Bạn có chắc chắn muốn xóa bản ghi này ?
          {message && (
            <>
              <br />
              <p className="warning-message font-w400 text-danger mt-2 mb-0">
                <strong>
                  <u>Lưu ý</u>:
                </strong>{' '}
                {message}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-body-light">
          <Button variant="alt-secondary" onClick={hideModal}>
            Hủy
          </Button>
          <Button variant="alt-danger" onClick={() => doSubmit(recordId)}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
