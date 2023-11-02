
import React from 'react';
import Interactions from './Interactions';
import { Rnd } from "react-rnd";


class InteractiveMap extends React.Component<{}> {
    private refInteract = React.createRef<Interactions>();

    constructor(props) {
        super(props);
    }

    // On load function
    componentDidMount() {
    }

    render() {
        return (
            <Rnd
                className='rnd-container'
                default={{
                    x: 0,
                    y: 0,
                    width: 320,
                    height: 200,
                }}
                onDrag={(e, d) => { if (this.refInteract.current?.handleMapInteraction()) return false; /* Prevent dragging the Rnd component */ }}
            >
                <Interactions ref={this.refInteract} />
            </Rnd>
        );
    }
}


export default InteractiveMap;