import MainNavbar from '../components/navbar'

import {
    Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, CardLink, Col, Row, Container
  } from 'reactstrap';
import ScriptsComponenent from '../components/scripts.component';
function Scripts()
{
    const test = [1,2,3,4,5,6,7,8,9,10,11,12];
    return (
        <div>
            <MainNavbar/>
            <ScriptsComponenent/>
        </div>
    )
}

export default Scripts;