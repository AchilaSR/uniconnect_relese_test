import { CALL_DISTRIBUTION } from './config';

export default function (state = null, action) {
    switch (action.type) {
        case CALL_DISTRIBUTION:
          
            // const responseData = action.payload; 

            // if (responseData && Array.isArray(responseData.data)) {
               
            //     const callData = responseData.data.map(item => ({
            //         datetime: item.time_period,
            //         answercount: item.inbound_answered,
            //         unanswercount: item.inbound_unanswered,
            //         awt_before_answer: item.avg_waiting_unanswered,
            //         awt_after_answer: item.avg_waiting_answered , 
            //         outbound: item.outbound_total,
            //         outbound_answered:item.outbound_answered,
            //         outbound_unanswered:item.outbound_unanswered
            //     }));

            //     return callData;
            // }

            return action.payload;
       
        default:
            return state;
    }
}
