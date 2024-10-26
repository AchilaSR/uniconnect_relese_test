import { Button } from 'reactstrap';
import PopupModal from '../../../components/Modal';
import Create from './create';
import { useState } from 'react';
import { ENABLE_SCHEDULED_REPORTS } from '../../../config/globals';

export default function ReportScheduleButton({ api, data }) {
    const [isOpen, open] = useState(false);

    if (ENABLE_SCHEDULED_REPORTS) {
        return <div>
            <Button disabled={!data} style={{ fontSize: 18 }} className='py-0 px-2' onClick={() => open(true)} outline>
                <i className='fa fa-clock-o' ></i>
            </Button>
            <PopupModal title="Schedule Report" isOpen={isOpen} toggle={() => open(!isOpen)}>
                <Create onSuccess={() => open(!isOpen)} data={data} api={api} />
            </PopupModal>
        </div>
    } else {
        return <div></div>
    }
}