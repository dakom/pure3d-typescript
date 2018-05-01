import {
    PointerEventStatus,
    PointerEventData,
    PointerScreenEventData,
    startPointer,
    startTick,
    startTickPointer,
    TickEventData,
    TickPointerScreenEventData,
} from 'input-senders';

//Note - stopping and clearing is solely the responsibility of the caller
//This allows for multiple listeners to be setup
//Moreover, stopping and clearing is *only* via the function returned from starting

const _listeners = new Map<PointerEventStatus, Array<(evt:PointerScreenEventData) => void>>();

const _disposeListeners = () => {
    _listeners.set(PointerEventStatus.START, []);
    _listeners.set(PointerEventStatus.MOVE, []);
    _listeners.set(PointerEventStatus.END, []);
}

const _dispatch = ({data}:{data?:PointerEventData}) => {
    if(data) {
        const evtData:PointerScreenEventData = {
            ...data,
            ...{width: window.innerWidth, height: window.innerHeight}
        }

        _listeners.get(data.status).forEach(fn => fn(evtData));
    } 
}

export const addInputListener = (status:PointerEventStatus) => (fn:(evt:PointerScreenEventData) => void) => {
    _listeners.set(status, _listeners.get(status).concat([fn]));
}

export const startInput = (domElement) => {
    const hasPointer = (window as any).PointerEvent ? true : false;
    const stoppers = [];

    stoppers.push(
        startPointer
        ({
            domElement,
            hasPointer,
            status: PointerEventStatus.START,
        })
        (_dispatch)
    );

    stoppers.push(
        startTickPointer
        ({
            domElement,
            hasPointer,
            status: PointerEventStatus.MOVE,
        })
        (_dispatch) 
    );

    stoppers.push(
        startPointer
        ({
            domElement,
            hasPointer,
            status: PointerEventStatus.END,
        })
        (_dispatch)
    );

    return () => {
        stoppers.forEach(fn => fn());
        _disposeListeners();
    }
}

//just to pre-fill
_disposeListeners();
