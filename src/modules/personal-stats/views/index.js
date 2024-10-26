import { useEffect } from "react";
import StatBox from "./stat-box";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DASHBOARD_REFRESH_INTERVAL } from "../../../config/globals";
import { getAgentStats, loadAgentBreak } from "../action";
import { useState } from "react";
import { loadAgents } from "../../../actions/reports";
import { formatMSecondsToTime } from "../../../config/util";

function PersonalStats({ getAgentStats, user_status, loadAgentBreak, agents, loadAgents }) {
    const [stat, setStat] = useState({});
    const [breakTime, setBreakTime] = useState(0);

    const loadStats = () => {
        getAgentStats((err, data) => {
            if (!err) {
                data.talking_duration_in_sec = (parseFloat(data.inbound_calls_talk_time) || 0) + (parseFloat(data.outbound_calls_talk_time) || 0);
                data.answered_count = (parseFloat(data.inbound_calls_answered) || 0) + (parseFloat(data.outbound_calls_answered) || 0);
                data.total_wrap_time =(parseFloat(data.outbound_answered_wrap_time) || 0) + (parseFloat(data.outbound_unanswered_wrap_time) || 0) 
                 + (parseFloat(data.inbound_answered_wrap_time) || 0) +(parseFloat(data.inbound_unanswered_wrap_time) || 0) ;
                 setStat(data);
            }
        });
    }

    const loadBreak = () => {
        loadAgentBreak((err, data) => {
            if (!err) {
                if (data[0] && _.find(data[0].Data, { status_id: 5 })) {
                    const bt = _.find(data[0].Data, { status_id: 5 }).totalDuration;
                    setBreakTime(bt);
                }
            }
        });
    }

    useEffect(() => {
        if (agents && agents.length) {
            loadBreak();
        } else {
            loadAgents();
        }
    }, [user_status, agents])

    useEffect(() => {
        const breakIntval = setInterval(() => {
            if (user_status === 5) {
                setBreakTime((prevCount) => prevCount + 1)
            }
        }, 1000)
        return () => {
            clearInterval(breakIntval);
        }
    }, [user_status])

    useEffect(() => {
        loadStats()

        const intvl = setInterval(() => {
            loadStats();
        }, DASHBOARD_REFRESH_INTERVAL * 1000);

        return () => {
            clearInterval(intvl);
        }
    }, [])

    return <div className='d-flex personal-stats'>
        <div className="bg-light p-1 rounded d-flex sub-stats">
            <div className="label">
                <div>In</div>
            </div>
            <StatBox label="All Calls" value={stat.inbound_calls} />
            <StatBox label="Answered" value={stat.inbound_calls_answered} />
            <StatBox label="Unanswered" value={stat.inbound_calls - stat.inbound_calls_answered} />
            {/* <StatBox label="WSLA Answered" value={stat.answered_calls_within_sla} /> */}
        </div>
        <div className="bg-light p-1 rounded d-flex sub-stats">
            <div className="label">
                <div>Out</div>
            </div>
            <StatBox label="All Calls" value={stat.outbound_calls} />
            <StatBox label="Answered" value={stat.outbound_calls_answered} />
            <StatBox label="Unanswered" value={stat.outbound_calls - stat.outbound_calls_answered} />
        </div>
        <StatBox label="Total Talk Time" value={formatMSecondsToTime(parseFloat(stat.talking_duration_in_sec) * 1000)} format={false} />
        <StatBox label="ATT" value={stat.answered_count ? formatMSecondsToTime(parseFloat(stat.talking_duration_in_sec) * 1000 / stat.answered_count) : "00:00:00"} format={false} />
        <StatBox label="Total Wrap Time" value={formatMSecondsToTime(parseFloat(stat.total_wrap_time * 1000))} format={false} />
        {breakTime ? <StatBox label="Break Time" value={formatMSecondsToTime(breakTime * 1000)} format={false} /> : ""}
    </div>
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getAgentStats,
        loadAgentBreak,
        loadAgents
    }, dispatch);
}

function mapStateToProps({ user_status, agents }) {
    return {
        user_status: user_status ? user_status.status_id : "",
        agents
    };
}

export default (connect(mapStateToProps, mapDispatchToProps)(PersonalStats));