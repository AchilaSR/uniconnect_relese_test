import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import Draggable from 'react-draggable';

const PopupModal = (props) => {
  const {
    isOpen, toggle, children, title = "", size = "md", draggable = true, hideCloseButton = false
  } = props;

  const closeBtn = hideCloseButton ? " " : <button className="close" onClick={toggle}>&times;</button>;

  const modal = <Modal size={size} isOpen={isOpen} toggle={toggle} backdrop="static">
    <ModalHeader className="cursor" close={closeBtn} toggle={toggle}>{title}</ModalHeader>
    <ModalBody className='p-4'>
      {children}
    </ModalBody>
  </Modal>;

  if (draggable) {
    return <Draggable handle=".modal-header">
      {modal}
    </Draggable>
  }

  return modal;
}

export default PopupModal;