import React from 'react'

import { connect } from "react-redux";

import { Col, Row, CardTitle, CardBody, CardText, Card, Container, Button, CardSubtitle, Form, FormGroup, Input, Table, Fade } from 'reactstrap';
import { faPlay, faPause, faTrashAlt, faCircle, faArrowRight, faStopwatch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'



import axios from "axios"

const colStyle = {
    display: 'flex',
    justifyContent: 'center',
    flex: '1',
  }
  
class Script extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          scripts: []
        };
    }

    async refresh_scripts() {
        const currentUser = JSON.parse(localStorage.getItem("user"));

        const config = {
          headers: { Authorization: `Bearer ${currentUser.access_token}` }
        };
        var response = await axios.get("http://" + process.env.REACT_APP_BASE_URL + ":8080/scripts", config);
        if (response.data) {
            this.setState({scripts: response.data})
        }
        return response.data;
    }
    async updateStatus(script_id, status) {
        const currentUser = JSON.parse(localStorage.getItem("user"));

        const config = {
          headers: { Authorization: `Bearer ${currentUser.access_token}` }
        };
        var response  = await axios.post("http://" + process.env.REACT_APP_BASE_URL + ":8080/scripts/" + script_id + "/update", {status: status}, config);
        if (response && response.data && response.data.id) {
            var idx = 0
            var tmp = this.state.scripts;
            for (var s of tmp) {
                if (s.id == script_id)
                    tmp[idx] = response.data;
                idx++
            }

            this.setState({scripts: tmp});
        }
    }
    async onDelete(script_id) {
        const currentUser = JSON.parse(localStorage.getItem("user"));

        const config = {
          headers: { Authorization: `Bearer ${currentUser.access_token}` }
        };
        var response  = await axios.delete("http://" + process.env.REACT_APP_BASE_URL + ":8080/scripts/" + script_id, {status: status}, config);
        if (response && response.data && response.data.success) {
            window.location.reload();
        }
    }
    componentDidMount() {
        this.refresh_scripts();
    }
    render() {
        const { scripts } = this.state;
        return (
            <Container>
                    {
                    scripts.map((s, index) => (

                        <Row md="1" className="mx-auto mt-n4" key={index}>
                            <Card>
                                <Row>
                                    <Col>
                                        <Button type="submit" color="danger" size="sm" onClick={() => {this.onDelete(s.id)}}><FontAwesomeIcon icon={faTrashAlt} size="xs"/></Button>&nbsp;
                                        { s.status == "running" ? (
                                        <Button type="submit" size="sm" onClick={() => {this.updateStatus(s.id, "stopped")}}> <FontAwesomeIcon icon={faPause} size="xs"/></Button>
                                        ) : (
                                            <Button type="submit" size="sm" onClick={() => {this.updateStatus(s.id, "running")}}> <FontAwesomeIcon icon={faPlay} size="xs"/></Button>
                                            )
                                        }
                                        </Col>
                                        <Col style={colStyle}>
                                            <CardTitle className="script-title" tag="h3">{s.name}</CardTitle>
                                    </Col>
                                    <Col></Col>
                                    <FontAwesomeIcon className={("script-status " + (s.status == "running" ? "script-status-running" : s.status == "stopped" ? "script-status-stopped" : "script-status-error"))} icon={faCircle} size="xs"/>
                                </Row>
                                <CardBody className="mt-2">
                                    <Row>
                                        <Col style={colStyle}>
                                        <FontAwesomeIcon icon={faStopwatch} size="1x"/>&nbsp;&nbsp;&nbsp;
                                        <CardSubtitle tag="h5">{s.trigger}</CardSubtitle>
                                    </Col>
                                    </Row>
                                </CardBody>
                                <CardBody className="mt-4">

                                    <Row>
                                        <Col style={colStyle}>
                                            <CardSubtitle tag="h4">{s.action.name}</CardSubtitle>
                                        </Col>
                                        <Col style={colStyle}>
                                            <FontAwesomeIcon icon={faArrowRight} size="1x"/>
                                        </Col>
                                        <Col style={colStyle}>
                                            <CardSubtitle tag="h4">{s.reaction.name}</CardSubtitle>
                                        </Col>
                                    </Row>

                                </CardBody>
                            </Card>
                        </Row>  
                    ))}
            </Container>
        );
    }
}

// export default LoginForm;
function mapStateToProps(state) {
    return {};
  }

export default connect(mapStateToProps)(Script);