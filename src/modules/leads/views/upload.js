import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Progress, Button, Table, Label, Row, Col, FormGroup, Input } from 'reactstrap';
import { Importer, ImporterField } from 'react-csv-importer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { index } from '../../field-layout/action';
import { upload } from '../action';
import Loader from '../../../components/Loader';
import { formatPhone, removeNonAscii } from '../../../config/util';
import _ from "lodash";
import { CAMPAIGN_ALLOW_DUPLICATE_CONTENT } from '../../../config/globals';


class LeadsUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            valid: [],
            invalid: [],
            duplicate: [],
            uploading: 0,
            uploaded: 0,
            total: 0,
            completed: false,
            selectRecon: CAMPAIGN_ALLOW_DUPLICATE_CONTENT ? "0":"1"

        }
    }

    componentWillMount() {
        this.props.listFields();
    }

    upload(complete) {
        if (this.state.valid.length > 0 && this.state.uploading === 0) {
            const pending = this.state.valid;
            let data = pending.splice(0, 100);

            const seenNumbers = {};

            const uniqueData = data.filter(item => {
                if (seenNumbers[item.number]) {
                    let inV = this.state.invalid
                    inV.push(item);
                    this.setState({ invalid: inV });
                    return false;
                } else {
                    seenNumbers[item.number] = true;
                    return true;
                }
            });

            data = uniqueData;

            this.setState({
                uploading: this.state.uploading + data.length,
                valid: pending
            }, () => {
                this.props.upload(data, this.state.selectRecon, (err) => {
                    this.setState({
                        uploading: this.state.uploading - data.length,
                        uploaded: this.state.uploaded + data.length
                    }, () => {
                        this.upload(complete);
                    });
                })
            })
        } else if (complete && this.state.valid.length === 0 && this.state.uploading === 0) {
            this.setState({ completed: true });
        }
    }

    renderFields() {
        const { field_layout } = this.props;
        const { field_ids } = this.props.location.state;

        return field_ids.map((id) => {
            const field = _.find(field_layout, { id })
            return <ImporterField key={field.id} name={field.field_id} label={field.field_label} optional={!field.is_mandatory} />
        })
    }

    handleOptionChange = (event) => {
        this.setState({ selectRecon: event.target.value })
    };

    render() {
        const { field_layout } = this.props;
        const { campign_id, campaign_name, field_ids } = this.props.location.state;
        if (!field_layout) {
            return <Loader />
        }

        return (
            <div className="animated fadeIn">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">Upload Leads</li>
                </ol>
                <div className="container-fluid">
                    <Card>
                        <CardHeader>Upload Leads</CardHeader>
                        <CardBody>
                            <h1>{campaign_name}</h1>
                            <hr />
                            <Importer
                                delimiter={","}
                                delimitersToGuess={[",", "|", "\t", ";"]}
                                chunkSize={10}
                                assumeNoHeaders={false}
                                restartable={false}
                                onStart={({ file, fields, columns, skipHeaders }) => {
                                    this.upload()
                                }}
                                processChunk={async (rows, params) => {
                                    const valid = [];
                                    const invalid = [];
                                    const duplicate = [];
                                    this.setState({ total: this.state.total + rows.length });

                                    for (let i = 0; i < rows.length; i++) {

                                        if (rows[i].number != false) {

                                            Object.keys(rows[i]).forEach(key => {
                                                rows[i][key] = removeNonAscii(rows[i][key]);
                                            });

                                            const number = formatPhone(rows[i].number);

                                            if (number) {
                                                // if (!_.find(valid, { number })) {
                                                valid.push({
                                                    ...rows[i],
                                                    campaign_id: campign_id,
                                                    number
                                                });
                                                // } else {
                                                //     duplicate.push(rows[i]);
                                                // }
                                            } else {
                                                invalid.push(rows[i]);
                                            }
                                        } else {
                                            invalid.push(rows[i]);
                                        }

                                    }

                                    this.setState({
                                        valid: [...this.state.valid, ...valid],
                                        invalid: [...this.state.invalid, ...invalid],
                                        duplicate: [...this.state.duplicate, ...duplicate],
                                    }, () => {
                                        this.uploadÎ
                                    });
                                }}
                                onComplete={({ file, preview, fields, columnFields }) => {
                                    this.upload(true);
                                }}
                                onClose={({ file, preview, fields, columnFields }) => {
                                    //this.props.history.push("/campaigns");
                                }}

                            >
                                <ImporterField name="number" label="Phone" />
                                {
                                    this.renderFields()
                                }
                            </Importer>
                            {
                                this.state.total > 0 ? <div className="p-3">
                                    <h3>{`${this.state.uploaded} out of ${this.state.valid.length + this.state.uploading + this.state.uploaded}`} Records Uploaded</h3>
                                    <Progress multi >
                                        <Progress max={this.state.total} bar color="success" value={this.state.uploaded} >{this.state.uploaded} Uploaded</Progress>
                                        <Progress max={this.state.total} bar animated color="orange" value={this.state.duplicate.length} >{this.state.duplicate.length} Duplicate</Progress>
                                        <Progress max={this.state.total} bar animated color="primary" value={this.state.uploading} ></Progress>
                                        <Progress max={this.state.total} bar color="info" value={this.state.valid.length} >{this.state.valid.length}</Progress>
                                        <Progress max={this.state.total} bar color="danger" value={this.state.invalid.length} >{this.state.invalid.length} Invalid</Progress>
                                    </Progress>
                                    <Table size="sm" borderless className="mt-2" style={{ width: "auto" }}>
                                        <tbody>
                                            <tr>
                                                <td>Valid Numbers</td>
                                                <td className="text-right">{this.state.valid.length + this.state.uploading + this.state.uploaded}</td>
                                            </tr>
                                            <tr>
                                                <td>Invalid Numbers</td>
                                                <td className="text-right">{this.state.invalid.length}</td>
                                            </tr>
                                            {/* <tr>
                                                <td>Duplicate Numbers</td>
                                                <td className="text-right">{this.state.duplicate.length}</td>
                                            </tr> */}
                                            <tr>
                                                <th>Total Numbers</th>
                                                <th className="text-right">{this.state.total}</th>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                                    : ""
                            }
                            {
                                this.state.completed ?
                                    <div className="text-right p-3\">
                                        <Button onClick={() => this.props.history.go(0)} color="secondary">Upload Another File</Button>
                                        <Button onClick={() => this.props.history.push("/campaigns")} color="primary" className="ml-2">Go Back</Button>
                                    </div> : ""
                            }

                        </CardBody>
                        <div style={{ margin: '15px' }}><Row>
                            <Col>
                                <table style={{ marginTop: '15px' }}>
                                    {!CAMPAIGN_ALLOW_DUPLICATE_CONTENT &&
                                        <>
                                            <tr>
                                                <td>
                                                    <Label check style={{ marginLeft: '15px' }}>
                                                        <Input
                                                            type="radio"
                                                            name="radioOption"
                                                            value="1"
                                                            checked={this.state.selectRecon === "1"}
                                                            onChange={this.handleOptionChange}
                                                        />
                                                        Keep Old Contacts (Omit Duplicates)
                                                    </Label>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <Label check style={{ marginLeft: '15px' }}>
                                                        <Input
                                                            type="radio"
                                                            name="radioOption"
                                                            value="2"
                                                            checked={this.state.selectRecon === "2"}
                                                            onChange={this.handleOptionChange}
                                                        />
                                                        Replace Old Contacts with New
                                                    </Label>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <Label check style={{ marginLeft: '15px' }}>
                                                        <Input
                                                            type="radio"
                                                            name="radioOption"
                                                            value="3"
                                                            checked={this.state.selectRecon === "3"}
                                                            onChange={this.handleOptionChange}
                                                        />
                                                        Clear All Contacts before Upload
                                                    </Label>
                                                </td>
                                            </tr>
                                        </>}

                                    {CAMPAIGN_ALLOW_DUPLICATE_CONTENT && <>
                                        <tr>
                                            <td>
                                                <Label check style={{ marginLeft: '15px' }}>
                                                    <Input
                                                        type="radio"
                                                        name="radioOption"
                                                        value="0"
                                                        checked={this.state.selectRecon === "0"}
                                                        onChange={this.handleOptionChange}
                                                    />
                                                    Upload Duplicates
                                                </Label>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <Label check style={{ marginLeft: '15px' }}>
                                                    <Input
                                                        type="radio"
                                                        name="radioOption"
                                                        value="4"
                                                        checked={this.state.selectRecon === "4"}
                                                        onChange={this.handleOptionChange}
                                                    />
                                                    Expire Old Unanswered Contacts
                                                </Label>
                                            </td>
                                        </tr>
                                    </>}
                                </table>
                            </Col>
                            <Col className="text-right mt-3">
                            </Col>
                        </Row>
                        </div>
                    </Card>

                </div >
            </div >
        );
    }
}

function mapStateToProps({ field_layout }) {
    return {
        field_layout
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        listFields: index,
        upload
    }, dispatch);
}

export default (connect(mapStateToProps, mapDispatchToProps)(LeadsUpload));
