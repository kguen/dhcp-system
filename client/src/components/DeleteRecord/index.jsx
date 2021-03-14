import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

export const DeleteRecord = ({ doSubmit, recordId }) => {
  const [modal, setModal] = useState(false);

  const showModal = () => setModal(true);
  const hideModal = () => setModal(false);

  return (
    <>
      <Button className="btn-sm btn-alt-light" onClick={showModal}>
        <i className="fa fa-fw fa-times" />
      </Button>
      <Modal
        show={modal}
        onHide={hideModal}
        contentClassName="block block-rounded mb-0"
        centered
      >
        <Modal.Body className="font-w500">
          Bạn có chắc chắn muốn xóa bản ghi này ?
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
