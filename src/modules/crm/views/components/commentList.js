import React, { useState, useSelector } from 'react';
import { connect } from "react-redux";
import _ from "lodash";
import { bindActionCreators } from 'redux';
import { deleteRecord, searchRecords, getRecentActicity } from '../../action';
import { useEffect } from 'react';
import FieldValue from './FieldValue';
import { Button, Input } from 'reactstrap';
import { addRecord } from '../../action';
import correctDate from './dateField';

function CommentList({ editable, deletable, id, searchRecords, addRecord, deleteRecord, getRecentActicity, module, onCommentCountChange }) {
    const [data, setData] = useState();
    const [selected, select] = useState({});
    const [disabled, setDisable] = useState(false);
    const [commentcontent, setComment] = useState("");
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        searchRecords("ModComments", [{ field: "related_to", value: id }], (err, data) => {
            setData(data || []);
            if (typeof onCommentCountChange === "function") {
                onCommentCountChange(data.length);
            }
        }, true)
    }, [])

    useEffect(() => {
        setComment(selected.commentcontent);
    }, [selected]);


    useEffect(() => {
        const fetchRecentActivity = async () => {
            try {
                const response = await getRecentActicity(id, module);
                setRecentActivity(response);
                console.log("Fetched Recent Activity:", response);
            } catch (error) {
                console.error("Error fetching recent activity:", error);
            }
        };
        fetchRecentActivity();
    }, []);

    const deleteComment = (cid) => {
        if (window.confirm("Are you sure, you want to delete the comment?")) {
            deleteRecord("ModComments", cid, [{ field: "related_to", value: id }], () => {
                searchRecords("ModComments", [{ field: "related_to", value: id }], (err, data) => {
                    setData(data);
                    if (typeof onCommentCountChange === "function") {
                        onCommentCountChange(data.length);
                    }
                }, true)
            });
        }
    }

    const renderComments = () => {
        if (data) {
            if (data.length) {
                return data.map((m) => {
                    return (<div key={m.id}>
                        <div className={`bordered rounded mb-1 px-3 py-2 ${selected && selected.id === m.id ? 'bg-primary' : 'bg-white'}`}>
                            <div className='d-flex align-items-center justify-content-between'>
                                <div>
                                    <b><FieldValue module={"Users"} id={m.assigned_user_id} /> {m.creator !== m.assigned_user_id ? <small>Created by <FieldValue module={"Users"} id={m.creator} /></small> : ""} </b><br />
                                    <small>{correctDate(m.modifiedtime)} {m.createdtime !== m.modifiedtime ? `[Created at ${correctDate(m.createdtime)}]` : ""}</small>
                                </div>
                                <div>
                                    {editable ? <Button onClick={() => select(selected && m.id === selected.id ? {} : m)} outline color='primary' size='xs'><i className='fa fa-pencil'></i></Button> : ""}
                                    {deletable ? <Button onClick={() => deleteComment(m.id)} outline className='ml-1' size='xs' color='danger'><i className='fa fa-trash'></i></Button> : ""}
                                </div>
                            </div>
                            <div>{m.commentcontent}</div>

                        </div>
                    </div>)
                })
            }
            else {
                return <div>No comments found</div>
            }
        } else {
            return <div>Loading...</div>
        }
    }

    const addComment = (e) => {
        e.preventDefault();
        setDisable(true);
        addRecord("ModComments", { related_to: id, commentcontent, id: selected.id }, [{ field: "related_to", value: id }], () => {
            setComment("");
            select({});
            searchRecords("ModComments", [{ field: "related_to", value: id }], (err, data) => {
                setData(data);
                setDisable(false);
                if (typeof onCommentCountChange === "function") {
                    onCommentCountChange(data.length);
                }
            }, true)
        });
    }


    return <div>
        <div className='comment-container'>
            {renderComments()}
        </div>
        {editable ?
            <form onSubmit={(e) => addComment(e)} >
                <div className='d-flex mt-2 p-1 bg-white rounded'>
                    <div className='mr-2 flex-grow-1'><Input placeholder='Add a comment' value={commentcontent} onChange={(e) => setComment(e.target.value)} type='textarea' /></div>
                    <Button disabled={disabled} type='submit'>Submit</Button>
                </div>
            </form> : ""}
    </div>

}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        searchRecords,
        addRecord,
        deleteRecord,
        getRecentActicity
    }, dispatch);
}

export default connect(null, mapDispatchToProps)(CommentList);
