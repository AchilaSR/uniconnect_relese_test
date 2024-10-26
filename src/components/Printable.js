import React, { } from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';

import ReactToPrint from 'react-to-print';
import text from '../theme/texts.json';

class Printable extends React.PureComponent {

    componentDidUpdate() {
        console.log("this.props.filename", this.props.filename);
        if (this.props.filename && this.props.filename !== document.title) {
            document.title = this.props.filename;
        }
    }

    componentDidMount() {
        console.log("this.props.filename", this.props.filename);
        if (this.props.filename && this.props.filename !== document.title) {
            document.title = this.props.filename;
        }
    }


    componentWillUnmount() {
        document.title = text.title;
    }

    render() {
        const {
            children,
            title = "",
            filename = "download.pdf",
            ...rest } = this.props;
        return (
            <Card {...rest}>
                <CardHeader className="py-2">
                    <div className="d-flex justify-content-between align-items-center" >
                        <div>{title}</div>
                        <div>
                            <ReactToPrint
                                trigger={() => {
                                    return <a onBeforePrint={() => document.title = 'My new title'} href="#"><i className="fa fa-download"></i> Print / Generate PDF</a>;
                                }}
                                content={() => this.componentRef}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardBody>
                    <div ref={el => (this.componentRef = el)} style={{ width: "100%", backgroundColor: "#fff", pageBreakAfter: "auto" }}>
                        {children}
                    </div>
                </CardBody>
            </Card>
        );
    }


}

export default Printable;