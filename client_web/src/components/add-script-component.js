import React from 'react'

import { connect } from "react-redux";

import { Col, Row, CardTitle, Card, Container, Button, CardSubtitle, Form, FormGroup, Input, Table, Fade } from 'reactstrap';

import axios from "axios"

const colStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1',
  }
  
class AddScript extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          name: "New Script",
          current_action_service_name: "", current_action_service_id: "", current_action_service_desc: "",
          current_action_name: "", current_action_id: "", current_action_desc: "",
          current_reaction_name: "", current_reaction_id: "", current_reaction_desc:"",
          current_reaction_service_name: "", current_reaction_service_id: "", current_reaction_service_desc:"",
          trigger: 30,
          current_action_parameters: [],
          current_action_results: [],
          current_action_parameters_values: [],
          current_reaction_parameters: [],
          current_reaction_parameters_values: [],
          services: [], actions: [], reactions: [],
          can_submit: false
        };
    }
    onCurrenActionServiceChange = (s) => {
        const { name, id, description } = s;
        this.setState({current_action_service_name: name, current_action_service_id: id, current_action_service_desc: description, current_action_id: "", current_action_name:"", current_action_desc: "", current_action_parameters:[], trigger: 30}, () => {
            this.updateActions();
            this.updateFormStatus();
        });
    }

    onCurrenReactionServiceChange = (s) => {
        const { name, id, description } = s;
        this.setState({current_reaction_service_name: name, current_reaction_service_id: id, current_reaction_service_desc: description, current_reaction_id:"", current_reaction_name: "", current_reaction_desc:"", current_reaction_parameters:[]}, () => {
            this.updateReactions();
            this.updateFormStatus();
        });
    }
    onCurrentActionChange = (a) => {
        const { name, id, description, parameters, results } = a;
        this.setState({current_action_name: name, current_action_id: id, current_action_desc: description, current_action_parameters: parameters, current_action_results: results, current_action_parameters_values: new Array(parameters.length).fill("")}, () => {
            this.updateFormStatus()
        });
    }
    onCurrentReactionChange = (a) => {
        const { name, id, description, parameters } = a;
        this.setState({current_reaction_name: name, current_reaction_id: id, current_reaction_desc: description, current_reaction_parameters: parameters, current_reaction_parameters_values: new Array(parameters.length).fill("")}, () => {
            this.updateFormStatus()
        });
    }

    resetActionParameters = (length) => {
        this.setState({current_action_parameters_values: new Array(length).fill("")})
    }

    resetReactionParameters = (length) => {
        this.setState({current_reaction_parameters_values: new Array(length).fill("")})
    }
    submit = () => {
        var data = {action_id: this.state.current_action_id, action_parameters: this.state.current_action_parameters_values, reaction_id: this.state.current_reaction_id, reaction_parameters: this.state.current_reaction_parameters_values, trigger: this.state.trigger, name: this.state.name}
        // var response = await axios.post("http://" + process.env.REACT_APP_BASE_URL + ":8080/scripts/create", data);
        // if (response.data) {
        //     var tmp = response.data
        //     this.setState({services: [...tmp]})
        //   }
        this.submitForm(data);
    }

    updateFormStatus = () => {
        var status = true;
        if (!this.state.current_action_id)
            status = false;
        if (!this.state.current_reaction_id)
            status = false;
        if (this.state.current_action_id) {
            if (this.state.current_action_parameters.length > 0) {
                for (const v of this.state.current_action_parameters_values) {
                    if (v == "")
                        status = false;
                }
            }
        } else
            status = false
        if (this.state.current_reaction_id) {
            if (this.state.current_reaction_parameters.length > 0) {
                for (const v of this.state.current_reaction_parameters_values) {
                    if (v == "")
                        status = false;
                }
            }
        } else
            status = false
        this.setState({can_submit: status})
    }

    onActionParameterChange = (e) => {
        var tmp = this.state.current_action_parameters_values;
        tmp[e.target.id] = e.target.value;
        this.setState({current_action_parameters_values : tmp}, this.updateFormStatus)
    }
    onReactionParameterChange = (e) => {
        var tmp = this.state.current_reaction_parameters_values;
        tmp[e.target.id] = e.target.value;
        this.setState({current_reaction_parameters_values : tmp}, this.updateFormStatus)
    }
    onTriggerChange = (e) => {
        this.setState({trigger: parseInt(e.target.value, 10)})
    }
    onNameUpdate = (e) => {
        this.setState({name: e.target.value})
    }

    async submitForm(data) {
        const currentUser = JSON.parse(localStorage.getItem("user"));

        const config = {
          headers: { Authorization: `Bearer ${currentUser.access_token}` }
        };
        var response = await axios.post("http://" + process.env.REACT_APP_BASE_URL + ":8080/scripts/create", data, config);
        if (response)
            window.location.reload();
    }

    async updateProvider() {
        var response = await axios.get("http://" + process.env.REACT_APP_BASE_URL + ":8080/services");
        if (response.data) {
            var tmp = response.data
            this.setState({services: [...tmp]})
          }
    }

    async updateActions() {
        if (this.state.current_action_service_id) {
        var response  = await axios.get("http://" + process.env.REACT_APP_BASE_URL + ":8080/services/" + this.state.current_action_service_id + "/action");
        if (response.data) {
            var tmp = response.data
            this.setState({actions: tmp})
          }
        }
    }

    async updateReactions() {
        if (this.state.current_reaction_service_id) {
        var response  = await axios.get("http://" + process.env.REACT_APP_BASE_URL + ":8080/services/" + this.state.current_reaction_service_id + "/reaction");
        if (response.data) {
            var tmp = response.data
            this.setState({reactions: tmp})
          }
        }
    }
    componentDidMount() {
        this.updateProvider()
        this.setState({can_submit: false});
    }
    render() {
        return (
            <Container>
                <Row>
                    <Col>
                    <Input placeholder="Script name" className="mx-auto mt-5" value={this.state.name} onChange={(e)=> {this.onNameUpdate(e), this.updateFormStatus()}}></Input>

                        <Card className="mx-auto mt-2">
                            <CardTitle>Select an action</CardTitle>
                            <Row>
                                { this.state.services.map(s => (
                                <Col sm={{ size: 'auto', offset: 1 }}  style={{padding: '5px'}} key={s.name}>
                                    <Button className="btn btn-primary" color="primary" onClick={()=> {this.onCurrenActionServiceChange(s), this.updateFormStatus()}} disabled={this.state.current_action_service_name === s.name} >{s.name}</Button>
                                </Col>
                                ))}
                            </Row>
                            <CardSubtitle className="mx-auto mt-4">{this.state.current_action_service_desc}</CardSubtitle>
                        </Card>
                        {/* Actions card*/}
                        {this.state.current_action_service_id && (
                            <Fade>
                            <Card className="mt-n3">
                                <Row>
                                { this.state.actions.map(a => (
                                    <Col sm={{ size: 'auto', offset: 1 }}  style={{padding: '5px'}} key={a.name}>
                                        <Button className="btn btn-primary" color="primary" onClick={()=> {this.onCurrentActionChange(a), this.updateFormStatus()}} disabled={this.state.current_action_name === a.name} >{a.name}</Button>
                                    </Col>
                                ))}
                                </Row>
                                {/* Actions description*/}
                                {this.state.current_action_id && (
                                    <Fade className="mx-auto mt-4">
                                        <CardSubtitle >{this.state.current_action_desc}</CardSubtitle>
                                    </Fade>
                                )}
                                {/* Actions parameters*/}
                                { ((this.state.current_action_parameters.length > 0 || this.state.current_action_results.length > 0) && this.state.current_action_id) && (
                                    <Fade>
                                        <Form>
                                            { (this.state.current_action_parameters.length > 0) && (
                                            <>
                                                <CardSubtitle className="mx-auto mt-4">Parameters</CardSubtitle>
                                                <FormGroup className="mx-auto mt-4">
                                                    {
                                                        this.state.current_action_parameters.map((p, index) => (
                                                            <Row className="mb-1" key={p.name}>
                                                                <Input className="mx-auto w-50" type={p.type} placeholder={p.description} value={this.state.current_action_parameters_values[index]}id={index} onChange={(e)=> {this.onActionParameterChange(e, index), this.updateFormStatus()}}></Input>
                                                            </Row>
                                                        ))
                                                    }
                                                </FormGroup>
                                            </>
                                            )}
                                            { (this.state.current_action_results.length > 0 && this.state.current_action_id) && (
                                                <>
                                                <CardSubtitle className="mx-auto mt-4">Output</CardSubtitle>
                                                <Table className="mx-auto mt-4" borderless>
                                                    <tbody>
                                                        <tr key="">
                                                            <th>#</th>
                                                            <th>name</th>
                                                            <th>description</th>
                                                        </tr>
                                                        { this.state.current_action_results.map((p, index) => (
                                                        <tr key={index}>
                                                            <th scope="row">{index}</th>
                                                            <td>{p.name}</td>
                                                            <td>{p.description}</td>
                                                        </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                                </>
                                            )}
                                        </Form>
                                    </Fade>
                                    )}
                            </Card>
                            </Fade>
                        )}
                        {/* trigger card */}
                            { this.state.current_action_id && (
                                <Card className="mt-n3" >
                                    <CardTitle>Select trigger period</CardTitle>

                                    <Row style={colStyle}>{this.state.trigger}</Row>
                                    <Row className="mt-4">
                                        <Input type="range" min="1" max="60" step="1" list="tick-list" onInput={(e) => {this.onTriggerChange(e)}} />
                                    </Row>
                                </Card>
                            )}   
                        <Card>
                            <CardTitle>Select a reaction</CardTitle>
                            <Row>
                                { this.state.services.map(s => (
                                    <Col sm={{ size: 'auto', offset: 1 }}  style={{padding: '5px'}} key={s.name}>
                                        <Button className="btn btn-primary" color="primary" onClick={()=> {this.onCurrenReactionServiceChange(s), this.updateFormStatus()}} disabled={this.state.current_reaction_service_name === s.name} >{s.name}</Button>
                                    </Col>
                                ))}
                            </Row>
                            <CardSubtitle className="mx-auto mt-4">{this.state.current_reaction_service_desc}</CardSubtitle>
                        </Card>
                        {/* Reactions card*/}
                        { this.state.current_reaction_service_id && (
                            <Fade>
                            <Card className="mt-n3">
                                <Row>
                                {
                                    this.state.reactions.map(r => (
                                    <Col sm={{ size: 'auto', offset: 1 }}  style={{padding: '5px'}} key={r.name}>
                                        <Button className="btn btn-primary" color="primary" onClick={()=> {this.onCurrentReactionChange(r), this.updateFormStatus()}} disabled={this.state.current_reaction_name === r.name} >{r.name}</Button>
                                    </Col>
                                ))}
                                </Row>
                                {/* Reactions description*/}
                                { this.state.current_reaction_id && (
                                    <Fade className="mx-auto mt-4">
                                    <CardSubtitle>{this.state.current_reaction_desc}</CardSubtitle>
                                    </Fade>
                                )}
                                {/* Reactions parameters*/}
                                { (this.state.current_reaction_parameters.length > 0  && this.state.current_reaction_id) && (
                                    <Fade>
                                    <Form>
                                        <CardSubtitle className="mx-auto mt-4">Parameters</CardSubtitle>
                                        <FormGroup className="mx-auto mt-4">
                                            { this.state.current_reaction_parameters.map((p, index) => (
                                                <Row className="mb-1" key={p.name}>
                                                    <Input className="mx-auto w-50" type={p.type} placeholder={p.description} value={this.state.current_reaction_parameters_values[index]}id={index} onChange={(e)=> {this.onReactionParameterChange(e, index), this.updateFormStatus()}}></Input>
                                                </Row>
                                                ))
                                            }
                                        </FormGroup>
                                    </Form>
                                    </Fade>
                                )}
                            </Card>
                            </Fade>
                        )} 
                        <Col style={colStyle}>
                            { this.state.can_submit && (
                            <Button className="my-5" color="success" onClick={() => this.submit() }>Submit</Button>
                            )}
                        </Col>
                        <Col></Col>
                        
                    </Col>
                </Row>
            </Container>
        );
    }
}

// export default LoginForm;
function mapStateToProps(state) {
    return {};
  }

export default connect(mapStateToProps)(AddScript);