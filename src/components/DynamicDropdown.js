import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Col, Input, FormGroup, Label } from "reactstrap";

function DynamicDropdown({ options, onSelect, value }) {
    return (
        <Input type='select' value={value} onChange={(e) => onSelect(e.target.value)}>
            {options.length > 1 ? <option value="">Select</option> : ""}
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </Input>
    );
}

function DynamicDropDown({ fields = [], value, dependencyFilePath, onSelect, xs, field_list }) {
    const [csvData, setCsvData] = useState([]);
    const [filteredOptions, setFilteredOptions] = useState({});

    useEffect(() => {
        fetch(dependencyFilePath)
            .then((response) => response.text())
            .then((csvString) => {
                Papa.parse(csvString, {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: true,
                    complete: (result) => {
                        setCsvData(result.data);
                        const uniqueValues = {};
                        result.meta.fields.forEach((columnName) => {
                            uniqueValues[columnName] = [...new Set(result.data.map((row) => row[columnName]))];
                        });
                        setFilteredOptions(uniqueValues);
                    },
                });
            }, []);
    }, []);

    const handleSelect = (columnName, e, index) => {
        const filters = {};
        for (let i = 0; i < fields.length; i++) {
            if (i < index) {
                filters[fields[i].name] = value[fields[i].name]
            } else {
                value[fields[i].name] = "";
            }
        }
        value[columnName] = e;
        filters[columnName] = e;
        // console.log("value aftr clear ", value);

        onSelect({
            ...value
        });

        // Update filtered options for dependent columns
        const updatedFilteredOptions = { ...filteredOptions };

        // Filter options for dependent columns based on the selected value
        let change = false;
        Object.keys(updatedFilteredOptions).forEach((column) => {
            if (columnName === column) {
                change = true;
            }
            if (column !== columnName && change) {
                const filteredValues = _.filter(csvData, filters);
                updatedFilteredOptions[column] = [...new Set(filteredValues.map((row) => row[column]))];
            }
        });

        setFilteredOptions(updatedFilteredOptions);
    };

    useEffect(() => {
        const selectedDataRow = csvData.find((row) => {
            for (const columnName in value) {
                if (row[columnName] !== value[columnName]) {
                    return false;
                }
            }
            return true;
        });

        if (selectedDataRow && JSON.stringify(value) !== JSON.stringify(selectedDataRow)) {
            if (selectedDataRow) {
                onSelect(selectedDataRow);
            } else {
                onSelect({});
            }
        }
    }, [value, csvData]);

    const rendeField = (field, index) => {
        let options = filteredOptions[field.name];

        if (index > 0) {
            for (let i = 0; i < index; i++) {
                if (!value[fields[i].name] && filteredOptions[fields[i].name] && filteredOptions[fields[i].name].filter((a) => a).length > 0) {
                    console.log(fields[i].name, value[fields[i].name]);
                    return "";
                }
            }
        }

        if (options && options.length) {
            options = options.filter((a) => a);



            let label = field.label;

            field_list.forEach((c) => {
                let f;
                if (c.fields) {
                    f = _.find(c.fields, { name: field.name });
                } else {
                    f = _.find(field_list, { name: field.name });
                }

                if (f) {
                    label = f.label;
                }
            })

            if (options.length === 1) {
                if (value[field.name] !== options[0]) {
                    handleSelect(field.name, options[0], index);
                }
            }

            if (options.length) {
                return <Col xs={xs || 12}>
                    <FormGroup>
                        <Label htmlFor="name">{label}</Label>
                        <DynamicDropdown
                            key={field.name}
                            options={options || []}
                            onSelect={(value) => handleSelect(field.name, value, index)}
                            value={value[field.name] || ''}
                        />
                    </FormGroup>
                </Col>
            }

        }
        return "";
    }

    return (
        <>
            {fields.map((field, index) => (
                rendeField(field, index)
            ))}
        </>
    );
}

export default DynamicDropDown;