import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getFieldView, getModuleDescription, searchRecords } from '../../action';
import Loader from '../../../../components/Loader';
import Modal from '../../../../components/Modal';
import Create from '../create';
import { CUSTOM } from '../../../../custom';
import { MODULES } from '../../config';

class TableWidget extends Component {
    constructor(props) {
        super(props);
        this.refresh_interval = null;
        this.state = { showTicket: false };
        this.elementRef = React.createRef();
    }

    componentWillMount() {
        this.loadData();
        this.refresh_interval = setInterval(() => {
            this.loadData();
        }, this.props.refresh_interval_seconds);
    }

    componentDidMount() {
        if (!this.props.field_list) {
            this.props.getFieldView(this.props.module_name);
            this.props.getModuleDescription(this.props.module_name);
        }
    }

    loadData() {
        const { module_name, search_fileds, sortField, values } = this.props;
        this.props.searchRecords(module_name, search_fileds.join(" AND "), (err, data) => {
            if (!err) {
                this.setState({ data });
            }
        });
    }

    componentWillUnmount() {
        clearInterval(this.refresh_interval);
    }

    renderColumn(v) {
        const items = _.filter(this.state.data, { [this.props.sortField]: v });
        return <td>
            <h5 className='d-flex'><span>{v}</span> <small className='ml-auto'>{items.length ? `${items.length} Records Found` : ""}</small></h5>
            <div style={{ maxHeight: (this.props.height * 15) - 110 }} className='kanban-column bg-light rounded'>
                {
                    items.map((a) => (this.renderItem(a)))
                }
            </div>
        </td>
    }

    renderItem(a) {
        const [title, description, ...others] = this.props.selectedFields;
        return <div onClick={() => { this.setState({ selected: a, showTicket: true }) }} className='kanban-task cursor'>
            <h6>{a[title]}</h6>
            <p>{a[description]}</p>
            {
                others.map((b) => <p className='text-small text-muted'>{a[b]}</p>)
            }
        </div>
    }

    render() {
        if (!this.state.data) {
            return <Loader />;
        }

        return <div> <table className='kanban-board'>
            <tr style={{ verticalAlign: "top" }}>
                {
                    this.props.values.map((v) => this.renderColumn(v))
                }
            </tr>
        </table>
            <Modal size="lg" title={(CUSTOM.CRM_MODULES || MODULES)[this.props.module_name]} toggle={() => { this.setState({ showTicket: !this.state.showTicket }) }} isOpen={this.state.showTicket}>
                <Create columns={3} onCancel={(a) => this.setState({ showTicket: false })} module={this.props.module_name} data={this.state.selected ? this.state.selected : {}} mode={"view"} />
            </Modal>
        </div>
    }
}

function mapStateToProps({ field_list, module_description }, props) {
    return {
        field_list: field_list[props.module_name],
        module_description: module_description[props.module_name]
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        searchRecords,
        getFieldView,
        getModuleDescription
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(TableWidget));