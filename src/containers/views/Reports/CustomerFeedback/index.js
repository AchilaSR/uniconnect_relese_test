import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import CreateReport from './create';
import { connect } from "react-redux";
import { downloadCSV } from "../../../../libs/csv-download/src/index";
import paginationFactory from 'react-bootstrap-table2-paginator';
import BootstrapTable from 'react-bootstrap-table-next';
import { getFeedbacks } from '../../../../actions/feedback';
import { bindActionCreators } from 'redux';
import { loadAgents } from '../../../../actions/reports';
import { listQueues } from '../../../../actions/configurations';

class FeedbackReport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFull: false,
            sizePerPage: 10,
            page: 1
        };
    }

    componentDidMount() {
        this.props.loadAgents()
        this.props.listQueues()
    }

    onPageChange(data) {
        console.log("onPageChange", data)
    }

    onTableChange(type, data) {
        this.setState({ page: data.page }, () => { this.onSearch(); });
    }

    onSearch(filter) {
        if (filter) {
            this.setState({ filter: filter, page: 1 }, () => {
                this.props.getFeedbacks({
                    ...this.state.filter,
                    offset: (this.state.page - 1) * this.state.sizePerPage,
                    limit: this.state.sizePerPage
                })
            });
        } else {
            this.props.getFeedbacks({
                ...this.state.filter,
                offset: (this.state.page - 1) * this.state.sizePerPage,
                limit: this.state.sizePerPage
            })
        }
    }

    download() {
        const { agents, feedback_report } = this.props;
        console.log(feedback_report);
        this.props.getFeedbacks({
            ...this.state.filter,
            offset: 0,
            limit: feedback_report.total_records + 1
        }, (data) => {

            data.map(d => {
                const agent = _.find(agents, { AgentExtension: d.extension });
                if (agent) {
                    console.log(agent.AgentName);
                    d.agent = agent.AgentName;
                    delete d.extension; // Remove the extension property
                    delete d.count;
                }
            })
            const reorderedData = data.map(({ date_time, hotline_number, agent, customer_number, feedback }) => ({
                time: date_time,
                hotline_number,
                agent,
                customer_number,
                customer_feedback: feedback
            }));

            downloadCSV(reorderedData, null, "feedback-report.csv")
        })
    }

    render() {
        const { feedback_report, queues, agents } = this.props;

        const columns = [{
            dataField: 'date_time',
            text: 'Time'
        },
        {
            dataField: 'hotline_number',
            text: 'Hotline Number'
        },
        // {
        //     dataField: 'hotline_number',
        //     text: 'Queue',
        //     formatter: (cellContent, row) => {
        //         return _.find(queues, { extension: cellContent }).display_name
        //     }
        // }, 
        {
            dataField: 'extension',
            text: 'Agent',
            formatter: (cellContent, row) => {
                const agent = _.find(agents, { AgentExtension: cellContent });
                return agent ? agent.AgentName : '';
            }

        }, {
            dataField: 'customer_number',
            text: 'Customer Number'
            // }, {
            //     dataField: 'language',
            //     text: 'Language'
        }, {
            dataField: 'feedback',
            text: 'Customer Feedback',
            classes: (cellContent) => {
                return `rating bg-${cellContent.replace(/\s+/g, '-').toLowerCase()}`;
            }
        }];

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Customer Feedback</li>
                    {this.props.feedback_report.data.length ? <li className="breadcrumb-menu">
                        <div className="btn-group">
                            <a className="btn" onClick={() => this.download()} ><i className="fa fa-download"></i> Download CSV</a>
                        </div>
                    </li> : ""}
                </ol>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <Card className="mr-3" style={{ width: 300 }}>
                            <CardHeader>Report Settings</CardHeader>
                            <CreateReport onSearch={(filter) => this.onSearch(filter)} />
                        </Card>
                        <Card className="flex-grow-1">
                            <CardHeader>Report
                                {feedback_report.total_records ? <span className="pull-right">
                                    {`${feedback_report.total_records} Records Found`}
                                </span> : ""}
                            </CardHeader>
                            <CardBody>
                                {feedback_report.data && feedback_report.data.length > 0 ? <BootstrapTable
                                    keyField='index'
                                    data={feedback_report.data}
                                    columns={columns}
                                    onPageChange={this.onPageChange}
                                    onTableChange={(type, data) => this.onTableChange(type, data)}
                                    remote={{ pagination: true }}
                                    pagination={paginationFactory({
                                        hideSizePerPage: true,
                                        totalSize: feedback_report.total_records,
                                        sizePerPage: this.state.sizePerPage,
                                        page: this.state.page,
                                        alwaysShowAllBtns: true,
                                        withFirstAndLast: true
                                    })} />
                                    : "No data available"}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ feedback_report, agents, queues }) {
    return {
        feedback_report, agents, queues
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getFeedbacks,
        loadAgents,
        listQueues
    }, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(FeedbackReport);