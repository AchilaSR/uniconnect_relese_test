import React from 'react';
const User = props => {
    return <div className="marker user">
        <i className="fa fa-street-view" ></i>
        <div className="text">{props.data.phone}</div>
    </div>;
}


export default User;