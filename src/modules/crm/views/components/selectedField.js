import { useEffect, useState } from "react";
import { Button, Input } from "reactstrap";

export default function SelectedFeild({ item, onNameChange }) {
    const [name, setName] = useState(item.label);
    const [edit, setEdit] = useState(false);

    useEffect(() => {
        if (!edit) {
            onNameChange(name);
        }
    }, [edit])


    return <div className="d-flex">
        <Button className="mr-3" onClick={() => setEdit(!edit)} color="link" size="xs"><i className={`fa ${edit ? 'fa-save' : 'fa-pencil'}`}></i></Button>{" "}
        <div>
            {
                edit ? <Input style={{ margin: -7 }} value={name} onChange={(e) => setName(e.target.value)} /> : <b>{item.label}</b>
            }
        </div>
        <div className="ml-auto">
            <small>{item.name}</small>
        </div>
    </div>
}