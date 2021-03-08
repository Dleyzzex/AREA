import React from 'react';
import MainNavbar from '../components/navbar'

import {
    Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, CardLink, Col, Row, Container
  } from 'reactstrap';
function Error404()
{
    return (
        <div style={{textAlign:'center'}}>
            <Card>
                <CardTitle tag="h1">404</CardTitle>
                <CardImg top width="100%" src="https://source.unsplash.com/collection/8469524" alt="Card image cap" />
            </Card>
          </div>
    )
}

export default Error404;