import React from 'react';
const Branch = props => {
    return <div className="marker" onClick={() => props.onClick(props)}>
        <i className="fa fa-map-marker" ></i>
        <div className="text">{props.data.branch_name}<br />{props.data.address}
        </div>
    </div>;
}


export default Branch;