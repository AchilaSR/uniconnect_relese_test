import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Alert, Button, FormGroup, Label, Table } from 'reactstrap';
import { rescheduleCampaign } from "../../../actions/campaigns";
import CheckBox from "../../../components/CheckBox";
import Loader from "../../../components/Loader";
import { index as getDispositionTemplateList } from '../../../modules/disposition-note-templates/action';
import Select from 'react-select';
import { DYNAMIC_DISPOSITION_FORMS } from "../../../config/globals";
import { listCategories } from "../../../modules/disposition/action";


class Reschedule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            template: [],
            catagories: [],
        }
    }

    save(e) {
        e.preventDefault();
        const self = this;
        const data = {
            "campaign_id": this.props.campaign.campign_id,
            "reshcedule_campaign": Object.values(this.state.reshcedule_campaign),
            "reset_dispositions_ids": this.state.template.map((a) => a.id)
        }

        this.props.rescheduleCampaign(data, () => {
            self.props.onClose();
        });
    }

    componentDidMount() {
        const { statuses, campaign_id } = this.props;

        this.props.getDispositionTemplateList(this.props.campaign.outbound_queue);

        this.props.listCategories(this.props.campaign.outbound_queue, (catagories) => {
            this.setState({ catagories })
        });

        const reshcedule_campaign = {};
        statuses.map((a) => {
            reshcedule_campaign[a.statuscode] = {
                "lead_category": a.statuscode,
                "is_include": a.statuscode === 7,
                "reset_disposition": a.statuscode === 7
            }
        })
        this.setState({ reshcedule_campaign, campaign_id })
    }

    changeStatus(code, param, e) {
        this.setState({ reshcedule_campaign: { ...this.state.reshcedule_campaign, [code]: { ...this.state.reshcedule_campaign[code], [param]: e, reset_disposition: e } } })
    }

    render() {
        let { statuses, disposition_templates } = this.props;
        const { catagories} = this.state;

        // console.log(disposition_templates)
        if (!this.state.reshcedule_campaign || !disposition_templates || !catagories) {
            return <Loader />
        }

        // const uniqueNotes = Array.from(new Set(catagories.map(a => a.id))).map(id => {
        //     return disposition_templates.find(a => a.id === id)
        // });
        

        return (
            <div>
                <form onSubmit={(e) => this.save(e)}>
                    <Table bordered>
                        <thead>
                            <th colSpan={2}>Status</th>
                            <th style={{ width: 100 }}>Include</th>
                            {/* <th style={{ width: 100 }}>Reset Dispositions and Followups</th> */}
                        </thead>
                        <tbody>
                            {
                                statuses.map((s) => {
                                    return (
                                        <tr key={s.colorcode} className="legend pb-2">
                                            <td className={`bg-${s.colorcode}`}>&nbsp;</td>
                                            <td className="pl-2">{s.statusdescription}</td>
                                            <td className="text-center"><CheckBox selected={this.state.reshcedule_campaign[s.statuscode].is_include} onChange={(e) => this.changeStatus(s.statuscode, "is_include", e)} /></td>
                                            {/* <td className="text-center"><CheckBox selected={this.state.reshcedule_campaign[s.statuscode].reset_disposition} onChange={(e) => this.changeStatus(s.statuscode, "reset_disposition", e)} /></td> */}
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </Table>
                    {catagories && !DYNAMIC_DISPOSITION_FORMS &&
                        <FormGroup>
                            <Label>Select Dispositions to Reset</Label>
                            <Select
                                name="form-field-name2"
                                value={this.state.template}
                                options={catagories}
                                onChange={(e) => this.setState({ template: e })}
                                placeholder="Choose a Template"
                                className="mb-2"
                                isMulti={true}
                                getOptionValue={option => option['id']}
                                getOptionLabel={option => option['note_data']}
                            />
                        </FormGroup>
                    }
                    <div className="d-flex align-items-end">
                        <Alert className="mb-0" color="warning">Campaign data will be lost when re-scheduling. Please download the data before proceed.</Alert>
                        <Button className="ml-auto" type="submit" color="primary">Re-Schedule</Button>
                    </div>
                </form>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        rescheduleCampaign,
        getDispositionTemplateList,
        listCategories
    }, dispatch);
}

function mapStateToProps({ disposition_templates }) {
    return {
        disposition_templates
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Reschedule);
