
import React, { Component } from 'react';
import { FormGroup } from 'reactstrap';
import { connect } from 'react-redux';
import Select from 'react-select';

class CategoryPicker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            category: null,
            sub_category: null,
            sub_sub_category: null
        };
    }

    onChange(data) {
        this.setState(data, () => {
            this.props.onChange(this.state);
        });
    }

    componentWillUpdate(nextProps) {
        if (this.props.value !== nextProps.value) {
            this.setState({ ...nextProps.value })
        }
    }

    render() {
        let { disposition_categories } = this.props;

        if (disposition_categories) {
            disposition_categories = [...new Map(disposition_categories.map(item => [item.id, item])).values()];
        }

        return (
            <FormGroup>
                <label>Disposition</label>
                <Select
                    name="form-field-name2"
                    value={this.state.category}
                    options={disposition_categories}
                    onChange={(e) => this.onChange({ category: e, sub_category: null, sub_sub_category: null })}
                    placeholder="Choose a Disposition"
                    className="mb-2"
                    getOptionValue={option => option['id']}
                    getOptionLabel={option => option['note_data']}
                    required
                    isClearable={true}
                />
                {
                    this.state.category && this.state.category.children && this.state.category.children.length > 0 ?
                        <Select
                            name="form-field-name2"
                            value={this.state.sub_category}
                            options={this.state.category.children}
                            onChange={(e) => this.onChange({ sub_category: e, sub_sub_category: null })}
                            placeholder="Choose a Sub Category"
                            className="mb-2"
                            getOptionValue={option => option['id']}
                            getOptionLabel={option => option['name']}
                            required
                        />
                        : ""
                }
                {
                    this.state.sub_category && this.state.sub_category.children && this.state.sub_category.children.length > 0 ?
                        <Select
                            name="form-field-name2"
                            value={this.state.sub_sub_category}
                            options={this.state.sub_category.children}
                            onChange={(e) => this.onChange({ sub_sub_category: e })}
                            placeholder="Choose a Sub Category"
                            className="mb-2"
                            getOptionValue={option => option['id']}
                            getOptionLabel={option => option['name']}
                            required
                        />
                        : ""
                }
            </FormGroup>)
    }
}


// function mapStateToProps({ disposition_categories }) {
//     return {
//         disposition_categories
//     };
// }


export default connect(null, null)(CategoryPicker);