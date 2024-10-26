import React, { Component } from 'react';
import { connect } from "react-redux";
import _, { reject } from "lodash";
import { bindActionCreators } from 'redux';
import { deleteDocument, downloadDocument, getDocumentList, uploadDocument } from '../../action';
import { addRecord } from '../../action';
import correctDate from './dateField';

import Dropzone from 'react-dropzone';
import { Button } from 'reactstrap';

class DocumentList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            files: []
        };
    }

    componentDidMount() {
        const { id, getDocumentList, onDataUpdate } = this.props;
    
        if (id) {
            getDocumentList(id.split("x")[1], (err, data) => {
                const documents = data || [];
                this.setState({ data: documents });
                if (onDataUpdate) {
                    onDataUpdate(documents);
                }
                if (typeof this.props.onDocumentCountChange === "function") {
                    this.props.onDocumentCountChange(documents.length);
                }
            }, true);
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.id !== this.props.id) {
            const { id, getDocumentList } = this.props;
    
            if (id) {
                getDocumentList(id.split("x")[1], (err, data) => {
                    const documents = data || [];
                    this.setState({ data: documents, files: [] });
                    if (typeof this.props.onDocumentCountChange === "function") {
                        this.props.onDocumentCountChange(documents.length);
                    }
                }, true);
            } else {
                this.setState({ data: [], files: [] });
                if (typeof this.props.onDocumentCountChange === "function") {
                    this.props.onDocumentCountChange(0);
                }
            }
        }
    }

    deleteDoc = (cid) => {
        if (window.confirm("Are you sure, you want to delete this document?")) {
            const { id, deleteDocument, getDocumentList } = this.props;
    
            deleteDocument(id.split("x")[1], cid, () => {
                getDocumentList(id.split("x")[1], (err, data) => {
                    const documents = data || [];
                    this.setState({ data: documents }, () => {
                        if (typeof this.props.onDocumentCountChange === "function") {
                            this.props.onDocumentCountChange(documents.length);
                        }
                    });
                }, true);
            });
        }
    }
    

    downloadDoc = (id) => {
        this.props.downloadDocument(id, (err, data) => {
            window.open(data.message)
        })
    }

    deleteItem = (index) => {
        if (index > -1) { // only splice array when item is found
            this.state.files.splice(index, 1); // 2nd parameter means remove one item only
        }
        this.setState({ files: this.state.files })

        if (typeof this.props.onFileChanged === "function") {
            this.props.onFileChanged(this.state.files.length);
        }
    }

    saveDoc = (id) => {
        const { files } = this.state;
        const { uploadDocument, getDocumentList } = this.props;
        const self = this;
    
        Promise.all(files.map((file) => {
            return new Promise((resolve, reject) => {
                const formData = new FormData();
                formData.append('file_data', file);
                formData.append('ticket_id', id.split("x")[1]);
                formData.append('task', "document_upload_ticket");
                uploadDocument(formData, (err) => {
                    if (err) {
                        file.status = "Error uploading file";
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            })
        })).then(() => {
            if (id) {
                getDocumentList(id.split("x")[1], (err, data) => {
                    const documents = data || [];
                    this.setState({ data: documents, files: [] }, () => {
                        if (typeof this.props.onDocumentCountChange === "function") {
                            this.props.onDocumentCountChange(documents.length);
                        }
                        if (typeof this.props.onFileChanged === "function") {
                            this.props.onFileChanged(0);
                        }
                    });
                }, true);
            }
        }).catch(() => {
            if (id) {
                getDocumentList(id.split("x")[1], (err, data) => {
                    const documents = data || [];
                    this.setState({ data: documents, files: files.filter((a) => a.status) }, () => {
                        if (typeof this.props.onDocumentCountChange === "function") {
                            this.props.onDocumentCountChange(documents.length);
                        }
                    });
                }, true);
            }
        })
    }

    handleDrop = (files) => {
        this.setState({ files }, () => {
            if (typeof this.props.onFileChanged === "function") {
                this.props.onFileChanged(files.length);
            }
        });
    };

    renderButton = () => {
        return <div className='m-1'><Dropzone onDrop={this.handleDrop}>
            {({ getRootProps, getInputProps }) => (
                <div {...getRootProps({ className: 'dropzone' })} style={{ width: 300, height: 52, borderWidth: 1, borderStyle: "dashed" }} className='rounded font-weight-bold bg-light p-3 text-center cursor'>
                    <input {...getInputProps()} />
                    Drag and Drop or Click to Upload Files
                </div>
            )}
        </Dropzone></div>
    }

    render() {
        const { data, files } = this.state;
        const { deletable, editable } = this.props;

        return (
            <div>
                {/* <h5>Documents</h5> */}
                {editable || (data && data.length) || (files && files.length) ? <hr /> : ""}
                <div className='d-flex flex-wrap'>
                    {data && data.length ? data.map((m) => (
                        <div className='m-1'>
                            <div className='d-flex justify-content-between p-2 rounded border' style={{ width: 300 }} key={m.document_id}>
                                <div className='cursor' onClick={() => this.downloadDoc(m.document_id)}>
                                    <div style={{ width: 250 }} className='ellipsis'>{m.label}</div>
                                    <small>{correctDate(m.created_time)}</small>
                                </div>
                                {deletable ? (
                                    <div>
                                        <Button onClick={() => this.deleteDoc(m.document_id)} size='sm' color='outline-danger'><i className='fa fa-trash'></i></Button>
                                    </div>
                                ) : ""}
                            </div>
                        </div>
                    )) : ""}
                    {this.state.files.map((file, i) => (
                        <div className='m-1'>
                            <div className='d-flex justify-content-between p-2 rounded border bg-light' style={{ width: 300 }} key={file.name}>
                                <div>
                                    <div style={{ width: 250 }} className='ellipsis'>{file.name}</div>
                                    <small>{file.status ? <span className='text-danger'>{file.status}</span> : "Pending Upload"}</small>
                                </div>
                                <div>
                                    <Button onClick={() => this.deleteItem(i)} size='sm' color='outline-danger'><i className='fa fa-trash'></i></Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {editable ? this.renderButton() : ""}
                </div>
                {editable || (data && data.length) || (files && files.length) ? <hr /> : ""}
            </div>
        )

    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getDocumentList,
        addRecord,
        deleteDocument,
        downloadDocument,
        uploadDocument
    }, dispatch);
}

export default connect(null, mapDispatchToProps, null, { withRef: true })(DocumentList);
