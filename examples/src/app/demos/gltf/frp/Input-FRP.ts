import {
    PointerEventStatus,
    PointerScreenEventData,
    startPointer,
    startTick,
    startTickPointer,
    TickEventData,
    TickPointerScreenEventData,
} from 'input-senders';
import { StreamSink } from 'sodiumjs';

export const input = {
    sStart: new StreamSink<PointerScreenEventData>(),
    sMove: new StreamSink<TickPointerScreenEventData>(),
    sEnd: new StreamSink<PointerScreenEventData>(),
    sTick: new StreamSink<TickEventData>()
}

//gets replaced with actual input stoppers
let _stopInput = null;

export const startInput = (domElement) => {
    const {sStart, sMove, sEnd, sTick} = input;

    const hasPointer = (window as any).PointerEvent ? true : false;
    const stoppers = [];

    stoppers.push(
        startPointer
        ({
            domElement,
            hasPointer,
            status: PointerEventStatus.START,
        })
        (({ data }) => sStart.send(data))
    );

    stoppers.push(
        startTickPointer
        ({
            domElement,
            hasPointer,
            status: PointerEventStatus.MOVE,
        })
        (({ data }) => sMove.send(data))
    );

    stoppers.push(
        startPointer
        ({
            domElement,
            hasPointer,
            status: PointerEventStatus.END,
        })
        (({ data }) => sEnd.send(data))
    );

    stoppers.push(
        startTick
        ({})
        (({data}) => sTick.send(data))
    );

    _stopInput = () => stoppers.forEach(fn => fn());
}

export const stopInput = () => {
    if(_stopInput !== null) {
        _stopInput();
        _stopInput = null;
    }
}
