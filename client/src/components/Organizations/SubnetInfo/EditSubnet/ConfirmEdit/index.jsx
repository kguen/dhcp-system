import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

export const ConfirmEdit = ({ isDirty, doSubmit }) => {
  const [modal, setModal] = useState(false);

  const showModal = () => setModal(true);
  const hideModal = () => setModal(false);

  return (
    <>
      <Button variant="alt-primary" onClick={showModal} disabled={!isDirty}>
        Lưu thay đổi
      </Button>
      <Modal
        show={modal}
        onHide={hideModal}
        contentClassName="block block-rounded mb-0"
        centered
      >
        <Modal.Body className="font-w500">
          Bạn có chắc chắn muốn cập nhật bản ghi này chứ ?
        </Modal.Body>
        <Modal.Footer className="bg-body-light">
          <Button variant="alt-secondary" onClick={hideModal}>
            Hủy
          </Button>
          <Button
            variant="alt-danger"
            onClick={() => {
              hideModal();
              doSubmit();
            }}
          >
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
