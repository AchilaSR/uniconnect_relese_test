import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardBody } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Loader from '../../../../components/Loader';
import Rating from 'react-simple-star-rating'

import { loadAgentEtiquettesReport, updateEtiquettesReport } from '../../../../actions/reports';

class Dial extends Component {
    constructor(props) {
        super(props);

        this.state = {
            rating: 5
        }
    }
    changeRating({ id, agentName }, rating) {
        if (window.confirm(`Do you want to change the Ratings of ${agentName} to ${rating}?`)) {
            this.props.updateEtiquettesReport({ id, rating });
        }
    }
    componentWillMount() {
        this.props.loadAgentEtiquettesReport();
    }

    render() {
        const { agent_etiquettes } = this.props;

        if (!agent_etiquettes) {
            return <Loader />;
        }

        const columns = [{
            dataField: 'agentName',
            text: 'Agent Name'
        }, {
            dataField: 'extension',
            text: 'Extension',
            headerStyle: {
                width: 100
            },
            align: 'center'
        },
        {
            dataField: 'rating',
            text: 'Etiquette Index',
            headerStyle: {
                width: 350
            },
            align: 'center',
            formatter: (cellContent, row) => {
                return (
                    <div className="d-flex justify-content-between rating-stars">

                        <Rating
                            onClick={(v) => this.changeRating(row, v)}
                            ratingValue={cellContent}
                            size={20}
                            stars={10}
                            transition
                            fillColor='#000000' ll remove the inline style if applied
                        />
                        <span style={{ width: 50 }} className="text-center font-weight-bold bg-light rounded px-3">{cellContent}</span>
                    </div>

                );
            }
        },
        {
            dataField: 'rated_by',
            text: 'Last Rated By',

        }];
        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Agent Etiquettes</li>
                </ol>
                <div className="container-fluid">
                    <Card>
                        <CardHeader>Agent Etiquettes</CardHeader>
                        <CardBody>
                            {agent_etiquettes.length > 0 ?
                                <BootstrapTable keyField='id' data={agent_etiquettes} columns={columns} /> : "No data available"}
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
    }
}


function mapStateToProps({ agent_etiquettes }) {
    return {
        agent_etiquettes
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        loadAgentEtiquettesReport,
        updateEtiquettesReport
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Dial);
