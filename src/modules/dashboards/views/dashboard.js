import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, ButtonGroup, Card, CardBody, Input } from 'reactstrap';
import { index, remove, view, create } from '../action';
import { checkPermission } from '../../../config/util'
import Fullscreen from "react-full-screen";
import GridLayout from 'react-grid-layout';
import Create from './create';
import ReactResizeDetector from 'react-resize-detector';
import PopupModal from '../../../components/Modal';
import _ from 'lodash';
import Widget from './widget';
import { listIVRs, listQueues, list3cxGroups } from '../../../actions/configurations';
import { DASHBOARD_WIDGET_ROW_HEIGHT } from '../config';

class InboundDashboard extends Component {

    constructor(props) {
        super(props);

        this.layout = null;

        this.state = {
            hasReadAccess: false,
            hasWriteAccess: false,
            editName: false,
            dbname: "Untitled Dashboard",
            isFull: false,
            showNewWidget: false,
            widgets: [],
            modified: false,
            zoom: 1,
            is_public: false,
            editable: false
        };
    }

    componentWillMount() {
        if (!this.props.dashboards) {
            this.props.listTemplates();
        }
    }

    componentDidUpdate() {
        if (this.props.match.params.dbname && (parseInt(this.props.match.params.dbname) !== this.state.id) && this.props.dashboards) {
            let dbname = this.props.match.params.dbname;
            if (dbname === "default" && this.props.dashboards) {
                if (this.props.dashboards.length) {
                    dbname = this.props.dashboards[0].id;
                    this.props.history.replace({
                        pathname: `/dashboard/${dbname}`
                    })
                } else {
                    this.props.history.replace({
                        pathname: `/dashboard`
                    })
                }
            }
            const data = _.find(this.props.dashboards, { id: parseInt(dbname) });
            if (data) {
                this.setState({ id: parseInt(dbname), widgets: data.dashboard_data.widgets, dbname: data.name, is_public: data.is_public, editable: data.created_by === this.props.user.user_details.extension });
            }
        }
    }

    componentDidMount() {
        if (!this.props.queues) {
            this.props.listQueues();
            this.props.listIVRs();
            this.props.list3cxGroups();
        }

        if (this.props.match.params.dbname) {
            let dbname = this.props.match.params.dbname;
            if (dbname === "default" && this.props.dashboards) {
                if (this.props.dashboards.length) {
                    dbname = this.props.dashboards[0].id;
                } else {
                    this.props.history.replace({
                        pathname: `/dashboard`
                    })
                }
            }

            this.setState({ dbname });

            if (this.props.dashboards && _.find(this.props.dashboards, { id: parseInt(dbname) })) {
                const data = _.find(this.props.dashboards, { id: parseInt(dbname) });
                this.setState({ widgets: data.dashboard_data.widgets, dbname: data.name, is_public: data.is_public, editable: data.created_by === this.props.user.user_details.extension });
            } else {
                this.props.listTemplates();
            }
        } else {
            this.setState({ editName: true, showNewWidget: true, editable: true });
        }

        this.setState({ hasReadAccess: checkPermission('Dashboard', 'READ') });
        this.setState({ hasWriteAccess: checkPermission('Dashboard', 'WRITE') });
    }

    componentWillUnmount() {
        if (this.state.modified && this.state.editable && this.state.hasWriteAccess) {
            if (window.confirm("You will loose the modification if closed. Do you want to save the changes?")) {
                this.save();
            }
        }
    }

    save() {
        const data = {
            name: this.state.dbname,
            is_public: this.state.is_public,
            id: this.props.match.params.dbname,
            dashboard_data: { widgets: this.state.widgets }
        }

        this.props.saveDashboard(data, (id) => {
            if (id && parseInt(id) > 0) {
                this.setState({ editName: false, modified: false }, () => {
                    this.props.history.replace({
                        pathname: `/dashboard/${id}`,
                        state: data
                    })
                });
            }

        })
    }

    addWidget(widget) {
        this.setState({ widgets: [...this.state.widgets, widget], showNewWidget: false, modified: true }, () => {
            console.log(this.state.widgets);
        });
    }

    changeLayout(layout) {
        this.layout = layout;

        const new_widgets = this.state.widgets.map((a) => {
            const { w, h, x, y } = _.find(this.layout, { "i": a.id.toString() });
            if (!_.isEqual(a.position, { w, h, x, y })) {
                this.setState({ modified: true });
            }
            a.position = { w, h, x, y };
            return a;
        })

        this.setState({ widgets: new_widgets });
    }

    deleteWidget(widget) {
        if (window.confirm("Are you sure, you want to delete this widget?")) {
            const new_widgets = _.reject(this.state.widgets, { id: widget.id });
            this.setState({ widgets: new_widgets, modified: true });
        }
    }

    renderGrid(width, height) {
        if (width) {
            return <GridLayout autoSize={true} className="layout" width={width} onLayoutChange={(layout) => this.changeLayout(layout)} rowHeight={DASHBOARD_WIDGET_ROW_HEIGHT} cols={4} >
                {
                    this.state.widgets.map((widget) => {
                        return <div key={widget.id || Date.now()} data-grid={widget.position}>
                            <Widget editable={this.state.editable && this.state.hasWriteAccess} widget={{ ...widget, width: widget.position.w * 3, height: widget.position.h }} deleteWidget={(widget) => this.deleteWidget(widget)} showControls={!this.state.isFull} />
                        </div>
                    })
                }
            </GridLayout>
        }
    }

    render() {
        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Dashboard</li>
                    <li className="breadcrumb-menu">
                        <div className="btn-group">
                            <a className="btn" onClick={() => this.props.history.push({ pathname: "/dashboard" })}><i className="fa fa-list"></i> Dashboard Templates</a>
                            {this.state.hasWriteAccess ? <a className="btn" onClick={() => this.props.history.push({ pathname: "/new-dashboard" })}><i className="fa fa-plus"></i> New Dashboard</a> : ""}
                            <a className="btn" onClick={() => this.setState({ isFull: true })}><i className="fa fa-window-maximize"></i> Go Fullscreen</a>
                        </div>
                    </li>
                </ol>
                <Fullscreen
                    enabled={this.state.isFull}
                    onChange={isFull => this.setState({ isFull })}
                >
                    <div className="container-fluid px-4">
                        <Card>
                            <CardBody className="d-flex align-items-center">
                                {!this.state.editName && !this.state.isFull && this.state.editable && this.state.hasWriteAccess ? <Button onClick={() => this.setState({ editName: true })} color="light" className="mr-3"><i className="fa fa-pencil"></i></Button> : ""}
                                {this.state.editName && !this.state.isFull ? <Input placeholder="Dashboard Name" value={this.state.dbname} onChange={(e) => this.setState({ dbname: e.target.value, modified: true })} style={{ width: 400 }} /> : <h2>{this.state.dbname}</h2>}
                                {!this.state.isFull ? <div className="ml-auto d-flex">
                                    <ButtonGroup>
                                        {[1, 2, 3].map((zoom) => <Button key={zoom} disabled={zoom === this.state.zoom} color={zoom === this.state.zoom ? "secondary" : "outline-secondary"} onClick={() => this.setState({ zoom })} style={{ fontSize: 9 + zoom }}>A</Button>)}
                                    </ButtonGroup>
                                    {this.state.editable && this.state.hasWriteAccess ? <div>
                                        {!this.state.showNewWidget ? <Button outline color="primary" onClick={() => this.setState({ showNewWidget: true })} className="ml-1"><i className="fa fa-plus"></i></Button> : ""}
                                        <Button outline title="Make the dashboard Public/Private" onClick={() => this.setState({ is_public: !this.state.is_public, modified: true })} className="ml-1"><i className={`fa fa-user${this.state.is_public ? "s" : ""}`}></i></Button>
                                        <Button title="Save" disabled={!this.state.modified} onClick={() => this.save()} color="success" className="ml-1"><i className="fa fa-save"></i></Button>
                                    </div> : ""}
                                </div> : ""}
                            </CardBody>
                        </Card>
                        {
                            this.state.widgets.length > 0 ?
                                <ReactResizeDetector handleWidth handleHeight>
                                    {({ width, height }) => <div className={`bg-light mb-3 rounded zoom-${this.state.zoom}`}>{this.renderGrid(width, height)}</div>}
                                </ReactResizeDetector>
                                : ""}
                    </div>
                </Fullscreen>
                <PopupModal draggable={false} size="lg" title="Add New Widget" toggle={() => { this.setState({ showNewWidget: !this.state.showNewWidget }) }} isOpen={this.state.showNewWidget}>
                    <Create onCanceled={() => { this.setState({ showNewWidget: false }) }} onSaved={(widget) => this.addWidget(widget)} />
                </PopupModal>
            </div>
        );
    }
}

function mapStateToProps({ dashboards, user, queues }) {
    return {
        dashboards, user, queues
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listTemplates: index,
        removeTemplate: remove,
        loadDashboard: view,
        saveDashboard: create,
        listQueues,
        listIVRs,
        list3cxGroups
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(InboundDashboard));
