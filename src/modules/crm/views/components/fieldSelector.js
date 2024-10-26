import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ListGroup, Button, Modal, Input, Card, CardBody, CardHeader, Col } from "reactstrap";
import SelectedFeild from "./selectedField";

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, { name: removed.name, label: removed.label });

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const getItemStyle = (isDragging) =>
  `list-group-item ${isDragging ? "active" : ""}`;
const getListStyle = (isDraggingOver) =>
  `col p-3 rounded ${isDraggingOver ? "bg-light" : ""}`;

function FieldSelector({ data, value, onChange, module }) {
  const [items, setItems] = useState([]);
  const [prevModule, setModule] = useState();
  const [selectedCategories, setSelectedCategories] = useState([{ category_name: "default", fields: [] }]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    if (data && module !== prevModule) {
      if (value.length > 0) {
        if (typeof value[0] !== "object") {
          setSelectedCategories([{ category_name: "default", fields: value }]);
        } else {
          setSelectedCategories(value);
        }
      } else {
        setSelectedCategories([{ category_name: "default", fields: [] }]);
        setItems([]);
      }
      setModule(module);
    }
  }, [module, data, value]);

  useEffect(() => {
    const existing_fields = selectedCategories.reduce((acc, current) => acc.concat(current.fields.map(a => a.name)), []);
    setItems([...data.filter((f) => {
      return existing_fields.indexOf(f.name) === -1;
    })]);
    onChange(selectedCategories);
  }, [selectedCategories]);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const items = reorder(
        getList(source.droppableId),
        source.index,
        destination.index
      );
      if (source.droppableId === "all_items") {
        setItems([...items]);
      } else {
        const droppedCategory = _.find(selectedCategories, { category_name: source.droppableId });
        droppedCategory.fields = [...items];
        setSelectedCategories([...selectedCategories]);
      }
    } else {
      const result = move(
        getList(source.droppableId),
        getList(destination.droppableId),
        source,
        destination
      );

      const { droppable, ...rest } = result;
      if (droppable) {
        setItems([...result.droppable]);
      }


      Object.keys(rest).map((category_name) => {
        const fields = _.find(selectedCategories, { category_name });
        if (fields) {
          fields.fields = rest[category_name];
          setSelectedCategories([...selectedCategories]);
        }
      })
      // setSelectedCategories({
      //   ...selectedCategories,
      //   ...rest,
      // });
    }
  };

  const handleAddCategory = () => {
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
  };

  const createCategory = () => {
    if (!categoryName.trim()) {
      return;
    }

    selectedCategories.push({ category_name: categoryName, fields: [] })
    setSelectedCategories([...selectedCategories]);
    handleCloseCategoryModal();
    setCategoryName("");
  };

  const deleteCategory = (i) => {
    if (window.confirm("Are you sure you want to delete this Category?")) {
      selectedCategories.splice(i, 1);
      setSelectedCategories([...selectedCategories]);
    }
  };


  const getList = (id) => {
    if (id === "all_items") {
      return items;
    } else {
      const category = _.find(selectedCategories, { category_name: id })
      return category ? category.fields : [];
    }
  };

  const renameField = (idx_category, idx_item, label) => {
    const item = selectedCategories[idx_category].fields[idx_item].label = label;
    setSelectedCategories([...selectedCategories]);
  }

  return (
    <Card className='flex-grow-1' >
      <CardHeader className='d-flex justify-content-between'>
        <div> Fields</div>
        <div>
          <a className="btn m-0 p-0" color="link" onClick={handleAddCategory}>
            Add Category
          </a>
        </div>
      </CardHeader>
      <CardBody className='px-5'>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="row">
            {/*  */}
            <Modal isOpen={showCategoryModal}>
              <div className="modal-header">
                <h5 className="modal-title">Add Category</h5>
                <button
                  type="button"
                  className="close"
                  onClick={handleCloseCategoryModal}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <Input
                  type="text"
                  placeholder="Category Name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <Button color="primary" onClick={createCategory}>
                  Add
                </Button>
                <Button color="secondary" onClick={handleCloseCategoryModal}>
                  Cancel
                </Button>
              </div>
            </Modal>
          </div>
          <div className="row">
            <Col>
              <Droppable droppableId="all_items">
                {(provided, snapshot) => (
                  <div
                    className={getListStyle(snapshot.isDraggingOver)}
                    ref={provided.innerRef}
                  >
                    <small className="text-uppercase text-muted mb-3">
                      Available Fields
                    </small>
                    <ListGroup>
                      {items.map((item, index) => (
                        <Draggable
                          key={item.name}
                          draggableId={item.name}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={getItemStyle(snapshot.isDragging)}
                            >
                              <div className="d-flex justify-content-between">
                                <div>
                                  <b>{item.label} {item.mandatory ? <span className="text-danger">*</span> : ""}</b>
                                </div>
                                <div>
                                  {" "}
                                  <small className="ml-auto">{item.name}</small>
                                </div>
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ListGroup>
                  </div>
                )}
              </Droppable>
            </Col>
            <Col>
              {selectedCategories.map(({ category_name, fields }, idx_category) => (
                <Droppable key={category_name} droppableId={category_name}>
                  {(provided, snapshot) => (
                    <div
                      className={getListStyle(snapshot.isDraggingOver)}
                      ref={provided.innerRef}
                    >
                      <small className="d-flex text-uppercase text-muted w-100">
                        {category_name}
                        {category_name !== "default" ? <div className="ml-auto">
                          {/* <a onClick={() => editCategory(i)} className="cursor">Rename</a> */}
                          <a onClick={() => deleteCategory(idx_category)} className="cursor ml-3 text-danger">Delete</a>
                        </div> : ""}
                      </small>
                      <ListGroup>
                        {/* {JSON.stringify(selectedCategories[category], null, 2)} */}
                        {fields.map((item, idx_item) => (
                          <Draggable
                            key={`${category_name}-${item.name}`}
                            draggableId={`${category_name}-${item.name}`}
                            index={idx_item}
                          >
                            {(provided, snapshot) => (
                              <li
                                className={getItemStyle(snapshot.isDragging)}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <SelectedFeild item={item} onNameChange={(name) => renameField(idx_category, idx_item, name)} />
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ListGroup>
                    </div>
                  )}
                </Droppable>
              ))}
            </Col>
          </div>
        </DragDropContext>
      </CardBody>
    </Card >
  );
}

export default FieldSelector;
